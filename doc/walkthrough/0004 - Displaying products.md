# Displaying products

2024-07-20

Our online shopping website wouldn't be very good without any products. In this section, we will add some. Our only objective for this section is to display a list of products on the index page, but there's a lot going on here that needs some discussion.

## Hardcoding your products

Given what we have so far, the simplest way to display a list of products is to simply hardcode the product details in the app's source code and then pass the product data to an EJS file.

Let's start by writing out our product list. We'll keep it simple. Add this code just above your index route handler:

```javascript
let products = [
    { name: 'Americano', price: 100 },
    { name: 'Cappuccino', price: 110 },
    { name: 'Espresso', price: 90 },
]
```

It should be reasonably clear where we're going. We'll pass this data to an EJS file, and for each product, we want there to be some sort of HTML: perhaps a simple paragraph, or a row if we're using a table. For this first step, we'll use an unordered list.

Replace the HTML in `views/index.ejs` with this:

```html
<h1>CafeJS</h1>

<h2>Products</h2>
<ul>
    <% products.forEach( (product) => { %>
        <li><%= product.name %> - PHP <%= product.price %></li>
    <% }); %>
</ul>
```

Our intent with this template is to go over a list of products, then for each product in the list, create a new HTML list item with the product's name and price.

This can look a little intimidating, but if it helps, the non-HTML syntax is from EJS. Programmers familiar with JavaScript will recognize that the `products.forEach(...)` call in between the `<% ... %>` tags very closely resembles how you can use the same method `.forEach` on an iterable object in JavaScript.

I will concede that, if you are having difficulty, it is an acceptable use of AI to help you understand the syntax. At the risk of sounding like a Luddite, if you do use AI, please be careful to not grow overly dependent on it.

Now, replace the code in your route handler with this:

```javascript
let data = {
    products: products,
}
ejs.renderFile('views/index.ejs', data, (err, str) => {
    res.send(str)
})
```

Reload your app and visit it in a browser. The products should now appear as an unordered list.

## Adding a data access layer

Hardcoding your products is generally considered a poor way to run an online shopping website. Most software engineers would advise the use of some sort of database. However, at this point, we are not ready to adopt one, so we will defer the issue by writing what we will call a "data access layer." It will basically have a set of functions that our route handler _must_ use to access data -- no shortcuts allowed.

This is called the principle of _indirection_ or _abstraction_ in software engineering. By adding a layer between the user of code and the underlying implementation of code, if we ever have to change the underlying implementation, the user of the code should not be affected.

Create a new file `database.js`.

```zsh
touch database.js
```

Write the following code in `database.js`:

```javascript
let products = [
    { name: 'Americano', price: 100 },
    { name: 'Cappuccino', price: 110 },
    { name: 'Espresso', price: 90 },
]

function getProducts() {
    return products
}

module.exports = {
    getProducts
}
```

Let's briefly go over what we have:

- We moved the hardcoded products to our `database.js` file to keep it away from our `app.js` code.
- We wrote a new function `getProducts` whose only job it is to return product data. Since we are still working with our hardcoded product data, `getProducts` merely returns the `products` array above.
- We only _export_, or make available to other modules, the `getProducts` function. We do not export `products`, which means that we are forcing users of our data store to go through the `getProducts` function.

Now, in `app.js`, import our new `database.js` file.

```javascript
const database = require('./database.js')
```

We can now source our products from our database file. Delete the old `products` array from `app.js` and change the code in the route handler to this:

```javascript
let products = database.getProducts()
let data = {
    products: products,
}
ejs.renderFile('views/index.ejs', data, (err, str) => {
    res.send(str)
})
```

## Checkpoint

Please submit a screenshot of the index page, but with another product added: Macchiato, at PHP 120.
