const {Usuario} = require('../Models/usuarios');
const {connectDB, closeDB} = require('../MongoDB/conecctionMongo');

async function obtenerUsuarioId(id){
    await connectDB();
    let usuario = await Usuario.findById(id,{__v:0});
    // console.log(usuario);
    if (usuario == null) {
        await closeDB();
        return undefined;
    } else {
        await closeDB();
        return usuario;
    }
    
}

async function obtenerUsuario(username){
    await connectDB();
    // console.log('username: ',username);
    let user = await Usuario.findOne({username: username},{__v:0});
    // console.log(user);
    if (user == null) {
        await closeDB();
        return undefined;
    } else {
        await closeDB();
        return user;
    }
}

function passwordValida(usuario, password){
    console.log(usuario.password, password);
    return usuario.password == password;
}

module.exports = {
    obtenerUsuarioId,
    passwordValida,
    obtenerUsuario
}