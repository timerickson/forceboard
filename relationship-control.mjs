import { html } from 'preact';
import { Types } from 'data';
import {
    EventSubscribingComponent,
    relationshipData,
    Enter,
    Leave,
    Click,
    Selected,
    Deselected
} from "events";

export class RelationshipControl extends EventSubscribingComponent {
    constructor(props) {
        super(props);
    
        this.removeRelationship = (e) => {
            e.stopPropagation();
            const id = props.relationship.id;
            Leave.fire(relationshipData(id));
            Deselected.fire(relationshipData(id))
            props.data.removeRelationship(id);
        };

        this.subscribe(Selected, (d) => this.onSelected(d));
        this.subscribe(Deselected, (d) => this.onDeselected(d))
    }

    isMyRelationship(d) {
        return d.type === Types.RELATIONSHIP && d.id === this.props.relationship.id;
    }

    onSelected(d) {
        if (!this.isMyRelationship(d)) {
            return;
        }
        // console.debug(`NOT IMPLEMENTED: RelationshipControl ${id} onSelected`);
    }

    onDeselected(d) {
        if (!this.isMyRelationship(d)) {
            return;
        }
        // console.debug(`NOT IMPLEMENTED: RelationshipControl ${id} onDeselected`);
    }

    render({ relationship }) {
        const { id } = relationship;
        const eventData = relationshipData(id);
        return html`
            <li
                onmouseenter=${() => Enter.fire(eventData)}
                onmouseleave=${() => Leave.fire(eventData)}
                onclick=${() => Click.fire(eventData)}
                key=${id}>${id}
                <button onClick=${(e) => this.removeRelationship(e)}>x<//>
            </li>
        `;
    }
}