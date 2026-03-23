/* Create properties table */
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price_per_night decimal(10,2) NOT NULL,
  location text NOT NULL,
  bedrooms integer NOT NULL DEFAULT 1,
  bathrooms integer NOT NULL DEFAULT 1,
  max_guests integer NOT NULL DEFAULT 2,
  amenities text[] DEFAULT '{}',
  image_urls text[] DEFAULT '{}',
  owner_id uuid,
  rating decimal(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

/* Create bookings table*/
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer NOT NULL,
  total_price decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

/* Create reviews table */
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

/* Enable RLS */
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

/* Properties policies */
CREATE POLICY "Anyone can view properties"
  ON properties FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Owners can update their properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their properties"
  ON properties FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

/* Bookings policies */
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

/* Reviews policies */
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

/* Create indexes for better query performance */
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_per_night);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);