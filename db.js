//all required crud operations are here
async function list_databases(client){
    databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

async function get_product_details(client, id){
    //get the product details from the id   
    let result = await client.db("snapkart").collection("products").findOne({prod_id : id})
    return result
}

async function get_user_details(client, id){
    id = Number(id)
    //get the product details from the id   
    let result = await client.db("snapkart").collection("users").findOne({id : id})
    return result
}

async function update_user(client, body){

    console.log(body)

    body.id = Number(body.id)
    body.address.number = Number(body.address.number)
    body.__v = Number(body.__v)

    body.address.geolocation = body.geolocation
    delete body.geolocation

    body.address = {
        geolocation: body.address.geolocation,
        city : body.address.city,
        street : body.address.street,
        number : body.address.number,
        zipcode : body.address.zipcode
    }

    delete body._id

    filter = {id : body.id}

    console.log(filter)

    body = {
        $set : body
    }
    console.log("HEY IM IN")
    console.log(body)
    console.log("HEY IM IN")
    let status = 404
    try{
        let result = await client.db("snapkart").collection("user").findOneAndUpdate(filter, body, { returnDocument: 'after' })
        if (!result.value) {
            console.log('No document matched the filter.');
        } else {
            console.log("Document updated");
            status = 200;
        }
    } catch(err){
        console.log('User not updated:', err);
    }

    return status
}

async function get_products_by_category(client, category){
    //get details of all products in this category
    const result = await client.db("snapkart").collection("products").find(
        {
            category : { $eq: category }
        }).limit(5).toArray()

    return result
}

async function get_categories(client){
    //get a list of all available categories
    const result = await client.db("snapkart").collection("categories").find().toArray()
    return result.map(
        (obj) => obj.category
    )
}

async function get_products_by_categories(client, categories){

    let result = []
    for(let category of categories){
        let res = await get_products_by_category(client, category)
        result.push({category: category, category_products : res})
    }

    return result
}


async function get_cart_by_userid(client, user_id){
    let result = await client.db("snapkart").collection('carts').findOne({userId : user_id})
    let ret = []
    for(let i of result.products){
        ret.push({product: await get_product_details(client, i.productId), quantity : i.quantity})
    }
    return ret
}

async function update_cart(client, user_id, prod_id, new_quantity){
    user_id = Number(user_id)
    prod_id = Number(prod_id)
    new_quantity = Number(new_quantity)
    const filter = {
        userId: user_id,
        'products.productId': prod_id
    };
    const update = { 
        $set: { 'products.$.quantity': new_quantity }
    };

    // update = {quantity : new_quantity}
    // filter = {
    //     userId : user_id,
    //     products : [ { productId : prod_id } ]
    // }
    let status = 404
    await client.db("snapkart").collection("carts").findOneAndUpdate(filter, update)
    .then(doc => {
            if (!doc) {
                console.error('Item not found');
                status = 404
            } else {
                console.log('Update successful', doc);
                status = 200
            }
        })
        .catch(err => {
            console.error('Update failed', err);
            status = 404
        });

    return status
}





module.exports = {list_databases, get_product_details, get_products_by_category, get_categories, get_products_by_categories, get_cart_by_userid, update_cart, get_user_details, update_user}