INSERT INTO users (name, is_faculty)
	VALUES 
    	('Niamh', false),
        ('Melissa', false),
        ('Neill', true),
        ('Will', false),
        ('Leo', false),
        ('Guest', false);

INSERT INTO tags
	VALUES
    	('TypeScript'),
        ('Express'),
        ('Cypress'),
        ('React'),
        ('Firebase'),
        ('CSS'),
        ('Backend'),
        ('Frontend'),
        ('Authentication'),
        ('Styling'),
    	('Socket.io');
        
INSERT INTO resources (resource_name, 
                       author_name, 
                       url, 
                       description, 
                       content_type,
                       rating,
                       notes,
                       user_id)
	VALUES
    	('Socket-io server initialisation', 
         	'Socket.io', 
         	'https://socket.io/docs/v4/server-initialization/',
        	'Initialising an Express server with socket.io.',
         	'Documentation',
         	60,
         	'Has TypeScript specific details. Is not the simplest to follow for first time set up',
         	1
        ),
        ('Firebase authentication in Cypress tests', 
         	'Joshua Morony', 
         	'https://m.youtube.com/watch?v=JqEzA44Lsts',
        	'Bypassing login with Google in a Cypress test.',
        	'Video',
        	90,
        	'Easy to follow, step by step instructions. Beginner friendly',
        	2
        ),
        ('Firebase React authentication',
         	'Yusuff Faruq',
         	'https://blog.logrocket.com/user-authentication-firebase-react-apps/',
         	'Using Firebase to login with Google.',
         	'Article',
         	75,
         	'Comprehensive but not necessarily in the order that it is useful',
         	3
         ),
         ('CSS shadow generator',
          	'Josh W Comeau',
     		'https://www.joshwcomeau.com/shadow-palette/',
          	'Generate ‘realistic’ looking shadows.',
          	'Article',
          	80,
          	'Interactive. Use of CSS variables may be confusing if not encountered before.',
          	4
          );

INSERT INTO resource_tags (resource_id, tag_name)
	VALUES
    	(1, 'TypeScript'),
        (1, 'Socket.io'),
        (1, 'Express'),
        (1, 'Backend'),
        (2, 'Firebase'),
        (2, 'Authentication'),
        (2, 'Cypress'),
        (2, 'Frontend'),
       	(3, 'Firebase'),
        (3, 'React'),
        (3, 'Authentication'),
        (3, 'Frontend'),
        (4, 'CSS'),
        (4, 'Styling'),
        (4, 'Frontend');

INSERT INTO comments (resource_id, comment_body, user_id)
	VALUES
    	(1, 'This is amazing!', 2),
        (1, 'Thanks for sharing.', 3),
        (2, 'Not my cup of tea.', 4),
        (2, 'Thanks though!', 4),
        (3, 'Have used this so many times', 5),
        (4, 'Looking forward to using this', 6);

INSERT INTO resource_likes (resource_id, user_id, liked)
	VALUES
    	(1, 2, true),
        (1, 3, true),
        (1, 4, true),
        (2, 4, false),
        (2, 5, false),
        (2, 1, true),
        (2, 2, true), 
        (2, 3, true),
        (3, 1, true),
        (4, 1, false),
        (4, 2, true), 
        (4, 3, true),
        (4, 4, true);
        
INSERT INTO study_list (user_id, resource_id)
	VALUES
    	(1, 1),
        (1, 2),
        (2, 1),
        (3, 1),
        (3, 2),
        (3, 3),
        (4, 3),
        (5, 4),
        (6, 1),
        (6, 4);

