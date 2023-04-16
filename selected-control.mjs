import { html, Component } from 'preact';
import {
    SelectionChanged
} from 'events';
import { Types } from 'data';

export class SelectedControl extends Component {
    state = {
        selectionType: 'none',
        selection: []
    }

    constructor(props) {
        super(props);

        this.data = this.props.data;

        SelectionChanged.subscribe((d) => this.onSelectionChanged(d));
    }

    onSelectionChanged(newSelection) {
        // console.debug('SelectedControl.onSelectionChanged', newSelection);
        newSelection.forEach(d => {
            if (d.type === Types.ITEM) {
                d.obj = this.data.getItem(d.id);
            } else if (d.type === Types.RELATIONSHIP) {
                d.obj = this.data.getRelationship(d.id);
            }
        });
        this.setState({
            selectionType: newSelection.length ? newSelection[0].type : 'none',
            selection: newSelection
        });
    }

    selectionName() {
        return `${this.state.selection.map(x => x.id).join(',')}`;
    }

    render(_, { selectionType }) {
        switch (selectionType) {
            case Types.ITEM:
                return html`
                    <div>
                        <p>item ${this.selectionName()}</p>
                        <p>size<input type=slider /></p>
                        <p>color<input type=text value=abc /></p>
                    </div>
                `;
            case Types.RELATIONSHIP:
                return html`
                    <div>
                        relationship ${this.selectionName()}
                    </div>
                `;
            default:
                return html`
                    <div>
                        --- no selection ---
                    </div>
                `;
        }
    }
}