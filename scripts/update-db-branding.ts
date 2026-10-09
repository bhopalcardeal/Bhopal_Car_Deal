import { prisma } from "../lib/db";

async function updateDbBranding() {
  console.log("Updating database records to remove Elite Carz and Delhi/NCR references...\n");

  // 1. Update Testimonials
  await prisma.testimonial.update({
    where: { id: "cmu15ulcm0029vhooyqdwmdrc" },
    data: {
      city: "Bhopal",
      quote: "The transparent fixed-price model at Bhopal Car Deal eliminated the haggling nightmare. The 150-checkpoint inspection report was completely accurate and the car drove like a dream on delivery day!",
    },
  });

  await prisma.testimonial.update({
    where: { id: "cmu15ulg5002avhoomaes7smh" },
    data: {
      city: "Indore",
    },
  });

  await prisma.testimonial.update({
    where: { id: "cmu15uljm002bvhooksuc70xj" },
    data: {
      city: "Bhopal",
      quote: "Bhopal Car Deal managed the entire RC transfer at the RTO without me lifting a finger. The 6-month comprehensive warranty gives genuine peace of mind.",
    },
  });
  console.log("✅ Updated 3 Testimonials in database.");

  // Also scan if any other testimonial mentions Elite
  const otherTestimonials = await prisma.testimonial.findMany();
  for (const t of otherTestimonials) {
    if (t.quote.includes("Elite") || t.city === "New Delhi" || t.city === "Gurugram" || t.city === "Noida") {
      const newQuote = t.quote.replace(/Elite Carz/gi, "Bhopal Car Deal").replace(/Elite Cars/gi, "Bhopal Car Deal");
      const newCity = t.city === "Gurugram" ? "Indore" : "Bhopal";
      await prisma.testimonial.update({
        where: { id: t.id },
        data: { quote: newQuote, city: newCity },
      });
      console.log(`✅ Updated extra testimonial: ${t.id}`);
    }
  }

  // 2. Update FAQs
  await prisma.fAQ.update({
    where: { id: "cmu15uln1002cvhooxocezszy" },
    data: {
      answer: "We benchmark every car against real Madhya Pradesh transaction data and inspect over 150 points. This eliminates arbitrary inflated dealer margins and gives buyers and sellers genuine market transparency without tiring negotiations.",
    },
  });

  await prisma.fAQ.update({
    where: { id: "cmu15ulql002dvhoou5ct779i" },
    data: {
      answer: "Bhopal Car Deal handles 100% of the RTO documentation and ownership transfer process at zero service charge. We track the process until the updated registration certificate is officially issued in the buyer's name.",
    },
  });
  console.log("✅ Updated FAQs in database.");

  // 3. Update Banner
  await prisma.banner.update({
    where: { id: "cmu15umb5002hvhooajiax1xj" },
    data: {
      title: "Bhopal's Premier Certified Pre-Owned Collection",
    },
  });
  console.log("✅ Updated Banner in database.");

  // 4. Update Car Listings
  await prisma.carListing.update({
    where: { id: "cmu15uh8m0007vhookbfhvmu1" },
    data: {
      description: "Pristine Mercedes-Benz C 220d with refined diesel efficiency and plush ride quality. Features dual-zone climate control, memory seats, digital cockpit, and complete service history at authorized Mercedes-Benz service center.",
    },
  });

  await prisma.carListing.update({
    where: { id: "cmu15uimo000zvhoo3t8h4rhn" },
    data: {
      description: "The gold standard in highway touring comfort. Top-end ZX trim with captain seats, tan leather upholstery, 7 airbags, cruise control, and immaculate single-owner Madhya Pradesh registration.",
    },
  });
  console.log("✅ Updated Car Listings in database.");

  console.log("\n🎉 All database branding successfully updated to Bhopal Car Deal & Bhopal/Indore!");
}

updateDbBranding()
  .catch((e) => {
    console.error("Error updating DB branding:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
