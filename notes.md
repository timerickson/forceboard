Find and kill used port
https://stackoverflow.com/questions/4421633/who-is-listening-on-a-given-tcp-port-on-mac-os-x
`sudo lsof -i -P | grep LISTEN | grep :$PORT`

Get vertical layout spacing to work
https://codepen.io/micjamking/pen/QdojLz

https://stackoverflow.com/questions/16568313/arrows-on-links-in-d3js-force-layout
function getPointOnLine(a, b, distance) {
    const totalDistance = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    const percent = distance / totalDistance;
    const x = a.x + (b.x - a.x) * percent;
    const y = a.y + (b.y - a.y) * percent;
    return { x, y };
}

Enter
Leave
Click

Selected
Deselected

Pinned
Unpinned

SelectionCoordinator
