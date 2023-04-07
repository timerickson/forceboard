import { html, Component, render } from 'preact';
import * as d3 from "d3";

/*
Large portions of the D3 elements here were taken from
https://observablehq.com/@d3/modifying-a-force-directed-graph

ISC License
Copyright 2020 Observable, Inc.
Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

export class Graph extends Component {
    // https://github.com/preactjs/preact/wiki/External-DOM-Mutations
    state = {
        dataStateId: -1
    }

    constructor(props) {
        super(props);
        // console.log('Graph', arguments)

        this.svg = this.initSimulation();
    }

    shouldComponentUpdate(newProps = {}, _) {
        let oldStateId = this.state.dataStateId;
        let newStateId = newProps.data.stateId;
        const changed = (oldStateId != newStateId);

        // console.log('shouldComponentUpdate changed', changed, newStateId, oldStateId, arguments);
        if (changed) {
            this.setState({
                dataStateId: newStateId
            }, () => this.updateGraph());
        }

        // https://github.com/preactjs/preact/wiki/External-DOM-Mutations
        // do not re-render via diff:
        return false;
    }

    componentDidMount() {
        // now mounted, can freely modify the DOM:
        // console.log('componentDidMount', arguments);
        this.base.appendChild(this.svg);
        const svg = this.svg
        const svgParent = this.base;
        const updateSvgLayoutAttributes = () => {
            const { width, height } = svgParent.getBoundingClientRect();
            // console.log('updateSvgLayoutAttributes', width, height, window.innerWidth, window.innerHeight);
            // TODO: This should be 2 * (border-width)
            const buffer = 4;
            // console.log('Graph.updateSvgLayoutAttributes', width, height, buffer, this.base.getBoundingClientRect());
            svg.setAttribute('width', `${width-buffer}`);
            svg.setAttribute('height', `${height-buffer}`);
            svg.setAttribute('viewBox', `-${width/2 - buffer},-${height/2 - buffer},${width - buffer},${height - buffer}`);
            // this.updateGraph();
        }
        updateSvgLayoutAttributes();
        window.addEventListener('resize', (e) => {
            // console.log('resize', e, this.base);
            updateSvgLayoutAttributes();
        });
        this.updateGraph();
    }

    initSimulation() {
        let props = this.props;
        let width = props.size.width;
        let height = props.size.height;
        let invalidation = new Promise((res, rej)=>{});
        // let nodeTitle = undefined;

        // const nodeId = (d) => d.id;
        // const N = d3.map(nodes)
        // if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
        // const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);

        let color = d3.scaleOrdinal(d3.schemeTableau10);

        const svg = d3.create("svg")
            // .attr("style", "height: 100%; width: 100%;")
            // .attr("height", height)
            // .attr("viewBox", [-width / 2, -height / 2, width, height])
            ;

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

        invalidation.then(() => simulation.stop());

        return Object.assign(svg.node(), {
            update({nodes, links}) {
                // console.log('svg.update', arguments);

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
        // console.debug('render', props, state);
        return html`
            <div id="d3target" style="flex: 1; line-height: 0;"></div>
        `;
    }

    updateGraph() {
        // console.debug('Graph.updateGraph'/*, this.props*/);
        let data = this.props.data;
        this.svg.update({
            "nodes": data.items.map((i) => ({ id: i.id })),
            "links": data.relationships.map((r) => ({ source: r.a.id, target: r.b.id }))
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.debug('componentDidUpdate', prevProps, this.props, prevState, snapshot);
        this.updateGraph();
    }
}