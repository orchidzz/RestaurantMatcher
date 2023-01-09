$("document").ready(function () {
    $("#filter-btn").on("click", function () {
        $("#card-collapse").collapse("hide");
    });
    $("#show-btn").on("click", function () {
        $("#reject-restaurant").click();
    });

    $("#reject-restaurant").on("click", function () {
        // show a restaurant if available
        $("#input-collapse").collapse("hide");
        var prices = [];
        if ($("#prices input:checked").length == 0) {
            alert("Need to check at least one price");
            return;
        }
        $("#prices input:checked").each(function () {
            if ($(this).attr("id") == "cheap") {
                prices.push(1);
            } else if ($(this).attr("id") == "affordable") {
                prices.push(2);
            } else if ($(this).attr("id") == "medium") {
                prices.push(3);
            } else {
                prices.push(4);
            }
        });

        if ($("#location").val() != "") {
            req_location = $("#location").val();
            // 1 mile = 1609 meters
            req_radius = $("#distance").val() * 1609;
            req_foodTypes = $("#food-type").val();
            req_placeTypes = $("#place-type").val();

            ///parse strings of foodTypes and placeTypes into strings separated by commas
            req_foodTypes = req_foodTypes.replace(" ", "").toLowerCase();
            req_placeTypes = req_placeTypes.replace(" ", "").toLowerCase();
            $.ajax({
                url: "http://localhost:3000/getRestaurant",
                contentType: "application/json",
                type: "GET",
                data: {
                    location: req_location,
                    prices: prices.toString(),
                    foodTypes: req_foodTypes,
                    placeTypes: req_placeTypes,
                    radius: req_radius,
                },
                success: function (response) {
                    if (response != null) {
                        response = JSON.parse(response);
                        $("#restaurant-name").text(response.name);
                        $("#restaurant-location").text(response.location);
                        $("#restaurant-img").attr("src", response.imgUrl);
                        $("#restaurant-rating-count").text(
                            response.reviewCount
                        );
                        $("#restaurant-price").text(response.price);
                        $("#choose-restaurant").attr("href", response.url);

                        for (i = 1; i < response.rating; ++i) {
                            $("#restaurant-rating" + i).attr(
                                "class",
                                "bi bi-star-fill"
                            );
                        }
                        if ((response.rating / 0.5) % 2 == 1) {
                            $(
                                "#restaurant-rating" + response.rating + 0.5
                            ).attr("class", "bi bi-star-half");
                        }
                        $("#error-div").css("display", "none");
                        $("#result-div").css("display", "block");
                    } else {
                        // hide the card or show some warning/error
                        $("#error-div").css("display", "block");
                        $("#result-div").css("display", "none");
                    }
                },
                error: function (error) {
                    console.log("error getting restaurants: ", error);
                    // hide the card or show some warning/error
                    $("#error-div").css("display", "block");
                    $("#result-div").css("display", "none");
                },
            });
        } else {
            // hide the card or show some warning/error
            $("#error-div").css("display", "block");
            $("#result-div").css("display", "none");
        }
    });

    $("#choose-restaurant").on("click", function (e) {
        e.preventDefault();
        // direct to yelp page of the restaurant chosen
        window.open($("#choose-restaurant").attr("href"), "_blank");
    });
});
