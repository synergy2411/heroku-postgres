"use strict";

require("core-js");

var _graphqlYoga = require("graphql-yoga");

var _client = require("@prisma/client");

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var prisma = new _client.PrismaClient();
var typeDefs = "\n  type Query {\n    hello(name: String): String!\n    users : [User!]!\n    searchUsers(query : String, skip : Int, take : Int, orderBy : SortUserInput) : [User!]!\n    posts : [Post]!\n  }\n  type Post {\n    id : ID!\n    title : String!\n    body : String!\n    published : Boolean!\n    author : User\n  }\n  type User {\n    id : ID!\n    name : String!\n    email : String!\n    password : String!\n    age : Int!\n    posts : [Post!]!\n  }\n  type Mutation {\n    createUser(data : CreateUserInput) : User!\n    createPost(data : CreatePostInput): Post!\n    login(data : LoginInput) : AuthLoginPayload\n  }\n  type AuthLoginPayload {\n    user : User!\n    token : String!\n  }\n  input CreatePostInput {\n    title : String!\n    body : String!\n    published : Boolean!\n    authorId : ID!\n  }\n  input LoginInput {\n    email : String!\n    password : String!\n  }\n  input CreateUserInput {\n    name : String!\n    email : String!\n    password : String!\n    age : Int!\n  }\n  input SortUserInput {\n    email : Sort\n    name : Sort\n    age : Sort\n  }\n  enum Sort {\n    asc\n    desc\n  }\n";
var resolvers = {
  Query: {
    hello: function hello(_, _ref) {
      var name = _ref.name;
      return "Hello ".concat(name || 'World');
    },
    users: function () {
      var _users = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(parent, args, ctx, info) {
        var allUsers;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return prisma.user.findMany({
                  include: {
                    posts: true
                  }
                });

              case 2:
                allUsers = _context.sent;
                return _context.abrupt("return", allUsers);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function users(_x, _x2, _x3, _x4) {
        return _users.apply(this, arguments);
      }

      return users;
    }(),
    posts: function posts(parent, args, _ref2, info) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var request, authHeader, authToken, _jwt$verify, id, foundUser, allPosts;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                request = _ref2.request;
                authHeader = request.headers.authorization;

                if (authHeader) {
                  _context2.next = 4;
                  break;
                }

                throw new Error("Auth header not avilable");

              case 4:
                authToken = authHeader.split(" ")[1];

                if (authToken) {
                  _context2.next = 7;
                  break;
                }

                throw new Error("Auth token not found");

              case 7:
                _jwt$verify = _jsonwebtoken["default"].verify(authToken, "MySerectKey"), id = _jwt$verify.id;
                _context2.next = 10;
                return prisma.user.findUnique({
                  where: {
                    id: id
                  }
                });

              case 10:
                foundUser = _context2.sent;
                console.log(id, foundUser);
                _context2.prev = 12;
                _context2.next = 15;
                return prisma.post.findMany({
                  where: {
                    authorId: id
                  },
                  include: {
                    author: true
                  }
                });

              case 15:
                allPosts = _context2.sent;
                return _context2.abrupt("return", allPosts);

              case 19:
                _context2.prev = 19;
                _context2.t0 = _context2["catch"](12);
                throw new Error(_context2.t0);

              case 22:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[12, 19]]);
      }))();
    },
    searchUsers: function searchUsers(parent, args, ctx, info) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var where, serachedUsers;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                where = {
                  OR: [{
                    email: {
                      contains: args.query
                    }
                  }, {
                    name: {
                      contains: args.query
                    }
                  }]
                };
                _context3.next = 3;
                return prisma.user.findMany({
                  where: where,
                  skip: args.skip,
                  take: args.take,
                  orderBy: args.orderBy
                });

              case 3:
                serachedUsers = _context3.sent;
                return _context3.abrupt("return", serachedUsers);

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    }
  },
  Mutation: {
    createUser: function createUser(parent, args, ctx, info) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var _args$data, name, email, password, age, hashedPassword, createdUser;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _args$data = args.data, name = _args$data.name, email = _args$data.email, password = _args$data.password, age = _args$data.age;
                console.log("PASSWORD - ", password);
                _context4.prev = 2;
                _context4.next = 5;
                return _bcryptjs["default"].hash(password, 12);

              case 5:
                hashedPassword = _context4.sent;
                _context4.prev = 6;
                _context4.next = 9;
                return prisma.user.create({
                  data: {
                    age: age,
                    email: email,
                    name: name,
                    password: hashedPassword
                  }
                });

              case 9:
                createdUser = _context4.sent;
                return _context4.abrupt("return", _objectSpread({}, createdUser));

              case 13:
                _context4.prev = 13;
                _context4.t0 = _context4["catch"](6);
                throw new Error(_context4.t0);

              case 16:
                _context4.next = 21;
                break;

              case 18:
                _context4.prev = 18;
                _context4.t1 = _context4["catch"](2);
                throw new Error(_context4.t1);

              case 21:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[2, 18], [6, 13]]);
      }))();
    },
    login: function () {
      var _login = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(parent, args, ctx, info) {
        var _args$data2, email, password, userFound, flag, token;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _args$data2 = args.data, email = _args$data2.email, password = _args$data2.password;
                _context5.next = 3;
                return prisma.user.findFirst({
                  where: {
                    email: email
                  }
                });

              case 3:
                userFound = _context5.sent;

                if (userFound) {
                  _context5.next = 6;
                  break;
                }

                throw new Error("Unable to find email - " + email);

              case 6:
                _context5.prev = 6;
                _context5.next = 9;
                return _bcryptjs["default"].compare(password, userFound.password);

              case 9:
                flag = _context5.sent;

                if (flag) {
                  _context5.next = 12;
                  break;
                }

                throw new Error("Password does not match.");

              case 12:
                token = _jsonwebtoken["default"].sign({
                  id: userFound.id
                }, "MySerectKey");
                return _context5.abrupt("return", {
                  user: _objectSpread({}, userFound),
                  token: token
                });

              case 16:
                _context5.prev = 16;
                _context5.t0 = _context5["catch"](6);
                throw new Error(_context5.t0);

              case 19:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[6, 16]]);
      }));

      function login(_x5, _x6, _x7, _x8) {
        return _login.apply(this, arguments);
      }

      return login;
    }(),
    createPost: function createPost(parent, args, ctx, info) {
      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var _args$data3, body, title, published, authorId, createdPost;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _args$data3 = args.data, body = _args$data3.body, title = _args$data3.title, published = _args$data3.published, authorId = _args$data3.authorId;
                _context6.prev = 1;
                _context6.next = 4;
                return prisma.post.create({
                  data: {
                    title: title,
                    body: body,
                    published: published,
                    author: {
                      connect: {
                        id: Number(authorId)
                      }
                    }
                  },
                  include: {
                    author: true
                  }
                });

              case 4:
                createdPost = _context6.sent;
                return _context6.abrupt("return", createdPost);

              case 8:
                _context6.prev = 8;
                _context6.t0 = _context6["catch"](1);
                throw new Error(_context6.t0);

              case 11:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, null, [[1, 8]]);
      }))();
    }
  }
};
var server = new _graphqlYoga.GraphQLServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  context: function context(_ref3) {
    var request = _ref3.request;
    return {
      request: request,
      prisma: prisma
    };
  }
});
var options = {
  port: process.env.PORT || 9090
};
server.start(options, function () {
  return console.log('Server is running on localhost:', options.port);
});