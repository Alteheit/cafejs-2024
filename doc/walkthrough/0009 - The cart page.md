# The cart page

2024-07-26

We are actually almost done. The next logical step here is to give the users a page on which they can view their cart. You will see that with all the setup we've done, this will actually be a rather straightforward addition to our app.

## Start with the database

Once again, we need to check if we have the tables to support our new feature. If we go into SQLite, we can see what tables we have:

```sqlite
sqlite> .tables
cjs_cart_item  cjs_product    cjs_session    cjs_user
```

We can use cjs_user and cjs_cart_item for this. We don't need to add a new table (or modify an existing table) for this feature.

## Add the template

Let's write a quick template that will display a user's cart items.

Remember that an EJS template can be fed data from the route handler. In this case, let's say that we expect two pieces of data: first, the user, and second, an array of Cart Items that belong to the user.

Note that the fields on the EJS template's Cart Items do not necessarily have to correspond one-to-one with the fields in `cjs_cart_item`. It will become clear soon why this is useful.

```html
<h1>CafeJS</h1>

<p>Welcome, <%= user.username %>!</p>

<a href="/">Back to home page</a>

<h2>My Cart</h2>

<ul>
    <% cartItems.forEach((cartItem) => { %>
        <li><%= cartItem.quantity %> - <%= cartItem.productName %></li>
    <% }); %>
</ul>
```

We should also include a link on the index page that will take us to the cart page.

```html
<!-- In index.ejs. Place this inside the user block so it won't render if there's no user. -->
<a href="/cart">View my cart</a>
```

Great. We will have to write the route handler for `/cart`, of course.

```javascript
// In app.js
app.get('/cart', async (req, res) => {
    let data = {}
    ejs.renderFile('views/cart.ejs', data, (err, str) => {
        res.send(str)
    })
})
```

If you reload your app and login if necessary, you should now see a link on the home page to take you to the cart page. Nothing will appear, though, because we have yet to feed our template the data it needs.

We should pause for a moment here to think about what we want to feed our template:

- The `user` object is straightforward enough. We already have database functions that retrieve a `user`, so we will just use that.
- The `cartItems` object is a little trickier. If you look at the fields that the template expects, it actually requires each object in the array to have two fields:
    - quantity
    - productName

We will need to reshape our data a little in the database function to put the product name next to each Cart Item. Remember that each row in our `cjs_cart_item` table only has a product ID, not a name.

I'm sure that you can do this with JavaScript, but this sort of re-shaping of data is what SQL was made for. We can use a basic SQL query to achieve our aims here:

```javascript
// In database.js
function getCartItemsByUser(user) {
    return new Promise((resolve, reject) => {
        let userId = user.id
        let query = `
        SELECT
            SUM(cjs_cart_item.quantity) AS quantity,
            cjs_product.name AS product_name
        FROM cjs_cart_item LEFT JOIN cjs_product
        ON cjs_cart_item.product_id = cjs_product.rowid
        WHERE cjs_cart_item.user_id = ?
        GROUP BY cjs_product.name
        `
        db.all(query, [userId], (err, rows) => {
            let result = rows.map(row => {
                return {
                    userId: userId,
                    quantity: row.quantity,
                    productName: row.product_name,
                }
            })
            resolve(result)
        })
    })
}
```

This SQL query performs what is called a JOIN in the relational world. It stitches together two tables, `cjs_cart_item` and `cjs_product`, on a shared value, which is in this case the product ID. This is how we can make data from another table available to a first table. As a bonus, it also gets the sum of Cart Items that share the same product so that items are not repeated.

Remember to export this function. Once you have done so, we can fetch both our user and our Cart Items from our route handler.

```javascript
app.get('/cart', async (req, res) => {
    let sessionToken = req.cookies['cafejs_session']
    let user = await database.getUserBySessionToken(sessionToken)
    let cartItems = await database.getCartItemsByUser(user)
    let data = {
        user: user,
        cartItems: cartItems,
    }
    ejs.renderFile('views/cart.ejs', data, (err, str) => {
        res.send(str)
    })
})
```

Reload your app. Add a few items to your cart if you have not already done so. When you visit your cart page, it should show you a list of your cart items.

## Checkpoint

Submit a screenshot of your cart page with a few Cart Items in it.
