- Clear diagram button
- Diagram title
- Choose title/filename on save
- Choose filename to load
- default relationship length
- directional relationships (arrows)
- Command autocomplete (hint commands, nodes, relationships, tags)
- Change "alpha" settings (decay, etc)
- "Shuffle" button
- Selection panel (item)
  - charge
  - relationshps
  - treeview
- Selection panel (rlationship)
  - length
  - arrows
- Regions (forceX/Y node (or label?) to region)
- hosted example
- font size
- fix viewArea (or just min?)
  - set min viewArea from/to current?
- s (search) item/relationship/tag
- t (tag) relationship
- favicon
- control to toggle graph node labels
- default item (charge, color)
- default relationship (length, color)
- virtual relationships (no force) can be done with custom rel mods (forceFactor 0)

BUGS:

TECH_DEBT:
- peg preact/htm version (standalone)
- make buffer value dynamic in Graph.componentDidMount.updateSvgLayoutAttributes

NICE_TO_HAVE:
- node image library
- custom node shape
- custom node image
- default item (node) charge/size
- default relationship (link) force/length/style
- custom (stronger) forceX/Y
- custom (variable) forceLink
- pan/zoom
- highlight item (in list) on mouseover (on graph)
- highlight relationship (in list) on mouseover (on graph)
- highlight relationship (on graph) on mouseover (in list)

FUTURE
- NRT (data feed a la dynamic monitoring of traffic)
- how to render many (thousands, millions?) of items/rels -- aggregation?