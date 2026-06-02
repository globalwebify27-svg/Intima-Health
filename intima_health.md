# MASTER_SPEC.md

# INTIMA HEALTH PLATFORM

Version: 1.0

---

# PROJECT OVERVIEW

## Project Name

Intima Health Platform

## Goal

Build a modern digital healthcare platform focused on sexual and reproductive health.

The platform should support:

* Marketing Website
* Patient Portal
* Doctor Portal
* Admin Dashboard
* Appointment Booking
* Video Consultation
* Patient Health Records
* Pharmacy / E-commerce
* CMS
* Notifications
* Analytics

AI Chatbot is excluded from V1.

---

# PRODUCT VISION

Create a platform that feels:

* Premium
* Private
* Trustworthy
* Medical
* Modern
* Mobile First

Reference for inspiration only:

https://www.allohealth.com

DO NOT COPY

* Content
* Layout
* Assets
* Branding

Create original implementation.

---

# BUSINESS OBJECTIVES

1. Generate leads through SEO.
2. Increase appointment bookings.
3. Enable online consultations.
4. Manage patients digitally.
5. Digitize prescriptions.
6. Deliver treatment plans.
7. Enable medicine purchases.
8. Manage clinic operations.

---

# TECH STACK

## Frontend

Framework:

Next.js 15

Language:

TypeScript

UI:

Shadcn UI

Styling:

Tailwind CSS

Animations:

Framer Motion

Forms:

React Hook Form

Validation:

Zod

Tables:

TanStack Table

Charts:

Recharts

State Management:

Zustand

Data Fetching:

TanStack Query

Icons:

Lucide React

Theme:

next-themes

---

## Backend

Framework:

Next.js Route Handlers

Architecture:

Service Layer Pattern

Repository Pattern

Validation:

Zod

Authentication:

JWT

Authorization:

RBAC

Logging:

Pino

Cron Jobs:

node-cron

---

## Database

MongoDB Community Edition

ODM:

Mongoose

---

## Cache

Redis

Usage:

* OTP Storage
* Session Cache
* Rate Limiting
* Queues
* Notifications

---

## Mobile App

Flutter

State Management:

Riverpod

Networking:

Dio

Routing:

GoRouter

Storage:

Flutter Secure Storage

---

## Video Consultation

Agora

---

## Payments

Razorpay

---

## Maps

Google Maps

---

## Notifications

SMTP

WhatsApp

Push Notifications

---

## Deployment

Ubuntu 24.04

Docker

Docker Compose

Nginx

SSL

---

# SYSTEM ARCHITECTURE

Single Server Deployment

Internet

↓

Nginx

↓

Next.js Application

↓

MongoDB

↓

Redis

↓

Local File Storage

Flutter App consumes APIs only.

---

# PROJECT STRUCTURE

root/

docs/

src/

public/

uploads/

docker/

scripts/

backups/

logs/

---

# SOURCE STRUCTURE

src/

app/

modules/

components/

db/

services/

middleware/

providers/

hooks/

lib/

types/

utils/

validations/

constants/

actions/

layouts/

---

# APP ROUTER STRUCTURE

app/

(public)

(auth)

(patient)

(doctor)

(admin)

api/

---

# PUBLIC ROUTES

/

/about

/contact

/doctors

/blog

/conditions

/privacy-policy

/terms

/faq

---

# PATIENT ROUTES

/patient/dashboard

/patient/profile

/patient/appointments

/patient/consultations

/patient/records

/patient/prescriptions

/patient/orders

/patient/settings

---

# DOCTOR ROUTES

/doctor/dashboard

/doctor/patients

/doctor/appointments

/doctor/consultations

/doctor/prescriptions

/doctor/profile

/doctor/settings

---

# ADMIN ROUTES

/admin/dashboard

/admin/users

/admin/doctors

/admin/patients

/admin/appointments

/admin/orders

/admin/content

/admin/reports

