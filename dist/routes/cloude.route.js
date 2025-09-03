"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cloud_storage_1 = require("../controller/cloud-storage");
const router = (0, express_1.default)();
router.post("/upload", cloud_storage_1.CloudStorage);
exports.default = router;
