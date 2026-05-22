import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema(
  {
    en: {
      title: { type: String, default: '' },
      body: { type: String, default: '' },
    },
    pt: {
      title: { type: String, default: '' },
      body: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const About = mongoose.model('About', aboutSchema);

export default About;
