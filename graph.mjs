import { html, Component, render } from './standalone.module.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export class Graph extends Component {
    constructor(props) {
        console.log('Graph', arguments)
        super(props);

        this.state = {
            height: props.size.height,
            width: props.size.height,
            data: props.data
        };

        this.svg = this.initSimulation(this.state);
    }

    shouldComponentUpdate(newProps = {}, oldProps = {}) {
        const changed = (oldProps.data.stateId != newProps.data.stateId);
        // console.log('shouldComponentUpdate changed', changed, arguments);
        if (!changed) {
            return false;
        }
        console.log('shouldComponentUpdate changed', changed, arguments);

        this.setState({
            data: newProps.data,
            height: newProps.size.height,
            width: newProps.size.width
        }, () => this.updateGraph());

        // do not re-render via diff:
        return false;
    }

    componentDidMount() {
        // now mounted, can freely modify the DOM:
        // console.log('componentDidMount', arguments);
        this.base.appendChild(this.svg);
        this.updateGraph();
    }

    initSimulation(state) {
        var width = state.width;
        var height = state.height;
        var invalidation = new Promise((res, rej)=>{});
        // var nodeTitle = undefined;

        // const nodeId = (d) => d.id;
        // const N = d3.map(nodes)
        // if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
        // const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);

        var color = d3.scaleOrdinal(d3.schemeTableau10);

        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height]);

        const simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("link", d3.forceLink().id(d => d.id).distance(200))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .on("tick", ticked);

        let link = svg.append("g")
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5)
            .selectAll("line");

        let node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle");

        function ticked() {
            node.attr("cx", d => d.x)
                .attr("cy", d => d.y)

            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        }

        // Terminate the force layout when this cell re-runs.
        invalidation.then(() => simulation.stop());

        return Object.assign(svg.node(), {
            update({nodes, links}) {
                console.log('svg.update', arguments);

                // Make a shallow copy to protect against mutation, while
                // recycling old nodes to preserve position and velocity.
                const old = new Map(node.data().map(d => [d.id, d]));
                nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
                links = links.map(d => Object.assign({}, d));

                simulation.nodes(nodes);
                simulation.force("link").links(links);
                simulation.alpha(1).restart();

                node = node
                    .data(nodes, d => d.id)
                    .join(enter => enter.append("circle")
                    .attr("r", 8)
                    .attr("fill", d => color(d.id)));

                // if (true) node.append("title").text(({index: i}) => T[i]);

                link = link
                    .data(links, d => `${d.source.id}\t${d.target.id}`)
                    .join("line");
            }
        });
    }

    render(props, state) {
        console.log('render', props, state);
        return html`
            <div id="d3target" width=${state.width} height=${state.height}></div>
        `;
    }

    updateGraph() {
        console.log('updateGraph', this.state);
        var node = (i) => ({ id: i.id });
        var link = (r) => ({ source: r.a, target: r.b });
        var nodes = this.state.data.items.map(node);
        var links = this.state.data.relationships.map(link);
        this.svg.update({
            "nodes": nodes,
            "links": links
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('componentDidUpdate', prevProps, prevState, snapshot);
        this.updateGraph();
    }
}