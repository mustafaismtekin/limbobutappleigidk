import { Router, type IRouter } from "express";
import healthRouter from "./health";
import companiesRouter from "./companies";
import ideasRouter from "./ideas";

const router: IRouter = Router();

router.use(healthRouter);
router.use(companiesRouter);
router.use(ideasRouter);

export default router;
