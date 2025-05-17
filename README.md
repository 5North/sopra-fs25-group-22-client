<p align="center">
  <img src="public/images/readme.png" alt="Project preview" />
</p>


[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=5North_sopra-fs25-group-22-server&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=5North_sopra-fs25-group-22-server)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=5North_sopra-fs25-group-22-server&metric=coverage)](https://sonarcloud.io/summary/new_code?id=5North_sopra-fs25-group-22-server)
![CI/CD](https://img.shields.io/github/actions/workflow/status/5north/sopra-fs25-group-22-server/main.yml?label=CI%2FCD)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🧹Scopa for Beginners

This repository only contains the code of the frontend. For the backend implementation, check out this 
[repo](https://github.com/5North/sopra-fs25-group-22-server).

## 📖 Table of Contents

* [🗒️ Introduction](#introduction)
* [💡 Technologies](#technologies)
* [⚙️ High-Level Components](#high-level-components)
    * [Rest](#rest)
    * [Websocket](#websocket)
    * [Database](#database)
    * [Service](#service)
    * [Game Logic](#game-logic)
    * [Ai Assistance](#ai-assistance)
* [🛠️ Launch & Deployment](#launch--deployment)
* [🚀 Roadmap](#roadmap)
* [🖋️ Authors & Acknowledgments](#authors--acknowledgments)
* [📜 License](#license)

<h2 id="introduction">🗒️ Introduction</h2>

🧹**Scopa for Beginners**🧹 aims to bring the beloved traditional italian cards game [Scopa](https://en.wikipedia.org/wiki/Scopa) 
to an international audience by creating an accessible digital version of the 2 versus 2 variant. The goal of this project is to create a user and 
beginner-friendly application client-server to allow both newcomers and hardcore fans of the game to conveniently play 
Scopa in their browser. To make it easier for beginners to learn the rules and achieve some flow, an integrated LLM 
assistant can suggest some possible options to play if help requested by the player. Real time communication via Websockets
allows to play this timeless classic with your friends without noticeable hiccups on a simple and no-fuss application,
that propose itself as an open source alternative to the usually paywalled or ads-filled commercial versions. 

<h2 id="technologies">💡 Technologies</h2>

* [Typescript](https://www.typescriptlang.org/) - Static typing and compiles to plain JavaScript
* [CSS](https://sass-lang.com/) - stylesheet language used to describe the presentation of HTML and XML documents.
* [React](https://react.dev/) - JavaScript library for building declarative, component-based user interfaces.
* [STOMP](https://stomp-js.github.io/stomp-websocket/) - Text oriented protocol over WebSocket
* [SonarQube](https://www.sonarsource.com/products/sonarqube/) - open-source platform for continuous inspection of code quality.
* [Figma](https://www.figma.com/) - browser-based tool for interface design and prototyping with real-time collaboration.


<h2 id="high-level-components">⚙️ High-level components</h2>

### Registration, Login and Home

The first page displayed when visiting our deployed [Website] (https://sopra-fs25-group-22-client.vercel.app), allows to [register as a user] (https://github.com/5North/sopra-fs25-group-22-client/blob/main/app/register/page.tsx), or [log in](https://github.com/5North/sopra-fs25-group-22-client/blob/main/app/login/page.tsx) if an account was already created. 

In the [homepage](https://github.com/5North/sopra-fs25-group-22-client/blob/main/app/home/page.tsx), the users see their own statistics (wins, losses and ties), as well as the options to start a game, join an existing lobby, view the ranking over all registered users and the Rules. 

### Lobby
When a users starts a game, they get redirected to the [lobbypage] (https://github.com/5North/sopra-fs25-group-22-client/blob/main/app/lobbies/%5Bid%5D/page.tsx), where a Game ID consisting of 4 digits is displayed and is to be shared with other users, to play Scopa together. 

A [joining] (https://github.com/5North/sopra-fs25-group-22-client/blob/main/app/join/page.tsx) user can enter the Game ID via 'Join a Game'.
All players in the same lobby can see who enters and leaves the lobby, as well as who which 2 players are in the same team.

The Host can only start a game, when there are 4 players in the lobby.

### Game
After the Host starts the game, all players from the lobby get redirected to the [game] (https://github.com/5North/sopra-fs25-group-22-client/blob/main/app/game/%5Bid%5D/page.tsx). 

In the [gameview](https://github.com/5North/sopra-fs25-group-22-client/blob/main/app/components/ScopaGameView.tsx) each players is only able to see their own cards on the bottom, and the cards on the table. When hovering over these cards, the value and suit of the card is displayed. The cards of the other players are upside down. 

Team mates are displayed to the opposite of each other.

A neon green dot next to a players name, signals to all players whose turn it is. 

On the top to the right an AI button is visible, which can only be clicked by the player, if its their turn. This allos the player to get suggestions on what next move to play.

A timer counting down from 30 seconds, shows how long the current player has, to make his play. If the user does not click on any card, a random card of their deck is choosen and played.

Whenever a players does scopa (clears the table), an animation is displayed to all users. In addition, the counter next to the players who did scopa, adds +1.

Each user can quit the game at any time and leave the game. 

### Game Result
After a game has ended, the [results] (https://github.com/5North/sopra-fs25-group-22-client/blob/main/app/components/GameResultView.tsx) are displayed to each user with the breakdown of their team and the opponent teams breakdown according to the scoring rules. 

The players have the option to either leave the lobby and 'Return to Home', which will redirect the user to the homepage.

If a player wants a [rematch] (https://github.com/5North/sopra-fs25-group-22-client/blob/main/app/rematch/%5Bid%5D/page.tsx), they get redirect to the rematch page. Players who choose to have a rematch, are able to see other players, who have aso choosen to have a reamtch. 
Again, if there are 4 players, the host can start a new game.

### Rules
User are able to view the [rules] (https://github.com/5North/sopra-fs25-group-22-client/blob/main/app/rules/page.tsx) of Scopa, to better understand on how to play the game. 
The rulespage include, game setup, turn flow, capture rules and scenarios, scoring rules, end-of-game process and finally a display of Napoletane cards.


<h2 id="launch--deployment">🛠️ Launch & Deployment</h2>

### Prerequisites and Installation
For your local development environment, you will need Node.js.\
We urge you to install the exact version **v20.11.0** which comes with the npm package manager. You can download it [here](https://nodejs.org/download/release/v20.11.0/).\
If you are confused about which download to choose, feel free to use these direct links:

- **MacOS:** [node-v20.11.0.pkg](https://nodejs.org/download/release/v20.11.0/node-v20.11.0.pkg)
- **Windows 32-bit:** [node-v20.11.0-x86.msi](https://nodejs.org/download/release/v20.11.0/node-v20.11.0-x86.msi)
- **Windows 64-bit:** [node-v20.11.0-x64.msi](https://nodejs.org/download/release/v20.11.0/node-v20.11.0-x64.msi)
- **Linux:** [node-v20.11.0.tar.xz](https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz) (use this [installation guide](https://github.com/nodejs/help/wiki/Installation#how-to-install-nodejs-via-binary-archive-on-linux) if you are new to Linux)

If you happen to have a package manager the following commands can be used:

- **Homebrew:** `brew install node@20.11.0`
- **Chocolatey:** `choco install nodejs-lts --version=20.11.0`

After the installation, update the npm package manager to **10.4.0** by running ```npm install -g npm@10.4.0```\
You can ensure the correct version of node and npm by running ```node -v``` and ```npm --version```, which should give you **v20.11.0** and **10.4.0** respectively.\
Before you start your application for the first time, run this command to install all other dependencies, including React:

```npm install```

Next, you can start the app with:

```npm run dev```

Now you can open [http://localhost:3000](http://localhost:3000) to view it in the browser.\
Notice that the page will reload if you make any edits. You will also see any lint errors in the console (use a Chrome-based browser).\
The client will send HTTP requests to the server which can be found [here](https://github.com/HASEL-UZH/sopra-fs24-template-server).\
In order for these requests to work, you need to install and start the server as well.

#### Testing
Testing is optional, and you can run the tests with `npm run test`\
This launches the test runner in an interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

> For macOS user running into a 'fsevents' error: https://github.com/jest-community/vscode-jest/issues/423

#### Build
Finally, `npm run build` builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance:\
The build is minified, and the filenames include hashes.<br>

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

<h2 id="illustrations">Illustrations</h2>

<p align="center">
  <img src="public/images/register-login.png" alt="Register-and-Login" />
</p>

This is the first page that appears when following the the [link](https://sopra-fs25-group-22-client.vercel.app)

<p align="center">
  <img src="public/images/home.png" alt="Home" />
</p>

After successfully registering or logginf into an account the homepage is displayed.

<p align="center">
  <img src="public/images/start-game.png" alt="Starting game" />
</p>

After creating a game, the game ID and the joined players are displayed.

<p align="center">
  <img src="public/images/join.png" alt="Joining Game" />
</p>

The players can enter the game ID to join an existing lobby

<p align="center">
  <img src="public/images/game.png" alt="Game" />
</p>

After the host starts the game, all players get redirected to the game.

<p align="center">
  <img src="public/images/gameresult.png" alt="Gameresult" />
</p>

When the game has ended, the breakdown of the game is displayed.

<p align="center">
  <img src="public/images/rules.png" alt="Rules" />
</p>

For Beginners to understand on how to play the game, all the rules and information can be viewed here.


<h2 id="roadmap">🚀 Roadmap</h2>

- Implement a 1 versus 1 game mode
- Add the option to choose teams in the 2 versus 2 game.
- Add more encouragement messages
- Add language localization (IT, DE, FR ...)
- Implement to choose from different card decks
- Smoother movement of cards while playing

<h2 id="authors--acknowledgments">🖋️ Authors & Acknowledgements</h2>

### Authors

* [5North](https://github.com/5North)
* [Stefano Benzoni](https://github.com/sbenzo99)
* [Seyda Gündüz](https://github.com/Seydi89)
* [Shellmy Chakkaith](https://github.com/shellmychakkaith)

### Acknowledgements

We would like to thank our tutor []() for his support and guidance during this course, as well as all the teaching and 
tutoring team of the Sopra course.

<h2 id="license">📜 License</h2>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This work is licensed under the MIT License - see the LICENSE.md file for details.

The project is based on the [sopra-fs25-template-client](https://github.com/HASEL-UZH/sopra-fs25-template-client)
, which is licensed under the Apache 2.0 license - see the LICENSE.Apache-2.0 file for the original notice.
