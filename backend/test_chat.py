import requests
import json

def test_chat():
    url = "http://localhost:8000/chat"
    payload = {
        "message": "Hello, who are you?"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {response.headers}")
        try:
            print("Response JSON:", json.dumps(response.json(), indent=2))
        except:
            print("Response Text:", response.text)
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_chat()
