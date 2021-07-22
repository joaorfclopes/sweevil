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
      name: "Sweevil Long Sleeve",
      category: "Hoodies",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/longsleeve01.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/longsleeve02.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/longsleeve03.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/longsleeve04.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/longsleeve05.jpg",
      ],
      price: 35,
      description:
        "High quality serigraph printing. The model is 160cm tall and she's wearing a XL size",
      isClothing: true,
      countInStock: {
        stock: null,
        xs: null,
        s: null,
        m: null,
        l: 1,
        xl: 3,
        xxl: null,
      },
      visible: true,
    },
    {
      name: "Sweevil T-Shirt",
      category: "T-Shirts",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/teessweevil01.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/teessweevil02.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/teessweevil03.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/teessweevil04.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/teessweevil05.jpg",
      ],
      price: 30,
      description:
        "High quality serigraph printing; 100% cotton; The model is 160cm tall and she's wearing a XL size",
      isClothing: true,
      countInStock: {
        stock: null,
        xs: 0,
        s: 5,
        m: 3,
        l: 5,
        xl: 3,
        xxl: 0,
      },
      visible: true,
    },
    {
      name: "Sweevil Tote Bag",
      category: "Bags",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tote01.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tote02.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tote03.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tote04.jpg",
      ],
      price: 20,
      description: "High quality serigraph printing. 100% cotton",
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
      visible: true,
    },
    {
      name: "Sweevil White T-Shirt",
      category: "T-Shirts",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/16imgsite.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/10imgsite.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/09imgsite.jpg",
      ],
      price: 15,
      description: "High quality serigraph printing. 100% cotton",
      isClothing: true,
      countInStock: {
        stock: null,
        xs: 0,
        s: 5,
        m: 4,
        l: 0,
        xl: 0,
        xxl: 0,
      },
      visible: true,
    },
    {
      name: "Sweevil Black T-Shirt",
      category: "T-Shirts",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/13imgsite.jpg",
      ],
      price: 15,
      description: "High quality serigraph printing. 100% cotton",
      isClothing: true,
      countInStock: {
        stock: null,
        xs: 0,
        s: 1,
        m: 0,
        l: 0,
        xl: 0,
        xxl: 0,
      },
      visible: true,
    },
    {
      name: "Sweevil Black Hoodie",
      category: "Hoodies",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/15imgsite.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/12imgsite.jpg",
      ],
      price: 60,
      description: "High quality serigraph printing. 100% cotton",
      isClothing: true,
      countInStock: {
        stock: null,
        xs: 0,
        s: 0,
        m: 0,
        l: 0,
        xl: 0,
        xxl: 0,
      },
      visible: true,
    },
    {
      name: "The New Original Sin",
      category: "Paintings",
      images: [
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tela01.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tela02.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tela03.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tela04.jpg",
        "https://sweevil.s3.eu-west-3.amazonaws.com/store/tela05.jpg",
      ],
      price: 1500,
      description: "Acrylic on canvas - 95x75cm",
      isClothing: false,
      countInStock: {
        stock: 1,
        xs: null,
        s: null,
        m: null,
        l: null,
        xl: null,
        xxl: null,
      },
      visible: true,
    },
  ],
  galleryImages: [
    {
      "image": "/images/tattoo9.jpg",
      "description": "Portugal, 2019",
      "category": "Tattoos"
    },
    {
      "image": "/images/tattoo19.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/digital18.jpg",
      "description": "“The fruit of love”, 2021. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/digital20.jpg",
      "description": "“Love is freedom”, 2021. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/painting1.jpg",
      "description": "“Reality is equilibrium”, 2020. Acrylic on paper",
      "category": "Paintings"
    },
    {
      "image": "/images/digital10.jpg",
      "description": "“Fuel”, 2021. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/digital6.jpg",
      "description": "“Mithya”, 2021. Digital comic",
      "category": "Digital"
    },
    {
      "image": "/images/tattoo12.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/tattoo26.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/tattoo7.jpg",
      "description": "Portugal, 2020",
      "category": "Tattoos"
    },
    {
      "image": "/images/painting5.jpg",
      "description": "“Wake up call”, 2020. Acrylic on paper",
      "category": "Paintings"
    },
    {
      "image": "/images/tattoo14.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/painting4.jpg",
      "description": "“Strange box”, 2020. Acrylic on paper",
      "category": "Paintings"
    },
    {
      "image": "/images/tattoo10.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/tattoo23.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/tattoo18.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/painting8.jpg",
      "description": "Detail from “Reality is equilibrium”, 2020. Acrylic on paper",
      "category": "Paintings"
    },
    {
      "image": "/images/digital17.jpg",
      "description": "“Muerde la manzana” or “The forbidden fruit season”, 2021. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/tattoo20.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/digital1.jpg",
      "description": "“Equilibrium is everywhere”, 2020. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/tattoo3.jpg",
      "description": "Portugal, 2020",
      "category": "Tattoos"
    },
    {
      "image": "/images/tattoo15.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/painting9.jpg",
      "description": "“Solid gold”, 2020. Acrylic on paper",
      "category": "Paintings"
    },
    {
      "image": "/images/tattoo25.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/painting11.jpg",
      "description": "“The new original sin”, 2020. Acrylic on canvas",
      "category": "Paintings"
    },
    {
      "image": "/images/tattoo2.jpg",
      "description": "Portugal, 2020",
      "category": "Tattoos"
    },
    {
      "image": "/images/painting2.jpg",
      "description": "“Isolation”, 2020. Acrylic on paper",
      "category": "Paintings"
    },
    {
      "image": "/images/digital13.jpg",
      "description": "“Traveling shapes”, 2021. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/digital19.jpg",
      "description": "“The forbidden fruit season”, 2021. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/tattoo22.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/digital16.jpg",
      "description": "“There is no hell”, 2021. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/digital7.jpg",
      "description": "“Transparency is all I see”, 2021. Digital comic",
      "category": "Digital"
    },
    {
      "image": "/images/painting6.jpg",
      "description": "“Against the law”, 2020. Acrylic on paper",
      "category": "Paintings"
    },
    {
      "image": "/images/painting3.jpg",
      "description": "“The system”, 2020. Pencil",
      "category": "Paintings"
    },
    {
      "image": "/images/tattoo27.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/painting10.jpg",
      "description": "“Illusion”, 2020. Acrylic on paper",
      "category": "Paintings"
    },
    {
      "image": "/images/tattoo21.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/tattoo6.jpg",
      "description": "Portugal, 2020",
      "category": "Tattoos"
    },
    {
      "image": "/images/tattoo5.jpg",
      "description": "Portugal, 2020",
      "category": "Tattoos"
    },
    {
      "image": "/images/tattoo17.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "_id": "602fd1e74704f500045ffc8d",
      "image": "/images/digital3.jpg",
      "description": "“The rebirthing”, 2020. Digital comic",
      "category": "Digital"
    },
    {
      "image": "/images/tattoo8.jpg",
      "description": "Portugal, 2020",
      "category": "Tattoos"
    },
    {
      "image": "/images/digital15.jpg",
      "description": "“Nothing’s permanent”, 2021. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/tattoo16.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/painting7.jpg",
      "description": "“Sinking”, 2020. Acrylic on paper",
      "category": "Paintings"
    },
    {
      "image": "/images/tattoo4.jpg",
      "description": "Portugal, 2020",
      "category": "Tattoos"
    },
    {
      "image": "/images/digital11.jpg",
      "description": "“Breaking samsara”, 2021. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/digital14.jpg",
      "description": "“Infinite contemplation of limitless love”, 2021. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/digital9.jpg",
      "description": "“It’s always you”, 2021. Digital comic",
      "category": "Digital"
    },
    {
      "image": "/images/digital12.jpg",
      "description": "“Neo renascence”, 2021. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/digital2.jpg",
      "description": "“It didn’t came from outer space”, 2020. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/tattoo24.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/digital8.jpg",
      "description": "“Vampira”, 2021. Digital comic",
      "category": "Digital"
    },
    {
      "image": "/images/tattoo13.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/digital4.jpg",
      "description": "“We’re players”, 2020. Digital illustration",
      "category": "Digital"
    },
    {
      "image": "/images/tattoo11.jpg",
      "description": "Portugal, 2021",
      "category": "Tattoos"
    },
    {
      "image": "/images/tattoo1.jpg",
      "description": "Portugal, 2020",
      "category": "Tattoos"
    },
    {
      "image": "/images/digital5.jpg",
      "description": "“Your Ego is not your Amigo”, 2021. Digital illustration",
      "category": "Digital"
    }
  ],
};

export default data;
