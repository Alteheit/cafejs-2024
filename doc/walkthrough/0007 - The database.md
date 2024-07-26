# The database

2024-07-24

We have survived this far with our "fake" database. However, it should have become clear in the previous section that our fake database will not work for much longer. It is time to explore our options for a database.

This is likely to be one of the longest and most difficult subsections. You will see why I think that Django is a much better framework to teach beginners. However, we will not back down from this. Even if it takes a while, mastering the concepts in this subsection is the key to mastering JavaScript and web development as a whole.

## Our options

A "database" is a program whose purpose it is to manage access to data that is stored persistently on the computer's disk. The _persistence of data_ is the key feature of a database. This is what we currently do not have with our `database.js` setup.

It is entirely possible to persist your data by writing to simple files on disk. This is actually a valid strategy for some small-scale applications. However, most software professionals (correctly) consider it best practice to use a real database management system, especially if the data under management is sufficiently voluminous or complex.

### Relational databases

A "relational" database is one that stores data in terms of tables. This is, by far, the most common form of database.

Each table in a relational database is about one _entity_. Each row in a table is about an _instance_ of the entity. In our app so far, `products` (or `product` according to the naming conventions of most relational database administrators) would be a table. The `"Americano"` record would be a row in the `product` table.

Tables in relational databases also tend to have references to rows in other tables. These references are called "joining keys." In our app so far, the `session` table would have a `user_id` column as a joining key to the `user` table.

The most popular relational database system nowadays is PostgreSQL. There are a number of other relational databases on the market like MySQL and MariaDB, or if you're in the enterprise market, Oracle and Microsoft SQL Server. These are all rather heavyweight systems, though. For smaller use cases, a lightweight relational database called SQLite is sometimes all you need.

The language used for interacting with relational databases is called "Structured Query Language," or SQL. Compared to most modern languages, SQL is frankly unpleasant to write and read, so a lot of new developers shy away from relational databases because of SQL. If you had a `line_item` table and wanted to sum the sales per product, your SQL would look like this:

```sql
SELECT
    product,
    SUM(price * quantity) AS sales
FROM line_item
GROUP BY product
ORDER BY sales DESC;
```

It isn't great. SQL was designed many decades ago to work with the relational data model. This data model unfortunately also conflicts with the way most modern languages store data, which is usually in the form of "objects." There have been attempts to bridge the two data models with libraries known as "object-relational mappers," or ORMs, but this space is notoriously difficult to get right. It is still best to understand how SQL works.

If you are going to have a career anywhere in the vicinity of data, there is no escaping SQL. I won't excuse its flaws as a language, but take it from me that you'll eventually get used to it and come to appreciate its power regardless of its warts.

### "NoSQL" databases

Any database that does not follow the relational data model (i.e., the table model) is perhaps unfairly grouped into what is known as "NoSQL." The two most common non-relational models are the key-value model, which is very similar to using a Python dictionary or a JavaScript object, and the document model, which is very similar to using _nested_ dictionaries/objects.

Most data models have use cases for which they are appropriate. However, I caution against engaging deeply with the NoSQL world as a beginner if only because there was previously, and perhaps still is, a lot of marketing hype around using non-relational models for _everything_. Most use cases are handled perfectly well by the relational model. That's why the relational model has survived so long. I wrote an entire article about it [here](https://joeilagan.com/article/relational-data-ite).

### Our database

For the purposes of this walkthrough, we will choose SQLite. It is a _relational_ database, which by now should be obvious is my preference. It is also much easier to install than a heavier relational database like Postgres, so we can get started almost right away.

## Installing SQLite

Install `sqlite3` with NPM:

```zsh
npm install sqlite3@5.1.7
```

SQLite stores its database in just a single file. We can connect to it in our `database.js` as such:

```javascript
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db')
```

Please note that `'./db'` is a relative path to the file named `db`, which will live in the same directory as `database.js`.

Bear with me now: we can use the `db` object we created in `database.js` to instantiate our database. Here is a piece of code we can use to do just that.

