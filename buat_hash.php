<?php
// Ganti password di sini jika Anda ingin yang lain
$password = 'admin123';

// Membuat hash
$hash = password_hash($password, PASSWORD_DEFAULT);

// Tampilkan hasilnya agar mudah disalin
echo "Password asli: " . $password . "<br>";
echo "Hasil Hash (salin ini): <br>";
echo "<b>" . $hash . "</b>";
?>