'use strict';
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
    console.log(wordObj, 'id is: ' + id);
    return db('word')
      .update(wordObj)
      .where('id', id);
  },
  // update appropriate fields in language table once user responds with an answer, pointing to the new head
  postUserLanguage(db, id, langObj) {
    console.log(langObj, 'langid is: ' + id);
    return db('language')
      .update(langObj)
      .where('id', id);
  },
  
};

module.exports = LanguageService;
