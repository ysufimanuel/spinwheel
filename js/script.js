let names = [];
        let riggedNames = [];
        let currentRound = 0;
        let isSpinning = false;
        let currentRotation = 0;

        const canvas = document.getElementById('wheel');
        const ctx = canvas.getContext('2d');
        const colors = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

        function lockAndStart() {
            const rawNames = document.getElementById('names-input').value.split('\n').map(n => n.trim()).filter(n => n !== "");
            const rawRigged = document.getElementById('rigged-input').value.split(',').map(n => n.trim()).filter(n => n !== "");

            if (rawNames.length < 2) {
                alert("Masukkan minimal 2 nama!");
                return;
            }

            names = [...rawNames];
            riggedNames = [...rawRigged];

            // Hilangkan bagian input secara permanen dari DOM
            document.getElementById('input-section').classList.add('hidden-completely');
            
            // Tampilkan bagian spin
            document.getElementById('spin-section').classList.remove('hidden');
            
            updateWheel();
        }

        function updateWheel() {
            const size = 350;
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
                ctx.font = "bold 14px Poppins";
                ctx.fillText(name, radius - 20, 5);
                ctx.restore();
            });

            const listEl = document.getElementById('remaining-list');
            listEl.innerHTML = names.map(n => `<span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">${n}</span>`).join('');
            document.getElementById('round-indicator').innerText = `Putaran #${currentRound + 1}`;
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
            
            const extraSpins = 5 * 360;
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
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            names = names.filter(n => n !== name);
            currentRound++;

            if (names.length === 0) {
                document.getElementById('spin-button').classList.add('hidden');
                document.getElementById('reset-button').classList.remove('hidden');
            }
        }

        function closeModal() {
            document.getElementById('winner-modal').classList.add('hidden');
            document.getElementById('winner-modal').classList.remove('flex');
            updateWheel();
        }