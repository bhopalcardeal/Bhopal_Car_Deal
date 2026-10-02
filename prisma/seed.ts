import {
  PrismaClient,
  CarBodyType,
  FuelType,
  TransmissionType,
  OwnerType,
  InsuranceStatus,
  CarStatus,
  LeadStatus,
  EnquirySource,
  EnquiryStatus,
  AdminRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing data in reverse relation order
  await prisma.buyerEnquiry.deleteMany();
  await prisma.carImage.deleteMany();
  await prisma.carListing.deleteMany();
  await prisma.sellerLead.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.staticPage.deleteMany();
  await prisma.adminUser.deleteMany();

  console.log("🧹 Cleaned existing database records.");

  // 1. Create Default Admin User
  const passwordHash = await bcrypt.hash("Admin@123", 10);
  const adminUser = await prisma.adminUser.create({
    data: {
      name: "Bhopal Car Deal Administrator",
      email: "admin@bhopalcardeal.com",
      passwordHash,
      role: AdminRole.ADMIN,
      lastLogin: new Date(),
    },
  });
  console.log(`👤 Created Admin User: ${adminUser.email}`);

  // 2. Seed 20 Realistic Pre-Owned Cars
  const carsData = [
    {
      slug: "2022-bmw-3-series-330i-m-sport-dl-4492",
      title: "2022 BMW 3 Series 330i M Sport",
      brand: "BMW",
      model: "3 Series",
      variant: "330i M Sport",
      bodyType: CarBodyType.SEDAN,
      manufacturingYear: 2022,
      registrationYear: 2022,
      registrationState: "DL",
      registrationNumber: "DL 01 CZ 4492", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 24500,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Portimao Blue",
      insuranceStatus: InsuranceStatus.COMPREHENSIVE,
      insuranceValidTill: new Date("2027-04-15"),
      price: 4250000,
      discountedPrice: 4100000,
      discountPercent: 3,
      currency: "INR",
      description:
        "Exquisite BMW 330i M Sport finished in Portimao Blue. Loaded with panoramic sunroof, ambient lighting, M-Sport aerodynamic kit, Harman Kardon sound system, and verified BMW service history. Certified with 150+ checkpoint inspection.",
      highlightTags: ["150+ Checkpoint Certified", "Single Owner", "Under Company Warranty", "Accident Free"],
      status: CarStatus.LIVE,
      isFeatured: true,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2021-mercedes-benz-c-class-c220d-progressive-hr-8812",
      title: "2021 Mercedes-Benz C-Class C 220d Progressive",
      brand: "Mercedes-Benz",
      model: "C-Class",
      variant: "C 220d Progressive",
      bodyType: CarBodyType.SEDAN,
      manufacturingYear: 2021,
      registrationYear: 2021,
      registrationState: "HR",
      registrationNumber: "HR 26 DQ 8812", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 36000,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Mojave Silver",
      insuranceStatus: InsuranceStatus.ZERO_DEP,
      insuranceValidTill: new Date("2026-11-20"),
      price: 3890000,
      discountedPrice: null,
      discountPercent: null,
      currency: "INR",
      description:
        "Pristine Mercedes-Benz C 220d with refined diesel efficiency and plush ride quality. Features dual-zone climate control, memory seats, digital cockpit, and complete service history at authorized Mercedes-Benz service center.",
      highlightTags: ["Zero-Dep Insurance", "Single Owner", "Fixed Price", "RC Transfer Included"],
      status: CarStatus.LIVE,
      isFeatured: true,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2023-audi-q5-45-tfsi-technology-dl-1904",
      title: "2023 Audi Q5 45 TFSI Technology",
      brand: "Audi",
      model: "Q5",
      variant: "45 TFSI Technology",
      bodyType: CarBodyType.SUV,
      manufacturingYear: 2023,
      registrationYear: 2023,
      registrationState: "DL",
      registrationNumber: "DL 03 EA 1904", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 14200,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Mythos Black",
      insuranceStatus: InsuranceStatus.COMPREHENSIVE,
      insuranceValidTill: new Date("2028-02-10"),
      price: 5350000,
      discountedPrice: 5190000,
      discountPercent: 3,
      currency: "INR",
      description:
        "Audi Q5 Technology with Quattro AWD, matrix LED headlights, Bang & Olufsen 3D sound system, virtual cockpit plus, and wireless Apple CarPlay. Practically brand-new condition with extended factory warranty.",
      highlightTags: ["Low Mileage", "Quattro AWD", "Company Warranty", "150+ Checkpoint Certified"],
      status: CarStatus.LIVE,
      isFeatured: true,
      isNewArrival: true,
      coverImage: "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2021-porsche-macan-2-turbo-hr-3301",
      title: "2021 Porsche Macan 2.0 Turbo",
      brand: "Porsche",
      model: "Macan",
      variant: "2.0 Turbo",
      bodyType: CarBodyType.SUV,
      manufacturingYear: 2021,
      registrationYear: 2021,
      registrationState: "HR",
      registrationNumber: "HR 70 C 3301", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 22000,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Carrara White Metallic",
      insuranceStatus: InsuranceStatus.ZERO_DEP,
      insuranceValidTill: new Date("2026-09-30"),
      price: 6850000,
      discountedPrice: 6600000,
      discountPercent: 4,
      currency: "INR",
      description:
        "Purebred sports car DNA in an SUV silhouette. 250 BHP 2.0L turbocharged engine mated to Porsche 7-speed PDK transmission. Sport Chrono package, 20-inch RS Spyder wheels, and red leather interior.",
      highlightTags: ["Sport Chrono Package", "PDK Dual-Clutch", "Porsche Maintained", "Pristine Condition"],
      status: CarStatus.LIVE,
      isFeatured: true,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2023-bmw-m340i-xdrive-dl-0034",
      title: "2023 BMW M340i xDrive",
      brand: "BMW",
      model: "3 Series",
      variant: "M340i xDrive",
      bodyType: CarBodyType.SEDAN,
      manufacturingYear: 2023,
      registrationYear: 2023,
      registrationState: "DL",
      registrationNumber: "DL 01 AA 0034", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 11500,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Dravit Grey",
      insuranceStatus: InsuranceStatus.ZERO_DEP,
      insuranceValidTill: new Date("2028-06-18"),
      price: 5950000,
      discountedPrice: null,
      discountPercent: null,
      currency: "INR",
      description:
        "The benchmark performance sports sedan in India. 3.0L In-line 6 cylinder TwinPower Turbo producing 387 BHP and 500 Nm. 0-100 km/h in 4.4 seconds. Laser lights, M Sport differential, and active exhaust.",
      highlightTags: ["387 BHP Inline-6", "xDrive AWD", "Low Mileage", "M Performance"],
      status: CarStatus.LIVE,
      isFeatured: true,
      isNewArrival: true,
      coverImage: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2021-volkswagen-polo-gt-1-tsi-dl-9821",
      title: "2021 Volkswagen Polo GT 1.0 TSI",
      brand: "Volkswagen",
      model: "Polo",
      variant: "GT 1.0 TSI",
      bodyType: CarBodyType.HATCHBACK,
      manufacturingYear: 2021,
      registrationYear: 2021,
      registrationState: "DL",
      registrationNumber: "DL 08 BK 9821", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 32400,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Flash Red",
      insuranceStatus: InsuranceStatus.COMPREHENSIVE,
      insuranceValidTill: new Date("2026-10-14"),
      price: 895000,
      discountedPrice: 845000,
      discountPercent: 6,
      currency: "INR",
      description:
        "Enthusiast-favourite hot hatchback! 1.0 TSI turbo engine with 6-speed torque converter automatic. Crisp steering dynamics, solid European build quality, cruise control, and Apple CarPlay.",
      highlightTags: ["Hot Hatch", "Single Owner", "Great First Car", "Full Service History"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2022-skoda-octavia-2-tsi-lk-hr-7714",
      title: "2022 Škoda Octavia 2.0 TSI L&K",
      brand: "Škoda",
      model: "Octavia",
      variant: "2.0 TSI L&K",
      bodyType: CarBodyType.SEDAN,
      manufacturingYear: 2022,
      registrationYear: 2022,
      registrationState: "HR",
      registrationNumber: "HR 26 EK 7714", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 21000,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Lava Blue",
      insuranceStatus: InsuranceStatus.ZERO_DEP,
      insuranceValidTill: new Date("2027-05-12"),
      price: 2475000,
      discountedPrice: 2390000,
      discountPercent: 3,
      currency: "INR",
      description:
        "The top-tier Laurin & Klement trim of the acclaimed Octavia. 190 BHP 2.0 TSI engine with 7-speed DSG shift-by-wire. 12-speaker Canton audio system, massage driver seat, and massive 600L boot.",
      highlightTags: ["Laurin & Klement", "Canton Sound", "Executive Comfort", "Canton Audio"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2023-skoda-kodiaq-2-tsi-lk-4x4-dl-5011",
      title: "2023 Škoda Kodiaq 2.0 TSI L&K 4x4",
      brand: "Škoda",
      model: "Kodiaq",
      variant: "2.0 TSI L&K 4x4",
      bodyType: CarBodyType.SUV,
      manufacturingYear: 2023,
      registrationYear: 2023,
      registrationState: "DL",
      registrationNumber: "DL 07 CH 5011", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 15400,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Moon White",
      insuranceStatus: InsuranceStatus.ZERO_DEP,
      insuranceValidTill: new Date("2028-03-24"),
      price: 3650000,
      discountedPrice: null,
      discountPercent: null,
      currency: "INR",
      description:
        "Flagship 7-seater luxury SUV with Dynamic Chassis Control (DCC), panoramic sunroof, ventilated front seats, Canton 12-speaker audio, and intelligent 4x4 all-wheel-drive system.",
      highlightTags: ["7-Seater Luxury", "Dynamic Chassis Control", "DCC", "Low Mileage"],
      status: CarStatus.LIVE,
      isFeatured: true,
      isNewArrival: true,
      coverImage: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2021-toyota-fortuner-2-8-4x4-at-up-9002",
      title: "2021 Toyota Fortuner 2.8 4x4 AT",
      brand: "Toyota",
      model: "Fortuner",
      variant: "2.8 4x4 AT",
      bodyType: CarBodyType.SUV,
      manufacturingYear: 2021,
      registrationYear: 2021,
      registrationState: "UP",
      registrationNumber: "UP 16 BJ 9002", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 51200,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Super White",
      insuranceStatus: InsuranceStatus.COMPREHENSIVE,
      insuranceValidTill: new Date("2026-12-05"),
      price: 3450000,
      discountedPrice: 3375000,
      discountPercent: 2,
      currency: "INR",
      description:
        "Bulletproof Toyota reliability and commanding road presence. 204 BHP 500 Nm 2.8L diesel engine with electronic drive control, ventilated seats, JBL 11-speaker sound system, and differential lock.",
      highlightTags: ["Toyota Certified", "4x4 Low/High Range", "High Resale Value", "JBL Audio"],
      status: CarStatus.LIVE,
      isFeatured: true,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2022-toyota-innova-crysta-2-4-zx-7-str-dl-3108",
      title: "2022 Toyota Innova Crysta 2.4 ZX 7 STR",
      brand: "Toyota",
      model: "Innova Crysta",
      variant: "2.4 ZX 7 STR",
      bodyType: CarBodyType.MUV,
      manufacturingYear: 2022,
      registrationYear: 2022,
      registrationState: "DL",
      registrationNumber: "DL 02 CB 3108", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 39000,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.MANUAL,
      colour: "Garnet Red",
      insuranceStatus: InsuranceStatus.COMPREHENSIVE,
      insuranceValidTill: new Date("2027-01-20"),
      price: 2380000,
      discountedPrice: null,
      discountPercent: null,
      currency: "INR",
      description:
        "The gold standard in highway touring comfort. Top-end ZX trim with captain seats, tan leather upholstery, 7 airbags, cruise control, and immaculate single-owner Madhya Pradesh registration.",
      highlightTags: ["Captain Seats", "Single Owner", "Indestructible D-4D", "Highway Cruiser"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2020-bmw-5-series-530d-m-sport-up-6612",
      title: "2020 BMW 5 Series 530d M Sport",
      brand: "BMW",
      model: "5 Series",
      variant: "530d M Sport",
      bodyType: CarBodyType.SEDAN,
      manufacturingYear: 2020,
      registrationYear: 2020,
      registrationState: "UP",
      registrationNumber: "UP 32 CR 6612", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 43000,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Carbon Black",
      insuranceStatus: InsuranceStatus.ZERO_DEP,
      insuranceValidTill: new Date("2026-08-30"),
      price: 4650000,
      discountedPrice: 4490000,
      discountPercent: 3,
      currency: "INR",
      description:
        "Legendary 6-cylinder 3.0L turbo-diesel engine with 265 BHP and 620 Nm of effortless torque. Full M Sport trim with gesture control, Harman Kardon surround sound, remote control parking, and wireless charging.",
      highlightTags: ["620 Nm Torque", "Inline-6 Diesel", "Harman Kardon", "M Sport"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2022-mercedes-benz-glc-300-4matic-dl-7140",
      title: "2022 Mercedes-Benz GLC 300 4MATIC",
      brand: "Mercedes-Benz",
      model: "GLC",
      variant: "GLC 300 4MATIC",
      bodyType: CarBodyType.SUV,
      manufacturingYear: 2022,
      registrationYear: 2022,
      registrationState: "DL",
      registrationNumber: "DL 01 AB 7140", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 26000,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Polar White",
      insuranceStatus: InsuranceStatus.ZERO_DEP,
      insuranceValidTill: new Date("2027-07-15"),
      price: 5590000,
      discountedPrice: 5390000,
      discountPercent: 4,
      currency: "INR",
      description:
        "India's best-selling luxury SUV. Turbo petrol engine with 258 BHP and 4MATIC all-wheel drive. Equipped with 'Hey Mercedes' MBUX voice assistant, 64-colour ambient lighting, and panoramic sunroof.",
      highlightTags: ["4MATIC AWD", "Single Owner", "MBUX Cockpit", "150+ Checkpoint Certified"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: true,
      coverImage: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2021-audi-a4-40-tfsi-technology-hr-1120",
      title: "2021 Audi A4 40 TFSI Technology",
      brand: "Audi",
      model: "A4",
      variant: "40 TFSI Technology",
      bodyType: CarBodyType.SEDAN,
      manufacturingYear: 2021,
      registrationYear: 2021,
      registrationState: "HR",
      registrationNumber: "HR 26 DM 1120", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 33800,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Ibis White",
      insuranceStatus: InsuranceStatus.COMPREHENSIVE,
      insuranceValidTill: new Date("2026-11-04"),
      price: 3150000,
      discountedPrice: 2990000,
      discountPercent: 5,
      currency: "INR",
      description:
        "Supreme luxury commuter with 190 BHP 2.0 TFSI motor and smooth 7-speed S-Tronic gearbox. Features 3-zone climate control, virtual cockpit, piano black inlays, and wireless charging.",
      highlightTags: ["Technology Trim", "Virtual Cockpit", "Audi Maintained", "RC Included"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2021-hyundai-creta-1-4-turbo-dct-sx-o-dl-8833",
      title: "2021 Hyundai Creta 1.4 Turbo DCT SX(O)",
      brand: "Hyundai",
      model: "Creta",
      variant: "1.4 Turbo DCT SX(O)",
      bodyType: CarBodyType.SUV,
      manufacturingYear: 2021,
      registrationYear: 2021,
      registrationState: "DL",
      registrationNumber: "DL 09 CF 8833", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 31000,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Phantom Black",
      insuranceStatus: InsuranceStatus.COMPREHENSIVE,
      insuranceValidTill: new Date("2026-09-18"),
      price: 1395000,
      discountedPrice: null,
      discountPercent: null,
      currency: "INR",
      description:
        "India's favourite mid-size SUV in its punchiest spec. 140 PS 1.4 Turbo petrol with fast dual-clutch transmission. Ventilated front seats, Bose 8-speaker audio, panoramic sunroof, and traction modes.",
      highlightTags: ["Bose Sound", "Ventilated Seats", "Panoramic Sunroof", "Single Owner"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2022-tata-harrier-fearless-plus-dark-at-up-4411",
      title: "2022 Tata Harrier Fearless Plus Dark AT",
      brand: "Tata",
      model: "Harrier",
      variant: "Fearless Plus Dark AT",
      bodyType: CarBodyType.SUV,
      manufacturingYear: 2022,
      registrationYear: 2022,
      registrationState: "UP",
      registrationNumber: "UP 14 CD 4411", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 28500,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Oberon Black (Dark Edition)",
      insuranceStatus: InsuranceStatus.ZERO_DEP,
      insuranceValidTill: new Date("2027-02-28"),
      price: 1845000,
      discountedPrice: 1790000,
      discountPercent: 3,
      currency: "INR",
      description:
        "Built on the Land Rover D8-derived OMEGArc platform. Kryotec 2.0L diesel engine with 170 PS and Hyundai-sourced 6-speed torque converter AT. Dark edition blacked-out alloy wheels, panoramic sunroof, and JBL audio.",
      highlightTags: ["OMEGArc Platform", "Dark Edition", "JBL 9-Speaker Audio", "5-Star Safety"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2021-mini-cooper-s-3-door-ch-0909",
      title: "2021 Mini Cooper S 3-Door",
      brand: "Mini",
      model: "Cooper",
      variant: "Cooper S 3-Door",
      bodyType: CarBodyType.HATCHBACK,
      manufacturingYear: 2021,
      registrationYear: 2021,
      registrationState: "CH",
      registrationNumber: "CH 01 BG 0909", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 17800,
      fuelType: FuelType.PETROL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Chili Red with White Roof",
      insuranceStatus: InsuranceStatus.COMPREHENSIVE,
      insuranceValidTill: new Date("2026-10-31"),
      price: 3350000,
      discountedPrice: null,
      discountPercent: null,
      currency: "INR",
      description:
        "Iconic go-kart handling! 192 BHP 2.0L turbocharged engine with 7-speed Steptronic dual-clutch transmission. Union Jack LED tail lamps, head-up display, and Harman Kardon hi-fi audio system.",
      highlightTags: ["Go-Kart Handling", "Head-Up Display", "Harman Kardon", "Iconic Style"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2023-volvo-xc60-b5-ultimate-dl-4920",
      title: "2023 Volvo XC60 B5 Ultimate",
      brand: "Volvo",
      model: "XC60",
      variant: "B5 Ultimate",
      bodyType: CarBodyType.SUV,
      manufacturingYear: 2023,
      registrationYear: 2023,
      registrationState: "DL",
      registrationNumber: "DL 04 CZ 4920", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 16200,
      fuelType: FuelType.HYBRID,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Onyx Black",
      insuranceStatus: InsuranceStatus.ZERO_DEP,
      insuranceValidTill: new Date("2028-04-10"),
      price: 5790000,
      discountedPrice: 5600000,
      discountPercent: 3,
      currency: "INR",
      description:
        "The epitome of Scandinavian luxury and world-renowned safety. 250 BHP mild-hybrid petrol engine with Bowers & Wilkins 15-speaker audio, air suspension, Google built-in infotainment, and ADAS Level 2 suite.",
      highlightTags: ["Bowers & Wilkins Audio", "Air Suspension", "ADAS Level 2", "Scandinavian Luxury"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: true,
      coverImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2022-kia-ev6-gt-line-awd-hr-5501",
      title: "2022 Kia EV6 GT-Line AWD",
      brand: "Kia",
      model: "EV6",
      variant: "GT-Line AWD",
      bodyType: CarBodyType.SUV,
      manufacturingYear: 2022,
      registrationYear: 2022,
      registrationState: "HR",
      registrationNumber: "HR 26 FL 5501", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 13000,
      fuelType: FuelType.ELECTRIC,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Moonscape Matte Grey",
      insuranceStatus: InsuranceStatus.ZERO_DEP,
      insuranceValidTill: new Date("2027-08-19"),
      price: 4590000,
      discountedPrice: 4400000,
      discountPercent: 4,
      currency: "INR",
      description:
        "Ultra-futuristic electric crossover built on 800V E-GMP platform. 325 BHP, 605 Nm dual-motor AWD system. 528 km certified range, 10-80% ultra-fast charging in 18 minutes, and augmented reality head-up display.",
      highlightTags: ["800V Ultra-Fast Charge", "325 BHP Dual-Motor", "Zero Emissions", "AR Head-Up Display"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2020-mercedes-benz-e-class-e-220d-exclusive-dl-1109",
      title: "2020 Mercedes-Benz E-Class E 220d Exclusive",
      brand: "Mercedes-Benz",
      model: "E-Class",
      variant: "E 220d Exclusive",
      bodyType: CarBodyType.SEDAN,
      manufacturingYear: 2020,
      registrationYear: 2020,
      registrationState: "DL",
      registrationNumber: "DL 01 CH 1109", // ADMIN-ONLY
      ownerType: OwnerType.FIRST,
      kmDriven: 44000,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Selenite Grey",
      insuranceStatus: InsuranceStatus.COMPREHENSIVE,
      insuranceValidTill: new Date("2026-07-22"),
      price: 4390000,
      discountedPrice: null,
      discountPercent: null,
      currency: "INR",
      description:
        "Long-wheelbase luxury benchmark with reclining rear seats, dual panoramic sunroofs, Burmester surround sound system, touch controls on steering, and air suspension ride comfort.",
      highlightTags: ["Long Wheelbase", "Reclining Rear Seats", "Burmester Audio", "Executive Spec"],
      status: CarStatus.LIVE,
      isFeatured: false,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      slug: "2019-land-rover-discovery-sport-hse-dl-7722",
      title: "2019 Land Rover Discovery Sport HSE",
      brand: "Land Rover",
      model: "Discovery Sport",
      variant: "HSE 2.0 Diesel",
      bodyType: CarBodyType.SUV,
      manufacturingYear: 2019,
      registrationYear: 2019,
      registrationState: "DL",
      registrationNumber: "DL 02 AB 7722", // ADMIN-ONLY
      ownerType: OwnerType.SECOND,
      kmDriven: 58000,
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      colour: "Fuji White",
      insuranceStatus: InsuranceStatus.THIRD_PARTY,
      insuranceValidTill: new Date("2026-05-15"),
      price: 3190000,
      discountedPrice: null,
      discountPercent: null,
      currency: "INR",
      description:
        "Terrain Response 4WD capability in a compact luxury package. Meridian surround sound system, fixed panoramic glass roof, 7-seater versatility, and Land Rover service history.",
      highlightTags: ["Terrain Response 4WD", "Meridian Audio", "Panoramic Roof"],
      status: CarStatus.SOLD, // Sold status for social proof / sold toggle verification
      isFeatured: false,
      isNewArrival: false,
      coverImage: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  ];

  for (const car of carsData) {
    const { images, ...carProps } = car;
    const createdCar = await prisma.carListing.create({
      data: {
        ...carProps,
        createdById: adminUser.id,
        images: {
          create: images.map((url, index) => ({
            url,
            order: index,
            isCover: index === 0,
          })),
        },
      },
    });
    console.log(`🚗 Seeded Car: ${createdCar.title} (Slug: ${createdCar.slug})`);
  }

  // 3. Seed Seller Leads
  const leadsData = [
    {
      name: "Rajesh Malhotra",
      mobileNumber: "+91 98112 34567", // ADMIN-ONLY
      whatsappNumber: "+91 98112 34567", // ADMIN-ONLY
      city: "New Delhi",
      registrationNumber: "DL 01 BA 2341", // ADMIN-ONLY
      registrationState: "DL",
      manufacturingYear: 2022,
      registrationYear: 2022,
      ownerType: OwnerType.FIRST,
      brand: "Hyundai",
      modelName: "Tucson",
      variant: "2.0 CRDi GLS 4WD",
      kmDrivenRange: "20,000 - 40,000 km",
      fuelType: FuelType.DIESEL,
      transmissionType: TransmissionType.AUTOMATIC,
      expectedPrice: 2450000,
      status: LeadStatus.NEW,
      internalNotes: "Customer requested callback between 4 PM and 6 PM.",
      assignedToId: adminUser.id,
    },
    {
      name: "Ananya Sengupta",
      mobileNumber: "+91 98990 12345", // ADMIN-ONLY
      whatsappNumber: "+91 98990 12345", // ADMIN-ONLY
      city: "Gurugram",
      registrationNumber: "HR 26 CS 9012", // ADMIN-ONLY
      registrationState: "HR",
      manufacturingYear: 2021,
      registrationYear: 2021,
      ownerType: OwnerType.FIRST,
      brand: "Honda",
      modelName: "City",
      variant: "ZX CVT Petrol",
      kmDrivenRange: "30,000 - 40,000 km",
      fuelType: FuelType.PETROL,
      transmissionType: TransmissionType.AUTOMATIC,
      expectedPrice: 1180000,
      status: LeadStatus.CONTACTED,
      internalNotes: "Spoke on phone, scheduled physical doorstep evaluation for Friday morning.",
      assignedToId: adminUser.id,
    },
    {
      name: "Vikramaditya Verma",
      mobileNumber: "+91 97170 88990", // ADMIN-ONLY
      whatsappNumber: null,
      city: "Noida",
      registrationNumber: "UP 16 ER 5566", // ADMIN-ONLY
      registrationState: "UP",
      manufacturingYear: 2023,
      registrationYear: 2023,
      ownerType: OwnerType.FIRST,
      brand: "BMW",
      modelName: "X1",
      variant: "sDrive18d M Sport",
      kmDrivenRange: "Below 20,000 km",
      fuelType: FuelType.DIESEL,
      transmissionType: TransmissionType.AUTOMATIC,
      expectedPrice: 4100000,
      status: LeadStatus.INSPECTION_SCHEDULED,
      internalNotes: "Doorstep inspection booked at Sector 15A Noida showroom.",
      assignedToId: adminUser.id,
    },
    {
      name: "Manish Goel",
      mobileNumber: "+91 98100 77665", // ADMIN-ONLY
      whatsappNumber: "+91 98100 77665", // ADMIN-ONLY
      city: "New Delhi",
      registrationNumber: "DL 03 DB 1122", // ADMIN-ONLY
      registrationState: "DL",
      manufacturingYear: 2020,
      registrationYear: 2020,
      ownerType: OwnerType.FIRST,
      brand: "Audi",
      modelName: "A6",
      variant: "45 TFSI Technology",
      kmDrivenRange: "40,000 - 60,000 km",
      fuelType: FuelType.PETROL,
      transmissionType: TransmissionType.AUTOMATIC,
      expectedPrice: 3500000,
      status: LeadStatus.EVALUATED_OFFER_MADE,
      internalNotes: "Evaluated at ₹34,25,000. Customer considering offer, follow up tomorrow.",
      assignedToId: adminUser.id,
    },
  ];

  for (const lead of leadsData) {
    await prisma.sellerLead.create({ data: lead });
  }
  console.log(`📋 Seeded ${leadsData.length} Seller Leads.`);

  // 4. Seed Buyer Enquiries
  const sampleCar = await prisma.carListing.findFirst({
    where: { brand: "BMW" },
  });

  const enquiriesData = [
    {
      relatedCarId: sampleCar?.id ?? null,
      name: "Siddharth Oberoi",
      phone: "+91 99998 12345", // ADMIN-ONLY
      email: "siddharth.oberoi@gmail.com", // ADMIN-ONLY
      message: "Interested in the BMW 3 Series. Is home test drive available in Vasant Vihar this Sunday?",
      source: EnquirySource.CAR_DETAIL,
      status: EnquiryStatus.NEW,
    },
    {
      relatedCarId: sampleCar?.id ?? null,
      name: "Pooja Kapoor",
      phone: "+91 98105 44332", // ADMIN-ONLY
      email: "pooja.k@outlook.com", // ADMIN-ONLY
      message: "Can you provide loan EMI breakup for 36 months with 30% down payment?",
      source: EnquirySource.CAR_DETAIL,
      status: EnquiryStatus.CONTACTED,
    },
    {
      relatedCarId: null,
      name: "Gaurav Bansal",
      phone: "+91 98711 00998", // ADMIN-ONLY
      email: "gbansal@yahoo.com", // ADMIN-ONLY
      message: "Looking for an automatic German SUV under ₹45 Lakhs. Please share available options.",
      source: EnquirySource.CONTACT_PAGE,
      status: EnquiryStatus.NEW,
    },
  ];

  for (const enquiry of enquiriesData) {
    await prisma.buyerEnquiry.create({ data: enquiry });
  }
  console.log(`📬 Seeded ${enquiriesData.length} Buyer Enquiries.`);

  // 5. Seed Testimonials
  const testimonialsData = [
    {
      name: "Arjun Mehra",
      city: "Bhopal",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      quote:
        "The transparent fixed-price model at Bhopal Car Deal eliminated the haggling nightmare. The 150-checkpoint inspection report was completely accurate and the car drove like a dream on delivery day!",
      carBought: "2022 BMW 3 Series 330i",
      rating: 5,
      featured: true,
    },
    {
      name: "Dr. Rohini Gupta",
      city: "Indore",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      quote:
        "Sold my C-Class within 48 hours without dealer middlemen calling every hour. Their team inspected the car at my clinic and transferred funds straight into my bank account.",
      carBought: "Sold Mercedes C-Class",
      rating: 5,
      featured: true,
    },
    {
      name: "Kabir Khanna",
      city: "Bhopal",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      quote:
        "Bhopal Car Deal managed the entire RC transfer at the RTO without me lifting a finger. The 12-month comprehensive warranty gives genuine peace of mind.",
      carBought: "2021 Porsche Macan",
      rating: 5,
      featured: true,
    },
  ];

  for (const testimonial of testimonialsData) {
    await prisma.testimonial.create({ data: testimonial });
  }
  console.log(`⭐ Seeded ${testimonialsData.length} Testimonials.`);

  // 6. Seed FAQs
  const faqsData = [
    {
      question: "Why do you follow a fixed-price policy?",
      answer:
        "We benchmark every car against real Madhya Pradesh transaction data and inspect over 150 points. This eliminates arbitrary inflated dealer margins and gives buyers and sellers genuine market transparency without tiring negotiations.",
      category: "Pricing",
      order: 1,
      active: true,
    },
    {
      question: "Who is responsible for the RTO ownership transfer (RC Transfer)?",
      answer:
        "Bhopal Car Deal handles 100% of the RTO documentation and ownership transfer process at zero service charge. We track the process until the updated registration certificate is officially issued in the buyer's name.",
      category: "Documentation",
      order: 2,
      active: true,
    },
    {
      question: "What warranty coverage is included with my purchase?",
      answer:
        "Every certified vehicle comes with a complimentary 12-Month / 15,000 KM powertrain warranty covering engine, transmission, and drivetrain components, backed by roadside assistance.",
      category: "Warranty",
      order: 3,
      active: true,
    },
    {
      question: "Can I get financing and calculate monthly EMI?",
      answer:
        "Yes, we have tie-ups with leading banks (HDFC, ICICI, Axis) and NBFCs offering loans up to 85% of car value at competitive interest rates starting at 8.99% per annum with flexible tenures up to 60 months.",
      category: "Financing",
      order: 4,
      active: true,
    },
    {
      question: "How does the 'Sell Your Car' evaluation process work?",
      answer:
        "Simply fill out our online form with your car details. We will provide an instant algorithmic price estimate, schedule a free doorstep inspection at your convenience, and offer immediate payment upon agreement.",
      category: "Selling",
      order: 5,
      active: true,
    },
  ];

  for (const faq of faqsData) {
    await prisma.fAQ.create({ data: faq });
  }
  console.log(`❓ Seeded ${faqsData.length} FAQs.`);

  // 7. Seed Banners
  const bannersData = [
    {
      title: "Bhopal's Premier Certified Pre-Owned Collection",
      subtitle: "150+ Checkpoint Certified • 12-Month Warranty Included • Transparent Fixed Pricing",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85",
      link: "/cars",
      order: 1,
      active: true,
    },
    {
      title: "Sell Your Luxury Car in 30 Minutes",
      subtitle: "Free Doorstep Inspection • Best Market Value • Immediate Bank Transfer",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=85",
      link: "/sell-your-car",
      order: 2,
      active: true,
    },
  ];

  for (const banner of bannersData) {
    await prisma.banner.create({ data: banner });
  }
  console.log(`🖼️ Seeded ${bannersData.length} Banners.`);

  // 8. Seed Static Pages
  const staticPagesData = [
    {
      slug: "about-us",
      title: "About Bhopal Car Deal",
      content:
        "Bhopal Car Deal is Bhopal’s premier pre-owned car showroom, founded in 2004. Located at Shop No. 3 & 4, Near LBS Heart Hospital, In front of Motia Talab, Bhopal (M.P.). Over the last two decades, we have served thousands of satisfied customers across Bhopal, Indore, and Madhya Pradesh with quality certified cars, verified paperwork, and transparent dealings.",
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      content:
        "At Bhopal Car Deal, we take data privacy seriously in strict adherence to the Information Technology Act, 2000. Personal data submitted via our enquiry and vehicle sale forms is strictly utilized for contact and transaction processing by authorized dealership staff and is never exposed or sold to third-party marketing entities.",
    },
    {
      slug: "terms-and-conditions",
      title: "Terms and Conditions",
      content:
        "Vehicle reservations, token payments, and purchase agreements are governed by our standard dealership terms. Vehicle specifications, prices, and availability are subject to prior sale. Physical inspections and test drives are conducted strictly with verified valid driving licenses.",
    },
  ];

  for (const page of staticPagesData) {
    await prisma.staticPage.create({ data: page });
  }
  console.log(`📄 Seeded ${staticPagesData.length} Static Pages.`);

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
