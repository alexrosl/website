var express = require("express");
var multer = require("multer");
var router  = express.Router();
var Album = require("../models/album");
var middleware = require("../middleware")

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname );
  }
});
var upload = multer({storage: storage}).single("image");

router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(middleware.escapeRegex(req.query.search), "gi");
        Album.find({$or:[{name: regex},{description:regex}]} , function(err, allImages){
            if (err){
                console.log(err);
            } else {
                if(allImages.length < 1){
                    noMatch = "Не найдено изображений с названием " + middleware.escapeRegex(req.query.search);
                }
                res.render("album/index", {album: allImages, noMatch: noMatch});
            }
        })    
    } else {
        Album.find({}, function(err, allImages){
            if(err){
                console.log(err);
                return res.redirect("back")
            }
            else {
                res.render("album/index", {album: allImages, noMatch: noMatch});
            }
        })
    }
});

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("album/new");
});

router.post("/", middleware.isLoggedIn, function(req, res){
    upload(req, res, function(err){
        if(err) {
            console.log(err);
            return res.send("error uploading file");
        }
        // console.log(req.file);
        // console.log(req);
        var name = req.body.name;
        if(typeof req.file !== "undefined"){
            var image = "/uploads/" + req.file.filename;
        } else {
            var image = "/uploads/no-image.png"
        }
        
        var description = req.body.description;
        var newImage = {name: name, image: image, description: description};
        
        Album.create(newImage, function(err, createdImage){
            if(err){
                console.log(err);
                req.flash("error", "Не удалось добавить новое изображение");
                return res.redirect("/album");
            } else {
                req.flash("success", "Вы успешно добавили новое изображение");
                res.redirect("/album");
            }
        });
    });
    
    
    
});

router.get("/:id", function(req, res){
    Album.findById(req.params.id, function(err, foundImage){
        if(err){
            console.log(err);
            res.redirect("/album");
        } else {
            if ((foundImage == null) || (foundImage == undefined)){
                return res.redirect("/album")
            }
            res.render("album/show", {image: foundImage});
        }
    });
});

router.get("/:id/edit", middleware.isLoggedIn, function(req, res){
    Album.findById(req.params.id, function(err, foundImage){
        if(err){
            console.log(err);
            res.redirect("/album");
        }
        else {
            if ((foundImage == null) || (foundImage == undefined)){
                return res.redirect("/album")
            }
            res.render("album/edit", {image: foundImage});
        }
    });
});

router.put("/:id", middleware.isLoggedIn, function(req, res){
    upload(req, res, function(err){
        if(err){
            console.log(err);
            req.flash("error", "Не удалось загрузить файл");
            return res.redirect("/album");
        }
        if (req.body.removeImage){
            req.body.image.image = "/uploads/no-image.png";
        } else if (req.file){
            req.body.image.image = "/uploads/" + req.file.filename;
        }
        
        Album.findByIdAndUpdate(req.params.id, req.body.image, function(err, updatedImage){
            if(err){
                console.log(err);
                req.flash("error", "Не удалось изменить изображение");
                res.redirect("/album");
            } else {
                if ((updatedImage == null) || (updatedImage == undefined)){
                    return res.redirect("/album")
                }
                req.flash("success", "Вы успешно изменили изображение");
                res.redirect("/album/" + req.params.id);
            }
        });
    })
    
});

router.delete("/:id", middleware.isLoggedIn, function(req, res){
    Album.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect("/album")
        } else {
            req.flash("success", "Вы успешно удалили изображение");
            res.redirect("/album")
        }
    })
})

module.exports = router;