/admin/settings

---

# MODULE ARCHITECTURE

Every module MUST follow this structure.

modules/

module-name/

index.ts

schema.ts

types.ts

validators.ts

repository.ts

service.ts

permissions.ts

routes.ts

controller.ts

constants.ts

docs.md

tests/

---

# SHARED COMPONENT STRUCTURE

components/

ui/

forms/

cards/

tables/

charts/

navigation/

layout/

modals/

sections/

---

# DATABASE COLLECTIONS

users

sessions

roles

patients

doctors

availability

appointments

consultations

medical_records

prescriptions

reports

products

orders

payments

notifications

audit_logs

pages

posts

categories

faqs

settings

feature_flags

---

# DATABASE STANDARDS

Every collection MUST contain:

_id

createdAt

updatedAt

createdBy

updatedBy

deletedAt

status

Soft delete mandatory.

Never permanently delete records.

---

# USER ROLES

PATIENT

DOCTOR

CLINIC_ADMIN

SUPPORT_AGENT

SUPER_ADMIN

---

# RBAC RULES

Every API must:

Authenticate User

Authorize User

Validate Input

Log Audit Event

Return Typed Response

No exceptions.

---

# FILE STORAGE

Store files locally.

uploads/

avatars/

reports/

prescriptions/

doctor-documents/

patient-documents/

invoices/

blog/

Store paths only in MongoDB.

Never store files in MongoDB.

---

# UI DESIGN SYSTEM

Design Language:

Premium Healthcare

Modern

Minimal

High Trust

Mobile First

Accessibility Compliant

Dark Mode Ready

Design Principles:

Large spacing

Rounded corners

Clean typography

Subtle animations

Fast loading

Skeleton loaders

No clutter

---

# HOMEPAGE REQUIREMENTS

PHASE 0

Build Homepage First

Must look launch ready.

---

Homepage Sections

1. Announcement Bar

2. Sticky Header

3. Hero Section

4. Trust Indicators

5. Conditions We Treat

6. Why Choose Us

7. Treatment Journey

8. Featured Doctors

9. Testimonials

10. FAQ

11. Blog Section

12. CTA Banner

13. Footer

---

Hero Requirements

Premium design

Strong headline

Strong CTA

Doctor imagery

Trust indicators

Mobile optimized

---

Conditions Section

ED

PE

STI

Low Libido

Fertility

Couple Therapy

Each links to future page.

---

# MARKETING WEBSITE

Pages

Home

About

Doctors

Conditions

Blog

FAQ

Contact

Privacy Policy

Terms

---

# SEO REQUIREMENTS

Every page must include:

Title

Description

Open Graph

Twitter Cards

Schema Markup

Canonical URL

Structured Data

Sitemap

Robots.txt

---

# PHASED DEVELOPMENT PLAN

=================================

PHASE 0

FOUNDATION

=================================

Tasks

Setup Next.js

Setup TypeScript

Setup Tailwind

Setup Shadcn

Setup Docker

Setup MongoDB

Setup Redis

Setup Environment Variables

Setup Logger

Setup Error Handling

Setup Authentication Skeleton

Deliverable

Running Application

---

=================================

PHASE 1

HOMEPAGE + MARKETING WEBSITE

=================================

Goal

Launch-ready website

Deliverables

Homepage

About

Doctors

Conditions

Blog

FAQ

Contact

Responsive Design

SEO

---

=================================

PHASE 2

AUTHENTICATION

=================================

Features

Register

Login

Logout

Forgot Password

OTP

Session Management

JWT

Refresh Tokens

---

=================================

PHASE 3

PATIENT MODULE

=================================

Features

Profile

Medical History

Allergies

Documents

Emergency Contacts

---

=================================

PHASE 4

DOCTOR MODULE

=================================

Features

Profiles

Availability

Fees

Qualifications

Schedules

---

=================================

PHASE 5

APPOINTMENTS

