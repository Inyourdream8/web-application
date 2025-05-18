import os
from googleapiclient.discovery import build
from google.oauth2 import service_account
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/drive"]
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), "..", "my-lw-project.json")

try:
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    drive_service = build("drive", "v3", credentials=creds)
    
    results = drive_service.files().list().execute()
    files = results.get("files", [])
    
    print("✅ Google Drive API Connected Successfully!")
    for file in files:
        print(f"- {file['name']} (ID: {file['id']})")
except FileNotFoundError:
    print(f"❌ Service account file not found at: {SERVICE_ACCOUNT_FILE}")
except HttpError as e:
    print("❌ Google Drive API Error:", e)
except Exception as e:
    print("❌ Unexpected Error:", e)