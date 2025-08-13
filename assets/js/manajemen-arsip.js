document.addEventListener('DOMContentLoaded', function() {
    
    // --- SIMULASI DATABASE ---
    const contohDataPegawai = [
        { id: 1, nama_lengkap: 'dr. H. Husodo Dewo Adi, Sp.OT(K),Spine,FICS', status: 'PNS', nip: '196505171991031013', jabatan: 'Direktur' },
        { id: 2, nama_lengkap: 'dr. R.M. Willy Indrawilis, Sp.X.J', status: 'PNS', nip: '197607242005011003', jabatan: 'Wakil Direktur Pendidikan & Pengembangan' },
        { id: 3, nama_lengkap: 'Dede Darmawan, S.Kep,Ners', status: 'PNS', nip: '198008012007011005', jabatan: 'Kepala Bidang Keperawatan' }
    ];

    const dbArsip = {
        '1': { 'KTP': true, 'Ijazah S1': true, 'SK CPNS': false },
        '2': { 'KTP': true, 'Ijazah S1': false, 'SK CPNS': false },
        '3': { 'KTP': false, 'Ijazah S1': false, 'SK CPNS': false },
    };

    const jenisArsipList = ['KTP', 'Ijazah S1', 'SK CPNS', 'SK PNS', 'Kartu Keluarga'];

    // --- ELEMEN HTML ---
    const tabelPegawaiBody = document.getElementById('tabel-pegawai-body');
    const arsipModal = new bootstrap.Modal(document.getElementById('arsipModal'));
    const namaPegawaiModal = document.getElementById('nama-pegawai-modal');
    const tabelArsipDetailBody = document.getElementById('tabel-arsip-detail-body');
    const uploadFileInput = document.getElementById('upload-file-input');

    // --- FUNGSI-FUNGSI ---
    function tampilkanPegawai() {
        tabelPegawaiBody.innerHTML = '';
        contohDataPegawai.forEach((pegawai, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${pegawai.nama_lengkap}</td>
                <td><span class="badge bg-secondary">${pegawai.status}</span></td>
                <td>${pegawai.nip}</td>
                <td>${pegawai.jabatan}</td>
                <td>
                    <button class="btn btn-primary btn-sm btn-kelola-arsip" data-id="${pegawai.id}" data-nama="${pegawai.nama_lengkap}">
                        <i class="fas fa-folder-open"></i> Kelola Arsip
                    </button>
                </td>
            `;
            tabelPegawaiBody.appendChild(tr);
        });
    }

    function tampilkanDetailArsip(pegawaiId) {
        tabelArsipDetailBody.innerHTML = '';
        const arsipPegawai = dbArsip[pegawaiId] || {};

        jenisArsipList.forEach(jenis => {
            const sudahAda = arsipPegawai[jenis] === true;
            const statusBadge = sudahAda
                ? `<span class="badge bg-success">Sudah Diunggah</span>`
                : `<span class="badge bg-warning text-dark">Belum Ada File</span>`;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${jenis}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-info" ${!sudahAda && 'disabled'} title="Lihat File"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-secondary btn-upload" data-pegawai-id="${pegawaiId}" data-jenis-arsip="${jenis}" title="Upload Baru"><i class="fas fa-upload"></i></button>
                </td>
            `;
            tabelArsipDetailBody.appendChild(tr);
        });
    }

    // --- EVENT LISTENERS ---
    // Event listener untuk semua tombol "Kelola Arsip"
    tabelPegawaiBody.addEventListener('click', function(event) {
        const target = event.target.closest('.btn-kelola-arsip');
        if (target) {
            const pegawaiId = target.dataset.id;
            const pegawaiNama = target.dataset.nama;
            
            namaPegawaiModal.textContent = pegawaiNama;
            tampilkanDetailArsip(pegawaiId);
            arsipModal.show();
        }
    });

    // Event listener untuk tombol "Upload" di dalam modal
    tabelArsipDetailBody.addEventListener('click', function(event) {
        const target = event.target.closest('.btn-upload');
        if (target) {
            uploadFileInput.click(); // Memicu dialog pilih file
            
            // Simpan data target untuk digunakan setelah file dipilih
            uploadFileInput.dataset.pegawaiId = target.dataset.pegawaiId;
            uploadFileInput.dataset.jenisArsip = target.dataset.jenisArsip;
        }
    });

    // Event listener untuk input file yang tersembunyi
    uploadFileInput.addEventListener('change', function(event) {
        if (event.target.files.length > 0) {
            const pegawaiId = this.dataset.pegawaiId;
            const jenisArsip = this.dataset.jenisArsip;
            
            alert(`Simulasi: Berhasil mengunggah file "${event.target.files[0].name}" untuk arsip "${jenisArsip}".`);
            
            // Update "database" simulasi
            if (!dbArsip[pegawaiId]) dbArsip[pegawaiId] = {};
            dbArsip[pegawaiId][jenisArsip] = true;

            // Refresh tampilan modal
            tampilkanDetailArsip(pegawaiId);

            // Reset input file
            this.value = ''; 
        }
    });

    // --- INISIALISASI ---
    tampilkanPegawai();
});