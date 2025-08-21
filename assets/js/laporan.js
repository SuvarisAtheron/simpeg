$(document).ready(function() {
    
    // Inisialisasi awal DataTables
    const table = $('#tabel-laporan').DataTable({
        // Konfigurasi untuk memanggil data dari API
        "processing": true,
        "serverSide": false, // Kita akan handle filter di client-side setelah data awal dimuat
        "ajax": {
            "url": "assets/api/get_laporan_pegawai.php", // API untuk mengambil semua data
            "type": "GET",
            "dataSrc": "data" // DataTables akan mencari array 'data' di dalam JSON
        },
        // Mendefinisikan kolom mana yang akan diisi dari data
        "columns": [
            { "data": null, "render": function (data, type, row, meta) { return meta.row + 1; } }, // Kolom Nomor
            { "data": "nama_lengkap" },
            { "data": "status_pegawai" },
            { "data": "nip" },
            { "data": "mulai_kerja" },
            { "data": "jabatan_terakhir" },
            { "data": "jenjang_pendidikan" }
        ],
        // Konfigurasi untuk tombol ekspor
        "dom": 'Bfrtip',
        "buttons": [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],
        "language": {
            "search": "Cari:",
            "lengthMenu": "Tampilkan _MENU_ entri",
            "info": "Menampilkan _START_ sampai _END_ dari _TOTAL_ entri",
            "paginate": {
                "first": "Pertama",
                "last": "Terakhir",
                "next": "Selanjutnya",
                "previous": "Sebelumnya"
            },
        }
    });

    // Fungsi untuk memfilter tabel
    function filterTable(keyword) {
        table.column(5).search(keyword, true, false).draw(); // Kolom ke-5 adalah 'Jabatan'
    }

    // Event listener untuk tombol filter cepat (Dokter, Bidan, dll)
    $('.filter-btn').on('click', function() {
        const kelompok = $(this).data('kelompok');
        $('#posisi-lain-filter').val(''); // Reset dropdown
        filterTable(kelompok);
    });

    // Event listener untuk dropdown posisi lainnya
    $('#posisi-lain-filter').on('change', function() {
        const kelompok = $(this).val();
        filterTable(kelompok);
    });

});