import os
from dotenv import load_dotenv
from services.api import retrieve_HDB_lots, retrieve_LTA_lots
from services.database import open_connection

load_dotenv()
DB_URL = os.getenv('DB_URL')

def cache_lots_and_update_db():
    data = retrieve_HDB_lots()
    data.extend(retrieve_LTA_lots())
    data = [(d['carpark_id'], d['lot_type'], d['lots_available'], d['total_lots']) for d in data]
   
    conn = open_connection()
    cur = None #
    try:
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS temp_carpark_updates (
                carpark_id VARCHAR(200),
                lot_type VARCHAR(200),
                lots_available VARCHAR(200),
                total_lots VARCHAR(200)
            )
        """)

        # 2. WIPE the temp table before adding new data
        cur.execute("TRUNCATE temp_carpark_updates")

        # Prepare data for COPY
        from io import StringIO
        csv_data = "\n".join([f"{carpark_id},{lot_type},{lots_available},{total_lots}" for carpark_id, lot_type, lots_available, total_lots in data])
        csv_file = StringIO(csv_data)

        # 3. Perform the bulk insert
        cur.copy_from(csv_file, 'temp_carpark_updates', sep=',')

        # 4. Perform the update
        cur.execute("""
            UPDATE carpark
            SET
                lot_type = temp_carpark_updates.lot_type,
                lots_available = temp_carpark_updates.lots_available,
                total_lots = temp_carpark_updates.total_lots
            FROM temp_carpark_updates
            WHERE carpark.carpark_id = temp_carpark_updates.carpark_id
        """)

        cur.execute("TRUNCATE temp_carpark_updates")

        conn.commit()
        print("Database updated and temp storage wiped successfully")
        return True
    except Exception as e:
        if conn:
            conn.rollback() 
        print(f"Error updating database: {e}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    cache_lots_and_update_db()
