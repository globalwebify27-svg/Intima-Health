import os

with open('src/modules/doctors/schema.ts', 'r') as f:
    content = f.read()

content = content.replace('specialization: { type: String, required: true },', 'specialization: { type: String },')
content = content.replace('experience: { type: Number, required: true },', 'experience: { type: Number },')
content = content.replace('bio: { type: String, required: true },', 'bio: { type: String },')
content = content.replace('salary: { type: Number, required: true },', 'salary: { type: Number },')
content = content.replace('registrationNumber: { type: String },', 'registrationNumber: { type: String, required: true },')

with open('src/modules/doctors/schema.ts', 'w') as f:
    f.write(content)

