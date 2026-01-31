-- Migration: 009_add_poster_url_to_categories
-- Description: Add poster_url to categories table for separate banner functionality
-- Created: 2026-01-08

ALTER TABLE categories ADD COLUMN IF NOT EXISTS poster_url TEXT;
