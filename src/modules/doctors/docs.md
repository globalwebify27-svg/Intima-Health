# Doctors Module Documentation

This module manages all doctor profile information, availability schedules, qualifications, fees, and retrieval of clinical lists.

## Directory Structure
- `schema.ts`: Mongoose schema definition with soft delete support.
- `types.ts`: TypeScript interfaces.
- `validators.ts`: Zod request schemas.
- `repository.ts`: Mongoose data operations layer.
- `service.ts`: Core business logic (email checking, profile updates, automatic seeding).
- `permissions.ts`: Access control permissions checking.
- `routes.ts`: Unified API controller handlers.

## API Specification

### 1. List Doctors
- **Endpoint**: `GET /api/doctors`
- **Query Parameters**:
  - `specialization` (optional): Filter doctors by specialty
  - `status` (optional): Filter doctors by status (`Active` / `Inactive` / `Pending`)
  - `page` (optional): Page number (default: `1`)
  - `limit` (optional): Limit per page (default: `10`)
- **Response**:
```json
{
  "success": true,
  "message": "Doctors listed successfully.",
  "data": [...],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

### 2. Register Doctor
- **Endpoint**: `POST /api/doctors`
- **Body**:
```json
{
  "name": "Dr. Sarah Jenkins",
  "email": "sarah.jenkins@intima.health",
  "phone": "9876543210",
  "specialization": "Sexual Medicine",
  "experience": 12,
  "bio": "Specialist in sexual medicine.",
  "fees": 1500,
  "qualifications": ["MD - Internal Medicine"]
}
```

### 3. Get Doctor Profile
- **Endpoint**: `GET /api/doctors/:id`

### 4. Update Doctor Profile
- **Endpoint**: `PUT /api/doctors/:id`

### 5. Delete Doctor Profile
- **Endpoint**: `DELETE /api/doctors/:id`
