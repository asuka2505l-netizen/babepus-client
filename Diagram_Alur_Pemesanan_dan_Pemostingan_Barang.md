# Diagram Alur Pemesanan dan Pemostingan Barang - BabePus

Diagram berikut menggambarkan alur backend untuk:
1. Pemostingan barang baru oleh penjual
2. Proses pemesanan barang oleh pembeli melalui tawaran dan transaksi escrow

## A. Alur Pemostingan Barang

```mermaid
graph TD
  StartA((Start)) --> A[User login/auth]
  A --> B[POST /products]
  B --> C[authMiddleware]
  C --> D[productImageUpload]
  D --> E[productPayloadValidator]
  E --> F[validateRequest]
  F --> G[productController.createProduct]
  G --> H[productService.createProduct]
  H --> I[Insert produk ke database]
  I --> J[Respon success: produk terposting]
  J --> EndA((End))

  StartA --> K[Update Product]
  K --> L[PUT /products/:id]
  L --> M[authMiddleware]
  M --> N[productImageUpload]
  N --> O[productUpdateValidator]
  O --> P[productController.updateProduct]
  P --> EndUpdate((End))

  StartA --> Q[Mark Product Sold]
  Q --> R[PATCH /products/:id/sold]
  R --> S[authMiddleware]
  S --> T[productController.markProductSold]
  T --> EndSold((End))

  StartA --> U[Delete Product]
  U --> V[DELETE /products/:id]
  V --> W[authMiddleware]
  W --> X[productController.deleteProduct]
  X --> EndDelete((End))
```
## easy to read
```mermaid
graph TD
  StartA((Start)) --> A[User Login]
  A --> B[Tambah Produk Baru]
  B --> C[Cek Login User]
  C --> D[Upload Gambar Produk]
  D --> E[Validasi Data Produk]
  E --> F[Periksa Request]
  F --> G[Controller Produk]
  G --> H[Service Produk]
  H --> I[Simpan Produk ke Database]
  I --> J[Produk Berhasil Diposting]
  J --> EndA((End))

  StartA --> K[Edit Produk]
  K --> L[Update Produk]
  L --> M[Cek Login User]
  M --> N[Upload Gambar Baru]
  N --> O[Validasi Update Produk]
  O --> P[Controller Update Produk]
  P --> EndUpdate((End))

  StartA --> Q[Tandai Produk Terjual]
  Q --> R[Ubah Status Produk]
  R --> S[Cek Login User]
  S --> T[Controller Produk Terjual]
  T --> EndSold((End))

  StartA --> U[Hapus Produk]
  U --> V[Delete Produk]
  V --> W[Cek Login User]
  W --> X[Controller Hapus Produk]
  X --> EndDelete((End))
```
## B. Alur Pemesanan Barang

