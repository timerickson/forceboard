import { html, render, Component } from 'preact';
import { Graph } from 'graph';
import { Data } from 'data';
import { ControlPanel } from 'controlPanel';
import { CommandBar } from 'commandBar';
import { HelpOverlay } from 'helpOverlay';
import { Click, windowData, DataChanged } from 'events';
import { SelectionCoordinator } from 'selectionCoordinator';

class App extends Component {
    constructor(props) {
        super(props);

        this.data = new Data(() => DataChanged.fire());
        this.selectionCoordinator = new SelectionCoordinator();
    }

    componentDidMount() {
        const helpOverlayContainer = document.getElementById('help-overlay');
        if (!helpOverlayContainer) {
            return console.warn('Failed to find help overlay container');
        }

        let helpOverlay;
        render(html`<${HelpOverlay} ref=${helpOverlay} />`, helpOverlayContainer);
        this.setState({helpOverlay: helpOverlay});
    }

    render({helpOverlay}) {
        // console.log('App.render', arguments);
        const data = this.data;
        return html`
            <div class=app>
                <${Graph} data=${data}><//>
                <div class=bottom-pane>
                    <${CommandBar} data=${data} helpOverlay=${helpOverlay} />
                    <${ControlPanel} data=${data} />
                </div>
            </div>
        `;
    }
}

render(html`<${App}/>`, document.body.getElementsByTagName('main')[0]);
window.addEventListener('click', () => {Click.fire(windowData())});