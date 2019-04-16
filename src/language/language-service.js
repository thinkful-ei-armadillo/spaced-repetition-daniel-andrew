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

  // doLinkedList() {
  //   const words = LanguageService.getLanguageWords(
  //     req.app.get("db"),
  //     req.language.id
  //   );
    
  //   const language = LanguageService.getUsersLanguage(
  //     req.app.get("db"),
  //     req.user.id
  //   );

  //   const linkedList = new LinkedList();
  //   words.map(word => linkedList.insertLast(word));
  // },
  
};

// const doLinkedList = async (req, res, next) => {

//   const words = await LanguageService.getLanguageWords(
//     req.app.get("db"),
//     req.language.id
//   );
    
//   const language = await LanguageService.getUsersLanguage(
//     req.app.get("db"),
//     req.user.id
//   );

//   const linkedList = new LinkedList();
//   words.map(word => linkedList.insertLast(word));

// };

module.exports = LanguageService;
