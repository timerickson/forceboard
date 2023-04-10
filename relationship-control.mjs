import { html } from 'preact';
import {
    EventSubscribingComponent,
    RelationshipSelected,
    RelationshipDeselected
} from "events";

export class RelationshipControl extends EventSubscribingComponent {
    constructor(props) {
        super(props);
    
        this.removeRelationship = () => {
            RelationshipDeselected.fire(props.relationship.id);
            props.data.removeRelationship(props.relationship.id);
        };

        this.subscribe(RelationshipSelected, (id) => this.onRelationshipSelected(id));
        this.subscribe(RelationshipDeselected, (id) => this.onRelationshipDeselected(id))
    }

    isMyRelationship(id) {
        return id === this.props.relationship.id;
    }

    onRelationshipSelected(id) {
        if (!this.isMyRelationship(id)) {
            return;
        }
        // console.debug(`NOT IMPLEMENTED: RelationshipControl ${id} onRelationshipSelected`);
    }

    onRelationshipDeselected(id) {
        if (!this.isMyRelationship(id)) {
            return;
        }
        // console.debug(`NOT IMPLEMENTED: RelationshipControl ${id} onRelationshipDeselected`);
    }

    render({ relationship }) {
        return html`
            <li
                onmouseenter=${() => RelationshipSelected.fire(relationship.id)}
                onmouseleave=${() => RelationshipDeselected.fire(relationship.id)}
                key=${relationship.id}>${relationship.id}
                <button onClick=${() => this.removeRelationship(relationship.id)}>x<//>
            </li>
        `;
    }
}