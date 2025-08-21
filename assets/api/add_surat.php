<?php
header('Content-Type: application/json');

// Pengaturan Database
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'simpeg';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi database gagal.']));
}

// Validasi Input
if (empty($_POST['pegawai_id']) || empty($_POST['jenis_surat']) || empty($_POST['tanggal_surat'])) {
    die(json_encode(['success' => false, 'message' => 'Data wajib (Pegawai, Jenis Surat, Tanggal) tidak boleh kosong.']));
}

// Ambil data dari POST
$pegawai_id = intval($_POST['pegawai_id']);
$jenis_surat = $_POST['jenis_surat'];
$no_surat = $_POST['no_surat'] ?? null;
$tanggal_surat = $_POST['tanggal_surat'];
$keterangan_utama = $_POST['keterangan_utama'] ?? null; // Nama generik dari form
$keterangan_tambahan = $_POST['keterangan_tambahan'] ?? null; // Nama generik dari form

// Simpan ke database
$sql = "INSERT INTO pegawai_surat_lainnya 
            (pegawai_id, jenis_surat, no_surat, tanggal_surat, keterangan_utama, keterangan_tambahan) 
        VALUES (?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("isssss", 
    $pegawai_id, 
    $jenis_surat, 
    $no_surat, 
    $tanggal_surat, 
    $keterangan_utama, 
    $keterangan_tambahan
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Surat berhasil disimpan.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan surat. Error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>