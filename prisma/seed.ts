import bcrypt from "bcryptjs";
import {
  AuctionStatus,
  ItemCategory,
  ItemCondition,
  ItemStatus,
  PrismaClient,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

type SeedUser = {
  email: string;
  name: string;
  role: UserRole;
  department: string;
};

type SeedItem = {
  name: string;
  category: ItemCategory;
  assetCode: string;
  serialNumber: string;
  model: string;
  condition: ItemCondition;
  description: string;
  includedAccessories: string;
  knownIssues: string;
  imageSeed: string;
};

type SeedAuction = {
  itemCode: string;
  startingPrice: string;
  minIncrement: string;
  startAt: Date;
  endAt: Date;
  status: AuctionStatus;
  bids: Array<{
    userEmail: string;
    amount: string;
    createdAt: Date;
  }>;
};

const users: SeedUser[] = [
  { email: "admin@company.local", name: "Admin Dau Gia", role: UserRole.ADMIN, department: "IT" },
  { email: "alice@company.local", name: "Alice Nguyen", role: UserRole.EMPLOYEE, department: "Finance" },
  { email: "bob@company.local", name: "Bob Tran", role: UserRole.EMPLOYEE, department: "HR" },
  { email: "carol@company.local", name: "Carol Pham", role: UserRole.EMPLOYEE, department: "Operations" },
  { email: "david@company.local", name: "David Le", role: UserRole.EMPLOYEE, department: "Sales" },
  { email: "emma@company.local", name: "Emma Vo", role: UserRole.EMPLOYEE, department: "Marketing" },
  { email: "frank@company.local", name: "Frank Ho", role: UserRole.EMPLOYEE, department: "Engineering" },
  { email: "grace@company.local", name: "Grace Nguyen", role: UserRole.EMPLOYEE, department: "Legal" },
  { email: "henry@company.local", name: "Henry Pham", role: UserRole.EMPLOYEE, department: "Finance" },
  { email: "ivy@company.local", name: "Ivy Tran", role: UserRole.EMPLOYEE, department: "Admin" },
  { email: "jack@company.local", name: "Jack Do", role: UserRole.EMPLOYEE, department: "Operations" },
];

const items: SeedItem[] = [
  {
    name: "Dell Latitude 7420",
    category: ItemCategory.LAPTOP,
    assetCode: "IT-LT-001",
    serialNumber: "DL7420-001",
    model: "Latitude 7420",
    condition: ItemCondition.GOOD,
    description: "Laptop van phong, pin tot, phu hop cong viec hanh chinh.",
    includedAccessories: "Sac Dell 65W, tui chong soc",
    knownIssues: "Viet phai can ve sinh nhe",
    imageSeed: "dell-laptop",
  },
  {
    name: "HP LaserJet Pro M404",
    category: ItemCategory.PRINTER,
    assetCode: "IT-PR-002",
    serialNumber: "HPM404-002",
    model: "LaserJet Pro M404dn",
    condition: ItemCondition.FAIR,
    description: "May in laser den trang, phu hop phong ban nho.",
    includedAccessories: "Day nguon, cap USB",
    knownIssues: "Vo ngoai co vet xuoc nhe",
    imageSeed: "hp-printer",
  },
  {
    name: "Epson DS-530 II",
    category: ItemCategory.SCANNER,
    assetCode: "IT-SC-003",
    serialNumber: "EPS530-003",
    model: "DS-530 II",
    condition: ItemCondition.GOOD,
    description: "May scan toc do cao, phu hop so hoa tai lieu.",
    includedAccessories: "Cap USB, adapter",
    knownIssues: "Khong co",
    imageSeed: "epson-scanner",
  },
  {
    name: "Dell P2419H",
    category: ItemCategory.MONITOR,
    assetCode: "IT-MN-004",
    serialNumber: "DLP2419H-004",
    model: "P2419H",
    condition: ItemCondition.AVERAGE,
    description: "Man hinh 24 inch, phu hop workstation van phong.",
    includedAccessories: "Day HDMI, day nguon",
    knownIssues: "Chan de bi xuoc nhe",
    imageSeed: "dell-monitor",
  },
  {
    name: "Logitech Rally Speaker",
    category: ItemCategory.ACCESSORY,
    assetCode: "IT-AC-005",
    serialNumber: "LRSPK-005",
    model: "Rally Speaker",
    condition: ItemCondition.GOOD,
    description: "Bo loa hoi nghi cho phong hop nho va trung binh.",
    includedAccessories: "Cap ket noi, hop sach",
    knownIssues: "Khong co",
    imageSeed: "logitech-speaker",
  },
];

const now = new Date();
const hours = (value: number) => value * 60 * 60 * 1000;
const days = (value: number) => value * 24 * 60 * 60 * 1000;

const auctions: SeedAuction[] = [
  {
    itemCode: "IT-LT-001",
    startingPrice: "4500000",
    minIncrement: "100000",
    startAt: new Date(now.getTime() - hours(4)),
    endAt: new Date(now.getTime() + days(1)),
    status: AuctionStatus.ACTIVE,
    bids: [
      { userEmail: "alice@company.local", amount: "4700000", createdAt: new Date(now.getTime() - hours(3)) },
      { userEmail: "bob@company.local", amount: "4900000", createdAt: new Date(now.getTime() - hours(2)) },
      { userEmail: "carol@company.local", amount: "5100000", createdAt: new Date(now.getTime() - hours(1)) },
    ],
  },
  {
    itemCode: "IT-PR-002",
    startingPrice: "1200000",
    minIncrement: "50000",
    startAt: new Date(now.getTime() - hours(2)),
    endAt: new Date(now.getTime() + hours(20)),
    status: AuctionStatus.ACTIVE,
    bids: [
      { userEmail: "david@company.local", amount: "1300000", createdAt: new Date(now.getTime() - hours(1)) },
      { userEmail: "emma@company.local", amount: "1400000", createdAt: new Date(now.getTime() - 30 * 60 * 1000) },
    ],
  },
  {
    itemCode: "IT-SC-003",
    startingPrice: "1800000",
    minIncrement: "50000",
    startAt: new Date(now.getTime() + hours(12)),
    endAt: new Date(now.getTime() + days(2)),
    status: AuctionStatus.SCHEDULED,
    bids: [],
  },
  {
    itemCode: "IT-MN-004",
    startingPrice: "700000",
    minIncrement: "50000",
    startAt: new Date(now.getTime() - days(3)),
    endAt: new Date(now.getTime() - days(1)),
    status: AuctionStatus.CLOSED,
    bids: [
      { userEmail: "frank@company.local", amount: "750000", createdAt: new Date(now.getTime() - days(2) - hours(1)) },
      { userEmail: "grace@company.local", amount: "850000", createdAt: new Date(now.getTime() - days(2)) },
      { userEmail: "henry@company.local", amount: "900000", createdAt: new Date(now.getTime() - days(2) + hours(1)) },
    ],
  },
  {
    itemCode: "IT-AC-005",
    startingPrice: "2500000",
    minIncrement: "100000",
    startAt: new Date(now.getTime() - hours(6)),
    endAt: new Date(now.getTime() + hours(6)),
    status: AuctionStatus.ACTIVE,
    bids: [
      { userEmail: "ivy@company.local", amount: "2600000", createdAt: new Date(now.getTime() - hours(5)) },
    ],
  },
];

function svgDataUri(label: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" rx="36" fill="url(#bg)" />
      <rect x="52" y="52" width="696" height="496" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
      <text x="72" y="130" fill="#f8fafc" font-size="42" font-family="Arial, Helvetica, sans-serif" font-weight="700">${label}</text>
      <text x="72" y="180" fill="#cbd5e1" font-size="24" font-family="Arial, Helvetica, sans-serif">Internal auction demo asset</text>
      <rect x="72" y="240" width="656" height="220" rx="24" fill="rgba(255,255,255,0.12)" />
      <circle cx="620" cy="180" r="62" fill="rgba(255,255,255,0.18)" />
      <circle cx="620" cy="180" r="28" fill="rgba(255,255,255,0.28)" />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.itemImage.deleteMany();
  await prisma.item.deleteMany();

  const createdUsers = new Map<string, string>();

  for (const user of users) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        department: user.department,
        isActive: true,
        passwordHash,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        isActive: true,
        passwordHash,
      },
    });

    createdUsers.set(user.email, record.id);
  }

  const adminId = createdUsers.get("admin@company.local");
  if (!adminId) {
    throw new Error("Admin user was not created.");
  }

  const createdItems = new Map<string, string>();

  for (const [index, item] of items.entries()) {
    const record = await prisma.item.create({
      data: {
        name: item.name,
        category: item.category,
        assetCode: item.assetCode,
        serialNumber: item.serialNumber,
        model: item.model,
        description: item.description,
        condition: item.condition,
        includedAccessories: item.includedAccessories,
        knownIssues: item.knownIssues,
        status: ItemStatus.AVAILABLE,
        createdById: adminId,
        images: {
          create: [
            {
              url: svgDataUri(item.name, ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#db2777"][index]),
              altText: item.name,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    createdItems.set(item.assetCode, record.id);
  }

  for (const auction of auctions) {
    const itemId = createdItems.get(auction.itemCode);
    if (!itemId) {
      throw new Error(`Missing item for asset code ${auction.itemCode}`);
    }

    const createdAuction = await prisma.auction.create({
      data: {
        itemId,
        startingPrice: auction.startingPrice,
        minIncrement: auction.minIncrement,
        startAt: auction.startAt,
        endAt: auction.endAt,
        status: auction.status,
        createdById: adminId,
      },
    });

    const createdBidRecords: Array<{
      id: string;
      userEmail: string;
      amount: string;
      createdAt: Date;
    }> = [];

    for (const bid of auction.bids) {
      const userId = createdUsers.get(bid.userEmail);
      if (!userId) {
        throw new Error(`Missing user for email ${bid.userEmail}`);
      }

      const createdBid = await prisma.bid.create({
        data: {
          auctionId: createdAuction.id,
          userId,
          amount: bid.amount,
          createdAt: bid.createdAt,
        },
      });

      createdBidRecords.push({
        id: createdBid.id,
        userEmail: bid.userEmail,
        amount: bid.amount,
        createdAt: bid.createdAt,
      });
    }

    if (auction.status === AuctionStatus.CLOSED && auction.bids.length > 0) {
      const winningBid = createdBidRecords
        .slice()
        .sort((a, b) => Number(b.amount) - Number(a.amount) || a.createdAt.getTime() - b.createdAt.getTime())[0];

      await prisma.auction.update({
        where: { id: createdAuction.id },
        data: {
          winnerId: createdUsers.get(winningBid.userEmail),
          winningBidId: winningBid.id,
          closedAt: auction.endAt,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
