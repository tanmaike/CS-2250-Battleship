const mainC = [];
const enemyC = [];
const width = 10;

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

    shipCharacteristics['destroyer'] = 2;
    shipCharacteristics['submarine'] = 3;
    shipCharacteristics['cruiser'] = 3;
    shipCharacteristics['battleship'] = 4;
    shipCharacteristics['carrier'] = 5;

    return shipCharacteristics;
}

const game = {
    curr: "main",
    score: {
        main: shipChar(),
        enemy: shipChar()
    }
};


document.addEventListener('DOMContentLoaded', () => {
    const mainGrid = document.querySelector('.grid-main');
    const enemyGrid = document.querySelector('.grid-enemy');
    const shipLayout = document.querySelector('.ships-div');
    const gameInformation = document.querySelector('.gameHints');
    const ships = document.querySelectorAll('.ship');

    const startBtn = document.getElementById("start");
    const readyBtn = document.getElementById("readyUp");
    const turnsDisplay = document.querySelector('#turn');

    let pID = 0;
    let curr = "user";
    let ready = false;
    let enemyReady = false;
    let boardSet = false;
    let attack = -1;

    startBtn.addEventListener("click", startGame);

    function startGame() {
        document.querySelector('#start').innerHTML = 'Disconnect';
        const socket = io();

        socket.on

        socket.on('player-number', num => {
            if (parseInt(num) === -1) {
                gameInformation.innerHTML = "Sorry, the server is full";
            } else {
                pID = parseInt(num);
                if (pID === 1) curr = "enemy";
                readyBtn.disabled = false;
            }
            console.log(pID);

            socket.emit('check-players');
        });

        socket.on('player-connection', num => {
            connectionStatus(num);
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
                    connectionStatus(i);
                }
                if (p.ready) {
                    playerReady(i);
                    if (i !== playerReady) {
                        enemyReady = true;
                    }
                }
            }
        })

        readyBtn.addEventListener('click', () => {
            if (boardSet) {
                play(socket);
            } else {
                gameInformation.innerHTML = "Please place all ships";
            }
        })

        startBtn.addEventListener('click', () => {
            if (document.getElementById("start").innerHTML === 'Disconnect') {
                userDiconnect();
            }
        })

        enemyGrid.forEach(tile => {
            tile.addEventListener('click', () => {
                if (curr === 'user' && ready && enemyReady) {
                    attack = tile.dataset.id;
                    socket.emit('fire', attack);
                }
            })
        })

        function connectionStatus(num) {
            let val = parseInt(num);
            let player = `.p${parseInt(num) + 1}`;
            document.querySelector(`${player} .connected span`).classList.toggle('green');
            if (player === pID) {
                document.querySelector(player).classList.toggle('bold');
            }
        }
        
        function userDiconnect() {
            socket.emit("user-disconnect", socket.id);
            socket.close();
            console.log(`A Player has disconnected.`);
            document.querySelector('#start').innerHTML = 'Find Player';
        }
    }

    render(mainGrid, mainC, width);
    render(enemyGrid, enemyC, width);

    shipLayout.addEventListener('click', e => {
        if (e.target.parentElement.matches('div.ship'))
            rotate(e.target.parentElement);
    })


    const target = {
        name: '',
        ship: '',
        length: 0
    }

    shipLayout.addEventListener('mousedown', e => {
        grabShip(e, target);
    })
    ships.forEach(ship => ship.addEventListener('dragstart', e => { dragStart(e, target) }));
    mainGrid.addEventListener('dragover', dragOver);
    mainGrid.addEventListener('dragenter', dragEnter);
    mainGrid.addEventListener('dragleave', dragLeave);
    mainGrid.addEventListener('drop', e => { 
        dragDrop(e, target, mainC, shipLayout) 
    });
    mainGrid.addEventListener('dragend', dragEnd);
})

