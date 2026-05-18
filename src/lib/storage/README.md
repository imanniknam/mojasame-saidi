# Image storage

Driver-based uploads for admin product images.

## Drivers

| `UPLOAD_STORAGE_DRIVER` | Behavior |
|-------------------------|----------|
| `local` (default) | Saves to `public/uploads/products/` |
| `cloudinary` | Signed upload to Cloudinary API |

## Cloudinary setup

```env
UPLOAD_STORAGE_DRIVER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=mojasame/products
NEXT_PUBLIC_UPLOAD_STORAGE_DRIVER=cloudinary
```

Only **URLs** (and optional `publicId` in API responses) are stored in Prisma `ProductImage.url`.

## API

- `POST /api/admin/uploads` — multipart field `files`
- `POST /api/upload-product-images` — multipart field `files`

Client components must import browser-safe image helpers from `@/lib/image`.
Server upload code lives in `@/server/storage/upload-product-images`.
