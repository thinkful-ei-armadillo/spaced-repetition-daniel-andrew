# learn.js API

## Summary

The learn.js app utilizes the idea of spaced repetition to help users better learn basic JavaScript fundamentals like data types and commonly used syntaxes. The learn.js API was built using Node.js and Express with a database built using PostgreSQL. The essential idea behind the build of this API is the implementation of a linked list data structure within the server in order to execute the spaced repetition learning method. A user answers one question at a time, and depending on whether the answer is wrong or right, that question moves down the question list a certain number of spaces. Essentially, the app requires items in an item list to be shifted around to different positions in the list. This happens multiple times for each user. By capitalizing on the advantages of a linked list, which are its ease of insertion and deletion when compared to an array, the learn.js API is able to rearrange each user's list of questions in the proper order without sacrificing performance, even at scale.

## Technology used

Node.js, Express, PostgreSQL, bcrypt, JWT, Mocha, Chai, Supertest

### API Endpoints

https://obscure-wave-29989.herokuapp.com/api/language
GET request handler for dashboard page, homepage for logged in users

/head
GET request handler for rendering each learning page 

/guess
POST request handler for user guessing


https://obscure-wave-29989.herokuapp.com/api/auth/token
POST request for user login to receive a JWT


https://obscure-wave-29989.herokuapp.com/api/user
POST request for user registration
