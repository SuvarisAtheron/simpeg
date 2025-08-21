<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

if (empty($_POST['pegawai_id']) || empty($_POST['no_sk_kontrak']) || empty($_POST['tanggal_sign'])) {
    die(json_encode(['success' => false, 'message' => 'Pegawai, No SK, dan Tanggal Sign wajib diisi.']));
}

$pegawai_id = intval($_POST['pegawai_id']);
$golongan_pangkat = $_POST['golongan_pangkat'];
$jabatan = $_POST['jabatan'];
$unit_kerja_sebelumnya = $_POST['unit_kerja_sebelumnya'];
$tanggal_sign = $_POST['tanggal_sign'];
$no_sk_kontrak = $_POST['no_sk_kontrak'];
$keterangan = $_POST['keterangan'];
$db_path = null;

if (isset($_FILES['path_lampiran']) && $_FILES['path_lampiran']['error'] == 0) {
    $file = $_FILES['path_lampiran'];
    $upload_dir = '../uploads/kontrak/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
    
    $nama_file_unik = 'KONTRAK-' . $pegawai_id . '-' . time() . '.' . pathinfo(basename($file['name']), PATHINFO_EXTENSION);
    $target_path = $upload_dir . $nama_file_unik;
    
    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        $db_path = 'assets/uploads/kontrak/' . $nama_file_unik;
    } else {
        die(json_encode(['success' => false, 'message' => 'Gagal mengunggah lampiran.']));
    }
}

$sql = "INSERT INTO pegawai_kontrak (pegawai_id, golongan_pangkat, jabatan, unit_kerja_sebelumnya, tanggal_sign, no_sk_kontrak, keterangan, path_lampiran) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isssssss", $pegawai_id, $golongan_pangkat, $jabatan, $unit_kerja_sebelumnya, $tanggal_sign, $no_sk_kontrak, $keterangan, $db_path);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Data kontrak berhasil disimpan.']);
} else {
    if ($db_path) unlink($target_path);
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan data: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
?>