
function getInicio(req,res){
    res.redirect('/home');
}

function getHome(){
    console.log(req.user);
    res.render('products', { products: objProductos, userName: req.user.username});
}

function getLogin(req, res){
    if (req.isAuthenticated()){
        let user = req.user;
        console.log('Usuario logueado');
        res.json(user);
    } else {
        console.log('Usuario no logueado');
        res.render('login');
    }
}

function postLogin (req,res) {
    res.redirect('/home');
}

function getFailLogin (req,res){
    res.render('loginFail');
}

function getRegister(req,res){
    res.render('register');
}

function postRegister(req,res){
    res.json(req.user);
}

function getRegisterFail(req,res) {
    res.render('registerFail');
}

function getLogout (req,res) {
    req.logout();
    res.redirect('/');
}

module.exports = {
    getInicio,
    getLogin,
    postLogin,
    getFailLogin,
    getRegister,
    postRegister,
    getRegisterFail,
    getHome,
    getLogout
}