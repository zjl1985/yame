import { ComponentView } from '../../../../core/renderer/view/component';
import * as _ from 'underscore';

import Entity from '../../../../core/renderer/graphics/entity';
import View from '../../../../core/renderer/view/abstract';
import ColorPicker from '../../../../core/renderer/view/colorPicker';
import LabeledInput from '../../../../core/renderer/view/composition/labeledInput';
import Point from './point';
import Value from './value';
import EventBus from '../../../../core/common/eventbus';
import Container from '../../interaction/transformation/container';


let Pubsub: Backbone.Events = require('backbone').Events;

export class Selection extends View {

    constructor(private container: Container) {
        super();

        // let position = new Point( { title: 'Position', instance: container.position } );
        // let scale = new Point( { title: 'Scale', instance: container.scale } );
        // let rotation = new Value( {title: 'Rotation', instance: container, attribute: 'rotation'});
        // let color = new ColorPicker({
        //     title: 'Tint and alpha',
        //     colorPicker: {
        //         localStorageKey: "spectrum",
        //     }
        // });

        // position.x.mapFrom = val => Math.round(val);
        // position.y.mapFrom = val => Math.round(val);

        // scale.x.mapFrom = val => Math.round(val * 100);
        // scale.y.mapFrom = val => Math.round(val * 100);
        // scale.x.mapTo = val => val / 100;
        // scale.y.mapTo = val => val / 100;

        // rotation.value.mapFrom = val => (360 + Math.round((<any>Math).degrees(val))) % 360;
        // rotation.value.mapTo = val => (<any>Math).radians(val);

        // this.add(position).add(scale).add(rotation);

        let ctx = {};

        Pubsub.on('selection:select', (children: Entity[]) => {
            this.empty();
            this.add(<any>ComponentView.get(container.transformation));
            if (children.length == 1) {
                this.add(<any>ComponentView.get(children[0].renderer));
            }
            // color.off('hide move', null, this);

            // let applyColor = () => {
            //     color.on('hide move', color => {
            //         children.forEach((child: any) => {
            //             child = <PIXI.Sprite>child;
            //             child.alpha = color.getAlpha();
            //             child.tint = parseInt(color.toHex(), 16);
            //         });
            //     }, this);
            // };

            // if (children.length === 1) {
            //     scale.x.input.enable();
            //     scale.y.input.enable();
            //     let child = <PIXI.Sprite><any>children[0];
            //     if ( typeof child.tint == 'number' ) {
            //         this.add(color);
            //         color.color = child.tint.toString(16);
            //         color.alpha = child.alpha;
            //         applyColor();
            //     } else this.delete(color, false);
            // }
            // else {
            //     let type = children[0].type;
            //     let found = _.find(children, child => child.type != type);
            //     if (found)
            //         this.delete(color, false);
            //     else {
            //         this.add(color);
            //         color.color = 'FFFFFF';
            //         color.alpha = 1;
            //         applyColor();
            //     }
            //     scale.x.input.disable();
            //     scale.y.input.disable();
            // }

        });
    }
}

export default Selection;