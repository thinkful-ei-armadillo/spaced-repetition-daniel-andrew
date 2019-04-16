const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const LinkedList = require('./LinkedList');

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
      totalScore: language.total_score,
      wordCorrectCount: word[0].correct_count,
      wordIncorrectCount: word[0].incorrect_count
    });
  } catch (error) {
    next(error);
  }
});

// POST request handler for user guessing
languageRouter.post("/guess", bodyParser, async (req, res, next) => {

  const { guess } = req.body
  const newGuess = guess
  try {
    if (!req.body.guess) {
      res.status(400).json({error: `Missing 'guess' in request body`});
      return
    }

    // console.log(req.body)

    const word = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );
    
    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    );

    const linkedList = new LinkedList();
    word.map(word => linkedList.insertLast(word))
    
    let isCorrect;

    if (newGuess === word[0].translation) {
      isCorrect = true;
      word[0].correct_count += 1;
    } else {
      isCorrect = false;
      word[0].incorrect_count += 1;
    }

    let result = {
      answer: word[0].translation,
      isCorrect: isCorrect,
      nextWord: word[1].original,
      totalScore: language.total_score,
      wordCorrectCount: word[0].correct_count,
      wordIncorrectCount: word[0].incorrect_count
    };
    
    // if(newGuess !== linkedList.head.value.translation){
    //   result.answer = 'Incorrect'
    // } else {
    //   result.answer = 'Correct'
    // }
    // console.log(result)


    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

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
