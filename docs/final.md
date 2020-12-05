## Team Name: zayin

## Application Name: FairShare

## Semester: Fall 2020

## Application Overview:
Fair Share is an application intended to enable students to share their experiences at career fairs with their peers and interact with them on the subject. Inspired by a feature on the career networking platform Handshake where students can share their experience working at a company, we felt it would be useful for students to share and exchange notes about their experiences at career fairs (such as interacting with talent acquisition employees, what certain companies look for over others, and much more)—especially since this concept has not been implemented yet. The core objective of this application is achieved by allowing students to make accounts with FairShare, add posts relating their personal experiences at specific career fairs, and interact with other posts by liking posts. 

## Team Overview:
Members: Anthony Woo, Atmaja Shah, Shivani Patel 
GitHub Usernames: anthonytwoo, atmajashah, shipatel

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

| URL Routes          		  | Description                                              |
|---------------------------------|----------------------------------------------------------|
| career-fair-list     		  | Used to obtain a list of all available career fairs in   |      
| 		    	          | the database. Accessed by clicking the "Career Fairs"    |
|				  | button at the top of every page. Requires users to login |
|				  | before they can access the page			     | 
| career-fair/:careerfairId       | Used to access a list of all posts that have the same    | 
| 			          | career fair ID. Accessed by clicking on a particular     |
|				  | career fair on the "Career Fairs" page. Requires users   |
|			          | to login before they can access the page		     | 
| create-career-fair	          | Used to create a career fair. Accessed by clicking the   | 
| 			          | "Add Career Fair" button at the top of the page. Requires|
|			  	  | users to login before they can access the page	     |
| edit-post/:cfId/:postId	  | Takes user to a page where they can edit their post      | 
| 			          | based on ID. Accessed by clicking the "Edit" button      |
|				  | underneath their post. Requires users to login before    | 
| 			          | they can access the page				     | 
| sign-in			  | Used to access the sign in and sign up page. Accessed    | 
| 			          | by clicking the "Sign up/Sign in" button at the top of   |
|				  | the page     			    		     | 
| private			  | Once the user has logged in, it takes in the request     |
|				  | username and redirects to /private/:username/ which takes| 
|				  | users to the private homepage. Checks to see if user is  |
|				  | signed in before they can access the home page	     | 
| private/:username		  | Takes user to the private homepage from /private/. Checks|
|				  | to see if user is signed in before they can access the   |
|				  | homepage						     | 
| logout			  | Takes user to the public homepage. Accessed by clicking  |
|				  | the "Logout" button at the top of the screen. Must be    |
|				  | signed in to see this button.			     |


## Authentication/Authorization:
The process of authenticating a user proceeds as follows: When a user creates an account, they enter a username and password; the database stores the username as is, however it encrypts the password with a salt and hash and stores the hash in the database. If the username already exists, the server returns a message to inform the user that they cannot use the username. However, if the username does not exist, the server returns a message to inform the user that their account was successfully created. When a user signs in, they enter their username and password. Once the server receives the username and password, it first checks the database to see if the username exists. Since the actual password is not stored in the database, the server checks for the salt and hash values associated with the specific username. If the password authentication fails or the username does not exist in the database, then the server will return a message to inform the user that they entered the incorrect username or password. When sign in credentials are entered incorrectly, the server also times out for two seconds to prevent constant spamming of incorrect credentials. On the other hand, if the user has been authenticated successfully, they are automatically redirected to the homepage, where they are welcomed with their username. Once the user has signed in, they can create posts, interact with other posts, and access other pages. Once they logout, they will only be able to access the homepage. If they try to naviagte to any other page, it will automatically redirect them to the Sign up/Sign in page.

## Division of Labor:
#### Anthony Woo: 
#### Atmaja Shah:
#### Shivani Patel:

## Conclusion:
Overall, the process of developing FairShare served as a valuable learning experience. My teammates and I were unfamiliar with Javascript, HTML, and CSS prior to this class, however, learning the relevant material in lecture helped us implement the various aspects of our web application that were required at each stage. While we struggled a bit in developing the wireframes, the implementation of the front-end of the web application with Javascript and the back-end of the web application with Node.js along with the integration proved to be much more challenging. It took time for us to figure out how to structure the endpoints, complete the corresponding back-end skeleton code, implement the database, and deploy it to Heroku. However, going through this process with a team was very informative, because it provided an accurate representation of how web applications are developed in the real world (by that I mean in stages and generally with a team). One of us would always have something acting up or not working (whether someone was unable to get the local dummy server to work or had an endpoint malfunctioning among other problems). However, over the course of long Zoom sessions with eachother and help from the teaching assistants, we were able to complete the necessary tasks. I think more than anything, this project taught us the value of teamwork and not giving up when something is not working. It would have been useful to have prior familiarity with the coding languages, Heroku, and Postgres, so that we would not have spent so much time trying to properly design the foundation of the web application and could have made it final product more visually appealing. Nevertheless, it was very rewarding to see the final product come together.
