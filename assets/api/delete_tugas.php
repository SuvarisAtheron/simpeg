<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

$tugas_id = isset($_POST['id']) ? intval($_POST['id']) : 0;

if ($tugas_id <= 0) {
    die(json_encode(['success' => false, 'message' => 'ID Tugas tidak valid.']));
}

// Ambil path file untuk dihapus dari server
$sql_select = "SELECT path_file FROM pegawai_tugas WHERE id = ?";
$stmt_select = $conn->prepare($sql_select);
$stmt_select->bind_param("i", $tugas_id);
$stmt_select->execute();
$row = $stmt_select->get_result()->fetch_assoc();
$stmt_select->close();

if ($row && $row['path_file']) {
    $file_path_on_server = '../' . str_replace('assets/', '', $row['path_file']);
    if (file_exists($file_path_on_server)) {
        unlink($file_path_on_server);
    }
}

// Hapus record dari database
$sql_delete = "DELETE FROM pegawai_tugas WHERE id = ?";
$stmt_delete = $conn->prepare($sql_delete);
$stmt_delete->bind_param("i", $tugas_id);

if ($stmt_delete->execute()) {
    echo json_encode(['success' => true, 'message' => 'Surat tugas berhasil dihapus.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menghapus data.']);
}
$stmt_delete->close();
$conn->close();
?>