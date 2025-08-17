<?php
header('Content-Type: application/json');
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

$sql = "
    SELECT 
        m.id,
        p.nama_lengkap,
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