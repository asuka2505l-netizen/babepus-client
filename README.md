# Use Cases - BabePus Marketplace

## Ringkasan
BabePus adalah aplikasi marketplace untuk jual-beli barang bekas khusus untuk komunitas kampus. Pengguna dapat menjual produk, membeli, menawar, dan berinteraksi dengan buyer/seller lain.

---

## 1. USER REGISTRATION & AUTHENTICATION

### UC-001: Register Pengguna Baru
**Actor:** Guest (Calon pengguna)  
**Precondition:** User belum memiliki akun  
**Main Flow:**
1. User membuka halaman Register
2. User mengisi form dengan:
   - Email kampus
   - Password
   - Nama lengkap
   - Nomor telepon
   - Kampus
   - Fakultas
   - Program studi
   - Nomor induk mahasiswa (student ID)
3. Sistem validasi input
4. Sistem hash password menggunakan bcrypt
5. Sistem menyimpan user ke database
6. Sistem mengirim verification token ke email
7. User diarahkan ke halaman login

**Postcondition:** User berhasil terdaftar dan email verifikasi dikirim

---

### UC-002: Login Pengguna
**Actor:** Registered User  
**Precondition:** User sudah terdaftar  
**Main Flow:**
1. User membuka halaman Login
2. User mengisi email dan password
3. Sistem validasi kredensial terhadap database
4. Sistem generate JWT token
5. Token disimpan di localStorage
6. User diarahkan ke dashboard/marketplace
7. Header Authorization otomatis mengirim Bearer token

**Postcondition:** User berhasil login dan authenticated

---

### UC-003: Verifikasi Email
**Actor:** Registered User  
**Precondition:** User sudah register, email belum diverifikasi  
**Main Flow:**
1. User menerima email dengan link verifikasi
2. User klik link atau masukkan token manual
3. Sistem validasi token verifikasi email
4. Sistem update status `email_verified_at` di database
5. Sistem tampilkan notifikasi sukses

**Postcondition:** Email user terverifikasi, akun fully activated

---

### UC-004: Auto Logout (Token Expired)
**Actor:** Authenticated User  
**Precondition:** User sedang login  
**Main Flow:**
1. User melakukan request ke API
2. Server mengembalikan response 401 (Unauthorized)
3. Interceptor axios mendeteksi 401
4. Sistem trigger `unauthorizedHandler()`
5. Sistem hapus token dari localStorage
6. Sistem clear user state di AuthContext
7. User diarahkan otomatis ke halaman login

**Postcondition:** Session user berakhir, harus login ulang

---

## 2. PRODUCT MANAGEMENT (SELLER)

### UC-005: List Produk Baru
**Actor:** Authenticated User (Seller)  
**Precondition:** User sudah login  
**Main Flow:**
1. Seller membuka halaman "Tambah Produk" di Dashboard
2. Seller mengisi form:
   - Nama produk
   - Deskripsi
   - Kategori
   - Harga
   - Kondisi (baru/bekas)
   - Foto produk (multiple upload)
   - Lokasi/kampus
3. Sistem validasi input menggunakan express-validator
4. Sistem upload foto ke folder `/uploads`
5. Sistem simpan data produk ke table `products`
6. Sistem set status produk = "active"
7. Sistem tampilkan notifikasi sukses

**Postcondition:** Produk berhasil di-list di marketplace

---

### UC-006: Edit Produk
**Actor:** Authenticated User (Seller)  
**Precondition:** User sudah login, user adalah pemilik produk  
**Main Flow:**
1. Seller membuka halaman Dashboard > Products
2. Seller pilih produk untuk edit
3. Seller ubah detail produk (nama, harga, foto, dll)
4. Sistem validasi input
5. Sistem update record produk di database
6. Sistem update foto jika ada file baru
7. Sistem tampilkan notifikasi sukses

**Postcondition:** Produk berhasil diperbarui

---

### UC-007: Hapus Produk
**Actor:** Authenticated User (Seller)  
**Precondition:** User sudah login, user adalah pemilik produk  
**Main Flow:**
1. Seller membuka halaman Dashboard > Products
2. Seller pilih produk untuk dihapus
3. Sistem tampilkan konfirmasi dialog
4. Seller konfirmasi delete
5. Sistem soft-delete atau hard-delete record produk
6. Sistem hapus foto terkait
7. Sistem tampilkan notifikasi sukses

**Postcondition:** Produk dihapus dari marketplace

---

### UC-008: View Produk di Marketplace
**Actor:** Any User (authenticated or guest)  
**Precondition:** Ada produk aktif di database  
**Main Flow:**
1. User masuk ke halaman Marketplace
2. Sistem load daftar produk dari API
3. Sistem tampilkan produk dengan:
   - Foto
   - Nama
   - Harga
   - Kondisi
   - Lokasi/kampus
   - Rating seller
4. User dapat filter berdasarkan:
   - Kategori
   - Harga range (slider)
   - Kondisi
   - Lokasi
5. User dapat search by keyword
6. Sistem load produk sesuai filter

**Postcondition:** User melihat list produk sesuai filter

---

### UC-009: View Detail Produk
**Actor:** Any User  
**Precondition:** User sudah di halaman Marketplace  
**Main Flow:**
1. User klik produk di list
2. Sistem load detail produk dari API
3. Sistem tampilkan:
   - Foto carousel
   - Nama produk
   - Deskripsi lengkap
   - Harga
   - Kondisi
   - Lokasi
   - Seller info (nama, rating, avatar)
   - Tombol "Tawar" / "Chat Seller"
4. Jika user authenticated:
   - Tampilkan tombol "Tambah ke Wishlist"
   - Tampilkan chat history (jika ada)

**Postcondition:** User melihat detail produk secara lengkap

---

## 3. OFFER & NEGOTIATION

### UC-010: Buat Penawaran (Offer)
**Actor:** Authenticated User (Buyer)  
**Precondition:** User sudah login, melihat detail produk  
**Main Flow:**
1. Buyer klik tombol "Tawar" di halaman product detail
2. Sistem tampilkan form offer dengan:
   - Harga yang ditawarkan (pre-fill dengan harga produk)
   - Pesan penawaran (optional)
3. Buyer edit harga dan tulis pesan
4. Buyer submit form
5. Sistem validasi harga (harus lebih kecil dari harga jual)
6. Sistem simpan offer ke table `offers`
7. Sistem set status offer = "pending"
8. Sistem buat notification untuk seller

**Postcondition:** Offer berhasil dibuat, seller mendapat notifikasi

---

### UC-011: View Offers (Seller)
**Actor:** Authenticated User (Seller)  
**Precondition:** Seller sudah login, ada offer untuk produk seller  
**Main Flow:**
1. Seller buka Dashboard > Offers
2. Sistem load daftar offer untuk produk seller
3. Sistem tampilkan offer dengan:
   - Produk
   - Buyer info
   - Harga penawaran
   - Status (pending/rejected/accepted)
   - Waktu penawaran
4. Seller dapat filter by status

**Postcondition:** Seller melihat semua offer yang masuk

---

### UC-012: Terima/Tolak Penawaran
**Actor:** Authenticated User (Seller)  
**Precondition:** Seller melihat list offer  
**Main Flow:**
1. Seller klik offer yang ingin di-respond
2. Seller pilih "Terima" atau "Tolak"
3. Jika tolak:
   - Sistem tampilkan optional form untuk counter-offer harga
   - Seller bisa tulis alasan tolak
4. Sistem update status offer di database
5. Sistem buat notification untuk buyer
6. Sistem auto-create transaction jika offer diterima

