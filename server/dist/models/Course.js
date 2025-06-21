"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const holeSchema = new mongoose_1.default.Schema({
    holeNumber: Number,
    par: Number,
    distance: Number,
});
const TeeBoxSchema = new mongoose_1.default.Schema({
    teeColor: { type: String, required: true }, // e.g., 'White', 'Blue'
    courseRating: { type: Number, required: true },
    slopeRating: { type: Number, required: true },
    par: { type: Number, required: true },
    yardage: { type: Number, required: true },
    holes: [holeSchema]
});
const CourseSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    teeBoxes: [TeeBoxSchema],
});
exports.default = mongoose_1.default.model('Course', CourseSchema);
