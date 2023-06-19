const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/listDB");

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your do do list"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delet N ITEM"
});


const defaultItems = [item1 , item2 , item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if (err){
                    console.log(err);
                } else{
                    console.log("successfully added");
                }
            });

            res.redirect("/");

        } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }

    });


    // var currentDay = today.getDay();
    // var day = "";

    // switch (currentDay) {
    //     case 0:
    //         day = "Sunday";
    //         break;
    //     case 1:
    //         day = "Monday";
    //         break;
    //     case 2:
    //         day = "Tuesday";
    //         break;
    //     case 3:
    //         day = "Wednesday";
    //         break;
    //     case 4:
    //         day = "Thursday";
    //         break;
    //     case 5:
    //         day = "Friday";
    //         break;
    //     case 6:
    //         day = "Saturday";
    //         break;
    //     default:
    //         console.log("Error: Current day is equal to " + currentDay);
    // }

    // if (today.getDay() == 6 || today.getDay()==0){
    //     day = today.getDay();

    //     // day = "Weekend";

    //     // res.render("list", {kindOfDay: day});

    //     // res.send("Yay, it's the weekend!");
    // }
    // else{
    //     day = today.getDay();

    //     // day = "Weekday";

    //     // res.render("list", {kindOfDay: day});

    //     // res.send("Boo! I have to work!");
    //     // res.sendFile(__dirname+ "/index.html");
    // }
});

app.get("/:customListName", function(req, res){
    const customListName = req.params.customListName; 

     List.findOne({name: customListName}, function(err, foundList){
        if(!err){
           if(!foundList){
            //Create a new list
            const list = new List({
                name: customListName,
                items: defaultItems
            });
        
            list.save();
            res.redirect("/")

           } else {
            //Show an existing list
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
           }
        }
     });

    



});

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;

    Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err){
            console.log("successfully deleted checked item");
            res.redirect("/");
        }

    })
})

// app.post("/work", function(req, res){
//     let item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// });


app.get("/about", function(req, res){
    res.render("about");
})

app.listen(3000, function () {
    console.log("Server is started at Port 3000");
});