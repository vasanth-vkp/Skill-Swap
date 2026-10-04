-- =============================================================================
-- SkillSwap Seed Migration V2: 36 Curated Standard Skills
-- Across 6 Core Domains: Technology, Languages, Arts & Design, Academics,
-- Trades & Practical, Health & Wellness.
-- =============================================================================

INSERT INTO skills (name, category) VALUES
  -- 1. Technology
  ('Web Development', 'Technology'),
  ('Python Programming', 'Technology'),
  ('Mobile App Development', 'Technology'),
  ('UI/UX Design', 'Technology'),
  ('Data Analysis & SQL', 'Technology'),
  ('Cybersecurity Basics', 'Technology'),

  -- 2. Languages
  ('Spanish Conversation', 'Languages'),
  ('French for Beginners', 'Languages'),
  ('Conversational English', 'Languages'),
  ('Mandarin Chinese', 'Languages'),
  ('Japanese Basics', 'Languages'),
  ('German', 'Languages'),

  -- 3. Arts & Design
  ('Graphic Design & Branding', 'Arts & Design'),
  ('Digital Photography', 'Arts & Design'),
  ('Video Editing & Motion', 'Arts & Design'),
  ('Acoustic Guitar', 'Arts & Design'),
  ('Piano & Keyboard', 'Arts & Design'),
  ('Digital Illustration', 'Arts & Design'),

  -- 4. Academics
  ('Calculus & Linear Algebra', 'Academics'),
  ('High School Physics', 'Academics'),
  ('General Chemistry', 'Academics'),
  ('College Essay Writing', 'Academics'),
  ('SAT & ACT Math Prep', 'Academics'),
  ('Microeconomics', 'Academics'),

  -- 5. Trades & Practical
  ('Home Electrical & Plumbing Repairs', 'Trades & Practical'),
  ('Bicycle Maintenance & Tune-up', 'Trades & Practical'),
  ('Urban Gardening & Composting', 'Trades & Practical'),
  ('Artisan Bread Baking', 'Trades & Practical'),
  ('Basic Woodworking', 'Trades & Practical'),
  ('Sewing & Clothing Alterations', 'Trades & Practical'),

  -- 6. Health & Wellness
  ('Vinyasa Yoga', 'Health & Wellness'),
  ('Functional Strength Training', 'Health & Wellness'),
  ('Guided Meditation & Breathwork', 'Health & Wellness'),
  ('Nutrition & Meal Prep', 'Health & Wellness'),
  ('Mat Pilates', 'Health & Wellness'),
  ('Self-Defense & Martial Arts', 'Health & Wellness')
ON CONFLICT (name) DO NOTHING;
