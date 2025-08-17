document.addEventListener('DOMContentLoaded', function () {

    // --- Bagian 1: Logika Umum (Sidebar, Link Aktif) ---
    // (Tidak ada perubahan di bagian ini, sudah benar)
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const header = document.querySelector('.main-header');
    const toggleBtn = document.getElementById('toggleSidebarBtn');

    if (sidebar && mainContent && header && toggleBtn) {
        const sidebarState = localStorage.getItem('sidebarState');
        if (sidebarState === 'open') {
            sidebar.classList.add('sidebar-visible');
            mainContent.classList.add('content-shifted');
            header.classList.add('header-shifted');
        }
        toggleBtn.addEventListener('click', function (event) {
            event.preventDefault();
            sidebar.classList.toggle('sidebar-visible');
            mainContent.classList.toggle('content-shifted');
            header.classList.toggle('header-shifted');
            localStorage.setItem('sidebarState', sidebar.classList.contains('sidebar-visible') ? 'open' : 'closed');
        });
    }

    const sidebarLinks = document.querySelectorAll('.sidebar-menu li a');
    const currentPage = window.location.pathname.split("/").pop();
    sidebarLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // --- Bagian 2: Logika Khusus Halaman Riwayat Pegawai ---
    const pageIdentifier = document.getElementById('riwayat-content');
    if (pageIdentifier) {

        // =================================================================
        // LANGKAH 1: DEKLARASI SEMUA VARIABEL DI ATAS
        // =================================================================
        let pegawaiTerpilih = null;

        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchResultsModal = new bootstrap.Modal(document.getElementById('searchResultsModal'));
        const modalBody = document.querySelector('#searchResultsModal .modal-body');

        const pegawaiInfoCard = document.getElementById('pegawai-info-card');
        const namaPegawaiTerpilihSpan = document.getElementById('nama-pegawai-terpilih');
        const riwayatContent = document.getElementById('riwayat-content');
        const initialMessage = document.getElementById('initial-message');

        // Variabel untuk Modal Tambah Data
        const btnTambahRiwayat = document.getElementById('btn-tambah-riwayat');
        const tambahRiwayatModal = new bootstrap.Modal(document.getElementById('tambahRiwayatModal'));
        const formTambahRiwayat = document.getElementById('form-tambah-riwayat');
        const jenisRiwayatSelect = document.getElementById('jenis-riwayat-select');
        const formDinamisContainer = document.getElementById('form-dinamis-container');
        const tambahRiwayatModalLabel = document.getElementById('tambahRiwayatModalLabel');

        // Variabel untuk Modal Edit Data
        const editRiwayatModal = new bootstrap.Modal(document.getElementById('editRiwayatModal'));
        const formEditRiwayat = document.getElementById('form-edit-riwayat');
        const formEditContainer = document.getElementById('form-edit-dinamis-container');

        const formTemplates = {
            bahasa: `
        <div class="mb-3"><label class="form-label">Jenis Bahasa</label><input type="text" name="jenis_bahasa" class="form-control" required></div>
        <div class="mb-3"><label class="form-label">Jenis Sertifikat</label><input type="text" name="jenis_sertifikat" class="form-control"></div>
        <div class="mb-3"><label class="form-label">Tanggal</label><input type="date" name="tanggal" class="form-control"></div>
        <div class="mb-3"><label class="form-label">Lembaga Sertifikat</label><input type="text" name="lembaga_sertifikat" class="form-control"></div>`,
            jabatan: `
        <div class="form-grid">
            <div class="form-group"><label class="form-label">Jenis Jabatan</label><select name="jenis_jabatan" class="form-select" required><option value="">Pilih</option><option>Pelaksana</option><option>Fungsional</option><option>Struktural</option></select></div>
            <div class="form-group"><label class="form-label">Nama Jabatan</label><input type="text" name="nama_jabatan" class="form-control" required></div>
            <div class="form-group"><label class="form-label">No. SK</label><input type="text" name="no_sk" class="form-control"></div>
            <div class="form-group"><label class="form-label">Pejabat Pengangkat</label><input type="text" name="pejabat_pengangkat" class="form-control"></div>
            <div class="form-group"><label class="form-label">TMT Jabatan</label><input type="date" name="tmt_jabatan" class="form-control"></div>
            <div class="form-group"><label class="form-label">Tanggal SK</label><input type="date" name="tanggal_sk" class="form-control"></div>
            <div class="form-group"><label class="form-label">Instansi</label><input type="text" name="instansi" class="form-control"></div>
            <div class="form-group"><label class="form-label">Unit Kerja</label><input type="text" name="unit_kerja" class="form-control"></div>
        </div>`,
            pangkat: `
        <div class="form-grid">
            <div class="form-group"><label class="form-label">Gol. Pangkat</label><input type="text" name="gol_pangkat" class="form-control" required></div>
            <div class="form-group"><label class="form-label">Nomor SK</label><input type="text" name="nomor_sk" class="form-control"></div>
            <div class="form-group"><label class="form-label">Tanggal SK</label><input type="date" name="tanggal_sk" class="form-control"></div>
            <div class="form-group"><label class="form-label">TMT Golongan</label><input type="date" name="tmt_golongan" class="form-control"></div>
            <div class="form-group"><label class="form-label">No. BKN</label><input type="text" name="no_bkn" class="form-control"></div>
            <div class="form-group"><label class="form-label">Tanggal BKN</label><input type="date" name="tanggal_bkn" class="form-control"></div>
            <div class="form-group"><label class="form-label">Pejabat Penetapan</label><input type="text" name="pejabat_penetapan" class="form-control"></div>
            <div class="form-group"><label class="form-label">Gaji Pokok</label><input type="number" name="gaji_pokok" class="form-control"></div>
        </div>`,
            organisasi: `
        <div class="form-grid">
            <div class="form-group"><label class="form-label">Nama Organisasi</label><input type="text" name="nama_organisasi" class="form-control" required></div>
            <div class="form-group"><label class="form-label">Unit/Divisi/Bagian</label><input type="text" name="unit_divisi_bagian" class="form-control"></div>
            <div class="form-group"><label class="form-label">Tanggal Mulai</label><input type="date" name="tanggal_mulai" class="form-control"></div>
            <div class="form-group"><label class="form-label">Tanggal Selesai</label><input type="date" name="tanggal_selesai" class="form-control"></div>
            <div class="form-group"><label class="form-label">Jabatan Organisasi</label><input type="text" name="jabatan_organisasi" class="form-control"></div>
            <div class="form-group"><label class="form-label">Nama Pimpinan</label><input type="text" name="nama_pimpinan" class="form-control"></div>
            <div class="form-group"><label class="form-label">Tempat Organisasi</label><input type="text" name="tempat_organisasi" class="form-control"></div>
            <div class="form-group"><label class="form-label">Mengikuti Semasa</label><input type="text" name="mengikuti_semasa" class="form-control"></div>
        </div>`,
            pendidikan: `
        <div class="form-grid">
            <div class="form-group"><label class="form-label">Jenjang Pendidikan</label><input type="text" name="jenjang_pendidikan" class="form-control" required></div>
            <div class="form-group"><label class="form-label">Nama Sekolah</label><input type="text" name="nama_sekolah" class="form-control" required></div>
            <div class="form-group"><label class="form-label">Lokasi Sekolah</label><input type="text" name="lokasi_sekolah" class="form-control"></div>
            <div class="form-group"><label class="form-label">Nama Pimpinan</label><input type="text" name="nama_pimpinan" class="form-control"></div>
            <div class="form-group"><label class="form-label">Tahun Lulus</label><input type="number" name="tahun_lulus" class="form-control"></div>
            <div class="form-group"><label class="form-label">Tanggal Lulus</label><input type="date" name="tanggal_lulus" class="form-control"></div>
            <div class="form-group"><label class="form-label">No Ijazah</label><input type="text" name="no_ijazah" class="form-control"></div>
            <div class="form-group"><label class="form-label">Jurusan</label><input type="text" name="jurusan" class="form-control"></div>
        </div>`,
            diklat: `
        <div class="form-grid">
            <div class="form-group"><label class="form-label">Jenis Pendidikan</label><input type="text" name="jenis_pendidikan" class="form-control"></div>
            <div class="form-group"><label class="form-label">Nama Diklat</label><input type="text" name="nama_diklat" class="form-control" required></div>
            <div class="form-group"><label class="form-label">Tempat Diklat</label><input type="text" name="tempat_diklat" class="form-control"></div>
            <div class="form-group"><label class="form-label">Jumlah Jam</label><input type="number" name="jumlah_jam" class="form-control"></div>
            <div class="form-group"><label class="form-label">Tanggal Mulai</label><input type="date" name="tanggal_mulai" class="form-control"></div>
            <div class="form-group"><label class="form-label">Tanggal Selesai</label><input type="date" name="tanggal_selesai" class="form-control"></div>
            <div class="form-group"><label class="form-label">Penyelenggara</label><input type="text" name="penyelenggara" class="form-control"></div>
            <div class="form-group"><label class="form-label">No. Sertifikat</label><input type="text" name="no_sertifikat" class="form-control"></div>
        </div>`,
            penghargaan: `
        <div class="form-grid">
            <div class="form-group"><label class="form-label">Nama Penghargaan</label><input type="text" name="nama_penghargaan" class="form-control" required></div>
            <div class="form-group"><label class="form-label">Instansi Pemberi</label><input type="text" name="instansi_pemberi" class="form-control"></div>
            <div class="form-group"><label class="form-label">Tanggal Penghargaan</label><input type="date" name="tanggal_penghargaan" class="form-control"></div>
            <div class="form-group"><label class="form-label">No. Sertifikat</label><input type="text" name="no_sertifikat" class="form-control"></div>
        </div>`
        };


        // =================================================================
        // LANGKAH 2: KUMPULKAN SEMUA FUNGSI
        // =================================================================

        // --- FUNGSI UTAMA UNTUK MEMUAT DATA DARI BACKEND ---
        function loadAllRiwayat(pegawaiId) {
            riwayatContent.querySelectorAll('.tab-pane > div').forEach(container => {
                container.innerHTML = '<p class="text-center text-muted">Memuat...</p>';
            });

            fetch(`assets/api/get_riwayat.php?id=${pegawaiId}`)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        tampilkanRiwayat('bahasa', data.bahasa, createBahasaCard);
                        tampilkanRiwayat('jabatan', data.jabatan, createJabatanCard);
                        tampilkanRiwayat('pangkat', data.pangkat, createPangkatCard);
                        tampilkanRiwayat('organisasi', data.organisasi, createOrganisasiCard);
                        tampilkanRiwayat('pendidikan', data.pendidikan, createPendidikanCard);
                        tampilkanRiwayat('diklat', data.diklat, createDiklatCard);
                        tampilkanRiwayat('penghargaan', data.penghargaan, createPenghargaanCard);
                    }
                })
                .catch(error => console.error('Error memuat riwayat:', error));
        }

        // --- FUNGSI GENERIC UNTUK MENAMPILKAN RIWAYAT ---
        function tampilkanRiwayat(jenis, dataArray, createCardFunction) {
            const container = document.getElementById(`container-${jenis}`);
            if (!container) return;

            container.innerHTML = '';
            if (!dataArray || dataArray.length === 0) {
                container.innerHTML = `<p class="text-center text-muted">Belum ada data riwayat.</p>`;
                return;
            }
            dataArray.forEach(data => {
                container.innerHTML += createCardFunction(data);
            });
        }

        // --- FUNGSI-FUNGSI PEMBUAT KARTU (CARD BUILDERS) ---
        function createCardActions(jenis, id) {
            return `
        <div class="data-card-actions">
            <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${id}" data-jenis="${jenis}"><i class="fas fa-pencil-alt"></i> Edit</button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${id}" data-jenis="${jenis}"><i class="fas fa-trash"></i> Hapus</button>
        </div>
    `;
        }

        function createBahasaCard(data) {
            return `<div class="data-card mb-3 position-relative">
                ${createCardActions('bahasa', data.id)}
                <div class="form-grid">
                    <div class="form-group"><label>Jenis Bahasa:</label><input type="text" value="${data.jenis_bahasa || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Jenis Sertifikat:</label><input type="text" value="${data.jenis_sertifikat || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tanggal:</label><input type="text" value="${data.tanggal || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Lembaga:</label><input type="text" value="${data.lembaga_sertifikat || ''}" class="form-control" disabled></div>
                </div>
            </div>`;
        }

        // PERBAIKAN KECIL: createCardActions('jabatan', data.id)
        function createJabatanCard(data) {
            return `<div class="data-card mb-3 position-relative">
                ${createCardActions('jabatan', data.id)}
                <div class="form-grid">
                    <div class="form-group"><label>Jenis Jabatan:</label><input type="text" value="${data.jenis_jabatan || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Nama Jabatan:</label><input type="text" value="${data.nama_jabatan || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>No. SK:</label><input type="text" value="${data.no_sk || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Pejabat Pengangkat:</label><input type="text" value="${data.pejabat_pengangkat || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>TMT Jabatan:</label><input type="text" value="${data.tmt_jabatan || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tanggal SK:</label><input type="text" value="${data.tanggal_sk || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Instansi:</label><input type="text" value="${data.instansi || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Unit Kerja:</label><input type="text" value="${data.unit_kerja || ''}" class="form-control" disabled></div>
                </div>
            </div>`;
        }

        function createPangkatCard(data) {
            return `<div class="data-card mb-3 position-relative">
                ${createCardActions('pangkat', data.id)}
                <div class="form-grid">
                    <div class="form-group"><label>Gol. Pangkat:</label><input type="text" value="${data.gol_pangkat || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Nomor SK:</label><input type="text" value="${data.nomor_sk || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tanggal SK:</label><input type="text" value="${data.tanggal_sk || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>TMT Golongan:</label><input type="text" value="${data.tmt_golongan || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>No. BKN:</label><input type="text" value="${data.no_bkn || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tanggal BKN:</label><input type="text" value="${data.tanggal_bkn || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Pejabat Penetapan:</label><input type="text" value="${data.pejabat_penetapan || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Gaji Pokok:</label><input type="text" value="${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.gaji_pokok || 0)}" class="form-control" disabled></div>
                </div>
            </div>`;
        }

        function createOrganisasiCard(data) {
            return `<div class="data-card mb-3 position-relative">
                ${createCardActions('organisasi', data.id)}
                <div class="form-grid">
                    <div class="form-group"><label>Nama Organisasi:</label><input type="text" value="${data.nama_organisasi || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Unit/Divisi/Bagian:</label><input type="text" value="${data.unit_divisi_bagian || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tanggal Mulai:</label><input type="text" value="${data.tanggal_mulai || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tanggal Selesai:</label><input type="text" value="${data.tanggal_selesai || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Jabatan Organisasi:</label><input type="text" value="${data.jabatan_organisasi || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Nama Pimpinan:</label><input type="text" value="${data.nama_pimpinan || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tempat Organisasi:</label><input type="text" value="${data.tempat_organisasi || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Mengikuti Semasa:</label><input type="text" value="${data.mengikuti_semasa || ''}" class="form-control" disabled></div>
                </div>
            </div>`;
        }

        function createPendidikanCard(data) {
            return `<div class="data-card mb-3 position-relative">
                ${createCardActions('pendidikan', data.id)}
                <div class="form-grid">
                    <div class="form-group"><label>Jenjang Pendidikan:</label><input type="text" value="${data.jenjang_pendidikan || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Nama Sekolah:</label><input type="text" value="${data.nama_sekolah || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Lokasi Sekolah:</label><input type="text" value="${data.lokasi_sekolah || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Nama Pimpinan:</label><input type="text" value="${data.nama_pimpinan || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tahun Lulus:</label><input type="text" value="${data.tahun_lulus || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tanggal Lulus:</label><input type="text" value="${data.tanggal_lulus || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>No Ijazah:</label><input type="text" value="${data.no_ijazah || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Jurusan:</label><input type="text" value="${data.jurusan || ''}" class="form-control" disabled></div>
                </div>
            </div>`;
        }

        function createDiklatCard(data) {
            return `<div class="data-card mb-3 position-relative">
                ${createCardActions('diklat', data.id)}
                <div class="form-grid">
                    <div class="form-group"><label>Jenis Pendidikan:</label><input type="text" value="${data.jenis_pendidikan || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Nama Diklat:</label><input type="text" value="${data.nama_diklat || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tempat Diklat:</label><input type="text" value="${data.tempat_diklat || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Jumlah Jam:</label><input type="text" value="${data.jumlah_jam || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tanggal Mulai:</label><input type="text" value="${data.tanggal_mulai || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tanggal Selesai:</label><input type="text" value="${data.tanggal_selesai || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Penyelenggara:</label><input type="text" value="${data.penyelenggara || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>No. Sertifikat:</label><input type="text" value="${data.no_sertifikat || ''}" class="form-control" disabled></div>
                </div>
            </div>`;
        }

        function createPenghargaanCard(data) {
            return `<div class="data-card mb-3 position-relative">
                ${createCardActions('penghargaan', data.id)}
                <div class="form-grid">
                    <div class="form-group"><label>Nama Penghargaan:</label><input type="text" value="${data.nama_penghargaan || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Instansi Pemberi:</label><input type="text" value="${data.instansi_pemberi || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>Tanggal Penghargaan:</label><input type="text" value="${data.tanggal_penghargaan || ''}" class="form-control" disabled></div>
                    <div class="form-group"><label>No. Sertifikat:</label><input type="text" value="${data.no_sertifikat || ''}" class="form-control" disabled></div>
                </div>
            </div>`;
        }

        // --- FUNGSI SETELAH PEGAWAI DIPILIH ---
        function showRiwayatContent(pegawai) {
            initialMessage.style.display = 'none';
            pegawaiInfoCard.style.display = 'block';
            riwayatContent.style.display = 'block';
            namaPegawaiTerpilihSpan.textContent = pegawai.nama_lengkap;
            loadAllRiwayat(pegawai.id);
        }

        // --- FUNGSI PENCARIAN ---
        function displaySearchResults(results) {
            modalBody.innerHTML = '';
            if (results.length === 0) {
                modalBody.innerHTML = '<p class="text-center text-muted">Pegawai tidak ditemukan.</p>';
            } else {
                results.forEach(user => {
                    const item = document.createElement('div');
                    item.className = 'result-item';
                    item.innerHTML = `<strong>${user.nama_lengkap}</strong><div>NIK: ${user.nik} | NIP: ${user.nip}</div>`;
                    item.addEventListener('click', () => {
                        pegawaiTerpilih = user;
                        showRiwayatContent(user);
                        searchResultsModal.hide();
                    });
                    modalBody.appendChild(item);
                });
            }
            searchResultsModal.show();
        }

        // =================================================================
        // LANGKAH 3: KUMPULKAN SEMUA EVENT LISTENERS DI BAWAH
        // =================================================================

        // --- Event Listener untuk Pencarian ---
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                fetch(`assets/api/search_pegawai.php?term=${query}`)
                    .then(response => response.json())
                    .then(data => displaySearchResults(data))
                    .catch(error => console.error('Error saat mencari:', error));
            }
        });

        // --- Event Listener untuk Modal Tambah ---
        if (btnTambahRiwayat) {
            btnTambahRiwayat.addEventListener('click', () => {
                formTambahRiwayat.reset();
                jenisRiwayatSelect.value = "";
                formDinamisContainer.innerHTML = '<p class="text-muted text-center">Pilih jenis riwayat di atas untuk memulai.</p>';
                tambahRiwayatModalLabel.textContent = 'Tambah Riwayat Baru';

                const pegawaiIdInput = formTambahRiwayat.querySelector('input[name="pegawai_id"]');
                if (pegawaiTerpilih) {
                    pegawaiIdInput.value = pegawaiTerpilih.id;
                }
            });
        }

        if (jenisRiwayatSelect) {
            jenisRiwayatSelect.addEventListener('change', function () {
                const selectedForm = this.value;
                formDinamisContainer.innerHTML = '';

                if (formTemplates[selectedForm]) {
                    formDinamisContainer.innerHTML = formTemplates[selectedForm];
                    tambahRiwayatModalLabel.textContent = `Tambah Riwayat: ${this.options[this.selectedIndex].text}`;
                } else {
                    formDinamisContainer.innerHTML = '<p class="text-muted text-center">Pilih jenis riwayat di atas untuk memulai.</p>';
                    tambahRiwayatModalLabel.textContent = 'Tambah Riwayat Baru';
                }
            });
        }

        if (formTambahRiwayat) {
            formTambahRiwayat.addEventListener('submit', function (event) {
                event.preventDefault();
                const submitButton = tambahRiwayatModal._element.querySelector('button[type="submit"]');

                // Validasi Frontend
                if (!pegawaiTerpilih || !jenisRiwayatSelect.value) {
                    alert('Silakan pilih pegawai dan jenis riwayat terlebih dahulu.');
                    return;
                }

                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';

                // =============================================================
                // BAGIAN YANG DIPERBAIKI: Mengumpulkan data secara eksplisit
                // =============================================================
                const formData = new FormData();

                // 1. Tambahkan ID Pegawai dan Jenis Riwayat secara manual
                formData.append('pegawai_id', pegawaiTerpilih.id);
                formData.append('jenis_riwayat', jenisRiwayatSelect.value);

                // 2. Tambahkan semua data dari form dinamis
                const dynamicFormFields = formDinamisContainer.querySelectorAll('input, select, textarea');
                dynamicFormFields.forEach(field => {
                    if (field.name && field.value) {
                        formData.append(field.name, field.value);
                    }
                });
                // =============================================================

                // Kirim data ke API (bagian ini tidak berubah, sudah benar)
                fetch('assets/api/add_riwayat.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert(data.message);
                            tambahRiwayatModal.hide();
                            loadAllRiwayat(pegawaiTerpilih.id);
                        } else {
                            alert('Error: ' + data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Terjadi kesalahan pada koneksi. Silakan cek konsol browser.');
                    })
                    .finally(() => {
                        submitButton.disabled = false;
                        submitButton.innerHTML = 'Simpan';
                    });
            });
        }

        // --- Event Listener untuk Tombol Edit dan Hapus di dalam Kartu ---
        riwayatContent.addEventListener('click', function (e) {
            const editButton = e.target.closest('.btn-edit');
            const deleteButton = e.target.closest('.btn-delete');

            // --- Event Handler untuk Tombol Edit ---
            if (editButton) {
                const riwayatId = editButton.dataset.id;
                const jenisRiwayat = editButton.dataset.jenis;

                fetch(`assets/api/get_riwayat_detail.php?id=${riwayatId}&jenis=${jenisRiwayat}`)
                    .then(res => res.json())
                    .then(res => {
                        if (res.success) {
                            const template = formTemplates[jenisRiwayat];
                            formEditContainer.innerHTML = template;

                            for (const key in res.data) {
                                const field = formEditContainer.querySelector(`[name="${key}"]`);
                                if (field) {
                                    field.value = res.data[key];
                                }
                            }

                            formEditRiwayat.querySelector('[name="riwayat_id"]').value = riwayatId;
                            formEditRiwayat.querySelector('[name="jenis_riwayat"]').value = jenisRiwayat;

                            editRiwayatModal.show();
                        } else {
                            alert(res.message);
                        }
                    });
            }

            // --- Event Handler untuk Tombol Hapus ---
            if (deleteButton) {
                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    const riwayatId = deleteButton.dataset.id;
                    const jenisRiwayat = deleteButton.dataset.jenis;

                    const formData = new FormData();
                    formData.append('id', riwayatId);
                    formData.append('jenis', jenisRiwayat);

                    fetch('assets/api/delete_riwayat.php', {
                        method: 'POST',
                        body: formData
                    })
                        .then(res => res.json())
                        .then(res => {
                            alert(res.message);
                            if (res.success) {
                                loadAllRiwayat(pegawaiTerpilih.id); // Refresh data
                            }
                        });
                }
            }
        });

        // --- Event Listener untuk Submit Form Edit ---
        // --- Event Listener untuk Submit Form Edit ---
        if (formEditRiwayat) {
            formEditRiwayat.addEventListener('submit', function (e) {
                e.preventDefault();

                // Cara yang benar untuk menemukan tombol di dalam modal
                const submitButton = editRiwayatModal._element.querySelector('button[type="submit"]');

                // Validasi sederhana untuk memastikan tombol ditemukan
                if (!submitButton) {
                    console.error("Tombol 'Update Data' tidak ditemukan di dalam modal edit.");
                    return;
                }

                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Updating...';

                // Mengumpulkan data secara manual untuk memastikan semuanya terkirim
                const formData = new FormData();

                // Ambil data dari input tersembunyi (riwayat_id, jenis_riwayat)
                const hiddenFields = this.querySelectorAll('input[type="hidden"]');
                hiddenFields.forEach(field => {
                    formData.append(field.name, field.value);
                });

                // Ambil data dari form yang muncul secara dinamis
                const dynamicFormFields = formEditContainer.querySelectorAll('input, select, textarea');
                dynamicFormFields.forEach(field => {
                    if (field.name) {
                        formData.append(field.name, field.value);
                    }
                });

                fetch('assets/api/update_riwayat.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(res => res.json())
                    .then(res => {
                        alert(res.message);
                        if (res.success) {
                            editRiwayatModal.hide();
                            loadAllRiwayat(pegawaiTerpilih.id); // Refresh data
                        }
                    })
                    .finally(() => {
                        submitButton.disabled = false;
                        submitButton.innerHTML = 'Update Data';
                    });
            });
        }

        // --- Event Listener untuk Navigasi Tab ---
        const tabButtons = document.querySelectorAll('.personal-data-tabs .tab-button');
        const tabPanes = document.querySelectorAll('.tab-content-wrapper .tab-pane');
        tabButtons.forEach(button => {
            button.addEventListener('click', function () {
                const targetTab = this.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                this.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }
});