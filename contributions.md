# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@shellmychakkaith** | 30.05   | [https://github.com/5North/sopra-fs25-group-22-client/commit/1b61142a9e6efd768c683837beda2017644efce3 | login functionality | registered users can log in|
|                    | 30.05   |  | Redirection to homepage | Only registered/logged in users can access application |
| **@sbenzo99**      | 27.03    | https://github.com/5North/sopra-fs25-group-22-server/commit/944795fe4f3cf9674c4e01073b33a2e7b1581402               | Create a new POST endpoint (e.g. /users/) #6| Essential for user creation         |
| **@sbenzo99**      | 27.03    | https://github.com/5North/sopra-fs25-group-22-server/commit/64363f782a3829b7fad52c5cb8b99acc2b5d5564                | Logic to check if Username exists already #7| Prevents duplicate usernames        |
| **@sbenzo99**      | 28.03    | https://github.com/5North/sopra-fs25-group-22-server/commit/9e090c085461296a03c9be2a2ca1afd1eff051d8                 | Generate a session token (registration) #8 | Enables secure session management   |
| **@sbenzo99**      | 28.03    | https://github.com/5North/sopra-fs25-group-22-server/commit/944795fe4f3cf9674c4e01073b33a2e7b1581402                 | Save the user in the UserRepository    #9  | Ensures persistent storage of user  |
| **@sbenzo99**      | 31.03    | https://github.com/5North/sopra-fs25-group-22-server/commit/1573cfd84bf3936a7a4f7517a37b2829ccbc8bad                | method to shuffle the Deck correctly   #92  | Must be done to play regularily     |
| **@sbenzo99**      | 31.03    | (https://github.com/5North/sopra-fs25-group-22-server/commit/1573cfd84bf3936a7a4f7517a37b2829ccbc8bad)                | Implement the Deck and Card class    #91    | Providesstructure for card game(s)  |
| **@5North** | 26.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/b58799a4c5c9423048a22c726fd3395ae4bfc9e6 | Add post mapping for login | Allows the server to receive and process login post requests from the client |
| **@5North** | 26.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/b4e92540ce8493a6c9e549427d15ba129d78f2fa | Add tests for the login post mapping | Allows to test the login post mapping |
| **@5North** | 26.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/e6ec25a0f144b3908da4bada49ff8d5a19d7025e | Add password field to User enitity, plus setters and getters | Allows the server to have the password persisted along with the user |
| **@5North** | 26.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/e0040980b9472d476c2ff165733b31289b592e72 | Update tests with password field | Fix the old tests which would otherwise be broken, since password is a required field  |
| **@5North** | 27.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/e7a1b1866972efb4bea73af2017ba7b8d9a26664 | Add method to login in UserService | Allows server to authenticate user upon login and sends back session token for authentication |
| **@5North** | 27.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/3253d5a25867bcd33f6d72fdc154d26aa0dc9e1f | Add tests for login method | Allows to test the login method  |
| **@5North** | 28.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/7629b7f4a0248a0ab4e467e5a45de9222242792c | Add logout post endpoint, update docs  | Allows the server to receive and process logout post requests from the client, update REST specs |
| **@5North** | 28.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/563efc7bc0c04006f8200e3ea221c7aa35b52969 | Add method for user logout and method to authenticate user requests with token | Allows the server to logout user and authenticate user requests with token |
| **@5North** | 28.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/da30bd24b8c2b94ca34fedfe8c4a5105e78847d4 | Add find by token in UserRepository | Allows to find persisted user by token value |
| **@5North** | 28.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/eab96c6dc720119021b2fedf24fc0f1f475d4868 | Add tests related to logout endpoint, logout, authentication and findByUsername methods | Allows to test the newly introduced changes |
| **@5North** | 29.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/ff4a554e9745d5f2ec48c67f96cf2bdca90ef5e8 | Change login endpoint method to require POSTDTOs as input | Allows for greater consistency within the controller and aligns with the client |
| **@5North** | 29.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/73aab6313cb57da734e9672745b77b1fa8a2acb9 | Expose custom token header to all origins | Allows the client to access the token header value |
| **@5North** | 31.03.2025   | https://github.com/5North/sopra-fs25-group-22-server/commit/5f8f9ed2dbafd65adc1e456f24ebed25eb5fa394 | Add base implementation of Card and Suit classes, plus tests | Allows the server to have necessary representations of  the card deck and to test them. |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 2 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 3 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 4 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 5 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 6 - [Begin Date] to [End Date]

_Continue with the same table format as above._
