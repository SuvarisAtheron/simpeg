<?php
// Mengatur header agar output berupa format JSON
header('Content-Type: application/json');

// Pengaturan koneksi database
$db_host = 'localhost'; 
$db_user = 'root'; 
$db_pass = ''; 
$db_name = 'simpeg';

// Membuat koneksi ke database
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Jika koneksi gagal, hentikan skrip dan kirim pesan error
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi database gagal']));
}

// Query SQL untuk mengambil data yang dibutuhkan
$sql = "
    SELECT 
        p.id, 
        p.nip, 
        -- Menggabungkan gelar depan, nama, dan gelar belakang menjadi satu kolom
        TRIM(CONCAT_WS(' ', pkar.gelar_depan, p.nama_lengkap, pkar.gelar_belakang)) AS nama_lengkap_gelar,
        pkar.status_pegawai,
        -- Mengambil jabatan paling baru berdasarkan tanggal TMT (Terhitung Mulai Tanggal)
        (SELECT nama_jabatan FROM pegawai_jabatan WHERE pegawai_id = p.id ORDER BY tmt_jabatan DESC LIMIT 1) as jabatan
    FROM 
        pegawai p
    LEFT JOIN 
        pegawai_karir pkar ON p.id = pkar.pegawai_id
    ORDER BY 
        p.nama_lengkap ASC
";

$result = $conn->query($sql);
$pegawai = []; // Siapkan array kosong untuk menampung data

// Looping untuk mengambil setiap baris data dari hasil query
if ($result) {
    while($row = $result->fetch_assoc()) {
        $pegawai[] = $row; // Masukkan setiap baris ke dalam array
    }
}

// Tampilkan data dalam format JSON
echo json_encode($pegawai);

// Tutup koneksi database
$conn->close();
?>