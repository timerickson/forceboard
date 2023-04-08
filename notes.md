Find and kill used port
https://stackoverflow.com/questions/4421633/who-is-listening-on-a-given-tcp-port-on-mac-os-x
`sudo lsof -i -P | grep LISTEN | grep :$PORT`

Get vertical layout spacing to work
https://codepen.io/micjamking/pen/QdojLz