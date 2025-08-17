document.addEventListener('DOMContentLoaded', function() {
    
    // === DEKLARASI ELEMEN ===
    const mutasiModalElement = document.getElementById('mutasiModal');
    const mutasiModal = new bootstrap.Modal(mutasiModalElement);
    const formMutasi = document.getElementById('form-mutasi');
    const tabelMutasiBody = document.getElementById('tabel-mutasi-body');
    
    const namaInput = document.getElementById('mutasi-nama');
    const searchResultsContainer = document.getElementById('search-results-mutasi');
    const pegawaiIdInput = document.getElementById('mutasi-pegawai-id');
    const nipInput = document.getElementById('mutasi-nip');
    const golonganInput = document.getElementById('mutasi-golongan');
    const jabatanInput = document.getElementById('mutasi-jabatan');
    const unitKerjaSebelumnyaInput = document.getElementById('mutasi-unit-kerja-sebelumnya');
    const lampiranInput = document.getElementById('mutasi-lampiran');
    const lampiranFileName = document.getElementById('mutasi-file-name');

    // === FUNGSI-FUNGSI ===

    function loadMutasiHistory() {
        tabelMutasiBody.innerHTML = `<tr><td colspan="7" class="text-center">Memuat riwayat...</td></tr>`;
        fetch('assets/api/get_list_mutasi.php')
            .then(response => response.json())
            .then(res => {
                tabelMutasiBody.innerHTML = '';
                if (res.success && res.data.length > 0) {
                    res.data.forEach((item, index) => {
                        const tr = document.createElement('tr');
                        const fileButton = item.path_lampiran 
                            ? `<a href="${item.path_lampiran}" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i> Lihat</a>`
                            : `<span class="text-muted">Tidak ada</span>`;
                        
                        tr.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${item.nama_lengkap}<br><small class="text-muted">NIP: ${item.nip}</small></td>
                            <td>${item.unit_kerja_sebelumnya}</td>
                            <td>${item.instansi_baru}</td>
                            <td>${item.tanggal_mutasi}</td>
                            <td>${fileButton}</td>
                            <td>
                                <button class="btn btn-sm btn-danger btn-delete-mutasi" data-id="${item.id}" title="Hapus Mutasi">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        `;
                        tabelMutasiBody.appendChild(tr);
                    });
                } else {
                    tabelMutasiBody.innerHTML = `<tr><td colspan="7" class="text-center">Belum ada riwayat mutasi.</td></tr>`;
                }
            });
    }

    // === EVENT LISTENERS ===

    mutasiModalElement.addEventListener('shown.bs.modal', function () {
        formMutasi.reset();
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

    formMutasi.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitButton = mutasiModal._element.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Menyimpan...`;

        fetch('assets/api/add_mutasi.php', {
            method: 'POST',
            body: new FormData(this)
        })
        .then(response => response.json())
        .then(res => {
            alert(res.message);
            if (res.success) {
                mutasiModal.hide();
                loadMutasiHistory();
            }
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="fas fa-save"></i> Save`;
        });
    });

    tabelMutasiBody.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('.btn-delete-mutasi');
        if (deleteButton) {
            if (confirm('Anda yakin ingin menghapus data mutasi ini?')) {
                const mutasiId = deleteButton.dataset.id;
                const formData = new FormData();
                formData.append('id', mutasiId);

                fetch('assets/api/delete_mutasi.php', { method: 'POST', body: formData })
                    .then(response => response.json())
                    .then(res => {
                        alert(res.message);
                        if (res.success) {
                            loadMutasiHistory();
                        }
                    });
            }
        }
    });

    // --- INISIALISASI ---
    loadMutasiHistory();
});