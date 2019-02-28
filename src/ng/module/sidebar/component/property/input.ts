import { PropertyComponent, InputEvent } from './abstract';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  template: `
  <mat-form-field class="full">
    <input matInput
        type="{{ property.type }}"
        placeholder="{{ property.name }}"
        [disabled]="!property.editable"
        [value]="property.value ? property.value : ''"
        (input)="update({ originalEvent: $event, property: property })" />
  </mat-form-field>`,
  styleUrls: ['./style.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPropertyComponent extends PropertyComponent {

  /**
   * @inheritdoc
   */
  update(event: InputEvent) {
    this.property.value = (<HTMLInputElement>event.originalEvent.currentTarget).value;
    return super.update(event);
  }

}
