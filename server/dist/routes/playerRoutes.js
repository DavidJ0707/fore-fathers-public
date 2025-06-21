"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const playerController_1 = require("../controllers/playerController");
const router = express_1.default.Router();
router.get('/', playerController_1.getAllPlayers);
router.post('/', playerController_1.createPlayer);
router.get('/:id', playerController_1.getPlayerById);
exports.default = router;
