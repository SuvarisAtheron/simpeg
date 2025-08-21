document.addEventListener('DOMContentLoaded', function () {

    // --- DEKLARASI SEMUA VARIABEL ---
    const kgbModalElement = document.getElementById('kgbModal');
    const kgbModal = new bootstrap.Modal(kgbModalElement);
    const formKgb = document.getElementById('form-kgb');
    const tahunInput = document.getElementById('kgb-tahun');
    const namaInput = document.getElementById('kgb-nama');
    const searchResultsContainer = document.getElementById('search-results-kgb');
    const nipInput = document.getElementById('kgb-nip');
    const golonganInput = document.getElementById('kgb-golongan');
    const masaKerjaTahunInput = document.getElementById('kgb-masa-kerja-tahun');
    const masaKerjaBulanInput = document.getElementById('kgb-masa-kerja-bulan');
    const pegawaiIdInput = document.getElementById('kgb-pegawai-id');
    const lampiranInput = document.getElementById('kgb-lampiran');
    const lampiranFileName = document.getElementById('lampiran-file-name');
    const tabelKgbBody = document.getElementById('tabel-kgb-body');

    // ===== KODE BARU UNTUK PENCARIAN =====
    const searchKgbInput = document.getElementById('search-kgb-input');
    // ===== AKHIR KODE BARU =====


    // --- FUNGSI-FUNGSI ---
    function loadKgbHistory() {
        if (!tabelKgbBody) return;
        tabelKgbBody.innerHTML = `<tr><td colspan="6" class="text-center">Memuat riwayat...</td></tr>`;
        fetch('assets/api/get_list_kgb.php')
            .then(response => response.json())
            .then(result => {
                tabelKgbBody.innerHTML = '';
                if (result.success && result.data.length > 0) {
                    const namaBulan = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    result.data.forEach((item, index) => {
                        const tr = document.createElement('tr');
                        const periode = `${namaBulan[item.bulan_pengajuan]} ${item.tahun_pengajuan}`;
                        tr.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${item.nama_lengkap_gelar}</td>
                            <td>${item.nip}</td>
                            <td>${periode}</td>
                            <td>
                                <a href="${item.path_lampiran}" target="_blank" class="btn btn-sm btn-outline-info">
                                    <i class="fas fa-eye"></i> Lihat SK
                                </a>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-danger btn-delete-kgb" data-id="${item.id}" title="Hapus Pengajuan">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        `;
                        tabelKgbBody.appendChild(tr);
                    });
                } else {
                    tabelKgbBody.innerHTML = `<tr><td colspan="6" class="text-center">Belum ada riwayat pengajuan KGB.</td></tr>`;
                }
            });
    }

    // --- EVENT LISTENERS ---

    // ===== KODE BARU UNTUK PENCARIAN =====
    searchKgbInput.addEventListener('input', function () {
        const filterText = this.value.toLowerCase();
        const rows = tabelKgbBody.querySelectorAll('tr');
        rows.forEach(row => {
            // Cek di kolom Nama (indeks 1) dan NIP (indeks 2)
            const namaPegawai = row.cells[1].textContent.toLowerCase();
            const nip = row.cells[2].textContent.toLowerCase();
            if (namaPegawai.includes(filterText) || nip.includes(filterText)) {
                row.style.display = ""; // Tampilkan baris
            } else {
                row.style.display = "none"; // Sembunyikan baris
            }
        });
    });

    // 1. Mengisi tahun otomatis saat modal ditampilkan
    kgbModalElement.addEventListener('shown.bs.modal', function () {
        const currentYear = new Date().getFullYear();
        tahunInput.value = currentYear;
        formKgb.reset();
        tahunInput.value = currentYear;
        lampiranFileName.textContent = '';
    });

    // 2. Logika untuk mencari pegawai
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

    // 3. Logika untuk memilih pegawai
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
                        golonganInput.value = data.golongan_terakhir || '';
                        if (data.tmt_cpns) {
                            const tmt = new Date(data.tmt_cpns);
                            const now = new Date();
                            let years = now.getFullYear() - tmt.getFullYear();
                            let months = now.getMonth() - tmt.getMonth();
                            if (months < 0) {
                                years--;
                                months += 12;
                            }
                            masaKerjaTahunInput.value = years;
                            masaKerjaBulanInput.value = months;
                        } else {
                            masaKerjaTahunInput.value = 0;
                            masaKerjaBulanInput.value = 0;
                        }
                    }
                });
        }
    });

    // 4. Menampilkan nama file yang dipilih
    lampiranInput.addEventListener('change', function () {
        lampiranFileName.textContent = this.files.length > 0 ? `File dipilih: ${this.files[0].name}` : '';
    });

    // 5. Logika untuk submit form
    formKgb.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitButton = kgbModal._element.querySelector('button[type="submit"]');
        const formData = new FormData(this);

        if (!formData.get('pegawai_id') || !formData.get('lampiran').name) {
            alert('Silakan pilih pegawai dan lampirkan file terlebih dahulu.');
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Menyimpan...`;

        fetch('assets/api/add_kgb.php', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    kgbModal.hide();
                    loadKgbHistory();
                }
            })
            .catch(error => console.error('Error:', error))
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = `<i class="fas fa-save"></i> Save`;
            });
    });

    // 6. Event listener untuk tombol hapus di tabel riwayat
    tabelKgbBody.addEventListener('click', function (e) {
        const deleteButton = e.target.closest('.btn-delete-kgb');
        if (deleteButton) {
            if (confirm('Apakah Anda yakin ingin menghapus data pengajuan ini?')) {
                const kgbId = deleteButton.dataset.id;
                const formData = new FormData();
                formData.append('id', kgbId);

                fetch('assets/api/delete_kgb.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        if (data.success) {
                            loadKgbHistory(); // Muat ulang riwayat setelah berhasil hapus
                        }
                    });
            }
        }
    });

    // --- INISIALISASI ---
    loadKgbHistory();
});