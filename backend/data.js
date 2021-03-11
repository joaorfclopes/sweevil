/* eslint-disable no-dupe-keys */
import bcrypt from "bcryptjs";

const data = {
  users: [
    {
      name: "Joao Lopes",
      email: "joaorfclopes@gmail.com",
      phoneNumber: 910917510,
      password: bcrypt.hashSync("admin", 8),
      isAdmin: true,
    },
    {
      name: "Silvia Peralta",
      email: "sweevil.tattoos@gmail.com",
      phoneNumber: 916828734,
      password: bcrypt.hashSync("admin", 8),
      isAdmin: true,
    },
  ],
  products: [
    {
      name: "Sweevil Tote Bag",
      category: "Bags",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/bag1.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/bag1%26tshirt4.jpg",
      ],
      price: 20,
      description: "High quality serigraph printing",
      isClothing: false,
      countInStock: {
        stock: 20,
        xs: null,
        s: null,
        m: null,
        l: null,
        xl: null,
        xxl: null,
      },
    },
    {
      name: "Sweevil T-Shirt",
      category: "T-Shirts",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tshirt4.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tshirt5.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/bag1%26tshirt4.jpg",
      ],
      price: 30,
      description: "High quality serigraph printing",
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
      name: "Sweevil Long Sleeve",
      category: "Hoodies",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/long-sleeve1.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/long-sleeve2.jpg",
      ],
      price: 40,
      description: "High quality serigraph printing",
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
      name: "Sweevil White T-Shirt",
      category: "T-Shirts",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/7BFA501E-7846-4E58-9D38-7DFCB98F53E9.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/3CE5ADEE-240B-4286-919B-72A5F37E6DC4.jpg",
      ],
      price: 30,
      description: "High quality serigraph printing",
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
      name: "Sweevil Black T-Shirt",
      category: "T-Shirts",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tshirt2.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tshirt3%261.jpg",
      ],
      price: 30,
      description: "High quality serigraph printing",
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
      description: "“Mithya”, 2021. Digital comic",
      image: "/images/digital6.jpg",
      category: "Digital",
    },
    {
      description: "“Against the law”, 2020. Acrylic on paper",
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
      description: "Portugal, 2019",
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
      description: "Transparency is all I see, 2021. Digital comic",
      image: "/images/digital7.jpg",
      category: "Digital",
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
      description: "“Your Ego is not your Amigo”, 2021. Digital illustration",
      image: "/images/digital5.jpg",
      category: "Digital",
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
      _id: "602fd1e74704f500045ffc8d",
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
