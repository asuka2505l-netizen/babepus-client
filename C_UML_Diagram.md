# C. UML Diagram

Dokumen ini menyajikan diagram UML untuk aplikasi BabePus: Use Case Diagram, Activity Diagram, Sequence Diagram, dan Class Diagram.

## 1. Use Case Diagram

```mermaid
usecaseDiagram
  actor User as U
  actor Seller as S
  actor Admin as A

  U --> (Register)
  U --> (Login)
  U --> (Browse Products)
  U --> (View Product Detail)
  U --> (Make Offer)
  U --> (Chat with Seller)
  U --> (Add Product to Wishlist)
  U --> (View Notifications)

  S --> (Login)
  S --> (Manage Listings)
  S --> (Review Offers)
  S --> (Accept / Reject Offer)
  S --> (Complete Transaction)
  S --> (Respond to Chat)

  A --> (Login)
  A --> (Review Reports)
  A --> (Verify Users)
  A --> (Manage Platform Data)

  (Make Offer) .> (Login) : requires
  (Manage Listings) .> (Login) : requires
  (Review Reports) .> (Login) : requires
```

## 2. Activity Diagram

```mermaid
flowchart TD
  Start([Start]) --> Login{User has account?}
  Login -->|No| Register[Register Account]
  Login -->|Yes| Auth[Authenticate User]
  Auth --> Dashboard[Show Homepage / Marketplace]
  Dashboard --> Action{User action}
  Action -->|Browse products| Browse[Request product list]
  Action -->|View product| Detail[Request product detail]
  Action -->|Make offer| OfferForm[Open offer form]
  Action -->|Chat| ChatStart[Open chat session]
  Action -->|Manage listing| SellerDashboard[Open seller dashboard]
  Browse --> RenderList[Render products]
  Detail --> RenderDetail[Show product detail]
  OfferForm --> SubmitOffer[Submit offer request]
  SubmitOffer --> Backend[Backend validates offer]
  Backend --> DB[Store offer]
  DB --> Notify[Notify seller]
  ChatStart --> SendMessage[Send/receive chat]
  SendMessage --> DB2[Persist message]
  DB2 --> RenderChat[Update chat view]
  SellerDashboard --> ReviewOffers[Review incoming offers]
  ReviewOffers --> UpdateOffer[Accept / reject offer]
  UpdateOffer --> Transaction[Create transaction if accepted]
  Transaction --> DB3[Update product and offer status]
  DB3 --> NotifyBuyer[Notify buyer]
  NotifyBuyer --> End([End])
```

## 3. Sequence Diagram

### 3.1 Login Sequence

```mermaid
sequenceDiagram
  participant User
  participant Frontend
  participant Backend
  participant Database

  User->>Frontend: Submit email/password
  Frontend->>Backend: POST /login
  Backend->>Database: SELECT user WHERE email
  Database-->>Backend: user record
  Backend->>Backend: Verify password
  Backend-->>Frontend: token + user info
  Frontend-->>User: Display dashboard
```

### 3.2 Create Offer Sequence

```mermaid
sequenceDiagram
  participant Buyer
  participant Frontend
  participant Backend
  participant Database
  participant Seller

  Buyer->>Frontend: Click "Make Offer"
  Frontend->>Backend: POST /offers
  Backend->>Database: INSERT offer
  Database-->>Backend: success
  Backend-->>Frontend: confirmation
  Backend->>Seller: send notification
  Frontend-->>Buyer: show success
```

### 3.3 Complete Transaction Sequence

```mermaid
sequenceDiagram
  participant Seller
  participant Backend
  participant Database
  participant Buyer

  Seller->>Backend: PATCH /offers/:id/status
  Backend->>Database: SELECT offer + product
  Backend->>Database: UPDATE offer status
  Backend->>Database: UPDATE product status
  Backend->>Database: INSERT transaction
  Database-->>Backend: success
  Backend->>Buyer: notify transaction created
  Backend-->>Seller: confirm completion
```

## 4. Class Diagram

