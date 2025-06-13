const AltarShape = require('../models/altarShape');
const s3 = require('../config/s3');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// @desc    Get all users
// @route   GET /api/users
const getAltarShapes = async (req, res) => {
  const altarShapes = await AltarShape.find();
  res.json(altarShapes);
};

// @desc    Create a new user
// @route   POST /api/users
const createAltarShape = async (req, res) => {
  const { width, height, depth, material, color, price, description } = req.body;
  const file = req.file;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: 600,
    height: 800,
    color: rgb(1, 1, 1)
  });

    // Scale the altar dimensions to fit the page
    const scale = 2; // Adjust this scale factor as needed
    const rectWidth = width * scale;
    const rectHeight = height * scale;
  
    const centerX = (600 - rectWidth) / 2;
    const centerY = (800 - rectHeight) / 2;

    page.drawRectangle({
        x: centerX,
        y: centerY,
        width: rectWidth,
        height: rectHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 2,
      });

      const text = `Width: ${width}, Height: ${height}`;
      
      page.drawText(text, {
        x: centerX,
        y: centerY + rectHeight + 10,
        size: 14,
        font,
        color: rgb(0, 0, 0),
      });
      const pdfBytes = await pdfDoc.save();
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
//   const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now()}_${file.originalname}`,
    ContentType: file.mimetype,
    Body: Buffer.from(pdfBytes)
  };

  s3.upload(uploadParams, async (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file' });
    }
    const imageUrl = data.Location;
    const altarShape = new AltarShape({ width, height, depth, material, color, price, description, image: imageUrl });
    await altarShape.save();
    res.status(201).json(altarShape);
  });
};

module.exports = {
  getAltarShapes,
  createAltarShape
};
