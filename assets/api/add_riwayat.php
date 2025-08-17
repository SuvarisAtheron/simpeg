<?php
header('Content-Type: application/json');

// Pengaturan Database
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'simpeg';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['success' => false, 'message' => 'Koneksi database gagal: ' . $conn->connect_error]));
}

// Validasi input utama
if (empty($_POST['pegawai_id']) || empty($_POST['jenis_riwayat'])) {
    http_response_code(400);
    die(json_encode(['success' => false, 'message' => 'ID Pegawai dan Jenis Riwayat wajib diisi.']));
}

$pegawai_id = intval($_POST['pegawai_id']);
$jenis_riwayat = $_POST['jenis_riwayat']; // Contoh: 'jabatan', 'pangkat', dll.
$table_name = 'pegawai_' . $jenis_riwayat; // Membuat nama tabel dinamis, contoh: 'pegawai_jabatan'

// Daftar tabel yang diizinkan untuk keamanan
$allowed_tables = [
    'pegawai_bahasa', 'pegawai_jabatan', 'pegawai_pangkat', 
    'pegawai_organisasi', 'pegawai_pendidikan', 'pegawai_diklat', 'pegawai_penghargaan'
];

if (!in_array($table_name, $allowed_tables)) {
    http_response_code(400);
    die(json_encode(['success' => false, 'message' => 'Jenis riwayat tidak valid.']));
}


$data = $_POST;
unset($data['pegawai_id'], $data['jenis_riwayat']);

// Hapus field yang kosong agar nilainya menjadi NULL atau default di database
$values = [];
$columns = [];
foreach ($data as $key => $value) {
    if ($value !== '' && $value !== null) {
        $columns[] = $key;
        $values[] = $value;
    }
}

// Tambahkan 'pegawai_id' ke awal array kolom dan nilai
array_unshift($columns, 'pegawai_id');
array_unshift($values, $pegawai_id);

$placeholders = implode(', ', array_fill(0, count($columns), '?'));
$sql = "INSERT INTO $table_name (" . implode(', ', $columns) . ") VALUES ($placeholders)";

// Menentukan tipe data dinamis untuk bind_param
// 'i' untuk pegawai_id, sisanya kita anggap string 's' untuk kesederhanaan,
// karena MySQL akan melakukan konversi tipe data jika memungkinkan.
$types = 'i' . str_repeat('s', count($values) - 1);

try {
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        throw new Exception("Prepare statement gagal: " . $conn->error);
    }
    
    $stmt->bind_param($types, ...$values);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Data riwayat berhasil ditambahkan.']);
    } else {
        throw new Exception("Gagal menyimpan data. Error: " . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Terjadi error: ' . $e->getMessage()]);
}

$conn->close();
?>