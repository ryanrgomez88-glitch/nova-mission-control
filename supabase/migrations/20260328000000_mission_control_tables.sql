CREATE TABLE IF NOT EXISTS overnight_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date UNIQUE NOT NULL,
  title text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blockers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  status text NOT NULL DEFAULT 'blocked',
  owner text NOT NULL DEFAULT 'Ryan',
  note text,
  sort_order int DEFAULT 0,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rd_memos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_date date UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  analysts text[],
  created_at timestamptz DEFAULT now()
);
