import { html } from 'preact';
import { Types } from 'data';
import {
    EventSubscribingComponent,
    itemData,
    Enter,
    Leave,
    Click,
    Selected,
    Deselected
} from 'events';

export class ItemControl extends EventSubscribingComponent {
    constructor(props) {
        super(props);
    
        this.removeItem = () => {
            const id = props.item.id;
            Deselected.fire(itemData(id));
            Leave.fire(itemData(id));
            props.data.removeItem(id);
        };

        this.subscribe(Selected, (d) => this.onSelected(d));
        this.subscribe(Deselected, (d) => this.onDeselected(d));
    }

    isMyItem(d) {
        return (d.type === Types.ITEM && d.id === this.props.item.id);
    }

    onSelected(d) {
        if (!this.isMyItem(d)) {
            return;
        }
        // console.debug(`NOT IMPLEMENTED: ItemControl ${d} onSelected`);
    }

    onDeselected(d) {
        if (!this.isMyItem(d)) {
            return;
        }
        // console.debug(`NOT IMPLEMENTED: ItemControl ${d} onDeselected`);
    }

    render({ item }) {
        const { id } = item;
        const eventData = itemData(id);
        return html`
            <li
                onmouseenter=${() => Enter.fire(eventData)}
                onmouseleave=${() => Leave.fire(eventData)}
                onclick=${(e) => Click.fire(eventData, e)}
                key=${id}>
                ${id}
                <button onClick=${() => this.removeItem(id)}>x<//>
            </li>
        `;
    }
}