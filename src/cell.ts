import Dir from './dir';
import Fill from './fill';

export default class Cell {
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
