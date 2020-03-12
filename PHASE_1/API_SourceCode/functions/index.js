const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors ({ origin: true }) );

var serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://seng3011-859af.firebaseio.com"
});

const db = admin.firestore()
const serverErrorMsg = { message: "Internal server error, please try again." }

app.get('/api/test', async (req, res) => {
    try {
        await populate_test_collection();
        return res.status(200);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

//Endpoint to get all article reports
app.get('/api/all_articles', async (req, res) => {
    try{
        //Retrieve article records from db
        let all_articles = [];
        const snapshot = await db.collection('test_collection').get()
        snapshot.forEach(doc => {
            all_articles.push(doc.data())
        });
        //Store logging information - TBD
        //Send response
        if(all_articles.length === 0) {
            const no_results = {message: "No articles found"};
            return res.status(204).send(no_results);
        }
        return res.status(200).send(all_articles);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

//Endpoint to retrieve specific article
//keyterms length == 0 - TBD
//Date should be in proper format (including month + days etc)
//keyterms AND location
app.get('/api/articles', async(req, res) => {
    try {
        let startDate = req.query.start_date;
        let endDate = req.query.end_date;
        let keyterms = req.query.keyterms;
        let location = req.query.location;

        if(typeof startDate === 'undefined' || typeof endDate === 'undefined' || typeof keyterms === 'undefined' || typeof location === 'undefined' ){
            // Or a better error message
            const errorMsg = { message: "Bad Request: Some query parameters are missing." };
            return res.status(400).send(errorMsg); // Bad request
        }

        if (startDate > endDate) {
            const errorMsg = { message: "start_date has to be before end_date."};
            return res.status(400).send(errorMsg);
        }

        keyterms = keyterms.toString().split(",");

        // Converting startDate param into proper Date format
        startDate = new Date(startDate.replace("T", " "));
        endDate = new Date(endDate.replace("T", " "));

        let articles = [];

        let allArticles = db.collection('test_collection');

        let query = allArticles
                    .where('date_of_publication', '>=', startDate)
                    .where('date_of_publication', '<=', endDate)
                    .get()
                    .then(snapshot => {
                        if (snapshot.empty) {
                            //No matching dates found
                            console.log("No matching documents");
                            const noResults = { message: "No articles found" };
                            return res.status(200).send(noResults);
                        }

                        //Checking if headline contains any of the keyterms
                        snapshot.forEach(doc => {
                            //String based search for keyterms
                            let docPushed = false
                            for (let term of keyterms){
                                let termRegex = new RegExp(term, "i");
                                if (termRegex.test(doc.data().headline) || termRegex.test(doc.data().main_text)) {
                                    //Matching keywords
                                    articles.push(doc.data());
                                    docPushed = true;
                                    continue;
                                }
                            }

                            // If current doc has not been pushed to articles
                            // AND location is also provided as query params
                            if (!docPushed && typeof location !== 'undefined') {
                                let locationRegex = new RegExp(location, "i");
                                for (let place of doc.data().reports) {
                                    for (let loc of place.locations) {
                                        if(locationRegex.test(loc.location) || locationRegex.test(loc.country)) {
                                            //Matching location
                                            articles.push(doc.data()); 
                                            continue;
                                        }
                                    }
                                }
                            }
                        });

                        if (articles.length === 0) {
                            // No matching keywords & locations found
                            // Still return date matches or return empty response?
                            console.log("No matching keywords found - returning only matching dates");
                            snapshot.forEach(doc => {
                                articles.push(doc.data());
                            })
                        }

                        return res.status(200).send(articles);
                    })
                    .catch(error => {
                        console.log("Error getting documents: " , error);
                        return res.status(500).send(serverErrorMsg);
                    })

        return null;
    } catch (error) {
        console.log(error);
        return res.status(500).send(serverErrorMsg);
    }
});

async function populate_test_collection() {

    let article1 = {
            url:"https://www.who.int/csr/don/17-january-2020-novel-coronavirus-japan-exchina/en/",
            date_of_publication: new Date("2020-10-01 13:00:00"),
            headline: "Novel Coronavirus - Japan (ex-China)",
            main_text: "On 15 January 2020, the Ministry of Health, Labour and    Welfare, Japan (MHLW) reported an imported case of laboratory-confirmed 2019-novel coronavirus...",
            reports: [
                {
                    event_date: "2020-01-03 xx:xx:xx to 2020-01-15",
                    locations: [
                        {
                            country: "China",
                            location: "Wuhan, Hubei Province"
                        },
                        {
                            country: "Japan",
                            location: ""
                        }
                    ],
                    diseases: [
                        "2019-nCoV"
                    ],
                    syndromes: [
                        "Fever of unknown Origin"
                    ]
                }
            ]
        }

        let article2 = {
            url: "www.who.int/lalala_fake_article",
            date_of_publication: new Date("2018-12-12 12:50:00"),
            headline: "Outbreaks in Southern Vietnam",
            main_text: "Three people infected by what is thought to be H5N1 or H7N9  in Ho Chi Minh city. First infection occurred on 1 Dec 2018, and latest is report on 10 December. Two in hospital, one has recovered. Furthermore, two people with fever and rash infected by an unknown disease.",
            reports: [
                {
                    event_date: "2018-12-01 xx:xx:xx to 2018-12-10 xx:xx:xx",
                    locations: [
                        {
                            "geonames-id": 1566083,
                        }
                    ],
                    diseases: [
                        "influenza a/h5n1","influenza a/h7n9"
                    ],
                    syndromes: []
                },
                {
                    event_date: "2018-12-01 xx:xx:xx to 2018-12-10 xx:xx:xx",
                    locations: [
                        {
                            "geonames-id": 1566083,
                        }
                    ],
                    diseases: [
                        "unknown"
                    ],
                    syndromes: [
                        "Acute fever and rash"
                    ]
                }
            ]
        }



    await db.collection('test_collection').doc().create(article1);
    await db.collection('test_collection').doc().create(article2);

}
exports.app = functions.https.onRequest(app);


// Testing code to send doc to Firestore collection
// await db.collection('test_collection').doc().create({response: 'Hello World'});
// return res.status(200).send('Hello World!');

// Testing code to retrieve docs from Firestore
// let results = [];
//
// const snapshot = await db.collection('test_collection').get()
// snapshot.forEach(doc => {
//     results.push(doc.data())
// });
//
// return res.status(200).send(results)