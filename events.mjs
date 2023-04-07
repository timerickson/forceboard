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

export {
    EventSubscribingComponent,
    UiEvent,
    GraphEvent
};