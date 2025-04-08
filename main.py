from fastapi import FastAPI, Request
from pydantic import BaseModel
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
import psycopg2
import os

app = FastAPI()

# Database connection
conn = psycopg2.connect(
    dbname="CompanyJobs",
    user="postgres",
    password="vish2005",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# Delegation Prompt
SQL_PROMPT = """
You are an intelligent SQL assistant. Understand the user's intent and generate the correct SQL query accordingly.
Automatically fix any spelling mistakes unless the text is wrapped in [[double brackets]]—in that case, do NOT modify the text.
Respond only with the final SQL query.
employees table is the employees_skills table
jobs table is the jobs_skills table
Always Use The CompanyJobs Database Please Dont Use Postgre
# Current Database Schema:
{schema_info}

If the user asks to sort or reorder a table permanently, do this:
CREATE TABLE original_temp AS SELECT * FROM original ORDER BY column;
DROP TABLE original;
ALTER TABLE original_temp RENAME TO original;

When inserting or updating values:
- Generate realistic sample values based on column names and data types.
- Do NOT use SQL functions like RAND(), RANDOM(), or similar.
- Use examples like:
  • Names → 'John Doe'
  • Status → 'Active', 'On Leave'
  • Dates → '2024-01-01'
  • Numbers → small positive integers

When modifying existing rows in a table:
- If the user says "change", "modify", or "add value to existing record", use an UPDATE statement.
- Example: "Add role for ID 5 as Manager" → UPDATE employees SET role = 'Manager' WHERE id = 5;
Do Not Enter Random Values Untill Specified By Me
-Example:Do Not Add Random Dates For leave_Date as its very sensitive without any input for it.

When the user says "delete column(s)", interpret it as:
- Removing the column(s) from the table using ALTER TABLE.
- Example: "Delete column1 and column2 from employees" → ALTER TABLE employees DROP COLUMN column1, DROP COLUMN column2;

Do NOT confuse deleting columns with deleting rows where the columns are null.

If the user says "delete rows where column1 is null", then use:
DELETE FROM table WHERE column1 IS NULL;

When the user asks to add a column:
- Use ALTER TABLE to add the column.
- Then, use UPDATE to populate it with values.
- Do not use SELECT ... AS column_name unless the user only wants a temporary display.

If the user says "add a new employee", "insert a record", "add a row", or similar:
- Use INSERT INTO with appropriate values.
- Example: "Add an employee with ID 10 named John" →
  INSERT INTO employees (id, name) VALUES (10, 'John');

When the user says "delete column(s)", interpret it as:
- Removing the column(s) from the table using ALTER TABLE.

When the user says "remove value from a column", "delete value", or "clear leave_date" or similar:
- Use UPDATE to set that column to NULL.
- Example: "Remove leave_date for employee 10" → UPDATE employees SET leave_date = NULL WHERE id = 10;

When Employee table is mentioned use the Employee_Skills table 
When Job Table Is Mentioned Use Job_Skills table

Now process this: {request.prompt}
"""

# Delegation Logic

def delegate_tasks():
    today = datetime.now().strftime('%Y_%m_%d')
    delegated_table = f"delegated_tasks_{today}"

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS {delegated_table} (
            employee_name TEXT,
            delegated_job TEXT
        );
    """)

    cursor.execute("SELECT * FROM jobs_skills WHERE assigned_to IS NULL")
    unassigned_jobs = cursor.fetchall()

    for job in unassigned_jobs:
        job_id, job_name, required_skills, priority, required_designation, assigned_to = job

        # First, try to match same designation
        cursor.execute("""
            SELECT id, name FROM employees_skills
            WHERE status = 'Active'
            AND designation = %s
            AND id NOT IN (SELECT assigned_to FROM jobs_skills WHERE assigned_to IS NOT NULL)
        """, (required_designation,))
        same_designation = cursor.fetchall()

        selected = None

        if same_designation:
            selected = same_designation[0]  # If multiple, just pick one for now
        else:
            # Try matching by skills
            cursor.execute("""
                SELECT id, name, skills FROM employees_skills
                WHERE status = 'Active'
                AND id NOT IN (SELECT assigned_to FROM jobs_skills WHERE assigned_to IS NOT NULL)
            """)
            all_candidates = cursor.fetchall()

            for candidate in all_candidates:
                cid, cname, cskills = candidate
                if all(skill.strip() in cskills.split(',') for skill in required_skills.split(',')):
                    selected = (cid, cname)
                    break

        if not selected:
            # Pick someone senior
            cursor.execute("""
                SELECT id, name FROM employees_skills
                WHERE status = 'Active'
                AND designation > %s
                AND id NOT IN (SELECT assigned_to FROM jobs_skills WHERE assigned_to IS NOT NULL)
            """, (required_designation,))
            senior = cursor.fetchone()
            if senior:
                selected = senior

        if selected:
            cid, cname = selected
            cursor.execute("UPDATE jobs_skills SET assigned_to = %s WHERE id = %s", (cid, job_id))
            cursor.execute(f"INSERT INTO {delegated_table} (employee_name, delegated_job) VALUES (%s, %s)", (cname, job_name))

    conn.commit()

# Auto run every morning
scheduler = BackgroundScheduler()
scheduler.add_job(delegate_tasks, 'cron', hour=6)
scheduler.start()

# Manual Delegation Trigger
class PromptRequest(BaseModel):
    prompt: str

@app.post("/query")
async def run_prompt(request: PromptRequest):
    if "delegate now" in request.prompt.lower():
        delegate_tasks()
        return {"message": "Manual delegation triggered"}

    # Normal LLM handling with the prompt
    return {"sql": SQL_PROMPT.format(request=request, schema_info="")}
