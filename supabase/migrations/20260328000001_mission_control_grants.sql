-- Grant access to mission control tables
GRANT ALL ON TABLE public.overnight_reports TO service_role;
GRANT ALL ON TABLE public.blockers TO service_role;
GRANT ALL ON TABLE public.rd_memos TO service_role;

GRANT SELECT ON TABLE public.overnight_reports TO anon, authenticated;
GRANT SELECT ON TABLE public.blockers TO anon, authenticated;
GRANT SELECT ON TABLE public.rd_memos TO anon, authenticated;

-- Enable RLS but allow service_role to bypass
ALTER TABLE public.overnight_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rd_memos ENABLE ROW LEVEL SECURITY;

-- Allow anon reads
CREATE POLICY "anon_read_overnight_reports" ON public.overnight_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_read_blockers" ON public.blockers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_read_rd_memos" ON public.rd_memos FOR SELECT TO anon, authenticated USING (true);
