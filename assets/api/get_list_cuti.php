<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

$sql = "
    SELECT 
        c.id,
        p.nama_lengkap,
        p.nip,
        c.jenis_cuti,
        c.tanggal_mulai,
        c.tanggal_selesai,
        c.status_pengajuan
    FROM 
        pegawai_cuti c
    JOIN 
        pegawai p ON c.pegawai_id = p.id
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