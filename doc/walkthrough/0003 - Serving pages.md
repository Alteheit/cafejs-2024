# Serving pages

2024-07-20

We will now write your very first webpage with Express. Our primary objective for this page is to get a _very_ basic homepage for our digital cafe up and running.

There is a chance you have already done an "Intro to HTML" assignment. If you have not, or if your course does not have this assignment, then in short: browsers render text formatted as Hypertext Markup Language (HTML). You can serve HTML as a file, or you can also serve it as a string. The browser doesn't care.

## Sending HTML

With Express, we can send HTML very quickly by simply sending a string that represents valid HTML.

Delete everything in your `app.js` file and replace it with this code:

```javascript
const express = require('express')

const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('ok')
})

app.listen(port, () => console.log('App is listening'))
```

Instead of sending the string `'ok'` from the index route handler, send the string `'<h1>CafeJS</h1>'` instead.

```javascript
res.send('<h1>CafeJS</h1>')
```

Run your server and visit `http://localhost:3000`. It should display the text "CafeJS" formatted as a header.

What you wrote just now is valid HTML. Even though it was sent as a string, the browser knows how to interpret it and render the content appropriately. Of course, it would be problematic if we continued to construct HTML as strings. Most web frameworks thus include (or at least recommend) a templating engine for this exact purpose.

When using Express, we have a few options for our templating engine. For this walkthrough, we will use Embedded JavaScript (EJS). The main competitor of EJS is Pug, which has a shorter syntax, but EJS is much closer to HTML than Pug is.

## EJS

Install EJS by running this command:

```zsh
npm install ejs@3.1.10
```

You may now use EJS in your `app.js` file. It's worth highlighting that EJS is, on its own, just a library. It has no inherent connection to Express. We will first use it on its own, which means we will have to wire it up to our Express route handlers ourselves.

Import EJS by requiring it near the top of the file:

```javascript
const ejs = require('ejs')
```

The simplest way to use EJS is to give it a string of valid HTML.

```javascript
app.get('/', (req, res) => {
    let html = ejs.render('<h1>CafeJS</h1>')
    res.send(html)
})
```

Of course, this is trivial to do without EJS. What we really use EJS for is to include dynamic data in our HTML. Let's pretend that we have a user and that we have the user's name. We can include the user's name in our HTML by doing this:

```javascript
app.get('/', (req, res) => {
    let userName = 'Matthew'
    let data = {
        userName: userName,
    }
    let html = ejs.render('<h1>CafeJS</h1><p>Welcome, <%= userName %>!</p>', data)
    res.send(html)
})
```

If you visit your website again, you will see that the  `<%= userName %>` code snippet has been replaced with the data that we passed to `ejs.render()`.

If you are familiar with HTML, you will know that the `<%= ... %>` syntax in this string is not valid HTML. This is the syntax that EJS uses to template in dynamic data. We will see it a lot going forward.

There is one last feature we will use from EJS. Instead of storing HTML templates as strings in your source code, you can store them in files.

Create a new directory `views/`, and inside `views/`, create a new file `index.ejs`.

```zsh
# If you are on Windows, use Powershell, or just use the VS Code GUI. It doesn't matter.
mkdir views && touch views/index.ejs
```

Paste the following code into `views/index.ejs`.

```html
<h1>CafeJS</h1>
<p>Welcome, <%= userName %>!</p>
```

This is the part where it gets a little tricky. Node is known for being "asynchronous", which makes dealing with input and output (such as reading from a file) a little more difficult than in other languages like Python. We will discuss what this means later, but the immediate implication of this is that you need to become very comfortable writing function callbacks.

In your index route handler, use the `ejs.renderFile()` function instead of `ejs.render()`.

```javascript
app.get('/', (req, res) => {
    let userName = 'Matthew'
    let data = {
        userName: userName,
    }
    ejs.renderFile('views/index.ejs', data, (err, str) => {
        res.send(str)
    })
})
```

I'm sure you can intuit how this code works, but we can agree that it's less straightforward than being able to store the result of `ejs.render()` in a string.

By using `renderFile`, EJS must initiate an input/output operation (reading a file), which in the Node world means it must yield control of the program until the input/output operation is done. When EJS is done reading the file, it executes the callback function, which it passes both an error (which may be null) and the string. This is why we have to include a callback function here.

If you visit your website again, you should see the same result. It was, of course, rendered in a better way.

## Checkpoint

Please submit a screenshot of your index page, but use the name Robby instead of Matthew.
