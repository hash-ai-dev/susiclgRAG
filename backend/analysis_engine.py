import google.generativeai as genai
import os
from typing import Dict, List

def analyze_performance(exam_text: str) -> Dict:
    """
    Analyzes exam performance from uploaded score sheets.
    Returns weak areas and strategic tips.
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-pro')
        
        prompt = f"""You are a Strategic Academic Tutor AI. Analyze the following exam performance data.

Exam Data:
{exam_text}

Your task:
1. Identify subjects/topics where the student underperformed (scored below 70%).
2. For each weak area, provide:
   - Specific reason for underperformance
   - Strategic study tips to improve
   - Recommended resources or techniques

Format your response as JSON:
{{
    "overall_performance": "summary",
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

        response = model.generate_content(prompt)
        return {"analysis": response.text, "raw_text": exam_text}
    except Exception as e:
        return {"error": str(e)}


def predict_questions(question_papers: List[str]) -> Dict:
    """
    Analyzes multiple question papers to find patterns and predict future questions.
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-pro')
        
        combined_papers = "\n\n---PAPER SEPARATOR---\n\n".join(question_papers)
        
        prompt = f"""You are an Expert Exam Pattern Analyst. Analyze these past question papers to predict likely questions for the next exam.

Past Question Papers:
{combined_papers}

Your task:
1. Identify recurring topics and question patterns.
2. Note the difficulty progression.
3. Predict 10-15 high-probability questions for the next exam.
4. For each predicted question, explain WHY it's likely to appear.

Format your response as JSON:
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

        response = model.generate_content(prompt)
        return {"predictions": response.text}
    except Exception as e:
        return {"error": str(e)}
