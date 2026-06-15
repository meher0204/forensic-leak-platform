"""One-time utility: reset the admin user's password to 'admin123'.

Usage:
    python reset_admin_password.py

Uses the same SHA-256 hashing as the application.
Does not modify any other user.
"""

import hashlib
import sqlite3
import sys

DB_PATH = "database.sqlite3"
ADMIN_USERNAME = "admin"
NEW_PASSWORD = "adminhehe123"


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT id, username, role FROM users WHERE username = ?", (ADMIN_USERNAME,))
    row = cur.fetchone()

    if not row:
        print(f"User '{ADMIN_USERNAME}' not found.")
        sys.exit(1)

    user_id, username, role = row
    hashed = hash_password(NEW_PASSWORD)

    cur.execute("UPDATE users SET hashed_password = ? WHERE id = ?", (hashed, user_id))
    conn.commit()
    conn.close()

    print(f"Password reset successfully.")
    print(f"  Username: {username}")
    print(f"  Password: {NEW_PASSWORD}")
    print(f"  Role:     {role}")
    print(f"  User ID:  {user_id}")


if __name__ == "__main__":
    main()
