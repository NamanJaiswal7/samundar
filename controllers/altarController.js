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
    const t_pe = 0.5; // Extra pillar thickeness
    const t_p = 3 // pillar thickness
    const t_bbb = 3; // Basebox bottom border thickness

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

    // --- SHAPE 5 ---
    // Pillar Rectangle
    const t_p_num = parseFloat(t_p);
    const t_pe_num = parseFloat(t_pe);
    const coordinates5 = [
      { x: 0, y: 0 },
      { x: t_p_num + t_pe_num, y: 0 },
      { x: t_p_num + t_pe_num, y: level_2d_num },
      { x: 0, y: level_2d_num }
    ];

    // --- SHAPE 6 ---
    // Same as Shape 5 (if you want a different position, please clarify)
    const coordinates6 = [
      { x: 0, y: 0 },
      { x: t_p_num + t_pe_num, y: 0 },
      { x: t_p_num + t_pe_num, y: level_2d_num },
      { x: 0, y: level_2d_num }
    ];

    // --- SHAPE 7 ---
    // Rectangle using Level 1D and Level 2H - t_bt
    const level_2h_num = parseFloat(level_2h);
    const coordinates7 = [
      { x: 0, y: 0 },
      { x: level_1d_num, y: 0 },
      { x: level_1d_num, y: level_2h_num - t_bt },
      { x: 0, y: level_2h_num - t_bt }
    ];

    // --- SHAPE 8 ---
    // Same as Shape 7 (if you want a different position, please clarify)
    const coordinates8 = [
      { x: 0, y: 0 },
      { x: level_1d_num, y: 0 },
      { x: level_1d_num, y: level_2h_num - t_bt },
      { x: 0, y: level_2h_num - t_bt }
    ];

    // --- SHAPE 9 ---
    // Rectangle using BB Length - 2 * (Pillar Thickness + t_pe) and Level 2H
    const level_3h_num = parseFloat(level_3h);
    const shape9_x = bb_length_num - 2 * (t_p_num + t_pe_num);
    const coordinates9 = [
      { x: 0, y: 0 },
      { x: shape9_x, y: 0 },
      { x: shape9_x, y: level_2h_num },
      { x: 0, y: level_2h_num }
    ];

    // --- SHAPE 10 ---
    // Rectangle using BB Length and Level 3H
    const coordinates10 = [
      { x: 0, y: 0 },
      { x: bb_length_num, y: 0 },
      { x: bb_length_num, y: level_3h_num },
      { x: 0, y: level_3h_num }
    ];

    // --- SHAPE 11 ---
    // Rectangle using BB Length - 2*(t_p + t_pe + 2*t_bb) and Level 2D
    const shape11_x = bb_length_num - 2 * (t_p_num + t_pe_num + 2 * t_bb);
    const coordinates11 = [
      { x: 0, y: 0 },
      { x: shape11_x, y: 0 },
      { x: shape11_x, y: level_2d_num },
      { x: 0, y: level_2d_num }
    ];

    // --- SHAPE 12 ---
    // Rectangle using BB Length and Level 3D
    const level_3d_num = parseFloat(level_3d);
    const coordinates12 = [
      { x: 0, y: 0 },
      { x: bb_length_num, y: 0 },
      { x: bb_length_num, y: level_3d_num },
      { x: 0, y: level_3d_num }
    ];

    // --- SHAPE 13 ---
    // Rectangle using t_p + t_pe and Level 2H
    const coordinates13 = [
      { x: 0, y: 0 },
      { x: t_p_num + t_pe_num, y: 0 },
      { x: t_p_num + t_pe_num, y: level_2h_num },
      { x: 0, y: level_2h_num }
    ];

    // --- SHAPE 14 ---
    // Rectangle using t_p + t_pe and Level 2H (same as Shape 13)
    const coordinates14 = [
      { x: 0, y: 0 },
      { x: t_p_num + t_pe_num, y: 0 },
      { x: t_p_num + t_pe_num, y: level_2h_num },
      { x: 0, y: level_2h_num }
    ];

    // --- SHAPE 15 ---
    // Complex altar shape with multiple levels
    const coordinates15 = [
      { x: 0, y: 0 },
      { x: bb_depth_num - t_bbk, y: 0 },
      { x: bb_depth_num - t_bbk, y: bb_height_num - 2*t_bb - t_bt },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc), y: bb_height_num - 2*t_bb - t_bt },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc), y: bb_height_num - 2*t_bb - t_bt - level_2h_num },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc) - level_2d_num, y: bb_height_num - 2*t_bb - t_bt - level_2h_num },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc) - level_2d_num, y: bb_height_num - 2*t_bb - t_bt - level_2h_num - level_3h_num },
      { x: 0, y: storage_height_num - 2*t_bb - t_bt },
      { x: 0, y: 0 }
    ];

    // --- SHAPE 16 ---
    // Complex altar shape with multiple levels (same as Shape 15)
    const coordinates16 = [
      { x: 0, y: 0 },
      { x: bb_depth_num - t_bbk, y: 0 },
      { x: bb_depth_num - t_bbk, y: bb_height_num - 2*t_bb - t_bt },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc), y: bb_height_num - 2*t_bb - t_bt },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc), y: bb_height_num - 2*t_bb - t_bt - level_2h_num },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc) - level_2d_num, y: bb_height_num - 2*t_bb - t_bt - level_2h_num },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc) - level_2d_num, y: bb_height_num - 2*t_bb - t_bt - level_2h_num - level_3h_num },
      { x: 0, y: storage_height_num - 2*t_bb - t_bt },
      { x: 0, y: 0 }
    ];

    // --- SHAPE 17 ---
    // Complex altar shape with multiple levels (same as Shape 15/16)
    const coordinates17 = [
      { x: 0, y: 0 },
      { x: bb_depth_num - t_bbk, y: 0 },
      { x: bb_depth_num - t_bbk, y: bb_height_num - 2*t_bb - t_bt },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc), y: bb_height_num - 2*t_bb - t_bt },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc), y: bb_height_num - 2*t_bb - t_bt - level_2h_num },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc) - level_2d_num, y: bb_height_num - 2*t_bb - t_bt - level_2h_num },
      { x: bb_depth_num - t_bbk - (level_1d_num - t_bbfc) - level_2d_num, y: bb_height_num - 2*t_bb - t_bt - level_2h_num - level_3h_num },
      { x: 0, y: storage_height_num - 2*t_bb - t_bt },
      { x: 0, y: 0 }
    ];

    // --- SHAPE 18 ---
    // Rectangle using BB Length and t_bbb
    const coordinates18 = [
      { x: 0, y: 0 },
      { x: bb_length_num, y: 0 },
      { x: bb_length_num, y: t_bbb },
      { x: 0, y: t_bbb }
    ];

    // --- SHAPE 19 ---
    // Rectangle using BB Length and t_bbb (same as Shape 18)
    const coordinates19 = [
      { x: 0, y: 0 },
      { x: bb_length_num, y: 0 },
      { x: bb_length_num, y: t_bbb },
      { x: 0, y: t_bbb }
    ];

    // --- SHAPE 20 ---
    // Rectangle using t_bbb and BB Depth - 2*t_bbb
    const coordinates20 = [
      { x: 0, y: 0 },
      { x: t_bbb, y: 0 },
      { x: t_bbb, y: bb_depth_num - 2*t_bbb },
      { x: 0, y: bb_depth_num - 2*t_bbb }
    ];

    // --- SHAPE 21 ---
    // Rectangle using t_bbb and BB Depth - 2*t_bbb (same as Shape 20)
    const coordinates21 = [
      { x: 0, y: 0 },
      { x: t_bbb, y: 0 },
      { x: t_bbb, y: bb_depth_num - 2*t_bbb },
      { x: 0, y: bb_depth_num - 2*t_bbb }
    ];

    // --- SHAPE 22 ---
    // Rectangle using BB Length and BB depth - t_bbk
    const coordinates22 = [
      { x: 0, y: 0 },
      { x: bb_length_num, y: 0 },
      { x: bb_length_num, y: bb_depth_num - t_bbk },
      { x: 0, y: bb_depth_num - t_bbk }
    ];

    // Scale factor to fit the drawing on the page (inches to points)
    const scale = 2.5; // Reduced scale to fit all shapes
    const offsetX = 50;
    const offsetY = 50; // margin from the top of the page

    console.log('Shape 1 coordinates:', coordinates1);
    console.log('Shape 2 coordinates:', coordinates2);
    console.log('Shape 3 coordinates:', coordinates3);
    console.log('Shape 4 coordinates:', coordinates4);
    console.log('Shape 5 coordinates:', coordinates5);
    console.log('Shape 6 coordinates:', coordinates6);
    console.log('Shape 7 coordinates:', coordinates7);
    console.log('Shape 8 coordinates:', coordinates8);
    console.log('Shape 9 coordinates:', coordinates9);
    console.log('Shape 10 coordinates:', coordinates10);

    // Function to calculate line dimensions
    const getLineDimensions = (start, end) => {
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      return { width, height };
    };

    // Refactored drawShapeWithDimensions to accept page as a parameter
    const drawShapeWithDimensions = (pg, coordinates, color, label, yOffset = 0) => {
      // Draw the shape lines
      for (let i = 0; i < coordinates.length; i++) {
        const current = coordinates[i];
        const next = coordinates[(i + 1) % coordinates.length];
        
        // Calculate line dimensions
        const dimensions = getLineDimensions(current, next);
        
        pg.drawLine({
          start: { 
            x: current.x * scale + offsetX, 
            y: pageHeight - (current.y * scale + offsetY + yOffset) 
          },
          end: { 
            x: next.x * scale + offsetX, 
            y: pageHeight - (next.y * scale + offsetY + yOffset) 
          },
          thickness: 2,
          color: color
        });

        // Add dimension label
        const midX = (current.x + next.x) * scale / 2 + offsetX;
        const midY = pageHeight - ((current.y + next.y) * scale / 2 + offsetY + yOffset);
        
        let dimensionText = '';
        if (dimensions.width > 0 && dimensions.height > 0) {
          dimensionText = `W:${dimensions.width.toFixed(1)}" H:${dimensions.height.toFixed(1)}"`;
        } else if (dimensions.width > 0) {
          dimensionText = `W:${dimensions.width.toFixed(1)}"`;
        } else if (dimensions.height > 0) {
          dimensionText = `H:${dimensions.height.toFixed(1)}"`;
        }

        if (dimensionText) {
          pg.drawText(dimensionText, {
            x: midX + 5,
            y: midY + 5,
            size: 8,
            font,
            color: color,
          });
        }
      }

      // Add shape label
      pg.drawText(label, {
        x: offsetX - 40,
        y: pageHeight - (offsetY + yOffset),
        size: 10,
        font,
        color: color,
      });
    };

    // --- Drawing logic for multiple pages ---
    const pageHeight = 800;
    const margin = 50;
    const shapeHeight = 140; // vertical space per shape (including labels)
    let currentYOffset = 0;
    let currentPage = page;
    const shapes = [
      { coords: coordinates1, color: rgb(0, 0, 1), label: 'Shape 1' },
      { coords: coordinates2, color: rgb(1, 0, 0), label: 'Shape 2' },
      { coords: coordinates3, color: rgb(0, 1, 0), label: 'Shape 3' },
      { coords: coordinates4, color: rgb(1, 0, 1), label: 'Shape 4' },
      { coords: coordinates5, color: rgb(1, 0.5, 0), label: 'Shape 5' },
      { coords: coordinates6, color: rgb(0, 1, 1), label: 'Shape 6' },
      { coords: coordinates7, color: rgb(0, 0, 0.5), label: 'Shape 7' },
      { coords: coordinates8, color: rgb(0, 0.5, 0), label: 'Shape 8' },
      { coords: coordinates9, color: rgb(0.5, 0.25, 0), label: 'Shape 9' },
      { coords: coordinates10, color: rgb(0.5, 0, 0.5), label: 'Shape 10' },
      { coords: coordinates11, color: rgb(0.8, 0.4, 0.2), label: 'Shape 11' },
      { coords: coordinates12, color: rgb(0.2, 0.8, 0.4), label: 'Shape 12' },
      { coords: coordinates13, color: rgb(0.4, 0.2, 0.8), label: 'Shape 13' },
      { coords: coordinates14, color: rgb(0.8, 0.8, 0.2), label: 'Shape 14' },
      { coords: coordinates15, color: rgb(0.3, 0.7, 0.9), label: 'Shape 15' },
      { coords: coordinates16, color: rgb(0.9, 0.3, 0.6), label: 'Shape 16' },
      { coords: coordinates17, color: rgb(0.6, 0.9, 0.3), label: 'Shape 17' },
      { coords: coordinates18, color: rgb(0.7, 0.3, 0.9), label: 'Shape 18' },
      { coords: coordinates19, color: rgb(0.4, 0.8, 0.8), label: 'Shape 19' },
      { coords: coordinates20, color: rgb(0.9, 0.7, 0.3), label: 'Shape 20' },
      { coords: coordinates21, color: rgb(0.3, 0.4, 0.9), label: 'Shape 21' },
      { coords: coordinates22, color: rgb(0.8, 0.2, 0.6), label: 'Shape 22' }
    ];

    // Draw all shapes, creating new pages as needed
    for (let i = 0; i < shapes.length; i++) {
      if (currentYOffset + shapeHeight + margin > pageHeight) {
        currentPage = pdfDoc.addPage([600, 800]);
        currentYOffset = 0;
      }
      drawShapeWithDimensions(currentPage, shapes[i].coords, shapes[i].color, shapes[i].label, currentYOffset);
      currentYOffset += shapeHeight;
    }

    // Add labels for dimensions (in inches) on the first page only
    page.drawText(`BB Depth: ${bb_depth}", BB Height: ${bb_height}", BB Length: ${bb_length}", Storage Height: ${storage_height}"`, {
      x: 50,
      y: 750,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Scale: 1 inch = ${scale} points`, {
      x: 50,
      y: 730,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    // Add coordinate points labels for Shape 1 (main shape) on the first page only
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
