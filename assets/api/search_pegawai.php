<?php
// Pengaturan Koneksi Database
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'simpeg';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

$searchTerm = isset($_GET['term']) ? $_GET['term'] : '';

$pegawai = [];
if (!empty($searchTerm)) {
    $searchQuery = "%" . $searchTerm . "%";

    // DIUBAH: Tambahkan 'nik' di dalam SELECT
    $sql = "SELECT id, nama_lengkap, nip, nik FROM pegawai WHERE nama_lengkap LIKE ? OR nip LIKE ? OR nik LIKE ? LIMIT 10";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $searchQuery, $searchQuery, $searchQuery);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $pegawai[] = $row;
    }
    $stmt->close();
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($pegawai);
?>