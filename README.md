# CafeJS

2024-07-19

This is the repository for the CafeJS walkthrough. This is the JavaScript-based version of Digital Cafe, which is the scenario we use to teach students of ITMGT how to build a web application.

CafeJS places special emphasis on how to write the "front-end", which is code that runs on your user's device. In this case, your user's device can be assumed to be running a web browser like Chrome or Firefox. We will also have to discuss how to write the "back-end", or code that runs on your servers. I will heavily scaffold the back-end, because as you will see later, just because JavaScript can do back-end does not mean that you should use JavaScript for back-end.

If you are a student aiming to complete the CafeJS assignment, please head to `doc/walkthrough` and go through each of the documents starting from 0001.

## Why JavaScript

Bluntly, JavaScript is the most popular language in the world right now. It's worth learning for this reason alone.

JavaScript was originally written as a language that ran solely on web browsers to allow programmers to add dynamism and interactivity to their websites. You can still write JavaScript this way by including `<script>...</script>` tags in your website's HTML files. There was no other language that allowed this sort of functionality, so JavaScript became important to learn if website interactivity was important to your project.

Over time, programmers began to explore ways to use JavaScript in other environments. In 2009, a JavaScript engine for the server (not the browser) called Node.js was released. It was not the first server-side engine for JavaScript, but it was by far the most successful. To this day, it remains the most popular engine for running JavaScript code on the server, and it is what we will use in this walkthrough.

Since JavaScript can now be used on both the client side, as it could always be used, and the server side, thanks to engines like Node.js, many developers only had to learn a single language to be able to work on both sides of the web.

## This is not an endorsement of JavaScript for server-side use

JavaScript, as a language, is _alright_. It is merely fine. It has two main virtues: it is relatively easy for a beginner to learn, and learning it enables you to work on both the client-side and the server-side of the web. However, server-side JavaScript has a host of (mostly social) issues that make it painful to work with in a serious capacity. We put this tutorial together to give you a language that will let you get started building things quickly.

Do not mistake the existence of this tutorial as my endorsement of JavaScript as a good server-side language. The JS ecosystem moves too quickly and is too fragmented for me to recommend it to beginners. With very few exceptions, whenever ITE groups try to use JS, they get sucked into the problems of the ecosystem and fail to create something that works. Please keep an open mind about using other technologies.
