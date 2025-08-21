<?php
header('Content-Type: application/json');

// Pengaturan Database
$db_host = 'localhost'; $db_user = 'root'; $db_pass = ''; $db_name = 'simpeg';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['data' => []])); // Return format yang diharapkan DataTables
}

// Ambil parameter kelompok dari request
$kelompok = isset($_GET['kelompok']) ? $_GET['kelompok'] : '';

// Query utama untuk mengambil data pegawai
// Menggunakan LEFT JOIN untuk memastikan semua pegawai muncul meskipun belum ada data karir/jabatan
$sql = "
    SELECT 
        p.nama_lengkap, 
        p.nip,
        pkar.status_pegawai,
        pkar.tmt_pns AS mulai_kerja,
        (SELECT nama_jabatan FROM pegawai_jabatan WHERE pegawai_id = p.id ORDER BY tmt_jabatan DESC LIMIT 1) as jabatan_terakhir,
        pkar.jenjang_pendidikan
    FROM 
        pegawai p
    LEFT JOIN 
        pegawai_karir pkar ON p.id = pkar.pegawai_id
";

// Tambahkan kondisi WHERE jika ada filter kelompok
if (!empty($kelompok)) {
    // Menambahkan klausa HAVING untuk memfilter berdasarkan subquery jabatan
    $sql .= " HAVING jabatan_terakhir LIKE ?";
    $stmt = $conn->prepare($sql);
    $searchTerm = '%' . $kelompok . '%';
    $stmt->bind_param("s", $searchTerm);
} else {
    $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();
$pegawai_list = [];

while($row = $result->fetch_assoc()) {
    $pegawai_list[] = $row;
}

$stmt->close();
$conn->close();

// Format output yang dibutuhkan oleh DataTables
echo json_encode(['data' => $pegawai_list]);
?>