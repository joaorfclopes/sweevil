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
  galleryImages: [
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/02D3B70B-2D02-4D30-9949-9E78865D6E00.jpeg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/148F26F6-2BAC-43EE-BF53-A53C57467CBA.jpeg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/1F27BDD3-FFB6-4A29-9C31-124DC218BCEF.jpeg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/3406E5D9-049A-4EFD-9545-6C3E0E45C5D3.jpeg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/3BADAF22-7639-42B2-82B4-04610A837067.jpeg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/518550C4-0393-4287-8D01-ADF7774A6E58.jpeg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/5E7753AF-2962-4253-B8A3-736A0615CF46.jpeg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/6273FE92-E4CE-4CA9-99DF-0E3E1E041746.jpeg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/6FA460D3-D62D-4BA2-AE23-A547F0CEBF94.jpeg",
      category: "Digital",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/8BB90D3D-CB9B-4112-89C5-1AEC4860F6A1.jpeg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/9286C4FC-FC3A-43F8-88E0-E5A552EB76FC.jpeg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/9EA9E015-77F6-4EBA-BBCE-F9A6B264AF9D.jpeg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/A1CBB07F-703F-4B2C-91E3-63F89DC1AAD6.jpeg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/art1.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/art2.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/art3.jpg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/BB939203-3751-4FF6-97C1-F64206DFC0BF.png",
      category: "Digital",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/58BD360F-22D6-45C4-80DA-0C3ED62C0335.jpeg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/E3F46006-BB3E-427A-A69B-3DDFE8225BC2.jpeg",
      category: "Digital",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/E44A327F-C6CB-4BF8-B33E-185AD6A8EF7B.jpeg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/EA8E1947-7125-4A44-9F6D-C71812D25285.jpeg",
      category: "Tattoos",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/EEA5D8E4-E510-47FD-A45A-E3ED9140A605.jpeg",
      category: "Digital",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/FD8AFAB6-8E7B-439E-ACC1-D7F2A2986E2C.jpeg",
      category: "Paintings",
    },
    {
      image:
        "https://sweevil-bucket.s3.eu-west-3.amazonaws.com/gallery/C806C778-E819-42CE-81FD-30328AC01395.jpeg",
      category: "Paintings",
    },
  ],
};

export default data;
