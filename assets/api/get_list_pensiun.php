<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

$sql = "
    SELECT 
        pen.id,
        p.nama_lengkap,
        p.nip,
        pen.no_sk_pensiun,
        pen.tanggal_pensiun,
        pen.path_lampiran
    FROM 
        pegawai_pensiun pen
    JOIN 
        pegawai p ON pen.pegawai_id = p.id
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