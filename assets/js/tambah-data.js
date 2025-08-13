document.addEventListener('DOMContentLoaded', function() {
    // Pastikan skrip ini hanya berjalan di halaman tambah-data.html
    const form = document.getElementById('form-tambah-pegawai');
    if (!form) {
        return;
    }

    const steps = Array.from(form.querySelectorAll('.form-step'));
    const nextBtn = document.getElementById('btn-next');
    const prevBtn = document.getElementById('btn-prev');
    const submitBtn = document.getElementById('btn-submit');
    
    let currentStep = 0;

    // --- FUNGSI UTAMA UNTUK NAVIGASI ---
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        updateButtons();
    }

    function updateButtons() {
        prevBtn.style.display = currentStep === 0 ? 'none' : 'inline-block';
        nextBtn.style.display = currentStep === steps.length - 1 ? 'none' : 'inline-block';
        submitBtn.style.display = currentStep === steps.length - 1 ? 'inline-block' : 'none';
    }

    // --- EVENT LISTENER UNTUK TOMBOL ---
    nextBtn.addEventListener('click', () => {
        const currentStepFields = steps[currentStep].querySelectorAll('[required]');
        let allValid = true;
        currentStepFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = 'red';
                allValid = false;
            } else {
                field.style.borderColor = '#ddd';
            }
        });

        if (allValid) {
            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        } else {
            alert('Harap isi semua kolom yang wajib diisi.');
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
    
    // --- FUNGSI UNTUK MENAMBAH BARIS DINAMIS (ANAK/SAUDARA) ---
    function setupDynamicRows(containerId, buttonId, templateId) {
        const addButton = document.getElementById(buttonId);
        const template = document.getElementById(templateId);
        const container = document.getElementById(containerId);

        if(addButton && template && container){ // Pengecekan tambahan
            addButton.addEventListener('click', () => {
                const clone = template.content.cloneNode(true);
                container.appendChild(clone);
            });
        }
    }

    // [PEMBETULAN] Panggil fungsi yang sudah Anda buat di sini
    setupDynamicRows('container-anak', 'btn-tambah-anak', 'template-anak');
    setupDynamicRows('container-saudara', 'btn-tambah-saudara', 'template-saudara');


    // --- FUNGSI UNTUK SUBMIT FORM ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Menyimpan...';

        const formData = new FormData(this);
        
        fetch('assets/api/add_pegawai_lengkap.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                window.location.href = 'data-personal.html';
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan koneksi. Cek console untuk detail.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Simpan Data';
        });
    });

    // Tampilkan langkah pertama saat halaman dimuat
    showStep(currentStep);
});