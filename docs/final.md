## Team Name: zayin

## Application Name: FairShare

## Semester: Fall 2020

## Application Overview:
Fair Share is an application intended to enable students to share their experiences at career fairs with their peers and interact with them on the subject. Inspired by a feature on the career networking platform Handshake where students can share their experience working at a company, we felt it would be useful for students to share and exchange notes about their experiences at career fairs (such as interacting with talent acquisition employees, what certain companies look for over others, and much more)—especially since this concept has not been implemented yet. The core objective of this application is achieved by allowing students to make accounts with FairShare, add posts relating their personal experiences at specific career fairs, and interact with other posts by liking posts. 

## Team Overview:
Members: Anthony Woo, Atmaja Shah, Shivani Patel GitHub 
Usernames: anthonytwoo, atmajashah, shipatel

## User Interface:

## APIs:

## Database:

CREATE TABLE Users (
	username varchar(255),
	salt varchar(255),
	hash varchar(255),
	PRIMARY KEY (username)
);

Users Table
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

CareerFairs Table
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

Companies Table
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

Posts Table
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

Likes Table
| Column           | Data Type | Description                                  |
|------------------|-----------|----------------------------------------------|
| PostID           | SERIAL    | The liked post’s unique identifier           |      
|                  |           | (references the Posts table)                 |
| username         | String    | The unique name of the user who liked the    |
|                  |           | post (references the Users table)            |   

## URL Routes/Mappings:

## Authentication/Authorization:

## Division of Labor:
#### Anthony Woo: 
#### Atmaja Shah:
#### Shivani Patel:

## Conclusion:
Overall, the process of developing FairShare served as a valuable learning experience. My teammates and I were unfamiliar with Javascript, HTML, and CSS prior to this class, however, learning the relevant material in lecture helped us implement the various aspects of our web application that were required at each stage. While we struggled a bit in developing the wireframes, the implementation of the front-end of the web application with Javascript and the back-end of the web application with Node.js along with the integration proved to be much more challenging. It took time for us to figure out how to structure the endpoints, complete the corresponding back-end skeleton code, implement the database, and deploy it to Heroku. However, going through this process with a team was very informative, because it provided an accurate representation of how web applications are developed in the real world (by that I mean in stages and generally with a team). One of us would always have something acting up or not working (whether someone was unable to get the local dummy server to work or had an endpoint malfunctioning among other problems). However, over the course of long Zoom sessions with eachother and help from the teaching assistants, we were able to complete the necessary tasks. I think more than anything, this project taught us the value of teamwork and not giving up when something is not working. It would have been useful to have prior familiarity with the coding languages, Heroku, and Postgres, so that we would not have spent so much time trying to properly design the foundation of the web application and could have made it final product more visually appealing. Nevertheless, it was very rewarding to see the final product come together.
