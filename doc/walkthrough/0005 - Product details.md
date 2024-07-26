# Product details

2024-07-23

CafeJS is progressing nicely. However, we have a long way to go. Before we implement the exciting features like users/login and adding products to a cart, we need to at least let CafeJS function as a brochure website. As it is, CafeJS doesn't even display the details of products.

This section will focus on adding one more route to your app. If a user visits the route `/product/:productId`, they should be shown a page specifically for that product.

## Adding details to your products

My personal approach to building web apps, no matter what framework I use, is to always start with the data. Let's pretend that we have one more field for each entry in our product catalog: a description. Let us also add a numeric ID to each product.

Change the `products` array in `database.js` to the following code.

```javascript
let products = [
    {
        id: 1,
        name: 'Americano',
        price: 100,
        description: 'Espresso, diluted with hot water for a lighter experience',
    },
    {
        id: 2,
        name: 'Cappuccino',
        price: 110,
        description: 'Espresso with steamed milk',
    },
    {
        id: 3,
        name: 'Espresso',
        price: 90,
        description: 'A strong shot of coffee',
    },
    {
        id: 4,
        name: 'Macchiato',
        price: 120,
        description: 'Espresso with a small amount of milk',
    },
]
```

Run your server and visit the home page. You should see that nothing has changed. Even though our template has access to all the product data, it only uses two fields: the name and the price.

We will keep our index page as is with respect to how much data it shows. However, each product should have its own page where we can see all its data.

## Adding a route

Return to `app.js`. We will now add a new route handler for the route `/product/:productId`. This symbol, `:productId`, is how Express captures variables in your path. If the user visits the route `/product/1`, the `productId` request parameter will be bound to `1` for that visit.

```javascript
app.get('/product/:productId', (req, res) => {
    res.send(req.params)
})
```

All we do here is check that Express is working as expected by echoing the request parameters. We expect the request parameters, stored in `req.params`, to have our `productId`.

Reload your server and visit `http://localhost:3000/product/2`. You should see that the response sent to you is a JSON with the key `"productId"` set to `"2"`. If you see the same behavior, you may proceed.

## Making the template

Think back to our intent for this new route. When a user visits this route, we want to show them everything about the product whose ID they passed to the server.

This means two things:

- We will need to render a new web page. This page will expect to receive the details of only _one_ product.
- We will need to find a way to retrieve the product details from only the product ID.

Let's tackle the first one in this subsection. To make a new web page, we'll need to create a new view file, `views/product_detail.ejs`.

```html
<h1>CafeJS</h1>

<a href="/">All products</a>

<h2><%= product.name %></h2>
<p>Price: <%= product.price %></p>
<p><%= product.description %></p>
```

Now you have an EJS template that expects to receive an object called `product` that has the fields `name`, `price`, and `description`.

## Fetching the product

To give our EJS template a `product` object, we need to fetch such an object from our database.

From a previous subsection, we know that our "database" can give us an array of products. If you are familiar with JavaScript, you will know that it is possible to fetch a product by ID by using the `.filter` method of an array.

It may be tempting to do this in our route handler:

```javascript
let products = database.getProducts()
let product = products.filter(v => v.id == req.params.productId)[0]
```

However, pause and consider whether this is the best approach. It _will_ work, but filtering data is very often done at the database level, not the application level. Databases are often much more efficient at filtering than application code. If we want to eventually replace our database, we should probably abstract this filtering behind our data access layer.

We can create a new function in our `database.js` file to allow us to fetch a product by its ID.

```javascript
function getProductById(id) {
    return products.filter(v => v.id == id)[0]
}
```

Remember to add the function to the `module.exports` so that we can use it in `app.js`.

```javascript
module.exports = {
    getProducts,
    getProductById
}
```

Now, we can fetch and pass a product row in our new route handler.

```javascript
app.get('/product/:productId', (req, res) => {
    let product = database.getProductById(req.params.productId)
    let data = {product: product}
    ejs.renderFile('views/product_detail.ejs', data, (err, str) => {
        res.send(str)
    })
})
```

Run your server and visit `http://localhost:3000/product/3`. It should show the page for your Espresso product.

## Adding links to the product pages

There's one piece missing from our website's basic info functionality. If you return to the home page, you will see that there is no way to click on the products to go to their detail pages.

We can fix that by adding an anchor tag (i.e., a link) to our home page for every product. Replace the line with the list item with this code:

```html
<li><a href="/product/<%= product.id %>"><%= product.name %></a> - PHP <%= product.price %></li>
```

You can see with this example how EJS helps us insert values where they are appropriate.

## Checkpoint

Take one screenshot of your home page. Take another screenshot of your Macchiato page.
