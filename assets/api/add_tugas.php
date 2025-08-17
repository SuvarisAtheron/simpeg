<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

// 1. Validasi Input
if (empty($_POST['pegawai_id']) || empty($_POST['no_surat_tugas']) || empty($_POST['tanggal_mulai'])) {
    die(json_encode(['success' => false, 'message' => 'Data wajib (Pegawai, No Surat, Tgl Mulai) harus diisi.']));
}

// 2. Ambil semua data dari form
$pegawai_id = intval($_POST['pegawai_id']);
$no_surat_tugas = $_POST['no_surat_tugas'];
$jenis_lokasi_tugas = $_POST['jenis_lokasi_tugas'];
$lokasi_kegiatan = $_POST['lokasi_kegiatan'];
$tanggal_mulai = $_POST['tanggal_mulai'];
$tanggal_selesai = $_POST['tanggal_selesai'];
$catatan_tambahan = $_POST['catatan_tambahan'];
$db_path = null; // Default path file adalah null

// 3. Proses Unggah File (jika ada)
if (isset($_FILES['path_file']) && $_FILES['path_file']['error'] == 0) {
    $file = $_FILES['path_file'];
    $upload_dir = '../uploads/tugas/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    $nama_file_asli = basename($file['name']);
    $file_extension = pathinfo($nama_file_asli, PATHINFO_EXTENSION);
    $nama_file_unik = 'TUGAS-' . $pegawai_id . '-' . time() . '.' . $file_extension;
    $target_path = $upload_dir . $nama_file_unik;
    
    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        $db_path = 'assets/uploads/tugas/' . $nama_file_unik;
    } else {
        die(json_encode(['success' => false, 'message' => 'Gagal mengunggah file.']));
    }
}

// 4. Simpan ke Database
$sql = "INSERT INTO pegawai_tugas 
            (pegawai_id, no_surat_tugas, jenis_lokasi_tugas, lokasi_kegiatan, tanggal_mulai, tanggal_selesai, catatan_tambahan, path_file) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isssssss", 
    $pegawai_id, $no_surat_tugas, $jenis_lokasi_tugas, $lokasi_kegiatan, $tanggal_mulai, $tanggal_selesai, $catatan_tambahan, $db_path
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Surat tugas berhasil disimpan.']);
} else {
    if ($db_path) unlink($target_path); // Hapus file jika gagal simpan DB
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan data ke database.']);
}

$stmt->close();
$conn->close();
?>