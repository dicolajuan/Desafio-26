const {Producto} = require('../Models/productos');
const {Mensaje} = require('../Models/mensajes');
const {Usuario} = require('../Models/usuarios');
const {connectDB, closeDB} = require('../MongoDB/conecctionMongo');


const insertDocuments = async (obj,collection) => {
    await connectDB();
    switch (collection) {
        case 'productos':
            await Producto.insertMany(obj);
            break;
        case 'mensajes':
            await Mensaje.insertMany(obj);
            break;
        case 'usuarios':
            await Usuario.insertMany(obj);
            break;
        default:
            break;
    }
    await closeDB();
}

// const readDocuments = async (collection) => {
//     await connectDB();
//     let arrayDocuments = collection == 'producto' ? await Producto.find({},{_id:0, __v:0}) : await Mensaje.find({},{_id:0, __v:0});
//     //await Producto.insertMany({title:'new product 2', price:100,thumbnail: 'images'});
//     await closeDB();
//     return arrayDocuments;
// }

const readDocuments = async (collection) => {
    await connectDB();
    let arrayDocuments = [];
    switch (collection) {
        case 'productos':
            arrayDocuments = await Producto.find({},{_id:0, __v:0});
            break;
        case 'mensajes':
            arrayDocuments = await Mensaje.find({},{_id:0, __v:0});
            break;
        case 'usuarios':
            arrayDocuments = await Usuario.find({},{_id:0, __v:0});
            break;
        default:
            break;
    }
    await closeDB();
    return arrayDocuments;
}

const readOneDocument = async (collection, ...rest) => {
    await connectDB();
    let arrayDocuments = [];
    switch (collection) {
        case 'productos':
            arrayDocuments = await Producto.find({},{_id:0, __v:0});
            break;
        case 'mensajes':
            arrayDocuments = await Mensaje.find({},{_id:0, __v:0});
            break;
        case 'usuarios':
            arrayDocuments = await Usuario.findOne({username:rest[0]},{__v:0});
            break;
        default:
            break;
    }
    await closeDB();
    return arrayDocuments;
}

module.exports = { insertDocuments, readDocuments, readOneDocument };
