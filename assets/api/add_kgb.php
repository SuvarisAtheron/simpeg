<?php
header('Content-Type: application/json');

// Pengaturan koneksi database
$db_host = 'localhost'; 
$db_user = 'root'; 
$db_pass = ''; 
$db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi database gagal.']));
}

// 1. Validasi Input
if (empty($_POST['pegawai_id']) || empty($_POST['bulan_pengajuan']) || empty($_POST['tahun_pengajuan']) || empty($_FILES['lampiran'])) {
    die(json_encode(['success' => false, 'message' => 'Data tidak lengkap. Pastikan semua field terisi.']));
}

// Ambil data dari form
$pegawai_id = intval($_POST['pegawai_id']);
$bulan_pengajuan = intval($_POST['bulan_pengajuan']);
$tahun_pengajuan = intval($_POST['tahun_pengajuan']);
$masa_kerja_tahun = intval($_POST['masa_kerja_tahun']);
$masa_kerja_bulan = intval($_POST['masa_kerja_bulan']);
$golongan_saat_itu = $_POST['golongan_saat_itu'];
$file_lampiran = $_FILES['lampiran'];

// 2. Proses Unggah File
// Buat folder 'uploads/kgb' jika belum ada
$upload_dir = '../uploads/kgb/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Buat nama file yang unik untuk menghindari nama yang sama
$nama_file_asli = basename($file_lampiran['name']);
$file_extension = pathinfo($nama_file_asli, PATHINFO_EXTENSION);
$nama_file_unik = 'KGB-' . $pegawai_id . '-' . time() . '.' . $file_extension;
$target_path = $upload_dir . $nama_file_unik;
$db_path = 'assets/uploads/kgb/' . $nama_file_unik; // Path yang akan disimpan di DB

// Pindahkan file dari temporary location ke folder tujuan
if (move_uploaded_file($file_lampiran['tmp_name'], $target_path)) {
    // 3. Simpan informasi ke database
    $sql = "INSERT INTO pegawai_kgb 
                (pegawai_id, bulan_pengajuan, tahun_pengajuan, masa_kerja_tahun, masa_kerja_bulan, golongan_saat_itu, path_lampiran) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiiiiss", 
        $pegawai_id, 
        $bulan_pengajuan, 
        $tahun_pengajuan, 
        $masa_kerja_tahun, 
        $masa_kerja_bulan, 
        $golongan_saat_itu, 
        $db_path
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Data pengajuan KGB berhasil disimpan.']);
    } else {
        // Jika gagal simpan ke DB, hapus file yang sudah terlanjur diunggah
        unlink($target_path); 
        echo json_encode(['success' => false, 'message' => 'Gagal menyimpan data ke database.']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal mengunggah file lampiran.']);
}

$conn->close();
?>