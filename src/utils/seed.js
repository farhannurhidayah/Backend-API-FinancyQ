const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const educationContents = [
    {
      title: "Cara Mengelola Pengeluaran untuk Meraih Keseimbangan Keuangan",
      description:
        "Mengelola pengeluaran adalah kunci keseimbangan keuangan yang sehat. Hal tersebut bukan hanya tentang menahan diri dari pembelian yang tidak perlu, tetapi juga merencanakan tujuan keuangan masa depan. Pelajari cara membuat anggaran efektif, menetapkan prioritas keuangan, dan mengembangkan kebiasaan pengeluaran bijaksana untuk mencapai kestabilan finansial dan meraih impian tanpa stres.",
      content: "Mengamankan Masa Depan dengan Pendidikan Keuangan",
      imageUrl:
        "https://storage.googleapis.com/bucket-storage-financyq/educationFolder/473b8c54-39f9-4b07-b76d-9308aa272118.png",
      source:
        "https://www.prudential.co.id/id/pulse/article/cara-mengelola-pengeluaran/",
    },
    {
      title: "Pentingnya Penghematan Pengeluaran untuk Rencana Finansial Anda",
      description:
        "Penghematan membantu membangun cadangan dana darurat dan mengelola pengeluaran dengan bijak. Pengelolaan keuangan yang efektif juga membantu merencanakan masa depan keuangan yang lebih stabil.",
      content: "Penghematan Sekarang, Kesejahteraan Masa Depan",
      imageUrl:
        "https://storage.googleapis.com/bucket-storage-financyq/educationFolder/512cd253-2a70-419e-9e5c-b5e8d6bc7e3f.png",
      source: "http://repository.stei.ac.id/5615/3/BAB%20II.pdf",
    },
    {
      title: "Tips Pengelolaan Keuangan untuk Generasi Muda",
      description:
        "Dapatkan tips mengelola keuangan untuk generasi muda, termasuk perencanaan keuangan, menabung, hidup dengan anggaran, dan mencari penghasilan tambahan. Pahami pentingnya pengelolaan keuangan untuk masa depan yang lebih baik.",
      content: "Rencanakan Hari Ini, Sukseskan Esok",
      imageUrl:
        "https://storage.googleapis.com/bucket-storage-financyq/educationFolder/79324ed7-d73b-4b16-a552-9f131b53e7a0.png",
      source:
        "https://buletin.nscpolteksby.ac.id/tips-pengelolaan-keuangan-untuk-generasi-muda/",
    },
    {
      title: "Pentingnya Pengelolaan Keuangan bagi Generasi Z",
      description:
        "Dapatkan pandangan menarik tentang pentingnya mengelola keuangan sejak muda untuk membentuk fondasi yang kokoh dalam merencanakan masa depan. Generasi Z ditantang untuk memahami pengelolaan keuangan guna menghadapi risiko finansial di masa mendatang. Mulailah hari ini dengan bijaksana mengelola keuangan dan menetapkan tujuan yang jelas untuk masa depan yang sukses.",
      content: "Bijak Mengelola Keuangan, Mewujudkan Masa Depan Generasi Z",
      imageUrl:
        "https://storage.googleapis.com/bucket-storage-financyq/educationFolder/966730e4-c615-465e-b6c4-e4b31a68088a.png",
      source:
        "https://rri.co.id/keuangan/519622/pentingnya-pengelolaan-keuangan-bagi-generasi-z",
    },
    {
      title: "Para Generasi Z, Ayo Kelola Uangmu dengan Bijak!",
      description:
        "Temukan strategi menarik untuk Generasi Z dalam mengatur keuangan mereka. Artikel ini membahas pentingnya menabung sejak dini, komitmen dalam mengelola uang, serta strategi khusus untuk menghadapi dampak negatif dari era digital.",
      content: "Gen Z, Atur Uangmu dengan Bijak!",
      imageUrl:
        "https://storage.googleapis.com/bucket-storage-financyq/educationFolder/983977b6-3158-451b-8a5d-78028fb85060.png",
      source:
        "https://www.uii.ac.id/gen-z-biar-gak-boros-yuk-atur-uang-dengan-cara-ini/",
    },
    {
      title:
        "Mengatasi Perilaku Boros Sebagai Kunci Menuju Kesehatan Finansial dan Lingkungan",
      description:
        "Temukan cara mengatasi perilaku boros yang merugikan kesehatan finansial dan lingkungan. Artikel ini membahas dampak negatif perilaku boros pada kesadaran sosial, kesejahteraan mental, dan lingkungan, serta memberikan solusi untuk mengatasinya.",
      content: "Ayo, Lawan Perilaku Boros!",
      imageUrl:
        "https://storage.googleapis.com/bucket-storage-financyq/educationFolder/a6824df7-760a-469d-9d55-a2fa1c579b2b.png",
      source:
        "https://greatdayhr.com/id-id/blog/akibat-berperilaku-boros-dan-cara-mengatasinya/",
    },
    {
      title: "Understanding The Reason of Impulse Purchases and Solutions",
      description:
        "Explore the reason behind impulse buying and discover effective strategies to curb it. This article delves into the reasons why we often succumb to impulse purchases and provides actionable tips to regain control. Learn how to manage your impulsive shopping urges and cultivate wiser financial habits.",
      content: "Master Your Impulses, Master Your Wallet!",
      imageUrl:
        "https://storage.googleapis.com/bucket-storage-financyq/educationFolder/b4aacd8e-e539-4996-b27e-d2adc5a1ef5d.png",
      source: "https://www.ramseysolutions.com/budgeting/stop-impulse-buys",
    },
  ];

  for (const content of educationContents) {
    await prisma.educationContent.create({
      data: content,
    });
  }

  console.log("Database has been seeded. 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
