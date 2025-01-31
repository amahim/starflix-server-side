const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kreq4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server
    // await client.connect();

    const MoviesCollection = client.db('StarFlixMovies').collection('Movies');

    // Add a movie /posst
    app.post('/movies', async (req, res) => {
      const newMovie = req.body;
      const result = await MoviesCollection.insertOne(newMovie);
      res.send(result);
    });

    // Get all movies 
    app.get('/movies', async (req, res) => {
      const {searchParams} = req.query;
      let option = {}
      if(searchParams){
        option = {title:{$regex: searchParams,$options:"i"}};
      }
        const cursor = MoviesCollection.find(option);
        const result = await cursor.toArray();
        res.send(result);
      });

    //top 6 highest-rated movies //ge
    
    app.get('/movies/highest-rated', async (req, res) => {
      try {
        const highestRatedMovies = await MoviesCollection.find()
          .sort({ rating: -1 })
          .limit(6)
          .toArray();
        res.json(highestRatedMovies);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });


    //update part 1 
    //and for dtls 
    app.get('/movies/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await MoviesCollection.findOne(query);
      res.send(result);
  })

  const { ObjectId } = require("mongodb");

// Update a movie part 2
app.put('/movies/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }; 
  const options = { upsert: true };
  const updatedMovie = req.body;

  const movie = {
    $set: {
      title: updatedMovie.title,
      poster: updatedMovie.poster,
      genre: updatedMovie.genre,
      releaseYear: updatedMovie.releaseYear,
      duration: updatedMovie.duration,
      summary: updatedMovie.summary,
      rating: updatedMovie.rating,
    },
  };

  
  const result = await MoviesCollection.updateOne(filter, movie, options);

  res.send(result);
});


  
  // deleteee
  app.delete('/movies/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await MoviesCollection.deleteOne(query);
    res.send(result);
})



// ------------------------------------fav handles--------------------------------------//


const FavMoviesCollection = client.db('StarFlixMovies').collection('FavMovies');


// Add a movie to favorites
app.post('/FavMovies', async (req, res) => {
    const newMovie = req.body;
  

    const result = await FavMoviesCollection.insertOne(newMovie);
    res.send(result);
});

// Get all favo movie for a specific user
app.get('/FavMovies', async (req, res) => {
    const email = req.query.email;
    

    const cursor = FavMoviesCollection.find({ email }); // Filter by email
    const result = await cursor.toArray();
    res.send(result);
});

// Delete a favorite movie
app.delete('/FavMovies/:id', async (req, res) => {

    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    const result = await FavMoviesCollection.deleteOne(query);
    

    res.send(result);

});


    

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Movie server is running');
});

app.listen(port, () => {
  console.log(`Movie server is running on port ${port}`);
});
