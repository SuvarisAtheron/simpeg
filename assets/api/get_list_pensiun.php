<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal']));
}

// Query yang sudah dimodifikasi untuk mengambil nama lengkap dengan gelar
$sql = "
    SELECT 
        pen.id,
        TRIM(CONCAT_WS(' ', pkar.gelar_depan, p.nama_lengkap, pkar.gelar_belakang)) AS nama_lengkap_gelar,
        p.nip,
        pen.no_sk_pensiun,
        pen.tanggal_pensiun,
        pen.path_lampiran
    FROM 
        pegawai_pensiun pen
    JOIN 
        pegawai p ON pen.pegawai_id = p.id
    LEFT JOIN
        pegawai_karir pkar ON p.id = pkar.pegawai_id
    ORDER BY 
        pen.tanggal_dibuat DESC
";

$result = $conn->query($sql);
$pensiun_list = [];
if ($result) {
    while($row = $result->fetch_assoc()) {
        $pensiun_list[] = $row;
    }
}

echo json_encode(['success' => true, 'data' => $pensiun_list]);
$conn->close();
?>