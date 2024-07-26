# Users

2024-07-23

This will be a long section. Authentication -- knowing who someone is -- is a critical part of most non-trivial web apps. Most web frameworks like Rails and Django have a way to handle this. Express, being a microframework, does not have a built-in way to handle users.

It is part of our task in this walkthrough to explore the fundamentals of how a browser and a server can work together to remember who a user is. This will go deeper in the weeds than I originally planned, but you will emerge from these weeds as a stronger programmer.

## Cookies

A bit of background first.

Browsers and web servers talk to each other using the HyperText Transfer Protocol (HTTP). HTTP is designed to be "stateless," which just means that the server does not need to remember anything about what past HTTP requests looked like or contained.

The browser, however, _can_ remember what it was sent via a web server. There are a number of ways a browser can remember data, but for our purposes, we will use the "cookie."

A [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) is a small piece of data a server sends to a browser. In an HTTP response, a server may instruct the browser to store a cookie with this header:

```http
Set-Cookie: <cookie-name>=<cookie-value>
```

When a browser sends another HTTP request to the same website, it usually includes all its cookies for that website by default in the `Cookie` header as such:

```http
Cookie: yummy_cookie=choco; tasty_cookie=strawberry
```

You will typically not deal with the headers directly like this. Most web frameworks will expose cookies to you in interfaces that are idiomatic to the programming language they are written in. Underneath those abstractions, though, this is what is happening.

One of the most common use cases for a cookie, then, is to have the user's browser store a tiny token that identifies the user. In most web apps, this token will not represent something static and well-known. It will not be a username or an email. It will instead be a meaningless series of random bytes that is associated with the user only in the server's database and is useless in any other context. This is called a _session_.

```http
Set-Cookie: my_web_app_session=98a51b998f5ec044cfd5f6a2bf5fd2bb
```

The rest of this section will focus on getting our Express app to the point where we can set cookies to remember users via their sessions.

## Creating some users

To set up our first users, we will follow the same hacky approach we used for our products. Go to `database.js` and create the following array:

```javascript
let users = [
    {
        id: 1,
        username: 'zagreus',
        password: 'cerberus',
    },
    {
        id: 2,
        username: 'melinoe',
        password: 'b4d3ec1',
    }
]
```

I should note that it is a terrible idea to store passwords like this. We will tolerate it for the purposes of the walkthrough, but passwords should _always_ be hashed (not encrypted, hashed! they are not the same) and stored securely in a database.

Anyway, let's proceed. For our users to be able to log in, they will need a login page. We will make that next.

## A login page

This part should be easy enough to understand. To create a login page, we will just create a new EJS file that has a login form.

```html
<h1>CafeJS</h1>

<h2>Login</h2>

<form action="" method="post">
    <label for="username">Username</label>
    <input type="text" name="username">
    <label for="password">Password</label>
    <input type="password" name="password">
    <input type="submit" value="Login">
</form>
```

To render this page, we will write another route handler in `app.js`.

```javascript
app.get('/login', (req, res) => {
    ejs.renderFile('views/login.ejs', (err, str) => {
        res.send(str)
    })
})
```

A "form" is an HTML element that collects data from a user and sends it to the server. In this case, we collect two pieces of data from the user: their username and their password.

Forms typically use a different HTTP "verb" called POST. Most HTTP requests that browsers send are GET requests, which are meant to fetch data. POST requests are different in that they are also meant to _send_ data to a browser.

This particular form thus collects a user's username and password then sends a POST request to the same route (i.e., `/login`). We can write another route handler for `/login` that handles POST requests specifically.

Let's do a sanity check. Our first route handler for POST `/login` will simply echo the user's username and password.

```javascript
app.post('/login', (req, res) => {
    res.send(req.body)
})
```

There is one problem. For some reason, Express does not know how to parse form data in a POST request by default. Somewhere just below your declaration of the app, you'll need to explicitly tell Express to use some "middleware," which is just some code that acts on each request before it gets to a route handler.

```javascript
app.use(express.json())
app.use(express.urlencoded())
```

If you run your app, go to `http://localhost:3000/login`, and fill in the form, you should be shown what you just input. If it behaves as expected, you may proceed.

## Setting a cookie

We now have a working login form. Our ultimate intent is to use the details from the login form to create a session, tie it to a user, and store the session in a cookie. However, before we do that, we should check whether we can set a cookie at all.

We can test this by simply setting the cookie `cafejs_username` to the value of `req.body.username`. (Do not do this in a serious app, of course). In `app.js`, change your login route handler to this:

```javascript
app.post('/login', (req, res) => {
    if (req.body.username) {
        res.cookie('cafejs_username', req.body.username)
    }
    res.redirect('/username')
})
```

