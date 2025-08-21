<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
if ($id <= 0) die(json_encode(['success' => false, 'message' => 'ID tidak valid.']));

$sql_select = "SELECT path_lampiran FROM pegawai_resign WHERE id = ?";
$stmt_select = $conn->prepare($sql_select);
$stmt_select->bind_param("i", $id);
$stmt_select->execute();
$row = $stmt_select->get_result()->fetch_assoc();
if ($row && $row['path_lampiran']) {
    $file_path = '../' . str_replace('assets/', '', $row['path_lampiran']);
    if (file_exists($file_path)) unlink($file_path);
}

$sql_delete = "DELETE FROM pegawai_resign WHERE id = ?";
$stmt_delete = $conn->prepare($sql_delete);
$stmt_delete->bind_param("i", $id);
if ($stmt_delete->execute()) echo json_encode(['success' => true, 'message' => 'Data berhasil dihapus.']);
else echo json_encode(['success' => false, 'message' => 'Gagal menghapus data.']);
?>