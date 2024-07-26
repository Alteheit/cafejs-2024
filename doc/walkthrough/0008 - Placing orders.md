# Placing orders

2024-07-26

We have two large use cases remaining: we still need to allow users to add items to their cart, and we need to allow users to check out their cart. These are large when taken as a whole, but as usual, we will do our best to break down the requirements.

In this section, we'll focus on implementing the first feature for letting users add products to their cart. We have two objectives:

- Add a form to each product detail page that will allow the user to add products to their cart.
- Have the server listen to these form submissions and update the database appropriately.

## Start with the database

Whenever we have a database, we should usually start adding a new feature by thinking first whether we have the tables to support it. Let's do a quick inventory of what we have:

- User
- Session
- Product

It looks like we're short a few tables. I will assert that we need at least one new table here: "Cart Item." Each row in Cart Item will represent a line item stored in the user's cart, so for example: 2 Americanos in user Melinoe's cart.

Let's add the table definition to our seed block in `database.js`. We only have to create a table here; we don't need to populate it with seed data. So there will be only one new line:

```javascript
db.run("CREATE TABLE IF NOT EXISTS cjs_cart_item (product_id, quantity, user_id)")
```

If you reload your app, you should see when you enter your database that there is a new table `cjs_cart_item`. (If you have not inspected the database yourself, you can use the command `sqlite3 db` when in the same directory as your `db` file to enter a database shell.)

> A slight tangent: if you, for any reason, need to delete your database to start over, you can simply delete the `db` file beside your `app.js` file. That is the entire SQLite database.

## Adding the form

Now, it is time to add a form to the product detail page. Remember that a "form" is just an HTML element that allows users to send input back to the server. We've already made a form on the login page, so this should feel somewhat familiar.

```html
<h2>Add to cart</h2>
<form action="" method="post">
    <input type="hidden" name="product_id" value="<%= product.id %>">
    <label for="quantity">Quantity</label>
    <input type="number" name="quantity">
    <input type="submit" value="Add to cart">
</form>
```

As a refresher: the "action" of a form is the URL that the form will send the HTTP request to. If it is empty, the form will send the request to the same URL that the page is already on. The "method" of a form is the HTTP verb that it will use to send the HTTP request. Most of the time, that verb is POST.

Remember that we are trying to collect three pieces of data from our user:

- Their user ID.
- The ID of the product they want to add to cart.
- The quantity of the product they want to add to cart.

We know we can collect the user's ID from the session cookie that they will pass to the browser when they send the form. We have no way of collecting the quantity other than by having them enter it into the form.

What might look a bit strange is this "hidden" input we have at the top of the form. This is the standard way to include data in a form without having to ask the user to input something. We know that this form will only render on pages that are about a specific product, and we know that the product is accessible in our EJS templates through the `product` object. We can simply attach the product's ID, which we know, to the form as a hidden field so that our server will have access to it later.

## The route handler

We can now write our route handler. We can start simple by collecting the three pieces of data we want and then echoing it back to the user.

```javascript
app.post('/product/:productId', async (req, res) => {
    // Collect the form data
    let sessionToken = req.cookies['cafejs_session']
    let user = await database.getUserBySessionToken(sessionToken)
    let userId = user.id
    let quantity = req.body.quantity
    let productId = req.body.product_id
    // Sanity check: just echo it back
    res.send({
        userId: userId,
        quantity: quantity,
        productId: productId,
    })
})
```

Reload your app, login if you must, visit the Americano page, and add 2 Americanos to cart. You should see something like this when you press submit:

```json
{"userId":1,"quantity":"2","productId":"1"}
```

If you see this, you may proceed.

Of course, instead of merely displaying the data, we want to use the data to create a new row in our Cart Item table. To be consistent with how we've handled the database so far, we will add a new database interface function, `createCartItem()`.

```javascript
function createCartItem(productId, quantity, userId) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            let stmt = db.prepare('INSERT INTO cjs_cart_item (product_id, quantity, user_id) VALUES (?, ?, ?)')
            stmt.run(productId, quantity, userId)
            resolve(true)
        })
    })
}
```

Remember to export it. Once you do, we can now use this function in our route handler. Replace the `res.send()` in your route handler with this new code:

```javascript
await database.createCartItem(productId, quantity, userId)
res.redirect('/')
```

Reload your app, then try adding a few products to cart. Go into your database and check if the items are being added. (If you need to clear the cart, you can do so from the SQLite shell with `DELETE FROM cjs_cart_item`.)

## Checkpoint

Add a few products to your cart.

Go into your SQLite database shell. Submit a screenshot of this query: `SELECT * FROM cjs_cart_item;`.
