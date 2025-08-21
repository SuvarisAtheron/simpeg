<?php
header('Content-Type: application/json');

// Pengaturan Database
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'simpeg';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

// Ambil ID dari request POST
$surat_id = isset($_POST['id']) ? intval($_POST['id']) : 0;

if ($surat_id <= 0) {
    die(json_encode(['success' => false, 'message' => 'ID Surat tidak valid.']));
}

// Query untuk menghapus data
$sql = "DELETE FROM pegawai_surat_lainnya WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $surat_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Data surat berhasil dihapus.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menghapus data. Error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>