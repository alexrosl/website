var express = require("express");
var router  = express.Router();
var Publication = require("../models/publication");
var middleware = require("../middleware");

router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(middleware.escapeRegex(req.query.search), "gi");
        Publication.find({$or:[{name: regex},{link:regex},{description:regex}]} , function(err, allPublications){
            if (err){
                console.log(err);
            } else {
                if(allPublications.length < 1){
                    noMatch = "Не найдено публикаций по строке " + middleware.escapeRegex(req.query.search);
                }
                res.render("publications/index", {publications: allPublications, noMatch: noMatch});
            }
        })    
    } else {
        Publication.find({}, function(err, allPublications){
            if(err){
                console.log(err);
                return res.redirect("back")
            }
            else {
                res.render("publications/index", {publications: allPublications, noMatch: noMatch});
            }
        })
    }
});

router.post("/", middleware.isLoggedIn, function(req, res){
    Publication.create(req.body.publication, function(err, createdPublication){
        if(err){
            console.log(err);
            req.flash("error", "Не удалось добавить новую публикацию");
            return res.redirect("/publications");
        } else {
            req.flash("success", "Вы успешно добавили новую публикацию");
            res.redirect("/publications");
        }
    });
});

router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("publications/new");
});

router.get("/:id/edit", middleware.isLoggedIn, function(req, res){
    Publication.findById(req.params.id, function(err, foundPublication){
        if(err){
            console.log(err);
            res.redirect("/publications");
        }
        else {
            res.render("publications/edit", {publication: foundPublication});
        }
    });
});

router.put("/:id", middleware.isLoggedIn, function(req, res){
    Publication.findByIdAndUpdate(req.params.id, req.body.publication, function(err, updatedPublication){
        if(err){
            console.log(err);
            req.flash("error", "Не удалось обновить публикацию");
            res.redirect("/publications");
        } else {
            req.flash("success", "Вы успешно обновили публикацию");
            res.redirect("/publications");
        }
    });
});

router.delete("/:id", middleware.isLoggedIn, function(req, res){
    Publication.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            req.flash("error", "Не удалось удалить публикацию");
            res.redirect("/publications");
        } else {
            req.flash("success", "Вы успешно удалили публикацию");
            res.redirect("/publications");
        }
    });
});

module.exports = router;