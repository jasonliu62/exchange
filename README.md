# Exchange Rate Viewer

This project allows you to view historical exchange rates for USD to RMB.

## How to Run

### 1. Install Dependencies

First, install the required Python packages:

```bash
pip install -r requirements.txt
```

### 2. Run the Backend Server

Navigate to the project root and run the Flask application:

```bash
python backend/app.py
```

The backend server will start on `http://127.0.0.1:5000`.

### 3. Open the Frontend

Open the `frontend/index.html` file in your web browser. You can usually do this by double-clicking the file.

### 4. Use the Application

- Select a start date.
- Choose between "Daily Rate" and "Monthly Rate".
- Click "Get Rate" to see the results.