```javascript
// Somewhere below the users array and the products array

// We will call this the "seed block"
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS cjs_user (username TEXT, password TEXT)")
    db.run("CREATE TABLE IF NOT EXISTS cjs_product (name TEXT, price INTEGER, description TEXT)")
    db.run("CREATE TABLE IF NOT EXISTS cjs_session (token TEXT, user_id INTEGER)")
    // Insert seed data into cjs_user
    db.get('SELECT COUNT(*) AS count FROM cjs_user', [], (err, row) => {
        let count = row.count
        if (count == 0) {
            let stmt = db.prepare("INSERT INTO cjs_user (username, password) VALUES (?, ?)")
            users.forEach(v => {
                stmt.run(v.username, v.password)
            })
        }
    })
    // Insert seed data into cjs_product
    db.get('SELECT COUNT(*) AS count FROM cjs_product', [], (err, row) => {
        let count = row.count
        if (count == 0) {
            let stmt = db.prepare("INSERT INTO cjs_product (name, price, description) VALUES (?, ?, ?)")
            products.forEach(v => {
                stmt.run(v.name, v.price, v.description)
            })
        }
    })
})
```

This is a lot to digest, but we will not shy away from it. I suspect that this is where you will perceive a sharp spike in the learning curve, so please spend as much time tinkering with this as you want.

- The top-level function call in this seed block is `db.serialize()`. It takes one argument: a callback function. `db.serialize()` will make sure that everything that happens inside its callback function happens strictly one after the other.
- Inside the callback function, the first three lines are simple calls to `db.run()`. This is a function that takes a single argument, a string of SQL, and executes it against the database.
    - Inside each of the first three calls to `db.run()` here, we have SQL that creates tables if they do not already exist. We need this specification `IF NOT EXISTS` because this database will _persist_ across restarts of our app. We wouldn't want to create a table if it already exists, after all.
    - We also name our tables with the format `cjs_{table_name}` because some common domain names like `user` and `transaction` tend to be reserved words in SQL. In our case, the `cjs_` prefix stands for "CafeJS." It's best to just sidestep the reserved name issue altogether to avoid naming conflicts.
- Below our table creations, we also insert seed data into two tables: `cjs_user` and `cjs_product`. We use `db.get()` to check first if the tables have data in them already. This function `db.get()` takes three arguments: an SQL query, a list of parameters (which in this case is an empty array), and a callback function to execute once the query is done.
    - In the callback function, if the tables do not have any data, then we add our seed data.
        - We will prepare a "template statement" with `db.prepare()`. It is best practice to let your SQL library handle variable data. Do not pass data directly into SQL strings: this makes you vulnerable to an attack called "SQL injection."
        - We then use the template statement to insert data based on the properties of our users and products.
    - In the callback function, if the tables do already have data, then we do not add our seed data.

It may help to spell out the intent of this seed block in English. Every time the app runs, we simply want to create the tables if they do not yet exist. If there is no data in these tables, then we add the seed data, and if there already is data, we do nothing.

## Changing the guts of our database functions

We now have a real, functional database. We can now change the implementation of our database functions like `getProducts()` to use the real database instead of the fake one.

However, we have an issue. All of the functions given to us by the `sqlite3` driver are _asynchronous_. I have been trying my best to hide this from you so far. As of now, though, we must face it head on.

### What is a callback function, anyway?

We have seen this pattern more than a few times now.

```javascript
functionA('some-argument', (callbackArg) => {
    doSomethingWith(callbackArg)
})
```

Just to be clear, the second argument here is a function. You can rewrite it like this:

```javascript
function someCallback(callbackArg) {
    doSomethingWith(callbackArg)
}

functionA('some-argument', someCallback)
```

Why do we use this pattern so much?

JavaScript typically runs on a single thread. That means that only one thing can physically be happening at a time. Think of it as there only being a single staff member to run a cafe. They have to handle all the tasks like boiling water, brewing coffee, manning the register, and cleaning tables.

Many functions in NodeJS -- no, _JavaScript_ as a whole -- have the ability to cede control over the thread when they are waiting for something to happen. Maybe the staff member understands that boiling water doesn't need their full attention. Once they put on the kettle, they can leave it be to man the register, then return to the kettle later once the water is done.

That is what is happening with JavaScript. When some functions encounter "waiting conditions" such as waiting for a database to respond, they can cede control of the thread to another function. The thread will eventually return to the function that ceded control, but the thread will need instructions on what to do once it returns. Those instructions are usually contained in callback functions.

This whole model of programming is known as "asynchronous programming." Beginners to programming usually find this very difficult, because the mental model of progarmming that makes the most sense is that things happen one after the other. That's how programming is (in my opinion, correctly) taught in beginner classes.

Unfortunately, that's not how JavaScript works. If you want to use JavaScript, you'll eventually need to get used to this.

