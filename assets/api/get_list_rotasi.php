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
        r.id,
        TRIM(CONCAT_WS(' ', pkar.gelar_depan, p.nama_lengkap, pkar.gelar_belakang)) AS nama_lengkap_gelar,
        p.nip,
        r.no_sk_rotasi,
        r.unit_kerja_sebelumnya,
        r.unit_kerja_baru,
        r.tanggal_rotasi,
        r.path_lampiran
    FROM 
        pegawai_rotasi r
    JOIN 
        pegawai p ON r.pegawai_id = p.id
    LEFT JOIN
        pegawai_karir pkar ON p.id = pkar.pegawai_id
    ORDER BY 
        r.tanggal_dibuat DESC
";

$result = $conn->query($sql);
$rotasi_list = [];
if ($result) {
    while($row = $result->fetch_assoc()) {
        $rotasi_list[] = $row;
    }
}

echo json_encode(['success' => true, 'data' => $rotasi_list]);
$conn->close();
?>