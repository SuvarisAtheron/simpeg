<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

$pegawai_id = isset($_GET['pegawai_id']) ? intval($_GET['pegawai_id']) : 0;
if ($pegawai_id <= 0) {
    die(json_encode([]));
}

$sql = "SELECT id, nama_arsip, path_file, DATE(tanggal_upload) as tanggal_upload FROM pegawai_arsip WHERE pegawai_id = ? ORDER BY tanggal_upload DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $pegawai_id);
$stmt->execute();
$result = $stmt->get_result();
$arsip_list = [];
while($row = $result->fetch_assoc()) {
    $arsip_list[] = $row;
}

echo json_encode(['success' => true, 'data' => $arsip_list]);
$stmt->close();
$conn->close();
?>