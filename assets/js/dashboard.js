document.addEventListener('DOMContentLoaded', function () {

    // --- Bagian 1: Logika Umum ---
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

    // --- Bagian 2: Logika Khusus Halaman Data Personal ---
    const dataPersonalPageIdentifier = document.querySelector('.personal-data-tabs');
    if (dataPersonalPageIdentifier) {

        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const historyDropdown = document.getElementById('search-history-dropdown');
        const modalElement = document.getElementById('searchResultsModal');
        const searchResultsModal = new bootstrap.Modal(modalElement);
        const modalBody = document.getElementById('modal-results-body');
        const btnEditData = document.getElementById('btn-edit-data');

        let currentEmployeeId = null;

        function fetchAndDisplayPersonalData(employeeId) {
            currentEmployeeId = employeeId;

            if (btnEditData) {
                btnEditData.style.display = 'none';
            }

            fetch(`assets/api/get_data_personal.php?id=${employeeId}`)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    console.log("Data lengkap dari server:", data);

                    if (!data) {
                        console.error('Data kosong untuk ID:', employeeId);
                        alert('Gagal memuat data pegawai.');
                        return;
                    }

                    if (btnEditData) {
                        btnEditData.style.display = 'inline-block';
                    }

                    const fillValue = (id, value) => {
                        const el = document.getElementById(id);
                        if (el) el.value = value || '';
                    };

                    // --- Mengisi tab Informasi Dasar ---
                    fillValue('nama', data.nama_lengkap);
                    fillValue('nik', data.nik);
                    fillValue('nip', data.nip);
                    fillValue('kartu-pegawai', data.kartu_pegawai);
                    fillValue('jenis-kelamin', data.jenis_kelamin);
                    fillValue('golongan-darah', data.golongan_darah);
                    fillValue('tempat-lahir', data.tempat_lahir);
                    fillValue('tanggal-lahir', data.tanggal_lahir);
                    fillValue('agama', data.agama);
                    fillValue('status-pernikahan', data.status_pernikahan);

                    // --- Mengisi tab Informasi Fisik ---
                    fillValue('tinggi-badan', data.tinggi_badan);
                    fillValue('berat-badan', data.berat_badan);
                    fillValue('rambut', data.rambut);
                    fillValue('bentuk-muka', data.bentuk_muka);
                    fillValue('kulit', data.kulit);
                    fillValue('ciri-khas', data.ciri_khas);
                    fillValue('cacat-tubuh', data.cacat_tubuh);
                    fillValue('hobi', data.hobi);

                    // --- Mengisi tab Informasi Kontak ---
                    fillValue('email', data.email);
                    fillValue('no-hp', data.no_hp);
                    fillValue('alamat', data.alamat);
                    fillValue('kecamatan', data.kecamatan);
                    fillValue('kelurahan', data.kelurahan);
                    fillValue('kabupaten', data.kabupaten);
                    fillValue('provinsi', data.provinsi);
                    fillValue('kode-pos', data.kode_pos);
                    fillValue('no-taspen', data.no_taspen);
                    fillValue('no-bpjs', data.no_bpjs);
                    fillValue('npwp', data.npwp);
                    fillValue('no-karis-karsu', data.no_karis_karsu);

                    // --- Mengisi tab Informasi Tambahan ---
                    fillValue('kampus-terakhir', data.kampus_terakhir);
                    fillValue('jenjang-pendidikan', data.jenjang_pendidikan);
                    fillValue('jurusan', data.jurusan);
                    fillValue('tahun-lulus', data.tahun_lulus);
                    fillValue('gelar-depan', data.gelar_depan);
                    fillValue('gelar-belakang', data.gelar_belakang);
                    fillValue('status-pegawai', data.status_pegawai);
                    fillValue('golongan-terakhir', data.golongan_terakhir);
                    fillValue('tmt-cpns', data.tmt_cpns);
                    fillValue('tmt-pns', data.tmt_pns);

                    // --- Mengisi Data Orang Tua ---
                    const clearOrtuFields = () => {
                        const statuses = ['bapak-kandung', 'ibu-kandung'];
                        const fields = ['nama', 'nik', 'tempat-lahir', 'tanggal-lahir', 'pekerjaan'];
                        statuses.forEach(status => {
                            fields.forEach(field => {
                                fillValue(`${field}-${status}`, '');
                            });
                        });
                    };
                    clearOrtuFields();
                    if (data.orang_tua) {
                        const bapak = data.orang_tua['bapak kandung'];
                        if (bapak) {
                            fillValue('nama-bapak-kandung', bapak.nama_orang_tua);
                            fillValue('nik-bapak-kandung', bapak.nik);
                            fillValue('tempat-lahir-bapak-kandung', bapak.tempat_lahir);
                            fillValue('tanggal-lahir-bapak-kandung', bapak.tanggal_lahir);
                            fillValue('pekerjaan-bapak-kandung', bapak.pekerjaan);
                        }
                        const ibu = data.orang_tua['ibu kandung'];
                        if (ibu) {
                            fillValue('nama-ibu-kandung', ibu.nama_orang_tua);
                            fillValue('nik-ibu-kandung', ibu.nik);
                            fillValue('tempat-lahir-ibu-kandung', ibu.tempat_lahir);
                            fillValue('tanggal-lahir-ibu-kandung', ibu.tanggal_lahir);
                            fillValue('pekerjaan-ibu-kandung', ibu.pekerjaan);
                        }
                    }

                    // --- Mengisi Data Pasangan ---
                    const clearPasanganFields = () => {
                        const fields = ['nama-pasangan', 'nik-pasangan', 'status-pasangan', 'tempat-lahir-pasangan', 'tanggal-lahir-pasangan', 'status-pernikahan-pasangan', 'tanggal-pernikahan', 'akta-pernikahan', 'tanggal-perceraian', 'akta-perceraian', 'pekerjaan-pasangan'];
                        fields.forEach(field => fillValue(field, ''));
                    };
                    clearPasanganFields();
                    if (data.pasangan && data.pasangan.length > 0) {
                        const pasangan = data.pasangan[0];
                        fillValue('nama-pasangan', pasangan.nama_pasangan);
                        fillValue('nik-pasangan', pasangan.nik);
                        fillValue('status-pasangan', pasangan.status_pasangan);
                        fillValue('tempat-lahir-pasangan', pasangan.tempat_lahir);
                        fillValue('tanggal-lahir-pasangan', pasangan.tanggal_lahir);
                        fillValue('status-pernikahan-pasangan', pasangan.status_pernikahan);
                        fillValue('tanggal-pernikahan', pasangan.tanggal_pernikahan);
                        fillValue('akta-pernikahan', pasangan.akta_pernikahan);
                        fillValue('tanggal-perceraian', pasangan.tanggal_perceraian);
                        fillValue('akta-perceraian', pasangan.akta_perceraian);
                        fillValue('pekerjaan-pasangan', pasangan.pekerjaan);
                    }

                    // --- Mengisi Data Anak ---
                    const anakListContainer = document.getElementById('data-anak-list');
                    const noDataAnakMessage = document.getElementById('no-data-anak');
                    anakListContainer.innerHTML = '';
                    if (data.anak && data.anak.length > 0) {
                        noDataAnakMessage.style.display = 'none';
                        data.anak.forEach((anak, index) => {
                            const cardHTML = `
                        <div class="data-card">
                            <h5 class="data-card-title">Anak ke-${index + 1} (${anak.status_anak || 'Status tidak ada'})</h5>
                            <div class="form-grid">
                                <div class="form-group"><label>Nama Anak:</label><input type="text" value="${anak.nama_anak || ''}" disabled></div>
                                <div class="form-group"><label>NIK:</label><input type="text" value="${anak.nik || ''}" disabled></div>
                                <div class="form-group"><label>Jenis Kelamin:</label><input type="text" value="${anak.jenis_kelamin || ''}" disabled></div>
                                <div class="form-group"><label>Tempat Lahir:</label><input type="text" value="${anak.tempat_lahir || ''}" disabled></div>
                                <div class="form-group"><label>Tanggal Lahir:</label><input type="text" value="${anak.tanggal_lahir || ''}" disabled></div>
                                <div class="form-group"><label>Akta Kelahiran:</label><input type="text" value="${anak.akta_kelahiran || ''}" disabled></div>
                                <div class="form-group"><label>Nama Bapak/Ibu dari Anak:</label><input type="text" value="${anak.nama_ortu_pasangan || ''}" disabled></div>
                                <div class="form-group"><label>Jenjang Pendidikan:</label><input type="text" value="${anak.jenjang_pendidikan || ''}" disabled></div>
                                <div class="form-group"><label>Pekerjaan:</label><input type="text" value="${anak.pekerjaan || ''}" disabled></div>
                            </div>
                        </div>
                    `;
                            anakListContainer.innerHTML += cardHTML;
                        });
                    } else {
                        noDataAnakMessage.style.display = 'block';
                    }

                    // --- Mengisi Data Saudara ---
                    const saudaraListContainer = document.getElementById('data-saudara-list');
                    const noDataSaudaraMessage = document.getElementById('no-data-saudara');
                    saudaraListContainer.innerHTML = '';
                    if (data.saudara && data.saudara.length > 0) {
                        noDataSaudaraMessage.style.display = 'none';
                        data.saudara.forEach((saudara, index) => {
                            const cardHTML = `
                        <div class="data-card">
                            <h5 class="data-card-title">${saudara.status_saudara || 'Status tidak ada'} (${saudara.keterangan || 'Keterangan tidak ada'})</h5>
                            <div class="form-grid">
                                <div class="form-group"><label>Nama Saudara:</label><input type="text" value="${saudara.nama_saudara || ''}" disabled></div>
                                <div class="form-group"><label>NIK:</label><input type="text" value="${saudara.nik || ''}" disabled></div>
                                <div class="form-group"><label>Jenis Kelamin:</label><input type="text" value="${saudara.jenis_kelamin || ''}" disabled></div>
                                <div class="form-group"><label>Tempat Lahir:</label><input type="text" value="${saudara.tempat_lahir || ''}" disabled></div>
                                <div class="form-group"><label>Tanggal Lahir:</label><input type="text" value="${saudara.tanggal_lahir || ''}" disabled></div>
                                <div class="form-group"><label>Pekerjaan:</label><input type="text" value="${saudara.pekerjaan || ''}" disabled></div>
                            </div>
                        </div>
                    `;
                            saudaraListContainer.innerHTML += cardHTML;
                        });
                    } else {
                        noDataSaudaraMessage.style.display = 'block';
                    }

                })
                .catch(error => {
                    console.error('Terjadi error saat fetch:', error);
                    alert('Terjadi kesalahan saat mengambil data.');
                });
        }

        function displaySearchResults(results) {
            modalBody.innerHTML = '';
            if (results.length === 0) {
                modalBody.innerHTML = '<p class="text-center text-muted">Data tidak ditemukan.</p>';
            } else {
                results.forEach(user => {
                    const item = document.createElement('div');
                    item.className = 'result-item';
                    item.setAttribute('data-id', user.id);
                    item.setAttribute('data-nama', user.nama_lengkap);
                    item.innerHTML = `<strong>${user.nama_lengkap}</strong><div class="result-item-details">NIK: ${user.nik} | NIP: ${user.nip}</div>`;

                    item.addEventListener('click', function () {
                        const selectedId = this.getAttribute('data-id');
                        const selectedName = this.getAttribute('data-nama');
                        fetchAndDisplayPersonalData(selectedId);
                        saveSearchHistory(selectedName);
                        loadSearchHistory();
                        searchResultsModal.hide();
                    });
                    modalBody.appendChild(item);
                });
            }
            searchResultsModal.show();
        }

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

        function loadSearchHistory() {
            const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
            historyDropdown.innerHTML = '<option value="">-- Pilih Riwayat --</option>';
            history.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                historyDropdown.appendChild(option);
            });
        }

        function saveSearchHistory(query) {
            let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
            history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
            history.unshift(query);
            history = history.slice(0, 10);
            localStorage.setItem('searchHistory', JSON.stringify(history));
        }

        historyDropdown.addEventListener('change', function () {
            if (this.value) {
                searchInput.value = this.value;
                searchForm.dispatchEvent(new Event('submit'));
            }
        });

        loadSearchHistory();

        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabButtons.forEach(button => {
            button.addEventListener('click', function () {
                const targetTab = this.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                this.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });

        // ✅ Pindahkan event listener btnEditData ke sini supaya tetap dalam scope
        if (btnEditData) {
            btnEditData.addEventListener('click', function (event) {
                event.preventDefault();
                if (currentEmployeeId) {
                    window.location.href = `edit-data.html?id=${currentEmployeeId}`;
                } else {
                    alert('Silakan cari dan pilih pegawai terlebih dahulu.');
                }
            });
        }
    }
});