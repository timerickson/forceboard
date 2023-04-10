import { html, render, Component } from 'preact';
import { Graph } from 'graph';
import { Data } from 'data';
import { ControlPanel } from 'controlPanel';
import { CommandBar } from 'commandBar';
import { DataChanged } from 'events';

class App extends Component {
    constructor(props) {
        super(props);

        this.data = new Data(() => DataChanged.fire());
    }

    render() {
        // console.log('App.render', arguments);
        const data = this.data;
        return html`
            <div style="display: flex; flex-direction: column; flex: 1; overflow: auto;">
                <div style="height: 30px;">
                    <h1>Diagram</h1>
                </div>
                <${Graph} data=${data} style="flex: 1;"><//>
                <div style="max-height: 20vh; display: flex; flex-direction: column; overflow: auto;">
                    <${CommandBar} data=${data} />
                    <${ControlPanel} data=${data} />
                </div>
            </div>
        `;
    }
}

render(html`<${App}/>`, document.body.getElementsByTagName('main')[0]);