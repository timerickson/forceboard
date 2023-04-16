import { html, Component } from 'preact';
import {
    Selected,
    Deselected
} from 'events';
import { Types } from 'data';

const PARENT_BLOCK_CLASS = "selected-control";
const NONE_DIV_CLASS = `${PARENT_BLOCK_CLASS}__none`;
const ITEM_DIV_CLASS = `${PARENT_BLOCK_CLASS}__item`;
const RELATIONSHIP_DIV_CLASS = `${PARENT_BLOCK_CLASS}__relationship`;
const VISIBLE_CLASS = `${PARENT_BLOCK_CLASS}__visible`;

export class SelectedControl extends Component {
    state = {
        selectionType: '',
        selection: []
    }

    boxNone = undefined
    boxItem = undefined
    boxRelationshp = undefined

    constructor(props) {
        super(props);

        this.data = this.props.data;

        Selected.subscribe((d) => this.onSelected(d));
        Deselected.subscribe((d) => this.onDeselected(d));
    }

    onSelected({ type, id }) {
        let selection;
        const oldType = this.state.selectionType;
        if (type === Types.ITEM) {
            selection = this.data.getItem(id);
        } else if (type === Types.RELATIONSHIP) {
            selection = this.data.getRelationship(id);
        } else {
            console.warn(`Unexpected type ${type}`);
            return;
        }
        this.setState({
            selectionType: type,
            selection: this.state.selection.concat(selection)
        }, () => {
            // console.debug('switch selected', oldType, type);
            this.switchBoxes(oldType, type);
        });
    }

    switchBoxes(oldType, newType) {
        if (newType === oldType) {
            return;
        }
        this.setVisibility(oldType, false);
        this.setVisibility(newType, true);
    }

    setVisibility(type, visible) {
        let box;
        switch (type) {
            case Types.ITEM:
                box = this.boxItem;
                break;
            case Types.RELATIONSHIP:
                box = this.boxRelationshp;
                break;
            default:
                box = this.boxNone;
        }
        if (visible) {
            box.classList.add(VISIBLE_CLASS);
        } else {
            box.classList.remove(VISIBLE_CLASS);
        }
    }

    onDeselected({ id }) {
        const oldType = this.state.selectionType;
        const newSelection = this.state.selection.filter(x => x.id !== id);
        const newType = newSelection.length ? newSelection[0].type : 'none';
        this.setState({
            selectionType: newType,
            selection: newSelection
        }, () => {
            // console.debug('switch deselected', oldType, newType);
            this.switchBoxes(oldType, newType);
        });
    }

    selectionName() {
        let { selectionType, selection } = this.state;
        if (!selection.length) {
            selectionType = 'none';
        }
        return `${selection.map(x => x.id).join(',')}`;
    }

    render() {
        return html`
            <div ref=${e => this.boxNone = e} class="${NONE_DIV_CLASS} ${VISIBLE_CLASS}">
                --- no selection ---
            </div>
            <div ref=${e => this.boxItem = e} class=${ITEM_DIV_CLASS}>
                item ${this.selectionName()}
            </div>
            <div ref=${e => this.boxRelationshp = e} class=${RELATIONSHIP_DIV_CLASS}>
                relationship ${this.selectionName()}
            </div>
        `;
    }
}