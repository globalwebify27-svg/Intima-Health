import os

# 1. Update types.ts
with open('src/modules/doctors/types.ts', 'r') as f:
    content = f.read()
if 'registrationNumber' not in content:
    content = content.replace('specialization: string;', 'specialization: string;\n  registrationNumber?: string;')
    with open('src/modules/doctors/types.ts', 'w') as f:
        f.write(content)

# 2. Update schema.ts
with open('src/modules/doctors/schema.ts', 'r') as f:
    content = f.read()
if 'registrationNumber' not in content:
    content = content.replace('specialization: { type: String, required: true },', 'specialization: { type: String, required: true },\n  registrationNumber: { type: String },')
    with open('src/modules/doctors/schema.ts', 'w') as f:
        f.write(content)

# 3. Update route.ts (GET and POST)
with open('src/app/api/admin/staff/route.ts', 'r') as f:
    content = f.read()
if 'registrationNumber:' not in content:
    content = content.replace('specialization: docProfile ? docProfile.specialization : undefined,', 'specialization: docProfile ? docProfile.specialization : undefined,\n        registrationNumber: docProfile ? docProfile.registrationNumber : undefined,')
    content = content.replace('specialization: doctorDetails.specialization || "General Medicine",', 'specialization: doctorDetails.specialization || "General Medicine",\n        registrationNumber: doctorDetails.registrationNumber || undefined,')
    with open('src/app/api/admin/staff/route.ts', 'w') as f:
        f.write(content)

# 4. Update [id]/route.ts (PUT)
with open('src/app/api/admin/staff/[id]/route.ts', 'r') as f:
    content = f.read()
if 'registrationNumber' not in content:
    content = content.replace('if (doctorDetails.specialization) doctor.specialization = doctorDetails.specialization;', 'if (doctorDetails.specialization) doctor.specialization = doctorDetails.specialization;\n          if (doctorDetails.registrationNumber) doctor.registrationNumber = doctorDetails.registrationNumber;')
    with open('src/app/api/admin/staff/[id]/route.ts', 'w') as f:
        f.write(content)

