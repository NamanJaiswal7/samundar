const mongoose = require('mongoose');

const altarShapeSchema = new mongoose.Schema({
  bb_depth: { type: String, required: true },
  bb_height: { type: String, required: true },
  bb_length: { type: String, required: true },
  cabinate_design: { type: String, required: true },
  level_1d: { type: String, required: true },
  level_2d: { type: String, required: true },
  level_2h: { type: String, required: true },
  level_3d: { type: String, required: true },
  level_3h: { type: String, required: true },
  level_4d: { type: String, required: true },
  level_4h: { type: String, required: true },
  storage_height: { type: String, required: true },
  image: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('altarShape', altarShapeSchema);
