module.exports = function (app) {
    // Lib for getting distance of a point around a centered one (Haversine formular)
    const haversine = require('haversine')

    // All items
    // Call for the example data: http://localhost:8080/items?lat=41.394193&lon=2.165666&distance=50o0
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

        //TODO: load items from database
        let items = testData;

        // Filter array to contain only the one in the right distance
        items.food = items.food.filter(function (foodItem) {
            let c = haversine({
                latitude: lat,
                longitude: lon
            }, {
                latitude: foodItem.location.lat,
                longitude: foodItem.location.lon
            }, 
            {unit: 'meter'});

            console.log(c)
            return Number(c) < Number(distanceM);
        });

        res.render('items', items);
    });

    // Add new item - remove as we do that with typeform
    /*
    app.post('/items', (req, res) => {
        let body = req.body;
        testData.food.push(body);
        req.send("body")
        //TODO: Save body into db
        //TODO: redirect to /item/:id

    });
    */

}