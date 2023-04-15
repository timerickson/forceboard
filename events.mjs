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
            // console.debug(`Event ${name} unsubscribe ${callback}`);
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

export function windowData() {
    return eventData(Types.WINDOW, undefined);
}

export function itemData(id) {
    return eventData(Types.ITEM, id);
}

export function relationshipData(id) {
    return eventData(Types.RELATIONSHIP, id);
}

export const Enter = new Event('Enter');
export const Leave = new Event('Leave');
export const Click = new Event('Click', true);
export const Selected = new Event('Selected');
export const Deselected = new Event('Deselected');
export const DataChanged = new Event('DataChanged');
export const GraphUpdated = new Event('GraphUpdated');
export const ConfigChanged = new Event('ConfigChanged');

export {
    EventSubscribingComponent
};