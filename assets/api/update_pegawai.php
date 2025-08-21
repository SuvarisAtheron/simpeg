<?php
header('Content-Type: application/json');

// Pengaturan Database
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'simpeg';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['success' => false, 'message' => 'Koneksi gagal: ' . $conn->connect_error]));
}

$pegawai_id = $_POST['pegawai_id'] ?? 0;
if ($pegawai_id <= 0) {
    http_response_code(400);
    die(json_encode(['success' => false, 'message' => 'ID Pegawai tidak valid.']));
}

$conn->begin_transaction();

try {
    // 1. Update Tabel `pegawai`
    $p = $_POST['pegawai'];
    $sql_pegawai = "UPDATE pegawai SET nama_lengkap=?, nik=?, nip=?, kartu_pegawai=?, jenis_kelamin=?, golongan_darah=?, tempat_lahir=?, tanggal_lahir=?, agama=?, status_pernikahan=? WHERE id=?";
    $stmt_pegawai = $conn->prepare($sql_pegawai);
    $stmt_pegawai->bind_param("ssssssssssi", $p['nama_lengkap'], $p['nik'], $p['nip'], $p['kartu_pegawai'], $p['jenis_kelamin'], $p['golongan_darah'], $p['tempat_lahir'], $p['tanggal_lahir'], $p['agama'], $p['status_pernikahan'], $pegawai_id);
    $stmt_pegawai->execute();
    $stmt_pegawai->close();

    // 2. Update atau Insert `pegawai_fisik`
    if (isset($_POST['fisik'])) {
        $f = $_POST['fisik'];
        $sql_fisik_check = "SELECT id FROM pegawai_fisik WHERE pegawai_id = ?";
        $stmt_check = $conn->prepare($sql_fisik_check);
        $stmt_check->bind_param("i", $pegawai_id);
        $stmt_check->execute();
        $result = $stmt_check->get_result();
        if ($result->num_rows > 0) {
            $sql_fisik = "UPDATE pegawai_fisik SET tinggi_badan=?, berat_badan=?, rambut=?, bentuk_muka=?, kulit=?, ciri_khas=?, cacat_tubuh=?, hobi=? WHERE pegawai_id=?";
            $stmt_fisik = $conn->prepare($sql_fisik);
            $stmt_fisik->bind_param("iissssssi", $f['tinggi_badan'], $f['berat_badan'], $f['rambut'], $f['bentuk_muka'], $f['kulit'], $f['ciri_khas'], $f['cacat_tubuh'], $f['hobi'], $pegawai_id);
        } else {
            $sql_fisik = "INSERT INTO pegawai_fisik (tinggi_badan, berat_badan, rambut, bentuk_muka, kulit, ciri_khas, cacat_tubuh, hobi, pegawai_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt_fisik = $conn->prepare($sql_fisik);
            $stmt_fisik->bind_param("iissssssi", $f['tinggi_badan'], $f['berat_badan'], $f['rambut'], $f['bentuk_muka'], $f['kulit'], $f['ciri_khas'], $f['cacat_tubuh'], $f['hobi'], $pegawai_id);
        }
        $stmt_fisik->execute();
        $stmt_fisik->close();
    }
    
    // Hapus data anak dan saudara yang lama sebelum memasukkan yang baru
    $conn->query("DELETE FROM pegawai_anak WHERE pegawai_id = $pegawai_id");
    $conn->query("DELETE FROM pegawai_saudara WHERE pegawai_id = $pegawai_id");
    $conn->query("DELETE FROM pegawai_orang_tua WHERE pegawai_id = $pegawai_id");

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

    // Lakukan hal yang sama untuk tabel lain (kontak, karir, pasangan)

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Data pegawai berhasil diperbarui.']);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal memperbarui data: ' . $e->getMessage()]);
}

$conn->close();
?>