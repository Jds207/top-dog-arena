# X (Twitter) Meme Creator Finder

This script helps you find top meme creators on X (Twitter) and analyze their engagement data.

## Setup

1. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

2. Get your X API credentials:
   - Go to https://developer.twitter.com/en/portal/dashboard
   - Create a project and app
   - Generate a Bearer Token
   - Add the Bearer Token to the `.env` file

3. Configure the `.env` file:
   - Replace `your_bearer_token_here` with your actual Bearer Token
   - Adjust other settings as needed

## Usage

Run the script:
```
python meme_finder.py
```

The script will:
1. Search X for potential meme creators based on defined search terms
2. Analyze their engagement metrics
3. Export the results to a CSV file

## Customization

You can modify:
- Search terms in the `search_terms` list
- Minimum follower count with the `min_followers` parameter
- Maximum results per search with the `max_results` parameter

## Output

The script generates a CSV file with the following data for each meme creator:
- Username
- Follower count
- Following count
- Average likes, retweets, replies, and quotes
- Overall engagement rate
- Bio description

The results are sorted by engagement rate, with the most engaging creators at the top.
