const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const houseRoutes = require('./routes/house.routes');
require('dotenv').config({ path: './config/.env' });
require('./config/db');
const {checkUser, requireAuth} = require('./middleware/auth.middleware');
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//JWT
app.get('*', checkUser);
app.get('/jwtid', requireAuth, (req, res)=> {
    res.status(200).send("User id logged: " + res.locals.user._id);
});

//Routes
app.use('/api/user', userRoutes);
app.use('/api/house', houseRoutes);


// Start du Serveur
app.listen(process.env.PORT, () => {
    console.log(`En écoute sur le Port ${process.env.PORT}`);
})