import { html, Component } from 'preact';
import {
    ItemSelected,
    ItemDeselected,
    RelationshipSelected,
    RelationshipDeselected
} from 'events';

const ITEM = 'item';
const RELATIONSHIP = 'relationship';

export class SelectedControl extends Component {
    state = {
        selectionType: '',
        selection: []
    }

    constructor(props) {
        super(props);

        this.data = this.props.data;

        ItemSelected.subscribe((id) => this.onItemSelected(id));
        ItemDeselected.subscribe((id) => this.onDeselected(id));
        RelationshipSelected.subscribe((id) => this.onRelationshipSelected(id));
        RelationshipDeselected.subscribe((id) => this.onDeselected(id));
    }

    onItemSelected(id) {
        const itm = this.data.getItem(id);
        this.setState({
            selectionType: ITEM,
            selection: this.state.selection.concat(itm)
        });
    }

    onRelationshipSelected(id) {
        this.setState({
            selectionType: RELATIONSHIP,
            selection: this.state.selection.concat(this.data.getRelationship(id))
        });
    }

    onDeselected(id) {
        this.setState({
            selection: this.state.selection.filter(x => x.id !== id)
        });
    }

    selectionName() {
        const { selectionType, selection } = this.state;
        return `${selectionType}${selection.length ? 's' : ''} ${selection.map(x => x.id).join(',')}`;
    }

    render() {
        return html`
            ${this.selectionName()}
        `;
    }
}