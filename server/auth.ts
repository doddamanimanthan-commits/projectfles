import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import createMemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);

const MemoryStore = createMemoryStore(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User, info: any) => {
      if (err) { return next(err); }
      if (!user) { return res.status(401).json({ message: "Invalid credentials" }); }
      req.logIn(user, (err) => {
        if (err) { return next(err); }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) { return next(err); }
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.json(null);
  });

  app.get("/api/login/google", (req, res) => {
    // This is a placeholder for the Google login redirect
    // For this simple implementation, we'll just redirect back with a mock user
    res.redirect("/api/auth/google/callback");
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    // Create or get a mock Google user
    let user = await storage.getUserByUsername("Google User");
    if (!user) {
      user = await storage.createUser({
        username: "Google User",
        password: "google-auth-placeholder",
        avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      });
    }
    
    req.logIn(user, (err) => {
      if (err) return res.redirect("/login");
      res.redirect("/");
    });
  });

  // Seed admin user if not exists
  (async () => {
    const admin = await storage.getUserByUsername("admin");
    if (!admin) {
      const hashedPassword = await hashPassword("admin123");
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
      });
      console.log("Admin user created: admin / admin123");
    }
  })();
}
