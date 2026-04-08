/* Migration: Add lat/lng to properties for geocoding */
-- Add columns (nullable for legacy data)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS lat decimal(11,8),
ADD COLUMN IF NOT EXISTS lng decimal(12,8);

-- Spatial indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_properties_lat ON public.properties (lat);
CREATE INDEX IF NOT EXISTS idx_properties_lng ON public.properties (lng);
CREATE INDEX IF NOT EXISTS idx_properties_geom ON public.properties USING GIST (point(lng::float, lat::float));

-- Ensure RLS allows coords (existing policies ok, but refresh)
DROP POLICY IF EXISTS \"Authenticated users can create properties\" ON public.properties;
CREATE POLICY \"Authenticated users can create properties\" ON public.properties FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS \"Owners can update their properties\" ON public.properties;
CREATE POLICY \"Owners can update their properties\" ON public.properties FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- View all including coords
CREATE POLICY \"Anyone can view properties with coords\" ON public.properties FOR SELECT USING (true);

