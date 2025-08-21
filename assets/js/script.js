document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('login-form'); // Beri ID pada form Anda

    // Fungsi untuk menampilkan/menyembunyikan password
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Fungsi untuk menangani proses login
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Mencegah form berpindah halaman secara default

            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Loading...`;

            fetch('assets/api/login_process.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Jika login berhasil, arahkan ke dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    // Jika gagal, tampilkan pesan error
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan koneksi.');
            })
            .finally(() => {
                // Kembalikan tombol ke keadaan semula
                submitButton.disabled = false;
                submitButton.innerHTML = `Login`;
            });
        });
    }
});