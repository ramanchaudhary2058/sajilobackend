// import express from "express";
// import { Payment } from "../controller/payment";

// const router = express.Router();

// router.get("/:id", Payment);

// export default router;
import express from "express";
import { initiatePayment, verifyPayment } from "../controller/payment";

const router = express.Router();

router.get("/:amount", initiatePayment);
router.post("/verify", verifyPayment);

export default router;