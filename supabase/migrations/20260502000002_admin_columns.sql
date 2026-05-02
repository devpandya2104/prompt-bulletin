-- Add link rel control and screenshots to tools
ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS link_rel text DEFAULT 'nofollow' CHECK (link_rel IN ('nofollow', 'dofollow', 'sponsored')),
  ADD COLUMN IF NOT EXISTS screenshots jsonb DEFAULT '[]';
