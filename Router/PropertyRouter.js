const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const PropertyRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

PropertyRouter.get('/', (req, res) => {
    res.status(200).json('server on port 8000 and database is connected');
});

PropertyRouter.get("/all", (req, res) => {

    const query = `
        SELECT 
            p.id,
            p.owner_id,
            p.property_type,
            p.name,
            p.floor_number,
            p.unit_code,
            p.rooms,
            p.isMasterRoom,
            p.bedroom,
            p.living_rooms,
            p.bathrooms,
            p.kitchens,
            p.size,
            p.parking_available,
            p.description,
            p.rent,
            p.deposit,
            p.region_id,
            r.name AS region_name,
            p.district_id,
            d.name AS district_name,
            p.address,
            p.status,
            p.recommended,
            p.created_at,

            u.full_name AS owner_name,
            u.phone AS owner_phone,

            COALESCE(MAX(f.id),0) AS favourite_id,
            COALESCE(MAX(f.user_id),0) AS favourite_user_id

        FROM properties p

        JOIN users u ON p.owner_id = u.id
        JOIN regions r ON p.region_id = r.id
        JOIN districts d ON p.district_id = d.id

        LEFT JOIN favourite f ON p.id = f.property_id

        GROUP BY 
            p.id,
            p.owner_id,
            p.property_type,
            p.name,
            p.floor_number,
            p.unit_code,
            p.rooms,
            p.isMasterRoom,
            p.bedroom,
            p.living_rooms,
            p.bathrooms,
            p.kitchens,
            p.size,
            p.parking_available,
            p.description,
            p.rent,
            p.deposit,
            p.region_id,
            r.name,
            p.district_id,
            d.name,
            p.address,
            p.status,
            p.recommended,
            p.created_at,
            u.full_name,
            u.phone
    `;

    mysqlconnection.query(query, (error, rows) => {
        if (!error) {
            res.json(rows);
        } else {
            console.log(error);
            res.status(500).json({ error: "Database error" });
        }
    });
});

PropertyRouter.get("/all/:id", (req, res) => {
    const propertiesid = req.params.id;

    const query = `
        SELECT 
            p.id,
            p.owner_id,
            p.property_type,
            p.name,
            p.floor_number,
            p.unit_code,
            p.rooms,
            p.isMasterRoom,
            p.bedroom,
            p.living_rooms,
            p.bathrooms,
            p.kitchens,
            p.size,
            p.parking_available,
            p.description,
            p.rent,
            p.deposit,
            p.region_id,
            r.name AS region_name,
            p.district_id,
            d.name AS district_name,
            p.address,
            p.status,
            p.recommended,
            p.created_at,

            u.full_name AS owner_name,
            u.phone AS owner_phone,

            COALESCE(MAX(f.id),0) AS favourite_id,
            COALESCE(MAX(f.user_id),0) AS favourite_user_id

        FROM properties p

        JOIN users u ON p.owner_id = u.id
        JOIN regions r ON p.region_id = r.id
        JOIN districts d ON p.district_id = d.id

        LEFT JOIN favourite f ON p.id = f.property_id

        WHERE p.id = ?

        GROUP BY 
            p.id,
            p.owner_id,
            p.property_type,
            p.name,
            p.floor_number,
            p.unit_code,
            p.rooms,
            p.isMasterRoom,
            p.bedroom,
            p.living_rooms,
            p.bathrooms,
            p.kitchens,
            p.size,
            p.parking_available,
            p.description,
            p.rent,
            p.deposit,
            p.region_id,
            r.name,
            p.district_id,
            d.name,
            p.address,
            p.status,
            p.recommended,
            p.created_at,
            u.full_name,
            u.phone
    `;

    mysqlconnection.query(query, [propertiesid], (error, rows) => {
        if (!error) {
            res.json(rows);
        } else {
            console.log(error);
            res.status(500).json({ error: "Database error" });
        }
    });
});

PropertyRouter.get("/image/:id", (req, res) => {
    const imageId = req.params.id;
    const query = "SELECT image FROM properties WHERE id=?";

    mysqlconnection.query(query, [imageId], (err, result) => {
        if (err) {
            return res.status(500).send("Error fetching image");
        }
        if (result.length === 0) {
            return res.status(404).send("Image not found");
        }

        res.contentType("image/jpeg");
        res.send(result[0].image); // Send the image buffer back as a response
    });
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

PropertyRouter.post("/add", upload.single("image"), (req, res) => {
    const { owner_id, property_type, name, floor_number, unit_code, rooms, isMasterRoom, bedroom, living_rooms, bathrooms, kitchens, size, parking_available, description, rent, deposit, region_id, district_id, address, status, created_at } = req.body;
    const imageBuffer = req.file.buffer;
    const query = "INSERT INTO properties (owner_id ,property_type , name ,floor_number ,unit_code ,rooms,isMasterRoom, bedroom ,living_rooms ,bathrooms ,kitchens, size, parking_available,description ,rent ,deposit ,region_id ,district_id ,address,status,image ,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,(select id from regions where name=?),(select id from districts where name=?),?,?,?,?)";

    mysqlconnection.query(query, [owner_id, property_type, name, floor_number, unit_code, rooms, isMasterRoom, bedroom, living_rooms, bathrooms, kitchens, size, parking_available, description, rent, deposit, region_id, district_id, address, status, imageBuffer, created_at], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error saving image to database",
                error: err
            });
        }
        res.status(200).send("Image uploaded successfully");
    });
});

