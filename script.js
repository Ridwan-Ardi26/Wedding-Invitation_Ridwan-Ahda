document.addEventListener("DOMContentLoaded", function () {
    
    // Inisialisasi Plugins Animasi AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,          // Durasi 1 detik (pas untuk kehalusan seperti di video)
        easing: 'ease-out-cubic',// Gerakan melayang yang melambat di akhir, sangat elegan
        once: false,             // Set 'false' agar saat di-scroll ke atas, elemennya hilang dan bisa muncul lagi
        offset: 80,              // Jarak pemicu animasi dari bawah layar
        anchorPlacement: 'top-bottom'
    });

    // Node & Element Selections
    const btnOpen = document.getElementById("btn-open");
    const coverPage = document.getElementById("cover-page");
    const mainContent = document.getElementById("main-content");
    const bgMusic = document.getElementById("bg-music");
    const btnPlayPause = document.getElementById("btn-play-pause");
    const floatingAudioBtn = document.getElementById("floating-audio-btn");
    const formRSVP = document.getElementById("form-rsvp");
    const rsvpList = document.getElementById("rsvp-list");
    const progressBarContainer = document.querySelector('.progress-bar-custom');
    const progressFill = document.querySelector('.progress-fill-custom');
    const progressDot = document.querySelector('.progress-dot');
    const currentTimeEl = document.querySelector('.current-time');
    const totalTimeEl = document.querySelector('.total-time');
    // ==========================================
    // FITUR: MENGAMBIL NAMA TAMU DARI URL
    // ==========================================
    // 1. Tangkap parameter '?to=' dari link browser
    const urlParams = new URLSearchParams(window.location.search);
    const guestNameFromUrl = urlParams.get('to');

    // 2. Cari elemen HTML tempat nama tamu akan ditampilkan
    // Berdasarkan struktur HTML-mu, ID-nya adalah "guest-name"
    const guestNameElement = document.getElementById('guest-name');

    // 3. Jika ada nama di dalam URL, ganti teks defaultnya
    if (guestNameFromUrl && guestNameElement) {
        // decodeURIComponent berguna agar spasi (biasanya ditulis %20 di link) kembali menjadi spasi biasa
        guestNameElement.innerText = decodeURIComponent(guestNameFromUrl);
    }

    // ==========================================
    // INTERAKSI FITUR: OPEN INVITATION
    // ==========================================
    btnOpen.addEventListener("click", function () {
        
        // 1. WAJIB ADA DI SINI UNTUK IOS:
        // Panggil fungsi playAudio() seketika saat jari user menyentuh layar
        playAudio(); 

        // 2. Efek transisi smooth fade out cover & fade in konten utama
        coverPage.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        coverPage.style.opacity = "0";
        coverPage.style.transform = "translateY(-20px)"; // Sedikit efek naik saat cover hilang
        
        setTimeout(() => {
            coverPage.classList.add("hidden");
            mainContent.classList.remove("hidden");
            floatingAudioBtn.classList.remove("hidden");
            
            // Scroll otomatis mulus ke halaman atas konten utama
            window.scrollTo({ top: 0, behavior: 'instant' });

            // BERIKAN JEDA 100ms UNTUK MENCEGAH BUG AOS
            setTimeout(() => {
                AOS.refresh();
            }, 100);

        }, 800);
    });

    // ==========================================
    // CONTROLLER AUDIO / MUSIC LAYER
    // ==========================================
    let isPlaying = false;

    function playAudio() {
        bgMusic.play().then(() => {
            isPlaying = true;
            updateAudioUI(true);
        }).catch(err => console.log("Audio play diblokir oleh browser:", err));
    }

    function pauseAudio() {
        bgMusic.pause();
        isPlaying = false;
        updateAudioUI(false);
    }

    function toggleAudio() {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    }

    function updateAudioUI(playing) {
        const iconClass = playing ? "fa-solid fa-circle-pause" : "fa-solid fa-circle-play";
        const inlineIconClass = playing ? "fa-solid fa-pause" : "fa-solid fa-play";
        
        floatingAudioBtn.innerHTML = `<i class="${iconClass}"></i>`;
        btnPlayPause.innerHTML = `<i class="${inlineIconClass}"></i>`;
    }
    
    // Fungsi untuk mengubah format detik menjadi Menit:Detik (00:00)
    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        let min = Math.floor(seconds / 60);
        let sec = Math.floor(seconds % 60);
        if (min < 10) min = "0" + min;
        if (sec < 10) sec = "0" + sec;
        return `${min}:${sec}`;
    }

    // 1. Set total waktu saat data musik berhasil dimuat
    bgMusic.addEventListener("loadedmetadata", () => {
        totalTimeEl.textContent = formatTime(bgMusic.duration);
    });

    // 2. Gerakkan garis, titik, dan angka saat lagu diputar
    bgMusic.addEventListener("timeupdate", () => {
        const currentTime = bgMusic.currentTime;
        const duration = bgMusic.duration;
        
        // Hindari error jika durasi gagal terbaca
        if (!duration) return;

        // Update angka menit yang berjalan
        currentTimeEl.textContent = formatTime(currentTime);

        // Hitung persentase untuk pergerakan garis & titik
        const progressPercent = (currentTime / duration) * 100;
        
        // Terapkan persentase ke CSS
        progressFill.style.width = `${progressPercent}%`;
        progressDot.style.left = `${progressPercent}%`;
    });

    // 3. Buat progress bar bisa diklik untuk melompati lagu (Seek)
    progressBarContainer.addEventListener("click", (e) => {
        // Ambil total lebar elemen pembungkus garis
        const width = progressBarContainer.clientWidth;
        
        // Ambil titik koordinat X tempat tamu mengklik
        const clickX = e.offsetX;
        
        // Ambil total durasi lagu
        const duration = bgMusic.duration;

        // Hitung lagu harus melompat ke detik ke berapa
        bgMusic.currentTime = (clickX / width) * duration;
    });


    // Event click untuk tombol pemutar musik (baik yang mengapung maupun mockup)
    floatingAudioBtn.addEventListener("click", toggleAudio);
    btnPlayPause.addEventListener("click", toggleAudio);

    // ==========================================
    // HITUNG MUNDUR / COUNTDOWN TIMER REALTIME
    // ==========================================
    // Target Tanggal Pernikahan: 2 Agustus 2026 09:00:00
    const targetDate = new Date("Aug 2, 2026 09:00:00").getTime();

    const countdownInterval = setInterval(function () {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // Kalkulasi Matematika Waktu
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Print nilai hasil kalkulasi ke DOM Element ID
        document.getElementById("days").innerText = String(days).padStart(2, '0');
        document.getElementById("hours").innerText = String(hours).padStart(2, '0');
        document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
        document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');

        // Jika hitung mundur selesai
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById("countdown").innerHTML = "<h3 class='sketch-subtitle'>Acara Sedang / Sudah Berlangsung!</h3>";
        }
    }, 1000);


    // ==========================================
    // MANAJEMEN DATA RSVP LOCALSTORAGE
    // ==========================================
    let rsvpData = JSON.parse(localStorage.getItem("wedding_rsvp_list")) || [];

    // --- BAGIAN PELUKIS (TETAPKAN INI) ---
    function renderRSVP() {
        // --- PERBAIKAN: Proteksi agar rsvpData selalu berupa array ---
        if (!Array.isArray(rsvpData)) {
            rsvpData = [];
        }
        // ------------------------------------------------------------
    
        rsvpList.innerHTML = "";
        if (rsvpData.length === 0) {
            rsvpList.innerHTML = "<p class='text-center' style='font-size:0.8rem; opacity:0.6;'>Belum ada ucapan tertulis.</p>";
            return;
        }
        
        rsvpData.slice().reverse().forEach(function (item) {
            const rsvpItem = document.createElement("div");
            rsvpItem.classList.add("rsvp-item");
            
            const badgeColor = item.status === "Hadir" ? "color: green; border-color: green;" : "color: #C62828; border-color: #C62828;";
            
            rsvpItem.innerHTML = `
                <strong>${escapeHtml(item.name)}</strong> 
                <span class="rsvp-badge" style="${badgeColor}">${item.status}</span>
                <p style="margin-top: 3px; color: #444;">${escapeHtml(item.message)}</p>
            `;
            rsvpList.appendChild(rsvpItem);
        });
    }

    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // --- BAGIAN KURIR (FUNGSI BARU) ---
    function loadAndRenderRSVP() {
        const sheetURL = 'https://script.google.com/macros/s/AKfycbzAmd0RTg8ybn3eHKzs9AM1q0OElqKEVaq5biPghBvLh4nF4Vcrgt_gCXviGbvCmltHpQ/exec';

        fetch(sheetURL)
            .then(res => res.json())
            .then(data => {
                rsvpData = data; // Update data lokal
                renderRSVP();    // Panggil si Pelukis untuk menggambar data dari Sheets
            })
            .catch(err => {
                console.log("Gagal ambil data, tampilkan yang ada saja.");
                renderRSVP();
            });
    }

    formRSVP.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("rsvp-name").value.trim();
        const status = document.getElementById("rsvp-status").value;
        const message = document.getElementById("rsvp-message").value.trim();

        if (name && status && message) {
            // 1. Tampilan instan
            const newResponse = { name, status, message };
            rsvpData.push(newResponse);
            renderRSVP();
            formRSVP.reset(); // Reset form lebih awal agar tamu tidak klik kirim dua kali

            // 2. Kirim ke Google Sheets
            const formData = new FormData();
            formData.append('nama', name);      // PASTIKAN KEY INI SAMA DENGAN GOOGLE APPS SCRIPT
            formData.append('kehadiran', status); // PASTIKAN KEY INI SAMA
            formData.append('pesan', message);    // PASTIKAN KEY INI SAMA

            fetch('https://script.google.com/macros/s/AKfycby64rH6awmZCdQz-2MZsEPPXxZdTbKkKYKhOt55C1qjrsqQbdwyOmR3qUBZ0Jgt3GKrLA/exec', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json()) // Ini menunggu hasil dari ContentService di atas
            .then(data => {
                console.log("Sukses!");
                alert("Terima kasih! Ucapan Anda telah terkirim.");
                formRSVP.reset();
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Gagal terkirim, tapi coba refresh halaman ya.");
            });
        }
    });

    
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    loadAndRenderRSVP();
    
    // ==========================================
    // EFEK 3D TILT GALLERY (MENGIKUTI KURSOR)
    // ==========================================
    const galleryImages = document.querySelectorAll('.strip-frame img');

    galleryImages.forEach(img => {
        img.addEventListener('mousemove', (e) => {
            // 1. Mendapatkan ukuran dan posisi gambar di layar
            const rect = img.getBoundingClientRect();
            
            // 2. Menghitung titik tengah gambar terhadap kursor mouse
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // 3. Menentukan derajat kemiringan (Angka 10 bisa dibesarkan/dikecilkan untuk mengatur kepekaan miringnya)
            const rotateX = -y / 10;
            const rotateY = x / 10;
            
            // 4. Terapkan efek 3D ke gambar
            img.style.transform = `perspective(1000px) scale(1.1) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            img.style.zIndex = "10"; // Agar gambar yang disorot berada paling depan
        });

        // Ketika kursor meninggalkan gambar
        img.addEventListener('mouseleave', () => {
            // Hapus efek JS agar gambar kembali ke bentuk semula sesuai aturan CSS
            img.style.transform = ''; 
            img.style.zIndex = "1";
        });
    });
});

/* ========================================== */
/* FUNGSI COPY NOMOR REKENING                 */
/* ========================================== */
function copyRekening(elementId, btnElement) {
    // Mengambil angka teks rekening berdasarkan ID
    var rekeningText = document.getElementById(elementId).innerText;

    // Proses copy teks ke sistem clipboard perangkat
    navigator.clipboard.writeText(rekeningText).then(function() {
        
        // Simpan tulisan asli tombol ("Salin Rekening")
        var originalText = btnElement.innerText;
        
        // Ubah tampilan tombol sesaat untuk memberi tahu tamu bahwa copy berhasil
        btnElement.innerText = "Tersalin! ✓";
        btnElement.style.backgroundColor = "#e8e8e8"; // Ubah warna latar sedikit gelap
        btnElement.style.color = "var(--main-color)";
        btnElement.style.fontWeight = "bold";

        // Kembalikan tampilan tombol ke semula setelah 2 detik
        setTimeout(function() {
            btnElement.innerText = originalText;
            btnElement.style.backgroundColor = ""; 
            btnElement.style.color = "";
            btnElement.style.fontWeight = "";
        }, 2000);
        
    }).catch(function(err) {
        console.error('Gagal menyalin teks: ', err);
        alert('Ups! Gagal menyalin nomor rekening. Silakan copy manual.');
    });
}
