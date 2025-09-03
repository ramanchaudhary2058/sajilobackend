import express from "express";
import { CloudStorage } from "../controller/cloud-storage";

const router = express();

router.post("/upload", CloudStorage);

export default router;
