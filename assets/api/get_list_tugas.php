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
        t.id,
        TRIM(CONCAT_WS(' ', pkar.gelar_depan, p.nama_lengkap, pkar.gelar_belakang)) AS nama_lengkap_gelar,
        p.nip,
        t.no_surat_tugas,
        t.lokasi_kegiatan,
        t.tanggal_mulai,
        t.tanggal_selesai,
        t.path_file
    FROM 
        pegawai_tugas t
    JOIN 
        pegawai p ON t.pegawai_id = p.id
    LEFT JOIN
        pegawai_karir pkar ON p.id = pkar.pegawai_id
    ORDER BY 
        t.tanggal_dibuat DESC
";

$result = $conn->query($sql);
$tugas_list = [];
if ($result) {
    while($row = $result->fetch_assoc()) {
        $tugas_list[] = $row;
    }
}

echo json_encode(['success' => true, 'data' => $tugas_list]);
$conn->close();
?>