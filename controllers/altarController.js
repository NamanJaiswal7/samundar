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
  const { 
    bb_depth, 
    bb_height, 
    bb_length, 
    cabinate_design, 
    level_1d, 
    level_2d, 
    level_2h, 
    level_3d, 
    level_3h, 
    level_4d, 
    level_4h, 
    storage_height 
  } = req.body;

  // For Base Box material details
    const t_bt = 0.75; // base box top thickness
    const t_bb = 0.75; // base box bottom thickness
    const t_bbk = 0.5; // base box back thickness
    const t_bbfc = 0.75; // basebox front carving thickness
    const t_bbs = 0.75; // base box side thickness


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

    // Convert string values to numbers for calculations
    const bb_depth_num = parseFloat(bb_depth);
    const bb_height_num = parseFloat(bb_height);
    const bb_length_num = parseFloat(bb_length);
    const level_1d_num = parseFloat(level_1d);
    const level_2d_num = parseFloat(level_2d);
    const storage_height_num = parseFloat(storage_height);

    // Calculate coordinates for Shape 1 (Main Altar Shape)
    const coordinates1 = [
      { x: 0, y: 0 },
      { x: bb_depth_num - t_bbk, y: 0 },
      { x: bb_depth_num - t_bbk, y: bb_height_num - t_bt - 2*t_bb },
      { x: (bb_depth_num - t_bbk) - (level_1d_num + level_2d_num - t_bbfc), y: bb_height_num - t_bt - 2*t_bb },
      { x: (bb_depth_num - t_bbk) - (level_1d_num + level_2d_num - t_bbfc), y: storage_height_num },
      { x: 0, y: storage_height_num }
    ];

    // Calculate coordinates for Shape 2 (Same as Shape 1 but different position)
    const coordinates2 = [
      { x: 0, y: 0 },
      { x: bb_depth_num - t_bbk, y: 0 },
      { x: bb_depth_num - t_bbk, y: bb_height_num - t_bt - 2*t_bb },
      { x: (bb_depth_num - t_bbk) - (level_1d_num + level_2d_num - t_bbfc), y: bb_height_num - t_bt - 2*t_bb },
      { x: (bb_depth_num - t_bbk) - (level_1d_num + level_2d_num - t_bbfc), y: storage_height_num },
      { x: 0, y: storage_height_num }
    ];

    // Calculate coordinates for Shape 3 (Full Box)
    const coordinates3 = [
      { x: 0, y: 0 },
      { x: bb_length_num, y: 0 },
      { x: bb_length_num, y: bb_height_num },
      { x: 0, y: bb_height_num }
    ];

    // Calculate coordinates for Shape 4 (Level 1 Box)
    const coordinates4 = [
      { x: 0, y: 0 },
      { x: bb_length_num, y: 0 },
      { x: bb_length_num, y: level_1d_num - t_bbfc - t_bbk },
      { x: 0, y: level_1d_num - t_bbfc - t_bbk }
    ];

    // Scale factor to fit the drawing on the page (inches to points)
    const scale = 2.5; // Reduced scale to fit all shapes
    const offsetX = 50;
    const offsetY = 80;

    console.log('Shape 1 coordinates:', coordinates1);
    console.log('Shape 2 coordinates:', coordinates2);
    console.log('Shape 3 coordinates:', coordinates3);
    console.log('Shape 4 coordinates:', coordinates4);

    // Function to calculate line dimensions
    const getLineDimensions = (start, end) => {
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      return { width, height };
    };

    // Function to draw a shape with dimension labels
    const drawShapeWithDimensions = (coordinates, color, label, yOffset = 0) => {
      // Draw the shape lines
      for (let i = 0; i < coordinates.length; i++) {
        const current = coordinates[i];
        const next = coordinates[(i + 1) % coordinates.length];
        
        // Calculate line dimensions
        const dimensions = getLineDimensions(current, next);
        
        page.drawLine({
          start: { 
            x: current.x * scale + offsetX, 
            y: 800 - (current.y * scale + offsetY + yOffset) 
          },
          end: { 
            x: next.x * scale + offsetX, 
            y: 800 - (next.y * scale + offsetY + yOffset) 
          },
          thickness: 2,
          color: color
        });

        // Add dimension label
        const midX = (current.x + next.x) * scale / 2 + offsetX;
        const midY = 800 - ((current.y + next.y) * scale / 2 + offsetY + yOffset);
        
        let dimensionText = '';
        if (dimensions.width > 0 && dimensions.height > 0) {
          dimensionText = `W:${dimensions.width.toFixed(1)}" H:${dimensions.height.toFixed(1)}"`;
        } else if (dimensions.width > 0) {
          dimensionText = `W:${dimensions.width.toFixed(1)}"`;
        } else if (dimensions.height > 0) {
          dimensionText = `H:${dimensions.height.toFixed(1)}"`;
        }

        if (dimensionText) {
          page.drawText(dimensionText, {
            x: midX + 5,
            y: midY + 5,
            size: 8,
            font,
            color: color,
          });
        }
      }

      // Add shape label
      page.drawText(label, {
        x: offsetX - 40,
        y: 800 - (offsetY + yOffset),
        size: 10,
        font,
        color: color,
      });
    };

    // Draw all four shapes with different colors and positions
    drawShapeWithDimensions(coordinates1, rgb(0, 0, 1), 'Shape 1', 0); // Blue
    drawShapeWithDimensions(coordinates2, rgb(1, 0, 0), 'Shape 2', 150); // Red
    drawShapeWithDimensions(coordinates3, rgb(0, 1, 0), 'Shape 3', 300); // Green
    drawShapeWithDimensions(coordinates4, rgb(1, 0, 1), 'Shape 4', 450); // Magenta

    // Add labels for dimensions (in inches)
    const text = `BB Depth: ${bb_depth}", BB Height: ${bb_height}", BB Length: ${bb_length}", Storage Height: ${storage_height}"`;
    
    page.drawText(text, {
      x: 50,
      y: 750,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // Add scale indicator
    page.drawText(`Scale: 1 inch = ${scale} points`, {
      x: 50,
      y: 730,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Add coordinate points labels for Shape 1 (main shape)
    coordinates1.forEach((coord, index) => {
      page.drawText(`P${index}: (${coord.x.toFixed(1)}", ${coord.y.toFixed(1)}")`, {
        x: coord.x * scale + offsetX + 5,
        y: 800 - (coord.y * scale + offsetY) - 5,
        size: 6,
        font,
        color: rgb(0, 0, 0.7),
      });
    });
      
    const pdfBytes = await pdfDoc.save();
      
    
  //   const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `altar_design_${Date.now()}.pdf`,
    ContentType: 'application/pdf',
    Body: Buffer.from(pdfBytes)
  };

  s3.upload(uploadParams, async (err, data) => {
    if (err) {
      console.error('S3 upload error:', err);
      return res.status(500).json({ message: 'Error uploading PDF to S3' });
    }
    const pdfUrl = data.Location;
    const altarShape = new AltarShape({ 
      bb_depth, 
      bb_height, 
      bb_length, 
      cabinate_design, 
      level_1d, 
      level_2d, 
      level_2h, 
      level_3d, 
      level_3h, 
      level_4d, 
      level_4h, 
      storage_height, 
      image: pdfUrl 
    });
    await altarShape.save();
    res.status(201).json({
      message: 'Altar design created successfully',
      altarShape,
      pdfUrl: pdfUrl
    });
  });
};

module.exports = {
  getAltarShapes,
  createAltarShape
};
