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
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/tshirt4.JPG",
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
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/long-sleeve1.JPG",
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/long-sleeve2.JPG",
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
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/tshirt1.JPG",
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/tshirt3%261.JPG",
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
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/tshirt2.JPG",
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/store/tshirt3%261.JPG",
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
};
export default data;
