import urllib.request, json
req = urllib.request.Request('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBJzsfslZ0xWADGNlRkJwBZA5yxTJNQiH8', data=b'{"returnSecureToken":true}', headers={'Content-Type': 'application/json'})
try:
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"Error {e.code}: {e.read().decode('utf-8')}")
