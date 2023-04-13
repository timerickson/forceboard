import { Component } from 'preact';
import { Types } from 'data';

class EventSubscribingComponent extends Component {
    constructor() {
        super(...arguments);
        const subscriptions = [];
        this.subscribe = (ev, callback) => {
            subscriptions.push(ev.subscribe(callback));
        }
        this.unsubscribeAll = () => {
            subscriptions.forEach(sub => sub.cancel());
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
    constructor(name, stopPropagation = false) {
        this.name = name;
        const callbacks = [];

        this.fire = (data, e) => {
            if (e && stopPropagation) {
                // console.log('stopPropagation')
                e.stopPropagation();
            }
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
            console.debug(`Event ${name} unsubscribe ${callback}`);
            const idx = callbacks.indexOf(callback);
            if (idx !== -1) {
                callbacks.splice(idx, 1);
            }
        }
    }
}

function eventData(type, id) {
    return { "type": type, "id": id };
}

function windowData() {
    return eventData(Types.WINDOW, undefined);
}

function itemData(id) {
    return eventData(Types.ITEM, id);
}

function relationshipData(id) {
    return eventData(Types.RELATIONSHIP, id);
}

const Enter = new Event('Enter');
const Leave = new Event('Leave');
const Click = new Event('Click', true);
const Selected = new Event('Selected');
const Deselected = new Event('Deselected');
const Pinned = new Event('Pinned');
const Unpinned = new Event('Unpinned');
const DataChanged = new Event('DataChanged');
const ConfigChanged = new Event('ConfigChanged');

export {
    EventSubscribingComponent,
    windowData,
    itemData,
    relationshipData,
    Enter,
    Leave,
    Click,
    Selected,
    Deselected,
    Pinned,
    Unpinned,
    DataChanged,
    ConfigChanged
};