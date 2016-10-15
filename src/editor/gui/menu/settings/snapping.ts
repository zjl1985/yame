import { View } from './../../../../core/view/abstract';
import { Input } from './../../../../core/view/input';

import * as SELECTION from '../../../interaction/selection';
import * as EDITOR from '../../../globals';

export class Snapping extends View {

    constructor(options: any = { }) {
        super(options);

        let angleSnapping = new Input({id: 'angleSnapping'});

        (<any>$('#snapToGrid'))
            .first()
            .checkbox(SELECTION.snapToGrid ? 'check' : 'uncheck')
            .checkbox({
                onChecked: () => SELECTION.snapToGrid = true,
                onUnchecked: () => SELECTION.snapToGrid = false,
            });

        (<any>$('#snapToAngle'))
            .first()
            .checkbox(SELECTION.snapToAngle ? 'check' : 'uncheck')
            .checkbox({
                onChecked: () => { SELECTION.snapToAngle = true; angleSnapping.$el.removeAttr('disabled') },
                onUnchecked: () => { SELECTION.snapToAngle = false; angleSnapping.$el.attr('disabled', '')},
            });
        angleSnapping.value = String(SELECTION.angleSnap)
        angleSnapping.$el.on('keyup change blur', () => {
            let newAngle = parseFloat(angleSnapping.value);
            if (!isNaN(newAngle)) SELECTION.angleSnap = newAngle;
        });

        if (SELECTION.snapToAngle)
            angleSnapping.$el.removeAttr('disabled');
    }
}