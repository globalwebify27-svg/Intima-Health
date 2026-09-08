with open('src/app/api/admin/staff/[id]/route.ts', 'r') as f:
    content = f.read()

# Replace falsy checks with undefined checks so empty strings apply correctly
content = content.replace('if (doctorDetails.specialization) doctor.specialization = doctorDetails.specialization;', 'if (doctorDetails.specialization !== undefined) doctor.specialization = doctorDetails.specialization;')
content = content.replace('if (doctorDetails.bio) doctor.bio = doctorDetails.bio;', 'if (doctorDetails.bio !== undefined) doctor.bio = doctorDetails.bio;')

with open('src/app/api/admin/staff/[id]/route.ts', 'w') as f:
    f.write(content)

