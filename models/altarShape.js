const mongoose = require('mongoose');

const altarShapeSchema = new mongoose.Schema({
  width: { type: String, required: true },
  height: { type: String, required: true },
  depth: { type: String, required: true },
  material: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('altarShape', altarShapeSchema);
