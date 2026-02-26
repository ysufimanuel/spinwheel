const i18n = {
            en: {
                appTitle: "Spin Setup",
                appDesc: "Configure your names and winning order.",
                lblNames: "Participant Names:",
                lblRigged: "Winner Sequence (Optional):",
                riggedHelp: "*If filled, spin #1 wins the first name, etc. Names not in the sequence will be picked randomly afterward.",
                btnSave: "LOCK & START",
                spinNow: "SPIN NOW!",
                round: "Round #",
                remaining: "On the Wheel",
                modalTitle: "Congratulations!",
                modalBtn: "Next",
                refreshBtn: "REFRESH FOR NEW SETUP",
                alertMin: "Please enter at least 2 names!",
                placeholderNames: "Enter one name per line...",
                placeholderRigged: "Name 1, Name 2, ..."
            },
            id: {
                appTitle: "Pengaturan Roda",
                appDesc: "Atur daftar nama dan urutan pemenang Anda.",
                lblNames: "Daftar Nama Peserta:",
                lblRigged: "Urutan Pemenang (Opsional):",
                riggedHelp: "*Jika diisi, putaran 1 akan memenangkan nama pertama, dst. Nama yang tidak ada di urutan akan diundi acak setelah urutan habis.",
                btnSave: "KUNCI & MULAI",
                spinNow: "PUTAR SEKARANG!",
                round: "Putaran #",
                remaining: "Nama di Roda",
                modalTitle: "Selamat!",
                modalBtn: "Lanjut",
                refreshBtn: "REFRESH UNTUK INPUT BARU",
                alertMin: "Masukkan minimal 2 nama!",
                placeholderNames: "Satu nama per baris...",
                placeholderRigged: "Nama 1, Nama 2, ..."
            }
        };

        let currentLang = 'en';
        let names = [];
        let riggedNames = [];
        let currentRound = 0;
        let isSpinning = false;
        let currentRotation = 0;

        const canvas = document.getElementById('wheel');
        const ctx = canvas.getContext('2d');
        const colors = ['#4f46e5', '#7c3aed', '#db2777', '#e11d48', '#d97706', '#059669', '#0891b2', '#2563eb'];

        function changeLanguage() {
            currentLang = document.getElementById('lang-select').value;
            const t = i18n[currentLang];
            
            document.getElementById('app-title').innerText = t.appTitle;
            document.getElementById('app-desc').innerText = t.appDesc;
            document.getElementById('lbl-names').innerText = t.lblNames;
            document.getElementById('lbl-rigged').innerText = t.lblRigged;
            document.getElementById('rigged-help').innerText = t.riggedHelp;
            document.getElementById('btn-save').innerText = t.btnSave;
            document.getElementById('spin-button').innerText = t.spinNow;
            document.getElementById('lbl-remaining').innerText = t.remaining;
            document.getElementById('modal-title').innerText = t.modalTitle;
            document.getElementById('modal-btn').innerText = t.modalBtn;
            document.getElementById('reset-button').innerText = t.refreshBtn;
            document.getElementById('names-input').placeholder = t.placeholderNames;
            document.getElementById('rigged-input').placeholder = t.placeholderRigged;

            if (names.length > 0) {
                document.getElementById('round-indicator').innerText = `${t.round}${currentRound + 1}`;
            }
        }

        function lockAndStart() {
            const t = i18n[currentLang];
            const rawNames = document.getElementById('names-input').value.split('\n').map(n => n.trim()).filter(n => n !== "");
            const rawRigged = document.getElementById('rigged-input').value.split(',').map(n => n.trim()).filter(n => n !== "");

            if (rawNames.length < 2) {
                alert(t.alertMin);
                return;
            }

            names = [...rawNames];
            riggedNames = [...rawRigged];

            document.getElementById('input-section').remove(); // Benar-benar dihapus dari DOM
            document.getElementById('spin-section').classList.remove('hidden-completely');
            
            updateWheel();
        }

        function updateWheel() {
            const size = 320;
            canvas.width = size;
            canvas.height = size;
            const centerX = size / 2;
            const centerY = size / 2;
            const radius = size / 2;

            ctx.clearRect(0, 0, size, size);
            if (names.length === 0) return;

            const sliceAngle = (2 * Math.PI) / names.length;

            names.forEach((name, i) => {
                const startAngle = i * sliceAngle;
                ctx.fillStyle = colors[i % colors.length];
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fill();

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(startAngle + sliceAngle / 2);
                ctx.textAlign = "right";
                ctx.fillStyle = "white";
                ctx.font = "bold 12px Plus Jakarta Sans";
                ctx.fillText(name.substring(0, 15), radius - 15, 5);
                ctx.restore();
            });

            const listEl = document.getElementById('remaining-list');
            listEl.innerHTML = names.map(n => `<span class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-100">${n}</span>`).join('');
            document.getElementById('round-indicator').innerText = `${i18n[currentLang].round}${currentRound + 1}`;
        }

        function spin() {
            if (isSpinning || names.length === 0) return;
            isSpinning = true;
            
            let winner;
            if (currentRound < riggedNames.length && names.includes(riggedNames[currentRound])) {
                winner = riggedNames[currentRound];
            } else {
                winner = names[Math.floor(Math.random() * names.length)];
            }

            const winnerIndex = names.indexOf(winner);
            const sliceAngle = 360 / names.length;
            const extraSpins = 8 * 360;
            const targetRotation = 270 - (winnerIndex * sliceAngle) - (sliceAngle / 2);
            
            currentRotation += extraSpins + (targetRotation - (currentRotation % 360));
            canvas.style.transform = `rotate(${currentRotation}deg)`;

            setTimeout(() => {
                isSpinning = false;
                showWinner(winner);
            }, 4000);
        }

        function showWinner(name) {
            const modal = document.getElementById('winner-modal');
            document.getElementById('winner-name').innerText = name;
            modal.classList.replace('hidden', 'flex');
            
            names = names.filter(n => n !== name);
            currentRound++;

            if (names.length === 0) {
                document.getElementById('spin-button').classList.add('hidden-completely');
                document.getElementById('reset-button').classList.remove('hidden-completely');
            }
        }

        function closeModal() {
            document.getElementById('winner-modal').classList.replace('flex', 'hidden');
            updateWheel();
        }

        // Jalankan transisi bahasa saat load pertama kali
        changeLanguage();