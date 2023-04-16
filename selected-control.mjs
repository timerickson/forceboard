import { html, Component } from 'preact';
import {
    SelectionChanged
} from 'events';
import { Types } from 'data';
import { ConfigChanged } from './events.mjs';

export class SelectedControl extends Component {
    state = {
        selectionType: 'none',
        selection: []
    }

    constructor(props) {
        super(props);

        this.data = this.props.data;
    }

    componentDidMount() {
        SelectionChanged.subscribe((d) => this.onSelectionChanged(d));
        this.base.addEventListener('click', (e) => {
            console.debug('SelectedControl.base.click');
            e.stopPropagation();
        });
    }

    onSelectionChanged(newSelection) {
        // console.debug('SelectedControl.onSelectionChanged', newSelection);
        this.setState({
            selectionType: newSelection.length ? newSelection[0].type : 'none',
            selection: newSelection
        });
    }

    getSelectionName() {
        return `${this.state.selection.map(x => x.id).join(',')}`;
    }

    onSliderInput(e) {
        const newSize = e.target.value * 1.0;
        this.state.selection.forEach(d => {
            this.data.getItem(d.id).size(newSize);
        });
        this.setState({}, () => ConfigChanged.fire());
    }

    getItem(d) {
        return this.data.getItem(d.id);
    }

    getTagList(obj) {
        return obj.tags;
    }

    render(_, { selection, selectionType }) {
        let selectionName = this.getSelectionName();
        switch (selectionType) {
            case Types.ITEM:
                let item = this.getItem(selection[0]);
                return html`
                    <div>
                        <p>item ${item.id}</p>
                        <p>size<input type=range class=slider min=0 max=100 value=${item.size()} oninput=${(e) => this.onSliderInput(e)} /></p>
                        <p>color<input type=text value=${item.color().toString()} /></p>
                        <p>tags${this.getTagList(item).map(x => html`
                            <div>${x}</div>
                        `)}</p>
                    </div>
                `;
            case Types.RELATIONSHIP:
                return html`
                    <div>
                        relationship ${selectionName()}
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