import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions, VerifiedCallback } from 'passport-jwt';
import { JwtPayload as NodeJwtPayload } from 'jsonwebtoken';
import passport from 'passport';
import { UserModel } from '@coffee/models'
import { Request } from 'express';
import { Cookie } from 'express-session';

interface CustomJwtPayload extends NodeJwtPayload {
    id: string,
    username: string,
    email: string
}

const  cookieExtractor = (req: Request) => {
    let token = null 
    if(req && req.cookies){
        token = req.cookies['authToken']
    }
    return token
}

const opts: StrategyOptions = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET!
}


passport.use(
    new JwtStrategy(opts, async (jwt_payload: CustomJwtPayload, done) => {
        try {
            const user = await UserModel.findByPk(jwt_payload.id,{
                attributes: ['id','username','email']
            })

            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            console.error(error);
            return done(error, false);
        }
    })
)

passport.serializeUser((user: any, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
    try {
         const user = await UserModel.findByPk(id,{
                attributes: ['id','username','email']
            })
        if (user) {
            done(null, user)
        } else {
            done(null, false)
        }
    } catch (error) {
        done(error, false)
    }
})
export default passport