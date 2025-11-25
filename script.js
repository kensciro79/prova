// Stato del gioco
let gridSize = 5;
let playerPosition = { x: 0, y: 0 };
let commands = [];
let isRunning = false;
let obstacles = new Set(); // Set di coordinate "x,y" degli ostacoli
let obstacleMode = false; // Modalità inserimento ostacoli
let goalPosition = null; // Posizione del traguardo {x, y}
let goalMode = false; // Modalità inserimento traguardo

// Mappa delle direzioni
const directions = {
    up: { x: 0, y: -1, emoji: '⬆️', label: 'Su' },
    down: { x: 0, y: 1, emoji: '⬇️', label: 'Giù' },
    left: { x: -1, y: 0, emoji: '⬅️', label: 'Sinistra' },
    right: { x: 1, y: 0, emoji: '➡️', label: 'Destra' }
};

// Elementi DOM
const grid = document.getElementById('grid');
const commandSequence = document.getElementById('commandSequence');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const clearBtn = document.getElementById('clearBtn');
const positionDisplay = document.getElementById('position');
const commandCountDisplay = document.getElementById('commandCount');
const obstacleBtn = document.getElementById('obstacleBtn');
const obstacleHint = document.querySelector('.obstacle-hint');
const goalBtn = document.getElementById('goalBtn');
const goalHint = document.querySelector('.goal-hint');
const alertModal = document.getElementById('alertModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const victoryModal = document.getElementById('victoryModal');
const closeVictoryBtn = document.getElementById('closeVictoryBtn');
const usedCommandsDisplay = document.getElementById('usedCommands');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

// Audio Context per generare il suono di allarme
let audioContext;
let alarmPlaying = false;

// Inizializza Audio Context
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Genera suono di allarme
function playAlarmSound() {
    if (alarmPlaying) return;
    
    initAudio();
    alarmPlaying = true;
    
    const duration = 1.5; // secondi
    const frequency1 = 800; // Hz
    const frequency2 = 400; // Hz
    
    // Crea oscillatori per un suono di allarme
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = i % 2 === 0 ? frequency1 : frequency2;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }, i * 200);
    }
    
    setTimeout(() => {
        alarmPlaying = false;
    }, duration * 1000);
}

// Genera suono di vittoria
function playVictorySound() {
    initAudio();
    
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00]; // Do, Re, Mi, Sol, La
    
    notes.forEach((frequency, index) => {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }, index * 100);
    });
}

// Mostra modal di allerta
function showAlertModal() {
    alertModal.classList.add('show');
    playAlarmSound();
}

// Chiudi modal
function closeAlertModal() {
    alertModal.classList.remove('show');
}

// Event listener per chiudere il modal
closeModalBtn.addEventListener('click', closeAlertModal);

// Chiudi modal cliccando fuori
alertModal.addEventListener('click', (e) => {
    if (e.target === alertModal) {
        closeAlertModal();
    }
});

// Mostra modal di vittoria
function showVictoryModal() {
    usedCommandsDisplay.textContent = commands.length;
    victoryModal.classList.add('show');
    playVictorySound();
}

// Chiudi modal di vittoria
function closeVictoryModal() {
    victoryModal.classList.remove('show');
}

// Event listener per chiudere il modal di vittoria
closeVictoryBtn.addEventListener('click', closeVictoryModal);

// Chiudi modal di vittoria cliccando fuori
victoryModal.addEventListener('click', (e) => {
    if (e.target === victoryModal) {
        closeVictoryModal();
    }
});

