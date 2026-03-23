/*create Profile table */
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_reference text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS text AS $$
BEGIN
  RETURN 'BK-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_reference IS NULL THEN
    NEW.booking_reference := generate_booking_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_booking_reference_trigger'
  ) THEN
    CREATE TRIGGER set_booking_reference_trigger
      BEFORE INSERT ON bookings
      FOR EACH ROW
      EXECUTE FUNCTION set_booking_reference();
  END IF;
END $$;