### Ways to perform async tasks

JavaScript famously has three main ways to do async tasks at the time of writing.

The first async approach is to use callback functions. We have been doing this for a while already. If a function must cede control of the thread, it should provide a set of instructions to execute when the thread returns to it when it is ready. Those instructions are stored in the callback function.

Maybe the simplest example of this is the `setTimeout` function.

```javascript
function sayHello() {
    console.log("Oh hello, I didn't see you there.")
    return "Here's a message for you to take back with you."
}

// Execute this callback function `sayHello` at the end of 1000 milliseconds.
setTimeout(sayHello, 1000)
```

This `setTimeout` function is one of the more famous async functions in JavaScript. Its only job is to _wait_. When it is done waiting, it makes itself available for the thread to pick up again. When the thread returns to it, `setTimeout` instructs the thread to execute the callback function.

You can run this in a Node shell, actually. Try seeing what exactly happens when you run this code.

```javascript
> setTimeout(sayHello, 1000)
Timeout {
  _idleTimeout: 1000,
  _idlePrev: [TimersList],
  _idleNext: [TimersList],
  _idleStart: 240273,
  _onTimeout: [Function: sayHello],
  _timerArgs: undefined,
  _repeat: null,
  _destroyed: false,
  [Symbol(refed)]: true,
  [Symbol(kHasPrimitive)]: false,
  [Symbol(asyncId)]: 56,
  [Symbol(triggerId)]: 6
}
```

This expression, `setTimeout(sayHello, 1000)`, is distinctly _not_ equal to the return value of `sayHello`. This is one of the first footguns of working with async functions. It is inherently really difficult to pass values around like you would in a purely synchronous world.

Note that we have been using this callback approach ourselves so far. Remember this pattern from `app.js` when we try to load an EJS template:

```javascript
ejs.renderFile('views/index.ejs', data, (err, str) => {
    res.send(str)
})
```

This is a classic example of an async function that uses callbacks. The process of reading a file off of the disk is something that can potentially take a long time, so JavaScript typically cedes control of the thread when it does this. When the file is done being read, the thread can pick up the rendering process again by executing the callback function.

The second async approach, and honestly the most difficult one to grok in my opinion, is what JavaScript calls "promises." Promises are special objects that, and I quote, "represent the eventual completion (or failure) of an asynchronous operation and its resulting value". They are effectively JavaScript's first-class support for the concept of callbacks.

Promises are really difficult to understand theoretically, so here's an example.

```javascript
function printData(data) {
    console.log(data)
}

fetch('https://jsonplaceholder.typicode.com/posts/1').then(printData)
```

The very common `fetch` function issues an HTTP request to a remote server. This is clearly something which would take some waiting, so JavaScript cedes control of the thread.

If you were to check the type of the `fetch(...)` expression itself, you will see that it is an instance of a `Promise` object. It does _not_ contain the response of the remote webserver. To use the data, you have to give `fetch()` a callback function by registering the callback with the Promise's `.then()` method.

What's interesting about Promises is that you can effectively chain together callback functions.

```javascript
fetch('https://jsonplaceholder.typicode.com/posts/1')
    .then((res) => {
        return res.json()
    })
    .then((data) => {
        console.log(data.title)
    })
```

The first callback function here parses the response body out of the raw response. It actually returns a value. This value can then be used in _another_ callback function, which is chained to the first Promise with another call to `.then()`.

If you wanted to actually pass data around callback functions without Promises, you would have a bad time. It would certainly be possible, but it was enough of a problem that JavaScript was forced to adopt a slightly better way of working with async operations.

Promises are better than bare callbacks, but using Promises is still a far cry from the "normal" mental model of programming, where things happen cleanly, one after the other. JavaScript thus has a third way of working with async functions: the `async/await` syntax.

We can rewrite our `fetch()` code like this:

```javascript
async function main() {
    let url = 'https://jsonplaceholder.typicode.com/posts/1'
    let response = await fetch(url)
    let data = await response.json()
    console.log(data.title)
}
```

I have wrapped the entire code block in an `async` function. Unfortunately, to use the powers of async/await, you _must_ run everything within an `async` function. But if you have this privilege, you can see that we can simply extract the results of each of the Promises into a simple variable by "awaiting" them. There are no callback functions involved here. It _looks_ like synchronous code, even though it is not.

