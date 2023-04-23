# https://pankajmalhotra.com/Simple-HTTPS-Server-In-Python-Using-Self-Signed-Certs
openssl genrsa -des3 -out server.key 1024
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 4096 -in server.csr -signkey server.key -out server.crt
cat server.crt server.key > server.pem
