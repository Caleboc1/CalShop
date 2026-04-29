# AcctMarket — Digital Accounts Marketplace

A full-stack Next.js 15 digital accounts shop built on top of Acctshop's API.

---

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
# Fill in your .env values
npx prisma db push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run dev
```

Open http://localhost:3000

---

## 📁 Key Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/shop` | Product catalog |
| `/shop/[id]` | Product detail + buy |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | User overview |
| `/dashboard/orders` | Order history + credentials |
| `/dashboard/wallet` | Fund wallet via Paystack |
| `/dashboard/settings` | Profile settings |
| `/admin` | Admin overview |
| `/admin/products` | Manage products |
| `/admin/upstream` | View + import from Acctshop |
| `/admin/orders` | All orders |
| `/admin/users` | All users |

---

## 🔑 Environment Variables

```bash
DATABASE_URL=             # PostgreSQL (use Neon.tech free tier)
NEXTAUTH_URL=             # http://localhost:3000 in dev
NEXTAUTH_SECRET=          # openssl rand -base64 32
PAYSTACK_SECRET_KEY=      # sk_live_xxx
PAYSTACK_PUBLIC_KEY=      # pk_live_xxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY= # pk_live_xxx
ACCTSHOP_API_URL=         # https://www.acctshop.com/api/v2
ACCTSHOP_API_KEY=         # your Acctshop API key
USD_TO_NGN=               # 1620 (update regularly)
MARKUP=                   # 2.2 (120% margin)
NEXT_PUBLIC_APP_NAME=     # AcctMarket
NEXT_PUBLIC_APP_URL=      # http://localhost:3000
```

---

## 💰 Business Model

1. User funds wallet → NGN credited to your Paystack account
2. User buys a product → your app calls Acctshop API
3. Acctshop returns credentials → stored encrypted in your DB
4. User sees credentials instantly in `/dashboard/orders`

Your profit = Your NGN price − (Acctshop USD price × exchange rate)

---

## 🛠 Admin Access

After seeding:
- Email: `admin@acctmarket.com`
- Password: `admin123`

Go to `/admin/upstream` → click **Import All** to pull all Acctshop products.

To make a user admin via Prisma Studio:
```bash
npm run db:studio
```

---

## 🚀 Deploy

Push to GitHub → import to Vercel → add env vars → deploy.
Use Neon.tech for free PostgreSQL.
