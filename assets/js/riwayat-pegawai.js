document.addEventListener('DOMContentLoaded', function () {

    // --- Bagian 1: Logika Umum (Sidebar, Link Aktif) ---
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

        let pegawaiTerpilih = null;

        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchResultsModal = new bootstrap.Modal(document.getElementById('searchResultsModal'));
        const modalBody = document.querySelector('#searchResultsModal .modal-body');

        const pegawaiInfoCard = document.getElementById('pegawai-info-card');
        const namaPegawaiTerpilihSpan = document.getElementById('nama-pegawai-terpilih');
        const riwayatContent = document.getElementById('riwayat-content');
        const initialMessage = document.getElementById('initial-message');

        const btnTambahRiwayat = document.getElementById('btn-tambah-riwayat');
        const tambahRiwayatModal = new bootstrap.Modal(document.getElementById('tambahRiwayatModal'));
        const formTambahRiwayat = document.getElementById('form-tambah-riwayat');
        const jenisRiwayatSelect = document.getElementById('jenis-riwayat-select');
        const formDinamisContainer = document.getElementById('form-dinamis-container');
        const tambahRiwayatModalLabel = document.getElementById('tambahRiwayatModalLabel'); // Pastikan modal Anda punya ID ini di judulnya

        // --- [BARU] TEMPLATE HTML UNTUK SETIAP FORM ---
        // --- TEMPLATE HTML UNTUK SETIAP FORM ---
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


        // --- FUNGSI UTAMA UNTUK MEMUAT DATA DARI BACKEND ---
        function loadAllRiwayat(pegawaiId) {
            riwayatContent.querySelectorAll('.tab-pane > div').forEach(container => {
                container.innerHTML = '<p class="text-center text-muted">Memuat...</p>';
            });

            fetch(`assets/api/get_riwayat.php?id=${pegawaiId}`)
                .then(response => response.json())
                .then(data => {
                    tampilkanRiwayat('bahasa', data.bahasa, createBahasaCard);
                    tampilkanRiwayat('jabatan', data.jabatan, createJabatanCard);
                    tampilkanRiwayat('pangkat', data.pangkat, createPangkatCard);
                    tampilkanRiwayat('organisasi', data.organisasi, createOrganisasiCard);
                    tampilkanRiwayat('pendidikan', data.pendidikan, createPendidikanCard);
                    tampilkanRiwayat('diklat', data.diklat, createDiklatCard);
                    tampilkanRiwayat('penghargaan', data.penghargaan, createPenghargaanCard);
                })
                .catch(error => console.error('Error:', error));
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
        function createBahasaCard(data) {
            return `<div class="data-card mb-3"><div class="form-grid">
                <div class="form-group"><label>Jenis Bahasa:</label><input type="text" value="${data.jenis_bahasa || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Jenis Sertifikat:</label><input type="text" value="${data.jenis_sertifikat || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tanggal:</label><input type="text" value="${data.tanggal || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Lembaga:</label><input type="text" value="${data.lembaga_sertifikat || ''}" class="form-control" disabled></div>
            </div></div>`;
        }

        function createJabatanCard(data) {
            return `<div class="data-card mb-3"><div class="form-grid">
                <div class="form-group"><label>Jenis Jabatan:</label><input type="text" value="${data.jenis_jabatan || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Nama Jabatan:</label><input type="text" value="${data.nama_jabatan || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>No. SK:</label><input type="text" value="${data.no_sk || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Pejabat Pengangkat:</label><input type="text" value="${data.pejabat_pengangkat || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>TMT Jabatan:</label><input type="text" value="${data.tmt_jabatan || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tanggal SK:</label><input type="text" value="${data.tanggal_sk || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Instansi:</label><input type="text" value="${data.instansi || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Unit Kerja:</label><input type="text" value="${data.unit_kerja || ''}" class="form-control" disabled></div>
            </div></div>`;
        }

        function createPangkatCard(data) {
            return `<div class="data-card mb-3"><div class="form-grid">
                <div class="form-group"><label>Gol. Pangkat:</label><input type="text" value="${data.gol_pangkat || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Nomor SK:</label><input type="text" value="${data.nomor_sk || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tanggal SK:</label><input type="text" value="${data.tanggal_sk || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>TMT Golongan:</label><input type="text" value="${data.tmt_golongan || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>No. BKN:</label><input type="text" value="${data.no_bkn || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tanggal BKN:</label><input type="text" value="${data.tanggal_bkn || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Pejabat Penetapan:</label><input type="text" value="${data.pejabat_penetapan || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Gaji Pokok:</label><input type="text" value="${data.gaji_pokok || ''}" class="form-control" disabled></div>
            </div></div>`;
        }

        function createOrganisasiCard(data) {
            return `<div class="data-card mb-3"><div class="form-grid">
                <div class="form-group"><label>Nama Organisasi:</label><input type="text" value="${data.nama_organisasi || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Unit/Divisi/Bagian:</label><input type="text" value="${data.unit_divisi_bagian || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tanggal Mulai:</label><input type="text" value="${data.tanggal_mulai || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tanggal Selesai:</label><input type="text" value="${data.tanggal_selesai || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Jabatan Organisasi:</label><input type="text" value="${data.jabatan_organisasi || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Nama Pimpinan:</label><input type="text" value="${data.nama_pimpinan || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tempat Organisasi:</label><input type="text" value="${data.tempat_organisasi || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Mengikuti Semasa:</label><input type="text" value="${data.mengikuti_semasa || ''}" class="form-control" disabled></div>
            </div></div>`;
        }

        function createPendidikanCard(data) {
            return `<div class="data-card mb-3"><div class="form-grid">
                <div class="form-group"><label>Jenjang Pendidikan:</label><input type="text" value="${data.jenjang_pendidikan || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Nama Sekolah:</label><input type="text" value="${data.nama_sekolah || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Lokasi Sekolah:</label><input type="text" value="${data.lokasi_sekolah || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Nama Pimpinan:</label><input type="text" value="${data.nama_pimpinan || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tahun Lulus:</label><input type="text" value="${data.tahun_lulus || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tanggal Lulus:</label><input type="text" value="${data.tanggal_lulus || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>No Ijazah:</label><input type="text" value="${data.no_ijazah || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Jurusan:</label><input type="text" value="${data.jurusan || ''}" class="form-control" disabled></div>
            </div></div>`;
        }

        function createDiklatCard(data) {
            return `<div class="data-card mb-3"><div class="form-grid">
                <div class="form-group"><label>Jenis Pendidikan:</label><input type="text" value="${data.jenis_pendidikan || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Nama Diklat:</label><input type="text" value="${data.nama_diklat || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tempat Diklat:</label><input type="text" value="${data.tempat_diklat || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Jumlah Jam:</label><input type="text" value="${data.jumlah_jam || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tanggal Mulai:</label><input type="text" value="${data.tanggal_mulai || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tanggal Selesai:</label><input type="text" value="${data.tanggal_selesai || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Penyelenggara:</label><input type="text" value="${data.penyelenggara || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>No. Sertifikat:</label><input type="text" value="${data.no_sertifikat || ''}" class="form-control" disabled></div>
            </div></div>`;
        }

        function createPenghargaanCard(data) {
            return `<div class="data-card mb-3"><div class="form-grid">
                <div class="form-group"><label>Nama Penghargaan:</label><input type="text" value="${data.nama_penghargaan || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Instansi Pemberi:</label><input type="text" value="${data.instansi_pemberi || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>Tanggal Penghargaan:</label><input type="text" value="${data.tanggal_penghargaan || ''}" class="form-control" disabled></div>
                <div class="form-group"><label>No. Sertifikat:</label><input type="text" value="${data.no_sertifikat || ''}" class="form-control" disabled></div>
            </div></div>`;
        }

        // --- FUNGSI SETELAH PEGAWAI DIPILIH ---
        function showRiwayatContent(pegawai) {
            initialMessage.style.display = 'none';
            pegawaiInfoCard.style.display = 'block';
            riwayatContent.style.display = 'block';
            namaPegawaiTerpilihSpan.textContent = pegawai.nama_lengkap;
            loadAllRiwayat(pegawai.id);
        }

        // --- LOGIKA PENCARIAN ---
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

        // --- LOGIKA TAB ---
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