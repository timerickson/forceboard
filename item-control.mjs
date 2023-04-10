import { html } from 'preact';
import {
    EventSubscribingComponent,
    ItemSelected,
    ItemDeselected
} from 'events';

export class ItemControl extends EventSubscribingComponent {
    constructor(props) {
        super(props);
    
        this.removeItem = () => {
            ItemDeselected.fire(props.item.id);
            props.data.removeItem(props.item.id);
        };

        this.subscribe(ItemSelected, (id) => this.onItemSelected(id));
        this.subscribe(ItemDeselected, (id) => this.onItemDeselected(id));
    }

    isMyItem(id) {
        return id === this.props.item.id;
    }

    onItemSelected(id) {
        if (!this.isMyItem(id)) {
            return;
        }
        // console.debug(`NOT IMPLEMENTED: ItemControl ${id} onItemSelected`);
    }

    onItemDeselected(id) {
        if (!this.isMyItem(id)) {
            return;
        }
        // console.debug(`NOT IMPLEMENTED: ItemControl ${id} onItemDeselected`);
    }

    render({ item }) {
        return html`
            <li
                onmouseenter=${() => ItemSelected.fire(item.id)}
                onmouseleave=${() => ItemDeselected.fire(item.id)}
                key=${item.id}>${item.id}
                <button onClick=${() => this.removeItem(item.id)}>x<//>
            </li>
        `;
    }
}