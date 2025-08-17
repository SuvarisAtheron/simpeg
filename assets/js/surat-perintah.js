document.addEventListener('DOMContentLoaded', function() {
    
    // === DEKLARASI ELEMEN ===
    const suratModalElement = document.getElementById('suratModal');
    const suratModal = new bootstrap.Modal(suratModalElement);
    const formSurat = document.getElementById('form-surat');
    const tabelSuratBody = document.getElementById('tabel-surat-body');
    
    const namaInput = document.getElementById('surat-nama');
    const searchResultsContainer = document.getElementById('search-results-surat');
    const pegawaiIdInput = document.getElementById('surat-pegawai-id');
    const nipInput = document.getElementById('surat-nip');
    const golonganInput = document.getElementById('surat-golongan');
    const jabatanInput = document.getElementById('surat-jabatan');
    const unitKerjaInput = document.getElementById('surat-unit-kerja');
    const alamatInput = document.getElementById('surat-alamat');
    const pendidikanInput = document.getElementById('surat-pendidikan');
    const lampiranInput = document.getElementById('surat-lampiran');
    const lampiranFileName = document.getElementById('surat-file-name');

    // === FUNGSI-FUNGSI ===

    function loadSuratHistory() {
        tabelSuratBody.innerHTML = `<tr><td colspan="7" class="text-center">Memuat riwayat...</td></tr>`;
        fetch('assets/api/get_list_surat_perintah.php')
            .then(response => response.json())
            .then(res => {
                tabelSuratBody.innerHTML = '';
                if (res.success && res.data.length > 0) {
                    res.data.forEach((item, index) => {
                        const tr = document.createElement('tr');
                        const fileButton = item.path_lampiran 
                            ? `<a href="${item.path_lampiran}" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i> Lihat</a>`
                            : `<span class="text-muted">Tidak ada</span>`;
                        
                        tr.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${item.no_surat_perintah}</td>
                            <td>${item.nama_lengkap}<br><small class="text-muted">NIP: ${item.nip}</small></td>
                            <td>${item.jabatan_tugas_baru}</td>
                            <td>${item.tanggal_surat_perintah}</td>
                            <td>${fileButton}</td>
                            <td>
                                <button class="btn btn-sm btn-danger btn-delete-surat" data-id="${item.id}" title="Hapus Surat">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        `;
                        tabelSuratBody.appendChild(tr);
                    });
                } else {
                    tabelSuratBody.innerHTML = `<tr><td colspan="7" class="text-center">Belum ada riwayat surat perintah.</td></tr>`;
                }
            });
    }

    // === EVENT LISTENERS ===

    suratModalElement.addEventListener('shown.bs.modal', function () {
        formSurat.reset();
        searchResultsContainer.style.display = 'none';
        lampiranFileName.textContent = '';
        nipInput.value = '';
        golonganInput.value = '';
        jabatanInput.value = '';
        unitKerjaInput.value = '';
        alamatInput.value = '';
        pendidikanInput.value = '';
    });

    namaInput.addEventListener('input', function() {
        const searchTerm = this.value;
        if (searchTerm.length < 3) { searchResultsContainer.style.display = 'none'; return; }
        fetch(`assets/api/search_pegawai.php?term=${searchTerm}`).then(r => r.json()).then(data => {
            searchResultsContainer.innerHTML = '';
            if (data.length > 0) {
                data.forEach(p => {
                    const d = document.createElement('div');
                    d.className = 'search-result-item';
                    d.textContent = `${p.nama_lengkap} (NIP: ${p.nip})`;
                    d.dataset.id = p.id;
                    searchResultsContainer.appendChild(d);
                });
                searchResultsContainer.style.display = 'block';
            }
        });
    });

    searchResultsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('search-result-item')) {
            const pId = e.target.dataset.id;
            searchResultsContainer.style.display = 'none';
            fetch(`assets/api/get_data_personal.php?id=${pId}`).then(r => r.json()).then(data => {
                if (data) {
                    pegawaiIdInput.value = data.id;
                    namaInput.value = data.nama_lengkap || '';
                    nipInput.value = data.nip || '';
                    golonganInput.value = data.golongan_terakhir || '';
                    alamatInput.value = data.alamat || '';
                    pendidikanInput.value = data.jenjang_pendidikan || '';
                    jabatanInput.value = 'Jabatan Terakhir'; // Placeholder
                    unitKerjaInput.value = 'Unit Kerja Terakhir'; // Placeholder
                }
            });
        }
    });

    lampiranInput.addEventListener('change', function() {
        lampiranFileName.textContent = this.files.length > 0 ? `File dipilih: ${this.files[0].name}` : '';
    });

    formSurat.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitButton = suratModal._element.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Menyimpan...`;

        fetch('assets/api/add_surat_perintah.php', { method: 'POST', body: new FormData(this) })
            .then(response => response.json())
            .then(res => {
                alert(res.message);
                if (res.success) {
                    suratModal.hide();
                    loadSuratHistory();
                }
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = `<i class="fas fa-save"></i> Save`;
            });
    });

    tabelSuratBody.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('.btn-delete-surat');
        if (deleteButton) {
            if (confirm('Anda yakin ingin menghapus surat perintah ini?')) {
                const suratId = deleteButton.dataset.id;
                const formData = new FormData();
                formData.append('id', suratId);
                fetch('assets/api/delete_surat_perintah.php', { method: 'POST', body: formData })
                    .then(response => response.json())
                    .then(res => {
                        alert(res.message);
                        if (res.success) {
                            loadSuratHistory();
                        }
                    });
            }
        }
    });

    // --- INISIALISASI ---
    loadSuratHistory();
});