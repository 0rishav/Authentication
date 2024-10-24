import passport from "../passport-js/passport.js"
import express from "express"
import { sendToken } from "../utils/tokenConfiguration.js";

const passportRouter = express.Router();



passportRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

passportRouter.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }), 
    (req, res) => {
      sendToken(req.user, 200, res); 
    }
  );

export default passportRouter