```mermaid
classDiagram
  class User {
    +BIGINT id
    +VARCHAR full_name
    +VARCHAR email
    +VARCHAR password_hash
    +VARCHAR phone
    +VARCHAR campus
    +VARCHAR faculty
    +VARCHAR study_program
    +VARCHAR student_id
    +VARCHAR campus_email
    +ENUM role
    +VARCHAR avatar_url
    +VARCHAR bio
    +DECIMAL rating_average
    +INT rating_count
    +TINYINT is_suspended
    +ENUM verification_status
    +DATETIME email_verified_at
    +VARCHAR email_verification_token
    +DATETIME email_verification_expires_at
  }

  class Category {
    +BIGINT id
    +VARCHAR name
    +VARCHAR slug
  }

  class Product {
    +BIGINT id
    +BIGINT seller_id
    +BIGINT category_id
    +VARCHAR title
    +VARCHAR slug
    +TEXT description
    +DECIMAL price
    +ENUM condition_label
    +VARCHAR campus_location
    +VARCHAR faculty
    +VARCHAR image_url
    +ENUM status
    +INT view_count
  }

  class Offer {
    +BIGINT id
    +BIGINT product_id
    +BIGINT buyer_id
    +BIGINT seller_id
    +DECIMAL offer_price
    +VARCHAR note
    +ENUM status
  }

  class Transaction {
    +BIGINT id
    +BIGINT offer_id
    +BIGINT product_id
    +BIGINT buyer_id
    +BIGINT seller_id
    +DECIMAL final_price
    +ENUM status
    +ENUM escrow_status
  }

  class Review {
    +BIGINT id
    +BIGINT transaction_id
    +BIGINT reviewer_id
    +BIGINT seller_id
    +TINYINT rating
    +VARCHAR comment
  }

  class Report {
    +BIGINT id
    +BIGINT reporter_id
    +ENUM target_type
    +BIGINT target_user_id
    +BIGINT target_product_id
    +VARCHAR reason
    +ENUM status
  }

  class Verification {
    +BIGINT id
    +BIGINT user_id
    +VARCHAR document_type
    +VARCHAR campus_email
    +ENUM status
  }

  class Wishlist {
    +BIGINT id
    +BIGINT user_id
    +BIGINT product_id
  }

  class Notification {
    +BIGINT id
    +BIGINT user_id
    +VARCHAR type
    +VARCHAR title
    +VARCHAR body
  }

  class Conversation {
    +BIGINT id
    +BIGINT product_id
    +BIGINT buyer_id
    +BIGINT seller_id
    +DATETIME last_message_at
  }

  class Message {
    +BIGINT id
    +BIGINT conversation_id
    +BIGINT sender_id
    +VARCHAR body
    +DATETIME read_at
  }

  User "1" -- "*" Product : sells
  User "1" -- "*" Offer : buys
  User "1" -- "*" Offer : sells
  User "1" -- "*" Transaction : buys
  User "1" -- "*" Transaction : sells
  User "1" -- "*" Review : writes
  User "1" -- "*" Review : receives
  User "1" -- "*" Report : reports
  User "1" -- "*" Verification : has
  User "1" -- "*" Wishlist : owns
  User "1" -- "*" Notification : receives
  User "1" -- "*" Conversation : participates_as_buyer
  User "1" -- "*" Conversation : participates_as_seller
  User "1" -- "*" Message : sends

  Category "1" -- "*" Product : groups
  Product "1" -- "*" Offer : receives
  Product "1" -- "*" Conversation : has
  Product "1" -- "*" Wishlist : saved_in
  Conversation "1" -- "*" Message : contains
  Offer "1" -- "1" Transaction : completes
  Transaction "1" -- "1" Review : evaluated_by
```

## 5. Keterangan

- Use Case Diagram menampilkan aktor utama: `User`, `Seller`, `Admin`.
- Activity Diagram menunjukkan alur autentikasi, pencarian produk, pembuatan penawaran, dan transaksi.
- Sequence Diagram mengilustrasikan interaksi frontend-backend-database untuk login, penawaran, dan penyelesaian transaksi.
- Class Diagram menampilkan entitas data utama dan relasi antar objek sesuai struktur database.
