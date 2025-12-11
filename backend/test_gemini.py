import os
import google.generativeai as genai
from dotenv import load_dotenv
import traceback

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key found: {bool(api_key)}")
print(f"API Key (first 10 chars): {api_key[:10] if api_key else 'None'}...")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    print("\nTesting Gemini API...")
    response = model.generate_content("Say hello!")
    print(f"Response: {response.text}")
    print("\nGemini API is working!")
    
except Exception as e:
    print(f"\nError: {e}")
    traceback.print_exc()
