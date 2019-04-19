# learn.js API

## Summary

**Learn.js** utilizes the idea of spaced repetition to help users better learn basic JavaScript fundamentals, including data types and commonly used syntax. The learn.js API was built using Node.js and Express with a PostgreSQL database. 

The essential idea behind the build of this API is the implementation of a Linked List data structure within the server in order to execute the spaced repetition learning method. With spaced repetition, a user answers one question at a time, and depending on whether the answer is wrong or right, that question moves down the question list a certain number of spaces. 

Essentially, this concept requires each item in an item list to be shifted ahead to different positions in the list. This action occurs on each user guess. The performance advantages of a linked list (particularly when compared to an array)allows the learn.js API to rearrange each user's list of questions in the proper order without sacrificing performance, even at scale.

### Server Tech Stack

* Node.js
* Express
* CORS
* Linked List data structuring
* PostgreSQL
* Knex
* bcrypt
* JWT
* Mocha
* Chai
* Supertest

### API Endpoints

**API Base URL:** https://obscure-wave-29989.herokuapp.com/api

GET request handler for dashboard page, homepage for logged in users: `/language`

GET request handler for rendering each learning page `/head`

POST request handler for user guessing `/guess`

POST request for user login to receive a JWT `/auth/token`

POST request for user registration `/user`


## Client-Side Repository

https://github.com/thinkful-ei-armadillo/spaced-repetition-client-daniel-andrew

## To Fork/Clone and Examine Code

### Local dev setup
If using user dunder-mifflin:
````
mv example.env .env
createdb -U dunder-mifflin spaced-repetition
createdb -U dunder-mifflin spaced-repetition-test
````
If your dunder-mifflin user has a password be sure to set it in .env for all appropriate fields. Or if using a different user, update appropriately.
````
npm install
npm run migrate
env MIGRATION_DB_NAME=spaced-repetition-test npm run migrate
````
And npm test should work at this point

### Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests mode `npm test`

Run the migrations up `npm run migrate`

Run the migrations down `npm run migrate -- 0`