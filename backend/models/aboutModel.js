import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Who's Sweevil?" },
    body: { type: String, default: "" },
  },
  { timestamps: true }
);

const About = mongoose.model("About", aboutSchema);

export default About;
