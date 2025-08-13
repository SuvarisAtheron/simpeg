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
    die(json_encode(['error' => 'Koneksi gagal: ' . $conn->connect_error]));
}

$pegawai_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($pegawai_id <= 0) {
    http_response_code(400);
    die(json_encode(['error' => 'ID Pegawai tidak valid.']));
}

$riwayat = [];

// Fungsi bantuan untuk menjalankan query dan mengambil data
function fetch_data($conn, $sql, $pegawai_id) {
    $data = [];
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("i", $pegawai_id);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        $stmt->close();
    }
    return $data;
}

// Ambil data dari semua tabel riwayat yang sudah kita buat
$riwayat['bahasa'] = fetch_data($conn, "SELECT * FROM pegawai_bahasa WHERE pegawai_id = ?", $pegawai_id);
$riwayat['jabatan'] = fetch_data($conn, "SELECT * FROM pegawai_jabatan WHERE pegawai_id = ?", $pegawai_id);
$riwayat['pangkat'] = fetch_data($conn, "SELECT * FROM pegawai_pangkat WHERE pegawai_id = ?", $pegawai_id);
$riwayat['organisasi'] = fetch_data($conn, "SELECT * FROM pegawai_organisasi WHERE pegawai_id = ?", $pegawai_id);
$riwayat['pendidikan'] = fetch_data($conn, "SELECT * FROM pegawai_pendidikan WHERE pegawai_id = ?", $pegawai_id);
$riwayat['diklat'] = fetch_data($conn, "SELECT * FROM pegawai_diklat WHERE pegawai_id = ?", $pegawai_id);
$riwayat['penghargaan'] = fetch_data($conn, "SELECT * FROM pegawai_penghargaan WHERE pegawai_id = ?", $pegawai_id);

$conn->close();

echo json_encode($riwayat);
?>