This new route handler checks whether there's a `username` property on the `req.body` object. If there is, then it instructs the browser to set the cookie `cafejs_username` to the value of `req.body.username`.

Unfortunately, Express also does not seem to be able to parse cookies from an HTTP request by default, either. For this code to work, we will need to download a library called `cookie-parser` and use it as a middleware.

Use NPM to download `cookie-parser`:

```zsh
npm i cookie-parser@1.4.6
```

Then, import `cookie-parser` and have your Express app use it as middleware.

```javascript
// In your imports
const cookieParser = require('cookie-parser')

// In your middleware section
app.use(cookieParser())
```

One last thing before we check if cookies work. Add a new route handler for the `/username` route. Its only job will be to read the value of the cookie `cafejs_username` and echo it back to the user.

```javascript
app.get('/username', (req, res) => {
    res.send(req.cookies.cafejs_username)
})
```

Reload your app. Visit `http://localhost:3000/login`. Enter any username you want, for example `"zagreus"`, and press the login button. If you are redirected to a page that echoes your username back to you, then congratulations: you can successfully set and get cookies.

## From username cookies to session cookies

We've established that we can set and get cookies, but our cookie is currently the username of a user. This is horribly insecure. If we base our security decisions on whether we can find a username cookie, an attacker can simply set the cookie to someone's username to act as their account.

In this subsection, we'll try to refactor our web app to use sessions instead of usernames as cookie data. Sessions are supposed to be meaningless, easy to control, easy to revoke, and difficult to guess, so they are a much more secure way to identify users across requests.

In `database.js`, create a new object to represent sessions.

```javascript
let sessions = {}
```

The idea here is that we will associate a session token with a user ID. Thus, in the back end, a session token should be sufficient to ultimately identify a user.

While we're here, we should write some other database functions that we will probably use in the route handlers. It's reasonably obvious that we'll have to get all users, get users by ID, get users by username, get all sessions, and get a user by their session token. Most importantly for this subsection, we also need a function to set a session. I have faith in you to figure this out, but for expediency, I am including the function code for each of these interface functions here.

```javascript
function getUsers() {
    return users
}

function getUserById(id) {
    return users.filter(v => v.id == id)[0]
}

function getUserByUsername(username) {
    return users.filter(v => v.username == username)[0]
}

function getSessions() {
    return sessions
}

function getUserBySessionToken(sessionToken) {
    let userId = sessions[sessionToken]
    return getUserById(userId)
}

function setSession(sessionToken, userId) {
    sessions[sessionToken] = userId
}

// Remember to include the new functions in your exports, too.
module.exports = {
    getProducts,
    getProductById,
    getUsers,
    getUserById,
    getUserByUsername,
    getSessions,
    getUserBySessionToken,
    setSession,
}
```

Now, we will rewrite our login route handler in `app.js`. In concept, we want it to now do two things: first, check if the user credentials are valid, and second, create a session and set it as a cookie if the user is valid.

Let's start by writing the bare code without any abstractions.

```javascript
// Somewhere in your imports. `crypto` is a standard library nowadays.
// This is required for generating a secret token.
const crypto = require('crypto')

// Your login route handler
app.post('/login', (req, res) => {
    // Check if the user's details are valid and correct
    // We will ignore error cases for now
    let user = database.getUserByUsername(req.body.username)
    if (user.password != req.body.password) {
        res.send('Invalid details!')
    }
    // Generate a random session token
    let sessionToken = crypto.randomBytes(16).toString('base64')
    // Set the `cafejs_session` cookie to the session token
    res.cookie('cafejs_session', sessionToken)
    // Save the session to the database
    database.setSession(sessionToken, user.id)
    res.redirect('/')
})
```

Please note that this is a horrifically insecure way to check if a user's login details are valid, so do not copy this code into production. For the purposes of this walkthrough, we will tolerate it.

Anyway: our intent here is to redirect the now-logged-in user to the index page, so the index page should have a way to display who the user is.

Add this snippet somewhere in `views/index.ejs`.

```html
<% if (user) { %>
    <p>Welcome, <%= user.username %>!</p>
<% } %>
```

Update your index route handler to try to fetch a user using the session cookie.

```javascript
app.get('/', (req, res) => {
    let products = database.getProducts()
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

Now, if you log in with one of the users in your database, it should redirect you to the index page and greet you appropriately.

Please also note that since we do not have a _persistent_ database, every time you reload your app, the sessions object will be reset to nothing. This won't affect us that badly right now, but it is something that production web apps must remedy.

## Checkpoint

Take a screenshot of your home page while logged in as `melinoe`.
