<?php
header('Content-Type: application/json');

// Pengaturan Database
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'simpeg';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    // Gunakan http_response_code untuk error server
    http_response_code(500);
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal: ' . $conn->connect_error]));
}

// Mulai Transaksi Database, ini sangat penting untuk integritas data
$conn->begin_transaction();

try {
    // 1. Insert data utama ke tabel `pegawai`
    $p = $_POST['pegawai'];
    $sql_pegawai = "INSERT INTO pegawai (nama_lengkap, nik, nip, kartu_pegawai, jenis_kelamin, golongan_darah, tempat_lahir, tanggal_lahir, agama, status_pernikahan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql_pegawai);
    if ($stmt === false) throw new Exception("Prepare statement pegawai gagal: " . $conn->error);
    $stmt->bind_param("ssssssssss", $p['nama_lengkap'], $p['nik'], $p['nip'], $p['kartu_pegawai'], $p['jenis_kelamin'], $p['golongan_darah'], $p['tempat_lahir'], $p['tanggal_lahir'], $p['agama'], $p['status_pernikahan']);
    $stmt->execute();
    
    $pegawai_id = $conn->insert_id;
    if ($pegawai_id == 0) throw new Exception("Gagal membuat data pegawai utama. Periksa apakah NIK/NIP duplikat.");

    // 2. Insert data fisik ke tabel `pegawai_fisik`
    if (isset($_POST['fisik']) && !empty(array_filter($_POST['fisik']))) {
        $f = $_POST['fisik'];
        $sql_fisik = "INSERT INTO pegawai_fisik (pegawai_id, tinggi_badan, berat_badan, rambut, bentuk_muka, kulit, ciri_khas, cacat_tubuh, hobi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql_fisik);
        if ($stmt === false) throw new Exception("Prepare statement fisik gagal: " . $conn->error);
        $stmt->bind_param("iisssssss", $pegawai_id, $f['tinggi_badan'], $f['berat_badan'], $f['rambut'], $f['bentuk_muka'], $f['kulit'], $f['ciri_khas'], $f['cacat_tubuh'], $f['hobi']);
        $stmt->execute();
    }

    // 3. Insert data kontak ke tabel `pegawai_kontak`
    if (isset($_POST['kontak']) && !empty(array_filter($_POST['kontak']))) {
        $k = $_POST['kontak'];
        $sql_kontak = "INSERT INTO pegawai_kontak (pegawai_id, email, no_hp, alamat, kecamatan, kelurahan, kabupaten, provinsi, kode_pos, no_taspen, no_bpjs, npwp, no_karis_karsu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql_kontak);
        if ($stmt === false) throw new Exception("Prepare statement kontak gagal: " . $conn->error);
        $stmt->bind_param("issssssssssss", $pegawai_id, $k['email'], $k['no_hp'], $k['alamat'], $k['kecamatan'], $k['kelurahan'], $k['kabupaten'], $k['provinsi'], $k['kode_pos'], $k['no_taspen'], $k['no_bpjs'], $k['npwp'], $k['no_karis_karsu']);
        $stmt->execute();
    }

    // 4. Insert data karir ke tabel `pegawai_karir`
    if (isset($_POST['karir']) && !empty(array_filter($_POST['karir']))) {
        $kr = $_POST['karir'];
        $sql_karir = "INSERT INTO pegawai_karir (pegawai_id, kampus_terakhir, jenjang_pendidikan, jurusan, tahun_lulus, gelar_depan, gelar_belakang, status_pegawai, golongan_terakhir, tmt_cpns, tmt_pns) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql_karir);
        if ($stmt === false) throw new Exception("Prepare statement karir gagal: " . $conn->error);
        $stmt->bind_param("issssssssss", $pegawai_id, $kr['kampus_terakhir'], $kr['jenjang_pendidikan'], $kr['jurusan'], $kr['tahun_lulus'], $kr['gelar_depan'], $kr['gelar_belakang'], $kr['status_pegawai'], $kr['golongan_terakhir'], $kr['tmt_cpns'], $kr['tmt_pns']);
        $stmt->execute();
    }

    // 5. Insert data orang tua
    if (isset($_POST['orang_tua'])) {
        $sql_ortu = "INSERT INTO pegawai_orang_tua (pegawai_id, status_orang_tua, nama_orang_tua, nik, tempat_lahir, tanggal_lahir, pekerjaan) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql_ortu);
        if ($stmt === false) throw new Exception("Prepare statement orang tua gagal: " . $conn->error);
        foreach ($_POST['orang_tua'] as $ortu) {
            if (!empty($ortu['nama_orang_tua'])) { // Hanya simpan jika nama diisi
                $stmt->bind_param("issssss", $pegawai_id, $ortu['status_orang_tua'], $ortu['nama_orang_tua'], $ortu['nik'], $ortu['tempat_lahir'], $ortu['tanggal_lahir'], $ortu['pekerjaan']);
                $stmt->execute();
            }
        }
    }

    // 6. Insert data pasangan
    if (isset($_POST['pasangan'])) {
        $sql_pasangan = "INSERT INTO pegawai_pasangan (pegawai_id, nama_pasangan, nik, status_pasangan, tempat_lahir, tanggal_lahir, status_pernikahan, tanggal_pernikahan, akta_pernikahan, tanggal_perceraian, akta_perceraian, pekerjaan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql_pasangan);
        if ($stmt === false) throw new Exception("Prepare statement pasangan gagal: " . $conn->error);
        foreach ($_POST['pasangan'] as $pasangan) {
            if (!empty($pasangan['nama_pasangan'])) {
                $stmt->bind_param("isssssssssss", $pegawai_id, $pasangan['nama_pasangan'], $pasangan['nik'], $pasangan['status_pasangan'], $pasangan['tempat_lahir'], $pasangan['tanggal_lahir'], $pasangan['status_pernikahan'], $pasangan['tanggal_pernikahan'], $pasangan['akta_pernikahan'], $pasangan['tanggal_perceraian'], $pasangan['akta_perceraian'], $pasangan['pekerjaan']);
                $stmt->execute();
            }
        }
    }

    // 7. Insert data anak
    if (isset($_POST['anak'])) {
        $sql_anak = "INSERT INTO pegawai_anak (pegawai_id, nama_anak, nik, status_anak, tempat_lahir, tanggal_lahir, akta_kelahiran, nama_ortu_pasangan, jenis_kelamin, jenjang_pendidikan, pekerjaan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql_anak);
        if ($stmt === false) throw new Exception("Prepare statement anak gagal: " . $conn->error);
        foreach ($_POST['anak'] as $anak) {
             if (!empty($anak['nama_anak'])) {
                $stmt->bind_param("issssssssss", $pegawai_id, $anak['nama_anak'], $anak['nik'], $anak['status_anak'], $anak['tempat_lahir'], $anak['tanggal_lahir'], $anak['akta_kelahiran'], $anak['nama_ortu_pasangan'], $anak['jenis_kelamin'], $anak['jenjang_pendidikan'], $anak['pekerjaan']);
                $stmt->execute();
            }
        }
    }
    
    // 8. Insert data saudara
    if (isset($_POST['saudara'])) {
        $sql_saudara = "INSERT INTO pegawai_saudara (pegawai_id, nama_saudara, nik, status_saudara, tempat_lahir, tanggal_lahir, jenis_kelamin, pekerjaan, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql_saudara);
        if ($stmt === false) throw new Exception("Prepare statement saudara gagal: " . $conn->error);
        foreach ($_POST['saudara'] as $saudara) {
            if (!empty($saudara['nama_saudara'])) {
                $stmt->bind_param("issssssss", $pegawai_id, $saudara['nama_saudara'], $saudara['nik'], $saudara['status_saudara'], $saudara['tempat_lahir'], $saudara['tanggal_lahir'], $saudara['jenis_kelamin'], $saudara['pekerjaan'], $saudara['keterangan']);
                $stmt->execute();
            }
        }
    }

    // Jika semua query di atas berhasil, simpan semua perubahan secara permanen
    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Semua data pegawai berhasil disimpan.']);

} catch (Exception $e) {
    // Jika ada satu saja query yang gagal, batalkan semua perubahan yang sudah terjadi
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Terjadi error: ' . $e->getMessage()]);
}

if (isset($stmt)) {
    $stmt->close();
}
$conn->close();
?>