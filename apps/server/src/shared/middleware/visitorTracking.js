import { randomUUID } from "crypto";

const VISITOR_COOKIE = "obrok_vid";
const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;

const isLikelyValidVisitorId = (value) =>
  typeof value === "string" && value.length >= 12 && value.length <= 64;

const visitorTracking = (req, res, next) => {
  const existing = req.cookies?.[VISITOR_COOKIE];
  const visitorId = isLikelyValidVisitorId(existing) ? existing : randomUUID();

  if (!existing || existing !== visitorId) {
    res.cookie(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }

  req.visitorId = visitorId;
  next();
};

export default visitorTracking;
