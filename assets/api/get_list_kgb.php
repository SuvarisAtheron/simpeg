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
        kgb.id,
        TRIM(CONCAT_WS(' ', pkar.gelar_depan, p.nama_lengkap, pkar.gelar_belakang)) AS nama_lengkap_gelar,
        p.nip,
        kgb.bulan_pengajuan,
        kgb.tahun_pengajuan,
        kgb.path_lampiran,
        kgb.tanggal_dibuat
    FROM 
        pegawai_kgb kgb
    JOIN 
        pegawai p ON kgb.pegawai_id = p.id
    LEFT JOIN
        pegawai_karir pkar ON p.id = pkar.pegawai_id
    ORDER BY 
        kgb.tahun_pengajuan DESC, kgb.bulan_pengajuan DESC
";

$result = $conn->query($sql);
$kgb_list = [];
if ($result) {
    while($row = $result->fetch_assoc()) {
        $kgb_list[] = $row;
    }
}

echo json_encode(['success' => true, 'data' => $kgb_list]);
$conn->close();
?>