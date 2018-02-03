import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import { PixiComponent } from '../component';
import { Grid } from '../utils/grid';
import { Camera } from '../utils/camera';

/**
 * Grid directive which can be attched to the pixi component.
 * This directive will create a grid and render it below the current scene.
 */
@Directive({
  selector: 'pixi[pixiGrid]'
})
export class PixiGridDirective implements AfterViewInit {

  private internalGrid: Grid;
  private currentCam: Camera;

  constructor(private host: PixiComponent) {
  }

  /** @inheritdoc */
  ngAfterViewInit() {
    let parent = (<HTMLElement>this.host.ref.nativeElement);
    let width = parent.offsetWidth;
    let height = parent.offsetHeight;
    this.internalGrid = new Grid(this.host.pixiService.scene);
    this.internalGrid.update(width, height);
  }

  /**
   * @readonly
   * @type {Grid}
   */
  get grid(): Grid {
    return this.internalGrid;
  }

  /**
   * Updates the grid, i.e. re-renders the grid based on the host's dimensions.
   * @returns {void}
   */
  update() {
    let parent = (<HTMLElement>this.host.ref.nativeElement);
    this.internalGrid.update(parent.offsetWidth, parent.offsetHeight);
  }

  /**
   * Sets up the update event handler for the given camera.
   * @param {Camera} camera
   * @returns {void}
   */
  listenToCamera(camera: Camera) {
    if (this.currentCam)
      this.currentCam.off('update', this.update, this);
    if (!camera) return;
    this.currentCam = camera;
    camera.on('update', this.update, this);
  }
}
