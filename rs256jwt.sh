ssh-keygen -t rsa -b 2048 -m PEM -f private.key
# Don't add passphrase, just leave it empty
openssl rsa -in private.key -pubout -outform PEM -out public.key
rm private.key.pub
cat private.key
cat public.key