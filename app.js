var express             = require("express"),
    app                 = express(),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    morgan              = require("morgan"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    methodOverride      = require("method-override"),
    moment              = require('moment'),
    Album               = require("./models/album"),
    Category            = require("./models/category"),
    Material            = require("./models/material"),
    Publication         = require("./models/publication"),
    User                = require("./models/user")
    
//routes
var albumRoutes         = require("./routes/album"),
    indexRoutes         = require("./routes/index"),
    linksRoutes         = require("./routes/links"),
    materialsRoutes     = require("./routes/materials"),
    publicationsRoutes  = require("./routes/publications")
    
mongoose.connect("mongodb://localhost/web");
app.use(morgan('dev')); // logging every request
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//Passport configuration
app.use(require("express-session")({
    secret: "secret code",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error= req.flash("error");
    res.locals.success= req.flash("success");
    res.locals.moment = moment;
    next();
});


app.use("/album", albumRoutes);
app.use("/links", linksRoutes);
app.use("/materials", materialsRoutes);
app.use("/publications", publicationsRoutes);
app.use("/", indexRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started");
})