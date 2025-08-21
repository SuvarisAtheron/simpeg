<?php
session_start(); // Memulai sesi
header('Content-Type: application/json');

// Pengaturan Database
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'simpeg';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi database gagal.']));
}

// Ambil data dari POST request
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    die(json_encode(['success' => false, 'message' => 'Email dan password wajib diisi.']));
}

// Cari pengguna berdasarkan email
$sql = "SELECT * FROM users WHERE email = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // Verifikasi password yang di-hash
    if (password_verify($password, $user['password'])) {
        // Jika password cocok, simpan data ke session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_nama'] = $user['nama_lengkap'];
        $_SESSION['logged_in'] = true;

        echo json_encode(['success' => true, 'message' => 'Login berhasil!']);
    } else {
        // Jika password salah
        echo json_encode(['success' => false, 'message' => 'Password yang Anda masukkan salah.']);
    }
} else {
    // Jika email tidak ditemukan
    echo json_encode(['success' => false, 'message' => 'Email tidak terdaftar.']);
}

$stmt->close();
$conn->close();
?>