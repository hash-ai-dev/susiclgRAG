import requests
import json

# Test the chat endpoint
url = "http://localhost:8000/chat"
payload = {"message": "hello"}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
