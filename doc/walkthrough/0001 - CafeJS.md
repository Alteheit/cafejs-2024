# CafeJS

2024-07-19

Welcome to CafeJS. This is the first installment of an introduction to web application programming. Our goal in this walkthrough is to teach you the very basics of how a "web application," as opposed to a mere "web page," works.

You can think of a web application (henceforth "web app") as a web page that stores data. This sounds like a simple addition, but it isn't. Having to manage data is where almost all the complexity of modern web development comes from. Thankfully, special programming libraries called frameworks are available to help us design and run such applications easily.

In this walkthrough, we will be building a simple e-commerce application for a company that sells coffee. Users should be able to browse products, add products to their cart, and check out their orders. There are a lot of requirements in that one sentence.

We will use the Express framework to build our web app. Express is more accurately described as a _microframework_ than a full framework due to its lack of opinion on how to implement features. We have learned over the years that beginners benefit greatly from opinion, so we will build our web app according to the opinions that I have developed after developing a few web projects myself.

The repository you are in right now is a snapshot of the code we had after writing documents 0001 through 0010. Note that you might not be able to download and run this repository directly. It shouldn't matter. You are meant to build CafeJS from scratch in your own repository. Use this repo as a guide, not as something to copy in its entirety.

## Objectives

After completing this walkthrough, you should be able to:

1. Build a simple web app from scratch using Express,
2. Reason about how to add a new feature to an Express web app.

I should note that the culture around JavaScript (henceforth JS) is somewhat problematic. A lot of JavaScript users love the language and, in my opinion, seem to hate making working software.

We agreed that we would follow my (hopefully well-developed) opinions. One such opinion of mine is that beginners should learn to build a web app using a simple request-response model first. So, we will use Express as a simple request-response web server. For the purposes of this walkthrough, please **disregard** any material from the JS community that insists that you build your web apps using any of the following terms:

- Single-Page Application (SPA)
- Edge
- Hydration
- React/Angular/Vue/Svelte/SolidJS/Remix/Astro
- NoSQL
- Typescript

These may be important to learn later, but I strongly suggest deferring learning about these until you have a good grasp on the basics of "normal" or multi-page web apps.

## Prework

### Installations

Bear with us, there is some setup that you need to do before running an Express project.

Please also note that the Node.js ecosystem is notoriously fast-moving and is relatively unstable. We will thus try our best to limit the number of dependencies we bring in for this walkthrough. Regardless, there is a chance you may encounter errors in these steps, and if the versions are not the same, there is a chance your project may behave differently than expected on your system.

### Mac

Please install the following on your computer:

- Node.js v20.x.x

Node.js is the engine that we will use to run JS on the server. Without it, we would only be able to run JS on the user's browser.

If you have Homebrew, please run the following command:

```zsh
brew install node@20
```

Refresh your shell:

```zsh
exec $SHELL
```

Check if Node was installed:

```zsh
node -v
```

If you get a response like `v20.15.1` or similar, you may proceed.

Make an empty directory and set it as your new working directory. This new directory will serve as the "root" of your entire Express project. We will call this directory `cafejsroot` for this tutorial.

```zsh
mkdir cafejsroot && cd cafejsroot
```

Once you are in `cafejsroot`, use the Node Package Manager `npm` to install the `express` package, version 4.19.2:

```zsh
npm install express@4.19.2
```

This should create three new entries in your `cafejsroot`:

- `node_modules/`, which is a directory that holds your Node.js dependencies.
- `package.json`, which is a file that describes your project and its dependencies.
- `package-lock.json`, which is a file that NPM can use to re-build your project, hopefully to the same specs as intended.

Now, open a new Node REPL in your shell:

```zsh
node
```

Try to import `express`:

```javascript
Welcome to Node.js v20.15.1.
Type ".help" for more information.
> let express = require('express');
undefined
```

If you do not get any errors, you may proceed.

### Windows

Please install the following software. You can get this from the official website of Node.js at https://nodejs.org.

- Node.js v20.x.x

**Pay attention to the installer.** When it prompts you with "Tools for Native Modules", tick the box.

A PowerShell window may open to install Chocolatey and other Node.js modules. Follow the wizard to completion.

When everything seems done, open a PowerShell window and check the version of Node.js:

```powershell
node -v
```

If you get a response like `v20.15.1` or similar, you may proceed.

Make an empty directory and set it as your new working directory. This new directory will serve as the "root" of your entire Express project. We will call this directory `cafejsroot` for this tutorial.

```powershell
New-Item cafejsroot -ItemType Directory
Set-Location cafejsroot
```

Once you are in `cafejsroot`, use the Node Package Manager `npm` to install the `express` package, version 4.19.2:

```powershell
npm install express@4.19.2
```

This should create three new entries in your `cafejsroot`:

- `node_modules/`, which is a directory that holds your Node.js dependencies.
- `package.json`, which is a file that describes your project and its dependencies.
- `package-lock.json`, which is a file that NPM can use to re-build your project, hopefully to the same specs as intended.

Now, open a new Node REPL in your shell:

```powershell
node
```

Try to import `express`:

```javascript
Welcome to Node.js v20.15.1.
Type ".help" for more information.
> let express = require('express');
undefined
```

If you do not get any errors, you may proceed.

### Theory

This part is optional, but highly helpful. A web app needs four parts to function:

- Routing HTTP requests based on their content and path ("routing")
- Storing data in a database and making it accessible to the rest of the app ("models")
- Rendering HTML based on data that may vary ("views")
- The glue logic between models and views ("controllers")

Web frameworks like Django, Ruby on Rails, and more all use these four basic concepts. Microframeworks like Express still use these four basic concepts, but they tend to leave the minutiae to you.

I wrote about these in this series of articles:

- https://joeilagan.com/article/2024-itm-web-apps-1
- https://joeilagan.com/article/2024-itm-web-apps-2
- https://joeilagan.com/article/2024-itm-web-apps-3

## Checkpoint

Please take a screenshot of your Terminal/PowerShell window after importing `express`.
