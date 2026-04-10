-- Function to calculate and update property ratings
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  total_reviews INT;
BEGIN
  -- Compute the new average rating and count for the associated property
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0), 
    COUNT(*) 
  INTO 
    avg_rating, 
    total_reviews
  FROM reviews
  WHERE property_id = NEW.property_id;

  -- Update the properties table securely
  UPDATE properties
  SET 
    rating = avg_rating,
    review_count = total_reviews
  WHERE id = NEW.property_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function after any review is inserted, updated, or deleted
DROP TRIGGER IF EXISTS trigger_update_property_rating ON reviews;

CREATE TRIGGER trigger_update_property_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_property_rating();
