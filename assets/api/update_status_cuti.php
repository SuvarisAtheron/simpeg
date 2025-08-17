<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

$cuti_id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$new_status = isset($_POST['status']) ? $_POST['status'] : '';
$allowed_status = ['Disetujui', 'Ditolak'];

if ($cuti_id <= 0 || !in_array($new_status, $allowed_status)) {
    die(json_encode(['success' => false, 'message' => 'Input tidak valid.']));
}

$sql = "UPDATE pegawai_cuti SET status_pengajuan = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $new_status, $cuti_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Status cuti berhasil diupdate.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal mengupdate status cuti.']);
}

$stmt->close();
$conn->close();
?>