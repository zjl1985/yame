import { PixiCameraDirective } from './pixi/directive/camera';
import { PixiGridDirective } from './pixi/directive/grid';
import { PixiService } from './pixi/service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { PixiComponent } from './pixi/component';

@NgModule({
  imports: [BrowserModule],
  exports: [
    PixiCameraDirective,
    PixiGridDirective,
    PixiComponent
  ],
  declarations: [
    PixiCameraDirective,
    PixiGridDirective,
    PixiComponent,
  ],
  providers: [PixiService]
})
export class PixiModule { }
