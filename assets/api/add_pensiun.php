<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

// 1. Validasi Input
if (empty($_POST['pegawai_id']) || empty($_POST['tanggal_pensiun']) || empty($_POST['no_sk_pensiun'])) {
    die(json_encode(['success' => false, 'message' => 'Data wajib (Pegawai, Tanggal, No SK) harus diisi.']));
}

// 2. Ambil data dari form
$pegawai_id = intval($_POST['pegawai_id']);
$alamat_pensiun = $_POST['alamat_pensiun'];
$tanggal_pensiun = $_POST['tanggal_pensiun'];
$no_sk_pensiun = $_POST['no_sk_pensiun'];
$db_path = null;

// 3. Proses Unggah File (jika ada)
if (isset($_FILES['path_lampiran']) && $_FILES['path_lampiran']['error'] == 0) {
    $file = $_FILES['path_lampiran'];
    $upload_dir = '../uploads/pensiun/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    $nama_file_asli = basename($file['name']);
    $file_extension = pathinfo($nama_file_asli, PATHINFO_EXTENSION);
    $nama_file_unik = 'PENSIUN-' . $pegawai_id . '-' . time() . '.' . $file_extension;
    $target_path = $upload_dir . $nama_file_unik;
    
    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        $db_path = 'assets/uploads/pensiun/' . $nama_file_unik;
    } else {
        die(json_encode(['success' => false, 'message' => 'Gagal mengunggah file lampiran.']));
    }
}

// 4. Simpan ke Database
$sql = "INSERT INTO pegawai_pensiun (pegawai_id, alamat_pensiun, tanggal_pensiun, no_sk_pensiun, path_lampiran) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("issss", $pegawai_id, $alamat_pensiun, $tanggal_pensiun, $no_sk_pensiun, $db_path);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Data pengajuan pensiun berhasil disimpan.']);
} else {
    if ($db_path) unlink($target_path); // Hapus file jika gagal simpan DB
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan data ke database.']);
}

$stmt->close();
$conn->close();
?>