function reset(e, shipLayout) {
    mainC.forEach(tile => {
        if (tile.classList.contains('taken')) {
            tile.className = '';
        }
    })
    if (shipLayout) {
        shipLayout.innerHTML = `
           <div class='ship Destroyer-div' draggable="true">
                <div id="Destroyer-0"></div>
                <div id="Destroyer-1"></div>
            </div>
            <div class='ship Submarine-div' draggable="true">
                <div id="Submarine-0"></div>
                <div id="Submarine-1"></div>
                <div id="Submarine-2"></div>
            </div>
            <div class='ship Cruiser-div' draggable="true">
                <div id="Cruiser-0"></div>
                <div id="Cruiser-1"></div>
                <div id="Cruiser-2"></div>
            </div>
            <div class='ship Battleship-div' draggable="true">
                <div id="Battleship-0"></div>
                <div id="Battleship-1"></div>
                <div id="Battleship-2"></div>
                <div id="Battleship-3"></div>
            </div>
            <div class='ship Carrier-div' draggable="true">
                <div id="Carrier-0"></div>
                <div id="Carrier-1"></div>
                <div id="Carrier-2"></div>
                <div id="Carrier-3"></div>
                <div id="Carrier-4"></div>
            </div>
            <h3 class="rotateHeadsUp">Click on the Ships to rotate them before placing them onto your grid!</h3>`
    }
}

// This function, renders the boards for the game,
// it takes in parameters the grid for which we want to create tiles for,
// the tiles array to keep record of the different tiles created,
// and the width of the boards, so we know how many square to create.
function render(grid, tiles, width) {
    for (let i = 0; i < width * width; i++) {
        const tile = document.createElement('div');
        tile.setAttribute("id", "tileStyle");
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
    let draggedShipNameWithLastId = target.ship.lastElementChild.id;
    let draggedShipClass = draggedShipNameWithLastId.slice(0, -2);
    let draggedShipLastIndex = parseInt(draggedShipNameWithLastId.substr(-1));
    let draggedShipIndex = parseInt(target.name.substr(-1));
    let receivingSquare = parseInt(e.target.dataset.id);
    let droppedShipFirstId = receivingSquare - draggedShipIndex;
    let droppedShipLastId = draggedShipLastIndex - draggedShipIndex + receivingSquare;

    let isVertical = [...target.ship.classList].some(className => className.includes('-v'));

    if (!isVertical) {
        let current = allShips.find(ship => ship.name === draggedShipClass).directions.h;
        let occupied = current.some(index => tiles[droppedShipFirstId + index].classList.contains('taken'));
        if (Math.floor(droppedShipLastId / 10) === Math.floor(receivingSquare / 10) && !occupied) {
            for (let i = 0; i < target.length; i++) {
                tiles[receivingSquare - draggedShipIndex + i].classList.add('taken', draggedShipClass, 'ship')
            }
            container.removeChild(target.ship);
        } else {
            Window.alert("Invalid Placement")
        }
    } else {
        let current = allShips.find(ship => ship.name === draggedShipClass).directions.v;
        let occupied = current.some(index => tiles[droppedShipFirstId + index].classList.contains('taken'));

        if (receivingSquare + (target.length - 1) * 10 < 100 && !occupied) {
            for (let i = 0; i < target.length; i++) {
                tiles[receivingSquare - draggedShipIndex + (10 * i)].classList.add('taken', draggedShipClass, 'ship')
            }
            container.removeChild(target.ship);
        }
    }
    if (!container.querySelector('.ships-div')) boardSet = true;
}

function play(socket) {
    //if game over return
    if (isGameOver) {
        return;
    }
    //if not ready socket.emit('player-ready') and ready = true and playerReady(pID)
    if (!ready) {
        socket.emit('player-ready');
        ready = true;
        playerReady(pID);
    }

    if (enemyReady) {
        if (curr === 'user') {
            turnsDisplay.innerHTML = 'Your turn';
        }
        if (curr === 'enemy') {
            turnsDisplay.innerHTML = 'Enemy\'s turn';
        }
    }
}

function playerReady(num) {
    let playerClass = `.p${parseInt(num) + 1}`;
    let readySpan = document.querySelector(`${playerClass} .ready span`);
    readySpan.classList.toggle('green');
}