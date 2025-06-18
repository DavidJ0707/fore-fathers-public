import mongoose from 'mongoose';

const holeSchema = new mongoose.Schema({
  holeNumber: Number,
  par: Number,
  distance: Number,
});

const TeeBoxSchema = new mongoose.Schema({
  teeColor: { type: String, required: true }, // e.g., 'White', 'Blue'
  courseRating: { type: Number, required: true },
  slopeRating: { type: Number, required: true },
  par: { type: Number, required: true },
  yardage: { type: Number, required: true },
  holes: [holeSchema]
});

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teeBoxes: [TeeBoxSchema],
});

export default mongoose.model('Course', CourseSchema);
