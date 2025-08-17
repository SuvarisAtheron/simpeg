document.addEventListener('DOMContentLoaded', function() {
    
    // === DEKLARASI ELEMEN ===
    const tugasModalElement = document.getElementById('tugasModal');
    const tugasModal = new bootstrap.Modal(tugasModalElement);
    const formTugas = document.getElementById('form-tugas');
    const tabelTugasBody = document.getElementById('tabel-tugas-body');
    
    const namaInput = document.getElementById('tugas-nama');
    const searchResultsContainer = document.getElementById('search-results-tugas');
    const pegawaiIdInput = document.getElementById('tugas-pegawai-id');
    const nipInput = document.getElementById('tugas-nip');
    const golonganInput = document.getElementById('tugas-golongan');
    const fileInput = document.getElementById('tugas-file');
    const fileNameDisplay = document.getElementById('tugas-file-name');

    // === FUNGSI-FUNGSI ===

    // Fungsi untuk memuat dan menampilkan riwayat tugas
    function loadTugasHistory() {
        tabelTugasBody.innerHTML = `<tr><td colspan="7" class="text-center">Memuat riwayat...</td></tr>`;
        fetch('assets/api/get_list_tugas.php')
            .then(response => response.json())
            .then(res => {
                tabelTugasBody.innerHTML = '';
                if (res.success && res.data.length > 0) {
                    res.data.forEach((item, index) => {
                        const tr = document.createElement('tr');
                        const fileButton = item.path_file 
                            ? `<a href="${item.path_file}" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i> Lihat</a>`
                            : `<span class="text-muted">Tidak ada</span>`;
                        
                        tr.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${item.no_surat_tugas}</td>
                            <td>${item.nama_lengkap}<br><small class="text-muted">NIP: ${item.nip}</small></td>
                            <td>${item.lokasi_kegiatan}</td>
                            <td>${item.tanggal_mulai} s/d ${item.tanggal_selesai}</td>
                            <td>${fileButton}</td>
                            <td>
                                <button class="btn btn-sm btn-danger btn-delete-tugas" data-id="${item.id}" title="Hapus Tugas">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        `;
                        tabelTugasBody.appendChild(tr);
                    });
                } else {
                    tabelTugasBody.innerHTML = `<tr><td colspan="7" class="text-center">Belum ada riwayat surat tugas.</td></tr>`;
                }
            });
    }

    // === EVENT LISTENERS ===

    // 1. Membersihkan form saat modal dibuka
    tugasModalElement.addEventListener('shown.bs.modal', function () {
        formTugas.reset();
        searchResultsContainer.style.display = 'none';
        fileNameDisplay.textContent = '';
    });

    // 2. Logika pencarian pegawai (sama seperti sebelumnya)
    namaInput.addEventListener('input', function() {
        // ... (kode pencarian tidak perlu diubah, sudah benar)
    });
    searchResultsContainer.addEventListener('click', function(e) {
        // ... (kode pemilihan tidak perlu diubah, sudah benar)
    });

    // 3. Menampilkan nama file yang dipilih
    fileInput.addEventListener('change', function() {
        fileNameDisplay.textContent = this.files.length > 0 ? `File dipilih: ${this.files[0].name}` : '';
    });

    // 4. Submit form surat tugas baru
    formTugas.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitButton = tugasModal._element.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Menyimpan...`;

        fetch('assets/api/add_tugas.php', {
            method: 'POST',
            body: new FormData(this)
        })
        .then(response => response.json())
        .then(res => {
            alert(res.message);
            if (res.success) {
                tugasModal.hide();
                loadTugasHistory(); // Muat ulang riwayat
            }
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="fas fa-save"></i> Save`;
        });
    });

    // 5. Hapus surat tugas dari tabel riwayat
    tabelTugasBody.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('.btn-delete-tugas');
        if (deleteButton) {
            if (confirm('Anda yakin ingin menghapus surat tugas ini secara permanen?')) {
                const tugasId = deleteButton.dataset.id;
                const formData = new FormData();
                formData.append('id', tugasId);

                fetch('assets/api/delete_tugas.php', { method: 'POST', body: formData })
                    .then(response => response.json())
                    .then(res => {
                        alert(res.message);
                        if (res.success) {
                            loadTugasHistory();
                        }
                    });
            }
        }
    });

    // (Kode event listener untuk search dan select pegawai)
    namaInput.addEventListener('input', function() {
        const searchTerm = this.value; if (searchTerm.length < 3) { searchResultsContainer.style.display = 'none'; return; }
        fetch(`assets/api/search_pegawai.php?term=${searchTerm}`).then(r => r.json()).then(data => {
            searchResultsContainer.innerHTML = '';
            if (data.length > 0) {
                data.forEach(p => {
                    const d = document.createElement('div'); d.className = 'search-result-item';
                    d.textContent = `${p.nama_lengkap} (NIP: ${p.nip})`; d.dataset.id = p.id; d.dataset.nama = p.nama_lengkap;
                    searchResultsContainer.appendChild(d);
                }); searchResultsContainer.style.display = 'block';
            } else { searchResultsContainer.style.display = 'none'; }
        });
    });
    searchResultsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('search-result-item')) {
            const pId = e.target.dataset.id;
            namaInput.value = e.target.dataset.nama;
            searchResultsContainer.style.display = 'none';
            fetch(`assets/api/get_data_personal.php?id=${pId}`).then(r => r.json()).then(data => {
                if (data) {
                    pegawaiIdInput.value = data.id; nipInput.value = data.nip || ''; golonganInput.value = data.golongan_terakhir || '';
                }
            });
        }
    });

    // --- INISIALISASI ---
    loadTugasHistory();
});