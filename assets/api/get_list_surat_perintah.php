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
        sp.id,
        TRIM(CONCAT_WS(' ', pkar.gelar_depan, p.nama_lengkap, pkar.gelar_belakang)) AS nama_lengkap_gelar,
        p.nip,
        sp.no_surat_perintah,
        sp.jabatan_tugas_baru,
        sp.tanggal_surat_perintah,
        sp.path_lampiran
    FROM 
        pegawai_surat_perintah sp
    JOIN 
        pegawai p ON sp.pegawai_id = p.id
    LEFT JOIN
        pegawai_karir pkar ON p.id = pkar.pegawai_id
    ORDER BY 
        sp.tanggal_dibuat DESC
";

$result = $conn->query($sql);
$surat_list = [];
if ($result) {
    while($row = $result->fetch_assoc()) {
        $surat_list[] = $row;
    }
}

echo json_encode(['success' => true, 'data' => $surat_list]);
$conn->close();
?>