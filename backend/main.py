from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
import psycopg2
import requests
import datetime
import os
import json
from apscheduler.schedulers.background import BackgroundScheduler

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    prompt: str

# Database connection
conn = psycopg2.connect(
    host="localhost",
    database="CompanyJobs",
    user="postgres",
    password="vish2005"
)
cursor = conn.cursor()

# Task delegation logic
def perform_task_delegation():
    try:
        cursor.execute("SELECT * FROM job_skills")
        job_data = cursor.fetchall()
        job_columns = [desc[0] for desc in cursor.description]

        cursor.execute("SELECT * FROM employee_skills")
        employee_data = cursor.fetchall()
        emp_columns = [desc[0] for desc in cursor.description]

        jobs = [dict(zip(job_columns, row)) for row in job_data]
        employees = [dict(zip(emp_columns, row)) for row in employee_data]

        jobs.sort(key=lambda x: x.get("priority", 3))

        delegated_tasks = []

        for job in jobs:
            if job.get("priority", 3) != 2:
                continue

            best_match = None
            best_score = -1

            for emp in employees:
                if emp.get("status", "Available") == "Absent":
                    continue

                match_score = 0
                for skill in job_columns:
                    if skill in ["job_id", "job_name", "priority"]:
                        continue
                    if skill in emp_columns and emp.get(skill, 0) >= job.get(skill, 0):
                        match_score += 1

                if match_score > best_score:
                    best_score = match_score
                    best_match = emp

            if best_match:
                delegated_tasks.append({
                    "employee_name": best_match["name"],
                    "job_name": job["job_name"]
                })

        today = datetime.date.today()
        table_name = f"delegated_tasks_{today.strftime('%Y_%m_%d')}"

        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                name TEXT,
                delegated_job TEXT
            )
        """)
        for task in delegated_tasks:
            cursor.execute(f"""
                INSERT INTO {table_name} (name, delegated_job)
                VALUES (%s, %s)
            """, (task["employee_name"], task["job_name"]))

        conn.commit()

        # Save JSON history
        history_folder = "delegation_history"
        os.makedirs(history_folder, exist_ok=True)
        history_path = os.path.join(history_folder, f"delegation_{today.isoformat()}.json")
        with open(history_path, "w") as f:
            json.dump({"date": today.isoformat(), "tasks": delegated_tasks}, f, indent=4)

        # Keep only latest 15
        files = sorted(os.listdir(history_folder))
        if len(files) > 15:
            for file in files[:-15]:
                os.remove(os.path.join(history_folder, file))

    except Exception as e:
        print(f"Delegation error: {e}")

# Schedule daily delegation
scheduler = BackgroundScheduler()
scheduler.add_job(perform_task_delegation, 'cron', hour=6, minute=0)
scheduler.start()

@app.post("/query")
def query_ollama(request: QueryRequest):
    if "delegate now" in request.prompt.lower():
        perform_task_delegation()
        return {"message": "Task delegation executed manually."}

    # Fetch schema
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    tables = cursor.fetchall()

    schema_info = ""
    for (table,) in tables:
        cursor.execute(f"""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = '{table}'
        """)
        columns = cursor.fetchall()
        schema_info += f"Table: {table}\n"
        for col, dtype in columns:
            schema_info += f"  - {col} ({dtype})\n"
        schema_info += "\n"

    # LLM prompt
    prompt = f"""
You are an intelligent SQL assistant. Understand the user's intent and generate the correct SQL query accordingly.
Automatically fix any spelling mistakes unless the text is wrapped in [[double brackets]]—in that case, do NOT modify the text.
Respond only with the final SQL query.
Current Tables Available Are delegated_tasks , employee_skills , job _skills , understand user intent and select suitable one
"Show" and "View" are the same as a SELECT query.

# Current Database Schema: 
{schema_info}

Table Aliases:
- When the user refers to the "employee" or "employees" table, use the employee_skills table.
- When the user refers to the "job" or "jobs" table, use the jobs_skills table.

## Query Behavior Guidelines:

### Table Sorting 
If the user asks to sort or reorder a table permanently:
CREATE TABLE original_temp AS SELECT * FROM original ORDER BY column;
DROP TABLE original;
ALTER TABLE original_temp RENAME TO original;

