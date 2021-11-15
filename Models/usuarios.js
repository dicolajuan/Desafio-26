let mongoose = require('mongoose');
const usuariosCollection = 'usuarios';

const UsuarioEsquema = mongoose.Schema({
    username: {type: String, require: true, unique: true},
    password: {type: String, require: true}
});

const Usuario = mongoose.model(usuariosCollection, UsuarioEsquema);

module.exports = { Usuario };