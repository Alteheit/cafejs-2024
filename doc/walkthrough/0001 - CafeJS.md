# CafeJS

2024-07-19

Welcome to CafeJS. This is the first installment of an introduction to web application programming. Our goal in this walkthrough is to teach you the very basics of how a "web application," as opposed to a mere "web page," works.

You can think of a web application (henceforth "web app") as a web page that stores data. This sounds like a simple addition, but it isn't. Having to manage data is where almost all the complexity of modern web development comes from. Thankfully, special programming libraries called frameworks are available to help us design and run such applications easily.

In this walkthrough, we will be building a simple e-commerce application for a company that sells coffee. Users should be able to browse products, add products to their cart, and check out their orders. There are a lot of requirements in that one sentence.

We will use the ExpressJS framework to build our web app. ExpressJS is more accurately described as a _microframework_ than a full framework due to its lack of opinion on how to implement features. We have learned over the years that beginners benefit greatly from opinion, so we will build our web app according to the opinions that I have developed after developing a few web projects myself.

The repository you are in right now is a snapshot of the code we had after writing documents TODO through TODO. Note that you might not be able to download and run this repository directly, because we have excluded an environment variable file from the git repository. It shouldn't matter: you are mean to build CafeJS from scratch in your own repository. Use this repo as a guide, not as something to copy in its entirety.

## Objectives

After completing this walkthrough, you should be able to:

1. Build a simple web app from scratch using ExpressJS,
2. Reason about how to add a new feature to an ExpressJS web app.

I should note that the culture around JavaScript (henceforth JS) is somewhat problematic. The JS community seems to have a fixation with overcomplicating their applications. We agreed that we would follow my (hopefully well-developed) opinions: one such opinion of mine is that beginners should learn to build a web app using a simple request-response model first. We will use ExpressJS as a simple request-response web server. For the purposes of this walkthrough, please **disregard** any material from the JS community that insists that you build your web apps using any of the following terms:

- Single-Page Application (SPA)
- Edge
- Hydration
- React/Angular/Vue/Svelte/SolidJS/Remix/Astro
- NoSQL

These may be important to learn later, but I strongly suggest deferring learning about these until you have a good grasp on the basics of "normal" or multi-page web apps.

## Prework

### Installations

Bear with us, there is some setup that you need to do before running an ExpressJS project.

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

### Windows


