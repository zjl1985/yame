import { SelectionContainer } from "../container";
import { interaction } from "pixi.js";

export class SelectionTranslateHandler {

  private startPos: PIXI.Point;
  private mouseCurrentPos: PIXI.Point;
  private mouseStartPos: PIXI.Point;

  constructor(private container: SelectionContainer) {
    this.startPos = new PIXI.Point();
    this.mouseCurrentPos = new PIXI.Point();
    this.mouseStartPos = new PIXI.Point();
    container.on('mousedown', this.start, this);
    container.on('mouseup', this.end, this);
    container.on('mousemove', this.move, this);
    container.on('unselected', () => {
      if (container.length === 0)
        container.position.set(0, 0);
    });
  }

  start(event: interaction.InteractionEvent) {
    if (this.container.isHandling) return;
    this.container.beginHandling(this, event);
    this.mouseStartPos.set(event.data.global.x, event.data.global.y);
    this.container.parent.toLocal(this.mouseStartPos, null, this.mouseStartPos);
    this.startPos.set(this.container.position.x, this.container.position.y);
  }

  end(event: interaction.InteractionEvent) {
    if (!this.container.isHandling || this.container.currentHandler !== this) return;
    this.container.endHandling(event);
  }

  move(event: interaction.InteractionEvent) {
    if (!this.container.isHandling || this.container.currentHandler !== this) return;
    this.mouseCurrentPos.set(event.data.global.x, event.data.global.y);
    this.container.parent.toLocal(this.mouseCurrentPos, null, this.mouseCurrentPos);
    this.container.position.x = this.startPos.x + (this.mouseCurrentPos.x - this.mouseStartPos.x);
    this.container.position.y = this.startPos.y + (this.mouseCurrentPos.y - this.mouseStartPos.y);
    this.container.emit('moved');
  }
}