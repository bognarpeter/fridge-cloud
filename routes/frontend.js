module.exports = function (app) {
    // Lib for getting distance of a point around a centered one (Haversine formular)
    var hDistance = require("../lib/haversine_distance");
    let testData = {
        food: [
            {
                "id": 0,
                "name": "apple",
                "type": "fruit",
                "blockedBy": "Peter",
                "offeredBy": "Simon",
                "amount": 5,
                "unit": "Pieces",
                "expiration_date": "2019-10-12T03:15:01.588Z",
                "image": "https://source.unsplash.com/1600x900/?apple",
                "location": {
                    "lon": 2.165290,
                    "lat": 41.393843
                }
            },
            {
                "id": 1,
                "name": "banana",
                "type": "fruit",
                "blockedBy": "",
                "offeredBy": "Simon",
                "amount": 2,
                "unit": "Pieces",
                "expiration_date": "2019-10-12T03:15:01.588Z",
                "image": "https://source.unsplash.com/1600x900/?banana",
                "location": {
                    "lon": 2.165081,
                    "lat": 41.394169
                }
            },
            {
                "id": 2,
                "name": "Pizza",
                "type": "dish",
                "blockedBy": "",
                "offeredBy": "Viki",
                "amount": 9,
                "unit": "Slices",
                "expiration_date": "2019-10-12T03:15:01.588Z",
                "image": "https://source.unsplash.com/1600x900/?pizza",
                "location": {
                    "lon": 2.165081,
                    "lat": 41.394169
                }
            },
            {
                "id": 3,
                "name": "Soup",
                "type": "dish",
                "blockedBy": "",
                "offeredBy": "Simon",
                "amount": 2,
                "unit": "Liters",
                "expiration_date": "2019-10-12T03:15:01.588Z",
                "image": "https://source.unsplash.com/1600x900/?soup",
                "location": {
                    "lon": 2.171485,
                    "lat": 41.384152
                }
            },
            {
                "id": 4,
                "name": "Salmon",
                "type": "fish",
                "blockedBy": "Viki",
                "offeredBy": "Peter",
                "amount": 2,
                "unit": "Pieces",
                "expiration_date": "2019-10-12T03:15:01.588Z",
                "image": "https://source.unsplash.com/1600x900/?salmon",
                "location": {
                    "lon": 2.165247,
                    "lat": 41.394555
                }
            },
            {
                "id": 5,
                "name": "Out of range Apple",
                "type": "fruit",
                "blockedBy": "",
                "offeredBy": "Simon",
                "amount": 2,
                "unit": "Pieces",
                "expiration_date": "2019-10-12T03:15:01.588Z",
                "image": "https://source.unsplash.com/1600x900/?apple",
                "location": {
                    "lon": 2.155700,
                    "lat": 41.388156
                }
            },
            {
                "id": 6,
                "name": "Out of range banana",
                "type": "fruit",
                "blockedBy": "",
                "offeredBy": "Simon",
                "amount": 2,
                "unit": "Pieces",
                "expiration_date": "2019-10-12T03:15:01.588Z",
                "image": "https://source.unsplash.com/1600x900/?banana",
                "location": {
                    "lon": 2.158178,
                    "lat": 41.387135
                }
            }
        ]
    };


    app.get('/', (req, res) => {
        var person = "Gaudi";
        res.render('index', { person: person });
    });

    // All items
    // Call for the example data: http://localhost:8080/items?lat=41.394193&lon=2.165666&distance=500
    app.get('/items', (req, res) => {
        // get data from query
        let lon = req.query.lon;
        let lat = req.query.lat;
        let distanceM = req.query.distance;

        //report error if data was not set
        if (lon == undefined || lon == null) {
            res.send("Please set 'lon' query parameter")
            return
        }
        if (lat == undefined || lat == null) {
            res.send("Please set 'lat' query parameter")
            return
        }
        if (distanceM == undefined || distanceM == null) {
            res.send("Please set 'distance' query parameter")
            return
        }

        //TODO: load items
        let items = testData;

        // Filter array to contain only the one in the right distance
        items.food = items.food.filter(function (foodItem) {
            let d = hDistance.getDistanceFromLatLonInMeter(lat, lon, foodItem.location.lat, foodItem.location.lon);
            console.log("Distance ",foodItem.name,": ",d);
            return Number(distanceM) > Number(d);
        });

        res.render('items', items);
    });
    // Add new item
    app.post('/items', (req, res) => {
        //TODO: Save body into db
        //TODO: redirect to /item/:id

    });

    // My reserved items
    app.get('/my-items', (req, res) => {
        //TODO: load items
        var person = "Gaudi";
        res.render('items', {
            food: [
                {
                    "id": 0,
                    "name": "apple",
                    "type": "vegetable",
                    "blockedBy": "Peter",
                    "offeredBy": "Simon",
                    "amount": 0,
                    "unit": "Pieces",
                    "expiration_date": "2019-10-12T03:15:01.588Z",
                    "image": "https://google.de/image.jpg",
                    "location": {
                        "lon": 0,
                        "lat": 0
                    }
                }
            ]
        });
    });

    // Single item
    app.get('/item/:id', (req, res) => {
        //TODO: load single item
        var person = "Gaudi";
        res.render('items', {
            food: [
                {
                    "id": 0,
                    "name": "apple",
                    "type": "vegetable",
                    "blockedBy": "Peter",
                    "offeredBy": "Simon",
                    "amount": 0,
                    "unit": "Pieces",
                    "expiration_date": "2019-10-12T03:15:01.588Z",
                    "image": "https://google.de/image.jpg",
                    "location": {
                        "lon": 0,
                        "lat": 0
                    }
                }
            ]
        });
    });

    // Update new item
    app.put('/items/:id', (req, res) => {
        //TODO: Save body into db
        //TODO: redirect to /item/:id
    });

    // Delete item
    app.delete('/items/:id', (req, res) => {
        //TODO: "Delete" item from db
        //TODO: redirect to all items
    });
}