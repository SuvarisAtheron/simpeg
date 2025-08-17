<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$jenis = isset($_POST['jenis']) ? $_POST['jenis'] : '';
$table_name = 'pegawai_' . $jenis;

$allowed_tables = ['pegawai_bahasa', 'pegawai_jabatan', 'pegawai_pangkat', 'pegawai_organisasi', 'pegawai_pendidikan', 'pegawai_diklat', 'pegawai_penghargaan'];
if ($id <= 0 || !in_array($table_name, $allowed_tables)) {
    die(json_encode(['success' => false, 'message' => 'Input tidak valid']));
}

$sql = "DELETE FROM $table_name WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Data berhasil dihapus.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menghapus data: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>