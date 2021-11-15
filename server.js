//import { Archivo } from './Archivo.js';

const {normalizar, desnormalizar} = require('./normalizador');
const { insertDocuments, readDocuments, readOneDocument } = require('./Controllers/functionsCRUD-Mongo.js');
const routes = require('./routes');
const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { obtenerUsuarioId, passwordValida, obtenerUsuario } = require('./utils/util');
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
    

    let productosMongo = await readDocuments('productos');
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
        insertDocuments(data,'productos');
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

passport.use('login', new LocalStrategy({
    passReqToCallback: true
}, 
    async function (req, username, password, done) {
        let usuario = await obtenerUsuario(username);
        if (usuario == undefined) {
            return done(null, false, console.log(username, 'usuario no existe'));
        } else {
            if (passwordValida(usuario, password)) {
                return done(null, usuario)  
            } else {
                return done(null, false, console.log(username, 'password errónea'));
            }
        }
    })
);

passport.use('signup', new LocalStrategy({
    passReqToCallback: true
},
    async function(req, username, password, done) {
        let usuario = await readOneDocument('usuarios',username);
        if (usuario != null){
            return done(null, false, console.log(username, 'Usuario ya existe'));
        } else {
            let user = {
                username: username,
                password: password
            }
            await insertDocuments(user,'usuarios');
            let usuarioMongo = await readOneDocument('usuarios',username);
            console.log(user,usuarioMongo._id.toString());
            return done(null, usuarioMongo);
        }
    }
));

passport.serializeUser((user, done)=>{
    done(null, user._id);
});

passport.deserializeUser(async(id, done)=>{
    let user = await obtenerUsuarioId(id);
    done(null, user);
});

app.get('/', checkAuthentication, routes.getInicio);
app.get('/home', (req,res) => {
    res.render('products', { products: objProductos, userName: req.user.username});
});

app.get('/register', routes.getRegister);
app.post('/register', passport.authenticate('signup', {failureRedirect:'/falloRegister'}), routes.postRegister);
app.get('/falloRegister', routes.getRegisterFail);

app.get('/login', routes.getLogin);
app.post('/login', passport.authenticate('login', {failureRedirect: '/failLogin'}), routes.postLogin);
app.get('/failLogin', routes.getFailLogin);

app.get('/logout', routes.getLogout);

function checkAuthentication(req, res, next){
    if (req.isAuthenticated()){
        next();
    } else {
        res.redirect('/login');
    }
}