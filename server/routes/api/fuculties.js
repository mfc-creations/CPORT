const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load  Schemas
const Faculty = require("../../models/Faculty");
const FacultyUser = require("../../models/FacultyUser");

// Test
router.get("/test", (req, res) => {
  res.json("Faculty works");
});

// add facultydents details
router.post("/", (req, res) => {
  const newFaculty = new Faculty({
    name: req.body.name,
    pfId: req.body.pfId,
    department: req.body.department,
    phone: req.body.phone,
    photo: req.body.photo,
    email: req.body.email
  });
  newFaculty
    .save()
    .then(fclty => res.json(fclty))
    .catch(err => res.json(err));
});

// Get all facultydents
router.get("/", (req, res) => {
  Faculty.findOne({ pfId: req.body.pfId })
    .then(fclty => res.json(fclty))
    .catch(err => res.json(err));
});

// Signup
router.post("/signup", (req, res) => {
  const pfId = req.body.pfId;
  const password = req.body.password;
  Faculty.findOne({ pfId: pfId }).then(faculty => {
    console.log(faculty);
    if (faculty === null) {
      res.status(404).json({ msg: "Faculty not found" });
      return;
    } else {
      FacultyUser.findOne({ faculty: faculty._id }).then(user => {
        console.log(user);
        if (user) {
          return res.status(400).json("You already registered");
        } else {
          const newUser = new FacultyUser({
            faculty: faculty.id,
            pfId: pfId,
            password: password
          });

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;

              newUser
                .save()
                .then(user => {
                  const payload = {
                    id: user.id,
                    pfId: pfId
                  };
                  jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 86400 },
                    (err, token) => {
                      res.json({
                        success: true,
                        token: "Bearer " + token
                      });
                    }
                  );
                })
                .catch(err => res.json(err));
            });
          });
        }
      });
    }
  });
});

// Login
router.post("/login", (req, res) => {
  pfId = req.body.pfId;
  password = req.body.password;

  FacultyUser.findOne({ pfId: pfId }).then(user => {
    if (!user) {
      // errors.email = "User not found";
      res.status(404).json({ msg: "You are not registered" });
    }
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = {
          id: user.id,
          pfId: pfId
        };
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 86400 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res.status(400).json({ msg: "Incorrect Password" });
      }
    });
  });
});

module.exports = router;
