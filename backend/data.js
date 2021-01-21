/* eslint-disable no-dupe-keys */
import bcrypt from "bcryptjs";

const data = {
  users: [
    {
      name: "Sweevil",
      email: "joaorfclopes@gmail.com",
      phoneNumber: 910917510,
      password: bcrypt.hashSync("admin", 8),
      isAdmin: true,
    },
  ],
  products: [
    {
      name: "Sweevil Tote Bag",
      category: "Bags",
      images: [
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/bag1.jpg",
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/bag1%26tshirt4.jpg",
      ],
      price: 20,
      description: "high quality product",
      isClothing: false,
      countInStock: {
        stock: 10,
        xs: null,
        s: null,
        m: null,
        l: null,
        xl: null,
        xxl: null,
      },
    },
    {
      name: "T-Shirt Sweevil",
      category: "T-Shirts",
      images: [
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/tshirt4.jpg",
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/tshirt5.jpg",
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/bag1%26tshirt4.jpg",
      ],
      price: 30,
      description: "high quality product",
      countInStock: 10,
      isClothing: true,
      countInStock: {
        stock: null,
        xs: 10,
        s: 10,
        m: 10,
        l: 10,
        xl: 10,
        xxl: 10,
      },
    },
    {
      name: "Sweevil Long Sleeve 2020",
      category: "Hoodies",
      images: [
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/long-sleeve1.jpg",
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/long-sleeve2.jpg",
      ],
      price: 40,
      description: "high quality product",
      countInStock: 10,
      isClothing: true,
      countInStock: {
        stock: null,
        xs: 10,
        s: 10,
        m: 10,
        l: 10,
        xl: 10,
        xxl: 10,
      },
    },
    {
      name: "T-Shirt Sweevil White",
      category: "T-Shirts",
      images: [
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/tshirt1.jpg",
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/tshirt3%261.jpg",
      ],
      price: 30,
      description: "high quality product",
      countInStock: 10,
      isClothing: true,
      countInStock: {
        stock: null,
        xs: 10,
        s: 10,
        m: 10,
        l: 10,
        xl: 10,
        xxl: 10,
      },
    },
    {
      name: "T-Shirt Sweevil Black",
      category: "T-Shirts",
      images: [
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/tshirt2.jpg",
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/tshirt3%261.jpg",
      ],
      price: 30,
      description: "high quality product",
      countInStock: 10,
      isClothing: true,
      countInStock: {
        stock: null,
        xs: 10,
        s: 10,
        m: 10,
        l: 10,
        xl: 10,
        xxl: 10,
      },
    },
  ],
  galleryImages: [
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/digital3.jpg",
      category: "Digital",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/painting2.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/tattoo4.jpg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/tattoo5.jpg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/painting3.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/tattoo6.jpg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/painting4.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/tattoo7.jpg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/digital2.jpg",
      category: "Digital",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/painting8.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/painting1.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/digital4.jpg",
      category: "Digital",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/painting9.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/tattoo9.jpg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/painting10.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/tattoo1.jpg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/painting11.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/tattoo2.jpg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/painting5.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/tattoo3.jpg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/painting6.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/painting7.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/tattoo8.jpg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/digital1.jpg",
      category: "Digital",
    },
  ],
};

export default data;
