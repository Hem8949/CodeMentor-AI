import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import problemsRouter from "./problems";
import attemptsRouter from "./attempts";
import mentorRouter from "./mentor";
import dashboardRouter from "./dashboard";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use(requireAuth);
router.use(profileRouter);
router.use(problemsRouter);
router.use(attemptsRouter);
router.use(mentorRouter);
router.use(dashboardRouter);

export default router;
