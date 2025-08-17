<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal.']));
}

// Validasi
if (empty($_POST['pegawai_id']) || empty($_POST['jenis_cuti']) || empty($_POST['tanggal_mulai'])) {
    die(json_encode(['success' => false, 'message' => 'Data wajib tidak boleh kosong.']));
}

// Ambil data
$pegawai_id = intval($_POST['pegawai_id']);
$jenis_shift = $_POST['jenis_shift'];
$jenis_cuti = $_POST['jenis_cuti'];
$tanggal_mulai = $_POST['tanggal_mulai'];
$tanggal_selesai = $_POST['tanggal_selesai'];
$alamat_selama_cuti = $_POST['alamat_selama_cuti'];
$no_hp_selama_cuti = $_POST['no_hp_selama_cuti'];

// Simpan ke database
$sql = "INSERT INTO pegawai_cuti 
            (pegawai_id, jenis_shift, jenis_cuti, tanggal_mulai, tanggal_selesai, alamat_selama_cuti, no_hp_selama_cuti) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("issssss", 
    $pegawai_id, $jenis_shift, $jenis_cuti, $tanggal_mulai, $tanggal_selesai, $alamat_selama_cuti, $no_hp_selama_cuti
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Pengajuan cuti berhasil disimpan.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan pengajuan cuti.']);
}

$stmt->close();
$conn->close();
?>