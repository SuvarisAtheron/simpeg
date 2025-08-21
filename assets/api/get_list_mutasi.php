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
        m.id,
        TRIM(CONCAT_WS(' ', pkar.gelar_depan, p.nama_lengkap, pkar.gelar_belakang)) AS nama_lengkap_gelar,
        p.nip,
        m.no_sk_mutasi,
        m.unit_kerja_sebelumnya,
        m.instansi_baru,
        m.tanggal_mutasi,
        m.path_lampiran
    FROM 
        pegawai_mutasi m
    JOIN 
        pegawai p ON m.pegawai_id = p.id
    LEFT JOIN
        pegawai_karir pkar ON p.id = pkar.pegawai_id
    ORDER BY 
        m.tanggal_dibuat DESC
";

$result = $conn->query($sql);
$mutasi_list = [];
if ($result) {
    while($row = $result->fetch_assoc()) {
        $mutasi_list[] = $row;
    }
}

echo json_encode(['success' => true, 'data' => $mutasi_list]);
$conn->close();
?>