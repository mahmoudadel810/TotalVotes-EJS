import { initiateApp } from "./src/utils/initiateApp.js";
import  express  from "express";
import { config } from "dotenv";

config({path : './config/dev.env'})

const app = express()

initiateApp(app , express)