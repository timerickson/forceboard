import { html, Component } from 'preact';
import { Item } from 'data';
import { ItemControl } from 'itemControl';
import { RelationshipControl } from 'relationshipControl';
import { SelectedControl } from 'selectedControl';
import { DataChanged, ConfigChanged } from 'events';

export class ControlPanel extends Component {
    state = {
        itemSize: Item.defaults.size
    }

    constructor(props) {
        super(props);

        DataChanged.subscribe(() => {
            this.setState({});
        })
    }

    onSliderInput(e) {
        // console.debug('sliderInput', e);
        // make sure new size is numeric not string so math is correct in graph layout
        const newSize = e.target.value * 1.0;
        Item.defaults.size = newSize;
        ConfigChanged.fire();

        this.setState({
            itemSize: e.target.value
        });
    }

    render({ data }, { itemSize }) {
        return html`
            <div class=control-panel>
                <!-- https://stackoverflow.com/questions/21515042/scrolling-a-flexbox-with-overflowing-content -->
                <div class=control-panel__box>
                    <h3>selection</h3>
                    <${SelectedControl} data=${data} />
                </div>
                <div class=control-panel__box>
                    <h3>items</h3>
                    <p><input type=range class=slider min=0 max=100 value=${itemSize} oninput=${(e) => this.onSliderInput(e)} /></p>
                    <ul>
                        ${data.items.map(item => html`
                            <${ItemControl} key=${item.id} item=${item} data=${data} />
                        `)}
                    </ul>
                </div>
                <div class=control-panel__box>
                    <h3>relationships</h3>
                    <ul>
                        ${data.relationships.map(rel => html`
                            <${RelationshipControl} key=${rel.id} relationship=${rel} data=${data} />
                        `)}
                    </ul>
                </div>
            </div>
        `
    }
}
