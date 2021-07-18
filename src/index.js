import { GraphQLServer } from 'graphql-yoga'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const prisma = new PrismaClient();

const typeDefs = `
  type Query {
    hello(name: String): String!
    users : [User!]!
    searchUsers(query : String, skip : Int, take : Int, orderBy : SortUserInput) : [User!]!
    posts : [Post]!
  }
  type Post {
    id : ID!
    title : String!
    body : String!
    published : Boolean!
    author : User
  }
  type User {
    id : ID!
    name : String!
    email : String!
    password : String!
    age : Int!
    posts : [Post!]!
  }
  type Mutation {
    createUser(data : CreateUserInput) : User!
    createPost(data : CreatePostInput): Post!
    login(data : LoginInput) : AuthLoginPayload
  }
  type AuthLoginPayload {
    user : User!
    token : String!
  }
  input CreatePostInput {
    title : String!
    body : String!
    published : Boolean!
    authorId : ID!
  }
  input LoginInput {
    email : String!
    password : String!
  }
  input CreateUserInput {
    name : String!
    email : String!
    password : String!
    age : Int!
  }
  input SortUserInput {
    email : Sort
    name : Sort
    age : Sort
  }
  enum Sort {
    asc
    desc
  }
`;
const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    users : async (parent, args, ctx, info) => {
        const allUsers = await prisma.user.findMany({
          include :{ 
            posts : true
          }
        })
        return allUsers
    },
    async posts(parent, args, {request}, info){
      const authHeader = request.headers.authorization;
      if(!authHeader){
        throw new Error("Auth header not avilable")
      }
      const authToken = authHeader.split(" ")[1]
      if(!authToken){
        throw new Error("Auth token not found")
      }
      const {id}  = jwt.verify(authToken, "MySerectKey")
      const foundUser = await prisma.user.findUnique({where : {id}})
      console.log(id, foundUser);

      try{
      const allPosts = await prisma.post.findMany(
        {
          where: { authorId : id },
          include : { author : true }
        }
        )
      return allPosts
      }catch(err){
        throw new Error(err)
      }
    },
    async searchUsers(parent, args, ctx, info){
      const where = {
        OR : [
          {email : { contains : args.query}},
          {name : { contains : args.query}}
        ]
      }
      const serachedUsers = await prisma.user.findMany({
        where,
        skip : args.skip,
        take : args.take,
        orderBy : args.orderBy
      })
      return serachedUsers;
    }
  },
  Mutation : {
    async createUser(parent, args, ctx, info){
      const {name, email, password, age} = args.data
      console.log("PASSWORD - ", password);
      try{
        const hashedPassword = await bcrypt.hash(password, 12)
        try{
          const createdUser = await prisma.user.create({data : {
            age, email, name, password : hashedPassword
          }})
          return {...createdUser}
        }catch(err){
          throw new Error(err)
        }
      }catch(err){
        throw new Error(err)
      }
    },
    login : async(parent, args, ctx, info) => {
      const {email, password} = args.data;
      const userFound = await prisma.user.findFirst({where: { email }})
      if(!userFound){
        throw new Error("Unable to find email - " + email)
      }
      try{
      const flag = await bcrypt.compare(password, userFound.password)
      if(!flag){
        throw new Error("Password does not match.")
      }
      const token = jwt.sign({id : userFound.id}, "MySerectKey")
      return { user : {...userFound}, token }
      }catch(err){
        throw new Error(err)
      }
    },
    async createPost(parent, args, ctx, info){
      const {body, title, published, authorId } = args.data;
      try{
      const createdPost = await prisma.post.create({
        data : { title, body, published, author : { connect : { id : Number(authorId) } }},
        include : { author : true}
      })
      return createdPost;
    }catch(err){
      throw new Error(err)
    }
    }
  }
};
const server = new GraphQLServer({ 
  typeDefs, 
  resolvers,
  context: ({request}) => {
    return {
      request,
      prisma
    };
  }
})

const options = {port : process.env.PORT || 9090}
server.start(options, () => console.log('Server is running on localhost:', options.port))