**Postcondition:** Offer diterima/ditolak, transaction dibuat atau buyer diberitahu

---

## 4. TRANSACTION & PAYMENT

### UC-013: View Transactions
**Actor:** Authenticated User (Buyer atau Seller)  
**Precondition:** User sudah login, ada transaksi buyer/seller  
**Main Flow:**
1. User buka Dashboard > Transactions
2. Sistem load daftar transaksi user
3. Sistem tampilkan status transaksi:
   - Pending
   - Completed
   - Cancelled
4. User dapat filter by status
5. Sistem tampilkan detail:
   - Produk
   - Counterpart user info
   - Harga
   - Waktu transaksi
   - Lokasi meetup (jika ada)

**Postcondition:** User melihat semua transaksi mereka

---

### UC-014: Complete Transaction
**Actor:** Authenticated User (Buyer atau Seller)  
**Precondition:** Transaction dalam status "accepted" atau "pending"  
**Main Flow:**
1. Buyer dan Seller agree untuk meetup
2. Salah satu (atau keduanya) bisa mark transaksi as "completed"
3. Sistem update transaction status = "completed"
4. Sistem trigger notifikasi untuk sisi lain
5. Sistem activate review feature

**Postcondition:** Transaction marked as completed, review dapat dilakukan

---

## 5. REVIEW & RATING

### UC-015: Buat Review
**Actor:** Authenticated User (Buyer atau Seller)  
**Precondition:** User sudah complete transaction  
**Main Flow:**
1. User buka halaman transaction detail
2. User klik tombol "Buat Review"
3. Sistem tampilkan form review dengan:
   - Rating (1-5 stars)
   - Judul review
   - Deskripsi/komentar
   - Foto (optional)
4. User submit review
5. Sistem validasi input
6. Sistem simpan review ke table `reviews`
7. Sistem update average rating user:
   - `rating_average = SUM(rating) / COUNT(reviews)`
   - `rating_count = COUNT(reviews)`
8. Sistem buat notification untuk counterpart

**Postcondition:** Review berhasil dibuat, rating user terupdate

---

### UC-016: View Reviews
**Actor:** Any User  
**Precondition:** Ada review untuk user tertentu  
**Main Flow:**
1. User buka profile seller/buyer
2. Sistem load reviews dari table `reviews`
3. Sistem tampilkan:
   - Review list sorted by date
   - Rating
   - Judul
   - Deskripsi
   - Avatar reviewer
   - Rating average dan count di header

**Postcondition:** User melihat semua review untuk user tersebut

---

## 6. WISHLIST

### UC-017: Tambah ke Wishlist
**Actor:** Authenticated User (Buyer)  
**Precondition:** User sudah login, melihat product detail  
**Main Flow:**
1. User klik tombol "Tambah ke Wishlist" atau heart icon
2. Sistem simpan relasi user-product ke table `wishlist`
3. Sistem ubah icon heart menjadi filled
4. Sistem tampilkan notifikasi "Ditambahkan ke Wishlist"

**Postcondition:** Produk ditambahkan ke wishlist user

---

### UC-018: View Wishlist
**Actor:** Authenticated User (Buyer)  
**Precondition:** User sudah login  
**Main Flow:**
1. User buka Dashboard > Wishlist
2. Sistem load produk dari wishlist user
3. Sistem tampilkan grid/list produk wishlist
4. User dapat:
   - Klik produk untuk detail
   - Hapus dari wishlist
   - Sort/filter wishlist

**Postcondition:** User melihat semua wishlist mereka

---

### UC-019: Hapus dari Wishlist
**Actor:** Authenticated User  
**Precondition:** Ada produk di wishlist  
**Main Flow:**
1. User klik tombol hapus di wishlist item
2. Sistem tampilkan konfirmasi
3. User konfirmasi
4. Sistem delete relasi dari table `wishlist`
5. Sistem tampilkan notifikasi sukses

**Postcondition:** Produk dihapus dari wishlist

---

## 7. CHAT & MESSAGING

### UC-020: Buka Chat dengan User Lain
**Actor:** Authenticated User  
**Precondition:** User sudah login, melihat product atau user profile  
**Main Flow:**
1. User klik tombol "Chat" atau icon chat
2. Sistem check apakah conversation sudah exist
3. Jika tidak exist:
   - Sistem create conversation di table `chat` atau `conversations`
4. Sistem load chat history
5. Sistem tampilkan chat window dengan:
   - Nama user
   - Avatar
   - Message history
   - Input message box

**Postcondition:** Chat window dibuka

---

### UC-021: Kirim Pesan Chat
**Actor:** Authenticated User  
**Precondition:** Chat window sudah terbuka  
**Main Flow:**
1. User ketik pesan di input box
2. User klik tombol send atau press Enter
3. Sistem validasi pesan (tidak kosong)
4. Sistem simpan message ke database dengan:
   - Sender ID
   - Receiver ID
   - Message content
   - Timestamp
5. Sistem emit real-time update ke receiver (jika online)
6. Sistem tampilkan message di UI
7. Receiver dapat lihat message in real-time atau saat membuka chat

**Postcondition:** Message berhasil terkirim

---

### UC-022: View Chat List
**Actor:** Authenticated User  
**Precondition:** User sudah login  
**Main Flow:**
1. User buka Dashboard > Chat
2. Sistem load list conversation user
3. Sistem tampilkan:
   - Avatar user
   - Nama user
   - Last message preview
   - Timestamp
   - Unread badge (jika ada)
4. User dapat sort by recent atau search

**Postcondition:** User melihat list semua chat conversations

---

## 8. NOTIFICATIONS

### UC-023: View Notifications
**Actor:** Authenticated User  
**Precondition:** User sudah login, ada notification  
**Main Flow:**
1. User klik notification bell icon di navbar
2. Sistem load notification list:
   - Dari table `notifications`
   - Filter by user ID
   - Sorted by timestamp DESC
3. Sistem tampilkan notifikasi dengan:
   - Icon (based on type)
   - Message
   - Timestamp
   - Link/action
4. Notification dapat di-mark sebagai read
5. User dapat klik notification untuk navigate

**Postcondition:** User melihat notification list

---

### UC-024: Mark Notification as Read
**Actor:** Authenticated User  
**Precondition:** Ada unread notification  
**Main Flow:**
1. User buka notification panel
2. User klik notification atau tombol read
3. Sistem update `is_read = true` di database
4. Sistem remove badge dari notification

**Postcondition:** Notification marked as read

---

## 9. SELLER ANALYTICS

### UC-025: View Seller Analytics
**Actor:** Authenticated User (Seller)  
**Precondition:** User sudah login sebagai seller, ada transaction history  
**Main Flow:**
1. Seller buka Dashboard > Analytics
2. Sistem load analytics data:
   - Total products
   - Total completed transactions
   - Total revenue
   - Average rating
   - Product performance (popular products)
   - Time series chart (sales per period)
3. Sistem tampilkan dalam dashboard format
4. Seller dapat filter by date range

**Postcondition:** Seller melihat analytics lengkap

---

## 10. PROFILE MANAGEMENT

### UC-026: View/Edit Profile
**Actor:** Authenticated User  
**Precondition:** User sudah login  
**Main Flow:**
1. User buka Dashboard > Profile
2. Sistem load user data dari database
3. User dapat melihat/edit:
   - Nama lengkap
   - Email
   - Nomor telepon
   - Kampus
   - Fakultas
   - Program studi
   - Student ID
   - Bio
   - Avatar/Foto profil
