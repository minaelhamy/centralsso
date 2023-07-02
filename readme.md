# Open SSO
An User Management System with Single Sign On. Easier to manage your user and make them able to sign-in to all of your applications.

### Minimum Requirement
- NodeJS v14.17.0
- Database [Optional]
- Redis 3 [Optional]

### Features
- Single Sign On
- Support Multiple Database
- Universal Cache System
- Stateless Session
- User Management
- Mailer System
- Anti Spam reCaptcha
- Rest API
- Basic Essentials Website

### Usage
```
npm install
```

### Unit test
If you want to play unit test
```
npm test
```

Note:
1. If you want to validate the JWT Token, go to here >> [https://jwt.io](https://jwt.io/)
2. If you want to regenerate new private and public key, just execute file `rs256jwt.sh`.
3. Default of this boilerplate is using SQLite. Very fast to built prototype application.
4. `data_default.sqlite3` is the fresh default database of SQLite.
5. Never use `data_default.sqlite3`, so if you're broke the SQLite, you can just copy paste from the data_default.sqlite3.
6. If you want to change the database, just execute the `db.mysql.sql` into MySQL or MariaDB Server. 
7. If you want to use PostgreSQL server, just execute the `db.postgre.sql`.
8. If you want to use MSSQL Server, you have to modify it by yourself.
9. There is no default account, so when you're running this application for the first time, you have to register a new account to get the admin role.
10. If you want to learn more deep about the Rest API. Just import the `postman_collection.json` into your Postman.

### Documentation
For more detail, please see:
- [OpenSSO Documentation](https://nanowebdev.netlify.app/posts/open-sso-documentation)
- [Template Documentation](https://www.creative-tim.com/learning-lab/bootstrap/overview/argon-dashboard).