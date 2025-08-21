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
        c.id,
        TRIM(CONCAT_WS(' ', pkar.gelar_depan, p.nama_lengkap, pkar.gelar_belakang)) AS nama_lengkap_gelar,
        p.nip,
        c.jenis_cuti,
        c.tanggal_mulai,
        c.tanggal_selesai,
        c.status_pengajuan
    FROM 
        pegawai_cuti c
    JOIN 
        pegawai p ON c.pegawai_id = p.id
    LEFT JOIN
        pegawai_karir pkar ON p.id = pkar.pegawai_id
    ORDER BY 
        c.tanggal_pengajuan DESC
";

$result = $conn->query($sql);
$cuti_list = [];
if ($result) {
    while($row = $result->fetch_assoc()) {
        $cuti_list[] = $row;
    }
}

echo json_encode(['success' => true, 'data' => $cuti_list]);
$conn->close();
?>