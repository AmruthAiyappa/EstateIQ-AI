import os
from contextlib import contextmanager
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from dotenv import load_dotenv

# Load env variables from root folder
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(project_root, ".env"))

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_NAME = os.getenv("DB_NAME", "estateiq")

# Initialize connection pool
try:
    connection_pool = SimpleConnectionPool(
        minconn=1,
        maxconn=20,
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname=DB_NAME
    )
    print("Database connection pool initialized successfully.")
except Exception as e:
    print(f"Error initializing connection pool: {e}")
    connection_pool = None

@contextmanager
def get_db_cursor():
    """Context manager to get a cursor from the connection pool and commit/rollback changes safely."""
    if not connection_pool:
        raise Exception("Database connection pool is not initialized.")
    
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        connection_pool.putconn(conn)

def get_db_connection():
    """Simple connection getter for scripts or non-cursor raw queries."""
    if not connection_pool:
        raise Exception("Database connection pool is not initialized.")
    return connection_pool.getconn()

def put_db_connection(conn):
    if connection_pool:
        connection_pool.putconn(conn)
