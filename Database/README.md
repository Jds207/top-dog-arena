# Database Manager

This script sets up and manages a SQLite database to store data collected by the Meme Scout script.

## Features

- Creates a SQLite database file (`meme_data.db`)
- Defines two tables:
  - `memers`: Stores information about each meme creator
  - `engagement_data`: Stores historical engagement data for each creator
- Provides functions to:
  - Store new data
  - Retrieve data for specific users
  - Get top creators based on engagement

## Usage

This script is intended to be used by the `meme_scout.py` script, but can also be run standalone for database queries.

To integrate with Meme Scout:
1. Import the `DatabaseManager` class in `meme_scout.py`
2. After fetching and analyzing data, call `store_meme_data()` to save the results

## Schema

### `memers` table
- `user_id`: X user ID (Primary Key)
- `username`: X username
- `description`: User's bio
- `follower_count`: Number of followers
- `following_count`: Number of accounts they follow
- `first_seen`: Timestamp when first added to the DB
- `last_updated`: Timestamp of the last data update

### `engagement_data` table
- `id`: Auto-incrementing primary key
- `user_id`: Foreign key to `memers` table
- `scrape_date`: Timestamp of when the data was collected
- `tweets_analyzed`: Number of tweets analyzed
- `avg_likes`, `avg_retweets`, etc.: Engagement metrics
- `engagement_rate`: Overall engagement rate
