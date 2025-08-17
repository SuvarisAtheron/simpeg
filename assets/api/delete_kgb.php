<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

$kgb_id = isset($_POST['id']) ? intval($_POST['id']) : 0;

if ($kgb_id <= 0) {
    die(json_encode(['success' => false, 'message' => 'ID Pengajuan KGB tidak valid.']));
}

// 1. Ambil path file dari database untuk dihapus dari server
$sql_select = "SELECT path_lampiran FROM pegawai_kgb WHERE id = ?";
$stmt_select = $conn->prepare($sql_select);
$stmt_select->bind_param("i", $kgb_id);
$stmt_select->execute();
$row = $stmt_select->get_result()->fetch_assoc();
$stmt_select->close();

if ($row) {
    // Ubah path relatif (assets/uploads/...) menjadi path server fisik (../uploads/...)
    $file_path_on_server = '../' . str_replace('assets/', '', $row['path_lampiran']);
    
    // 2. Hapus file dari folder di server
    if (file_exists($file_path_on_server)) {
        unlink($file_path_on_server);
    }
}

// 3. Hapus record dari database
$sql_delete = "DELETE FROM pegawai_kgb WHERE id = ?";
$stmt_delete = $conn->prepare($sql_delete);
$stmt_delete->bind_param("i", $kgb_id);

if ($stmt_delete->execute()) {
    echo json_encode(['success' => true, 'message' => 'Data pengajuan KGB berhasil dihapus.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menghapus data dari database.']);
}

$stmt_delete->close();
$conn->close();
?>