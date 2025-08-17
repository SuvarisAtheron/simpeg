<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

$riwayat_id = isset($_POST['riwayat_id']) ? intval($_POST['riwayat_id']) : 0;
$jenis = isset($_POST['jenis_riwayat']) ? $_POST['jenis_riwayat'] : '';
$table_name = 'pegawai_' . $jenis;

$allowed_tables = ['pegawai_bahasa', 'pegawai_jabatan', 'pegawai_pangkat', 'pegawai_organisasi', 'pegawai_pendidikan', 'pegawai_diklat', 'pegawai_penghargaan'];
if ($riwayat_id <= 0 || !in_array($table_name, $allowed_tables)) {
    die(json_encode(['success' => false, 'message' => 'Input tidak valid']));
}

$data = $_POST;
unset($data['riwayat_id'], $data['jenis_riwayat']);

$set_parts = [];
$values = [];
$types = '';

foreach ($data as $key => $value) {
    $set_parts[] = "$key = ?";
    $values[] = ($value === '') ? null : $value;
    $types .= 's';
}

$values[] = $riwayat_id;
$types .= 'i';

$sql = "UPDATE $table_name SET " . implode(', ', $set_parts) . " WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$values);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Data berhasil diupdate.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal mengupdate data: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>