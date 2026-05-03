# Milestone

**Milestone — Freelancer Accountability Without Escrow Drama**

## 1. The Problem (The Itch)

"Why do freelancers ghost projects after partial payments without accountability systems?"

This is a systemic failure that affects:

- **Clients:** Startups, SMEs, and individual founders who pay 30-50% upfront and never hear back.
- **Freelancers:** The honest ones who suffer because the market cannot distinguish them from ghosters.
- **Platforms:** Upwork, Fiverr, and Freelancer.com that rely on escrow but still see 15-20% dispute rates.

The current solutions are broken for the Indian context. Escrow is expensive and doesn't enforce delivery. Contracts are legally unenforceable in a practical timeframe. Word-of-mouth doesn't scale. Manual milestone tracking leads to subjective arguments.

**The root cause:** There is no reputation infrastructure for freelancers in India. No single source of truth for "does this person actually ship?"

## 2. The Solution

**Core Philosophy:** Trust should be earned, not bought. And it should be portable.

Milestone is NOT a project management tool. It is NOT an escrow service. It is a **public, verifiable delivery ledger** for freelancers that answers one question: _"Will this person actually deliver what they promised, when they promised it?"_

Delivery is verifiable. A developer's GitHub commits, a designer's Figma file, a writer's Google Doc — these are objective artifacts. Milestone automatically verifies that these artifacts exist and match the agreed scope, building a reputation score that is:

- **Objective:** Based on actual deliverables, not subjective reviews
- **Portable:** Follows the freelancer across platforms and clients
- **Credible:** Hard to game because it requires actual work artifacts

## 3. Technology Stack

- **Backend:** Rust (Axum) for performance and learning, with SQLx.
- **Database:** PostgreSQL 16
- **Cache/Queue:** Redis for sessions and job queues (Tokio tasks)
- **Frontend:** React + TypeScript + Vite, styled with Tailwind CSS
- **Infrastructure:** Fly.io/Railway (Backend), Vercel (Frontend), Cloudflare R2 (Storage)
- **Integrations:** GitHub OAuth (V1), Razorpay (Payments), Resend (Emails)

## 4. Verification Engine

The core of Milestone is the Verification Engine. It runs on a scheduled basis (every 15 mins via Tokio) to check pending milestones against their due dates and verification rules.

- **GitHub Commit Check:** Verifies if a specific branch has reached a minimum commit count since a given date.
- **GitHub PR Check:** Checks if a specified PR is merged or open.
- **URL Check:** Verifies HTTP status and optional keywords on deployed links.
- **Manual Check:** Client explicitly confirms delivery in UI.

## 5. Reputation Score Algorithm

A freelancer's score (0-100) is calculated based on:

- **Base Score:** 100 for on-time delivery. Deductions for late deliveries. 0 for failed/ghosted.
- **Recency:** Uses a half-life of 90 days. Recent performance is weighted more heavily than older work.
