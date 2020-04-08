const express = require("express");
const router = express.Router();
const passport = require("passport");

const multer = require("multer");
const Ticket = require("../../models/Ticket");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get("/ticket", (req, res) => {
  res.status(502).json(res);
});

router.post(
  "/ticket",
  upload.single("productImage"),
  // passport.authenticate("jwt", { session: false }),
  (req, res, error) => {
    console.log(req.file);
    const newTicket = new Ticket({
      student: req.user.id,
      content: req.body.content,
      subject: req.body.subject,
      image: req.file.path
    });
    Ticket.findOne({ student: req.user.id })
      .then(request => {
        newTicket
          .save()
          .then(ticket => res.json(ticket))
          .catch(err => res.json(err));
      })

      .catch(error => res.json(error));

    res.status(200).json(res);
  }
);
module.exports = router;
