import { html, render } from 'preact';
import { Graph } from 'graph';
import { Data, makeItem } from 'data';
import { injectTestCommands } from 'test';
import {
    EventSubscribingComponent,
    UiEvent,
    GraphItemMouseEnter,
    GraphItemMouseLeave,
    LinkDeleted
} from './events.mjs';

class App extends EventSubscribingComponent {
    state = {
        data: new Data()
    }

    constructor(props) {
        super(props);

        GraphItemMouseEnter.subscribe(this.onGraphItemMouseEnter);
        GraphItemMouseLeave.subscribe(this.onGraphItemMouseLeave);
    }

    onGraphItemMouseEnter(id) {
        console.log('App.onGraphItemMouseEnter', id);
    }

    onGraphItemMouseLeave(id) {
        console.log('App.onGraphItemMouseLeave', id);
    }

    textInput = null

    componentDidMount() {
        try {
            injectTestCommands((cmd) => this.processCommand(cmd));
        } catch (error) {
            if (error.message.includes("injectTestCommands is not defined")) {
                console.info("Not injecting test commands");
            } else {
                throw error;
            }
        }
    }

    processCommand(cmdText = this.state.input) {
        // console.debug('processCommand', cmdText);
        let parts = cmdText.split(' ');
        let cmd = parts[0];
        let args = parts.slice(1);
        switch (cmd) {
            case 'd':
                this.declareItem(args);
                break;
            case 'r':
                this.relateItems(args);
                break;
            default:
                this.unknownCommand(cmd, args);
        }
        this.setState({
            input: "",
        }, () => this.focusInput());
    }

    unknownCommand(cmd, args) {
        console.error('InvalidCommand: ', cmd, args);
    }

    declareItem(args) {
        if (args.length !== 1) {
            console.error('InvalidArguments: d', args);
            return;
        }
        const newItem = makeItem(args[0]);
        this.state.data.addItem(newItem);
    }

    relateItems(args) {
        if (args.length !== 2) {
            console.error('InvalidArguments: r', args);
            return;
        }
        this.state.data.addRelationship(args[0], args[1]);
    }
    
    focusInput = () => {
        if (this.textInput) {
            this.textInput.focus();
        } else {
            console.warn("unable to focusInput");
        }
    }

    onCommandInput = (ev) => {
        // console.log('onCommandInput', ev.target.value, this);
        this.textInput = ev.target;
        UiEvent.fire(this.textInput.value);
        this.setState({
            input: ev.target.value
        });
    }

    onKeyUp = ev => {
        this.textInput = ev.target;
        if (ev.key === 'Enter') {
            this.processCommand();
        }
        ev.preventDefault();
    }

    removeRelationship = (id) => {
        console.debug('removeLink', id);
        this.state.data.removeRelationship(id);
        this.setState({});
    }

    removeItem = (id) => {
        console.debug('removeItem', id);
        this.state.data.removeItem(id);
        this.setState({});
    }

    render(_, { data, input }) {
        // console.log('App.render', arguments);
        let graphData = Object.assign({}, data);
        return html`
            <div style="display: flex; flex-direction: column; flex: 1; overflow: auto;">
                <div style="height: 30px;">
                    <h1>Diagram</h1>
                </div>
                <${Graph} data=${graphData} style="flex: 1;"><//>
                <div style="max-height: 20vh; display: flex; flex-direction: column; overflow: auto;">
                    <div>
                        <input type="text" onInput=${this.onCommandInput} onKeyUp=${this.onKeyUp} value=${input} autofocus/>
                        <button onClick=${this.processCommand}>Enter</button>
                    </div>
                    <div style="flex: 1; display: flex; overflow: auto;">
                        <!-- https://stackoverflow.com/questions/21515042/scrolling-a-flexbox-with-overflowing-content -->
                        <div style="flex: 1; overflow: scroll;">
                            <ul>
                                ${data.items.map(item => html`
                                    <li key=${item.id}>${item.id}<button onClick=${() => this.removeItem(item.id)}>x<//></li>
                                `)}
                            </ul>
                        </div>
                        <div style="flex: 1; overflow: scroll;">
                            <ul>
                                ${data.relationships.map(rel => html`
                                    <li key=${rel.id}>${rel.id}<button onClick=${() => this.removeRelationship(rel.id)}>x<//></li>
                                `)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

render(html`<${App}/>`, document.body.getElementsByTagName('main')[0]);