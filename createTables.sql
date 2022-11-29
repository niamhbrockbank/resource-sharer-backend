DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS resource_tags CASCADE;
DROP TABLE IF EXISTS study_list CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS resource_likes CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS content_types CASCADE;

CREATE TABLE tags
(
	tag_name VARCHAR(255) PRIMARY KEY
);

CREATE TABLE users
(
	user_id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	is_faculty BOOLEAN
);

CREATE TABLE content_types 
(
  type VARCHAR(255) PRIMARY KEY
);

INSERT INTO content_types
VALUES ('Article'), 
      ('Video'), 
      ('Documentation'),
      ('Image'), 
      ('Tweet'), 
      ('Other');

CREATE TABLE resources
(
	resource_id SERIAL PRIMARY KEY,
	resource_name VARCHAR(255),
	author_name VARCHAR(255),
	url VARCHAR(2048) UNIQUE,
	description VARCHAR(500),
	content_type TEXT,
	time_date TIMESTAMP DEFAULT NOW(),
	rating INTEGER,
	notes VARCHAR(255),
	user_id INTEGER,
	
  	CONSTRAINT rating_check CHECK (rating >= 0 AND rating <= 100),
  	CONSTRAINT fk_content_type FOREIGN KEY(content_type) REFERENCES content_types(type),
	CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE resource_tags 
(
	resource_id INTEGER,
	tag_name VARCHAR(255),
	
	CONSTRAINT fk_resource FOREIGN KEY(resource_id) REFERENCES resources(resource_id),
	CONSTRAINT fk_tag FOREIGN KEY(tag_name) REFERENCES tags(tag_name),
	
	PRIMARY KEY(resource_id, tag_name)
);

CREATE TABLE comments 
(
	comment_id SERIAL PRIMARY KEY,
	resource_id INTEGER,
	comment_body VARCHAR(500),
	user_id INTEGER,

	CONSTRAINT fk_resource FOREIGN KEY(resource_id) REFERENCES resources(resource_id) on delete cascade,
	CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE study_list
(
	user_id INTEGER,
	resource_id INTEGER,

	PRIMARY KEY(user_id, resource_id)
);

CREATE TABLE resource_likes
(
	resource_id INTEGER,
	user_id INTEGER,
	liked BOOLEAN,

	PRIMARY KEY(user_id, resource_id),
	
	CONSTRAINT fk_resource FOREIGN KEY (resource_id) 
		REFERENCES resources(resource_id) ON DELETE CASCADE,
	CONSTRAINT fk_user FOREIGN KEY (user_id) 
		REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE comment_likes
(
	comment_id INTEGER,
	user_id INTEGER,
	liked BOOLEAN,
	PRIMARY KEY(comment_id, user_id),

	CONSTRAINT fk_comment FOREIGN KEY (comment_id) 
		REFERENCES comments(comment_id) ON DELETE CASCADE,
	CONSTRAINT fk_user FOREIGN KEY (user_id)
		REFERENCES users(user_id) ON DELETE CASCADE
); 