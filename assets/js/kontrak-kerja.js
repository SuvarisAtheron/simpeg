document.addEventListener('DOMContentLoaded', function () {

    const modalElement = document.getElementById('formModal');
    const modal = new bootstrap.Modal(modalElement);
    const form = document.getElementById('main-form');

    const tabelKontrakBody = document.getElementById('tabel-kontrak-body');
    const tabelResignBody = document.getElementById('tabel-resign-body');

    const searchInputs = document.querySelectorAll('.search-table');

    // Elemen Form
    const pegawaiIdInput = form.querySelector('input[name="pegawai_id"]');
    const namaInput = document.getElementById('nama-pegawai-search');
    const searchResultsContainer = document.getElementById('search-results-container');
    const nipInput = document.getElementById('nip-display');
    const golonganInput = document.getElementById('golongan-display');
    const jenisFormSelect = document.getElementById('jenis-form-select');
    const formDinamisContainer = document.getElementById('form-dinamis-container');

    const formTemplates = {
        'sign_kontrak': `
            <div class="row g-3">
                <div class="col-md-6"><label class="form-label">Jabatan</label><input type="text" name="jabatan" class="form-control"></div>
                <div class="col-md-6"><label class="form-label">Unit Kerja Sebelumnya</label><input type="text" name="unit_kerja_sebelumnya" class="form-control"></div>
                <div class="col-md-6"><label class="form-label">Tanggal Sign Kontrak</label><input type="date" name="tanggal_sign" class="form-control" required></div>
                <div class="col-md-6"><label class="form-label">No. SK Kontrak</label><input type="text" name="no_sk_kontrak" class="form-control" required></div>
                <div class="col-12"><label class="form-label">Keterangan Tambahan</label><textarea name="keterangan" class="form-control" rows="2"></textarea></div>
                <div class="col-12 text-center mt-3">
                    <label for="lampiran-kontrak" class="btn btn-outline-primary"><i class="fas fa-paperclip"></i> Pilih Lampiran</label>
                    <input type="file" name="path_lampiran" id="lampiran-kontrak" class="d-none">
                    <p class="text-muted mt-2 small file-name-display"></p>
                </div>
            </div>`,
        'resign_kontrak': `
             <div class="row g-3">
                <div class="col-md-6"><label class="form-label">Jabatan</label><input type="text" name="jabatan" class="form-control"></div>
                <div class="col-md-6"><label class="form-label">Unit Kerja Sebelumnya</label><input type="text" name="unit_kerja_sebelumnya" class="form-control"></div>
                <div class="col-md-6"><label class="form-label">Tanggal Resign</label><input type="date" name="tanggal_resign" class="form-control" required></div>
                <div class="col-md-6"><label class="form-label">No. SK Resign</label><input type="text" name="no_sk_resign" class="form-control"></div>
                <div class="col-12"><label class="form-label">Alasan Resign</label><textarea name="alasan" class="form-control" rows="2"></textarea></div>
                <div class="col-12 text-center mt-3">
                    <label for="lampiran-resign" class="btn btn-outline-primary"><i class="fas fa-paperclip"></i> Lampirkan Surat Resign</label>
                    <input type="file" name="path_lampiran" id="lampiran-resign" class="d-none">
                    <p class="text-muted mt-2 small file-name-display"></p>
                </div>
            </div>`
    };

    function loadAllData() {
        fetch('assets/api/get_list_kontrak_resign.php')
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    tabelKontrakBody.innerHTML = res.kontrak.map((item, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${item.nama_lengkap}<br><small class="text-muted">${item.nip}</small></td>
                            <td>${item.no_sk_kontrak}</td>
                            <td>${item.jabatan}</td>
                            <td>${item.tanggal_sign}</td>
                            <td>
                                ${item.path_lampiran ? `<a href="${item.path_lampiran}" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i></a>` : ''}
                                <button class="btn btn-sm btn-danger btn-delete" data-id="${item.id}" data-type="kontrak"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>`).join('') || `<tr><td colspan="6" class="text-center">Belum ada data.</td></tr>`;

                    tabelResignBody.innerHTML = res.resign.map((item, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${item.nama_lengkap}<br><small class="text-muted">${item.nip}</small></td>
                            <td>${item.jabatan}</td>
                            <td>${item.tanggal_resign}</td>
                            <td>${item.alasan}</td>
                            <td>
                                ${item.path_lampiran ? `<a href="${item.path_lampiran}" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i></a>` : ''}
                                <button class="btn btn-sm btn-danger btn-delete" data-id="${item.id}" data-type="resign"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>`).join('') || `<tr><td colspan="6" class="text-center">Belum ada data.</td></tr>`;
                }
            });
    }

    modalElement.addEventListener('shown.bs.modal', () => {
        form.reset();
        searchResultsContainer.style.display = 'none';
        formDinamisContainer.innerHTML = '<p class="text-center text-muted">Pilih jenis formulir di atas.</p>';
    });

    namaInput.addEventListener('input', function () {
        const searchTerm = this.value;
        if (searchTerm.length < 2) { searchResultsContainer.style.display = 'none'; return; }
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

    searchResultsContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('search-result-item')) {
            const pId = e.target.dataset.id;
            fetch(`assets/api/get_data_personal.php?id=${pId}`).then(r => r.json()).then(data => {
                if (data) {
                    pegawaiIdInput.value = data.id;
                    namaInput.value = data.nama_lengkap || '';
                    nipInput.value = data.nip || '';
                    golonganInput.value = data.golongan_terakhir || '';
                }
            });
            searchResultsContainer.style.display = 'none';
        }
    });

    jenisFormSelect.addEventListener('change', () => {
        formDinamisContainer.innerHTML = formTemplates[jenisFormSelect.value] || '<p class="text-center text-muted">Pilih jenis formulir di atas.</p>';
    });

    // Ganti blok ini di kontrak-kerja.js
    formDinamisContainer.addEventListener('change', (e) => {
        // Pastikan targetnya adalah input file
        if (e.target.matches('input[type="file"]')) {
            // Cari elemen display nama file di dalam kontainer terdekatnya
            const container = e.target.closest('div');
            const display = container.querySelector('.file-name-display');

            if (display) {
                display.textContent = e.target.files.length > 0 ? `File: ${e.target.files[0].name}` : '';
            }
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const jenisForm = jenisFormSelect.value;
        if (!jenisForm) { alert('Pilih jenis formulir!'); return; }

        const apiUrl = jenisForm === 'sign_kontrak' ? 'assets/api/add_kontrak.php' : 'assets/api/add_resign.php';

        const submitButton = modalElement.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Menyimpan...`;

        fetch(apiUrl, { method: 'POST', body: new FormData(this) })
            .then(res => res.json())
            .then(res => {
                alert(res.message);
                if (res.success) {
                    modal.hide();
                    loadAllData();
                }
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = `<i class="fas fa-save"></i> Simpan`;
            });
    });

    document.getElementById('kontrakTabContent').addEventListener('click', function (e) {
        const deleteButton = e.target.closest('.btn-delete');
        if (deleteButton) {
            const id = deleteButton.dataset.id;
            const type = deleteButton.dataset.type;
            if (confirm(`Yakin ingin menghapus data ${type} ini?`)) {
                const apiUrl = type === 'kontrak' ? 'assets/api/delete_kontrak.php' : 'assets/api/delete_resign.php';
                const formData = new FormData();
                formData.append('id', id);
                fetch(apiUrl, { method: 'POST', body: formData })
                    .then(res => res.json())
                    .then(res => {
                        alert(res.message);
                        if (res.success) loadAllData();
                    });
            }
        }
    });

    searchInputs.forEach(input => {
        input.addEventListener('input', () => {
            const tableBody = input.closest('.card-body').querySelector('tbody');
            const filterText = input.value.toLowerCase();
            tableBody.querySelectorAll('tr').forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(filterText) ? "" : "none";
            });
        });
    });

    loadAllData();
});