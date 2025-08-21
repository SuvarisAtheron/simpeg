document.addEventListener('DOMContentLoaded', function () {

    // === DEKLARASI ELEMEN ===
    const cutiModalElement = document.getElementById('cutiModal');
    const cutiModal = new bootstrap.Modal(cutiModalElement);
    const formCuti = document.getElementById('form-cuti');
    const tabelCutiBody = document.getElementById('tabel-cuti-body');

    const namaInput = document.getElementById('cuti-nama');
    const searchResultsContainer = document.getElementById('search-results-cuti');
    const pegawaiIdInput = document.getElementById('cuti-pegawai-id');

    const nipInput = document.getElementById('cuti-nip');
    const statusInput = document.getElementById('cuti-status');
    const golonganInput = document.getElementById('cuti-golongan');
    const jabatanInput = document.getElementById('cuti-jabatan');

    const searchCutiInput = document.getElementById('search-cuti-input');

    // === FUNGSI-FUNGSI ===

    function loadCutiHistory() {
        tabelCutiBody.innerHTML = `<tr><td colspan="6" class="text-center">Memuat riwayat...</td></tr>`;
        fetch('assets/api/get_list_cuti.php')
            .then(response => response.json())
            .then(res => {
                tabelCutiBody.innerHTML = '';
                if (res.success && res.data.length > 0) {
                    res.data.forEach((item, index) => {
                        const tr = document.createElement('tr');

                        let statusBadge = '';
                        let actionButtons = `<button class="btn btn-sm btn-danger btn-delete-cuti" data-id="${item.id}" title="Hapus"><i class="fas fa-trash"></i></button>`;

                        switch (item.status_pengajuan) {
                            case 'Diajukan':
                                statusBadge = `<span class="badge bg-warning text-dark">Diajukan</span>`;
                                actionButtons = `
                                    <button class="btn btn-sm btn-success btn-approve-cuti" data-id="${item.id}" title="Setujui"><i class="fas fa-check"></i></button>
                                    <button class="btn btn-sm btn-secondary btn-reject-cuti" data-id="${item.id}" title="Tolak"><i class="fas fa-times"></i></button>
                                ` + actionButtons;
                                break;
                            case 'Disetujui':
                                statusBadge = `<span class="badge bg-success">Disetujui</span>`;
                                break;
                            case 'Ditolak':
                                statusBadge = `<span class="badge bg-danger">Ditolak</span>`;
                                break;
                        }

                        // **** INI BAGIAN YANG DIPERBAIKI ****
                        // Pastikan kita memanggil 'item.nama_lengkap_gelar'
                        tr.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${item.nama_lengkap_gelar}<br><small class="text-muted">NIP: ${item.nip}</small></td>
                            <td>${item.jenis_cuti}</td>
                            <td>${item.tanggal_mulai} s/d ${item.tanggal_selesai}</td>
                            <td>${statusBadge}</td>
                            <td>${actionButtons}</td>
                        `;
                        tabelCutiBody.appendChild(tr);
                    });
                } else {
                    tabelCutiBody.innerHTML = `<tr><td colspan="6" class="text-center">Belum ada riwayat pengajuan cuti.</td></tr>`;
                }
            });
    }

    function updateCutiStatus(id, status) {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('status', status);

        fetch('assets/api/update_status_cuti.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(res => {
                alert(res.message);
                if (res.success) {
                    loadCutiHistory();
                }
            });
    }

    // === EVENT LISTENERS ===

    searchCutiInput.addEventListener('input', function () {
        const filterText = this.value.toLowerCase();
        const rows = tabelCutiBody.querySelectorAll('tr');
        rows.forEach(row => {
            const namaNip = row.cells[1].textContent.toLowerCase();
            if (namaNip.includes(filterText)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });

    cutiModalElement.addEventListener('shown.bs.modal', () => formCuti.reset());

    namaInput.addEventListener('input', function () {
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
                        div.dataset.nama = pegawai.nama_lengkap;
                        searchResultsContainer.appendChild(div);
                    });
                    searchResultsContainer.style.display = 'block';
                } else {
                    searchResultsContainer.style.display = 'none';
                }
            });
    });

    searchResultsContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('search-result-item')) {
            const pegawaiId = e.target.dataset.id;
            namaInput.value = e.target.dataset.nama;
            searchResultsContainer.style.display = 'none';
            fetch(`assets/api/get_data_personal.php?id=${pegawaiId}`)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        pegawaiIdInput.value = data.id;
                        nipInput.value = data.nip || '';
                        statusInput.value = data.status_pegawai || '';
                        golonganInput.value = data.golongan_terakhir || '';
                        jabatanInput.value = 'Jabatan Terakhir'; // Placeholder
                    }
                });
        }
    });

    formCuti.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitButton = cutiModal._element.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Menyimpan...`;

        fetch('assets/api/add_cuti.php', {
            method: 'POST',
            body: new FormData(this)
        })
            .then(response => response.json())
            .then(res => {
                alert(res.message);
                if (res.success) {
                    cutiModal.hide();
                    loadCutiHistory();
                }
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = `<i class="fas fa-save"></i> Save`;
            });
    });

    tabelCutiBody.addEventListener('click', function (e) {
        const approveBtn = e.target.closest('.btn-approve-cuti');
        const rejectBtn = e.target.closest('.btn-reject-cuti');
        const deleteBtn = e.target.closest('.btn-delete-cuti');

        if (approveBtn) {
            if (confirm('Anda yakin ingin menyetujui pengajuan cuti ini?')) {
                updateCutiStatus(approveBtn.dataset.id, 'Disetujui');
            }
        } else if (rejectBtn) {
            if (confirm('Anda yakin ingin menolak pengajuan cuti ini?')) {
                updateCutiStatus(rejectBtn.dataset.id, 'Ditolak');
            }
        } else if (deleteBtn) {
            if (confirm('Apakah Anda yakin ingin menghapus pengajuan cuti ini secara permanen?')) {
                const cutiId = deleteBtn.dataset.id;
                const formData = new FormData();
                formData.append('id', cutiId);

                fetch('assets/api/delete_cuti.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(res => {
                        alert(res.message);
                        if (res.success) {
                            loadCutiHistory();
                        }
                    });
            }
        }
    });

    // --- INISIALISASI ---
    loadCutiHistory();
});