'use strict';
const { LinkedList } = require('./LinkedList.js')
const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },

  // update appropriate fields in word table once user responds with an answer
  // also need to update new 'next' pointer based on memory value!!!!
  postUserWords(db, id, wordObj) {
    return db('word')
      .update(wordObj)
      .where('id', id);
  },
  // update appropriate fields in language table once user responds with an answer, pointing to the new head
  postUserLanguage(db, id, langObj) {
    return db('language')
      .update(langObj)
      .where('id', id);
  },
  getNextWord(db, language_id){
    return db
      .from('word')
      .join('language', 'word.id','=','language.head')
      .select(
        'original',
        'language_id',
        'correct_count',
        'incorrect_count'
      )
      .where({language_id});
  },
  createLinkedList(words, head){
    const headObj = words.find(word => word.id === head);
    const headIndex = words.indexOf(headObj);
    const headNode = words.splice(headIndex,1);
    const list = new LinkedList();
    list.insertLast(headNode[0]);

    let nextId = headNode[0].next;
    let currentWord = words.find(word => word.id === nextId);
    list.insertLast(currentWord);
    nextId = currentWord.next;
    currentWord = words.find(word => word.id === nextId);

    while(currentWord !== null){
      list.insertLast(currentWord);
      nextId = currentWord.next;
      if(nextId === null){
        currentWord = null;
      } else {
        currentWord = words.find(word => word.id === nextId);
      }
    }
    return list;
  },
};

module.exports = LanguageService;
