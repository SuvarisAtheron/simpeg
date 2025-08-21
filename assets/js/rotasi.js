document.addEventListener('DOMContentLoaded', function() {
    
    // === DEKLARASI ELEMEN ===
    const rotasiModalElement = document.getElementById('rotasiModal');
    const rotasiModal = new bootstrap.Modal(rotasiModalElement);
    const formRotasi = document.getElementById('form-rotasi');
    const tabelRotasiBody = document.getElementById('tabel-rotasi-body');
    
    const namaInput = document.getElementById('rotasi-nama');
    const searchResultsContainer = document.getElementById('search-results-rotasi');
    const pegawaiIdInput = document.getElementById('rotasi-pegawai-id');
    const nipInput = document.getElementById('rotasi-nip');
    const golonganInput = document.getElementById('rotasi-golongan');
    const jabatanInput = document.getElementById('rotasi-jabatan');
    const unitKerjaSebelumnyaInput = document.getElementById('rotasi-unit-kerja-sebelumnya');
    const lampiranInput = document.getElementById('rotasi-lampiran');
    const lampiranFileName = document.getElementById('rotasi-file-name');

    // Elemen baru untuk pencarian
    const searchRotasiInput = document.getElementById('search-rotasi-input');

    // === FUNGSI-FUNGSI ===

    function loadRotasiHistory() {
        tabelRotasiBody.innerHTML = `<tr><td colspan="7" class="text-center">Memuat riwayat...</td></tr>`;
        fetch('assets/api/get_list_rotasi.php')
            .then(response => response.json())
            .then(res => {
                tabelRotasiBody.innerHTML = '';
                if (res.success && res.data.length > 0) {
                    res.data.forEach((item, index) => {
                        const tr = document.createElement('tr');
                        const fileButton = item.path_lampiran 
                            ? `<a href="${item.path_lampiran}" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i> Lihat</a>`
                            : `<span class="text-muted">Tidak ada</span>`;
                        
                        // **PERBAIKAN NAMA DENGAN GELAR**
                        tr.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${item.nama_lengkap_gelar}<br><small class="text-muted">NIP: ${item.nip}</small></td>
                            <td>${item.unit_kerja_sebelumnya}</td>
                            <td>${item.unit_kerja_baru}</td>
                            <td>${item.tanggal_rotasi}</td>
                            <td>${fileButton}</td>
                            <td>
                                <button class="btn btn-sm btn-danger btn-delete-rotasi" data-id="${item.id}" title="Hapus Rotasi">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        `;
                        tabelRotasiBody.appendChild(tr);
                    });
                } else {
                    tabelRotasiBody.innerHTML = `<tr><td colspan="7" class="text-center">Belum ada riwayat rotasi.</td></tr>`;
                }
            });
    }

    // === EVENT LISTENERS ===

    // Event listener untuk kotak pencarian
    searchRotasiInput.addEventListener('input', function() {
        const filterText = this.value.toLowerCase();
        const rows = tabelRotasiBody.querySelectorAll('tr');
        rows.forEach(row => {
            const namaNip = row.cells[1].textContent.toLowerCase();
            if (namaNip.includes(filterText)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });

    rotasiModalElement.addEventListener('shown.bs.modal', function () {
        formRotasi.reset();
        searchResultsContainer.style.display = 'none';
        lampiranFileName.textContent = '';
        nipInput.value = '';
        golonganInput.value = '';
        jabatanInput.value = '';
        unitKerjaSebelumnyaInput.value = '';
    });

    namaInput.addEventListener('input', function() {
        const searchTerm = this.value;
        if (searchTerm.length < 3) {
            searchResultsContainer.style.display = 'none';
            return;
        }
        fetch(`assets/api/search_pegawai.php?term=${searchTerm}`)
            .then(response => response.json())
            .then(data => {
                searchResultsContainer.innerHTML = '';
                if (data.length > 0) {
                    data.forEach(pegawai => {
                        const div = document.createElement('div');
                        div.className = 'search-result-item';
                        div.textContent = `${pegawai.nama_lengkap} (NIP: ${pegawai.nip})`;
                        div.dataset.id = pegawai.id;
                        searchResultsContainer.appendChild(div);
                    });
                    searchResultsContainer.style.display = 'block';
                }
            });
    });

    searchResultsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('search-result-item')) {
            const pegawaiId = e.target.dataset.id;
            searchResultsContainer.style.display = 'none';
            
            fetch(`assets/api/get_data_personal.php?id=${pegawaiId}`)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        pegawaiIdInput.value = data.id;
                        namaInput.value = data.nama_lengkap || '';
                        nipInput.value = data.nip || '';
                        golonganInput.value = data.golongan_terakhir || '';
                        jabatanInput.value = 'Jabatan Terakhir'; // Placeholder
                        unitKerjaSebelumnyaInput.value = 'Unit Kerja Terakhir'; // Placeholder
                    }
                });
        }
    });

    lampiranInput.addEventListener('change', function() {
        lampiranFileName.textContent = this.files.length > 0 ? `File dipilih: ${this.files[0].name}` : '';
    });

    formRotasi.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitButton = rotasiModal._element.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Menyimpan...`;

        fetch('assets/api/add_rotasi.php', {
            method: 'POST',
            body: new FormData(this)
        })
        .then(response => response.json())
        .then(res => {
            alert(res.message);
            if (res.success) {
                rotasiModal.hide();
                loadRotasiHistory();
            }
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="fas fa-save"></i> Save`;
        });
    });

    tabelRotasiBody.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('.btn-delete-rotasi');
        if (deleteButton) {
            if (confirm('Anda yakin ingin menghapus data rotasi ini?')) {
                const rotasiId = deleteButton.dataset.id;
                const formData = new FormData();
                formData.append('id', rotasiId);

                fetch('assets/api/delete_rotasi.php', { method: 'POST', body: formData })
                    .then(response => response.json())
                    .then(res => {
                        alert(res.message);
                        if (res.success) {
                            loadRotasiHistory();
                        }
                    });
            }
        }
    });

    // --- INISIALISASI ---
    loadRotasiHistory();
});