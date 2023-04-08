import { Component } from 'preact';

class EventSubscribingComponent extends Component {
    constructor() {
        super(...arguments);
        const subscriptions = [];
        this.subscribe = (ev, callback) => {
            subscriptions.push(ev.subscribe(callback));
        }
        this.unsubscribeAll = () => {
            this.subscriptions.forEach(sub => sub.cancel());
        }
    }

    componentWillUnmount() {
        this.unsubscribeAll();
    }
}

class Subscription {
    constructor(ev, callback) {
        this.cancel = () => {
            ev.unsubscribe(callback);
        }
    }
}

class Event {
    constructor(name) {
        this.name = name;
        const callbacks = [];

        this.fire = (data) => {
            // console.log(`Event: ${name} :: ${data}`);
            callbacks.forEach(c => {
                // console.log(`Event notification: ${name} :: ${c}`);
                c(data);
            });
        }

        this.subscribe = (callback) => {
            const sub = new Subscription(this, callback);
            callbacks.push(callback);
            return sub;
        }

        this.unsubscribe = (callback) => {
            console.log(`Event ${name} unsubscribe ${callback}`);
            const idx = callbacks.indexOf(callback);
            if (idx !== -1) {
                callbacks.splice(idx, 1);
            }
        }
    }
}

const UiEvent = new Event('UiEvent');
const GraphEvent = new Event('GraphEvent');
const GraphItemMouseEnter = new Event('GraphItemMouseEnter');
const GraphItemMouseLeave = new Event('GraphItemMouseLeave');
const UiItemMouseEnter = new Event('UiMouseEnter');
const UiItemMouseLeave = new Event('UiMouseLeave');
const ItemSelected = new Event('ItemSelected');
const ItemDeselected = new Event('ItemDeselected');
const RelationshipSelected = new Event('RelationshipSelected');
const RelationshipDeselected = new Event('RelationshipDeselected');
const LinkDeleted = new Event('LinkDeleted');

export {
    EventSubscribingComponent,
    UiEvent,
    GraphEvent,
    GraphItemMouseEnter,
    GraphItemMouseLeave,
    UiItemMouseEnter,
    UiItemMouseLeave,
    ItemSelected,
    ItemDeselected,
    RelationshipSelected,
    RelationshipDeselected,
    LinkDeleted
};