// Inizializza la griglia
function initGrid() {
    grid.innerHTML = '';
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            // Aggiungi event listener per cliccare sulla cella
            cell.addEventListener('click', () => handleCellClick(x, y));
            
            // Posiziona l'oggetto iniziale
            if (x === playerPosition.x && y === playerPosition.y) {
                cell.classList.add('active');
                cell.textContent = '🤖';
            }
            
            // Aggiungi ostacoli esistenti
            if (obstacles.has(`${x},${y}`)) {
                cell.classList.add('obstacle');
            }
            
            // Aggiungi traguardo se presente
            if (goalPosition && x === goalPosition.x && y === goalPosition.y) {
                cell.classList.add('goal');
            }
            
            grid.appendChild(cell);
        }
    }
    updatePositionDisplay();
}

// Aggiorna la visualizzazione della posizione
function updatePositionDisplay() {
    positionDisplay.textContent = `(${playerPosition.x}, ${playerPosition.y})`;
}

// Aggiorna il contatore dei comandi
function updateCommandCount() {
    commandCountDisplay.textContent = commands.length;
}

// Renderizza la sequenza di comandi
function renderCommands() {
    if (commands.length === 0) {
        commandSequence.innerHTML = '<p class="empty-message">Nessun comando inserito</p>';
    } else {
        commandSequence.innerHTML = '';
        commands.forEach((cmd, index) => {
            const cmdItem = document.createElement('div');
            cmdItem.className = 'command-item';
            cmdItem.innerHTML = `
                <span>${directions[cmd].emoji}</span>
                <button class="remove-btn" onclick="removeCommand(${index})">×</button>
            `;
            commandSequence.appendChild(cmdItem);
        });
    }
    updateCommandCount();
}

// Aggiungi comando
function addCommand(direction) {
    if (isRunning) return;
    
    commands.push(direction);
    renderCommands();
}

// Rimuovi comando
function removeCommand(index) {
    if (isRunning) return;
    
    commands.splice(index, 1);
    renderCommands();
}

// Cancella tutti i comandi
function clearCommands() {
    if (isRunning) return;
    
    commands = [];
    renderCommands();
}

