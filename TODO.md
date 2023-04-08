- hover text
- pan/zoom
- selected pane (item, relationship)
- highlight relationship (on graph) on mouseover (in list)
- highlight item (in list) on mouseover (on graph)
- highlight relationship (in list) on mouseover (on graph)
- default item (size, charge, color)
- default relationship (length, color)
- s (search) item/relationship/tag
- t (tag) item
- t (tag) relationship
- re-center (or change center)
- directional relationships (arrows)
- virtual relationships (no force) can be done with custom rel mods (forceFactor 0)
- props view of items (treeview)
- hosted example
- favicon

BUGS:
- can add duplicate relationship id

TECH_DEBT:
- peg preact/htm version (standalone)
- refactor app to more components
- make buffer value dynamic in Graph.componentDidMount.updateSvgLayoutAttributes
- Update Graph layout via https://preactjs.com/guide/v10/hooks#uselayouteffect
- move inline styles to stylesheet
- move per-node handlers in graph to parent element handlers using event.target (??)

NICE_TO_HAVE:
- import data
- export data
- node image library
- custom node shape
- custom node image
- default item (node) charge/size
- default relationship (link) force/length/style
- custom (stronger) forceX/Y
- custom (variable) forceLink

FUTURE
- NRT (data feed a la dynamic monitoring of traffic)
- how to render many (thousands, millions?) of items/rels -- aggregation?