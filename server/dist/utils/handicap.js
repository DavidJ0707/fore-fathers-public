"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScoreDifferential = calculateScoreDifferential;
exports.calculateHandicapIndex = calculateHandicapIndex;
exports.calculateCourseHandicap = calculateCourseHandicap;
exports.calculatePlayingHandicap = calculatePlayingHandicap;
function calculateScoreDifferential(adjustedGrossScore, courseRating, slopeRating, pcc = 0 // optional, default to 0 if not tracked
) {
    return ((adjustedGrossScore - courseRating - pcc) * 113) / slopeRating;
}
function calculateHandicapIndex(scoreDifferentials) {
    if (scoreDifferentials.length < 5)
        return 0;
    const sorted = [...scoreDifferentials].sort((a, b) => a - b);
    const count = scoreDifferentials.length >= 20 ? 8 : Math.floor(scoreDifferentials.length / 2);
    const avg = sorted.slice(0, count).reduce((a, b) => a + b, 0) / count;
    const index = Math.round(avg * 10) / 10;
    return Math.min(index, 54);
}
function calculateCourseHandicap(handicapIndex, slopeRating, courseRating, par) {
    return Math.round(handicapIndex * (slopeRating / 113) + (courseRating - par));
}
function calculatePlayingHandicap(courseHandicap, allowance = 1) {
    return Math.round(courseHandicap * allowance);
}
