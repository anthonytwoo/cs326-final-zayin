CREATE TABLE Users (
    username varchar(255),
    password varchar(255),
    PRIMARY KEY (username)
);

CREATE TABLE CareerFairs (
    careerFairID SERIAL,
    careerFairName varchar(255),
    type varchar(255),
    school varchar(255),
    date date,
    PRIMARY KEY (careerFairID)
);

CREATE TABLE Companies (
    companyID SERIAL,
    companyName varchar(255),
    companyLocation varchar(255),
    companyType varchar(255),
    careerFairID int,
    PRIMARY KEY (companyID),
    FOREIGN KEY (careerFairID) REFERENCES CareerFairs(careerFairID)
);

CREATE TABLE Posts (
    postID SERIAL,
    username varchar(255),
    school varchar(255),
    careerFairID int,
    companyID int,
    postRating int,
    postComment varchar(2000),
    upVote int,
    downVote int,
    PRIMARY KEY (postID),
    FOREIGN KEY (careerFairID) REFERENCES CareerFairs(careerFairID),
    FOREIGN KEY (companyID) REFERENCES Companies(companyID)
);