const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const port = 3000;
const dateModule = require(__dirname + "/date.js")

const items = ["Buy Food", "Cook Food", "Eat Food" ];
const workItems = [];
const _ = require("lodash");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended : true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-linus:Test123@cluster0.auhfn.azure.mongodb.net/todolistDB", { useNewUrlParser: true,  useUnifiedTopology: true });

const itemSchema = mongoose.Schema({

    name : String
});

const ListSchema = mongoose.Schema({
    name : String,
    items : [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);

const List = mongoose.model("List", ListSchema);

const item1 = new Item({name : "Buy Food"});
const item2 = new Item({ name : "Eat food"});
const item3 = new Item({ name : "Sell Food"});
const defaultItems = [item1, item2, item3];

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

    const item = new Item({name : req.body.listItems});
    listName = req.body.list;

    if(req.body.list === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name : listName}, (err, response) => {
            response.items.push(item);
            response.save();
            res.redirect("/" + listName);
        });
    }


});

app.post("/delete", (req, res) => {
    const deleteItem =  req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndDelete(deleteItem, (err) =>{
            if(err){
                console.log(err);
            }else{
                console.log("success");
                res.redirect("/")
            }

        });
    }else{
        List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : deleteItem}}}, (err) => {
            if(err){
                console.log(err);
            }else{
                res.redirect("/" + listName);
            }
        });
    }



});

app.get("/:topic", (req, response) => {

    const route = _.capitalize(req.params.topic);
    const topicItems = [];

    List.findOne({name : route}, (err, res) => {

        if(!err){
            if(res){
                response.render("list", {listTittle: res.name, items: res.items});
            }else{
                const list = new List({
                    name : route,
                    items : defaultItems
                });
                list.save();
                response.redirect("/" + route);
            }
        }else{
            console.log(err);
        }
    });

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