with open('src/app/api/admin/staff/[id]/route.ts', 'r') as f:
    content = f.read()

replacement = """          if (doctorDetails.bio !== undefined) doctor.bio = doctorDetails.bio;
          
          if (doctorDetails.rating === "") {
            doctor.rating = undefined as any;
          } else if (doctorDetails.rating !== undefined) {
            doctor.rating = Number(doctorDetails.rating);
          }"""

content = content.replace('if (doctorDetails.bio !== undefined) doctor.bio = doctorDetails.bio;', replacement)

with open('src/app/api/admin/staff/[id]/route.ts', 'w') as f:
    f.write(content)

