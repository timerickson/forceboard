import { html, Component } from 'preact';
import { makeItem } from 'data';
import { injectTestCommands } from 'test';

const FEEDBACK_VISIBLE_CLASS = 'command-bar__feedback_visible';
const FEEDBACK_VISIBLE_TIME_SECS = 3;

export class CommandBar extends Component {
    state = {
        input: "",
    }

    componentDidMount() {
        console.log('CommandBar.componentDidMount');
        try {
            injectTestCommands((cmd) => this.processCommand(cmd));
        } catch (error) {
            if (error.message.includes("injectTestCommands is not defined")) {
                console.info("Not injecting test commands");
            } else {
                throw error;
            }
        }
        console.log('CommandBar.componentDidMount 2');
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.borderBoxSize?.length > 0) {
                    this.updateFeedbackDivPosition();
                    // this.updateSvgLayoutAttributes({
                    //   width: entry.borderBoxSize[0].inlineSize,
                    //   height: entry.borderBoxSize[0].blockSize
                    // });
                  } else {
                    console.warn('ResizeObserver fallback');
                    this.updateSvgLayoutAttributes({
                      width: entry.contentRect.width,
                      height: entry.contentRect.height
                    });
                  }
            }
        });
        resizeObserver.observe(this.base);
        this.resizeObserver = resizeObserver;
        this.updateFeedbackDivPosition();
    }

    componentWilUnmount() {
        console.warn('CommandBar.componentWillUnmount');
        this.resizeObserver.disconnect();
    }

    updateFeedbackDivPosition() {
        // console.debug('CommandBar.updateFeedbackDivPosition');
        const inputRect = this.inputDiv.getBoundingClientRect();
        const feedbackRect = this.feedbackDiv.getBoundingClientRect();
        // console.debug('CommandBar.updateFeedbackDivPosition', inputRect, feedbackRect);
        this.feedbackDiv.style.left = inputRect.left + 'px';
        this.feedbackDiv.style.top = (inputRect.top - feedbackRect.height) + 'px';
    }

    showFeedbackDiv(msg) {
        this.feedbackDiv.textContent = msg;
        this.feedbackDiv.classList.add(FEEDBACK_VISIBLE_CLASS);
        setTimeout(() => {
            this.hideFeedbackDiv();
        }, FEEDBACK_VISIBLE_TIME_SECS * 1000);
    }

    hideFeedbackDiv() {
        this.feedbackDiv.classList.remove(FEEDBACK_VISIBLE_CLASS);
    }

    onCommandInput = (ev) => {
        // console.log('onCommandInput', ev.target.value, this);
        this.setState({
            input: ev.target.value
        });
    }

    onKeyUp = ev => {
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
        this.setState({
            input: ''
        });
    }

    unknownCommand(cmd, args) {
        const msg = `InvalidCommand: ${cmd} ${args.join(' ')}`;
        console.error(msg);
        this.showFeedbackDiv(msg);
    }

    declareItem(args) {
        if (args.length !== 1) {
            console.error('InvalidArguments: d', args);
            return;
        }
        this.props.data.addItem(makeItem(args[0]));
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
            <div class=command-bar>
                <div class="command-bar__feedback" ref=${e => this.feedbackDiv = e}>
                    type 'foo' + [enter] to add an item
                </div>
                <div class=command-bar__elements ref=${e => this.inputDiv = e}>
                    <div class=command-bar__controls>
                        <input type="text" onInput=${this.onCommandInput} onKeyUp=${this.onKeyUp} value=${input} autofocus />
                        <button onClick=${this.processCommand}>Enter</button>
                    </div>
                </div>
            </div>
        `
    }
}
