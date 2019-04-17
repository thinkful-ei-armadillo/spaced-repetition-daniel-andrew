const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const LinkedList = require('../LinkedList');

const languageRouter = express.Router();
const bodyParser = express.json();

// req.language.id first comes from a request to the database to pull languages based on the user id and the language id
// Each user has a language id to identify which language they are learning which is established via a relation between the language id
// column and the user id column
console.log('Testing for persisting variables')
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

languageRouter.get("/head", async (req, res, next) => {
  try {
    const word = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );
    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    );
    if (!language) {
      return res.status(404).json({
        error: `You don't have any languages`
      });
    }

    res.json({
      nextWord: word[0].original,
      correctAnswer: word[0].translation,
      totalScore: language.total_score,
      wordCorrectCount: word[0].correct_count,
      wordIncorrectCount: word[0].incorrect_count
    });
  } catch (error) {
    next(error);
  }
});

languageRouter.post("/guess", bodyParser, async (req, res, next) => {
  // guess is read as null or undefined here - cannot destructure it as the request body.
  // fix this tuesday!
  const { guess } = req.body
  const newGuess = guess
  try {
    if (!req.body.guess) {
      res.status(400).json({error: `Missing 'guess' in request body`});
      return
    }

    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );
    console.log(words)
    const linkedList = new LinkedList();

    //find head in words array based on language table
    //sort words array by .next value or by memory value
    //insertLast on each word in the array

    words.map(word => linkedList.insertLast(word))

    //if correct, then double M 
    //if incorrect, reset M to 1 
    //then move current word M number of places in the list

    let result = {
      answer: ''
    };
    if(newGuess !== linkedList.head.value.translation){
      result.answer = 'Incorrect'
    } else {
      result.answer = 'Correct'
    }
    console.log(result)
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
