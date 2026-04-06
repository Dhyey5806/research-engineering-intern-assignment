# Use official Python image
FROM python:3.10-slim

# Set the primary working directory
WORKDIR /app

# Copy the requirements file from your backend folder
COPY backend/requirements.txt .

# Install all dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your folders (both backend/ and data/) into the container
COPY . .

# Move into the backend folder so Uvicorn can find main.py
# This also ensures '../data/...' paths in your Python code work perfectly!
WORKDIR /app/backend

# Hugging Face Spaces exposes port 7860 by default
EXPOSE 7860

# Start the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]