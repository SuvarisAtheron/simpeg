document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-edit-pegawai');
    if (!form) return;

    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get('id');
    if (!employeeId) {
        alert('ID Pegawai tidak valid.');
        window.location.href = 'data-personal.html';
        return;
    }
    
    // Tambahkan input hidden untuk ID pegawai
    const hiddenIdInput = document.createElement('input');
    hiddenIdInput.type = 'hidden';
    hiddenIdInput.name = 'pegawai_id';
    hiddenIdInput.value = employeeId;
    form.prepend(hiddenIdInput);


    const fillValueByName = (name, value) => {
        const el = form.querySelector(`[name="${name}"]`);
        if (el) el.value = value || '';
    };

    fetch(`assets/api/get_data_personal.php?id=${employeeId}`)
        .then(res => res.json())
        .then(data => {
            if (!data) {
                alert('Data pegawai tidak ditemukan.');
                return;
            }

            // Pegawai, fisik, kontak, karir
            for (const key in data) {
                if (typeof data[key] !== 'object' && data[key] !== null) {
                    fillValueByName(`pegawai[${key}]`, data[key]);
                    fillValueByName(`fisik[${key}]`, data[key]);
                    fillValueByName(`kontak[${key}]`, data[key]);
                    fillValueByName(`karir[${key}]`, data[key]);
                }
            }

            // Orang tua
            if (data.orang_tua) {
                if (data.orang_tua["bapak kandung"]) {
                    const bapak = data.orang_tua["bapak kandung"];
                    for (const key in bapak) {
                        if (key !== "status_orang_tua")
                            fillValueByName(`orang_tua[bapak][${key}]`, bapak[key]);
                    }
                }
                if (data.orang_tua["ibu kandung"]) {
                    const ibu = data.orang_tua["ibu kandung"];
                    for (const key in ibu) {
                        if (key !== "status_orang_tua")
                            fillValueByName(`orang_tua[ibu][${key}]`, ibu[key]);
                    }
                }
            }

            // Pasangan
            if (data.pasangan && data.pasangan.length > 0) {
                const pasangan = data.pasangan[0];
                for (const key in pasangan) {
                    if (key !== "pegawai_id" && key !== "id")
                        fillValueByName(`pasangan[0][${key}]`, pasangan[key]);
                }
            }

            // Anak
            if (data.anak && data.anak.length > 0) {
                const anakContainer = document.getElementById('container-anak');
                anakContainer.innerHTML = ''; // Kosongkan dulu
                data.anak.forEach(anak => {
                    const tpl = document.getElementById('template-anak').content.cloneNode(true);
                    for (const key in anak) {
                        const field = tpl.querySelector(`[name="anak[][${key}]"]`);
                        if(field) field.value = anak[key] || '';
                    }
                    anakContainer.appendChild(tpl);
                });
            }

            // Saudara
            if (data.saudara && data.saudara.length > 0) {
                const saudaraContainer = document.getElementById('container-saudara');
                saudaraContainer.innerHTML = ''; // Kosongkan dulu
                data.saudara.forEach(saudara => {
                    const tpl = document.getElementById('template-saudara').content.cloneNode(true);
                     for (const key in saudara) {
                        const field = tpl.querySelector(`[name="saudara[][${key}]"]`);
                        if(field) field.value = saudara[key] || '';
                    }
                    saudaraContainer.appendChild(tpl);
                });
            }
        })
        .catch(err => console.error(err));
        
    // --- FUNGSI UNTUK MENAMBAH BARIS DINAMIS (ANAK/SAUDARA) ---
    function setupDynamicRows(containerId, buttonId, templateId) {
        const addButton = document.getElementById(buttonId);
        const template = document.getElementById(templateId);
        const container = document.getElementById(containerId);

        if(addButton && template && container){ 
            addButton.addEventListener('click', () => {
                const clone = template.content.cloneNode(true);
                container.appendChild(clone);
            });
        }
    }

    setupDynamicRows('container-anak', 'btn-tambah-anak', 'template-anak');
    setupDynamicRows('container-saudara', 'btn-tambah-saudara', 'template-saudara');

    // Multi step form
    const steps = Array.from(form.querySelectorAll('.form-step'));
    const nextBtn = document.getElementById('btn-next');
    const prevBtn = document.getElementById('btn-prev');
    const submitBtn = document.getElementById('btn-submit');
    let currentStep = 0;

    function showStep(i) {
        steps.forEach((step, idx) => {
            step.classList.toggle('active', idx === i);
        });
        prevBtn.style.display = i === 0 ? 'none' : 'inline-block';
        nextBtn.style.display = i === steps.length - 1 ? 'none' : 'inline-block';
        submitBtn.style.display = i === steps.length - 1 ? 'inline-block' : 'none';
    }

    nextBtn.addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Updating...';

        const formData = new FormData(form);

        fetch('assets/api/update_pegawai.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                window.location.href = `data-personal.html`;
            }
        })
        .catch(err => {
            console.error('Update Error:', err);
            alert('Terjadi kesalahan saat update.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Update Data';
        });
    });

    showStep(currentStep);
});