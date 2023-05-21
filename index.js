const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jyvsljn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   
    const categoriesCollection = client.db('legoLand').collection('categories');
    const allToysCollection = client.db('legoLand').collection('allToys');

    // get the sub category data 
    app.get('/categories', async(req, res)=>{
        const category = req.query.category;
        try {
            const data = await categoriesCollection.find({ category: category }).toArray();
            res.send(data);
          } catch (error) {
            console.error('Error fetching data from database:', error);
            res.send('Internal Server Error');
          }
    })

    // get all single category data 
    app.get('/categories/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}

        const result = await categoriesCollection.findOne(query);
        res.send(result)
    }) 
    // add a toys routes 
    app.post('/addtoys', async(req, res)=>{
      const addToys = req.body;
      const result = await allToysCollection.insertOne(addToys);
      res.send(result);
  })
// all toys display routes 
//   app.get('/alltoys', async(req, res)=>{
//     const result = await allToysCollection.find({}).sort({ price: 1 }).limit(20).toArray();
//     res.send(result)
// });
app.get('/alltoys', async (req, res) => {
  const sortOrder = req.query.sort || '';
  const searchTerm = req.query.search || '';

  let query = {};

  // Apply search filter if searchTerm is provided
  if (searchTerm) {
    query = { toyName: { $regex: searchTerm, $options: 'i' } };
  }

  try {
    const result = await allToysCollection
      .find(query)
      .sort({ price: sortOrder === 'asc' ? 1 : -1 })
      .limit(20)
      .toArray();

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res)=>{
    res.send('lego land is running')
})

app.listen(port, ()=>{
    console.log(`Lego Land is running on port: ${port}`)
})