4. User submit form
5. Sistem validasi input
6. Sistem update user record di database
7. Sistem tampilkan notifikasi sukses

**Postcondition:** Profile user berhasil diupdate

---

### UC-027: Upload Avatar
**Actor:** Authenticated User  
**Precondition:** User di halaman profile edit  
**Main Flow:**
1. User klik area upload avatar
2. User select file gambar dari device
3. Sistem validasi file (format, size)
4. Sistem upload ke folder `/uploads`
5. Sistem update `avatar_url` di database
6. Sistem tampilkan preview avatar baru
7. Sistem tampilkan notifikasi sukses

**Postcondition:** Avatar berhasil diupload

---

## 11. ADMIN FUNCTIONS

### UC-028: View Admin Dashboard
**Actor:** Authenticated Admin User  
**Precondition:** User sudah login dengan role = "admin"  
**Main Flow:**
1. Admin buka halaman `/admin`
2. Middleware `requireRole("admin")` verify role user
3. Sistem load admin dashboard dengan:
   - Total users
   - Total products
   - Total transactions
   - Total revenue
   - Reported items
   - Suspended users
   - Unverified sellers
4. Admin dapat navigate ke sub-sections

**Postcondition:** Admin melihat dashboard overview

---

### UC-029: Suspend/Ban User
**Actor:** Admin User  
**Precondition:** Admin sudah login  
**Main Flow:**
1. Admin masuk ke user management section
2. Admin cari atau filter user untuk di-suspend
3. Admin klik user
4. Admin klik tombol "Suspend"
5. Admin input alasan suspension (optional)
6. Sistem update `is_suspended = true` di database
7. Sistem trigger logout otomatis untuk user tersebut
8. Sistem kirim notifikasi ke user
9. User tidak bisa login sampai admin lifts suspension

**Postcondition:** User suspended, tidak bisa access aplikasi

---

### UC-030: Review & Moderate Reported Content
**Actor:** Admin User  
**Precondition:** Ada reported products atau users  
**Main Flow:**
1. Admin buka Reports section
2. Sistem load daftar report dari table `reports`
3. Sistem tampilkan:
   - Reported item (product/user)
   - Reason
   - Reporter info
   - Status (open/resolved)
4. Admin klik report untuk detail
5. Admin dapat:
   - Reject report
   - Approve report (dan take action)
   - Suspend related user
   - Delete reported product
6. Sistem update report status = "resolved"
7. Sistem create admin log/audit trail

**Postcondition:** Report di-resolve dan action diambil

---

## 12. REPORTING SYSTEM

### UC-031: Report Produk/User
**Actor:** Authenticated User  
**Precondition:** User sudah login  
**Main Flow:**
1. User di halaman product detail atau user profile
2. User klik menu "Report" atau "Laporkan"
3. Sistem tampilkan form report dengan:
   - Kategori (fraud, inappropriate, damage, dll)
   - Deskripsi detail
   - Attachment (optional)
4. User submit form
5. Sistem validasi input
6. Sistem simpan report ke table `reports`
7. Sistem set status = "open"
8. Sistem notify admin tentang report baru

**Postcondition:** Report berhasil dibuat, admin diberitahu

---

## 13. PRICING & COMMISSION

### UC-032: View Pricing Information
**Actor:** Any User  
**Precondition:** User di halaman marketplace atau profile  
**Main Flow:**
1. User cari informasi harga/komisi
2. User buka halaman Pricing (jika ada)
3. Sistem load pricing info dari API `/api/pricing`
4. Sistem tampilkan:
   - Commission rate
   - Fee structure
   - Payment terms
   - Example calculation

**Postcondition:** User melihat pricing information

---

## Summary Table

| UC ID | Aktor | Deskripsi | Status |
|-------|-------|-----------|--------|
| UC-001 | Guest | Register | Core |
| UC-002 | Guest | Login | Core |
| UC-003 | User | Verifikasi Email | Core |
| UC-004 | User | Auto Logout | Core |
| UC-005 | Seller | List Produk | Core |
| UC-006 | Seller | Edit Produk | Core |
| UC-007 | Seller | Hapus Produk | Core |
| UC-008 | Any | View Marketplace | Core |
| UC-009 | Any | View Product Detail | Core |
| UC-010 | Buyer | Buat Offer | Core |
| UC-011 | Seller | View Offers | Core |
| UC-012 | Seller | Accept/Reject Offer | Core |
| UC-013 | User | View Transactions | Core |
| UC-014 | User | Complete Transaction | Core |
| UC-015 | User | Buat Review | Core |
| UC-016 | Any | View Reviews | Core |
| UC-017 | Buyer | Tambah Wishlist | Feature |
| UC-018 | Buyer | View Wishlist | Feature |
| UC-019 | Buyer | Hapus Wishlist | Feature |
| UC-020 | User | Buka Chat | Feature |
| UC-021 | User | Kirim Pesan | Feature |
| UC-022 | User | View Chat List | Feature |
| UC-023 | User | View Notifications | Feature |
| UC-024 | User | Mark Notification Read | Feature |
| UC-025 | Seller | View Analytics | Feature |
| UC-026 | User | View/Edit Profile | Core |
| UC-027 | User | Upload Avatar | Feature |
| UC-028 | Admin | Admin Dashboard | Core |
| UC-029 | Admin | Suspend User | Core |
| UC-030 | Admin | Moderate Reports | Core |
| UC-031 | User | Report Content | Feature |
| UC-032 | Any | View Pricing | Info |


# BabePus - Diagram Documentation

Dokumen ini berisi semua diagram untuk aplikasi Babepus marketplace. Gunakan tools Mermaid online untuk memvisualisasikan.

---

## 1. MAIN USE CASE DIAGRAM

