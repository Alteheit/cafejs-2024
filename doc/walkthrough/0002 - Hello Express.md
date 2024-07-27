# Hello Express

2024-07-20

In this section of the CafeJS walkthrough, we will set up your Express project.

The rest of this walkthrough assumes that you are familiar with your terminal or that you are at least capable of learning it. We will also be using UNIX file path conventions. Directories will be separated by forward slashes (e.g., `cafejsroot/app.js`). Mac OS follows UNIX file path conventions. If you are on Windows, forward slashes will be replaced by backward slashes (e.g., `cafejsroot\app.js`).

## Express development approach

Express calls itself a "fast, unopinionated, minimalist web framework." I cannot disagree. It is, in fact, all of those things, perhaps even fast.

The issue here is that a lot of basic functions do _not_ come with the framework out of the box. This is by design. We will need to add dependencies to perform these functions, so get ready for that.

## Hello world

We will now create a basic Express app. The only objective of this first app will be to explore the basic functions that Express gives us.

Create a new file in `cafejsroot/` called `app.js`. Open it, and write:

```javascript
const express = require('express')
```

For those unfamiliar with JavaScript, this is one of the ways JavaScript allows you to import libraries. We have now bound the contents of the Express package to the symbol `express` within our app.

As a sanity check, save the file and try to run it with the `node` interpreter:

```zsh
node app.js
```

If there is no error, you may proceed.

Create an instance of the `Express` type and bind it to the symbol `app`.

```javascript
const app = express()
```

`app` now represents an Express server that we can configure.

Tell Express to reply with `"Hello world!"` when a user visits the root of the web server.

```javascript
app.get(
    '/',
    (req, res) => {
        res.send('Hello world!')
    }
)
```

This one is a little more complicated than the previous code snippets, especially if you are unfamiliar with JavaScript. Let's break it down.

`app.get()` is a function that tells Express to do something when someone sends an HTTP GET request to a specific path. It takes two arguments. The first argument is the path in question, which is `"/"` in this case. The second argument is a function that should run when Express receives a request on the specified path.

This function should, itself, receive two arguments. The first argument is an HTTP request, and the second argument is an HTTP response. The function can interact with the HTTP request and the HTTP response to perform business logic.

It might make more sense to a beginner to rewrite the code as such:

```javascript
function handleIndex(request, response) {
    response.send('Hello world!')
}

app.get('/', handleIndex)
```

JavaScript programmers often forego naming their functions entirely by using the "arrow function" syntax. Instead of writing and naming a function to be referenced later, they write the function directly in the place it is needed.

You will see this pattern everywhere when writing JavaScript. Since JavaScript was originally built to respond to events, it became idiomatic to structure programs not as simple line-after-line scripts but instead as responses to events. Functions that respond to events are referred to as "callback functions."

For the rest of this walkthrough, we will use the arrow syntax to write our functions.

To run the server when `app.js` is invoked, tell the app to listen for requests:

```javascript
const port = 3000
app.listen(port, () => console.log('App is listening'))
```

Notice that the pattern reoccurs here. `app.listen()` requires a callback function. We have used the arrow syntax for a function in lieu of the standard function declaration syntax. In this case, the callback function takes no arguments and simply prints a message to the console.

We can now run our server:

```zsh
node app.js
```

This command should print `App is listening` to your terminal. If your shell prompt does not reappear, and if there is no error message, this means that your server is running.

## Checkpoint

Please take a screenshot of your browser, pointed at `http://localhost:3000`.
