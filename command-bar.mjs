import { html, Component } from 'preact';
import { makeItem } from 'data';
import { injectTestCommands } from 'test';

export class CommandBar extends Component {
    constructor(props) {
        super(props);

        this.setState({
            input: "",
        }, () => this.focusInput());
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
        // console.debug('declareItem', this.props, newItem);
        this.props.data.addItem(newItem);
    }

    relateItems(args) {
        if (args.length !== 2) {
            console.error('InvalidArguments: r', args);
            return;
        }
        this.props.data.addRelationship(args[0], args[1]);
    }

    render(_, { input }) {
        return html`
            <div>
                <input type="text" onInput=${this.onCommandInput} onKeyUp=${this.onKeyUp} value=${input} autofocus/>
                <button onClick=${this.processCommand}>Enter</button>
            </div>
        `
    }
}
