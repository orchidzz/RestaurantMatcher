# RestaurantMatcher

## Description
Automate the process of choosing a restaurant by matching user with a restaurant based on user's preferences inputs. User can reject the match and get shown another match or accept the match and get directed to the Yelp page of the restaurant (similar to dating apps but for restaurant).

## Motivation
On Sundays, my mom and I often eat out. Despite wanting to try new places, we often end up at restaurants that we already frequent because of the overwhelming number of choices when searching for restaurants, hesitation in making a conscious choice, etc.
Thus, we needed something to force us to be spontaneous. Here comes a website that chooses a restaurant for you while still allowing some freedom of choice, lessening the time to scroll through Yelp/Google's flood of search results, etc.

## Lessons
1. Use of Yelp and Geocoding API's
2. CORS (cross origin resource sharing) is not supported by Yelp Fusion --> have to request on server-side
3. Environmental vars to hide api keys
