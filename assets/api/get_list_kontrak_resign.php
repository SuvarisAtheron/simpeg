<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

$response = [
    'success' => true,
    'kontrak' => [],
    'resign' => []
];

// Ambil data kontrak
$sql_kontrak = "
    SELECT k.id, p.nama_lengkap, p.nip, k.no_sk_kontrak, k.jabatan, k.tanggal_sign, k.path_lampiran
    FROM pegawai_kontrak k
    JOIN pegawai p ON k.pegawai_id = p.id
    ORDER BY k.tanggal_dibuat DESC
";
$result_kontrak = $conn->query($sql_kontrak);
while($row = $result_kontrak->fetch_assoc()) {
    $response['kontrak'][] = $row;
}

// Ambil data resign
$sql_resign = "
    SELECT r.id, p.nama_lengkap, p.nip, r.jabatan, r.tanggal_resign, r.alasan, r.path_lampiran
    FROM pegawai_resign r
    JOIN pegawai p ON r.pegawai_id = p.id
    ORDER BY r.tanggal_dibuat DESC
";
$result_resign = $conn->query($sql_resign);
while($row = $result_resign->fetch_assoc()) {
    $response['resign'][] = $row;
}

echo json_encode($response);
$conn->close();
?>