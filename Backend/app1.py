from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import requests
import time
from datetime import datetime
from dotenv import load_dotenv
from typing import List
import ast

load_dotenv()

API_KEY = 'mhO8FJchxbdENqiv4JLK8I3fjAtFAhF6Cba9k6HJCFmFyXDqjp1yq9kNqKnTx5kn'
GEMINI_API_KEY = 'AIzaSyDkfcr9DlCAUZCpqxYe0tUj5FzeJHlSF2U' 

app = FastAPI()

def upload_receipt(file: UploadFile):
    endpoint = "https://api.tabscanner.com/api/2/process"
    payload = {"documentType": "receipt"}
    headers = {'apikey': API_KEY}

    files = {'file': (file.filename, file.file, file.content_type)}
    response = requests.post(endpoint, files=files, data=payload, headers=headers)

    if response.status_code != 200:
        return None, response.text

    result = response.json()
    return result.get('token'), None

def get_result(token):
    endpoint = f"https://api.tabscanner.com/api/result/{token}"
    headers = {'apikey': API_KEY}

    while True:
        response = requests.get(endpoint, headers=headers)

        if response.status_code != 200:
            return None, response.text

        result_json = response.json()
        status_code = result_json.get("code")

        if status_code == 202:
            return result_json, None
        elif status_code == 301:
            time.sleep(2)
        else:
            return None, result_json



def get_category_from_gemini(item_name, vendor_name, allowed_categories_str):
    # If allowed_categories is a list containing a string, extract the string
    if isinstance(allowed_categories_str, list) and len(allowed_categories_str) == 1:
        allowed_categories_str = allowed_categories_str[0]

    # Convert allowed_categories from string to list using ast.literal_eval
    try:
        allowed_categories = ast.literal_eval(allowed_categories_str)
        if not isinstance(allowed_categories, list):
            raise ValueError("Allowed categories should be a list.")
    except Exception as e:
        print(f"Error converting allowed_categories: {e}")
        return "unknown"  # Default value if parsing fails

    print(f"Allowed categories: {allowed_categories}")  # Debugging statement

    # Call to Gemini API
    endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {
        'Content-Type': 'application/json',
    }
    payload = {
        "contents": [{
            "parts": [{
                "text": f"Classify the following product: '{item_name}' from '{vendor_name}' into one of these categories: {allowed_categories}. Only respond with the category."
            }]
        }]
    }
    params = {
        'key': GEMINI_API_KEY
    }

    response = requests.post(endpoint, json=payload, headers=headers, params=params)
    if response.status_code != 200:
        return None

    result = response.json()
    print("Gemini Response:", result)  # Debugging statement

    # Extract the category from the response
    category = ""
    if "candidates" in result:
        candidate = result["candidates"][0]["content"]["parts"][0]["text"].strip()
        category = candidate if candidate else ""

    # Normalize the category comparison (lowercase or remove whitespace)
    category = category.lower().strip()

    # Ensure the category is one of the allowed ones
    allowed_categories_lower = [cat.lower().strip() for cat in allowed_categories]
    
    if category in allowed_categories_lower:
        return category
    else:
        print(f"Category '{category}' not in allowed categories.")  # Debugging statement
        return "unknown"  # Default if Gemini response is not valid



def parse_receipt(result, allowed_categories):
    vendor = result.get("result", {}).get("establishment", "Unknown Vendor")
    uploaded_at = datetime.utcnow().isoformat() + "Z"  # ISO with 'Z' suffix

    items = []
    for item in result.get("result", {}).get("lineItems", []):
        name = item.get("descClean", "No description")
        price = item.get("lineTotal", 0)

        # Get category from Gemini API
        category = get_category_from_gemini(name, vendor, allowed_categories)
        
        print(f"Assigning category '{category}' to item: {name}")  

        items.append({
            "name": name,
            "price": price,
            "vendor": vendor,
            "category": category,
            "uploadedAt": uploaded_at
        })

    parsed = {
        "items": items,
        "tax": 0.0,
        "total": 0.0
    }

    for summary in result.get("result", {}).get("summaryItems", []):
        desc = summary.get("descClean", "")
        price = summary.get("lineTotal", 0)
        if "TAX" in desc.upper():
            parsed["tax"] = price
        elif desc.upper() == "TOTAL":
            parsed["total"] = price

    return parsed

@app.post("/scan-receipt/")
async def scan_receipt(file: UploadFile = File(...), categories: List[str] = []):
    if not categories:
        return JSONResponse(status_code=400, content={"error": "Categories are required"})

    token, err = upload_receipt(file)
    if err:
        return JSONResponse(status_code=500, content={"error": "Upload failed", "details": err})

    result, err = get_result(token)
    if err:
        return JSONResponse(status_code=500, content={"error": "Processing failed", "details": err})

    parsed_data = parse_receipt(result, categories)
    return parsed_data