```mermaid
graph TD
  StartB((Start)) --> A[Buyer login/auth]
  A --> B[POST /offers]
  B --> C[authMiddleware]
  C --> D[createOfferValidator]
  D --> E[validateRequest]
  E --> F[offerController.createOffer]
  F --> G[offerService.createOffer]
  G --> H[Validasi, cek produk, buat offer]
  H --> I[Insert offer ke database]
  I --> J[Respon: tawaran berhasil dikirim]
  J --> EndOffer((End))

  StartB --> K[Seller lihat tawaran incoming]
  K --> L[GET /offers/incoming]
  L --> M[offerController.getIncomingOffers]
  M --> N[offerService.getIncomingOffers]
  N --> EndIncoming((End))

  StartB --> O[Seller accept offer]
  O --> P[PATCH /offers/:id/accept]
  P --> Q[idParam + validateRequest]
  Q --> R[offerController.acceptOffer]
  R --> S[offerService.acceptOffer]
  S --> T[Buat transaksi baru dari offer]
  T --> U[Insert transactions & escrow data]
  U --> V[Respon: transaksi dibuat otomatis]
  V --> EndAccept((End))

  StartB --> W[Seller reject offer]
  W --> X[PATCH /offers/:id/reject]
  X --> Y[idParam + validateRequest]
  Y --> Z[offerController.rejectOffer]
  Z --> AA[offerService.rejectOffer]
  AA --> EndReject((End))

  StartB --> AB[Buyer/Seller konfirmasi escrow]
  AB --> AC[PATCH /transactions/:id/escrow/buyer-confirm]
  AB --> AD[PATCH /transactions/:id/escrow/seller-confirm]
  AC --> AE[completeTransactionValidator]
  AD --> AE
  AE --> AF[transactionController.confirmBuyer / confirmSeller]
  AF --> AG[transactionService.confirmEscrow]
  AG --> AH[Update buyer/seller confirm timestamps]
  AH --> AI[Jika kedua pihak confirm -> update status completed, release escrow]
  AI --> EndEscrow((End))

  StartB --> AJ[Buyer selesaikan transaksi manual]
  AJ --> AK[PATCH /transactions/:id/complete]
  AK --> AL[completeTransactionValidator]
  AL --> AM[transactionController.completeTransaction]
  AM --> AN[transactionService.completeTransaction]
  AN --> AO[Update status completed, release escrow]
  AO --> EndManual((End))

  AG --> AP[Create notification ke pihak lain]
  AP --> AQ[User menerima notifikasi status escrow]
  AQ --> EndNotification((End))
```
## easy to Read
```mermaid
graph TD
  StartB((Start)) --> A[Pembeli Login]
  A --> B[Buat Tawaran Harga]
  B --> C[Cek Login User]
  C --> D[Validasi Tawaran]
  D --> E[Periksa Request]
  E --> F[Controller Tawaran]
  F --> G[Service Tawaran]
  G --> H[Cek Produk & Buat Tawaran]
  H --> I[Simpan Tawaran ke Database]
  I --> J[Tawaran Berhasil Dikirim]
  J --> EndOffer((End))

  StartB --> K[Penjual Melihat Tawaran]
  K --> L[Ambil Data Tawaran Masuk]
  L --> M[Controller Tawaran Masuk]
  M --> N[Service Tawaran Masuk]
  N --> EndIncoming((End))

  StartB --> O[Penjual Menerima Tawaran]
  O --> P[Accept Tawaran]
  P --> Q[Validasi ID & Request]
  Q --> R[Controller Accept Tawaran]
  R --> S[Service Accept Tawaran]
  S --> T[Buat Data Transaksi]
  T --> U[Simpan Transaksi & Escrow]
  U --> V[Transaksi Berhasil Dibuat]
  V --> EndAccept((End))

  StartB --> W[Penjual Menolak Tawaran]
  W --> X[Reject Tawaran]
  X --> Y[Validasi ID & Request]
  Y --> Z[Controller Reject Tawaran]
  Z --> AA[Service Reject Tawaran]
  AA --> EndReject((End))

  StartB --> AB[Konfirmasi Escrow]
  AB --> AC[Konfirmasi Pembeli]
  AB --> AD[Konfirmasi Penjual]
  AC --> AE[Validasi Penyelesaian]
  AD --> AE
  AE --> AF[Controller Konfirmasi]
  AF --> AG[Service Escrow]
  AG --> AH[Update Status Konfirmasi]
  AH --> AI[Jika Keduanya Konfirmasi → Transaksi Selesai & Escrow Dicairkan]
  AI --> EndEscrow((End))

  StartB --> AJ[Pembeli Menyelesaikan Transaksi]
  AJ --> AK[Complete Transaksi]
  AK --> AL[Validasi Penyelesaian]
  AL --> AM[Controller Complete Transaksi]
  AM --> AN[Service Complete Transaksi]
  AN --> AO[Update Status Selesai & Cairkan Escrow]
  AO --> EndManual((End))

  AG --> AP[Buat Notifikasi]
  AP --> AQ[User Menerima Notifikasi]
  AQ --> EndNotification((End))
```
