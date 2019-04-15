BEGIN;

TRUNCATE
  "word",
  "language",
  "user";

INSERT INTO "user" ("id", "username", "name", "password")
VALUES
  (
    1,
    'admin',
    'Administrator',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  ),
  (
    2,
    'demo',
    'DemoUser',
    'Demo123!'
  );

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'JavaScript', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "next")
VALUES
  (1, 1, 'hello!', 'string', 2),
  (2, 1, 'false', 'boolean', 3),
  (3, 1, 'null', 'null', 4),
  (4, 1, '{key: value}', 'object', 5),
  (5, 1, '2', 'number', 6),
  (6, 1, 'undefined', 'undefined', 7),
  (7, 1, 'function hi(hello) { return string; }', 'undefined', 8),
  (8, 1, '___ (let i = 0; i < input.length; i++)...', 'for', 9),
  (9, 1, '_____ (list.head !== null)...', 'while', 10),
  (10, 1, '__ (i === 3)...', 'if', null);

UPDATE "language" SET head = 1 WHERE id = 1;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

COMMIT;