**Tool:** [Mermaid Live Editor](https://mermaid.live)  
**Copy-paste kode di bawah ke Mermaid Live Editor:**

```mermaid
graph TB
    subgraph Actors["Aktor"]
        Guest["👤 Guest"]
        User["👤 User/Buyer"]
        Seller["👤 Seller"]
        Admin["👤 Admin"]
    end

    subgraph Auth["Authentication & Profile"]
        UC1["UC-001: Register"]
        UC2["UC-002: Login"]
        UC3["UC-003: Verify Email"]
        UC4["UC-004: Auto Logout"]
        UC26["UC-026: Edit Profile"]
        UC27["UC-027: Upload Avatar"]
    end

    subgraph Products["Product Management"]
        UC5["UC-005: List Product"]
        UC6["UC-006: Edit Product"]
        UC7["UC-007: Delete Product"]
        UC8["UC-008: Browse Marketplace"]
        UC9["UC-009: View Product Detail"]
    end

    subgraph Offers["Offer & Negotiation"]
        UC10["UC-010: Make Offer"]
        UC11["UC-011: View Offers"]
        UC12["UC-012: Accept/Reject Offer"]
    end

    subgraph Transactions["Transactions"]
        UC13["UC-013: View Transactions"]
        UC14["UC-014: Complete Transaction"]
        UC15["UC-015: Make Review"]
        UC16["UC-016: View Reviews"]
    end

    subgraph Wishlist["Wishlist"]
        UC17["UC-017: Add to Wishlist"]
        UC18["UC-018: View Wishlist"]
        UC19["UC-019: Remove from Wishlist"]
    end

    subgraph Chat["Chat & Messaging"]
        UC20["UC-020: Open Chat"]
        UC21["UC-021: Send Message"]
        UC22["UC-022: View Chat List"]
    end

    subgraph Notifications["Notifications"]
        UC23["UC-023: View Notifications"]
        UC24["UC-024: Mark as Read"]
    end

    subgraph Analytics["Analytics"]
        UC25["UC-025: View Analytics"]
    end

    subgraph AdminFunctions["Admin"]
        UC28["UC-028: Admin Dashboard"]
        UC29["UC-029: Suspend User"]
        UC30["UC-030: Moderate Reports"]
        UC31["UC-031: Report Content"]
        UC32["UC-032: View Pricing"]
    end

    Guest --> UC1
    Guest --> UC2
    Guest --> UC8
    
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC26
    User --> UC27
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC13
    User --> UC14
    User --> UC15
    User --> UC16
    User --> UC17
    User --> UC18
    User --> UC19
    User --> UC20
    User --> UC21
    User --> UC22
    User --> UC23
    User --> UC24
    User --> UC31
    
    Seller --> UC5
    Seller --> UC6
    Seller --> UC7
    Seller --> UC11
    Seller --> UC12
    Seller --> UC25
    
    Admin --> UC28
    Admin --> UC29
    Admin --> UC30

style Auth fill:#e1f5ff
style Products fill:#f3e5f5
style Offers fill:#fff3e0
style Transactions fill:#e8f5e9
style Wishlist fill:#fce4ec
style Chat fill:#f1f8e9
style Notifications fill:#e0f2f1
style Analytics fill:#ede7f6
style AdminFunctions fill:#ffebee
```

---

## 2. PRODUCT PURCHASE FLOW (Sequence Diagram)

**Menunjukkan:** Alur dari browse produk hingga review  
**Interaksi:** Buyer → Client → API → Database → Seller

```mermaid
sequenceDiagram
    participant Buyer as 👤 Buyer
    participant Client as 🖥️ Client<br/>React
    participant API as 🔌 API<br/>Express
    participant DB as 💾 Database
    participant Seller as 👤 Seller

    Buyer->>Client: 1. Browse Marketplace
    Client->>API: GET /api/products
    API->>DB: Query products
    DB-->>API: Product list
    API-->>Client: Return products
    Client-->>Buyer: Display products

    Buyer->>Client: 2. Click Product Detail
    Client->>API: GET /api/products/:id
    API->>DB: Query product detail
    DB-->>API: Product data + seller info
    API-->>Client: Return product detail
    Client-->>Buyer: Display product detail

    Buyer->>Client: 3. Click "Tawar" (Make Offer)
    Client->>API: POST /api/offers<br/>{productId, offeredPrice, message}
    API->>DB: Create offer record
    DB-->>API: Offer created
    API->>DB: Create notification for seller
    DB-->>API: Notification created
    API-->>Client: Offer success
    Client-->>Buyer: Show success message

    Seller->>Client: 4. View Offers
    Client->>API: GET /api/offers
    API->>DB: Query seller's offers
    DB-->>API: Offers list
    API-->>Client: Return offers
    Client-->>Seller: Display offers

    Seller->>Client: 5. Accept Offer
    Client->>API: PUT /api/offers/:id<br/>{status: 'accepted'}
    API->>DB: Update offer status
    DB-->>API: Offer updated
    API->>DB: Create transaction
    DB-->>API: Transaction created
    API->>DB: Create notification for buyer
    DB-->>API: Notification created
    API-->>Client: Accept success
    Client-->>Seller: Show success

    Buyer->>Client: 6. View Transactions
    Client->>API: GET /api/transactions
    API->>DB: Query buyer's transactions
    DB-->>API: Transactions
    API-->>Client: Return transactions
    Client-->>Buyer: Display transactions

    Buyer->>Client: 7. Mark Complete
    Client->>API: PUT /api/transactions/:id<br/>{status: 'completed'}
    API->>DB: Update transaction
    DB-->>API: Transaction updated
    API-->>Client: Complete success
    Client-->>Buyer: Enable review feature

    Buyer->>Client: 8. Leave Review
    Client->>API: POST /api/reviews<br/>{sellerId, rating, comment}
    API->>DB: Create review
    API->>DB: Update seller rating_average
    DB-->>API: Review created
    API->>DB: Create notification
    DB-->>API: Notification created
    API-->>Client: Review success
    Client-->>Buyer: Show review confirmation
```

---

## 3. TRANSACTION STATE MACHINE

**Menunjukkan:** Semua state transaksi dan transisi yang valid

```mermaid
stateDiagram-v2
    [*] --> Pending: Offer Created
    
    Pending --> Accepted: Seller Accept
    Pending --> Rejected: Seller Reject
    Pending --> Cancelled: Buyer Cancel
    
    Accepted --> InProgress: Meeting Agreed
    
    InProgress --> Completed: Both Mark Complete
    InProgress --> Dispute: Dispute Raised
    
    Dispute --> CompletedByAdmin: Admin Resolve
    Dispute --> Cancelled
    
    Completed --> [*]
    Cancelled --> [*]
    Rejected --> [*]
    CompletedByAdmin --> [*]
    
    note right of Pending
        Waiting for seller response
        Buyer can cancel
    end note
    
    note right of Accepted
        Transaction confirmed
        Buyer & Seller ready to meet
    end note
    
    note right of InProgress
        Both parties meeting
        Product exchanged
    end note
    
    note right of Completed
        Both parties marked complete
        Review feature enabled
    end note
    
    note right of Dispute
        Disagreement about transaction
        Admin intervention needed
    end note
```

---

## 4. AUTHENTICATION FLOW DIAGRAM

**Menunjukkan:** Detail proses login, token handling, dan auto-logout

```mermaid
graph TD
    A["User Visits App<br/>/"] --> B{User<br/>Authenticated?}
    
    B -->|No| C["Show Login Page"]
    C --> D["User Enter Email<br/>& Password"]
    D --> E["Send POST<br/>/api/auth/login"]
    E --> F{Valid<br/>Credentials?}
    F -->|Yes| G["Generate JWT Token"]
    F -->|No| H["Show Error"]
    H --> D
    
    G --> I["Save Token<br/>to localStorage"]
    I --> J["Set User State<br/>in AuthContext"]
    
    B -->|Yes| K["Check if Email<br/>Verified"]
    K -->|Not Verified| L["Prompt Email<br/>Verification"]
    L --> M["User Verify Email"]
    M --> N["Redirect to<br/>Dashboard"]
    
    K -->|Verified| N
    
    J --> N
    
    N --> O["User Browse<br/>App"]
    O --> P["Make API Request<br/>with Bearer Token"]
    
    P --> Q{Token<br/>Valid?}
    Q -->|Yes| R["Request Success"]
    Q -->|No| S["Return 401"]
    
    S --> T["Axios Interceptor<br/>Detect 401"]
    T --> U["Call<br/>unauthorizedHandler"]
    U --> V["Clear Token<br/>from localStorage"]
    V --> W["Clear User State"]
    W --> X["Auto Redirect<br/>to Login"]
    
    X --> C
    
    style A fill:#e3f2fd
    style C fill:#fff3e0
    style E fill:#f3e5f5
    style G fill:#e8f5e9
    style I fill:#e8f5e9
    style N fill:#c8e6c9
    style P fill:#f3e5f5
    style S fill:#ffcdd2
    style T fill:#ffcdd2
    style X fill:#fff3e0
```

---

## 5. SYSTEM ARCHITECTURE DIAGRAM

**Menunjukkan:** Layer-based architecture (Client → API → Server → Database)

```mermaid
graph TB
    subgraph Client["🖥️ CLIENT LAYER (React)"]
        Pages["Pages<br/>- LoginPage<br/>- MarketplacePage<br/>- ProductDetailPage<br/>- DashboardPages"]
        Components["Components<br/>- Auth/ProtectedRoute<br/>- Navbar<br/>- ProductCard<br/>- ChatWindow"]
        Contexts["Context API<br/>- AuthContext<br/>- ThemeContext<br/>- ToastContext"]
        Hooks["Custom Hooks<br/>- useAuth<br/>- useTheme<br/>- useDebounce<br/>- useToast"]
        Services["Services<br/>- authService<br/>- productService<br/>- offerService<br/>- chatService"]
        Utils["Utils<br/>- cn<br/>- currency<br/>- date<br/>- storage"]
    end

    subgraph APILayer["🔌 API CLIENT (Axios)"]
        APIClient["API Client<br/>- baseURL config<br/>- Request interceptor<br/>- Response interceptor<br/>- 401 handler"]
    end

    subgraph Server["🖥️ SERVER LAYER (Express)"]
        Middleware["Middlewares<br/>- authMiddleware<br/>- requireRole<br/>- errorHandler<br/>- uploadMiddleware"]
        Routes["Routes<br/>- /auth<br/>- /products<br/>- /offers<br/>- /transactions<br/>- /reviews<br/>- /chat<br/>- /admin"]
        Controllers["Controllers<br/>- authController<br/>- productController<br/>- offerController<br/>- transactionController<br/>- reviewController<br/>- chatController"]
        Services_Server["Services<br/>- authService<br/>- productService<br/>- offerService<br/>- notificationService<br/>- chatService"]
    end

    subgraph Database["💾 DATA LAYER (MySQL)"]
        Tables["Tables<br/>- users<br/>- products<br/>- offers<br/>- transactions<br/>- reviews<br/>- chat_messages<br/>- notifications<br/>- wishlist<br/>- reports"]
    end

    subgraph External["🌐 EXTERNAL"]
        Uploads["File Storage<br/>/uploads"]
        Email["Email Service<br/>Verification<br/>Notifications"]
    end

    Pages --> Components
    Pages --> Contexts
    Pages --> Hooks
    Components --> Contexts
    Hooks --> Services
    Services --> APIClient
    
    APIClient --> APILayer
    APILayer --> Routes
    
    Routes --> Middleware
    Routes --> Controllers
    
    Middleware --> Services_Server
    Controllers --> Services_Server
    
    Services_Server --> Database
    Services_Server --> Uploads
    Services_Server --> Email
    
    Controllers --> Tables
    Middleware --> Tables

    style Client fill:#e3f2fd
    style APILayer fill:#f3e5f5
    style Server fill:#fff3e0
    style Database fill:#e8f5e9
    style External fill:#fce4ec
```

---

## 6. DETAILED OFFER & NEGOTIATION FLOW

**Menunjukkan:** 13 tahapan proses tawar-menawar dengan detail API calls

```mermaid
graph LR
    Buyer["👤 Buyer"] -->|1. Browse & Select| Marketplace["Marketplace"]
    Marketplace -->|2. View Detail| ProdDetail["Product Detail<br/>Product A - Rp 500K"]
    
    ProdDetail -->|3. Click 'Tawar'| OfferForm["Offer Form"]
    OfferForm -->|4. Input Price<br/>& Message| OfferInput["Harga: Rp 400K<br/>Message: Nego?"]
    OfferInput -->|5. Submit| BuyerAPI["POST /api/offers"]
    
    BuyerAPI -->|Create Offer| DB1["DB: offers table<br/>status=pending"]
    DB1 -->|Notification| DB2["DB: notifications"]
    
    DB1 -->|6. Notify| SellerNotif["🔔 Notification"]
    SellerNotif -->|7. Click| Seller["👤 Seller"]
    
    Seller -->|8. View Offers| OfferList["Dashboard > Offers"]
    OfferList -->|9. See Pending| OfferDetail["Offer Detail<br/>Buyer: User123<br/>Price: Rp 400K<br/>Status: Pending"]
    
    OfferDetail -->|10a. Accept| AcceptAPI["PUT /api/offers<br/>status=accepted"]
    OfferDetail -->|10b. Reject| RejectAPI["PUT /api/offers<br/>status=rejected"]
    OfferDetail -->|10c. Counter| CounterAPI["PUT /api/offers<br/>counter_price=450K"]
    
    AcceptAPI -->|Update DB| DB3["DB: offers table<br/>status=accepted"]
    RejectAPI -->|Update DB| DB4["DB: offers table<br/>status=rejected"]
    CounterAPI -->|Update DB| DB5["DB: offers table<br/>status=countered<br/>counter_price=450K"]
    
    DB3 -->|Create Transaction| TransDB["DB: transactions<br/>status=accepted"]
    DB3 -->|Notify Buyer| BuyerNotif2["🔔 Offer Accepted!"]
    
    DB4 -->|Notify Buyer| BuyerNotif3["🔔 Offer Rejected"]
    
    DB5 -->|Notify Buyer| BuyerNotif4["🔔 Counter Offer<br/>Rp 450K"]
    BuyerNotif4 -->|11. Buyer Respond| OfferForm2["Accept/Reject<br/>Counter Offer"]
    OfferForm2 -->|Back to Accept/Reject| AcceptAPI
    
    BuyerNotif2 -->|12. Both Confirm| Meeting["Agree to Meet"]
    Meeting -->|13. Mark Complete| CompleteAPI["PUT /api/transactions<br/>status=completed"]
    CompleteAPI -->|Update DB| TransDB2["DB: transactions<br/>status=completed"]
    TransDB2 -->|Enable Review| ReviewFeature["Review Feature<br/>Available"]
    
    style Buyer fill:#bbdefb
    style Seller fill:#bbdefb
    style Marketplace fill:#c8e6c9
    style ProdDetail fill:#c8e6c9
    style OfferForm fill:#fff9c4
    style OfferList fill:#fff9c4
    style BuyerAPI fill:#ffe0b2
    style AcceptAPI fill:#ffe0b2
    style RejectAPI fill:#ffe0b2
    style CounterAPI fill:#ffe0b2
    style DB1 fill:#e1f5fe
    style DB2 fill:#e1f5fe
    style TransDB fill:#e1f5fe
    style TransDB2 fill:#e1f5fe
    style BuyerNotif2 fill:#f8bbd0
    style BuyerNotif3 fill:#f8bbd0
    style BuyerNotif4 fill:#f8bbd0
    style SellerNotif fill:#f8bbd0
    style ReviewFeature fill:#c8e6c9
```

---

## 📋 Cara Menggunakan Diagram Ini

### Option 1: Mermaid Live Editor (Online)
1. Buka [https://mermaid.live](https://mermaid.live)
2. Copy-paste kode mermaid dari section di atas
3. Klik "Render" untuk visualisasi
4. Download sebagai SVG atau PNG

### Option 2: VS Code Plugin
1. Install extension: "Markdown Preview Mermaid Support"
2. Buka file markdown ini
3. Tekan Ctrl+Shift+V untuk preview
4. Diagram akan otomatis di-render

### Option 3: GitHub
1. Push file ini ke GitHub repository
2. Diagram akan otomatis di-render di GitHub preview

### Option 4: Notion/Confluence
1. Copy diagram dari Mermaid Live sebagai image
2. Paste ke Notion/Confluence docs

---

## 📝 Ringkasan Diagram

| No | Diagram | Gunanya |
|----|---------|---------|
| 1 | Main Use Case | Overview semua 32 use case & relasi dengan aktor |
| 2 | Purchase Flow | Sequence lengkap browse → tawar → transaksi → review |
| 3 | Transaction State | Semua state transaksi dan transisi yang valid |
| 4 | Auth Flow | Detail login, token, interceptor, auto-logout |
| 5 | Architecture | Layer-based system: Client → API → Server → DB |
| 6 | Offer Flow | Detail 13 tahapan proses tawar-menawar |

---

**Last Updated:** April 24, 2026  
**File:** DIAGRAMS.md (persisten di workspace)
# Use Case Testing - BabePus

Use Case Testing fokus pada testing alur/flow dari aplikasi berdasarkan use case yang sudah didefinisikan. Setiap test case mencakup happy path, alternative path, dan exception handling.

---

## UC-001: Register Pengguna Baru

### Happy Path (Normal Flow)

**Test Case ID:** UTC-001-001  
**Title:** Successful User Registration  
**Precondition:** User belum terdaftar, di halaman Register

**Steps:**
```
1. User membuka halaman Register
2. User mengisi form dengan data valid:
   - Email: student@campus.ac.id
   - Password: SecurePass123!
   - Confirm Password: SecurePass123!
   - Nama Lengkap: Ahmad Rizki
   - Nomor Telepon: 08123456789
   - Kampus: Universitas ABC
   - Fakultas: FMIPA
   - Program Studi: Teknik Informatika
   - Student ID: 20220001
3. User klik tombol "Register"
4. Sistem validasi input
5. Sistem hash password
6. Sistem simpan user ke database
7. Sistem buat email verification token
8. Sistem kirim email verifikasi
```

**Expected Result:**
- User berhasil terdaftar
- Email verifikasi dikirim
- User diarahkan ke halaman "Check Your Email"
- Status code: 201 Created

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Alternative Path: Email Already Exists

**Test Case ID:** UTC-001-002  
**Title:** Registration with Duplicate Email  
**Precondition:** Email sudah terdaftar sebelumnya

**Steps:**
```
1. User membuka halaman Register
2. User mengisi form dengan:
   - Email: existing@campus.ac.id (sudah ada di DB)
   - Password dan data lainnya valid
3. User klik tombol "Register"
4. Sistem validasi email di database
```

**Expected Result:**
- Tampilkan error: "Email sudah terdaftar"
- Form tidak di-submit
- User tetap di halaman Register
- User dapat menggunakan email lain atau login

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Exception Path: Invalid Password

**Test Case ID:** UTC-001-003  
**Title:** Registration with Invalid Password  
**Precondition:** -

**Steps:**
```
1. User membuka halaman Register
2. User mengisi form dengan password: "weak"
3. User klik tombol "Register"
4. Sistem validasi password
```

**Expected Result:**
- Tampilkan error: "Password harus minimum 8 karakter, mengandung huruf besar, angka, dan karakter khusus"
- Form tidak di-submit
- User dapat memperbaiki password

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

## UC-002: Login Pengguna

### Happy Path (Normal Flow)

**Test Case ID:** UTC-002-001  
**Title:** Successful User Login  
**Precondition:** User sudah terdaftar dan email terverifikasi

**Steps:**
```
1. User membuka halaman Login
2. User mengisi:
   - Email: user@campus.ac.id
   - Password: SecurePass123!
3. User klik tombol "Login"
4. Sistem validasi email di database
5. Sistem bandingkan password dengan hashed password
6. Sistem generate JWT token
7. Sistem simpan token ke localStorage
8. Sistem set user state di AuthContext
```

**Expected Result:**
- Login berhasil
- JWT token tersimpan di localStorage
- User diarahkan ke halaman Dashboard/Marketplace
- Navbar menampilkan nama user dan logout button
- Status code: 200 OK

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Exception Path: Wrong Password

**Test Case ID:** UTC-002-002  
**Title:** Login with Wrong Password  
**Precondition:** User terdaftar

**Steps:**
```
1. User membuka halaman Login
2. User mengisi:
   - Email: user@campus.ac.id
   - Password: WrongPassword123!
3. User klik tombol "Login"
4. Sistem bandingkan password
```

**Expected Result:**
- Tampilkan error: "Email atau password salah"
- Login gagal, token tidak dibuat
- User tetap di halaman Login
- Status code: 401 Unauthorized
- Tampilkan counter attempt (1 of 5)

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Exception Path: Account Suspended

**Test Case ID:** UTC-002-003  
**Title:** Login with Suspended Account  
**Precondition:** User terdaftar tapi is_suspended = true

**Steps:**
```
1. User membuka halaman Login
2. User mengisi email & password dengan benar
3. User klik tombol "Login"
4. Sistem validasi di database, find user dengan is_suspended = true
```

**Expected Result:**
- Tampilkan error: "Akun Anda telah disuspend oleh admin"
- Login ditolak
- User tidak dapat akses aplikasi
- Status code: 403 Forbidden

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

## UC-005: List Produk Baru

### Happy Path (Normal Flow)

**Test Case ID:** UTC-005-001  
**Title:** Successfully List New Product  
**Precondition:** User sudah login sebagai seller, di halaman Dashboard

**Steps:**
```
1. Seller membuka Dashboard > "Tambah Produk"
2. Seller mengisi form:
   - Nama Produk: Laptop ASUS ROG Gaming
   - Deskripsi: "Laptop bekas, kondisi mulus, 2 tahun pemakaian"
   - Kategori: Elektronik
   - Harga: Rp 3,500,000
   - Kondisi: Bekas
   - Foto: (upload 3 gambar)
   - Lokasi: Jakarta
3. Seller klik tombol "List Produk"
4. Sistem validasi input
5. Sistem upload foto ke /uploads
6. Sistem simpan data produk ke database
7. Sistem set status = "active"
```

**Expected Result:**
- Produk berhasil di-list
- Tampilkan success message: "Produk berhasil dipublikasikan"
- Produk muncul di marketplace
- Produk bisa dilihat buyer
- Status code: 201 Created

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Exception Path: Invalid Price

**Test Case ID:** UTC-005-002  
**Title:** List Product with Invalid Price  
**Precondition:** -

**Steps:**
```
1. Seller membuka form tambah produk
2. Seller mengisi form dengan Harga: Rp 5,000 (< Rp 10,000 minimum)
3. Seller klik tombol "List Produk"
4. Sistem validasi harga
```

**Expected Result:**
- Tampilkan error: "Harga minimum Rp 10.000"
- Form tidak di-submit
- Seller dapat memperbaiki harga

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Exception Path: Upload Photo Failed

**Test Case ID:** UTC-005-003  
**Title:** List Product with Failed Photo Upload  
**Precondition:** -

**Steps:**
```
1. Seller membuka form tambah produk
2. Seller mengisi form lengkap
3. Seller upload foto dengan ukuran > 5MB
4. Seller klik tombol "List Produk"
5. Sistem validasi foto (format, size)
```

**Expected Result:**
- Tampilkan error: "Ukuran foto maksimal 5MB"
- Form tidak di-submit
- Seller dapat upload foto lain

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

## UC-010: Buat Penawaran (Offer)

### Happy Path (Normal Flow)

**Test Case ID:** UTC-010-001  
**Title:** Successfully Make Offer  
**Precondition:** Buyer sudah login, melihat product detail

**Steps:**
```
1. Buyer membuka halaman Product Detail
   - Produk: Laptop ASUS (Harga: Rp 3,500,000)
2. Buyer klik tombol "Tawar"
3. Sistem tampilkan form offer dengan pre-fill harga produk
4. Buyer ubah harga menjadi: Rp 3,200,000
5. Buyer tulis pesan: "Bisa nego lebih? Barangnya masih bagus?"
6. Buyer klik tombol "Kirim Penawaran"
7. Sistem validasi harga < original price
8. Sistem simpan offer ke database dengan status = "pending"
9. Sistem buat notification untuk seller
```

**Expected Result:**
- Offer berhasil dibuat
- Tampilkan success message: "Penawaran berhasil dikirim"
- Seller mendapat notifikasi baru
- Buyer dapat lihat offer di Dashboard > Offers
- Status code: 201 Created

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Exception Path: Offered Price >= Original Price

**Test Case ID:** UTC-010-002  
**Title:** Make Offer with Price >= Original  
**Precondition:** -

**Steps:**
```
1. Buyer membuka Product Detail (Original: Rp 3,500,000)
2. Buyer klik tombol "Tawar"
3. Buyer mengubah harga menjadi: Rp 3,500,000 (sama dengan original)
4. Buyer klik tombol "Kirim Penawaran"
5. Sistem validasi
```

**Expected Result:**
- Tampilkan error: "Harga penawaran harus lebih rendah dari harga jual"
- Offer tidak dibuat
- Buyer dapat mengubah harga

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Exception Path: Duplicate Offer (Same Buyer)

**Test Case ID:** UTC-010-003  
**Title:** Make Duplicate Offer for Same Product  
**Precondition:** Buyer sudah pernah membuat offer untuk produk ini dengan status pending

**Steps:**
```
1. Buyer membuat offer untuk produk X (status: pending)
2. Buyer coba membuat offer baru untuk produk X yang sama
3. Sistem cek apakah buyer sudah punya pending offer
```

**Expected Result:**
- Tampilkan warning: "Anda sudah memiliki penawaran pending untuk produk ini"
- Offer baru tidak dibuat (atau replace yang lama)
- Buyer disarankan untuk menunggu atau mengubah offer yang ada

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

## UC-012: Terima/Tolak Penawaran (Seller)

### Happy Path: Accept Offer

**Test Case ID:** UTC-012-001  
**Title:** Successfully Accept Offer  
**Precondition:** Seller melihat pending offer di Dashboard

**Steps:**
```
1. Seller membuka Dashboard > Offers
2. Seller melihat offer pending dari Buyer:
   - Produk: Laptop ASUS
   - Buyer: Ahmad Rizki
   - Harga: Rp 3,200,000 (dari Rp 3,500,000)
   - Status: Pending
3. Seller klik tombol "Terima"
4. Sistem update status offer = "accepted"
5. Sistem auto-create transaction record
6. Sistem buat notification untuk buyer
```

**Expected Result:**
- Offer diterima
- Status berubah menjadi "accepted"
- Transaction dibuat dengan status = "accepted"
- Buyer mendapat notifikasi: "Penawaran Anda diterima!"
- Buyer & Seller dapat melihat transaction di Dashboard
- Status code: 200 OK

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Alternative Path: Reject Offer

**Test Case ID:** UTC-012-002  
**Title:** Reject Offer with Reason  
**Precondition:** -

**Steps:**
```
1. Seller membuka Dashboard > Offers
2. Seller klik tombol "Tolak" untuk offer tertentu
3. Sistem tampilkan form reject dengan optional alasan
4. Seller tulis alasan: "Harga terlalu rendah, silakan tawar lebih tinggi"
5. Seller klik tombol "Tolak Penawaran"
6. Sistem update status offer = "rejected"
7. Sistem buat notification untuk buyer dengan alasan
```

**Expected Result:**
- Offer ditolak
- Status berubah menjadi "rejected"
- Buyer mendapat notifikasi dengan alasan
- Buyer dapat membuat offer baru dengan harga berbeda
- Status code: 200 OK

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Alternative Path: Counter Offer

**Test Case ID:** UTC-012-003  
**Title:** Send Counter Offer to Buyer  
**Precondition:** -

**Steps:**
```
1. Seller membuka Dashboard > Offers
2. Seller klik tombol "Counter" untuk offer tertentu
3. Sistem tampilkan form counter dengan input harga
4. Seller ubah harga menjadi: Rp 3,350,000
5. Seller klik tombol "Kirim Counter Offer"
6. Sistem update status offer = "countered"
7. Sistem simpan counter_price = 3,350,000
8. Sistem buat notification untuk buyer
```

**Expected Result:**
- Counter offer dikirim
- Status berubah menjadi "countered"
- Buyer mendapat notifikasi dengan counter price
- Buyer dapat accept/reject counter offer
- Status code: 200 OK

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

## UC-014: Complete Transaction

### Happy Path (Normal Flow)

**Test Case ID:** UTC-014-001  
**Title:** Successfully Complete Transaction  
**Precondition:** Transaction dalam status "accepted", buyer & seller sudah agree meeting

**Steps:**
```
1. Buyer membuka Dashboard > Transactions
2. Buyer melihat transaction dengan status "accepted"
3. Buyer telah bertemu seller dan produk sudah ditukar
4. Buyer klik tombol "Mark Complete"
5. Sistem tampilkan confirmation dialog
6. Buyer confirm "Produk sudah diterima"
7. Sistem update transaction status = "completed"
8. Sistem buat notification untuk seller
9. Sistem enable review feature untuk buyer & seller
```

**Expected Result:**
- Transaction marked complete
- Status berubah menjadi "completed"
- Review button menjadi available
- Seller & Buyer dapat saling memberi review
- Status code: 200 OK

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Exception Path: Dispute

**Test Case ID:** UTC-014-002  
**Title:** Dispute During Transaction  
**Precondition:** Transaction dalam status "accepted"

**Steps:**
```
1. Buyer atau Seller merasa ada masalah dengan transaksi
2. User membuka Dashboard > Transactions
3. User klik tombol "Ajukan Dispute"
4. Sistem tampilkan form dispute dengan:
   - Kategori masalah (produk rusak, tidak sesuai, dll)
   - Deskripsi
   - Bukti foto (optional)
5. User submit dispute
6. Sistem update transaction status = "disputed"
7. Sistem notify admin
```

**Expected Result:**
- Dispute dibuat
- Transaction status berubah menjadi "disputed"
- Admin mendapat notifikasi untuk review
- Admin dapat investigate dan resolve
- Status code: 201 Created

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

## UC-015: Buat Review

### Happy Path (Normal Flow)

**Test Case ID:** UTC-015-001  
**Title:** Successfully Leave Review  
**Precondition:** Transaction completed, review feature enabled

**Steps:**
```
1. Buyer membuka Dashboard > Transactions
2. Buyer melihat completed transaction
3. Buyer klik tombol "Beri Review"
4. Sistem tampilkan form review dengan:
   - Rating: (star selector)
   - Judul: (text field)
   - Komentar: (textarea)
   - Foto: (upload optional)
5. Buyer mengisi:
   - Rating: 5 stars
   - Judul: "Seller Sangat Responsif"
   - Komentar: "Barang sesuai deskripsi, seller sangat helpful, packing rapi"
   - Foto: (upload 2 foto)
6. Buyer klik tombol "Submit Review"
7. Sistem validasi input
8. Sistem simpan review ke database
9. Sistem update seller's rating_average dan rating_count
10. Sistem buat notification untuk seller
```

**Expected Result:**
- Review berhasil dibuat
- Tampilkan success message: "Review berhasil dipublikasikan"
- Seller melihat review di profile
- Seller rating terupdate
- Review visible di marketplace (untuk seller yang direview)
- Status code: 201 Created

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Exception Path: Comment Too Short

**Test Case ID:** UTC-015-002  
**Title:** Review with Invalid Comment Length  
**Precondition:** -

**Steps:**
```
1. Buyer membuka form review
2. Buyer mengisi:
   - Rating: 4 stars
   - Judul: "Good"
   - Komentar: "Nice" (5 characters, < 10 minimum)
3. Buyer klik tombol "Submit Review"
4. Sistem validasi panjang komentar
```

**Expected Result:**
- Tampilkan error: "Komentar minimal 10 karakter"
- Form tidak di-submit
- Buyer dapat memperbaiki komentar

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

## UC-020: Buka Chat dengan User Lain

### Happy Path (Normal Flow)

**Test Case ID:** UTC-020-001  
**Title:** Successfully Open Chat  
**Precondition:** User sudah login, melihat product atau user profile

**Steps:**
```
1. Buyer membuka Product Detail
2. Buyer klik tombol "Chat Seller"
3. Sistem check apakah conversation sudah exist
4. Jika belum exist:
   - Sistem create conversation record di database
   - Sistem simpan buyer_id, seller_id, created_at
5. Sistem load chat history (jika ada)
6. Sistem tampilkan chat window dengan:
   - Nama seller
   - Avatar seller
   - Status (online/offline)
   - Message history
   - Input message box
```

**Expected Result:**
- Chat window berhasil dibuka
- Conversation tercipta atau loaded dari database
- Chat history ditampilkan (jika ada)
- User dapat ketik dan kirim pesan
- Status code: 200 OK

**Actual Result:** _______________  
**Status:** PASS/FAIL

---

### Exception Path: Block User

**Test Case ID:** UTC-020-002  
**Title:** Open Chat with Blocked User  
**Precondition:** Seller sudah memblock buyer ini sebelumnya

**Steps:**
```
1. Buyer mencoba membuka chat dengan seller
2. Sistem check apakah buyer di block list seller
```

**Expected Result:**
- Tampilkan message: "Anda tidak bisa menghubungi user ini"
- Chat window tidak dibuka
- Buyer dapat unblock atau hubungi support
- Status code: 403 Forbidden

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

## UC-028: View Admin Dashboard

### Happy Path (Normal Flow)

**Test Case ID:** UTC-028-001  
**Title:** Admin Successfully View Dashboard  
**Precondition:** User sudah login dengan role = "admin"

**Steps:**
```
1. Admin membuka URL /admin
2. Middleware requireRole("admin") verify user role
3. Sistem check role di database = "admin"
4. Sistem load dashboard data:
   - Total users
   - Total products
   - Total transactions
   - Total revenue
   - Reported items count
   - Suspended users count
   - Unverified sellers count
5. Sistem tampilkan dalam dashboard format dengan charts
```

**Expected Result:**
- Admin dashboard berhasil ditampilkan
- Semua metrics ter-load dengan benar
- Charts & data visualization muncul
- Admin dapat navigate ke sub-sections
- Status code: 200 OK

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

### Exception Path: Non-Admin Access

**Test Case ID:** UTC-028-002  
**Title:** Non-Admin User Access Admin Page  
**Precondition:** User sudah login dengan role = "user" atau "seller"

**Steps:**
```
1. User membuka URL /admin
2. Middleware requireRole("admin") verify user role
3. Sistem check role di database != "admin"
```

**Expected Result:**
- Tampilkan error: "Akses ditolak"
- Redirect ke /marketplace atau /dashboard
- User tidak dapat akses admin panel
- Status code: 403 Forbidden

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

## UC-029: Suspend/Ban User

### Happy Path (Normal Flow)

**Test Case ID:** UTC-029-001  
**Title:** Successfully Suspend User  
**Precondition:** Admin sudah login, di user management section

**Steps:**
```
1. Admin membuka Admin Dashboard > Users
2. Admin cari user untuk di-suspend: "BadSeller123"
3. Admin klik user profile
4. Admin klik tombol "Suspend"
5. Sistem tampilkan confirmation dialog dengan alasan input
6. Admin input alasan: "Menjual produk ilegal"
7. Admin klik tombol "Konfirmasi Suspend"
8. Sistem update user.is_suspended = true
9. Sistem simpan alasan suspension
10. Sistem trigger logout otomatis untuk user tersebut
11. Sistem buat notification untuk user
```

**Expected Result:**
- User berhasil di-suspend
- is_suspended flag di-update ke true di database
- User diarahkan logout secara otomatis (jika online)
- User mendapat email notification tentang suspension
- User tidak bisa login sampai admin lift suspension
- Admin dapat lihat suspension record di history
- Status code: 200 OK

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

## UC-031: Report Produk/User

### Happy Path (Normal Flow)

**Test Case ID:** UTC-031-001  
**Title:** Successfully Report Product  
**Precondition:** User sudah login, melihat product detail

**Steps:**
```
1. User membuka Product Detail
2. User melihat produk mencurigakan/melanggar policy
3. User klik menu "Report" atau icon flag
4. Sistem tampilkan form report dengan:
   - Kategori: dropdown (fraud, inappropriate, damage, illegal, dll)
   - Deskripsi: textarea
   - Foto: upload optional
5. User pilih kategori: "Produk tidak sesuai deskripsi"
6. User tulis deskripsi: "Foto produk tidak match dengan barang asli"
7. User upload bukti foto
8. User klik tombol "Submit Report"
9. Sistem validasi input
10. Sistem simpan report ke database dengan status = "open"
11. Sistem buat notification untuk admin
```

**Expected Result:**
- Report berhasil dibuat
- Tampilkan success message: "Laporan berhasil dikirim"
- Admin mendapat notifikasi report baru
- Report tersimpan dengan timestamp
- Admin dapat review dan take action
- Status code: 201 Created

**Actual Result:** _______________  
**Status:** PASS / FAIL

---

## Summary Test Results

| Use Case | Happy Path | Alternative/Exception | Total Tests | Status |
|----------|-----------|----------------------|------------|--------|
| UC-001 Register | 1 | 2 | 3 | PASS/FAIL |
| UC-002 Login | 1 | 2 | 3 | PASS/FAIL |
| UC-005 List Product | 1 | 2 | 3 | PASS/FAIL |
| UC-010 Make Offer | 1 | 2 | 3 | PASS/FAIL |
| UC-012 Accept/Reject | 3 | 0 | 3 | PASS/FAIL |
| UC-014 Complete | 1 | 1 | 2 | PASS/FAIL |
| UC-015 Review | 1 | 1 | 2 | PASS/FAIL |
| UC-020 Chat | 1 | 1 | 2 | PASS/FAIL |
| UC-028 Admin Dashboard | 1 | 1 | 2 | PASS/FAIL |
| UC-029 Suspend User | 1 | 0 | 1 | PASS/FAIL |
| UC-031 Report | 1 | 0 | 1 | PASS/FAIL |
| **TOTAL** | | | **26** | |

---

## Testing Notes

- **Happy Path Testing:** Memastikan alur normal berjalan sesuai requirement
- **Alternative Path Testing:** Menguji branching logic dan conditional flows
- **Exception Path Testing:** Menguji error handling dan validation
- **Important:** Setiap test case harus repeatable dan independent
- **Documentation:** Catat actual result dan status (PASS/FAIL) untuk setiap test

---

**Last Updated:** April 24, 2026  
**File:** USE_CASE_TESTING.md

