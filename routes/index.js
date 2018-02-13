var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", function(req, res){
    res.render("intro");
    // res.render("index");
})

router.get("/index", function(req, res){
    res.render("index");
})

router.get("/portfolio", function(req, res){
    res.render("portfolio");
});

router.get("/about", function(req, res){
    res.render("about");
});

router.get("/login", function(req, res){
    res.render("login")
})

router.post("/login", function(req, res, next){
    passport.authenticate("local", function(err, user, info){
        if(err) { console.log(err);
            return next(err); 
            
        }
        if(!user) {
            console.log(user);
            req.flash("error", "Неверное сочетание логин/пароль");
            return res.redirect("/login"); 
        }
        req.login(user, function(err){
            if(err) {
                console.log(err);
                return next(err);
                
            }
            var redirectTo = req.session.redirectTo ? req.session.redirectTo : "/index";
            delete req.session.redirectTo;
            req.flash("success", "Вы успешно зашли на сайт");
            res.redirect(redirectTo);
        })
    })(req, res, next);
});



router.get("/register", function(req, res){
    res.render("register")
})

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("register");
        } 
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Добро пожаловать " + user.username);
            res.redirect("/index");
        });
    });
});

router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Вы успешно вышли из учетной записи");
    res.redirect("/index");
})

router.get("*", function(req,res){
    res.render("404")
})

module.exports = router;