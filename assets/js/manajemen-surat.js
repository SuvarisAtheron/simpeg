document.addEventListener('DOMContentLoaded', function () {

    // === DEKLARASI ELEMEN ===
    const suratModalElement = document.getElementById('suratModal');
    const suratModal = new bootstrap.Modal(suratModalElement);
    const formSurat = document.getElementById('form-surat');
    const tabelSuratBody = document.getElementById('tabel-surat-body');

    // Elemen Form
    const namaInput = document.getElementById('surat-nama');
    const searchResultsContainer = document.getElementById('search-results-surat');
    const pegawaiIdInput = document.getElementById('surat-pegawai-id');
    const nipInput = document.getElementById('surat-nip');
    const golonganInput = document.getElementById('surat-golongan');
    const jabatanInput = document.getElementById('surat-jabatan');
    const jenisSuratSelect = document.getElementById('jenis-surat-select');
    const formDinamisContainer = document.getElementById('form-dinamis-surat');

    // Template HTML untuk form dinamis (Final)
    const formTemplates = {
        'Rekomendasi': `
            <div class="row g-3 mt-2">
                <div class="col-md-4">
                    <label class="form-label">No. Surat Rekomendasi</label>
                    <input type="text" name="no_surat" class="form-control" required>
                </div>
                <div class="col-md-8">
                    <label class="form-label">Tanggal Surat</label>
                    <input type="date" name="tanggal_surat" class="form-control" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Keterangan Rekomendasi</label>
                    <textarea name="keterangan_utama" class="form-control" rows="4"></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Catatan Tambahan / Lokasi PPDS</label>
                    <textarea name="keterangan_tambahan" class="form-control" rows="4"></textarea>
                </div>
            </div>`,
        'Konsumtif': `
            <div class="row g-3 mt-2">
                <div class="col-md-4">
                    <label class="form-label">No. Surat Keterangan</label>
                    <input type="text" name="no_surat" class="form-control" required>
                </div>
                <div class="col-md-8">
                     <label class="form-label">Tanggal Surat</label>
                    <input type="date" name="tanggal_surat" class="form-control" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Peruntukan</label>
                    <select name="keterangan_utama" class="form-select" required>
                        <option value="">Pilih...</option>
                        <option>Persyaratan Pembuatan Kartu Kredit</option>
                        <option>Persyaratan Pengajuan Kredit Kendaraan</option>
                        <option>Persyaratan Pengajuan Kredit Tanpa Agunan</option>
                        <option>Persyaratan Pengajuan Kredit Usaha Rakyat</option>
                        <option>Lainnya</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Catatan Tambahan</label>
                    <textarea name="keterangan_tambahan" class="form-control" rows="3"></textarea>
                </div>
            </div>`,
        'Keterangan Kerja': `
            <div class="row g-3 mt-2">
                <div class="col-md-4">
                    <label class="form-label">No. Surat Keterangan</label>
                    <input type="text" name="no_surat" class="form-control" required>
                </div>
                 <div class="col-md-8">
                     <label class="form-label">Tanggal Surat</label>
                    <input type="date" name="tanggal_surat" class="form-control" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Peruntukan</label>
                    <select name="keterangan_utama" class="form-select" required>
                        <option value="">Pilih...</option>
                        <option>Persyaratan Pembuatan Paspor</option>
                        <option>Persyaratan Pembuatan Visa</option>
                        <option>Persyaratan Melamar Pekerjaan Lain</option>
                        <option>Lainnya</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Catatan Tambahan</label>
                    <textarea name="keterangan_tambahan" class="form-control" rows="3"></textarea>
                </div>
            </div>`
    };

    // === FUNGSI-FUNGSI ===

    function loadSuratHistory() {
        tabelSuratBody.innerHTML = `<tr><td colspan="6" class="text-center">Memuat riwayat...</td></tr>`;
        fetch('assets/api/get_list_surat.php')
            .then(response => response.json())
            .then(res => {
                tabelSuratBody.innerHTML = '';
                if (res.success && res.data.length > 0) {
                    res.data.forEach((item, index) => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${index + 1}</td>
                            <td><span class="badge bg-info">${item.jenis_surat}</span></td>
                            <td>${item.no_surat || 'N/A'}</td>
                            <td>${item.nama_lengkap}<br><small class="text-muted">NIP: ${item.nip}</small></td>
                            <td>${item.tanggal_surat}</td>
                            <td>
                                <button class="btn btn-sm btn-danger btn-delete-surat" data-id="${item.id}" title="Hapus Surat">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        `;
                        tabelSuratBody.appendChild(tr);
                    });
                } else {
                    tabelSuratBody.innerHTML = `<tr><td colspan="6" class="text-center">Belum ada riwayat surat yang dibuat.</td></tr>`;
                }
            });
    }

    function renderDynamicForm(jenisSurat) {
        formDinamisContainer.innerHTML = formTemplates[jenisSurat] || '<p class="text-center text-muted">Pilih jenis surat di atas untuk menampilkan form isian.</p>';
    }

    // === EVENT LISTENERS ===

    suratModalElement.addEventListener('shown.bs.modal', function () {
        formSurat.reset();
        searchResultsContainer.style.display = 'none';
        renderDynamicForm('');
    });

    namaInput.addEventListener('input', function () {
        const searchTerm = this.value;
        if (searchTerm.length < 3) { searchResultsContainer.style.display = 'none'; return; }
        fetch(`assets/api/search_pegawai.php?term=${searchTerm}`)
            .then(r => r.json()).then(data => {
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
            const pegawaiId = e.target.dataset.id;
            searchResultsContainer.style.display = 'none';
            fetch(`assets/api/get_data_personal.php?id=${pegawaiId}`)
                .then(r => r.json()).then(data => {
                    if (data) {
                        pegawaiIdInput.value = data.id;
                        namaInput.value = data.nama_lengkap || '';
                        nipInput.value = data.nip || '';
                        golonganInput.value = data.golongan_terakhir || 'N/A';
                        jabatanInput.value = 'Jabatan Terakhir'; // Placeholder
                    }
                });
        }
    });

    jenisSuratSelect.addEventListener('change', function () {
        renderDynamicForm(this.value);
    });

    formSurat.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitButton = suratModalElement.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Menyimpan...`;

        const formData = new FormData(this);

        fetch('assets/api/add_surat.php', {
            method: 'POST', body: formData
        })
            .then(response => response.json())
            .then(res => {
                alert(res.message);
                if (res.success) {
                    suratModal.hide();
                    loadSuratHistory();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat menyimpan data.');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = `<i class="fas fa-save"></i> Simpan`;
            });
    });

    tabelSuratBody.addEventListener('click', function (e) {
        const deleteButton = e.target.closest('.btn-delete-surat');
        if (deleteButton) {
            if (confirm('Anda yakin ingin menghapus data surat ini?')) {
                const suratId = deleteButton.dataset.id;
                const formData = new FormData();
                formData.append('id', suratId);

                fetch('assets/api/delete_surat.php', { method: 'POST', body: formData })
                    .then(response => response.json())
                    .then(res => {
                        alert(res.message);
                        if (res.success) {
                            loadSuratHistory(); // Muat ulang data setelah berhasil hapus
                        }
                    });
            }
        }
    });

    // --- INISIALISASI ---
    loadSuratHistory();
});