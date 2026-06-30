
DROP POLICY IF EXISTS "Inbox archive by authenticated" ON public.telegram_inbox;
DROP POLICY IF EXISTS "Inbox delete by authenticated" ON public.telegram_inbox;
-- Keep SELECT (shared inbox is intentional read-only for signed-in users).
-- Writes are performed only by server code using the service role (admin client),
-- which bypasses RLS. No authenticated UPDATE/DELETE policies = no client-side write access.
