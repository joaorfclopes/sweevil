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
      description: "“Against the law’, 2020. Acrylic on paper",
      image: "/images/painting6.jpg",
      category: "Paintings",
    },
    {
      description: "“Isolation”, 2020. Acrylic on paper",
      image: "/images/painting2.jpg",
      category: "Paintings",
    },
    {
      description: "Portugal, 2020",
      image: "/images/tattoo4.jpg",
      category: "Tattoos",
    },
    {
      description: "Portugal, 2020",
      image: "/images/tattoo5.jpg",
      category: "Tattoos",
    },
    {
      description: "“The system”, 2020. Pencil ",
      image: "/images/painting3.jpg",
      category: "Paintings",
    },
    {
      description: "Portugal, 2020",
      image: "/images/tattoo6.jpg",
      category: "Tattoos",
    },
    {
      description: "“Strange box”, 2020. Acrylic on paper",
      image: "/images/painting4.jpg",
      category: "Paintings",
    },
    {
      description: "Portugal, 2020",
      image: "/images/tattoo7.jpg",
      category: "Tattoos",
    },
    {
      description:
        "“It didn’t came from outer space”, 2020. Digital illustration",
      image: "/images/digital2.jpg",
      category: "Digital",
    },
    {
      description: "“Reality is equilibrium”, 2020. Acrylic on paper",
      image: "/images/painting1.jpg",
      category: "Paintings",
    },
    {
      description:
        "Detail from “Reality is equilibrium”, 2020. Acrylic on paper",
      image: "/images/painting8.jpg",
      category: "Paintings",
    },
    {
      description: "Portugal, 2020",
      image: "/images/tattoo9.jpg",
      category: "Tattoos",
    },
    {
      description: "“We’re players”, 2020. Digital illustration",
      image: "/images/digital4.jpg",
      category: "Digital",
    },
    {
      description: "“Solid gold”, 2020. Acrylic on paper",
      image: "/images/painting9.jpg",
      category: "Paintings",
    },
    {
      description: "“Equilibrium is everywhere”, 2020. Digital illustration",
      image: "/images/digital1.jpg",
      category: "Digital",
    },
    {
      description: "“Illusion”, 2020. Acrylic on paper",
      image: "/images/painting10.jpg",
      category: "Paintings",
    },
    {
      description: "Portugal, 2020",
      image: "/images/tattoo1.jpg",
      category: "Tattoos",
    },
    {
      description: "“The new original sin”, 2020. Acrylic on canvas",
      image: "/images/painting11.jpg",
      category: "Paintings",
    },
    {
      description: "Portugal, 2020",
      image: "/images/tattoo2.jpg",
      category: "Tattoos",
    },
    {
      description: "“Sinking”, 2020. Acrylic on paper",
      image: "/images/painting7.jpg",
      category: "Paintings",
    },
    {
      description: "“Wake up call”, 2020. Acrylic on paper",
      image: "/images/painting5.jpg",
      category: "Paintings",
    },
    {
      description: "Portugal, 2020",
      image: "/images/tattoo3.jpg",
      category: "Tattoos",
    },
    {
      description: "“The rebirthing”, 2020. Digital comic",
      image: "/images/digital3.jpg",
      category: "Digital",
    },
    {
      description: "Portugal, 2020",
      image: "/images/tattoo8.jpg",
      category: "Tattoos",
    },
  ],
};

export default data;
