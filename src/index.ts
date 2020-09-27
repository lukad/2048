/* eslint-disable max-classes-per-file */

import './styles.scss';

import 'swiped-events';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

const gridDiv = document.getElementById('grid') as HTMLDivElement;
const cellDivs = document.querySelectorAll<HTMLDivElement>('.cell');
const SIZE = 4;

// eslint-disable-next-line no-unused-vars, no-shadow
enum Dir {
  // eslint-disable-next-line no-unused-vars
  Up = 'ArrowUp', Down = 'ArrowDown', Left = 'ArrowLeft', Right = 'ArrowRight',
}

class Fill {
  div: HTMLDivElement;

  private val: number;
  private valueDiv: HTMLDivElement;
  public wasCombined = false;

  get value(): number { return this.val; }

  set value(value: number) {
    this.div.classList.remove(`value-${this.value}`);
    this.div.classList.add(`value-${value}`);
    this.val = value;
    this.valueDiv.innerText = value.toString();
  }

  constructor(value: number) {
    this.div = document.createElement('div');
    this.div.classList.add('fill');

    this.valueDiv = document.createElement('div');
    this.valueDiv.classList.add('value');
    this.div.appendChild(this.valueDiv);

    this.value = value;
  }
}

class Cell {
  div: HTMLDivElement;

  public up?: Cell;
  public down?: Cell;
  public left?: Cell;
  public right?: Cell;

  private cellFill?: Fill;

  get fill(): Fill | null { return this.cellFill; }

  set fill(fill: Fill | null) {
    if (!fill) {
      if (this.div.hasChildNodes()) {
        this.div.removeChild(this.cellFill.div);
      }
      this.cellFill = null;
      return;
    }
    this.cellFill = fill;
    this.div.appendChild(this.cellFill.div);
  }

  constructor(cellDiv: HTMLDivElement) {
    this.div = cellDiv;
  }

  // eslint-disable-next-line consistent-return
  neighbor(dir: Dir): Cell | null {
    // eslint-disable-next-line default-case
    switch (dir) {
      case Dir.Up:
        return this.up;
      case Dir.Down:
        return this.down;
      case Dir.Left:
        return this.left;
      case Dir.Right:
        return this.right;
    }
  }
}

const cells: Cell[] = [];

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

  if (target.fill) {
    // eslint-disable-next-line no-param-reassign
    cell.fill = null;
    target.fill.value *= 2;
    target.fill.wasCombined = true;
  } else {
    target.fill = cell.fill;
    // eslint-disable-next-line no-param-reassign
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
      // eslint-disable-next-line no-param-reassign
      cell.fill.wasCombined = false;
    }
  });

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

  const fill = new Fill(value);
  cell.fill = fill;
};

const randomSpawn = () => {
  const rand = Math.random();
  if (rand < 0.1) return;

  const value = rand > 0.8 ? 4 : 2;
  spawn(value);
};

const input = (dir: Dir) => {
  const moved = slide(dir);
  if (moved) randomSpawn();
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

spawn(2);
