require("dotenv").config()
const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const mongoose = require("mongoose");      
const Category = require("./models/Category");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();

// --- Seed categories on DB open ---
const categoriesSeed = [
    { name: "MERN Full Stack Development", description: "Courses related to MERN Stack" },
    { name: "Data Science", description: "Courses related to Data Science" },
    { name: "AI & Machine Learning", description: "Courses related AI and ML" },
    { name: "Java Full Stack", description: "Courses related Java Full Stack" },
    { name: "Data Analytics", description: "Courses related Data Analytics" },
    { name: "Cyber Security", description: "Courses related Cyber Security" },
    { name: "Python Full Stack", description: "Courses related Python Full Stack" },
    { name: "DevOps", description: "Courses related DevOps" },
    { name: "MLOps", description: "Courses related MLOps" },
    { name: "Blockchain", description: "Courses related Blockchain" },
    { name: "Cloud Computing", description: "Courses on AWS, Azure, GCP, architecture" },
    { name: "Mobile App Development", description: "Courses for Android/iOS/React Native" },
    { name: "UI/UX Design", description: "Courses on design, Figma, prototyping" },
    { name: "Database Administration", description: "SQL, NoSQL, DBA topics" },
    { name: "Software Testing & QA", description: "Manual and automated testing courses" },
    { name: "Big Data", description: "Hadoop, Spark and big data processing" },
    { name: "Computer Networks", description: "Networking fundamentals and protocols" },
    { name: "Embedded Systems", description: "Courses on IoT and microcontrollers" },
    { name: "SRE (Site Reliability Engineering)", description: "Reliability, monitoring, SLOs" },
    { name: "Business & Product Management", description: "Product, PM skills & leadership" }
];

async function seedCategories() {
    try {
        console.log("Running category seed...");
        for (const cat of categoriesSeed) {
            // check by name to avoid duplicates
            const existing = await Category.findOne({ name: cat.name }).exec();
            if (existing) {
                console.log(`Category exists: ${cat.name}`);
            } else {
                await Category.create(cat);
                console.log(`Inserted category: ${cat.name}`);
            }
        }
        console.log("Category seed complete.");
    } catch (err) {
        console.error("Error while seeding categories:", err);
    }
}

mongoose.connection.once("open", () => {
  console.log("MongoDB connection opened (detected in index.js).");
  seedCategories();
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error (index.js):", err);
});


//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials:true,
	})
)

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)

//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);


//def route
app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});


app.listen(PORT, () => {
	console.log(`Server is running at ${PORT}`)
})