The problem with async functions in general (not just the async/await syntax, but all these async functions together) is that they infect the rest of your codebase. An async function can only reasonably by called by another async function. If you begin using async functions, you will be required to make the calling function async itself. The process repeats itself until all your functions are async.

This is known as the "function coloring" problem. There's a famous [article](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/) on the subject if you're interested.

### You have to know all three

JavaScript is so often recommended as a beginner's language. I can see why, but I have to disagree, if only because you will inevitably hit the async wall if you try to do anything serious in the language.

You might be looking at our three options for working with async and thinking to yourself, "why don't we just use the third one, async/await? It seems like it's the easiest." And it is. However, the bare nature of JavaScript requires us to learn all three.

At its core, JavaScript is built on the concept of event handling, which is naturally asynchronous, and which naturally gives rise to callback functions. Promises were an abstraction on top of callback functions. Async/await is an abstraction on top of Promises. As much as we would like to simply use the highest of these abstractions, the reality is that some libraries _do not support anything beyond bare callbacks_.

One of these libraries, unfortunately, is our `sqlite3` library. It only supports callbacks. So, to change the guts of our database functions, we will need to use all three of these methods.

### Start with the interface

It might make the most sense to think about how we would _want_ to call our async database function from our route handlers. The most obvious choice is to try to introduce the smallest amount of change possible. This means that we will naturally fall to the `async/await` syntax.

Here's what I came up with for the index route handler.

```javascript
app.get('/', async (req, res) => {
    let products = await database.getProducts()
    let sessionToken = req.cookies['cafejs_session']
    let user = database.getUserBySessionToken(sessionToken)
    let data = {
        products: products,
        user: user,
    }
    ejs.renderFile('views/index.ejs', data, (err, str) => {
        res.send(str)
    })
})
```

We have only introduced two changes here. First, the entire route handler is now an `async` marked function. This will allow it to use the `await` keyword within. Second, the `database.getProducts()` function, which we foresee will become async, is trivially amended with an `await` keyword to extract its value.

This is a good start. What do we need to change in `database.js` to make this code possible to use? The most important assumption here is that `database.getProducts()` should return a Promise. The `await` keyword can only be used on Promises, after all.

This is where it will get a little tricky, but bear with me. Continue thinking backwards. Our `getProducts()` function in `database.js` itself must return a Promise. So, at the bare minimum, we can do something like this:

```javascript
function getProducts() {
    return new Promise((resolve, reject) => {
        resolve(products)
    })
}
```

This will work. What we're doing here is we're making our `getProducts()` function _return_ a Promise. We are creating a custom Promise here, which we will tell to eventually _resolve_ to some data. In this case, the resolved data will be an array of products. It is that resolved data that will be captured by the `await database.getProducts()` call in `app.js`.

Of course, we don't want to use the bare products array anymore. We want to fetch the products from the database. This is where we have to bring in a call to our database, which will require a callback function, like this:

```javascript
function getProducts() {
    return new Promise((resolve, reject) => {
        // Note: we need to explicitly select the `rowid` column here
        // `rowid` is a free column that SQLite adds to every table,
        //  but it is not included in queries automatically
        db.all('SELECT rowid, * FROM cjs_product', (err, rows) => {
            let result = rows.map(x => {
                return {id: x.rowid, name: x.name, price: x.price, description: x.description}
            })
            console.log(result)
            resolve(result)
        })
    })
}
```

Now you can see it all come together. In the callback function for our Promise, we invoke a call to our database. This call to the database requires its own callback function, where we process the rows returned from the SQL call. Eventually, we will _resolve_ the top-level Promise to be the processed rows from our database call.

With this approach, you can change the rest of your database interface functions to use your SQLite database.

## Checkpoint

To perform this checkpoint, you will need to migrate all your route handlers and database interface functions similarly to how we migrated `getProducts()`.

I do foresee that this will be rather difficult, so please feel free to consult with your groupmates or classmates.

Submit three screenshots.

- One screenshot of your migrated `getProductById()` function.
- One screenshot of your migrated `/product/:productId` handler.
- One screenshot of your browser, visiting `http://localhost:3000/product/3`.

## PS

I have a feeling that this particular section has the potential to be a complete showstopper for some of you. I have included a snapshot of my code as of this section in a folder, also labelled 0007. If you are actually stuck, this is your escape hatch.

Please do not look in this folder unless it is absolutely necessary, because viewing it without undergoing the struggle will stunt your growth as a software engineer. We have little sympathy for those who cheat themselves.
