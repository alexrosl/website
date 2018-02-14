var express = require("express");
var router  = express.Router();
var Link = require("../models/link");
var middleware = require("../middleware")

router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(middleware.escapeRegex(req.query.search), "gi");
        Link.find({$or:[{name: regex},{link:regex},{description:regex}]} , function(err, allLinks){
            if (err){
                console.log(err);
            } else {
                if(allLinks.length < 1){
                    noMatch = "Не найдено ссылок с названием " + middleware.escapeRegex(req.query.search);
                }
                res.render("links/index", {links: allLinks, noMatch: noMatch});
            }
        }); 
    } else {
        Link.find({}, function(err, allLinks){
            if(err){
                console.log(err);
                return res.redirect("back");
            }
            else {
                res.render("links/index", {links: allLinks, noMatch: noMatch});
            }
        });
    }
});

router.post("/", middleware.isLoggedIn, function(req, res){
    Link.create(req.body.link, function(err, createdLink){
        if(err){
            console.log(err);
            return res.redirect("/links");
        } else {
            if ((createdLink == null) || (createdLink == undefined)){
                return res.redirect("/links");
            }
            req.flash("success", "Вы успешно добавили новую ссылку");
            res.redirect("/links");
        }
    });
});

router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("links/new");
})

router.get("/:id/edit", middleware.isLoggedIn, function(req, res){
    Link.findById(req.params.id, function(err, foundLink){
        if(err){
            console.log(err);
            res.redirect("/links");
        }
        else {
            if ((foundLink == null) || (foundLink == undefined)){
                return res.redirect("/links")
            }
            res.render("links/edit", {link: foundLink});
        }
    })
})

router.put("/:id", middleware.isLoggedIn, function(req, res){
    Link.findByIdAndUpdate(req.params.id, req.body.link, function(err, updatedLink){
        if(err){
            console.log(err);
            res.redirect("/links");
        } else {
            if ((updatedLink == null) || (updatedLink == undefined)){
                return res.redirect("/links")
            }
            req.flash("success", "Вы успешно обновили ссылку");
            res.redirect("/links")
        }
    })
})

router.delete("/:id", middleware.isLoggedIn, function(req, res){
    Link.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            req.flash("error", "Не удалось удалить ссылку");
            res.redirect("/links")
        } else {
            req.flash("success", "Вы успешно удалили ссылку");
            res.redirect("/links")
        }
    })
})



module.exports = router;