CREATE TABLE 'gamelist' (
	'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'title' TEXT,
	'authors' TEXT,
	'description' TEXT DEFAULT '...',
	'when_added' DATETIME DEFAULT CURRENT_TIMESTAMP,
	'added_by' TEXT,
	'gamedir' TEXT DEFAULT 'games/',
	'gamefile' TEXT,
	'status' INTEGER DEFAULT 0
)