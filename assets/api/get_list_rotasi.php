<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

$sql = "
    SELECT 
        r.id,
        p.nama_lengkap,
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