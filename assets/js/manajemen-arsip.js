document.addEventListener('DOMContentLoaded', function() {
    
    // === DEKLARASI ELEMEN ===
    const tabelPegawaiBody = document.getElementById('tabel-pegawai-body');
    const searchInput = document.getElementById('search-input');
    
    // Elemen Modal
    const arsipModalElement = document.getElementById('arsipModal');
    const arsipModal = new bootstrap.Modal(arsipModalElement);
    const namaPegawaiModal = document.getElementById('nama-pegawai-modal');
    const tabelArsipDetailBody = document.getElementById('tabel-arsip-detail-body');
    const formUploadArsip = document.getElementById('form-upload-arsip');
    const uploadPegawaiIdInput = document.getElementById('upload-pegawai-id');

    let currentPegawaiId = null; // Menyimpan ID pegawai yang modalnya sedang dibuka

    // === FUNGSI-FUNGSI UTAMA ===

    // Fungsi untuk menampilkan daftar pegawai di tabel utama
    function tampilkanPegawai() {
        tabelPegawaiBody.innerHTML = `<tr><td colspan="6" class="text-center">Memuat data...</td></tr>`;
        fetch('assets/api/get_list_pegawai.php')
            .then(response => response.json())
            .then(data => {
                tabelPegawaiBody.innerHTML = '';
                if (!data || data.length === 0) {
                    tabelPegawaiBody.innerHTML = `<tr><td colspan="6" class="text-center">Belum ada data pegawai.</td></tr>`;
                    return;
                }
                data.forEach((pegawai, index) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${pegawai.nama_lengkap_gelar}</td>
                        <td><span class="badge bg-secondary">${pegawai.status_pegawai || 'N/A'}</span></td>
                        <td>${pegawai.nip || 'N/A'}</td>
                        <td>${pegawai.jabatan || 'Belum ada jabatan'}</td>
                        <td>
                            <button class="btn btn-primary btn-sm btn-kelola-arsip" data-id="${pegawai.id}" data-nama="${pegawai.nama_lengkap_gelar}">
                                <i class="fas fa-folder-open"></i> Kelola Arsip
                            </button>
                        </td>
                    `;
                    tabelPegawaiBody.appendChild(tr);
                });
            });
    }

    // Fungsi untuk memuat dan menampilkan daftar arsip di dalam modal
    function loadArsipDetail(pegawaiId) {
        currentPegawaiId = pegawaiId; // Set ID pegawai saat ini
        tabelArsipDetailBody.innerHTML = `<tr><td colspan="4" class="text-center">Memuat arsip...</td></tr>`;

        fetch(`assets/api/get_arsip_pegawai.php?pegawai_id=${pegawaiId}`)
            .then(response => response.json())
            .then(res => {
                tabelArsipDetailBody.innerHTML = '';
                if (res.success && res.data.length > 0) {
                    res.data.forEach((arsip, index) => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${arsip.nama_arsip}</td>
                            <td>${arsip.tanggal_upload}</td>
                            <td>
                                <a href="${arsip.path_file}" target="_blank" class="btn btn-sm btn-info" title="Lihat File">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <button class="btn btn-sm btn-danger btn-delete-arsip" data-id="${arsip.id}" title="Hapus Arsip">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        `;
                        tabelArsipDetailBody.appendChild(tr);
                    });
                } else {
                    tabelArsipDetailBody.innerHTML = `<tr><td colspan="4" class="text-center">Belum ada arsip yang diunggah.</td></tr>`;
                }
            });
    }

    // === EVENT LISTENERS ===

    // Event listener untuk filter tabel pegawai
    searchInput.addEventListener('input', function() {
        const filterText = this.value.toLowerCase();
        const rows = tabelPegawaiBody.querySelectorAll('tr');
        rows.forEach(row => {
            const namaPegawai = row.cells[1].textContent.toLowerCase();
            row.style.display = namaPegawai.includes(filterText) ? "" : "none";
        });
    });

    // Event listener untuk tombol "Kelola Arsip"
    tabelPegawaiBody.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-kelola-arsip');
        if (btn) {
            const pegawaiId = btn.dataset.id;
            const pegawaiNama = btn.dataset.nama;

            namaPegawaiModal.textContent = pegawaiNama;
            uploadPegawaiIdInput.value = pegawaiId; // Set ID di form upload
            loadArsipDetail(pegawaiId);
            arsipModal.show();
        }
    });

    // Event listener untuk form upload
    formUploadArsip.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

        fetch('assets/api/upload_arsip.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(res => {
            alert(res.message);
            if (res.success) {
                this.reset(); // Kosongkan form setelah berhasil
                loadArsipDetail(currentPegawaiId); // Muat ulang daftar arsip
            }
        })
        .catch(error => {
            console.error('Upload Error:', error);
            alert('Terjadi kesalahan saat mengunggah.');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="fas fa-upload"></i> Unggah`;
        });
    });

    // Event listener untuk tombol hapus di dalam modal
    tabelArsipDetailBody.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-delete-arsip');
        if (btn) {
            if (confirm('Apakah Anda yakin ingin menghapus arsip ini secara permanen?')) {
                const arsipId = btn.dataset.id;
                const formData = new FormData();
                formData.append('arsip_id', arsipId);

                fetch('assets/api/delete_arsip.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(res => {
                    alert(res.message);
                    if (res.success) {
                        loadArsipDetail(currentPegawaiId); // Muat ulang daftar arsip
                    }
                });
            }
        }
    });

    // Panggil fungsi untuk memuat tabel pegawai saat halaman pertama kali dibuka
    tampilkanPegawai();
});