module.exports = function (app) {
    app.get('/', (req, res) => {
        var person = "Gaudi";
        res.render('index', { person: person });
    });

    // All items
    app.get('/items', (req, res) => {
        //TODO: load items
        //TODO: get lon & lat from query
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