=================================

Features

Booking

Cancellation

Rescheduling

Calendar

Waitlist

Reminders

---

=================================

PHASE 6

VIDEO CONSULTATION

=================================

Provider

Agora

Features

Video

Audio

Chat

File Sharing

Notes

---

=================================

PHASE 7

PATIENT HEALTH RECORDS

=================================

Features

Reports

Prescriptions

Medical Records

Treatment Plans

Timeline

PDF Downloads

---

=================================

PHASE 8

ADMIN DASHBOARD

=================================

Features

User Management

Doctor Management

Patient Management

Appointment Monitoring

Revenue

Audit Logs

---

=================================

PHASE 9

CMS

=================================

Features

Blogs

Pages

SEO

FAQs

Media Library

---

=================================

PHASE 10

NOTIFICATIONS

=================================

Channels

Email

SMS

WhatsApp

Push

Events

Registration

Appointments

Prescriptions

Orders

---

=================================

PHASE 11

PHARMACY

=================================

Features

Catalog

Cart

Checkout

Orders

Tracking

Subscriptions

---

=================================

PHASE 12

ANALYTICS

=================================

Metrics

Patients

Appointments

Revenue

Doctor Performance

Conversion Rate

Retention

---

# API STANDARDS

REST API

Naming:

/api/resource

Examples:

/api/auth

/api/patients

/api/doctors

/api/appointments

/api/consultations

/api/orders

/api/payments

All responses:

success

message

data

meta

error

---

# SERVICE LAYER RULES

Never access database directly from UI.

Flow:

UI

↓

Route

↓

Service

↓

Repository

↓

Database

Mandatory.

---

# TESTING STANDARDS

Every module requires:

Unit Tests

Integration Tests

API Tests

Validation Tests

Coverage:

Minimum 80%

---

# AUDIT LOGGING

Log:

Login

Logout

Appointment Creation

Appointment Update

Prescription Creation

Report Upload

Payment Success

Admin Changes

Store in:

audit_logs

---

# SECURITY REQUIREMENTS

JWT Authentication

Refresh Tokens

Password Hashing

RBAC

Rate Limiting

Input Validation

Secure File Uploads

Audit Logs

HTTPS

CSRF Protection

XSS Protection

Security Headers

---

# MOBILE APP ARCHITECTURE

Flutter App

Modules:

Authentication

Dashboard

Appointments

Consultations

Records

Orders

Notifications

Profile

Rule:

Mobile App only uses APIs.

Never connect mobile directly to database.

---

# DEPLOYMENT STRUCTURE

Ubuntu 24.04

Docker Compose

Nginx

MongoDB

Redis

Next.js

Directory Structure

/opt/intima-health

/app

/uploads

/database

/backups

/logs

---

# BACKUP STRATEGY

MongoDB Backup

Daily

Uploads Backup

Daily

Retention

30 Days

---

# AGENT EXECUTION RULES

Before building any module:

1. Create Schema
2. Create Types
3. Create Validators
4. Create Repository
5. Create Service
6. Create Permissions
7. Create Routes
8. Create UI
9. Create Tests
10. Create Documentation

Module is NOT complete until all 10 are done.

---

# CODING STANDARDS

Strict TypeScript

No Any Types

Reusable Components

No Business Logic In Components

Pagination Everywhere

Indexes For Searchable Fields

Soft Deletes

Error Handling Required

Validation Required

Documentation Required

---

# FUTURE SCALABILITY

Current:

Single Server

Future:

Separate MongoDB Server

Separate Redis Server

Load Balanced Next.js

No code rewrite required.

---

# MVP RELEASE CRITERIA

Homepage Complete

Marketing Website Complete

Authentication Complete

Patient Module Complete

Doctor Module Complete

Appointment System Complete

Video Consultation Complete

Health Records Complete

Admin Dashboard Complete

Production Deployment Complete

END OF SPECIFICATION
