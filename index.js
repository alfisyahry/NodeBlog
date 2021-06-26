const path = require('path');
const expressEdge = require('express-edge');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const app = new express();
const Post = require('./database/models/Post');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const connectFlash = require("connect-flash");
// const edge = require("edge.js");
const  Comment  = require("./database/models/Comment");

//require the http module
const http = require("http").Server(app)

// require the socket.io module
const io = require("socket.io")(http);
//create an event listener

//To listen to messages
io.on("connection", (socket)=>{
console.log("user connected");
});

mongoose.Promise = global.Promise;

const storePost = require('./middleware/storePost')
const auth = require("./middleware/auth");
const redirectIfAuthenticated = require('./middleware/redirectIfAuthenticated');

const createPostController = require('./controllers/createPost');
const homePageController = require('./controllers/homePage');
const storePostController = require('./controllers/storePost');
const getPostController = require('./controllers/getPost');
const createUserController = require("./controllers/createUser");
const storeUserController = require('./controllers/storeUser');
const loginController = require("./controllers/login");
const loginUserController = require('./controllers/loginUser');
const logoutController = require("./controllers/logout");



const mongoString = "mongodb://Admin:Admin123@alwi-blog-shard-00-00.inedb.mongodb.net:27017,alwi-blog-shard-00-01.inedb.mongodb.net:27017,alwi-blog-shard-00-02.inedb.mongodb.net:27017/Blog?ssl=true&replicaSet=atlas-ttphsm-shard-0&authSource=admin&retryWrites=true&w=majority"

mongoose.connect(mongoString, {useNewUrlParser: true, useUnifiedTopology: true})

mongoose.connection.on("error", function(error) {
  console.log(error)
})

mongoose.connection.on("open", function() {
  console.log("Connected to MongoDB database.")
})

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const mongoStore = connectMongo(expressSession);

app.use(expressSession({
    secret: 'secret',
    store: new mongoStore({
        mongooseConnection: mongoose.connection
    })
}));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(connectFlash());

app.use(express.static('public'));
app.use(fileUpload());
app.use(expressEdge.engine);
app.set('views', __dirname +'/views');

app.use('/posts/store', storePost)

//route
app.get("/", homePageController);
app.get("/post/:id", getPostController);
app.get("/posts/new", createPostController);
app.get('/auth/login', redirectIfAuthenticated, loginController);
app.get("/auth/register", redirectIfAuthenticated, createUserController);
app.get("/posts/new", auth, createPostController);
app.post("/posts/store", storePostController);
app.post("/users/register", redirectIfAuthenticated, storeUserController);
app.post('/users/login', redirectIfAuthenticated, loginUserController);
app.get("/auth/logout", redirectIfAuthenticated, logoutController);

app.use(expressSession({
    secret: 'secret'
}));

app.get('/', async (req, res) => {
    const posts = await Post.find({})
    res.render('index', {
        posts
    })
});
app.get('/about.html', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'pages/about.html'));
});
app.get('/contact.html', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'pages/contact.html'));
});
app.get('/post.html', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'pages/post.html'));
});

app.get('/posts/new', (req, res) => {
    res.render('create')
});
app.post("/posts/store", (req, res) => {
    const {
        image
    } = req.files

    image.mv(path.resolve(__dirname, 'public/posts', image.name), (error) => {
        Post.create({
            ...req.body,
            image: `/posts/${image.name}`
        }, (error, post) => {
            res.redirect('/');
        });
    })
});
app.post('/posts/store', (req, res) => {
    Post.create(req.body, (error, post) => {
        res.redirect('/')
    })
});
app.get('/post/:id', async (req, res) => {
    const post = await Post.findById(req.params.id)
    if (err) {
        console.log(err);
      } else {
        Comments.find({'postId':req.params.id}, function (err, comments) {
        res.render('post', {
            post
        })
        })
}
});

io.on('connection',function(socket){
    socket.on('comment',function(data){
        var commentData = new Comments(data);
        commentData.save();
        console.log(commentData);
        socket.broadcast.emit('comment',data);  
    });
 
});

// app.use('*', (req, res, next) => {
//     edge.global('auth', req.session.userId)
//     next()
// });//


app.listen(4000, () => {
    console.log('App listening on port 4000')
}); 
 
 
 
