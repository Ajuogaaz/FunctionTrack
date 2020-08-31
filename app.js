const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const port = 3000;
const dateModule = require(__dirname + "/date.js")

const items = ["Buy Food", "Cook Food", "Eat Food" ];
const workItems = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended : true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true,  useUnifiedTopology: true });

const itemSchema = mongoose.Schema({

    name : String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({name : "Buy Food"});
const item2 = new Item({ name : "Eat food"});
const item3 = new Item({ name : "Sell Food"});

app.get("/" , (req, res) =>{

    Item.find( (err, foundItems) => {
        if(err){
            console.log(err);
        }else{
            if(!foundItems.length){
                Item.insertMany([item1, item2, item3], (err) => {
                    if(err){
                        console.log(err);
                    }else{
                        console.log("success adding to db");
                    }
                });
                res.redirect("/");
            }else {
                res.render("list", {listTittle : "Today", items : foundItems});
            }

        }
    });

});

app.post("/", (req, res) => {

    if(req.body.list === "Work"){
        workItems.push(req.body.listItems);
        res.redirect("/work");
    }else{
        const item = new Item({name : req.body.listItems});
        console.log(item);
        item.save();
        res.redirect("/");
    }


});

app.post("/delete", (req, res) => {
    const deleteItem =  req.body.checkbox;
    Item.findByIdAndDelete(deleteItem, (err) =>{
        if(err){
            console.log(err);
        }else{
            console.log("success");
            res.redirect("/")
        }

    });

});

app.get("/:topic", (req, res) => {
    res.render("list", {listTittle: req.params.paramName, items: workItems});
});

app.post("/work", (req, res) => {
    workItems.push(req.body.listItems);
    res.redirect("/work");
});

app.get("/about", (req, res) =>{
    res.render("about");
})

app.listen(process.env.PORT ||port,  () =>{
    console.log(`listening at http://localhost:${port}`);
});