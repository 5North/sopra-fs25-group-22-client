```
███████╗ ██████╗ ██████╗ ██████╗  █████╗     ███████╗ ██████╗ ██████╗   
██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗    ██╔════╝██╔═══██╗██╔══██╗  
███████╗██║     ██║   ██║██████╔╝███████║    █████╗  ██║   ██║██████╔╝  
╚════██║██║     ██║   ██║██╔═══╝ ██╔══██║    ██╔══╝  ██║   ██║██╔══██╗  
███████║╚██████╗╚██████╔╝██║     ██║  ██║    ██║     ╚██████╔╝██║  ██║  
╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝    ╚═╝      ╚═════╝ ╚═╝  ╚═╝  
                                                                        
██████╗ ███████╗ ██████╗ ██╗███╗   ██╗███╗   ██╗███████╗██████╗ ███████╗
██╔══██╗██╔════╝██╔════╝ ██║████╗  ██║████╗  ██║██╔════╝██╔══██╗██╔════╝
██████╔╝█████╗  ██║  ███╗██║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝███████╗
██╔══██╗██╔══╝  ██║   ██║██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗╚════██║
██████╔╝███████╗╚██████╔╝██║██║ ╚████║██║ ╚████║███████╗██║  ██║███████║
╚═════╝ ╚══════╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚══════╝
```
#

![CI/CD](https://img.shields.io/github/actions/workflow/status/5north/sopra-fs25-group-22-client/verceldeployment.yml?label=Deployement)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🧹Scopa for Beginners

This repository only contains the code of the backend. For the frontend implementation, check out this
[repo](https://github.com/5North/sopra-fs25-group-22-client).

## 📖 Table of Contents

* [🗒️ Introduction](#introduction)
* [💡 Technologies](#technologies)
* [⚙️ High-Level Components](#high-level-components)
   * [example](#example)
* [🛠️ Launch & Deployment](#launch--deployment)
* [🏞️ Illustrations](#illustrations)
* [🚀 Roadmap](#roadmap)
* [🖋️ Authors & Acknowledgments](#authors--acknowledgements)
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

// TODO, example

* [Spring Boot](https://spring.io/projects/spring-boot) - Open-source Java framework to create Spring-based applications.
* [Gradle](https://gradle.org/) - a fast, dependable, and adaptable open-source build automation tool.
* [JPA](https://spring.io/projects/spring-data-jpa) - a persistence API used to map the application's *entities* to the database tables.
* [H2 Database](https://h2database.com/html/main.html) - a Java SQL database.
* [Websocket](https://docs.spring.io/spring-framework/reference/web/websocket.html) - To enable a two-way interactive communication session between the server and the client, for a realtime
  update of the game state among the participants during a match.
* [STOMP](https://stomp.github.io/) protocol - To easily send and forward messages over websockets using Spring’s integrated STOMP support.
* [Google App Engine](https://cloud.google.com/) - cloud computing platform used to deploy our server.
* [SonarQube](https://www.sonarsource.com/products/sonarqube/) - open-source platform for continuous inspection of code quality.
* [OpenAi API](https://openai.com/) - API used for the game helping assistant.

<h2 id="high-level-components">⚙️ High-level components</h2>

### Example

// TODO

<h2 id="launch--deployment">🛠️ Launch & Deployment</h2>

// TODO, see server and Sopra template readme

### 🔨 Build and Develop


### 🪲 How to debug


### ✅  How to test

Have a look here: https://www.baeldung.com/spring-boot-testing

### 💾 How to Deploy and Release

New contributions pushed to the main branch are continuously integrated and continuously deployed to Vercel using
GitHub actions.

Code releases are done at the end of each sprint by manually creating a GitHub release with a new tag.

<h2 id="illustrations">🏞️ Illustrations</h2>

// TODO put illustrations

<h2 id="roadmap">🚀 Roadmap</h2>

- Implement a 1 versus 1 game mode
- Add the option to choose teams in the 2 versus 2 game.
- Add more messages for encouragements
- Add language localization (IT, DE, FR ...)
- Integrate Spring Security in the backend to improve users data security (e.g. passwords)

<h2 id="authors--aknowledgments">🖋️ Authors & Acknowledgements</h2>

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