//for new typescript dashboard
// PropertyRouter.post("/add_New", upload.single("image"), (req, res) => {
//     const { owner_id, property_type, name, floor_number, unit_code, rooms, living_rooms, bathrooms, kitchens, rent, deposit, region_id, district_id, address, created_at } = req.body;
//     const imageBuffer = req.file?.buffer;

//     const query = "INSERT INTO properties (owner_id ,property_type , name ,floor_number ,unit_code ,rooms ,living_rooms ,bathrooms ,kitchens ,rent ,deposit ,region_id ,district_id ,address,image ,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
//     const values = [owner_id, property_type, name, floor_number, unit_code, rooms, living_rooms, bathrooms, kitchens, rent, deposit, region_id, district_id, address, imageBuffer, created_at];

//     mysqlconnection.query(query, values, (err, result) => {
//         if (err) {
//             console.error("❌ MySQL insert error:", err);
//             return res.status(500).json({
//                 status: "error",
//                 message: "Failed to save properties",
//                 error: err.message,
//                 reqBody: req.body,
//             });
//         }

//         res.status(200).json({
//             status: "success",
//             message: "properties created successfully",
//             id: result.insertId,
//             reqBody: req.body,
//         });
//     });
// });

PropertyRouter.put("/update/:id", upload.single("image"), (req, res) => {
    const id = req.params.id;
    const { owner_id, property_type, name, floor_number, unit_code, rooms, isMasterRoom, bedroom, living_rooms, bathrooms, kitchens, size, parking_available, description, rent, deposit, region_id, district_id, address, status, recommended } = req.body;

    const imageBuffer = req.file?.buffer;

    // Build dynamic SQL
    let query = `
    UPDATE properties 
    SET owner_id=? ,property_type=? , name =?,floor_number =?,unit_code =?,rooms =?,isMasterRoom=?,bedroom=?,living_rooms =?,bathrooms =?,kitchens =?,size=?,parking_available=?,description=?,rent =?,deposit =?,region_id =?,district_id =?,address =?, status=?, recommended=?
  `;
    const values = [owner_id, property_type, name, floor_number, unit_code, rooms, isMasterRoom, bedroom, living_rooms, bathrooms, kitchens, size, parking_available, description, rent, deposit, region_id, district_id, address, status, recommended];

    // Only update image if a new one is uploaded
    if (imageBuffer) {
        query += `, image = ?`;
        values.push(imageBuffer);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    mysqlconnection.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error updating the properties");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("properties not found");
        }

        res.status(200).send("properties updated successfully");
    });
});

// for new typescript dashboard
PropertyRouter.put("/updateNew/:id", upload.single("image"), (req, res) => {
    const id = req.params.id;
    let { owner_id, property_type, name, floor_number, unit_code, rooms, isMasterRoom, bedroom, living_rooms, bathrooms, kitchens, size, parking_available, description, rent, deposit, region_id, district_id, address, status, recommended } = req.body;

    const imageBuffer = req.file?.buffer;

    // Build dynamic SQL
    let query = `
    UPDATE properties 
    SET owner_id=? ,property_type=? , name =?,floor_number =?,unit_code =?,rooms =?,isMasterRoom=?,bedroom=?, living_rooms =?,bathrooms =?,kitchens =?,size=?,parking_available=?,description=?,rent =?,deposit =?,region_id =?,district_id =?,address =?,status=?,recommended=?
  `;
    const values = [owner_id, property_type, name, floor_number, unit_code, rooms, isMasterRoom, bedroom, living_rooms, bathrooms, kitchens, size, parking_available, description, rent, deposit, region_id, district_id, address, status, recommended];

    // Only update image if a new one is uploaded
    if (imageBuffer) {
        query += `, image = ?`;
        values.push(imageBuffer);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    mysqlconnection.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error updating the properties", details: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "properties not found" });
        }

        // Return updated properties ID
        res.status(200).json({ id, message: "properties updated successfully" });
    });
});


PropertyRouter.post('/delete', (req, res) => {
    const { id } = req.body;
    console.log(req.body);
    mysqlconnection.query('delete from properties where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = PropertyRouter;