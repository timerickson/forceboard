import { html, Component } from 'preact';
import { ItemControl } from 'itemControl';
import { RelationshipControl } from 'relationshipControl';
import { SelectedControl } from 'selectedControl';
import { DataChanged } from 'events';

export class ControlPanel extends Component {
    constructor(props) {
        super(props);
        DataChanged.subscribe(() => {
            this.setState({});
        })
    }

    render({ data }, _) {
        return html`
            <div style="flex: 1; display: flex; overflow: auto;">
                <!-- https://stackoverflow.com/questions/21515042/scrolling-a-flexbox-with-overflowing-content -->
                <div style="flex: 1; overflow: scroll;">
                    <ul>
                        ${data.items.map(item => html`
                            <${ItemControl} item=${item} data=${data} />
                        `)}
                    </ul>
                </div>
                <div style="flex: 1; overflow: scroll;">
                    <ul>
                        ${data.relationships.map(rel => html`
                            <${RelationshipControl} relationship=${rel} data=${data} />
                        `)}
                    </ul>
                </div>
                <div style="flex: 1; overflow: scroll;">
                    <${SelectedControl} data=${data} />
                </div>
            </div>
        `
    }
}
