import express from "express";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";
import dns from "dns";
import cors from "cors";
import { nanoid } from "nanoid";

const PORT = 3001;
const Mongo_Url = "mongodb+srv://aravindathi:Arav1812@mydb.ppt4u.mongodb.net";

// MongoDB connectivity fucntion
async function createConnection() {
  const client = new MongoClient(Mongo_Url);
  return await client.connect();
}

const app = express();
app.use(express.json());
app.use(cors());

app.post("/", async (req, res) => {
  const { url } = req.body;
  let originalUrl = new URL(url);
  dns.lookup(originalUrl.hostname, async (err) => {
    if (err) {
      return res.status(404).send({ error: "Address not found" });
    }
 
  const client = await createConnection();
  const result = await client
    .db("urlshortener")
    .collection("data")
    .findOneAndUpdate(
      { original_url: url },
      {
        $setOnInsert: {
          original_url: url,
          short_id: nanoid(7),
        },
      },
      {
        returnOriginal: false,
        upsert: true,
      }
    );
    res.send(result)
});

});


// getting data from shortened url 

app.get('/:short_id', async (req, res) => {
  const shortId = req.params.short_id;
  const client = await createConnection();
  const result = await client
    .db("urlshortener")
    .collection("data")
    .findOne({ short_id: shortId })
    .then(doc => {
      if (doc === null) return res.send('Uh oh. We could not find a link at that URL');
      console.log(doc.original_url)
      res.redirect(doc.original_url)
    })
    .catch(console.error);
});


 




app.listen(PORT, console.log("server starts"));
