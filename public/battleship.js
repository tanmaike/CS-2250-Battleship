const mainC = [];
const enemyC = [];

const directions = ["h", "w"];

function generateDirections(size) {
    const h = [];
    const w = [];

    for (let i = 0; i < size; i++) {
        h.push(i);
        w.push(i * 10);
    }

    return { h, w };
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
    playerScore: {
        main: shipChar(),
        enemy: shipChar()
    }
};


document.addEventListener('DOMContentLoaded', () => {
    const mainGrid = document.querySelector('.grid-main');
    const enemyGrid = document.querySelector('.grid-enemy');
    const shipLayout = document.querySelector('.ships-div');
    const ships = document.querySelectorAll('.ship');

    const startBtn = document.getElementById("start");
    const turnsDisplay = document.querySelector('#turn');

    let pID = 0;
    let curr = "user";
    let ready = false;
    let enemyReady = false;
    let boardSet = false;
    let attack = -1;

    startBtn.addEventListener("click", startGame);

    function startGame() {
        const socket = io();

        socket.on('player-number', num => {
            if (parseInt(num) === -1) {
                infoDisplay.innerHTML = "Sorry, the server is full";
            } else {
                pID = parseInt(num);
                if (pID === 1) curr = "enemy";
            }
            console.log(pID);

            socket.emit('check-players');
        });

        socket.on('player-connection', num => {
            connectionStatus(num);
            console.log(`Connection status has changed for player ${num}`);
        });

        socket.on('enemy-ready', num => {
            enemyReady = true;
            playerReady(num);
            if (ready) {
                play(socket);
            }
        })
=
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

        startBtn.addEventListener('click', () => {
            if (boardSet) {
                play(socket);
            } else {
                infoDisplay.innerHTML = "Please place all ships";
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
            let player = `.p${val + 1}`;
            let connectedSpan = document.querySelector(`${player} .connected span`);
            if (connectedSpan.classList.contains('green')) {
                connectedSpan.classList.remove('green');
            } else {
                connectedSpan.classList.add('green');
            }
            if (player === pID) {
                let playerElement = document.querySelector(player);
                if (playerElement.classList.contains('bold')) {
                    playerElement.classList.remove('bold');
                } else {
                    playerElement.classList.add('bold');
                }
            }
        }
    }

    render(mainGrid, mainC, 10);
    render(enemyGrid, enemyC, 10);

    shipLayout.addEventListener('click', element => {
        if (element.target.parentElement.matches('div.ship'))
            rotate(element.target.parentElement);
    })


    const target = {
        name: '',
        ship: '',
        length: 0
    }

    shipLayout.addEventListener('mouseDown', element => {
        grab(element, target);
    })
    ships.forEach(ship => ship.addEventListener('drag', element => { drag(element, target) }));
    mainGrid.addEventListener('stopDrag', stopDrag);
    mainGrid.addEventListener('stopDrop', stopDrop);
    mainGrid.addEventListener('dragleave', dragLeave);
    mainGrid.addEventListener('drop', element => { drop(element, target, mainC, shipLayout) });
    mainGrid.addEventListener('dragend', dragEnd);
})

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
    console.log(ship)
    console.log(ship.classList[1])
    if (ship.classList.contains(ship.classList[1] + '-v')) {
        ship.classList.remove(ship.classList[1] + '-v');
    } else {
        ship.classList.add(ship.classList[1] + '-v');
    }
}

function grab(e, target) {
    target['name'] = e.target.id;
}

function drag(e, target) {
    target['ship'] = e.target;
    target['length'] = e.target.childElementCount;
}

function stopDrag(e) {
    e.preventDefault();
}
function stopDrop(e) {
    e.preventDefault();
}

function dragEnd() {  }

function dragLeave() {  }

function drop(e, target, tiles, container) {
    let draggedID = target.ship.lastElementChild.id;
    let draggedClass = draggedID.slice(0, -2);
    let dIndex = parseInt(target.name.substr(-1));
    let dragTo = parseInt(e.target.dataset.id);
    let droppedID = parseInt(draggedID.substr(-1)) - dIndex + dragTo;

    let isVertical = [...target.ship.classList].some(className => className.includes('v'));
    console.log(droppedID)
    if (!isVertical) {
        console.log("draggedClass:", draggedClass);
        let current = allShips.find(ship => ship.name === draggedClass).directions.h;
        let occupied = current.some(index => tiles[(dragTo - dIndex) + index].classList.contains('occupied'));
        if (Math.floor(droppedID / 10) === Math.floor(dragTo / 10) && !occupied) {
            for (let i = 0; i < target.length; i++) {
                tiles[dragTo - dIndex + i].classList.add('occupied', draggedClass, 'ship')
            }
            container.removeChild(target.ship);
        } else {
            Window.alert("Invalid Placement")
        }
    } else {
        let current = allShips.find(ship => ship.name === draggedClass).directions.v;
        let occupied = current.some(index => tiles[(dragTo - dIndex) + index].classList.contains('occupied'));

        if (dragTo + (target.length - 1) * 10 < 100 && !occupied) {
            for (let i = 0; i < target.length; i++) {
                tiles[dragTo - dIndex + (10 * i)].classList.add('occupied', draggedClass, 'ship')
            }
            container.removeChild(target.ship);
        } else {
            Window.alert("Invalid Placement")
        }
    }
    if (!container.querySelector('.ship')) boardSet = true;
}

function play(socket) {
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
    if (readySpan.classList.contains('green')) {
        readySpan.classList.remove('green');
    } else {
        readySpan.classList.add('green');
    }
}
