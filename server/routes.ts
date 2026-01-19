import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import nodemailer from "nodemailer";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Request Movie Route
  app.post("/api/requests", async (req, res) => {
    try {
      const { type, name, details } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Movie/Series name is required" });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "nobinobitadora2@gmail.com",
        subject: `New ${type} Request: ${name}`,
        text: `
Request Type: ${type}
Requested Name: ${name}
Additional Details: ${details || "None provided"}
Date & Time: ${new Date().toLocaleString()}
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Request sent successfully!" });
    } catch (error) {
      console.error("Error sending request email:", error);
      res.status(500).json({ message: "Failed to send request. Please try again later." });
    }
  });

  // Movie Routes
  app.get(api.movies.list.path, async (req, res) => {
    const movies = await storage.getMovies();
    res.json(movies);
  });

  app.get(api.movies.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });
    
    const movie = await storage.getMovie(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  });

  // Protected Admin Routes
  app.post(api.movies.create.path, async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const input = api.movies.create.input.parse(req.body);
      const movie = await storage.createMovie(input);
      res.status(201).json(movie);
    } catch (err) {
      next(err);
    }
  });

  app.put(api.movies.update.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });

    try {
      const input = api.movies.update.input.parse(req.body);
      const updated = await storage.updateMovie(id, input);
      if (!updated) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.movies.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });

    await storage.deleteMovie(id);
    res.status(204).send();
  });

  return httpServer;
}
