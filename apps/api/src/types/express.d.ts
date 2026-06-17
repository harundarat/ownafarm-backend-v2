declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: "investor" | "farmer";
    }
  }
}

export {};