### Table Deletion
If the user says "delete table", drop the entire table:
DROP TABLE table_name;

### Inserting or Updating Data
When inserting or updating values:
- Generate realistic sample values based on column names and data types.
- Do NOT use functions like RAND() or RANDOM().
- Use examples like:
  • Names → 'John Doe'
  • Status → 'Active', 'On Leave'
  • Dates → '2024-01-01'
  • Numbers → Small positive integers
- Do NOT add random dates or values unless explicitly mentioned.

### Modifying Existing Rows
If the user wants to modify existing data:
UPDATE table_name SET column = value WHERE condition;

### Adding a Column
If the user says "add column":
ALTER TABLE table_name ADD COLUMN column_name datatype;
UPDATE table_name SET column_name = value;

Example : update table employee skills PPT,Video , Level 5,5 where id is 2
Answer : UPDATE employee_skills SET level = '5,5' AND skills = 'PPT,Video' WHERE id = '2';

### Deleting Columns
If the user says "delete column(s)":
ALTER TABLE table_name DROP COLUMN column1, DROP COLUMN column2;

### Deleting Rows with NULL
If the user says "delete rows where column is null":
DELETE FROM table_name WHERE column IS NULL;

### Removing a Value from a Column 
If the user says "clear", "remove", or "delete" a value from a column:
UPDATE table_name SET column = NULL WHERE condition;

### Adding a New Record
If the user says "add a new row", "insert a record":
INSERT INTO table_name (column1, column2) VALUES (value1, value2);

Now process this: {request.prompt}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3.2", "prompt": prompt, "stream": False}
        )
        result = response.json()
    except Exception as e:
        return {"error": f"Ollama call failed: {str(e)}"}

    ai_response = result.get('response', '').strip()

    # SELECT
    if ai_response.upper().startswith("SELECT"):
        try:
            cursor.execute(ai_response)
            rows = cursor.fetchall()
            column_names = [desc[0] for desc in cursor.description]
            return {"query": ai_response, "columns": column_names, "result": rows}
        except Exception as e:
            return {"error": str(e), "query": ai_response}

    # UPDATE
    if ai_response.upper().startswith("UPDATE"):
        try:
            table = ai_response.split(" ")[1]
            where_clause = ai_response.split("WHERE")[-1] if "WHERE" in ai_response else ""
            before_query = f"SELECT * FROM {table} WHERE {where_clause}" if where_clause else f"SELECT * FROM {table}"
            cursor.execute(before_query)
            before = cursor.fetchall()
            before_columns = [desc[0] for desc in cursor.description]
            cursor.execute(ai_response)
            conn.commit()
            cursor.execute(before_query)
            after = cursor.fetchall()
            return {"query": ai_response, "before": before, "after": after, "columns": before_columns}
        except Exception as e:
            return {"error": str(e), "query": ai_response}

    # DELETE
    if ai_response.upper().startswith("DELETE"):
        try:
            table = ai_response.split("FROM")[1].split("WHERE")[0].strip()
            where_clause = ai_response.split("WHERE")[-1] if "WHERE" in ai_response else ""
            before_query = f"SELECT * FROM {table} WHERE {where_clause}" if where_clause else f"SELECT * FROM {table}"
            cursor.execute(before_query)
            deleted = cursor.fetchall()
            deleted_columns = [desc[0] for desc in cursor.description]
            cursor.execute(ai_response)
            conn.commit()
            return {"query": ai_response, "deleted": deleted, "columns": deleted_columns}
        except Exception as e:
            return {"error": str(e), "query": ai_response}

    # INSERT
    if ai_response.upper().startswith("INSERT"):
        try:
            cursor.execute(ai_response)
            conn.commit()
            return {"query": ai_response, "message": "Row inserted successfully."}
        except Exception as e:
            return {"error": str(e), "query": ai_response}

    # Other queries
    try:
        statements = ai_response.split(";")
        for stmt in statements: 
            stmt = stmt.strip()
            if stmt:
                cursor.execute(stmt)
        conn.commit()
        return {"query": ai_response, "message": "Query executed successfully."}
    except Exception as e:
        return {"error": str(e), "query": ai_response}
