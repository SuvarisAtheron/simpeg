<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

$cuti_id = isset($_POST['id']) ? intval($_POST['id']) : 0;

if ($cuti_id <= 0) {
    die(json_encode(['success' => false, 'message' => 'ID Pengajuan Cuti tidak valid.']));
}

// Hapus record dari database
$sql_delete = "DELETE FROM pegawai_cuti WHERE id = ?";
$stmt_delete = $conn->prepare($sql_delete);
$stmt_delete->bind_param("i", $cuti_id);

if ($stmt_delete->execute()) {
    echo json_encode(['success' => true, 'message' => 'Data pengajuan cuti berhasil dihapus.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menghapus data dari database.']);
}

$stmt_delete->close();
$conn->close();
?>