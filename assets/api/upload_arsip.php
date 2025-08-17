<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

// Validasi
if (empty($_POST['pegawai_id']) || empty($_POST['nama_arsip']) || empty($_FILES['file_arsip'])) {
    die(json_encode(['success' => false, 'message' => 'Semua field wajib diisi.']));
}

$pegawai_id = intval($_POST['pegawai_id']);
$nama_arsip = $_POST['nama_arsip'];
$file = $_FILES['file_arsip'];

// Buat folder 'uploads' jika belum ada
$upload_dir = '../uploads/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Buat nama file unik untuk menghindari nama yang sama
$nama_file_asli = basename($file['name']);
$file_extension = pathinfo($nama_file_asli, PATHINFO_EXTENSION);
$nama_file_unik = uniqid() . '-' . time() . '.' . $file_extension;
$target_path = $upload_dir . $nama_file_unik;
$db_path = 'assets/uploads/' . $nama_file_unik; // Path untuk disimpan di DB

// Pindahkan file ke folder tujuan
if (move_uploaded_file($file['tmp_name'], $target_path)) {
    // Simpan informasi ke database
    $sql = "INSERT INTO pegawai_arsip (pegawai_id, nama_arsip, nama_file_asli, path_file) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isss", $pegawai_id, $nama_arsip, $nama_file_asli, $db_path);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'File berhasil diunggah.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal menyimpan data ke database.']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal memindahkan file ke server.']);
}

$conn->close();
?>