// Ottieni cella dalla posizione
function getCell(x, y) {
    return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

// Gestione click sulla cella
function handleCellClick(x, y) {
    // Non fare nulla se il gioco è in esecuzione
    if (isRunning) return;
    
    // Se siamo in modalità traguardo
    if (goalMode) {
        // Non permettere traguardo sulla posizione iniziale del robot
        if (x === 0 && y === 0) {
            alert('❌ Non puoi mettere il traguardo sulla posizione iniziale del robot!');
            return;
        }
        
        // Non permettere traguardo su un ostacolo
        if (obstacles.has(`${x},${y}`)) {
            alert('❌ Non puoi mettere il traguardo su un ostacolo!');
            return;
        }
        
        // Rimuovi traguardo precedente se esiste
        if (goalPosition) {
            const oldGoalCell = getCell(goalPosition.x, goalPosition.y);
            if (oldGoalCell) {
                oldGoalCell.classList.remove('goal');
            }
        }
        
        // Imposta nuovo traguardo
        goalPosition = { x, y };
        const cell = getCell(x, y);
        if (cell) {
            cell.classList.add('goal');
        }
        return;
    }
    
    // Se siamo in modalità ostacoli
    if (obstacleMode) {
        // Non permettere ostacoli sulla posizione iniziale del robot
        if (x === 0 && y === 0) {
            alert('❌ Non puoi mettere un ostacolo sulla posizione iniziale del robot!');
            return;
        }
        
        // Non permettere ostacoli sulla posizione corrente del robot
        if (x === playerPosition.x && y === playerPosition.y) {
            alert('❌ Non puoi mettere un ostacolo sulla posizione del robot!');
            return;
        }
        
        const key = `${x},${y}`;
        const cell = getCell(x, y);
        
        if (obstacles.has(key)) {
            // Rimuovi ostacolo
            obstacles.delete(key);
            cell.classList.remove('obstacle');
        } else {
            // Aggiungi ostacolo
            obstacles.add(key);
            cell.classList.add('obstacle');
        }
    }
}

// Attiva/disattiva modalità ostacoli
function toggleObstacleMode() {
    if (isRunning) return;
    
    // Disattiva modalità traguardo se attiva
    if (goalMode) {
        toggleGoalMode();
    }
    
    obstacleMode = !obstacleMode;
    
    if (obstacleMode) {
        obstacleBtn.classList.add('active');
        obstacleBtn.textContent = '✅ Modalità Ostacoli Attiva';
        obstacleHint.classList.add('active');
        grid.style.cursor = 'pointer';
    } else {
        obstacleBtn.classList.remove('active');
        obstacleBtn.textContent = '🚧 Modalità Ostacoli';
        obstacleHint.classList.remove('active');
        grid.style.cursor = 'default';
    }
}

// Attiva/disattiva modalità traguardo
function toggleGoalMode() {
    if (isRunning) return;
    
    // Disattiva modalità ostacoli se attiva
    if (obstacleMode) {
        toggleObstacleMode();
    }
    
    goalMode = !goalMode;
    
    if (goalMode) {
        goalBtn.classList.add('active');
        goalBtn.textContent = '✅ Modalità Traguardo Attiva';
        goalHint.classList.add('active');
        grid.style.cursor = 'pointer';
    } else {
        goalBtn.classList.remove('active');
        goalBtn.textContent = '🏁 Modalità Traguardo';
        goalHint.classList.remove('active');
        grid.style.cursor = 'default';
    }
}

// Aggiorna la visualizzazione del giocatore
function updatePlayerDisplay(oldX, oldY, newX, newY) {
    const oldCell = getCell(oldX, oldY);
    const newCell = getCell(newX, newY);
    
    if (oldCell) {
        oldCell.classList.remove('active', 'moving');
        oldCell.textContent = '';
        // Ripristina ostacolo se c'era
        if (obstacles.has(`${oldX},${oldY}`)) {
            oldCell.classList.add('obstacle');
        }
        // Ripristina traguardo se c'era
        if (goalPosition && oldX === goalPosition.x && oldY === goalPosition.y) {
            oldCell.classList.add('goal');
        }
    }
    
    if (newCell) {
        newCell.classList.add('active', 'moving');
        newCell.textContent = '🤖';
        // Rimuovi temporaneamente la classe obstacle se presente
        newCell.classList.remove('obstacle');
        
        // Rimuovi la classe moving dopo l'animazione
        setTimeout(() => {
            newCell.classList.remove('moving');
        }, 300);
    }
}

// Esegui i comandi
async function executeCommands() {
    if (commands.length === 0) {
        alert('⚠️ Inserisci almeno un comando!');
        return;
    }
    
    if (isRunning) return;
    
    isRunning = true;
    startBtn.disabled = true;
    startBtn.textContent = '⏸️ In esecuzione...';
    
    // Evidenzia i comandi durante l'esecuzione
    const commandItems = document.querySelectorAll('.command-item');
    
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        const direction = directions[command];
        
        // Evidenzia il comando corrente
        if (commandItems[i]) {
            commandItems[i].style.transform = 'scale(1.2)';
            commandItems[i].style.boxShadow = '0 5px 20px rgba(102, 126, 234, 0.7)';
        }
        
        // Calcola nuova posizione
        const newX = playerPosition.x + direction.x;
        const newY = playerPosition.y + direction.y;
        
        // Verifica se c'è un ostacolo
        if (obstacles.has(`${newX},${newY}`)) {
            // Colpito un ostacolo - animazione di errore
            const currentCell = getCell(playerPosition.x, playerPosition.y);
            if (currentCell) {
                currentCell.style.animation = 'none';
                setTimeout(() => {
                    currentCell.style.animation = '';
                    currentCell.style.background = '#ff9800';
                    setTimeout(() => {
                        currentCell.style.background = '';
                    }, 200);
                }, 10);
            }
            
            // Mostra modal di allerta con suono
            showAlertModal();
            
            // Ripristina lo stile del comando
            if (commandItems[i]) {
                commandItems[i].style.transform = '';
                commandItems[i].style.boxShadow = '';
            }
            break;
        }
        
        // Verifica se la posizione è valida
        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
            const oldX = playerPosition.x;
            const oldY = playerPosition.y;
            
            playerPosition.x = newX;
            playerPosition.y = newY;
            
            updatePlayerDisplay(oldX, oldY, newX, newY);
            updatePositionDisplay();
            
            // Controlla se ha raggiunto il traguardo
            if (goalPosition && newX === goalPosition.x && newY === goalPosition.y) {
                // Aspetta un attimo per far vedere il movimento
                await new Promise(resolve => setTimeout(resolve, 500));
                
                isRunning = false;
                startBtn.disabled = false;
                startBtn.textContent = '▶️ Start';
                
                // Ripristina lo stile del comando
                if (commandItems[i]) {
                    commandItems[i].style.transform = '';
                    commandItems[i].style.boxShadow = '';
                }
                
                // Mostra modal di vittoria
                showVictoryModal();
                return;
            }
        } else {
            // Fuori dalla griglia - animazione di errore
            const currentCell = getCell(playerPosition.x, playerPosition.y);
            if (currentCell) {
                currentCell.style.animation = 'none';
                setTimeout(() => {
                    currentCell.style.animation = '';
                    currentCell.style.background = '#f44336';
                    setTimeout(() => {
                        currentCell.style.background = '';
                    }, 200);
                }, 10);
            }
            
            // Mostra modal di allerta con suono anche per fuori griglia
            showAlertModal();
            
            // Ripristina lo stile del comando
            if (commandItems[i]) {
                commandItems[i].style.transform = '';
                commandItems[i].style.boxShadow = '';
            }
            break;
        }
        
        // Aspetta prima del prossimo movimento
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Ripristina lo stile del comando
        if (commandItems[i]) {
            commandItems[i].style.transform = '';
            commandItems[i].style.boxShadow = '';
        }
    }
    
    isRunning = false;
    startBtn.disabled = false;
    startBtn.textContent = '▶️ Start';
    
    // Messaggio di completamento
    setTimeout(() => {
        alert('✅ Sequenza completata!');
    }, 300);
}

