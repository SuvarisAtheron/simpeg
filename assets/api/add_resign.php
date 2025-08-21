<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

if (empty($_POST['pegawai_id']) || empty($_POST['tanggal_resign'])) {
    die(json_encode(['success' => false, 'message' => 'Pegawai dan Tanggal Resign wajib diisi.']));
}

$pegawai_id = intval($_POST['pegawai_id']);
$golongan_pangkat = $_POST['golongan_pangkat'];
$jabatan = $_POST['jabatan'];
$unit_kerja_sebelumnya = $_POST['unit_kerja_sebelumnya'];
$tanggal_resign = $_POST['tanggal_resign'];
$no_sk_resign = $_POST['no_sk_resign'];
$alasan = $_POST['alasan'];
$db_path = null;

if (isset($_FILES['path_lampiran']) && $_FILES['path_lampiran']['error'] == 0) {
    $file = $_FILES['path_lampiran'];
    $upload_dir = '../uploads/resign/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
    
    $nama_file_unik = 'RESIGN-' . $pegawai_id . '-' . time() . '.' . pathinfo(basename($file['name']), PATHINFO_EXTENSION);
    $target_path = $upload_dir . $nama_file_unik;
    
    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        $db_path = 'assets/uploads/resign/' . $nama_file_unik;
    } else {
        die(json_encode(['success' => false, 'message' => 'Gagal mengunggah lampiran.']));
    }
}

$sql = "INSERT INTO pegawai_resign (pegawai_id, golongan_pangkat, jabatan, unit_kerja_sebelumnya, tanggal_resign, no_sk_resign, alasan, path_lampiran) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isssssss", $pegawai_id, $golongan_pangkat, $jabatan, $unit_kerja_sebelumnya, $tanggal_resign, $no_sk_resign, $alasan, $db_path);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Data resign berhasil disimpan.']);
} else {
    if ($db_path) unlink($target_path);
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan data: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
?>