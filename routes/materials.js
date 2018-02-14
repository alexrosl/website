var express = require("express");
var router  = express.Router();
var Category = require("../models/category");
var Material = require("../models/material");
var middleware = require("../middleware");
var multer = require("multer");

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname );
  }
});
var upload = multer({storage: storage}).any("image", 5);


router.get("/", function(req, res){
    Category.find({}).populate("materials").exec(function(err, allCategories){
            if(err){
                console.log(err);
                return res.redirect("back");
            }
            else {
                console.log(allCategories);
                res.render("materials/index", {categories: allCategories});
            }
    }) ;   
});

router.get("/category/:id", function(req, res){
    Category.findById(req.params.id).populate("materials").exec(function(err, foundCategory){
        if(err){
            // console.log(foundCategory);
            console.log(err);
            req.flash("error", "не удалось получить информацию о категории");
            return res.redirect("back");
        } else {
            console.log(foundCategory);
            Category.find({}, function(err, allCategories){
                if(err){
                    console.log(err);
                    return res.redirect("back");
                }
                else {
                    if ((foundCategory == null) || (foundCategory == undefined)){
                        return res.redirect("/materials")
                    }
                    
                    res.render("categories/show", {category: foundCategory, categories: allCategories});
                }
            });
        }
    });
});

router.get("/category/:category_id/material/:material_id", function(req, res){
    Category.findById(req.params.category_id, function(err, foundCategory){
        if(err){
            console.log(err);
            req.flash("error", "не удалось получить информацию о категории")
        } else {
            Material.findById(req.params.material_id, function(err, foundMaterial){
                if(err){
                    console.log(err);
                    req.flash("error", "Не удалось получить информацию о материале")
                } else {
                    res.render("materials/show", {category: foundCategory, material: foundMaterial})
                }
            })
        }
    })
})

router.get("/category/new", middleware.isLoggedIn, function(req, res){
    res.render("categories/new");
});

router.get("/category/:id/new", middleware.isLoggedIn, function(req, res){
    Category.findById(req.params.id, function(err, foundCategory){
        if(err){
            console.log(err);
            req.flash("error", "не удалось загрузить страницу добавления материала в категорию");
        } else {
            console.log(foundCategory);
            res.render("materials/new", {category: foundCategory});
        }
    });
});

router.get("/category/:id/edit", middleware.isLoggedIn,  function(req, res){
    Category.findById(req.params.id, function(err, foundCategory){
        if(err){
            console.log(err);
            req.flash("error", "не удалось загрузить страницу изменения категории");
        } else {
            res.render("categories/edit", {category: foundCategory});
        }
    });
});

router.get("/category/:category_id/material/:material_id/edit", middleware.isLoggedIn, function(req, res){
    Category.findById(req.params.category_id, function(err, foundCategory){
        if(err){
            console.log(err);
            req.flash("error", "не удалось получить информацию о категории");
            res.redirect("/materials");
        } else {
            // console.log(foundCategory)
            Material.findById(req.params.material_id, function(err, foundMaterial){
                if(err){
                    console.log(err);
                } else {
                    res.render("materials/edit", {category: foundCategory, material: foundMaterial});
                }
            });
        }
    });
});

router.post("/category", middleware.isLoggedIn, function(req, res){
    Category.create(req.body.category, function(err, createdCategory){
        if(err){
            console.log(err);
            req.flash("error", "Не удалось добавить новую категорию");
            return res.redirect("/materials");
        } else {
            req.flash("success", "Вы успешно добавили новую категорию");
            res.redirect("/materials");
        }
    });
});