// Reset del gioco
function resetGame() {
    if (isRunning) return;
    
    playerPosition = { x: 0, y: 0 };
    initGrid();
}

// Cancella tutti gli ostacoli
function clearObstacles() {
    if (isRunning) return;
    
    obstacles.clear();
    initGrid();
}

// Event listeners per i pulsanti direzionali
document.querySelectorAll('.dir-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const direction = btn.dataset.direction;
        addCommand(direction);
        
        // Feedback visivo
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 100);
    });
});

// Genera e scarica PDF della griglia
async function downloadGridAsPDF() {
    // Mostra feedback
    downloadPdfBtn.textContent = '⏳ Generando PDF...';
    downloadPdfBtn.disabled = true;
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Titolo
        doc.setFontSize(20);
        doc.setTextColor(102, 126, 234);
        doc.text('Coding Grid - Sfida Personalizzata', 105, 20, { align: 'center' });
        
        // Data
        const today = new Date().toLocaleDateString('it-IT');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Data: ${today}`, 105, 28, { align: 'center' });
        
        // Informazioni
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Informazioni Griglia:', 20, 45);
        doc.setFontSize(10);
        doc.text(`• Dimensione: ${gridSize}x${gridSize}`, 25, 52);
        doc.text(`• Ostacoli: ${obstacles.size}`, 25, 59);
        doc.text(`• Traguardo: ${goalPosition ? 'Si' : 'No'}`, 25, 66);
        if (goalPosition) {
            doc.text(`• Posizione traguardo: (${goalPosition.x}, ${goalPosition.y})`, 25, 73);
        }
        doc.text(`• Posizione iniziale robot: (0, 0)`, 25, goalPosition ? 80 : 73);
        
        // Cattura la griglia come immagine
        const gridElement = document.getElementById('grid');
        const canvas = await html2canvas(gridElement, {
            scale: 2,
            backgroundColor: '#e0e0e0',
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Calcola dimensioni per centrare l'immagine
        const imgWidth = 120;
        const imgHeight = 120;
        const xPos = (210 - imgWidth) / 2; // Centrato in pagina A4 (210mm larghezza)
        const yPos = 95;
        
        // Aggiungi l'immagine della griglia
        doc.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
        
        // Legenda sotto la griglia
        const legendY = yPos + imgHeight + 15;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Legenda:', 20, legendY);
        
        doc.setFontSize(10);
        let currentY = legendY + 7;
        
        doc.text('🤖 = Posizione iniziale del robot', 25, currentY);
        currentY += 7;
        
        if (obstacles.size > 0) {
            doc.text('🚧 = Ostacolo (da evitare)', 25, currentY);
            currentY += 7;
        }
        
        if (goalPosition) {
            doc.text('🏁 = Traguardo (obiettivo da raggiungere)', 25, currentY);
            currentY += 7;
        }
        
        // Istruzioni
        currentY += 5;
        doc.setFontSize(11);
        doc.setTextColor(102, 126, 234);
        doc.text('Obiettivo:', 20, currentY);
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        currentY += 7;
        doc.text('Programma il robot utilizzando le frecce direzionali (↑ ↓ ← →)', 20, currentY);
        currentY += 7;
        if (goalPosition && obstacles.size > 0) {
            doc.text('per raggiungere il traguardo evitando gli ostacoli!', 20, currentY);
        } else if (goalPosition) {
            doc.text('per raggiungere il traguardo!', 20, currentY);
        } else if (obstacles.size > 0) {
            doc.text('per muoverti nella griglia evitando gli ostacoli!', 20, currentY);
        } else {
            doc.text('per muoverti liberamente nella griglia!', 20, currentY);
        }
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generato da Coding Grid App - Strumento educativo per il coding', 105, 285, { align: 'center' });
        
        // Salva il PDF
        const filename = `coding-grid-${today.replace(/\//g, '-')}.pdf`;
        doc.save(filename);
        
        // Feedback visivo
        downloadPdfBtn.textContent = '✅ PDF Scaricato!';
        downloadPdfBtn.style.background = '#4caf50';
        setTimeout(() => {
            downloadPdfBtn.textContent = '📄 Scarica PDF Griglia';
            downloadPdfBtn.style.background = '';
            downloadPdfBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Errore nella generazione del PDF:', error);
        downloadPdfBtn.textContent = '❌ Errore!';
        setTimeout(() => {
            downloadPdfBtn.textContent = '📄 Scarica PDF Griglia';
            downloadPdfBtn.disabled = false;
        }, 2000);
    }
}

// Event listeners per i pulsanti di controllo
startBtn.addEventListener('click', executeCommands);
resetBtn.addEventListener('click', resetGame);
clearBtn.addEventListener('click', clearCommands);
obstacleBtn.addEventListener('click', toggleObstacleMode);
goalBtn.addEventListener('click', toggleGoalMode);
downloadPdfBtn.addEventListener('click', downloadGridAsPDF);

// Supporto tastiera
document.addEventListener('keydown', (e) => {
    if (isRunning) return;
    
    const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'Enter': 'start',
        'Escape': 'clear',
        'r': 'reset',
        'R': 'reset'
    };
    
    const action = keyMap[e.key];
    
    if (action) {
        e.preventDefault();
        
        if (action === 'start') {
            executeCommands();
        } else if (action === 'clear') {
            clearCommands();
        } else if (action === 'reset') {
            resetGame();
        } else {
            addCommand(action);
        }
    }
});

// Inizializza il gioco
initGrid();
renderCommands();
