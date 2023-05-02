import { html, Component } from 'preact';
import { getCommand, getPossibleCommands } from 'commands';
import { parseChunks } from 'commandParser';
import { initialCommands } from 'test';

const FEEDBACK_VISIBLE_CLASS = 'command-bar__feedback_visible';
const FEEDBACK_VISIBLE_TIME_SECS = 6;
const DEFAULT_PROMPT = 'foo to add';

export class Commander extends Component {
    state = {
        value: '',
        segments: [],
        completions: [],
        prompt: DEFAULT_PROMPT
    }

    componentDidMount() {
        try {
            const cmds = initialCommands.slice();
            const sendCommand = () => {
                if (!cmds.length) {
                    return false;
                }
                const cmd = cmds.shift();
                this.executeCommand(cmd);
                sendCommand();
            };
            sendCommand();
        } catch (error) {
            if (error.message.includes("injectTestCommands is not defined")) {
                console.info("Not injecting test commands");
            } else {
                throw error;
            }
        }

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.borderBoxSize?.length > 0) {
                    this.updateFeedbackDivPosition();
                  } else {
                    console.warn('ResizeObserver fallback');
                    this.updateFeedbackDivPosition();
                  }
            }
        });
        resizeObserver.observe(this.base);
        this.resizeObserver = resizeObserver;
        this.updateFeedbackDivPosition();
    }

    componentWilUnmount() {
        console.warn('Commander.componentWillUnmount');
        this.resizeObserver.disconnect();
    }

    updateFeedbackDivPosition() {
        // console.debug('Commander.updateFeedbackDivPosition');
        const inputRect = this.base.getBoundingClientRect();
        const feedbackRect = this.feedbackDiv.getBoundingClientRect();
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

    onKeyUp(e) {
        // console.debug('Commander.onKeyUp', e);
        if (e.key === 'Enter') {
            this.parseCommand(e.target.value, true);
            e.preventDefault();
        }
    }

    parseCommand(withValue, andExecute = false) {
        const cmdText = this.fullText(withValue);
        const { chunks } = parseChunks(cmdText);
        // console.debug('Commander.parseCommand', withValue, cmdText, chunks);
        if (!chunks.length) {
            console.warn('Commander.parseCommand no text');
            return;
        }
        const data = this.props.data;
        let state = {
            value: withValue,
            completions: [],
            segments: this.state.segments.splice(),
            prompt: DEFAULT_PROMPT
        };
        if (chunks.length > 1) { // we have typed the first ' ' (space), so we can resolve the command
            const cmd = getCommand(chunks[0]);
            // console.debug('Commander.parseCommand', 'resolved', cmd, chunks);

            if (andExecute && (chunks[chunks.length - 1] !== '')) {
                return this.executeCommand(withValue);
            }

            const segments = cmd.segments(chunks);
            state.value = segments.length ? chunks[chunks.length -1] : chunks.join(' ');
            state.segments = segments;
            state.completions = cmd.completions(data, chunks);
            state.prompt = cmd.prompt(data, chunks);
        } else {
            const possibleCommands = getPossibleCommands(cmdText);
            // console.debug('Commander.parseCommand', 'possible', possibleCommands);
            state.completions = possibleCommands.map(c => ({ value: `${c.shortcut} `, text: `${c.shortcut} | ${c.name}` }));
        }
        console.debug('parsed command', state);
        this.setState(state);
    }

    executeCommand(value = this.state.value) {
        // console.debug('processCommand', cmdText);
        const cmdText = this.fullText(value);
        const { chunks } = parseChunks(cmdText);
        try {
            const cmd = getCommand(chunks[0]);
            // console.debug('executeCommand', cmd, chunks);
            cmd.exec(this.props.data, chunks);
        } catch (ex) {
            if ('prompt' in ex) {
                return this.setState({ prompt: ex.prompt });
            } else {
                console.error('executeCommand error', ex);
                this.showFeedbackDiv(ex.message);
            }
        }
        this.setState({
            value: '',
            segments: [],
            completions: [],
            prompt: DEFAULT_PROMPT
        });
    }

    id = 0

    toggleCompletion(toggle) {
        if (toggle) {
            this.inputRef.setAttribute('list', 'commander-completion-' + this.id);
        } else {
            this.inputRef.setAttribute('list', 'commander-completion-disabled-' + this.id);
        }
    }

    remove_segment(name) {
        const newSegments = this.state.segments.filter(t => t !== name);
        if (newSegments.length === this.state.segments.length) {
            console.warn(`Commander.remove_segment ${name} not found`);
            return;
        }
        this.setState({
            segments: newSegments
        });
    }

    onClickUl(e) {
        if (e.target.tagName === 'UL') { //Focus new input when clicking in the whitespace of the Tagger instance
            this.inputRef.focus();
        }
    }

    fullText(inputValue = this.state.value) {
        let segments = this.state.segments.slice();
        let newSegment = inputValue;
        segments.push(newSegment);
        return segments.join(' ');
    }

    onInput(e) {
        // console.debug('Commander.onInput');
        const value = e.target.value;
        this.parseCommand(value);
    }

    onKeyDownInput(e) {
        // console.debug('Commander.onKeyDownInput', e);
        const segments = this.state.segments;
        const value = this.state.value;

        if (e.key === 'Backspace' && !value) {
            if (segments.length > 0) {
                this.remove_segment(segments[segments.length - 1]);
                e.preventDefault();
            }
        } else if (e.keyCode === 9) { // tab
            // e.preventDefault();
        }
    }

    render(_, { value, segments, completions, prompt }) {
        return html`
            <div class=commander>
                <div class="command-bar__feedback" ref=${e => this.feedbackDiv = e}></div>
                <ul ref=${e => this.ulRef = e} onclick=${e => this.onClickUl(e)}>
                    ${segments.map((s, i) => html`
                        <li key=${`${i}-${s}`}>
                            <span class=label>${s}</span>
                        </li>
                    `)}
                    <li class=commander-new>
                        <input ref=${e => this.inputRef = e}
                            onInput=${e => this.onInput(e)}
                            onKeyUp=${e => this.onKeyUp(e)}
                            onKeyDown=${e => this.onKeyDownInput(e)}
                            value=${value}
                            placeholder=${prompt}
                            list=commander-completion-1
                            autofocus />
                        <div class=commander-completion>
                            <datalist id=commander-completion-1>
                                ${completions.map((c, i) => html`
                                    <option key=${i} value=${c.value}>${c.text}</option>
                                `)}
                            </datalist>
                        </div>
                    </li>
                </ul>
            </div>
        `;
    }
}