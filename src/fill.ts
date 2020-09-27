const removeAnimationClassWhenFinished = (el: HTMLDivElement, animationName: string) => {
  const doIt = (e: AnimationEvent) => {
    if (e.animationName !== animationName) return;
    el.classList.remove(animationName);
  };
  el.addEventListener('animationend', doIt);
  el.addEventListener('animationcancel', doIt);
};

export default class Fill {
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

  constructor(value: number, spawn?: boolean) {
    this.div = document.createElement('div');
    this.div.classList.add('fill');

    if (spawn) {
      this.div.classList.add('spawn');
    }

    removeAnimationClassWhenFinished(this.div, 'spawn');
    removeAnimationClassWhenFinished(this.div, 'merge');

    this.valueDiv = document.createElement('div');
    this.valueDiv.classList.add('value');
    this.div.appendChild(this.valueDiv);

    this.value = value;
  }
}
