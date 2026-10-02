import os
import sys
import mimetypes

# Auto-install boto3 if not installed
try:
    import boto3
except ImportError:
    print("boto3 library not found. Installing it now...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "boto3"])
    import boto3

# ==========================================
# 🛑 CONFIGURATION PLACEHOLDERS
# ==========================================
# Generate these in Cloudflare Dashboard -> R2 -> "Manage R2 API Tokens"
# Make sure the token has "Edit" permissions for your bucket.
# ==========================================
CLOUDFLARE_ACCOUNT_ID = "YOUR_ACCOUNT_ID"
R2_ACCESS_KEY_ID = "YOUR_ACCESS_KEY_ID"
R2_SECRET_ACCESS_KEY = "YOUR_SECRET_ACCESS_KEY"
BUCKET_NAME = "YOUR_BUCKET_NAME"
# ==========================================

# Only upload web-compatible image and video media
ALLOWED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp",
    ".mp4", ".mov", ".webm", ".avi", ".svg"
}

def get_r2_client():
    if "YOUR_" in CLOUDFLARE_ACCOUNT_ID or "YOUR_" in R2_ACCESS_KEY_ID:
        print("\n❌ Error: Please configure your Cloudflare R2 credentials inside this script first!")
        sys.exit(1)
        
    endpoint_url = f"https://{CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY
    )

def upload_folder(local_folder):
    r2 = get_r2_client()
    
    # Resolve directory paths
    base_dir = local_folder.rstrip("/\\")
    
    print(f"\n[SCAN] Scanning folders for image & video files in '{local_folder}'...")
    
    files_to_upload = []
    for root, _, files in os.walk(local_folder):
        if "uncompressed" in root.lower():
            continue
            
        for file in files:
            _, ext = os.path.splitext(file.lower())
            if ext in ALLOWED_EXTENSIONS:
                full_path = os.path.join(root, file)
                relative_path = os.path.relpath(full_path, base_dir).replace("\\", "/")
                files_to_upload.append((full_path, relative_path))
            
    total_files = len(files_to_upload)
    print(f"[INFO] Found {total_files} web-ready media files to upload.")
    
    if total_files == 0:
        print("[WARNING] No media files found to upload.")
        return
        
    print("\n[START] Starting upload of website media to Cloudflare R2...")
    success_count = 0
    
    for i, (local_path, r2_key) in enumerate(files_to_upload, 1):
        mime_type, _ = mimetypes.guess_type(local_path)
        if not mime_type:
            mime_type = "application/octet-stream"
            
        print(f"[{i}/{total_files}] Uploading: {r2_key} ({mime_type})... ", end="", flush=True)
        try:
            r2.upload_file(
                local_path,
                BUCKET_NAME,
                r2_key,
                ExtraArgs={"ContentType": mime_type}
            )
            print("SUCCESS")
            success_count += 1
        except Exception as e:
            print(f"FAILED (Error: {e})")
            
    print(f"\n[COMPLETE] Successfully uploaded {success_count}/{total_files} media files to R2 bucket '{BUCKET_NAME}'!\n")

if __name__ == "__main__":
    local_website_path = r"C:\Users\wvern\Documents\website"
    
    if not os.path.exists(local_website_path):
        print(f"[ERROR] Folder '{local_website_path}' does not exist.")
        sys.exit(1)
        
    upload_folder(local_website_path)
