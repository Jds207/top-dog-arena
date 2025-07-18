import tweepy
import pandas as pd
import datetime
import os
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class MemeCreatorFinder:
    def __init__(self):
        # Get API credentials from environment variables
        self.bearer_token = os.getenv("TWITTER_BEARER_TOKEN")
        
        # Initialize API client
        self.client = tweepy.Client(
            bearer_token=self.bearer_token,
            wait_on_rate_limit=True
        )
    
    def search_meme_creators(self, search_query, max_results=100):
        """
        Search for potential meme creators using keywords
        """
        print(f"Searching for: {search_query}")
        
        # Search for users who mention memes in their bio
        users = self.client.search_recent_tweets(
            query=search_query,
            max_results=max_results,
            tweet_fields=['created_at', 'public_metrics', 'context_annotations']
        )
        
        return users

    def analyze_user_engagement(self, user_id, max_tweets=100):
        """
        Get engagement metrics for a specific user
        """
        tweets = self.client.get_users_tweets(
            id=user_id,
            max_results=max_tweets,
            tweet_fields=['created_at', 'public_metrics'],
            exclude=['retweets', 'replies']
        )
        
        # Skip users with no tweets
        if not tweets.data:
            return None
        
        # Calculate engagement metrics
        total_likes = 0
        total_retweets = 0
        total_replies = 0
        total_quotes = 0
        total_tweets = len(tweets.data)
        
        for tweet in tweets.data:
            metrics = tweet.public_metrics
            total_likes += metrics['like_count']
            total_retweets += metrics['retweet_count']
            total_replies += metrics['reply_count']
            total_quotes += metrics['quote_count']
        
        # Calculate averages
        avg_likes = total_likes / total_tweets if total_tweets > 0 else 0
        avg_retweets = total_retweets / total_tweets if total_tweets > 0 else 0
        avg_replies = total_replies / total_tweets if total_tweets > 0 else 0
        avg_quotes = total_quotes / total_tweets if total_tweets > 0 else 0
        
        # Calculate engagement rate (sum of all interactions divided by tweets)
        engagement_rate = (total_likes + total_retweets + total_replies + total_quotes) / total_tweets if total_tweets > 0 else 0
        
        return {
            'user_id': user_id,
            'username': self.client.get_user(id=user_id).data.username,
            'tweets_analyzed': total_tweets,
            'avg_likes': avg_likes,
            'avg_retweets': avg_retweets,
            'avg_replies': avg_replies,
            'avg_quotes': avg_quotes,
            'total_engagement': total_likes + total_retweets + total_replies + total_quotes,
            'engagement_rate': engagement_rate
        }

    def find_top_memers(self, search_terms, min_followers=1000, max_results=100):
        """
        Find and analyze top meme creators based on search terms
        """
        all_results = []
        
        # Search for each term
        for term in search_terms:
            search_query = f"{term} -is:retweet"
            tweets = self.search_meme_creators(search_query, max_results)
            
            if not tweets.data:
                print(f"No results found for {term}")
                continue
            
            # Process each tweet
            for tweet in tweets.data:
                user_id = tweet.author_id
                user = self.client.get_user(id=user_id, user_fields=['description', 'public_metrics'])
                
                if not user.data:
                    continue
                
                # Skip users with fewer followers than the minimum
                if user.data.public_metrics['followers_count'] < min_followers:
                    continue
                
                # Look for meme-related keywords in bio
                if "meme" in user.data.description.lower() or "memes" in user.data.description.lower():
                    print(f"Analyzing user: {user.data.username}")
                    
                    # Get engagement data
                    engagement_data = self.analyze_user_engagement(user_id)
                    
                    if engagement_data:
                        # Add user info
                        engagement_data['follower_count'] = user.data.public_metrics['followers_count']
                        engagement_data['following_count'] = user.data.public_metrics['following_count']
                        engagement_data['description'] = user.data.description
                        
                        all_results.append(engagement_data)
            
            # Avoid hitting rate limits
            time.sleep(2)
        
        # Convert to DataFrame and sort by engagement rate
        if all_results:
            df = pd.DataFrame(all_results)
            df = df.sort_values(by='engagement_rate', ascending=False)
            
            # Remove duplicates
            df = df.drop_duplicates(subset=['user_id'])
            
            return df
        
        return pd.DataFrame()

    def export_results(self, df, filename=None):
        """
        Export results to CSV
        """
        if filename is None:
            date_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"top_memers_{date_str}.csv"
            
        filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
        df.to_csv(filepath, index=False)
        print(f"Results exported to {filepath}")
        
        return filepath

if __name__ == "__main__":
    # Create finder instance
    finder = MemeCreatorFinder()
    
    # Define search terms
    search_terms = [
        "memes",
        "dank memes",
        "funny memes",
        "viral memes",
        "meme creator",
        "meme artist"
    ]
    
    # Find top meme creators
    results = finder.find_top_memers(search_terms, min_followers=5000, max_results=50)
    
    if not results.empty:
        print("\nTop 10 Meme Creators:")
        print(results[['username', 'follower_count', 'engagement_rate', 'avg_likes', 'avg_retweets']].head(10))
        
        # Export full results
        finder.export_results(results)
    else:
        print("No results found.")
