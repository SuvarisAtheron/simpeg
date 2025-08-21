document.addEventListener('DOMContentLoaded', function() {
    
    // === DEKLARASI ELEMEN ===
    const pensiunModalElement = document.getElementById('pensiunModal');
    const pensiunModal = new bootstrap.Modal(pensiunModalElement);
    const formPensiun = document.getElementById('form-pensiun');
    const tabelPensiunBody = document.getElementById('tabel-pensiun-body');
    
    const namaInput = document.getElementById('pensiun-nama');
    const searchResultsContainer = document.getElementById('search-results-pensiun');
    const pegawaiIdInput = document.getElementById('pensiun-pegawai-id');
    const nipInput = document.getElementById('pensiun-nip');
    const golonganInput = document.getElementById('pensiun-golongan');
    const jabatanInput = document.getElementById('pensiun-jabatan');
    const unitKerjaInput = document.getElementById('pensiun-unit-kerja');
    const alamatRumahInput = document.getElementById('pensiun-alamat-rumah');
    const lampiranInput = document.getElementById('pensiun-lampiran');
    const lampiranFileName = document.getElementById('pensiun-file-name');

    // Elemen baru untuk pencarian
    const searchPensiunInput = document.getElementById('search-pensiun-input');

    // === FUNGSI-FUNGSI ===

    function loadPensiunHistory() {
        tabelPensiunBody.innerHTML = `<tr><td colspan="7" class="text-center">Memuat riwayat...</td></tr>`;
        fetch('assets/api/get_list_pensiun.php')
            .then(response => response.json())
            .then(res => {
                tabelPensiunBody.innerHTML = '';
                if (res.success && res.data.length > 0) {
                    res.data.forEach((item, index) => {
                        const tr = document.createElement('tr');
                        const fileButton = item.path_lampiran 
                            ? `<a href="${item.path_lampiran}" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i> Lihat</a>`
                            : `<span class="text-muted">Tidak ada</span>`;
                        
                        // **PERBAIKAN NAMA DENGAN GELAR**
                        tr.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${item.nama_lengkap_gelar}</td>
                            <td>${item.nip}</td>
                            <td>${item.no_sk_pensiun}</td>
                            <td>${item.tanggal_pensiun}</td>
                            <td>${fileButton}</td>
                            <td>
                                <button class="btn btn-sm btn-danger btn-delete-pensiun" data-id="${item.id}" title="Hapus Pengajuan">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        `;
                        tabelPensiunBody.appendChild(tr);
                    });
                } else {
                    tabelPensiunBody.innerHTML = `<tr><td colspan="7" class="text-center">Belum ada riwayat pengajuan pensiun.</td></tr>`;
                }
            });
    }

    // === EVENT LISTENERS ===
    
    // Event listener untuk kotak pencarian
    searchPensiunInput.addEventListener('input', function() {
        const filterText = this.value.toLowerCase();
        const rows = tabelPensiunBody.querySelectorAll('tr');
        rows.forEach(row => {
            const nama = row.cells[1].textContent.toLowerCase();
            const nip = row.cells[2].textContent.toLowerCase();
            if (nama.includes(filterText) || nip.includes(filterText)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });

    pensiunModalElement.addEventListener('shown.bs.modal', function () {
        formPensiun.reset();
        searchResultsContainer.style.display = 'none';
        lampiranFileName.textContent = '';
        nipInput.value = '';
        golonganInput.value = '';
        jabatanInput.value = '';
        unitKerjaInput.value = '';
        alamatRumahInput.value = '';
    });

    namaInput.addEventListener('input', function() {
        const searchTerm = this.value; if (searchTerm.length < 3) { searchResultsContainer.style.display = 'none'; return; }
        fetch(`assets/api/search_pegawai.php?term=${searchTerm}`).then(r => r.json()).then(data => {
            searchResultsContainer.innerHTML = '';
            if (data.length > 0) {
                data.forEach(p => {
                    const d = document.createElement('div'); d.className = 'search-result-item';
                    d.textContent = `${p.nama_lengkap} (NIP: ${p.nip})`; d.dataset.id = p.id;
                    searchResultsContainer.appendChild(d);
                }); searchResultsContainer.style.display = 'block';
            } else { searchResultsContainer.style.display = 'none'; }
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
                    alamatRumahInput.value = data.alamat || '';
                    jabatanInput.value = 'Jabatan Terakhir'; // Placeholder
                    unitKerjaInput.value = 'Unit Kerja Terakhir'; // Placeholder
                }
            });
        }
    });

    lampiranInput.addEventListener('change', function() {
        lampiranFileName.textContent = this.files.length > 0 ? `File dipilih: ${this.files[0].name}` : '';
    });

    formPensiun.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitButton = pensiunModal._element.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Menyimpan...`;

        fetch('assets/api/add_pensiun.php', {
            method: 'POST',
            body: new FormData(this)
        })
        .then(response => response.json())
        .then(res => {
            alert(res.message);
            if (res.success) {
                pensiunModal.hide();
                loadPensiunHistory();
            }
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="fas fa-save"></i> Save`;
        });
    });

    tabelPensiunBody.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('.btn-delete-pensiun');
        if (deleteButton) {
            if (confirm('Anda yakin ingin menghapus data pensiun ini secara permanen?')) {
                const pensiunId = deleteButton.dataset.id;
                const formData = new FormData();
                formData.append('id', pensiunId);

                fetch('assets/api/delete_pensiun.php', { method: 'POST', body: formData })
                    .then(response => response.json())
                    .then(res => {
                        alert(res.message);
                        if (res.success) {
                            loadPensiunHistory();
                        }
                    });
            }
        }
    });

    // --- INISIALISASI ---
    loadPensiunHistory();
});