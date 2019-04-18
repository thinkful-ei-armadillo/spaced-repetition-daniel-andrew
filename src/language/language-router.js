"use strict";
const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const { LinkedList, _Node } = require("./LinkedList");
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
    const [nextWord] = await LanguageService.getWordByLanguageHead(
      req.app.get("db"),
      req.language.id
    );
    res.json({
      nextWord: nextWord.original,
      totalScore: req.language.total_score,
      wordCorrectCount: nextWord.correct_count,
      wordIncorrectCount: nextWord.incorrect_count
    });
    next();
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
      res.status(400).json({ error: `Missing 'guess' in request body` });
      return;
    }
    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );

    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    );
    //need a function that creates the linked list one at a time based on first the head, then each .next after
    // const linkedList = new LinkedList();
    // words.map(word => linkedList.insertLast(word));

    const list = LanguageService.generateLinkedList(words, language.head)
    // console.log(JSON.stringify(list, null, 2))

    let isCorrect;
    let currNode = list.head;

    let answerPrev = currNode.value.translation;

    if (newGuess === answerPrev) {
      isCorrect = true;
      currNode.value.correct_count += 1;
      language.total_score += 1;
      currNode.value.memory_value *= 2;
      // currNode.next = currNode.next ? currNode.next.value.id : null; // need help understanding this!!
      //linkedList.head = currNode.next;
    } else {
      isCorrect = false;
      currNode.value.incorrect_count += 1;
      currNode.value.memory_value = 1;
    }
    // response to client

    let result = {
      answer: answerPrev,
      isCorrect: isCorrect,
      nextWord: currNode.value.original,
      totalScore: language.total_score,
      wordCorrectCount: currNode.value.correct_count,
      wordIncorrectCount: currNode.value.incorrect_count
    };

    res.status(200).json(result);

    // shift node to correct position by M spaces

    let curr = list.head;
    let countDown = currNode.value.memory_value;
    while (countDown > 0 && curr.next !== null) {
      curr = curr.next;
      countDown--;
    }
    const temp = new _Node(list.head.value);

    if (curr.next === null) {
      temp.next = curr.next;
      curr.next = temp;
      list.head = list.head.next;
      curr.value.next = temp.value.id;
      temp.value.next = null;
    } else {
      temp.next = curr.next;
      curr.next = temp;
      list.head = list.head.next;
      curr.value.next = temp.value.id;
      temp.value.next = temp.next.value.id;
    }

    //console.log(JSON.stringify(list, null, 2))

    // convert list into an array
    let newArray = [];
    let newCurrNode = list.head;
    while (newCurrNode.next !== null) {
      newArray.push(newCurrNode.value);
      newCurrNode = newCurrNode.next;
    }

    for (let i = 0; i < newArray.length; i++) {
      const wordObj = {
        memory_value: newArray[i].memory_value,
        correct_count: newArray[i].correct_count,
        incorrect_count: newArray[i].incorrect_count,
        next: newArray[i].next
      };
      await LanguageService.postUserWords(
        req.app.get("db"),
        newArray[i].id,
        wordObj
      );
    }

    const langObj = {
      head: newArray[0].id,
      total_score: language.total_score
    };
    console.log(newArray)

    await LanguageService.postUserLanguage(
      req.app.get("db"),
      currNode.value.language_id,
      langObj
    );
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
