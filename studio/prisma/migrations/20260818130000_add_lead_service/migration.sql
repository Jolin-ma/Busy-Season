-- Adds Lead.service.
--
-- The brief-v2 rebuild of the marketing site's quote form replaced its separate
-- "location" and "package" questions with a single "What you do" field holding
-- trade and service area together. Without a column for it, the one thing a
-- lead says about their business was being dropped on ingest.
--
-- Nullable and additive: no backfill, and older leads keep their location and
-- package_interest values.

ALTER TABLE "leads" ADD COLUMN "service" TEXT;
