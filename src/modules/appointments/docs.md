# Appointments Module Documentation

This module manages all appointment scheduling, availability slot calculations, reschedule actions, and cancellations.

## Directory Structure
- `schema.ts`: Mongoose schemas for Appointment and Availability (located in centralized modules/appointments/schema.ts).
- `types.ts`: TypeScript interfaces.
- `validators.ts`: Zod request validators.
- `repository.ts`: Mongoose data operation handlers.
- `service.ts`: Core scheduling logic, date parsing, slot splitting, and verification.
- `permissions.ts`: Access authorization controls.
- `routes.ts`: Unified API controller handlers.

## Slot Calculation Logic
1. When querying slots for a date (e.g. `2026-06-15`, which is a Monday), the service looks up the doctor's active availability profile.
2. The active hourly block (e.g. `09:00 - 13:00`) is divided into 30-minute intervals.
3. Existing active bookings are queried for that doctor on that specific date.
4. Any slots matching the starting hour of a booked appointment are marked as `available: false`.

## API Specification

### 1. Get Doctor Available Slots
- **Endpoint**: `GET /api/doctors/:id/slots`
- **Query Parameters**:
  - `date`: Date to query in `YYYY-MM-DD` format (required)
- **Response**:
```json
{
  "success": true,
  "message": "Time slots calculated successfully.",
  "data": [
    { "start": "09:00", "end": "09:30", "available": true },
    { "start": "09:30", "end": "10:00", "available": false }
  ]
}
```

### 2. Book Appointment
- **Endpoint**: `POST /api/appointments`
- **Body**:
```json
{
  "patientId": "6a2a905ae03cf44deb9d3b90",
  "doctorId": "6a2a905ae03cf44deb9d3b88",
  "date": "2026-06-15",
  "time": "09:00",
  "type": "Video",
  "notes": "Erectile dysfunction consult."
}
```

### 3. List Appointments
- **Endpoint**: `GET /api/appointments`

### 4. Reschedule Appointment
- **Endpoint**: `PUT /api/appointments/:id`

### 5. Cancel Appointment
- **Endpoint**: `DELETE /api/appointments/:id`
