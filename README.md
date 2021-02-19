# TinyApp Project

### Written by Nicholas Meisenheimer (me!) as part of the LHL Web Dev Bootcap Curiculum

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

Features include: adding, editing, deleting  short URLs; Multi-user capibilities with encrypted session-cookies and hashed passwords.

## Final Product
Login view includes dynamic messaging on error or redirect:
!["login"](readmeAsset/login.png)
Register view includes dynamic messaging on error:
!["register"](readmeAsset/register.png)
Index lists urls pertaining to the logged in user:
!["urls_index"](readmeAsset/urls_index.png)
Logged in user can edit shortened url endpoint:
!["url_show"](readmeAsset/url_show.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.