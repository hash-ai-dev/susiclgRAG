import requests
import json
import os
from typing import Dict, List

# Configuration for Local LLM
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/api/generate")
LOCAL_MODEL_NAME = os.getenv("LOCAL_MODEL_NAME", "llama3.2") 

def query_local_llm(prompt: str) -> str:
    """Helper to query Ollama"""
    try:
        payload = {
            "model": LOCAL_MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "format": "json" # Force JSON mode for analysis
        }
        response = requests.post(OLLAMA_BASE_URL, json=payload)
        response.raise_for_status()
        return response.json()['response']
    except Exception as e:
        print(f"Ollama Error: {e}")
        return ""

def analyze_performance(exam_text: str) -> Dict:
    """
    Analyzes exam performance from uploaded score sheets.
    Returns weak areas and strategic tips.
    """
    try:
        prompt = f"""You are a Strategic Academic Tutor AI. Analyze the following exam performance data.

Exam Data:
{exam_text[:10000]}  # Truncate to avoid context window issues

Your task:
1. Identify subjects/topics where the student underperformed (scored below 70%).
2. For each weak area, provide:
   - Specific reason for underperformance
   - Strategic study tips to improve
   - Recommended resources or techniques

Format your response as a valid JSON object with this structure:
{{
    "overall_performance": "summary string",
    "weak_areas": [
        {{
            "subject": "subject name",
            "score": "score",
            "reason": "analysis",
            "tips": ["tip1", "tip2", "tip3"]
        }}
    ],
    "strengths": ["strong subject 1", "strong subject 2"]
}}

Be precise and avoid generic advice. Base everything on the actual data provided."""

        response_text = query_local_llm(prompt)
        return {"analysis": response_text, "raw_text": exam_text[:500] + "..."}
    except Exception as e:
        return {"error": str(e)}


def predict_questions(question_papers: List[str]) -> Dict:
    """
    Analyzes multiple question papers to find patterns and predict future questions.
    """
    try:
        combined_papers = "\n\n---PAPER SEPARATOR---\n\n".join(question_papers)[:15000] # Truncate
        
        prompt = f"""You are an Expert Exam Pattern Analyst. Analyze these past question papers to predict likely questions for the next exam.

Past Question Papers:
{combined_papers}

Your task:
1. Identify recurring topics and question patterns.
2. Note the difficulty progression.
3. Predict 10-15 high-probability questions for the next exam.
4. For each predicted question, explain WHY it's likely to appear.

Format your response as a valid JSON object:
{{
    "patterns_identified": ["pattern1", "pattern2"],
    "predicted_questions": [
        {{
            "question": "predicted question text",
            "topic": "topic name",
            "difficulty": "easy/medium/hard",
            "reasoning": "why this question is likely"
        }}
    ],
    "study_priorities": ["priority topic 1", "priority topic 2"]
}}

Base predictions ONLY on observable patterns in the provided papers. Do not hallucinate."""

        response_text = query_local_llm(prompt)
        return {"predictions": response_text}
    except Exception as e:
        return {"error": str(e)}
