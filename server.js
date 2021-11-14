//import { Archivo } from './Archivo.js';

const {normalizar, desnormalizar} = require('./normalizador');
const { insertDocuments, readDocuments } = require('./Controllers/functionsCRUD-Mongo.js');
const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const advancedOptions = {useNewUrlParser: true, useUnifiedTopology: true};

const objProductos = [];
const objMensajes = [];
const usuarios = [];

app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'secreto',
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: { expires: 60000 },
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://admin:admin@cluster0.adopj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
        mongoOptions: advancedOptions
    })
}));

app.use(passport.initialize());
app.use(passport.session());

app.engine(
    "hbs",
    handlebars({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir: "./views/layouts",
        partialsDir: "./views/partials"
    })
);
    
app.set('views', './views'); // especifica el directorio de vistas
app.set('view engine', 'hbs'); // registra el motor de plantillas

http.listen(3030, async () => {
    

    let productosMongo = await readDocuments('producto');
    productosMongo.forEach(prod => {
        objProductos.push(prod);
    });

    let mensajesMongo = await readDocuments('mensajes');
    mensajesMongo.forEach(mens => {
        objMensajes.push(mens);
    });

    console.log('escuchando desde servidor. Puerto: 3030')} )


io.on ('connection', async (socket) => {
    console.log('Usuario conectado');

    socket.emit('productCatalog', { products: objProductos});
    socket.on('newProduct', async (data) => {
        insertDocuments(data,'producto');
        objProductos.push(data);
        normalizar(data);
        io.sockets.emit('productCatalog', { products: objProductos});
    });

    socket.on('login', async (data) => {
        console.log('object');
        window.location.href = "/listPoducts";
    });

    socket.emit('mensajes', objMensajes);
    socket.on('nuevo-mensaje', async (data)=>{
        insertDocuments(data,'mensaje');
        objMensajes.push(data);
        normalizar(data);
        io.sockets.emit('mensajes', objMensajes);
    });

});

// passport.use('login', new LocalStrategy({
//     passReqToCallback: true
// }, 
//     function (req, username, password, done) {
//         let usuario = obtenerUsuario(usuarios, username);
//         if (usuario == undefined) {
//             return done(null, false, console.log(username, 'usuario no existe'));
//         } else {
//             if (passwordValida(usuario, password)) {
//                 return done(null, usuario)  
//             } else {
//                 return done(null, false, console.log(username, 'password errónea'));
//             }
//         }
//     })
// );

app.get('/', (req,res)=>{
    req.session.user ? res.redirect('/listProducts') : res.render('login');
    
});

app.post('/login', (req,res) => {
    req.session.user=req.body.userName;
    if(req.session.user || req.session.user != ''){
        res.redirect('/listProducts');
    } else {
        res.redirect('/');
    }
});

app.get('/logout', (req,res) => {
    res.clearCookie('user');
    req.session.destroy()
    res.redirect('/');
});

app.get('/listProducts', (req,res)=>{
    //req.session.cookie.maxAge = 20000;
    console.log(req.session);
    if(req.session.user){
        res.render('products', { products: objProductos, userName: req.session.user});
    } else {
        res.redirect('/');
    }
});

app.get('/register', (req,res)=>{
    //req.session.cookie.maxAge = 20000;
    console.log("Entro a register");
    res.json("entro bien");
});


function checkAuthentication(req, res, next){
    if (req.isAuthenticated()){
        next();
    } else {
        res.redirect('/');
    }
}