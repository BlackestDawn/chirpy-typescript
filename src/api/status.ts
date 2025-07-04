import { Request, Response } from "express";


export const middlewareLogResponses = (req: Request, res: Response, next: any) => {
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
    }
  });
  next();
};
