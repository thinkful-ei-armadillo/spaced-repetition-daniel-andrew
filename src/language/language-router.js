const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");

const languageRouter = express.Router();

// req.language.id first comes from a request to the database to pull languages based on the user id and the language id
// Each user has a language id to identify which language they are learning which is established via a relation between the language id
// column and the user id column

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
  // implement me
  try {
    const word = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );
    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    )
    if (!language) {
      return res.status(404).json({
        error: `You don't have any languages`
      });
    }
    console.log(word)
    res.json({
      nextWord: word[0].original,
      totalScore: language.total_score,
      wordCorrectCount: word[0].correct_count,
      wordIncorrectCount: word[0].incorrect_count
    });
  } catch (error) {
    next(error);
  }

  //res.send('implement me!')
});

languageRouter.post("/guess", async (req, res, next) => {
  // implement me
  res.send("implement me!");
});

module.exports = languageRouter;
