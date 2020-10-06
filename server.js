const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

// database connection
const uri = "mongodb+srv://volunteerNetworkAdmin:maimoona@cluster0.mbwlu.mongodb.net/volunteerNetworkDB?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const eventCollection = client.db("volunteerNetworkDB").collection("volunteerEvent");
    if(eventCollection){
        console.log("***DB: volunteerEvent Connected***");
    }
    //add Event item
    app.post('/addVolunteerEvent', (req, res) => {
        const newEventItem = req.body;
        eventCollection.insertOne(newEventItem)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
        console.log(newEventItem);
    })
    
    //show all evenItems
    app.get('/showAllEvents', (req, res) => {
        eventCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    //file upload
    app.post('/upload', (req, res) => {
    if(req.files === null){
        return res.status(400).json({ msg: "No file uploaded"});
    }

    const file = req.files.file;

    file.mv(`${__dirname}/client/src/uploads/${file.name}`, err => {
        if(err){
            console.log(err);
            return res.status(500).send(err);
        }

        res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });

    });
});
  
  });

client.connect(err => {
    const volunteerCollection = client.db("volunteerNetworkDB").collection("volunteerList");
    if(volunteerCollection){
        console.log("***DB: volunteerList Connected***");
    }

    // add volunteer
    app.post('/addVolunteer', (req, res) => {
        const newEventItem = req.body;
        console.log(newEventItem);
        volunteerCollection.insertOne(newEventItem)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
        console.log(newEventItem);
    });

    // show volunteer List
    app.get('/showVolunteerList', (req, res) => {
        volunteerCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    });

    app.get('/volunteerDetails', (req, res) => {
        console.log(typeof(volunteerCollection));
        // console.log(volunteerCollection.addVolunter)
        volunteerCollection.find({"addVolunter.email" : req.query.email})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })
});






app.get("/", (req, res) => {
    res.send("server started...");
})
var publicDir = require('path').join(__dirname,'/client/src/uploads'); 
console.log(publicDir);
app.use(express.static(publicDir));
app.listen(4000);