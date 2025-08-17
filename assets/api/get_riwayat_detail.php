<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$jenis = isset($_GET['jenis']) ? $_GET['jenis'] : '';
$table_name = 'pegawai_' . $jenis;

$allowed_tables = ['pegawai_bahasa', 'pegawai_jabatan', 'pegawai_pangkat', 'pegawai_organisasi', 'pegawai_pendidikan', 'pegawai_diklat', 'pegawai_penghargaan'];
if ($id <= 0 || !in_array($table_name, $allowed_tables)) {
    die(json_encode(['success' => false, 'message' => 'Input tidak valid']));
}

$sql = "SELECT * FROM $table_name WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

if ($data) {
    echo json_encode(['success' => true, 'data' => $data]);
} else {
    echo json_encode(['success' => false, 'message' => 'Data tidak ditemukan']);
}

$stmt->close();
$conn->close();
?>