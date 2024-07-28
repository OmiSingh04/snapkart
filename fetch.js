//interact with the api

async function fetch_categories(){
    let response = await fetch("https://fakestoreapi.com/products/categories");
    let val = await response.json();
    return val;
}

async function fetch_products(category_name){
    let response = await fetch("https://fakestoreapi.com/products/category/" + String(category_name) + "?limit=5")
    let val = await response.json()
    return val
}

async function fetch_product_by_id(id){
    let response = await fetch("https://fakestoreapi.com/products/" + String(id))
    let val = await response.json()
    return val
}


async function fetch_all_products(){

    let categories = await fetch_categories()

    let products = []
    for(let category of categories){
        let category_products = await fetch_products(category)
        products.push({category: category, category_products})
    }
    return products
}

module.exports = {fetch_product_by_id, fetch_all_products};
