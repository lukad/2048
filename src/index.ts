import './styles.scss';

import 'swiped-events';

import Cell from './cell';
import Fill from './fill';
import Dir from './dir';

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

const gridDiv = document.getElementById('grid') as HTMLDivElement;
const cellDivs = document.querySelectorAll<HTMLDivElement>('.cell');
const newGameButton = document.getElementById('new-game-button') as HTMLButtonElement;
const SIZE = 4;

const cells: Cell[] = [];

type State = [index: number, value: number][];

cellDivs.forEach((cellDiv) => {
  cells.push(new Cell(cellDiv));
});

for (let i = 0; i < cells.length; i += 1) {
  const x = i % SIZE;
  const y = Math.floor(i / SIZE);
  const cell = cells[i];
  cell.left = x > 0 ? cells[x - 1 + SIZE * y] : null;
  cell.right = x < SIZE - 1 ? cells[x + 1 + SIZE * y] : null;
  cell.up = y <= SIZE - 1 ? cells[x + SIZE * (y - 1)] : null;
  cell.down = y > 0 - 1 ? cells[x + SIZE * (y + 1)] : null;
}

const slideCell = (cell: Cell, dir: Dir): boolean => {
  if (!cell.fill) return false;

  const foo = (current: Cell): Cell => {
    const currentTarget = current.neighbor(dir);

    if (!currentTarget) return current;

    if (currentTarget.fill) {
      if (currentTarget.fill.wasCombined) return current;
      if (cell.fill.value === currentTarget.fill.value) {
        return currentTarget;
      }
      return current;
    }

    return foo(currentTarget);
  };

  const target = foo(cell);

  if (!target) return false;
  if (target === cell) return false;

  const a = cell.div.getBoundingClientRect();
  const b = target.div.getBoundingClientRect();

  const xOffset = `${a.x - b.x}px`;
  const yOffset = `${a.y - b.y}px`;

  if (target.fill) {
    target.mergeFill = cell.fill;
    cell.fill = null;
    target.mergeFill.div.style.left = xOffset;
    target.mergeFill.div.style.top = yOffset;
    const cleanup = () => {
      if (!target.mergeFill) return;
      target.mergeFill = null;
      target.fill.value *= 2;
    };
    target.mergeFill.div.addEventListener('transitionend', cleanup);
    target.mergeFill.div.addEventListener('transitioncancel', cleanup);
    target.fill.div.classList.add('merge');
    target.fill.wasCombined = true;
  } else {
    target.fill = cell.fill;
    target.fill.div.style.left = xOffset;
    target.fill.div.style.top = yOffset;

    cell.fill = null;
  }

  return true;
};

const slide = (dir: Dir): boolean => {
  let xRange = [0, 1, 2, 3];
  let yRange = [0, 1, 2, 3];

  if (dir === Dir.Right) {
    xRange = xRange.reverse();
  } else if (dir === Dir.Down) {
    yRange = yRange.reverse();
  }

  let moved = false;

  xRange.forEach((x) => yRange.forEach((y) => {
    const i = x + y * SIZE;
    moved = slideCell(cells[i], dir) || moved;
  }));

  cells.forEach((cell) => {
    if (cell.fill) {
      cell.fill.wasCombined = false;
    }
  });

  gridDiv.getClientRects();
  cells.forEach((cell) => { cell.resetFillPosition(); });

  return moved;
};

const findFreeCells = (): Cell[] => cells.filter((cell) => !cell.fill);

const findRandomFreeCell = (): Cell | null => {
  const freeCells = findFreeCells();
  if (freeCells.length === 0) return null;
  return freeCells[Math.floor(Math.random() * freeCells.length)];
};

const spawn = (value: number) => {
  const cell = findRandomFreeCell();
  if (!cell) return;

  const fill = new Fill(value, true);
  cell.fill = fill;
};

const randomSpawn = () => {
  const rand = Math.random();
  if (rand < 0.1) return;

  const value = rand > 0.8 ? 4 : 2;
  spawn(value);
};

const saveState = () => {
  const state: State = [];
  cells.forEach((cell, i) => {
    if (!cell.fill) return;
    state.push([i, cell.fill.value]);
  });
  window.localStorage.setItem('state', JSON.stringify(state));
};

const loadState = (): boolean => {
  const state: State = JSON.parse(window.localStorage.getItem('state')) as State;
  if (!state) return false;
  state.forEach(([i, value]) => {
    const fill = new Fill(value, true);
    cells[i].fill = fill;
  });
  return true;
};

const input = (dir: Dir) => {
  const moved = slide(dir);
  if (moved) {
    randomSpawn();
  }
  saveState();
};

const newGame = () => {
  cells.forEach((cell) => { cell.fill = null; });
  spawn(2);
  saveState();
};

document.addEventListener('keydown', (event) => {
  const dir = event.code as Dir;
  if ([Dir.Up, Dir.Down, Dir.Left, Dir.Right].includes(dir)) {
    input(dir);
  }
});

interface SwipeEvent {
  detail: {
    dir: 'up' | 'down' | 'left' | 'right';
  }
}

gridDiv.addEventListener('swiped', (e) => {
  const event = (e as unknown) as SwipeEvent;
  switch (event.detail.dir) {
    case 'up': input(Dir.Up); break;
    case 'down': input(Dir.Down); break;
    case 'left': input(Dir.Left); break;
    case 'right': input(Dir.Right); break;
    default:
  }
});

if (!loadState()) {
  spawn(2);
}

newGameButton.addEventListener('click', () => newGame());
