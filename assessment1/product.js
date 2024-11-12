// Task 1: Parse the JSON Data

// Function to parse JSON data into a JavaScript object
function parseProductData(jsonData) {
    try {
        let products = JSON.parse(jsonData);
        console.log("Products parsed successfully.");
        return products;
    } catch (error) {
        console.error("Invalid JSON data:", error);
        return null;
    }
}

// Example JSON data
let jsonData = `
[
    { "id": 1, "name": "Mobile Phone", "category": "Electronics", "price": 15000, "available": true },
    { "id": 2, "name": "Laptop", "category": "Electronics", "price": 50000, "available": false },
    { "id": 3, "name": "Washing Machine", "category": "Home Appliances", "price": 25000, "available": true }
]`;

let products = parseProductData(jsonData);



function addProduct(products, newProduct) {
    products.push(newProduct);
    console.log("Product added:", newProduct);
    return products;
}

// Adding a new product
let newProduct = { "id": 4, "name": "Television", "category": "Electronics", "price": 30000, "available": true };
products = addProduct(products, newProduct);

function updateProductPrice(products, productId, newPrice) {
    let product = products.find(p => p.id === productId);
    if (product) {
        product.price = newPrice;
        console.log(`Updated price of product ID ${productId} to ${newPrice}.`);
    } else {
        console.error(`Product with ID ${productId} not found.`);
    }
}

updateProductPrice(products, 1, 16000);


function filterAvailableProducts(products) {
    return products.filter(product => product.available);
}

let availableProducts = filterAvailableProducts(products);
console.log("Available products:", availableProducts);


function filterProductsByCategory(products, category) {
    return products.filter(product => product.category === category);
}

let electronicsProducts = filterProductsByCategory(products, "Electronics");
console.log("Electronics products:", electronicsProducts);
