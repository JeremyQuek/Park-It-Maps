from dotenv.main import load_dotenv
from utils.performance import measure_time
import psycopg2
import os
from psycopg2 import Error
import random

load_dotenv()
DB_URL = os.getenv("DB_URL")

def open_connection():
    """Create a database connection"""
    try:
        conn = psycopg2.connect(DB_URL, sslmode="require")
        return conn
    except Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return None

def create_user():
    conn = open_connection()
    try:
        cur = conn.cursor()
        while True:
            number = random.randint(10**9, 10**10 - 1)
            cur.execute("SELECT COUNT(*) FROM users WHERE user_id = %s", (str(number),))
            if cur.fetchone()[0] == 0:
                cur.execute("INSERT INTO users (user_id) VALUES (%s)", (str(number),))
                conn.commit()
                break
        return number
    except Exception as e:
        print(f"Error creating user: {e}")
        return None
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def check_user(uid):
    """Check if a user exists in the database"""
    conn = open_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE user_id = %s", (str(uid),))
        res = cur.fetchone()
        return bool(res)
    except Error as e:
        print(f"Error checking user: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def create_carpark(conn):
    """Create the carpark table if it doesn't exist"""
    try:
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS carpark (
                agency VARCHAR(10) NOT NULL,
                carpark_id VARCHAR(20) NOT NULL PRIMARY KEY,
                address VARCHAR(200) NOT NULL,
                lat VARCHAR(200) NOT NULL,
                long VARCHAR(200) NOT NULL,
                lot_type VARCHAR(10),
                lots_available VARCHAR(10),
                total_lots VARCHAR(10),
                price VARCHAR(200) NOT NULL,
                price_weekend VARCHAR(200) NOT NULL,
                ev VARCHAR(10) NOT NULL
            )
        ''')
        conn.commit()
        print("Table created successfully")
    except Error as e:
        print(f"Error creating table: {e}")
    finally:
        if cur:
            cur.close()

def populate_carparks(data, conn):
    """Populate the carpark table with data using COPY"""
    try:
        cur = conn.cursor()

        # Create a temporary table for new data
        cur.execute('''
            CREATE TEMP TABLE temp_carpark (
                agency VARCHAR(10) NOT NULL,
                carpark_id VARCHAR(20) NOT NULL,
                address VARCHAR(200) NOT NULL,
                lat VARCHAR(200) NOT NULL,
                long VARCHAR(200) NOT NULL,
                price VARCHAR(200) NOT NULL,
                price_weekend VARCHAR(200) NOT NULL,
                ev VARCHAR(10) NOT NULL
            )
        ''')

        # Use StringIO to create a file-like object in memory
        from io import StringIO
        buffer = StringIO()
        for row in data:
            buffer.write('\t'.join(str(item) for item in row) + '\n')
        buffer.seek(0)

        # Use COPY to bulk insert data
        cur.copy_from(
            buffer,
            'temp_carpark',
            columns=('agency', 'carpark_id', 'address', 'lat', 'long', 'price', 'price_weekend', 'ev'),
            sep='\t'
        )

        # Insert from temp table to main table, avoiding duplicates
        cur.execute('''
            INSERT INTO carpark
            SELECT * FROM temp_carpark
        ''')

        conn.commit()
        print("Populated carpark table")
    except Error as e:
        print(f"An error occurred while updating carparks: {e}")
    finally:
        if cur:
            cur.close()


def retrieve_carparks():
    conn=open_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM carpark")
        rows = cur.fetchall()

        # Get column names from cursor description
        columns = [desc[0] for desc in cur.description]

        carpark_dict = {
            row[1]: {  # carpark_id is at index 1
                columns[0]: row[0],  # agency
                columns[1]: row[1],  # carpark_id
                columns[2]: row[2],  # address
                columns[3]: row[3],  # lat
                columns[4]: row[4],  # long
                columns[5]: row[5],  # price
                columns[6]: row[6],  # price_weekend
                columns[7]: row[7],  # ev
                columns[8]: row[8],  # lot_type
                columns[9]: row[9],  # lots_available
                columns[10]: row[10],  # total_lot
            }
            for row in rows
        }

        return carpark_dict
    except psycopg2.Error as e:
        print(f"An error occurred while retrieving carparks: {e}", flush = True)
        return {}
    finally:
        if cur:
            cur.close()


def create_bookmarks():
    """Create all necessary tables if they don't exist"""
    conn = open_connection()
    try:
        cur = conn.cursor()

        # Create users table with SERIAL id
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(10) UNIQUE NOT NULL
            )
        """)

        # Create bookmarks table with integer user_id foreign key
        cur.execute("""
            CREATE TABLE IF NOT EXISTS bookmarks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                lat VARCHAR(100) NOT NULL,
                long VARCHAR(100) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE (user_id, location)
            )
        """)

        conn.commit()
        print("Database tables created successfully")
    except Error as e:
        print(f"Error creating database: {e}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@measure_time
def insert_bookmark(uid: str, name: str, loc: str, coords: list):
    """Insert a new bookmark"""
    conn = open_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO bookmarks (user_id, name, location, lat, long)
            VALUES ((SELECT id FROM users WHERE user_id = %s::VARCHAR), %s, %s, %s, %s)
        """, (uid, name, loc, coords[0], coords[1]))
        conn.commit()
        return True
    except Error as e:
        print(f"Error inserting bookmark: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@measure_time
def delete_bookmark(uid: str, loc: str):
    """Delete a bookmark"""
    conn = open_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            DELETE FROM bookmarks
            WHERE user_id = (SELECT id FROM users WHERE user_id = %s::VARCHAR)
            AND location = %s
        """, (uid, loc))
        conn.commit()
        return True
    except Error as e:
        print(f"Error deleting bookmark: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@measure_time
def retrieve_bookmarks(uid: str):
    """Retrieve all bookmarks for a user"""
    conn = open_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT name, location, lat, long
            FROM bookmarks
            WHERE user_id = (SELECT id FROM users WHERE user_id = %s::VARCHAR)
        """, (uid,))
        return cur.fetchall()
    except Error as e:
        print(f"Error retrieving bookmarks: {e}")
        return []
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

