from pydantic import BaseModel
from typing import List, Optional

class StudentBase(BaseModel):
    name: str
    roll_number: str
    department: str
    year: int

class MarkBase(BaseModel):
    subject: str
    score: int
    max_score: int

class PerformanceBase(BaseModel):
    activity: str
    rating: str
    comments: str

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int
    marks: List[MarkBase] = []
    performance: List[PerformanceBase] = []

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
