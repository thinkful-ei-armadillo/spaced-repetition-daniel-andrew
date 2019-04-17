'use strict';
const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const LinkedList = require('./LinkedList');
// const doLinkedList = require('./language-service');

const languageRouter = express.Router();
const bodyParser = express.json();

// req.language.id first comes from a request to the database to pull languages based on the user id and the language id
// Each user has a language id to identify which language they are learning which is established via a relation between the language id
// column and the user id column

// authorization require handler
languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`
      });

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

// GET request handler for dashboard page, homepage for logged in users
languageRouter.get("/", async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );

    res.json({
      language: req.language,
      words
    });
    next();
  } catch (error) {
    next(error);
  }
});

// GET request handler for rendering each learning page at 'api/language/head'
languageRouter.get("/head", async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );
    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    );

    const linkedList = new LinkedList();
    words.map(word => linkedList.insertLast(word));

    if (!language) {
      return res.status(404).json({
        error: `You don't have any languages`
      });
    }

    let currNode = linkedList.head;

    // console.log(linkedList);
    // console.log(currNode);

    // res.json({
    //   nextWord: words[1].original,
    //   totalScore: words[0].total_score,
    //   wordCorrectCount: words[0].correct_count,
    //   wordIncorrectCount: words[0].incorrect_count
    // });

    res.json({
      nextWord: currNode.value.original,
      totalScore: language.total_score,
      wordCorrectCount: currNode.value.correct_count,
      wordIncorrectCount: currNode.value.incorrect_count
    });
  } catch (error) {
    next(error);
  }
});

// POST request handler for user guessing
languageRouter.post("/guess", bodyParser, async (req, res, next) => {

  const { guess } = req.body;
  const newGuess = guess;

  try {
    if (!req.body.guess) {
      res.status(400).json({error: `Missing 'guess' in request body`});
      return
    }

    // console.log(req.body)

    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );
    
    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    );

    const linkedList = new LinkedList();
    words.map(word => linkedList.insertLast(word));
    // console.log(JSON.stringify(linkedList, null, 2));

    let isCorrect;
    let currNode = linkedList.head;
    console.log(currNode.value);

    let answerPrev = currNode.value.translation;

    if (newGuess === currNode.value.translation) {
      isCorrect = true;
      currNode.value.correct_count += 1;
      language.total_score += 1;
      currNode.value.memory_value *= 2;
      linkedList.head = currNode.next;
      // currNode.next = currNode.next ? currNode.next.value.id : null; // need help understanding this!!
      // linkedList.insertAt(currNode, currNode.value.memory_value + 1)
      // linkedList.remove(currNode)
    } 
    else {
      isCorrect = false;
      currNode.incorrect_count += 1;
      currNode.memory_value = 1;
      // linkedList.insertAt(currNode, currNode.value.memory_value + 1)
      // linkedList.remove(currNode)
    }

    console.log(currNode.value);

    // currNode = currNode.next;

    // response to client

    let result = {
      answer: answerPrev,
      isCorrect: isCorrect,
      nextWord: currNode.value.original,
      totalScore: language.total_score,
      wordCorrectCount: currNode.value.correct_count,
      wordIncorrectCount: currNode.value.incorrect_count
    };
  
    res.status(200).json(result)

    console.log('hello');

    // post updated values to database

    // write a for loop that appends a certain number of '.next' to the current node's status depending on its memory value
    // currNode'.next.next' = currNode


    const wordObj = {
      memory_value: currNode.value.memory_value,
      correct_count: currNode.value.correct_count,
      incorrect_count: currNode.value.incorrect_count,
      next: currNode.next.value.id
    }

    await LanguageService.postUserWords(
      req.app.get('db'), 
      currNode.value.id, 
      wordObj
      )

    const langObj = {
      head: currNode.next.value.id,
      total_score: language.total_score,
    }

    await LanguageService.postUserLanguage(
      req.app.get('db'), 
      currNode.value.language_id, 
      langObj
      )

  } catch (error) {
    next(error);
  }
});

// .then(currNode => {
//   currNode = currNode.next;
//   language.head = currNode.next;
// });

// languageRouter.put("/guess", bodyParser, async (req, res, next) => {
//   const { wordCorrectCount, wordIncorrectCount } = req.body;
//   const correct = wordCorrectCount;
//   const incorrect = wordIncorrectCount;

//   try {

//   }
//   catch(error) {
//     throw new Error(error);
//   }
//   res.status(200);
// })

module.exports = languageRouter;
