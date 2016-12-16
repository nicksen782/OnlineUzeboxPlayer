PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE games
    (
      id INTEGER  PRIMARY KEY AUTOINCREMENT,
      title VARCHAR,
      authors text,
      description text ,
      lastupload datetime NOT NULL,
      addedby VARCHAR,
      validheader VARCHAR,
      binhash VARCHAR
    );
COMMIT;

INSERT INTO table VALUES(1,'Super Cool Game','nicksen782','This is the best game ever created!',datetime(CURRENT_TIMESTAMP, 'localtime'),'nicksen782','1', NULL);

