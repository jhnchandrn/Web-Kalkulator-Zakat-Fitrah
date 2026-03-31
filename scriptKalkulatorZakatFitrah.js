// Utility functions
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

function showNotification(message, type = 'error') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function saveToLocalStorage(data) {
    localStorage.setItem('zakatData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem('zakatData');
    return data ? JSON.parse(data) : null;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    const savedData = loadFromLocalStorage();
    if (savedData) {
        document.getElementById('namaKepala').value = savedData.namaKepala || '';
        document.getElementById('jumlahAnggota').value = savedData.jumlahAnggota || '';
        
        if (savedData.jenisZakat) {
            document.querySelector(`input[name="jenisZakat"][value="${savedData.jenisZakat}"]`).checked = true;
            toggleHargaBeras(savedData.jenisZakat);
            
            if (savedData.jenisZakat === 'uang' && savedData.hargaBeras) {
                document.getElementById('hargaBeras').value = savedData.hargaBeras;
            }
        }
    }

    // Event listeners
    const form = document.getElementById('zakatForm');
    const jenisRadios = document.querySelectorAll('input[name="jenisZakat"]');
    const resetBtn = document.getElementById('resetBtn');
    const hitungLagiBtn = document.getElementById('hitungLagiBtn');

    // Toggle harga beras input
    jenisRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            toggleHargaBeras(this.value);
        });
    });

    // Form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        hitungZakat();
    });

    // Reset buttons
    resetBtn.addEventListener('click', resetForm);
    hitungLagiBtn.addEventListener('click', resetForm);
});

function toggleHargaBeras(jenis) {
    const inputHarga = document.getElementById('inputHargaBeras');
    const hargaInput = document.getElementById('hargaBeras');
    
    if (jenis === 'uang') {
        inputHarga.classList.remove('hidden');
        hargaInput.required = true;
        hargaInput.focus();
    } else {
        inputHarga.classList.add('hidden');
        hargaInput.required = false;
        hargaInput.value = '';
    }
}

function validateForm() {
    const nama = document.getElementById('namaKepala').value.trim();
    const jumlah = parseInt(document.getElementById('jumlahAnggota').value);
    const jenis = document.querySelector('input[name="jenisZakat"]:checked');
    const harga = document.getElementById('hargaBeras').value;

    if (!nama) {
        showNotification('Nama kepala keluarga harus diisi');
        return false;
    }

    if (!jumlah || jumlah < 1) {
        showNotification('Jumlah anggota keluarga harus lebih dari 0');
        return false;
    }

    if (!jenis) {
        showNotification('Pilih jenis zakat');
        return false;
    }

    if (jenis.value === 'uang' && (!harga || parseFloat(harga) <= 0)) {
        showNotification('Masukkan harga beras yang valid');
        return false;
    }

    return true;
}

function hitungZakat() {
    if (!validateForm()) return;

    // Get form data
    const data = {
        namaKepala: document.getElementById('namaKepala').value.trim(),
        jumlahAnggota: parseInt(document.getElementById('jumlahAnggota').value),
        jenisZakat: document.querySelector('input[name="jenisZakat"]:checked').value,
        hargaBeras: document.getElementById('hargaBeras').value || 0
    };

    saveToLocalStorage(data);

    const ZAKAT_PER_ORANG = 2.5; // kg

    let hasilPerOrang, totalZakat;

    if (data.jenisZakat === 'beras') {
        hasilPerOrang = `${ZAKAT_PER_ORANG} kg`;
        totalZakat = data.jumlahAnggota * ZAKAT_PER_ORANG;
    } else {
        const hargaPerKg = parseFloat(data.hargaBeras);
        hasilPerOrang = formatRupiah(hargaPerKg * ZAKAT_PER_ORANG);
        totalZakat = data.jumlahAnggota * (hargaPerKg * ZAKAT_PER_ORANG);
    }

    // Display results
    tampilkanHasil(data, hasilPerOrang, totalZakat);
}

function tampilkanHasil(data, hasilPerOrang, totalZakat) {
    const resultContent = document.getElementById('resultContent');
    const resultCard = document.getElementById('resultCard');
    const inputCard = document.querySelector('.input-card');

    resultContent.innerHTML = `
        <div class="result-item">
            <span class="result-label"><i class="fas fa-user"></i> Nama Kepala Keluarga:</span>
            <span class="result-value">${data.namaKepala}</span>
        </div>
        <div class="result-item">
            <span class="result-label"><i class="fas fa-users"></i> Jumlah Anggota Keluarga:</span>
            <span class="result-value">${data.jumlahAnggota} orang</span>
        </div>
        <div class="result-item">
            <span class="result-label"><i class="fas fa-${data.jenisZakat === 'beras' ? 'seedling' : 'coins'}"></i> Jenis Zakat:</span>
            <span class="result-value">${data.jenisZakat === 'beras' ? 'Beras' : 'Uang'}</span>
        </div>
        ${data.jenisZakat === 'uang' ? `
        <div class="result-item">
            <span class="result-label"><i class="fas fa-tag"></i> Harga Beras per Kg:</span>
            <span class="result-value">${formatRupiah(parseFloat(data.hargaBeras))}</span>
        </div>
        ` : ''}
        <div class="result-item">
            <span class="result-label"><i class="fas fa-calculator"></i> Zakat per Orang:</span>
            <span class="result-value">${hasilPerOrang}</span>
        </div>
        <div class="result-item">
            <span class="result-label"><i class="fas fa-hand-holding-heart"></i> Total Zakat Fitrah:</span>
            <span class="total-value">${data.jenisZakat === 'beras' ? totalZakat.toFixed(1) + ' kg beras' : formatRupiah(totalZakat)}</span>
        </div>
    `;

    // Show result card with animation
    document.querySelector('.input-card').style.transform = 'translateY(20px)';
    document.querySelector('.input-card').style.opacity = '0.7';
    
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth' });

    showNotification('Perhitungan selesai!', 'success');
}

function resetForm() {
    document.getElementById('zakatForm').reset();
    document.getElementById('inputHargaBeras').classList.add('hidden');
    document.getElementById('resultCard').classList.add('hidden');
    
    // Reset animations
    document.querySelector('.input-card').style.transform = 'translateY(0)';
    document.querySelector('.input-card').style.opacity = '1';
    
    localStorage.removeItem('zakatData');
    
    // Scroll to top
    document.querySelector('.input-card').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Form telah direset');
}
