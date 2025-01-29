import requests
from flask import Flask, request, jsonify
import sys
import json

app = Flask(__name__)


def sign_in(auth_code, state, client_id, client_secret):
    url = "https://iitdoauth.vercel.app/api/auth/resource"

    # Set the POST data (OAuth credentials and request body)
    post_data = {
        'auth_code': auth_code,
        'state': state,
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'authorization_code'
    }

    # Log the post data to check it's correctly populated
    # This will appear in pm2 logs
    print(f"Post data: {json.dumps(post_data)}")

    headers = {
        'Content-Type': 'application/json',
        # Replace with your actual user agent if needed
        'User-Agent': 'python-requests/2.25.1',
    }

    try:
        # Send the POST request
        print(f"Sending request to {url}...")  # Log the request being sent
        response = requests.post(url, json=post_data, headers=headers)

        # Check if the request was successful
        if response.status_code == 200:
            response_data = response.json()
            print("Response received:", json.dumps(
                response_data))  # Log the response
            return response_data.get('user', None)
        else:
            # Log error message if the status code is not 200
            print(f"Error: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        # Log the exception if there was a problem with the request
        print(f"Error during request: {e}")
    return None


@app.route('/oauth/signin', methods=['POST'])
def oauth_signin():
    # Get parameters from the request
    auth_code = request.json.get('auth_code')
    state = request.json.get('state')
    client_id = request.json.get('client_id')
    client_secret = request.json.get('client_secret')

    # Validate input
    if not all([auth_code, state, client_id, client_secret]):
        return jsonify({"error": "Missing required parameters"}), 400

    # Attempt sign-in
    user = sign_in(auth_code, state, client_id, client_secret)

    if user:
        return jsonify(user), 200
    else:
        return jsonify({"error": "Authentication failed"}), 401


def main(port=5000):
    app.run(host='0.0.0.0', port=port)


if __name__ == "__main__":
    # Default to port 5005 if no port specified
    port = 5005
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number. Using default 5005.")

    main(port)
```