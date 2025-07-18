import sqlite3
import pandas as pd
import os

class DatabaseManager:
    def __init__(self, db_name="meme_data.db"):
        self.db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), db_name)
        self.conn = sqlite3.connect(self.db_path)
        self.create_tables()

    def create_tables(self):
        """
        Create database tables if they don't exist
        """
        cursor = self.conn.cursor()
        
        # Create memers table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS memers (
                user_id TEXT PRIMARY KEY,
                username TEXT,
                description TEXT,
                follower_count INTEGER,
                following_count INTEGER,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP
            )
        ''')
        
        # Create engagement_data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS engagement_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                scrape_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tweets_analyzed INTEGER,
                avg_likes REAL,
                avg_retweets REAL,
                avg_replies REAL,
                avg_quotes REAL,
                total_engagement INTEGER,
                engagement_rate REAL,
                FOREIGN KEY (user_id) REFERENCES memers (user_id)
            )
        ''')
        
        self.conn.commit()

    def store_meme_data(self, df):
        """
        Store meme creator data and their engagement stats
        """
        cursor = self.conn.cursor()
        
        for _, row in df.iterrows():
            # Update or insert memer info
            cursor.execute('''
                INSERT OR REPLACE INTO memers (user_id, username, description, follower_count, following_count, last_updated)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (row['user_id'], row['username'], row['description'], row['follower_count'], row['following_count']))
            
            # Insert new engagement data
            cursor.execute('''
                INSERT INTO engagement_data (user_id, tweets_analyzed, avg_likes, avg_retweets, avg_replies, avg_quotes, total_engagement, engagement_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (row['user_id'], row['tweets_analyzed'], row['avg_likes'], row['avg_retweets'], row['avg_replies'], row['avg_quotes'], row['total_engagement'], row['engagement_rate']))
        
        self.conn.commit()
        print(f"Stored data for {len(df)} users in the database.")

    def get_memer_by_username(self, username):
        """
        Retrieve a memer's data by username
        """
        df = pd.read_sql_query("SELECT * FROM memers WHERE username = ?", self.conn, params=(username,))
        return df

    def get_engagement_history(self, user_id):
        """
        Get all engagement data for a specific user
        """
        df = pd.read_sql_query("SELECT * FROM engagement_data WHERE user_id = ? ORDER BY scrape_date DESC", self.conn, params=(user_id,))
        return df

    def get_top_memers(self, top_n=10):
        """
        Get top memers based on latest engagement rate
        """
        query = f'''
            SELECT m.username, m.follower_count, ed.engagement_rate, ed.scrape_date
            FROM memers m
            JOIN (
                SELECT user_id, MAX(scrape_date) as max_date
                FROM engagement_data
                GROUP BY user_id
            ) latest ON m.user_id = latest.user_id
            JOIN engagement_data ed ON m.user_id = ed.user_id AND latest.max_date = ed.scrape_date
            ORDER BY ed.engagement_rate DESC
            LIMIT {top_n}
        '''
        df = pd.read_sql_query(query, self.conn)
        return df

    def close(self):
        self.conn.close()

if __name__ == '__main__':
    # Example usage
    db_manager = DatabaseManager()
    
    # Get top 10 memers
    top_memers = db_manager.get_top_memers()
    print("\nTop 10 Memers from DB:")
    print(top_memers)
    
    # Get history for a specific user (replace with a valid user_id)
    # history = db_manager.get_engagement_history('some_user_id')
    # print("\nEngagement History:")
    # print(history)
    
    db_manager.close()
