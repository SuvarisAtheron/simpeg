<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

$arsip_id = isset($_POST['arsip_id']) ? intval($_POST['arsip_id']) : 0;
if ($arsip_id <= 0) {
    die(json_encode(['success' => false, 'message' => 'ID Arsip tidak valid.']));
}

// 1. Ambil path file dari database
$sql_select = "SELECT path_file FROM pegawai_arsip WHERE id = ?";
$stmt_select = $conn->prepare($sql_select);
$stmt_select->bind_param("i", $arsip_id);
$stmt_select->execute();
$result = $stmt_select->get_result();
$row = $result->fetch_assoc();
$stmt_select->close();

if ($row) {
    $path_file_server = '../' . str_replace('assets/', '', $row['path_file']);

    // 2. Hapus file dari server jika ada
    if (file_exists($path_file_server)) {
        unlink($path_file_server);
    }

    // 3. Hapus record dari database
    $sql_delete = "DELETE FROM pegawai_arsip WHERE id = ?";
    $stmt_delete = $conn->prepare($sql_delete);
    $stmt_delete->bind_param("i", $arsip_id);
    if ($stmt_delete->execute()) {
        echo json_encode(['success' => true, 'message' => 'Arsip berhasil dihapus.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal menghapus data dari database.']);
    }
    $stmt_delete->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Data arsip tidak ditemukan.']);
}

$conn->close();
?>