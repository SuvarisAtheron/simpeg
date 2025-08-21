<?php
header('Content-Type: application/json');

// Pengaturan Database
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'simpeg';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Koneksi database gagal.']));
}

// Query untuk mengambil data surat dan menggabungkannya dengan nama pegawai
$sql = "
    SELECT 
        s.id,
        s.jenis_surat,
        s.no_surat,
        s.tanggal_surat,
        p.nama_lengkap,
        p.nip
    FROM 
        pegawai_surat_lainnya s
    JOIN 
        pegawai p ON s.pegawai_id = p.id
    ORDER BY 
        s.tanggal_dibuat DESC
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