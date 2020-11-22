CREATE TABLE Users (
	username varchar(255),
	salt varchar(255),
	hash varchar(255),
	PRIMARY KEY (username)
);


Users table
| Column       | Data Type | Description                                      |
|--------------|-----------|--------------------------------------------------|
| username     | String    | The user’s unique identifier                     |
| salt         | String    | Random data used as an input to a function that  |                  
|              |           | hashes data                                      |
| hash         | String    | Used to pair keys to values                      |







CREATE TABLE CareerFairs (
	careerFairID SERIAL,
	careerFairName varchar(255),
	type varchar(255),
	school varchar(255),
	date date,
	PRIMARY KEY (careerFairID)
);


CareerFairs table
| Column           | Data Type | Description                                  |
|------------------|-----------|----------------------------------------------|
| careerFairID     | SERIAL    | The career fair’s unique identifier          |
| careerFairName   | String    | The name of a particular career fair         |                  
| type             | String    | Type of career fair (subjects/specialties    |                               
| school           | String    | The school that the fair was hosted at       |
| date             | date      | The date of the career fair                  |





CREATE TABLE Companies (
	companyID SERIAL,
	companyName varchar(255),
	companyLocation varchar(255),
	companyType varchar(255),
careerFairID int,
PRIMARY KEY (companyID),
FOREIGN KEY (careerFairID) REFERENCES CareerFairs(careerFairID)
);

Companies table
| Column           | Data Type | Description                                  |
|------------------|-----------|----------------------------------------------|
| company ID       | SERIAL    | The company’s unique identifier              |
| companyName      | String    | The name of a particular company             |                 
| companyLocation  | String    | The location of a particular company (city)  |         
| companyType      | String    | Type of company (subjects/specialties        |                               
| careerFairID     | Integer   | The career fair’s unique identifier          |   
|                  |           | (references careerFairs table)               |



CREATE TABLE Posts (
	postID SERIAL,
	username varchar(255),
	careerFairID int,
	companyID int,
	Title varchar(255),
	Rating int,
	Comment varchar(2000),
	PRIMARY KEY (postID),
	FOREIGN KEY (username) REFERENCES Users(username)
	FOREIGN KEY (careerFairID) REFERENCES CareerFairs(careerFairID),
	FOREIGN KEY (companyID) REFERENCES Companies(companyID)
);


Posts table
| Column           | Data Type | Description                                  |
|------------------|-----------|----------------------------------------------|
| PostID           | SERIAL    | The post’s unique identifier                 |
| username         | String    | The unique name of the user who created the  |
|                  |           | post (references the Users table)            |                 
| careerFairID     | Integer   | The unique identifier of a particular career |  
|                  |           | fair (references the careerFairs table)      |         
| companyID        | Integer   | The unique identifier of a particular company|  
|                  |           | (references the Companies table)             |  
| Title            | String    | Title of the post set by user                |                               
| Rating           | Integer   | Evaluates the career fair on a scale from 1-5|   
| Comment          | String    | A comment where the user can enter upto 2000 |  
|                  |           | characters regarding the specifics of their  |         
|                  |           | fair experience                              |



CREATE TABLE Likes (
	postID int,
	username varchar(255)
	FOREIGN KEY (postID) REFERENCES Posts(postID),
	FOREGIN KEY (username) REFERENCES Users(username)
);

Likes table
| Column           | Data Type | Description                                  |
|------------------|-----------|----------------------------------------------|
| PostID           | SERIAL    | The liked post’s unique identifier           |      
|                  |           | (references the Posts table)                 |
| username         | String    | The unique name of the user who liked the    |
|                  |           | post (references the Users table)            |      



Division of labor breakdown:

Anthony-
-Restructured Database
-Functions with Career Fairs 
 -Filter in List of Career Fairs
 -List of Companies in Career Fair
 -Create Career Fair Page
-Functions with Posts
 -List of Posts in Career Fair
 -Create Post in Career Fair
 -Like Function
 -Delete Function
 -(Working on Edit Comment Function)
-Functions with Sign in
 -Reconstruct Navbar for Login & Logout

Atmaja- 
-Authentication for Sign Up/Create Account
-Encryption for Sign Up with database 
-Authentication for Sign In/Login
-Encryption for Sign In with database
-Readjusted Layout for Posts in Career Fair Page
-Enabled Star Rating
-Form 

Shivani-   
-Restructured Likes table 
-Functions with Posts
 -Get Like function
 -Add Like Function
 -Delete Function
-Functions with Sign in
 -Working on restructuring login/sign up

