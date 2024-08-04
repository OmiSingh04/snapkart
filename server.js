const {list_databases, get_product_details, get_products_by_category, get_categories, get_products_by_categories, get_cart_by_userid, update_cart, get_user_details, update_user, get_user_by_name, init, get_all_products, add_to_cart} = require('./db.js')

const express = require('express')
var logger = require('morgan');
const app = express()
const path = require('path')

var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');

var SQLiteStore = require('connect-sqlite3')(session);

var authRouter = require('./auth')

app.use(logger('dev'))
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));
app.use(passport.authenticate('session'));

app.use('/', authRouter)
app.use(express.json())
app.set('view engine', 'ejs')
app.use('/styles', express.static('styles'));


const authenticated = (req, res, next) => {
    console.log("BROOOOOO")
    if(req.isAuthenticated())
        next();
    else
        res.redirect('/login')
}


//connect to database here
async function main(){


    app.get('/', (req, res) => {
        get_categories().then((categories) => {
            console.log(categories)
            get_products_by_categories(categories).then(
                (output) => {
                    res.render('index', {categories:output, user : req.user})
                }
            )
        })
    });

    app.get('/product', (req, res) => {
        get_product_details(Number(req.query.id)).then(
            (product) => {
                if(req.isAuthenticated()){
                    get_cart_by_userid(req.user.id).then(
                        (cart_list) => {
                            res.render('product_page', {product: product, user : req.user, cart_list: cart_list, user_id: req.user.id})
                        }
                    )
                }
                else{
                    res.render('product_page', {product: product, user : req.user})
                }
            }
        )
    });


    app.get('/register', (req, res) => {
        res.render('register')
    });


    //carts - get the cart for that specific user

    app.get('/cart', authenticated, (req, res) => {
        user = req.user;
        console.log(user)
        get_cart_by_userid(user.id).then(
            (products_list) => {
                res.render('cart', {products_list: products_list, user_id: user.id, user: req.user})
            }
        )
    });

    app.get('/user', authenticated, (req, res) => {
        user = req.user;
        get_user_details(user.id).then(
        (result) => {
            res.render("user", {user_details : result})
        })
    });

    app.post('/update_cart', async (req, res) => {
        const {user_id, prod_id, new_quantity} = req.body;
        console.log(user_id, prod_id, new_quantity)
        let x = await update_cart(user_id, prod_id, new_quantity)
        res.status(x).send();
    });

    app.post('/update_user', (req, res) => {
        update_user(req.body).then(
            (val) => {
                res.status(val).send()
            }
        )
        res.redirect(req.header('Referer')) //redirect back to /user after update?
    });


    app.get('/get_all_products', async (req, res) => {
        try{
            let products = await get_all_products();
            res.json(products);
        }catch(error){
            res.status(500).json({error : "Failed to fetch data"})
        }
    });

    app.post('/add_to_cart'), authenticated, async (req, res) => {
        console.log(req)
        try{
            const { userId, prodId } = req.body;
            console.log({ userId, prodId });
            if (!userId || !prodId) {
                return res.status(400).json({ error: 'userId and prodId are required' });
            }
            add_to_cart(userId, prodId).then(
                (val) => res.status(200).json({success : "seems aight here boss"})
            )
        } catch(error){
            res.status(500).json({error : "Failed to fetch data"})
        }
    }

    app.listen(6969)
}


init().then(
    (val) => {
        if(val)
            main().catch(console.error);
        else{
            console.log("FAILED")
            return
        }
    }
)