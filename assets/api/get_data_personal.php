<?php
// Pengaturan Koneksi Database
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'simpeg';

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Koneksi gagal: ' . $conn->connect_error]);
    exit();
}

$pegawai_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$data = null;

if ($pegawai_id > 0) {
    // 1. Ambil data utama
    $sql_main = "
        SELECT 
            p.id, p.nama_lengkap, p.nik, p.nip, p.kartu_pegawai, p.jenis_kelamin, p.golongan_darah, p.tempat_lahir, p.tanggal_lahir, p.agama, p.status_pernikahan,
            pf.tinggi_badan, pf.berat_badan, pf.rambut, pf.bentuk_muka, pf.kulit, pf.ciri_khas, pf.cacat_tubuh, pf.hobi,
            pk.email, pk.no_hp, pk.alamat, pk.kecamatan, pk.kelurahan, pk.kabupaten, pk.provinsi, pk.kode_pos, pk.no_taspen, pk.no_bpjs, pk.npwp, pk.no_karis_karsu,
            pkar.kampus_terakhir, pkar.jenjang_pendidikan, pkar.jurusan, pkar.tahun_lulus, pkar.gelar_depan, pkar.gelar_belakang, pkar.status_pegawai, pkar.golongan_terakhir, pkar.tmt_cpns, pkar.tmt_pns
        FROM pegawai p
        LEFT JOIN pegawai_fisik pf ON p.id = pf.pegawai_id
        LEFT JOIN pegawai_kontak pk ON p.id = pk.pegawai_id
        LEFT JOIN pegawai_karir pkar ON p.id = pkar.pegawai_id
        WHERE p.id = ?
    ";
    
    $stmt_main = $conn->prepare($sql_main);
    $stmt_main->bind_param("i", $pegawai_id);
    $stmt_main->execute();
    $result_main = $stmt_main->get_result();
    $data = $result_main->fetch_assoc();
    $stmt_main->close();

    if ($data) {
        // 2. Ambil data orang tua
        $data['orang_tua'] = [];
        $sql_ortu = "SELECT status_orang_tua, nama_orang_tua, nik, tempat_lahir, tanggal_lahir, pekerjaan FROM pegawai_orang_tua WHERE pegawai_id = ?";
        $stmt_ortu = $conn->prepare($sql_ortu);
        if($stmt_ortu) {
            $stmt_ortu->bind_param("i", $pegawai_id);
            $stmt_ortu->execute();
            $result_ortu = $stmt_ortu->get_result();
            while ($row_ortu = $result_ortu->fetch_assoc()) {
                // Perbaikan Logika: Gunakan status_orang_tua sebagai key
                if($row_ortu['status_orang_tua'] == 'ayah') {
                   $data['orang_tua']['bapak kandung'] = $row_ortu;
                } else if ($row_ortu['status_orang_tua'] == 'ibu') {
                   $data['orang_tua']['ibu kandung'] = $row_ortu;
                }
            }
            $stmt_ortu->close();
        }

        // 3. Ambil data pasangan
        $data['pasangan'] = [];
        $sql_pasangan = "SELECT * FROM pegawai_pasangan WHERE pegawai_id = ?";
        $stmt_pasangan = $conn->prepare($sql_pasangan);
        if ($stmt_pasangan) {
            $stmt_pasangan->bind_param("i", $pegawai_id);
            $stmt_pasangan->execute();
            $result_pasangan = $stmt_pasangan->get_result();
            while ($row_pasangan = $result_pasangan->fetch_assoc()) {
                $data['pasangan'][] = $row_pasangan;
            }
            $stmt_pasangan->close();
        }

        // 4. Ambil data anak
        $data['anak'] = [];
        $sql_anak = "SELECT * FROM pegawai_anak WHERE pegawai_id = ?";
        $stmt_anak = $conn->prepare($sql_anak);
        if ($stmt_anak) {
            $stmt_anak->bind_param("i", $pegawai_id);
            $stmt_anak->execute();
            $result_anak = $stmt_anak->get_result();
            while ($row_anak = $result_anak->fetch_assoc()) {
                $data['anak'][] = $row_anak;
            }
            $stmt_anak->close();
        }
        
        // 5. [BARU] Ambil data saudara
        $data['saudara'] = []; // Inisialisasi sebagai array kosong
        $sql_saudara = "SELECT * FROM pegawai_saudara WHERE pegawai_id = ?";
        $stmt_saudara = $conn->prepare($sql_saudara);
        if ($stmt_saudara) {
            $stmt_saudara->bind_param("i", $pegawai_id);
            $stmt_saudara->execute();
            $result_saudara = $stmt_saudara->get_result();
            while ($row_saudara = $result_saudara->fetch_assoc()) {
                $data['saudara'][] = $row_saudara; // Masukkan setiap saudara ke dalam array
            }
            $stmt_saudara->close();
        }
    }
}

$conn->close();

echo json_encode($data);
?>