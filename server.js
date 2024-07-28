const {list_databases, get_product_details, get_products_by_category, get_categories, get_products_by_categories, get_cart_by_userid, update_cart, get_user_details, update_user} = require('./db.js')
const {MongoClient} = require('mongodb')
const express = require('express')
const app = express()

var authRouter = require('./auth')

app.use('/', authRouter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use('/styles', express.static('styles'));

const client = new MongoClient("mongodb://localhost:27017/")

//connect to database here
async function main(){

    //STEP 1) INIT THE DB DRIVER
    try{
        await client.connect()
        await list_databases(client)
    } catch(e){
        console.log(e)
        return;
    }

    app.get('/', (req, res) => {
        get_categories(client).then((categories) => {
            console.log(categories)
            get_products_by_categories(client, categories).then(
                (output) => {
                    console.log(output)
                    res.render('index', {categories:output})
                }
            )
        })
    });

    app.get('/product', (req, res) => {
        console.log(req.query.id)
        get_product_details(client, Number(req.query.id)).then(
            (product) => {
                res.render('product_page', {product: product})
            }
        )
    });


    app.get('/register', (req, res) => {
        res.render('register')
    });


    //carts - get the cart for that specific user
    app.get('/cart', (req, res) => {
        id = Number(req.query.id)
        get_cart_by_userid(client, id).then(
            (products_list) => {
                res.render('cart', {products_list: products_list, user_id: id})
            }
        )
    });
    
    app.post('/update_cart', async (req, res) => {
        const {user_id, prod_id, new_quantity} = req.body;
        console.log(user_id, prod_id, new_quantity)
        let x = await update_cart(client, user_id, prod_id, new_quantity)
        res.status(x).send();
    });

    app.get('/user', (req, res) => {
        get_user_details(client, "1").then(
        (result) => {
            res.render("user", {user_details : result})
        })
    });

    app.post('/update_user', (req, res) => {
        update_user(client, req.body).then(
            (val) => {
                res.status(val).send()
            }
        )
        res.redirect(req.header('Referer')) //redirect back to /user after update?
    });


    app.get('/test', (req, res) => {
        get_user_details(client, "1").then(
        (result) => {
            console.log(result)
        })
    });

    app.listen(8000)
}

main().catch(console.error);