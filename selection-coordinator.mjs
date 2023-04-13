import { Types } from 'data';
import {
    Enter,
    Leave,
    Click,
    Selected,
    Deselected,
    Pinned,
    Unpinned
} from 'events';

export class SelectionCoordinator {
    selection = []

    constructor() {
        Enter.subscribe((d) => this.onEnter(d));
        Leave.subscribe((d) => this.onLeave(d));
        Click.subscribe((d) => this.onClick(d));
    }

    onEnter(d) {
        // console.debug('onEnter', d);
        if (this.selection.length) {
            return;
        }
        this.select(d);
    }

    selectionWasClicked() {
        return (this.selection.findIndex(x => x.clicked) !== -1);
    }

    onLeave(d) {
        // console.debug('onLeave', d, this.selection);
        if (this.selectionWasClicked()) {
            return;
        }
        this.clearSelection();
    }

    onClick(d) {
        // console.debug('onClick', d);
        if (d.type === Types.WINDOW) {
            this.clearSelection();
        } else {
            d.clicked = true;
            this.select(d);
        }
    }

    select(d) {
        // console.debug('select', d);
        if (this.select.length) {
            this.clearSelection();
        }
        this.selection.push(d);
        Selected.fire(d);
    }

    clearSelection() {
        // console.debug('clearSelection', this.selection);
        while (this.selection.length) {
            Deselected.fire(this.selection.pop());
        }
    }
}