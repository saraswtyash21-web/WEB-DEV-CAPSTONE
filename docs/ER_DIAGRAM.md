# CampusLibrary data model

```mermaid
erDiagram
  USER ||--o{ ISSUE_RECORD : borrows
  USER ||--o{ ISSUE_RECORD : issues
  BOOK ||--o{ ISSUE_RECORD : appears_in

  USER {
    ObjectId _id PK
    string name
    string email UK
    string password_hash
    enum role
    string refreshTokenHash
    datetime createdAt
  }
  BOOK {
    ObjectId _id PK
    string title
    string author
    string category
    string isbn UK
    string description
    string coverUrl
    number totalCopies
    number availableCopies
    datetime createdAt
  }
  ISSUE_RECORD {
    ObjectId _id PK
    ObjectId student FK
    ObjectId book FK
    ObjectId issuedBy FK
    datetime issueDate
    datetime dueDate
    datetime returnedAt
    number fineAmount
    datetime createdAt
  }
```

`IssueRecord.student` and `IssueRecord.issuedBy` both reference `User`; `IssueRecord.book` references `Book`. A null `returnedAt` means the loan is active. The book's `availableCopies` count is updated when a loan is issued or returned. Indexes support book search/filtering and active-loan / due-date queries.

The app uses the `users`, `books`, and `issues` collections inside its dedicated `campuslibrary` database.
