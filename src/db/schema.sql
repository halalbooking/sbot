DROP TABLE IF EXISTS issues;
CREATE TABLE issues (
    issueId INT PRIMARY KEY,
    issueNum INT,
    threadId TEXT,
    title TEXT,
    status TEXT CHECK(Status IN ('open', 'closed'))
);