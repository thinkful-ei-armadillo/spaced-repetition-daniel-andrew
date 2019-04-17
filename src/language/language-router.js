'use strict';
const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const  {LinkedList, _Node}  = require('./LinkedList');
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

    let isCorrect;
    let currNode = linkedList.head;

    let answerPrev = currNode.value.translation;

    if (newGuess === answerPrev) {
      isCorrect = true;
      currNode.value.correct_count += 1;
      language.total_score += 1;
      currNode.value.memory_value *= 2;
      // currNode.next = currNode.next ? currNode.next.value.id : null; // need help understanding this!!
      //linkedList.head = currNode.next;
    } 
    else {
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
  
    res.status(200).json(result)

    // shift node to correct position by M spaces

    let newNext = currNode.next.value.id;


    // console.log(JSON.stringify(linkedList, null, 2));

    console.log(currNode.value.memory_value);

  
    //linkedList.remove(currNode);

    // console.log(linkedList);

    //implementing move currNode according to memory value stemming from user correct/incorrect response

    // function Node(data, next = null) {
    //   this.data = data, this.next = next;
    // }
    // function Context(source, dest) {
    //   this.source = source, this.dest = dest;
    // }
    // function moveNode(source, dest) {
    //   if(!source) throw "Error"
    //   return new Context(source.next, new Node(source.data, dest));
    // }

    // moveNode(currNode, currNode.value.memory_value + 1);
    // linkedList.remove(currNode);

      // move current node back in the list depending on how user responds

    // console.log(newNext);
    // if (currNode.value.memory_value === 1) {
    //   if (currNode.next !== null) {
    //     newNext = (currNode.next.value.id + 1);
    //   }
    //   if (currNode.next === null) {
    //     newNext = (currNode.next.value.id + 1) - words.length;
    //     // linkedList.find() // wanted to find 'next' node and update pointer
    //   }
    // }

    // if (currNode.value.memory_value !== 1) {
    //   if (currNode.next !== null) {
    //     newNext = (currNode.next.value.id + currNode.value.memory_value);
    //   }
    //   if (currNode.next === null) {
    //     newNext = (currNode.next.value.id + currNode.value.memory_value) - words.length;
    //   }
    //   if (newNext > words.length) {
    //     newNext -= words.length;
    //   }
    // }
    // console.log(newNext);

    // post updated values to database
    console.log(JSON.stringify(linkedList, null, 2))
    // linkedList.insertAt(currNode, currNode.value.memory_value)

    let curr = linkedList.head
    let countDown = currNode.value.memory_value
    while(countDown > 0 && curr.next !== null){
      curr = curr.next
      countDown--;
    }
    const temp = new _Node(linkedList.head.value)

    if(curr.next === null){
      temp.next = curr.next
      curr.next = temp
      linkedList.head = linkedList.head.next
      curr.value.next = temp.value.id
      temp.value.next = null
    } else {
      temp.next = curr.next
      curr.next = temp
      linkedList.head = linkedList.head.next
      curr.value.next = temp.value.id
      temp.value.next = temp.next.value.id
    }

    //console.log(JSON.stringify(linkedList, null, 2))

    // convert linkedList into an array
    let newArray = []
    let newCurrNode = linkedList.head
    while(newCurrNode.next !== null){
      newArray.push(newCurrNode.value)
      newCurrNode = newCurrNode.next
    }
    console.log(newArray)

    for(let i = 0; i < newArray.length; i++){
      const wordObj = {
        memory_value: newArray[i].memory_value,
        correct_count: newArray[i].correct_count,
        incorrect_count: newArray[i].incorrect_count,
        next: newArray[i].next
      }
      console.log('wordObj', wordObj)
      await LanguageService.postUserWords(
      req.app.get('db'), 
      newArray[i].id, 
      wordObj
      )
    }



    // const wordObj = {
    //   memory_value: currNode.value.memory_value,
    //   correct_count: currNode.value.correct_count,
    //   incorrect_count: currNode.value.incorrect_count,
    //   next: newNext
    // }
    
    // await LanguageService.postUserWords(
    //   req.app.get('db'), 
    //   currNode.value.id, 
    //   wordObj
    //   )

    const langObj = {
      head: newArray[0].id,
      total_score: language.total_score,
    }
    console.log('langObj', langObj)

   
  
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
