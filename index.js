const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middlware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejor6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("inglot");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");
    const usersCollection = database.collection("users");

    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    //get single product
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    //get user order
    app.get("/myOrder", async (req, res) => {
      const email = req.query.email;
      const filter = ordersCollection.find({ email: email });
      const result = await filter.toArray();
      res.send(result);
    });

    //get all reviews api
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/allOrders", async (req, res) => {
      const cursor = await ordersCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // add product post api
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });

    //add order post api
    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const result = await ordersCollection.insertOne(newOrder);
      res.json(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.post('/saveUser', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
        console.log(user);
    })

    app.put('/users/admin', async(req, res) => {
        const user = req.body;
        const filter = {email: user.email};
        const updateDoc = {
            $set: {
             role: 'admin'
            },
          };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
    })

    app.get('/users/admin/:email', async(req, res) => {
        const email = req.params.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        let isAdmin = false
        if(user?.role==='admin'){
           isAdmin = true
        }
        res.json({admin:isAdmin})
    })

    app.delete("/order/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    app.delete("/deleteProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });

    //udpate order status

    app.put("/updateOrderStatus/:id", async (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedStatus.status,
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/products/update/:id", async (req, res) => {
      const id = req.params.id;
      const productUpdate = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const {
        title,
        category,
        description,
        price,
        stock,
        rating,
        made,
        photo,
      } = productUpdate;
      const updateDoc = {
        $set: {
          title: title,
          category: category,
          description: description,
          price: price,
          stock: stock,
          rating: rating,
          made: made,
          photo: photo,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });


   




  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Inglot Hair Care Server Runnig...");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
