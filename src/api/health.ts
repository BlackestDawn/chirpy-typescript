import { Request, Response } from "express";


export const handlerReadiness = (_: Request, res: Response) => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("OK");
  res.end();
}
