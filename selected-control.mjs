import { html, Component } from 'preact';
import {
    Selected,
    Deselected
} from 'events';
import { Types } from 'data';

export class SelectedControl extends Component {
    state = {
        selectionType: '',
        selection: []
    }

    constructor(props) {
        super(props);

        this.data = this.props.data;

        Selected.subscribe((d) => this.onSelected(d));
        Deselected.subscribe((d) => this.onDeselected(d));
    }

    onSelected({ type, id }) {
        let selection;
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
        });
    }

    onDeselected({ id }) {
        this.setState({
            selection: this.state.selection.filter(x => x.id !== id)
        });
    }

    selectionName() {
        let { selectionType, selection } = this.state;
        if (!selection.length) {
            selectionType = 'none';
        }
        return `${selectionType}${(selection.length > 1) ? 's' : ''} ${selection.map(x => x.id).join(',')}`;
    }

    render() {
        return html`
            <p>Selection</p>
            ${this.selectionName()}
        `;
    }
}