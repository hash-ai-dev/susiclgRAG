import requests
import json

try:
    response = requests.post(
        "http://localhost:8000/chat",
        json={"message": "Hello, can you help me?"}
    )
    print(f"Status Code: {response.status_code}")
    print("Response:")
    print(response.text)
except Exception as e:
    print(f"Request failed: {e}")
