import { register, login, addWin, getUserWins, getTop5 } from './backend.js';

// Your battleship.js code...

document.addEventListener('DOMContentLoaded', () => {
    const mainGrid = document.querySelector('.grid-main');
    const enemyGrid = document.querySelector('.grid-enemy');
    const shipContainer = document.querySelector('.ships-div');
    const gameInformation = document.getElementById('gameHints');
    const ships = document.querySelectorAll('.ship');
    const strtBtn = document.getElementById("start");
    const rdyBtn = document.getElementById("readyUp");
    const turnsDisplay = document.getElementById('playerTurn');
    const shipDisplay = document.querySelector('.larger-ship-panel');
    const mainBattlefield = [];
    const enemyBattlefield = [];
    let numShipsPlaced = 0;
    let boardSet = false;
    let gameStarted = false;
    let isGameOver = false;
    let ready = false;
    let pID = 0;
    let enemyReady = false;
    let curr = "user";
    let userPts = 0;
    let enemyPts = 0;
    let attack = -1
    let didUserWin = false;

    const directions = ["h", "v"];

    function generateDirections(size) {
        const h = [];
        const v = [];

        for (let i = 0; i < size; i++) {
            h.push(i);
            v.push(i * 10);
        }

        return { h, v };
    }

    const allShips = [
        {
            name: 'Destroyer',
            directions: generateDirections(2)
        },
        {
            name: 'Submarine',
            directions: generateDirections(3)
        },
        {
            name: 'Cruiser',
            directions: generateDirections(3)
        },
        {
            name: 'Battleship',
            directions: generateDirections(4)
        },
        {
            name: 'Carrier',
            directions: generateDirections(5)
        }
    ];

    function shipChar() {
        let shipCharacteristics = { total: 0 };

        shipCharacteristics['Destroyer'] = 2;
        shipCharacteristics['Submarine'] = 3;
        shipCharacteristics['Cruiser'] = 3;
        shipCharacteristics['Battleship'] = 4;
        shipCharacteristics['Carrier'] = 5;

        return shipCharacteristics;
    }

    const game = {
        curr: "main",
        score: {
            main: shipChar(),
            enemy: shipChar()
        }
    };

    render(mainGrid, mainBattlefield, 10);
    render(enemyGrid, enemyBattlefield, 10);

    rdyBtn.disabled = true;
    document.getElementById("readyUp").className = "headerButton disabled";

    strtBtn.addEventListener("click", startGame);

    function startGame() {
        document.querySelector('#start').innerHTML = 'Disconnect';
        rdyBtn.disabled = false;
        document.getElementById("readyUp").className = "headerButton";

        const socket = io();

        socket.on('player-number', num => {
            if (parseInt(num) === -1) {
                gameInformation.innerHTML = "Sorry, the server is full";
            } else {
                pID = parseInt(num);
                if (pID === 1) curr = "enemy";
            }
            console.log(`Your Player ID is ${pID}`);

            socket.emit('check-players');
        });

        socket.on('player-connection', num => {
            checkConnection(num);
            console.log(`Player ${num} has connected.`);
        });

        socket.on('enemy-ready', num => {
            enemyReady = true;
            playerReady(num);
            if (ready) {
                play(socket);
            }
        })

        socket.on('check-players', function (players) {
            for (let i = 0; i < players.length; i++) {
                let p = players[i];
                if (p.connected) {
                    checkConnection(i);
                }
                if (p.ready) {
                    playerReady(i);
                    if (i !== playerReady) {
                        enemyReady = true;
                    }
                }
            }
        })

        rdyBtn.addEventListener('click', () => {
            if (boardSet) {
                play(socket);

            } else {
                gameInformation.innerHTML = "Please place all ships";
            }
        })

        strtBtn.addEventListener('click', () => {
            if (document.getElementById("start").innerHTML === 'Disconnect') {
                userDisconnect();
            }
        })

        enemyBattlefield.forEach(tile => {
            tile.addEventListener('click', () => {
                console.log(tile.dataset.id)
                if (curr === 'user' && ready && enemyReady) {
                    attack = tile.dataset.id;
                    socket.emit('fire', attack);
                }
            })
        });

        socket.on('fire', id => {
            console.log(`Fired tile:`, id);
            revealMainTile(id);
            const tile = mainBattlefield[id];
            socket.emit('fire-receive', tile.classList);
            play(socket);
        });

        socket.on('fire-receive', classList => {
            console.log(`fire-receive:`, classList);
            revealEnemyTile(classList);
            play(socket);
        });

        function checkConnection(num) {
            let val = parseInt(num);
            let player = `.p${parseInt(num) + 1}`;
            var element = document.querySelector(`${player} .connected span`);
            if (element.classList.contains('green')) {
                element.classList.remove('green');
            } else {
                element.classList.add('green');
            }
            if (player === pID) {
                var element = document.querySelector(player);
                if (element.classList.contains('bold')) {
                    element.classList.remove('bold');
                } else {
                    element.classList.add('bold');
                }
            }
        }

        function userDisconnect() {
            socket.emit("user-disconnect", socket.id);
            socket.close();
            console.log(`A Player has disconnected.`);
            document.querySelector('#start').innerHTML = 'Find Player';
        }
    }

    shipContainer.addEventListener('click', e => {
        if (e.target.parentElement.matches('div.ship'))
            rotate(e.target.parentElement);
    })


    const target = {
        name: '',
        ship: '',
        length: 0
    }

    shipContainer.addEventListener('mousedown', e => {
        grabShip(e, target);
    })
    ships.forEach(ship => ship.addEventListener('dragstart', e => { dragStart(e, target) }));
    mainGrid.addEventListener('dragover', dragOver);
    mainGrid.addEventListener('dragenter', dragEnter);
    mainGrid.addEventListener('dragleave', dragLeave);
    mainGrid.addEventListener('drop', e => {
        dragDrop(e, target, mainBattlefield, shipContainer)
    });
    mainGrid.addEventListener('dragend', dragEnd);

    function render(grid, tiles, width) {
        for (let i = 0; i < width * width; i++) {
            const tile = document.createElement('div');
            tile.setAttribute("class", "tileStyle");
            tile.dataset.id = i;
            grid.appendChild(tile);
            tiles.push(tile);
        }
    }

    function rotate(ship) {
        ship.classList.toggle(`${ship.classList[1]}-v`)
    }

    function grabShip(e, target) {
        target['name'] = e.target.id;
    }

    function dragStart(e, target) {
        target['ship'] = e.target;
        target['length'] = e.target.childElementCount;
    }

    function dragOver(e) {
        e.preventDefault();
    }
    function dragEnter(e) {
        e.preventDefault();
    }
    function dragLeave() {

    }

    function dragEnd() {

    }

    function dragDrop(e, target, tiles, container) {
        let draggedShipName = target.ship.lastElementChild.id;
        let draggedShipClass = draggedShipName.slice(0, -2);
        let draggedShipLastIndex = parseInt(draggedShipName.substr(-1));
        let draggedShipIndex = parseInt(target.name.substr(-1));
        let receivingTile = parseInt(e.target.dataset.id);
        let droppedShipFirstId = receivingTile - draggedShipIndex;
        let droppedShipLastId = draggedShipLastIndex - draggedShipIndex + receivingTile;

        const invalidHTile = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 1, 11, 21, 31, 41, 51, 61, 71, 81, 91, 2, 22, 32, 42, 52, 62, 72, 82, 92, 3, 13, 23, 33, 43, 53, 63, 73, 83, 93]
        const invalidVTile = [99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60]

        let splicedInvalidHTile = invalidHTile.splice(0, 10 * draggedShipIndex)
        let splicedInvalidVTile = invalidVTile.splice(0, 10 * draggedShipIndex)

        let isVertical = [...target.ship.classList].some(className => className.includes('-v'));

        if (!isVertical && !splicedInvalidHTile.includes(receivingTile)) {
            let playerShipEnt;
            for (let ship of allShips) {
                if (ship.name === draggedShipClass) {
                    playerShipEnt = ship.directions.h;
                    break;
                }
            }
            let occupied = false;
            for (let index of playerShipEnt) {
                if (tiles[droppedShipFirstId + index].classList.contains('occupied')) {
                    occupied = true;
                    break;
                }
            }

            if (Math.floor(droppedShipLastId / 10) === Math.floor(receivingTile / 10) && !occupied) {
                for (let i = 0; i < target.length; i++) {
                    tiles[receivingTile - draggedShipIndex + i].classList.add('occupied', draggedShipClass, 'ship')
                }
                container.removeChild(target.ship);
                numShipsPlaced++;
            } else {
                window.alert("Invalid Placement")
            }
        } else if (!splicedInvalidVTile.includes(receivingTile)) {
            let playerShipEnt;
            allShips.find(function (ship) {
                if (ship.name === draggedShipClass) {
                    playerShipEnt = ship.directions.v;
                    return true;
                }
                return false;
            });

            let occupied = false;
            playerShipEnt.forEach(function (index) {
                if (tiles[droppedShipFirstId + index].classList.contains('occupied')) {
                    occupied = true;
                    return;
                }
            });
            if (receivingTile + (target.length - 1) * 10 < 100 && !occupied) {
                for (let i = 0; i < target.length; i++) {
                    tiles[receivingTile - draggedShipIndex + (10 * i)].classList.add('occupied', draggedShipClass, 'ship')
                }
                container.removeChild(target.ship);
                numShipsPlaced++;
            }
        } else {
            window.alert("Invalid Placement")
        }
        if (numShipsPlaced == 5) {
            boardSet = true;
            shipDisplay.remove();
        }
    }

    function play(socket) {
        if (isGameOver) {
            endGame();
        }
        if (!ready) {
            socket.emit('player-ready');
            ready = true;
            playerReady(pID);
        }

        if (enemyReady) {
            if (curr === 'user') {
                turnsDisplay.innerHTML = 'Your Turn';
            }
            if (curr === 'enemy') {
                turnsDisplay.innerHTML = 'Enemy\'s Turn';
            }
            if (!gameStarted) {
                gameStarted = true;
                gameInformation.innerHTML = "The game has begun.";
            }
        }
    }

    function revealEnemyTile(classList) {
        const enemyTile = enemyGrid.querySelector(`div[data-id='${attack}']`)
        const obj = Object.values(classList)
        if (!enemyTile.classList.contains('shot') && curr === 'user' && !isGameOver) {
            if (obj.includes('occupied')) {
                gameInformation.innerHTML = 'It\'s a hit!';
                userPts++
                enemyTile.classList.add('shot')
            } else {
                gameInformation.innerHTML = 'It\'s a miss.';
                enemyTile.classList.add('miss')

            }
        }
        checkWinState()
        curr = 'enemy'
    }

    function revealMainTile(tile) {
        if (!mainBattlefield[tile].classList.contains('shot')) {
            const hit = mainBattlefield[tile].classList.contains('occupied')
            if (hit) {
                mainBattlefield[tile].classList.add('shot');
            } else {
                mainBattlefield[tile].classList.add('miss');
            }
            if (mainBattlefield[tile].classList.contains('shot')) {
                gameInformation.innerHTML = 'It\'s a hit!';
                enemyPts++
            } else {
                gameInformation.innerHTML = 'It\'s a miss.';
            }
            checkWinState()
        }
        curr = 'user'
        turnsDisplay.innerHTML = 'Your Turn';
    }

    function checkWinState() {
        document.querySelector('#mainScore').innerHTML = userPts;
        document.querySelector('#enemyScore').innerHTML = enemyPts;
        if (userPts == 17) {
            isGameOver = true;
            didUserWin = true;
        }

        if (enemyPts == 17) {
            isGameOver = true;
        }
    }

    function playerReady(num) {
        let playerClass = `.p${parseInt(num) + 1}`;
        let readySpan = document.querySelector(`${playerClass} .ready span`);
        readySpan.classList.toggle('green');
    }

    function endGame() {
        gameInformation.setAttribute("class", "gameOverText");
        if (didUserWin) {
            gameInformation.innerHTML = "YOU WIN!";
            addWin();
        } else {
            gameInformation.innerHTML = "You lose.";
        }
        const gameOverTimeout = setTimeout(returnToIndex, 3000);
    }

    function returnToIndex() {
        window.location.href = "index.html";
    }
})