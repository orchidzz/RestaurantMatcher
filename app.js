const express = require("express");
const axios = require("axios");
const nodecache = require("node-cache");
require("dotenv").config();
const cache = new nodecache({ stdTTL: 3599 });
const app = express();

app.use(express.static(__dirname));
cache.mset([
    { key: "restaurants", val: [] },
    { key: "location", val: "" },
    { key: "coords", val: [] },
    { key: "radius", val: "" },
    { key: "foodTypes", val: "" },
    { key: "placeTypes", val: "" },
    { key: "prices", val: "" },
]);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/getRestaurant", async (req, res) => {
    if (req.query.location != cache.get("location")) {
        cache.set("location", req.query.location);
        await geocode(cache.get("location"));
        await callYelpApi(
            cache.get("coords"),
            req.query.radius,
            req.query.foodTypes,
            req.query.placeTypes,
            req.query.prices
        );
    } else if (
        req.query.radius != cache.get("radius") ||
        req.query.foodTypes != cache.get("foodTypes") ||
        req.query.placeTypes != cache.get("placeTypes") ||
        req.query.prices != cache.get("prices")
    ) {
        await callYelpApi(
            cache.get("coords"),
            req.query.radius,
            req.query.foodTypes,
            req.query.placeTypes,
            req.query.prices
        );
    }
    if (cache.get("restaurants").length != 0) {
        var restaurants = cache.get("restaurants");
        var restaurant = restaurants.pop();
        cache.set("restaurants", restaurants);
        res.json(JSON.stringify(restaurant));
    } else {
        res.json();
    }
});

async function geocode(location) {
    try {
        if (!process.env.GEOCODE_API_KEY) {
            throw new Error("You forgot to set GEOCODE_API_KEY");
        }
        response = await axios({
            url: "https://api.geoapify.com/v1/geocode/search",
            method: "get",
            params: {
                text: location,
                limit: 1,
                apiKey: process.env.GEOCODE_API_KEY,
            },
        });

        result = response.data.features[0].properties;
        cache.set("coords", [result.lon, result.lat]);
    } catch (error) {
        console.log("error geocoding address", error);
    }
}

async function callYelpApi(
    givenCoords,
    givenRadius,
    givenFoodTypes,
    givenPlaceTypes,
    givenPrices
) {
    try {
        if (!process.env.YELP_API_KEY) {
            throw new Error("You forgot to set YELP_API_KEY");
        }
        const config = {
            Authorization: "Bearer " + process.env.YELP_API_KEY,
            Accept: "application/json",
        };
        cache.set("coords", givenCoords);
        cache.set("radius", givenRadius);
        cache.set("foodTypes", givenFoodTypes);
        cache.set("placeTypes", givenPlaceTypes);
        cache.set("prices", givenPrices);
        var givenCategories;
        if (givenFoodTypes == "") {
            givenCategories = givenPlaceTypes;
        } else if (givenPlaceTypes == "") {
            givenCategories = givenFoodTypes;
        } else {
            givenCategories = givenFoodTypes + "," + givenPlaceTypes;
        }

        response = await axios({
            url: "https://api.yelp.com/v3/businesses/search",
            method: "get",
            params: {
                longitude: givenCoords[0],
                latitude: givenCoords[1],
                radius: givenRadius,
                price: givenPrices,
                categories: givenCategories,
                limit: 50,
                sort_by: "best_match",
            },
            headers: config,
        });
        var restaurants = new Array();
        var businesses = response.data.businesses;
        for (i = businesses.length; i > 0; --i) {
            var business = businesses[i - 1];
            var restaurant = new Restaurant();
            restaurant.url = business.url;
            restaurant.imgUrl = business.image_url;
            restaurant.name = business.name;
            restaurant.rating = business.rating;
            restaurant.url = business.url;
            restaurant.price = business.price;
            restaurant.location = business.location.display_address;
            restaurant.reviewCount = business.review_count;
            restaurants.push(restaurant);
        }
        cache.set("restaurants", restaurants);
    } catch (error) {
        console.log("error calling yelp api", error);
    }
}

class Restaurant {
    url = "";
    imgUrl = "";
    name = "";
    price;
    rating;
    reviewCount;
    location;
}
app.listen(3000, () => {
    console.log("started");
});
// overwrite equality method of array type
// adapted from: https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
// Array.prototype.equals = function (array) {
//     // if the other array is a falsy value, return
//     if (!array) return false;
//     // compare lengths - can save a lot of time
//     if (this.length != array.length) return false;

//     for (var i = 0; i < this.length(); ++i) {
//         if (!array.includes(this[i])) {
//             return false;
//         }
//     }
//     for (var i = 0; i < array.length(); ++i) {
//         if (!this.includes(array[i])) {
//             return false;
//         }
//     }
//     return true;
// };