router.post("/category/:id/material", middleware.isLoggedIn, function(req, res){
    Category.findById(req.params.id, function(err, foundCategory){
       if(err){
           console.log(err);
           req.flash("не удалось найти категорию");
           res.redirect("/materials");
       } else {
           upload(req, res, function(err){
                if(err) {
                    console.log(err);
                    req.flash("не удалось загрузить изображение");
                    return res.redirect("/materials/category/" + req.params.id);
                }
                // console.log(req.file);
                var name = req.body.name;
                
                var images = [];
                if((typeof req.files !== "undefined") && (req.files.length)){
                    for(var i = 0; i < req.files.length; i++){
                        images.push("/uploads/" + req.files[i].filename);
                    }
                } else {
                    images.push("/uploads/no-image.png");
                }
                
                var description = req.body.description;
                var content = req.body.content;
                
                var newMaterial = {name: name, images: images, description: description, content: content};
                
                Material.create(newMaterial, function(err, createdMaterial){
                    if(err){
                        console.log(err);
                        req.flash("error", "Не удалось добавить новый материал");
                        return res.redirect("/materials/category/"+foundCategory._id);
                    } else {
                        foundCategory.materials.push(createdMaterial._id);
                        foundCategory.save();
                        req.flash("success", "Вы успешно добавили новый материал");
                        res.redirect("/materials/category/"+foundCategory._id);
                    }
                });
        });
       }
    });
});

router.put("/category/:id/", middleware.isLoggedIn,  function(req, res){
    Category.findByIdAndUpdate(req.params.id, req.body.category, function(err, updatedCategory){
        if(err){
            console.log(err);
            req.flash("не удалось обновить информацию о категории");
            res.redirect("/materials");
        } else {
            req.flash("success", "Вы успешно обновили информацию о категории");
            res.redirect("/materials");
        }
    });
});

router.put("/category/:category_id/material/:material_id", middleware.isLoggedIn, function(req, res){
      upload(req, res, function(err){
      if(err){
          console.log(err);
          req.flash("error", "не удалось загрузить изображения");
          return res.redirect("back");
      }
      //   console.log(req);
      Material.findByIdAndUpdate(req.params.material_id, req.body.material, function(err, updatedMaterial){
            if(err){
                console.log(err);
                req.flash("error", "не удалось обновить материал");
                res.redirect("back");
            } else {
                // console.log("===== removals ====")
                // console.log(req.body.removals);
                //Добавляем в массив вновь загруженные
                if(req.files.length){
                    for(var i = 0; i< req.files.length; i++){
                        updatedMaterial.images.push("/uploads/"+req.files[i].filename);
                    }
                    updatedMaterial.save();
                }
                
                //Удаляем помеченные на удаление изображения
                if(req.body.removals && req.body.removals.length){
                    for(var i = 0; i < req.body.removals.length; i++){
                        var index =  updatedMaterial.images.indexOf(req.body.removals[i]);
                        updatedMaterial.images.splice(index, 1);
                    }
                    updatedMaterial.save();
                }
                //если ранее было пустое изображение, то при добавлении нового удаляем его
                if(updatedMaterial.images.length > 1 && updatedMaterial.images.indexOf("/uploads/no-image.png") !== -1){
                    updatedMaterial.images.splice("/uploads/no-image.png",1);
                    updatedMaterial.save();
                }
                //если были удалены все изображения
                if(updatedMaterial.images.length === 0) {
                    updatedMaterial.images.push("/uploads/no-image.png");
                    updatedMaterial.save();
                }
                res.redirect("/materials/category/" + req.params.category_id);
            }
      });
    });
});

router.delete("/category/:id", middleware.isLoggedIn,  function(req, res){
    Category.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log("мы здесь");
            console.log(err);
            req.flash("error", "Не удалось удалить категорию");
            res.redirect("/materials");
        } else {
            req.flash("success", "Вы успешно удалили категорию");
            res.redirect("/materials");
        }
    });
});

router.delete("/category/:category_id/material/:material_id", middleware.isLoggedIn, function(req, res){
    Material.findByIdAndRemove(req.params.material_id, function(err){
        if(err){
            req.flash("error", "не удалось удалить материал");
            res.redirect("back");
        } else {
            req.flash("success", "материал успешно удален");
            res.redirect("back");
        }
    });
});


module.exports = router;