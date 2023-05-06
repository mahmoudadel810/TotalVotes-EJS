import { connectionDB } from "../../DB/connection.js";
import * as allRouters from '../modules/index.Routes.js';
import { stackVar } from "./errorHandling.js";
import path from 'path';
import { fileURLToPath } from "url";
import session from "express-session";
import flash from 'connect-flash';
import mongoDBStore from "connect-mongodb-session";
import { log } from "console";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const initiateApp =
    (app, express) =>
    {
        const port = process.env.PORT || 3000;
        const baseUrl = process.env.BASE_URL;
        app.use(express.urlencoded({ extended: false })); // encode for the Url in webSite :don't work with out it | if set to true : u use qs nestedObject | false : STRINGS queryString third partymodules

        // app.set('views', 'front-end'); //ejs by defult looks for views .. if u want to change the file name
        // app.set('views', path.join(__dirname, './views')); // if u want to change ejs folder location
        app.set('view engine', 'ejs'); // if u want to use only file name in render without file extension

       
        const MongoDBStore = mongoDBStore(session);

        const store = new MongoDBStore(
            {
                uri: process.env.DB_URL_LOCAL,
                collection: 'mySessions'
            });

        store.on('error', function (error)
        {
            console.log(error);
        });
        app.use(session( // can't use flash with out session !!
            {
                secret: 'key',
                resave: false, //if expire resave or not 
                saveUninitialized: false,
                store ,// to store session in DB
                // unset: 'destroy' to remove session field || session change when logOut

            }));
        app.use(flash()); // before routers ! 
        app.use('/shared', express.static(path.join(__dirname, '../../views/shared')));
        app.use(express.json());

        app.use(`${baseUrl}/user`, allRouters.userRouter);
        app.use(`${baseUrl}/auth`, allRouters.authRouter);
        app.use(`${baseUrl}/product`, allRouters.productRouter);

        //app.all ممكن تنحط ف اي مكان عكس التانيه مكان مهيا موجوده .
        app.use('*', (req, res) =>
        {
            res.status(404).json({ message: 'In-Valid Routing' });

        });



        app.use((err, req, res, next) =>
        {
            if (err)
            {
                if (process.env.ENV_MODE == 'dev')
                {
                    console.log({ err: err.message });
                    return res.status(err['cause'] || 500).json({ message: 'Fail  in Response', Error: err.message, stack: stackVar });

                }
                return res.status(err['cause'] || 500).json({ message: 'Fail Response', Error: err.message });

            }
        });
        connectionDB();
        app.listen(port, () => { console.log(`Server Works Correct .....! on : ${port}`); });
    };
