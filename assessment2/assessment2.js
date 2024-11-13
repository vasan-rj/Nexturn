// Part 1: Basic MongoDB Commands and Queries


//1. Create the Collections and Insert Data

db.createCollection("customers");

// Inserting 5 customer documents
db.customers.insertMany([
    {
        "_id": ObjectId(),
        "name": "Amit kumar",
        "email": "amit.@gmail.com",
        "address": { "street": "12 MG Road", "city": "Mumbai", "zipcode": "00000" },
        "phone": "9898989898",
        "registration_date": ISODate("2023-01-01T12:00:00Z")
    },
    {
        "_id": ObjectId(),
        "name": "Priya",
        "email": "priya.@gmail.com",
        "address": { "street": "22 Nehru Street", "city": "Delhi", "zipcode": "10245" },
        "phone": "9787878787",
        "registration_date": ISODate("2023-01-02T12:00:00Z")
    },
    {
        "_id": ObjectId(),
        "name": "Rajesh Patel",
        "email": "rajesh.patel@example.com",
        "address": { "street": "45 Race Course", "city": "Ahmedabad", "zipcode": "380015" },
        "phone": "9797979797",
        "registration_date": ISODate("2023-01-03T12:00:00Z")
    },
    
]);

// Creating the orders collection
db.createCollection("orders");



// Inserting 5 order documents
db.orders.insertMany([
    {
        "_id": ObjectId(),
        "order_id": "ORD1001",
        "customer_id": db.customers.findOne({"name": "Amit kumar"})._id,
        "order_date": ISODate("2023-05-15T14:00:00Z"),
        "status": "shipped",
        "items": [
            { "product_name": "Laptop", "quantity": 1, "price": 1500 },
            { "product_name": "Mouse", "quantity": 2, "price": 25 }
        ],
        "total_value": 1550
    },
    {
        "_id": ObjectId(),
        "order_id": "ORD1002",
        "customer_id": db.customers.findOne({"name": "Priya"})._id,
        "order_date": ISODate("2023-05-16T14:00:00Z"),
        "status": "delivered",
        "items": [
            { "product_name": "Smartphone", "quantity": 1, "price": 700 },
            { "product_name": "Charger", "quantity": 1, "price": 20 }
        ],
        "total_value": 720
    }
    // Add similar documents for other customers...
]);


//2. Find Orders for a Specific Customer (Amit Sharma)

let customerId = db.customers.findOne({"name": "Amit Kumar"})._id;
db.orders.find({"customer_id": customerId});


//3. Find the Customer for a Specific Order (e.g., order_id = "ORD1001");
let order = db.orders.findOne({"order_id": "ORD1001"});
db.customers.findOne({"_id": order.customer_id});


//4. Update Order Status (e.g., order_id = "ORD1001")
db.orders.updateOne({"order_id": "ORD1001"}, {$set: {"status": "delivered"}});


// 5.Delete an Order (e.g., order_id = "ORD1001")
db.orders.deleteOne({"order_id": "ORD1001"});


//  ********************

// Part 2: Aggregation Pipelines
// 1.Calculate Total Value of All Orders by Customer

db.orders.aggregate([
    {
        $group: {
            _id: "$customer_id",
            total_spent: { $sum: "$total_value" }
        }
    },
    {
        $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customer_info"
        }
    },
    { $unwind: "$customer_info" },
    {
        $project: {
            _id: 0,
            "name": "$customer_info.name",
            "total_spent": 1
        }
    }
]);

// 2. Group Orders by Status
db.orders.aggregate([
    {
        $group: {
            _id: "$status",
            order_count: { $sum: 1 }
        }
    }
]);

// 3.List Customers with Their Recent Orders

db.orders.aggregate([
    { $sort: { "order_date": -1 } },
    {
        $group: {
            _id: "$customer_id",
            most_recent_order: { $first: "$$ROOT" }
        }
    },
    {
        $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customer_info"
        }
    },
    { $unwind: "$customer_info" },
    {
        $project: {
            _id: 0,
            "customer_info.name": 1,
            "customer_info.email": 1,
            "most_recent_order.order_id": 1,
            "most_recent_order.total_value": 1
        }
    }
]);

// 4.Find the Most Expensive Order by Customer
db.orders.aggregate([
    { $sort: { "total_value": -1 } },
    {
        $group: {
            _id: "$customer_id",
            highest_order: { $first: "$$ROOT" }
        }
    },
    {
        $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customer_info"
        }
    },
    { $unwind: "$customer_info" },
    {
        $project: {
            "customer_info.name": 1,
            "highest_order.order_id": 1,
            "highest_order.total_value": 1
        }
    }
]);

// 
// Part 3: Real-World Scenario with Relationships
// 1.Find All Customers Who Placed Orders in the Last Month


let lastMonth = new Date();
lastMonth.setDate(lastMonth.getDate() - 30);

db.orders.aggregate([
    { $match: { "order_date": { $gte: lastMonth } } },
    {
        $lookup: {
            from: "customers",
            localField: "customer_id",
            foreignField: "_id",
            as: "customer_info"
        }
    },
    { $unwind: "$customer_info" },
    {
        $project: {
            "customer_info.name": 1,
            "customer_info.email": 1,
            "order_date": 1
        }
    }
]);


// 2.Find All Products Ordered by a Specific Customer (Amit Sharma)

let customerIdx = db.customers.findOne({"name": "Amit Sharma"})._id;
db.orders.aggregate([
    { $match: { "customer_id": customerId } },
    { $unwind: "$items" },
    {
        $group: {
            _id: "$items.product_name",
            total_quantity: { $sum: "$items.quantity" }
        }
    }
]);

// 3.Find the Top 3 Customers with the Most Expensive Total Orders
db.orders.aggregate([
    {
        $group: {
            _id: "$customer_id",
            total_spent: { $sum: "$total_value" }
        }
    },
    { $sort: { "total_spent": -1 } },
    { $limit: 3 },
    {
        $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customer_info"
        }
    },
    { $unwind: "$customer_info" },
    {
        $project: {
            "customer_info.name": 1,
            "total_spent": 1
        }
    }
]);


// Part 4: Bonus Challenge
// Find Customers Who Have Not Placed Orders

db.customers.aggregate([
    {
        $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "customer_id",
            as: "order_info"
        }
    },
    { $match: { "order_info": { $size: 0 } } },
    {
        $project: {
            "name": 1,
            "email": 1
        }
    }
]);

// 2.Calculate the Average Number of Items Ordered per Order
db.orders.aggregate([
    {
        $project: {
            "order_id": 1,
            "item_count": { $size: "$items" }
        }
    },
    {
        $group: {
            _id: null,
            average_items_per_order: { $avg: "$item_count" }
        }
    },
    {
        $project: {
            _id: 0,
            "average_items_per_order": 1
        }
    }
]);


// 3. Join Customer and Order Data Using $lookup
db.customers.aggregate([
    {
        $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "customer_id",
            as: "order_details"
        }
    },
    {
        $project: {
            "name": 1,
            "email": 1,
            "order_details.order_id": 1,
            "order_details.total_value": 1,
            "order_details.order_date": 1
        }
    }
]);

