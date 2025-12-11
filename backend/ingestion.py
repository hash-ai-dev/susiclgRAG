import os
import fitz  # PyMuPDF
import easyocr
import io
import numpy as np
from PIL import Image

# Initialize EasyOCR reader (loads model into memory, might take a moment first time)
# 'en' for English. Add more languages if needed.
reader = easyocr.Reader(['en'], gpu=False, verbose=False) # Set gpu=True if CUDA is available


def process_file(file_path: str, mime_type: str) -> str:
    """
    Extracts text from a file using local libraries (PyMuPDF, EasyOCR).
    """
    print(f"[INFO] Processing file: {file_path} (type: {mime_type})")
    
    try:
        if mime_type.startswith("text/"):
            print("[INFO] Processing as text file...")
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                print(f"[OK] Extracted {len(content)} characters")
                return content
        
        elif mime_type == "application/pdf":
            print("[INFO] Processing PDF with PyMuPDF...")
            text_content = ""
            doc = fitz.open(file_path)
            
            for page_num, page in enumerate(doc):
                # Try direct text extraction first
                page_text = page.get_text()
                
                if len(page_text.strip()) > 10:
                    text_content += page_text + "\n"
                else:
                    # Fallback to OCR for this page (scanned page)
                    print(f"[INFO] Page {page_num + 1} seems to be an image. Applying OCR...")
                    pix = page.get_pixmap()
                    img_data = pix.tobytes("png")
                    result = reader.readtext(img_data, detail=0)
                    text_content += " ".join(result) + "\n"
            
            print(f"[OK] Extracted {len(text_content)} characters from PDF")
            print(f"[DEBUG] Content Sample: {text_content[:200]}...")
            return text_content

            
        elif mime_type.startswith("image/"):
            print("[INFO] Processing image with EasyOCR...")
            result = reader.readtext(file_path, detail=0)
            text_content = " ".join(result)
            print(f"[OK] Extracted {len(text_content)} characters from image")
            return text_content
            
        else:
            print(f"[WARN] Unsupported file type: {mime_type}")
            return ""

    except Exception as e:
        print(f"[ERROR] Error processing file {file_path}: {e}")
        import traceback
        traceback.print_exc()
        return ""

