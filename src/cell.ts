import Dir from './dir';
import Fill from './fill';

const resetFillPosition = (fill: Fill | null) => {
  if (!fill) return;
  fill.div.style.top = '0px';
  fill.div.style.left = '0px';
};

export default class Cell {
  div: HTMLDivElement;

  public up?: Cell;
  public down?: Cell;
  public left?: Cell;
  public right?: Cell;

  private cellFill?: Fill;
  private otherFill?: Fill;

  get fill(): Fill | null { return this.cellFill; }

  set fill(fill: Fill | null) {
    if (!fill) {
      this.div.childNodes.forEach((node) => this.div.removeChild(node));
      this.cellFill = null;
      return;
    }
    this.cellFill = fill;
    this.div.appendChild(this.cellFill.div);
  }

  get mergeFill(): Fill | null { return this.otherFill; }

  set mergeFill(fill: Fill | null) {
    if (fill) {
      this.otherFill = fill;
      this.otherFill.div.style.zIndex = '5';
      this.div.appendChild(this.otherFill.div);
    } else if (this.otherFill) {
      this.div.removeChild(this.otherFill.div);
      this.otherFill = null;
    }
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

  resetFillPosition() {
    resetFillPosition(this.fill);
    resetFillPosition(this.mergeFill);
  }
}
