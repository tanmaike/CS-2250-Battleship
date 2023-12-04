const mainC = [];
const enemyC = [];

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
    const shipLayout = document.querySelector('.ships-container');
    const ships = document.querySelectorAll('.ship');
    const btn = document.querySelector('#Play');

    let pID = 0;
    let curr = "user";
    let ready = false;
    let enemyReady = false;
    let boardSet = false;
    let attack = -1;

    btn.addEventListener('click', startGame);

    function startGame() {
        const socket = io();

        // Get your player number
        socket.on('player-number', num => {
            if (parseInt(num) === -1) {
                infoDisplay.innerHTML = "Sorry, the server is full";
            } else {
                pID = parseInt(num);
                if (pID === 1) curr = "enemy";
            }
            console.log(pID);

            //Get other player status
            socket.emit('check-players');
        });

        // Another player connected/disconnected
        socket.on('player-connection', num => {
            connectionStatus(num);
            console.log(`Player number ${num} has connected or disconnected`);
        });

        // activate enemy ready
        socket.on('enemy-ready', num => {
            enemyReady = true;
            playerReady(num);
            if (ready) {
                play(socket);
            }
        })

        //check player status
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

        // Ready  button click
        startBtn.addEventListener('click', () => {
            if (boardSet) {
                play(socket);
            } else {
                infoDisplay.innerHTML = "Please place all ships";
            }
        })

        // Setup event listeners for firing
        enemyGrid.forEach(cell => {
            cell.addEventListener('click', () => {
                if (curr === 'user' && ready && enemyReady) {
                    attack = cell.dataset.id;
                    socket.emit('fire', attack);
                }
            })
        })

        function connectionStatus(num) {
            let val = parseInt(num);
            let player = `.player${val + 1}`;
            document.querySelector(`${player} .connected span`).classList.toggle('green');
            if (player === pID) {
                document.querySelector(player).classList.toggle('bold');
            }
        }
    }

    const startBtn = document.querySelector('#start');
    const randomBtn = document.querySelector('#randomize');
    const turnsDisplay = document.querySelector('#turn');
    const resetBtn = document.querySelector('#reset');

    render(mainGrid, mainC);
    render(enemyGrid, enemyC);


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
    mainGrid.addEventListener('drop', e => { dragDrop(e, target, mainC, shipLayout) });
    mainGrid.addEventListener('dragend', dragEnd);

    randomBtn.addEventListener('click', function (event) {
        function clearShipLayout() {
            while (shipLayout.firstChild) {
                shipLayout.removeChild(shipLayout.firstChild);
            }
        }

        function makeShips() {
            for (const ship of allShips) {
                generate(directions, ship, mainC);
            }
        }

        if (shipLayout.childElementCount == 5) {
            makeShips();
            clearShipLayout();
        } else {
            reset(event, shipLayout);
            makeShips();
            clearShipLayout();
        }
    });

    resetBtn.addEventListener('click', e => {
        startBtn.disabled = false;
        reset(e, shipLayout);
    });
})

function reset(e, shipLayout) {
    //one way to reset the game is to reload the page... but this cannot be reused for the randomize button
    mainC.forEach(cell => {
        if (cell.classList.contains('taken')) {
            cell.className = '';
        }
    })
    if (shipLayout) {
        shipLayout.innerHTML = `
            <div class="ship destroyer-container" draggable="true">
                <div id="destroyer-0"></div>
                <div id="destroyer-1"></div>
            </div>
            <div class="ship submarine-container" draggable="true">
                <div id="submarine-0"></div>
                <div id="submarine-1"></div>
                <div id="submarine-2"></div>
            </div>
            <div class="ship cruiser-container" draggable="true">
                <div id="cruiser-0"></div>
                <div id="cruiser-1"></div>
                <div id="cruiser-2"></div>
            </div>
            <div class="ship battleship-container" draggable="true">
                <div id="battleship-0"></div>
                <div id="battleship-1"></div>
                <div id="battleship-2"></div>
                <div id="battleship-3"></div>
            </div>
            <div class="ship carrier-container" draggable="true">
                <div id="carrier-0"></div>
                <div id="carrier-1"></div>
                <div id="carrier-2"></div>
                <div id="carrier-3"></div>
                <div id="carrier-4"></div>
            </div>`
    }
}

