import { Types } from 'data';
import {
    Enter,
    Leave,
    Click,
    Selected,
    Deselected,
    SelectionChanged,
    GraphUpdated
} from 'events';

export class SelectionCoordinator {
    selection = []
    clicked = false

    constructor() {
        Enter.subscribe((d) => this.select(d));
        Leave.subscribe((d) => this.deselect(d));
        Click.subscribe((d) => this.select(d, true));
        GraphUpdated.subscribe(() => this.onGraphUpdated());
    }

    onGraphUpdated() {
        // TODO: Unhack this!
        // Without this, when a node is clicked (selected by clicking),
        // and another node is removed, the first node appears deselected
        // because of the graph update doesn't re-apply the animation
        this.selection.forEach(d => Selected.fire(d));
    }

    select(d, wasClicked = false) {
        if (d.type === Types.WINDOW) {
            return this.clearSelection(); // nothing to select here
        }
        // console.debug('select', d);
        if (!wasClicked) {
            if (this.selection.length) {
                return;
            }
        } else {
            if (this.selection.filter(x => x.id === d.id).length) {
                if (!this.clicked) {
                    this.clicked = true;
                }
            } else {
                this.clearSelection();
                this.clicked = true;
            }
        }
        if (this.selection.length) { // we don't support multi-selection yet
            return;
        }
        this.selection.push(d);
        Selected.fire(d);
        SelectionChanged.fire([...this.selection]);
    }

    deselect(d) {
        // console.debug('deselect', d);
        const idx = this.selection.findIndex(x => x.id === d.id);
        if (idx !== -1 && !this.clicked) {
            this.selection.splice(idx, 1);
            Deselected.fire(d)
            SelectionChanged.fire([...this.selection]);
        }
    }

    clearSelection() {
        // console.debug('clearSelection', this.selection);
        this.clicked = false;
        this.selection.slice().forEach(d => {
            this.deselect(d);
        });
    }
}