
CREATE TABLE Users (
    username varchar(255),
    salt varchar(255),
    hash varchar(255),
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
    careerFairID int,
    companyID int,
    Title varchar(255),
    Rating int,
    Comment varchar(2000),
    PRIMARY KEY (postID),
    FOREIGN KEY (username) REFERENCES Users(username),
    FOREIGN KEY (careerFairID) REFERENCES CareerFairs(careerFairID),
    FOREIGN KEY (companyID) REFERENCES Companies(companyID)
);

CREATE TABLE Likes (
    postID int,
    username varchar(255),
    FOREIGN KEY (postID) REFERENCES Posts(postID) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES Users(username)
);