// This function, renders the boards for the game,
// it takes in parameters the grid for which we want to create cells for,
// the cells array to keep record of the different cells created,
// and the width of the boards, so we know how many suqare to create.
function render(grid, cells) {
    for (let i = 0; i < 10 * 10; i++) {
        const cell = document.createElement('div');
        cell.dataset.id = i;
        grid.appendChild(cell);
        cells.push(cell);
    }
}

// This function, places the ships in random positions in the main board in case it is a one-player game.
// so this serves as the computer as enemy player.
function generate(dir, ship, cells) {
    let rand = dir[Math.floor(Math.random() * dir.length)];
    let current = ship.directions[rand];

    let direction;
    if (rand === "horizontal") {
        direction = 1;
    } else {
        direction = 10;
    }
    let randSt = Math.abs(Math.floor(Math.random() * cells.length - (ship.directions["horizontal"].length * direction)));

    let occupied = false;
    for (let i = 0; i < current.length; i++) {
        if (cells[randSt + current[i]].classList.contains('taken')) {
            occupied = true;
            break;
        }
    }
    let right = false;
    for (let i = 0; i < current.length; i++) {
        if ((randSt + current[i]) % 10 === 9) {
            right = true;
            break;
        }
    }

    let left = false;
    for (let i = 0; i < current.length; i++) {
        if ((randSt + current[i]) % 10 === 0) {
            left = true;
            break;
        }
    }

    if (!occupied && !right && !left) {
        current.forEach(index => cells[randSt + index].classList.add('taken', ship.name, 'ship'))
    } else {
        generate(dir, ship, cells)
    }
}

function rotate(ship) {
    console.log(ship)
    console.log(ship.classList[1])
    ship.classList.toggle(`${ship.classList[1]}-vertical`)
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

function dragDrop(e, target, cells, container) {
    let draggedShipNameWithLastId = target.ship.lastElementChild.id;
    let draggedShipClass = draggedShipNameWithLastId.slice(0, -2);
    let draggedShipLastIndex = parseInt(draggedShipNameWithLastId.substr(-1));
    let draggedShipIndex = parseInt(target.name.substr(-1));
    let receivingSquare = parseInt(e.target.dataset.id);
    let droppedShipFirstId = receivingSquare - draggedShipIndex;
    let droppedShipLastId = draggedShipLastIndex - draggedShipIndex + receivingSquare;

    let isVertical = [...target.ship.classList].some(className => className.includes('vertical'));

    if (!isVertical) {
        let current = allShips.find(ship => ship.name === draggedShipClass).directions.horizontal;
        let occupied = current.some(index => cells[droppedShipFirstId + index].classList.contains('taken'));
        if (Math.floor(droppedShipLastId / 10) === Math.floor(receivingSquare / 10) && !occupied) {
            console.log('it fits on the same line and none of the cells are already taken');
            for (let i = 0; i < target.length; i++) {
                cells[receivingSquare - draggedShipIndex + i].classList.add('taken', draggedShipClass, 'ship')
            }
            container.removeChild(target.ship);
        } else {
            // show some kind of warning
        }
    } else {
        let current = allShips.find(ship => ship.name === draggedShipClass).directions.vertical;
        let occupied = current.some(index => cells[droppedShipFirstId + index].classList.contains('taken'));

        if (receivingSquare + (target.length - 1) * 10 < 100 && !occupied) {
            for (let i = 0; i < target.length; i++) {
                cells[receivingSquare - draggedShipIndex + (10 * i)].classList.add('taken', draggedShipClass, 'ship')
            }
            container.removeChild(target.ship);
        } else {
            //show some kind of warning
        }
    }
    if (!container.querySelector('.ship')) boardSet = true;
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
