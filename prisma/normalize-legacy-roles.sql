UPDATE User
SET role = CASE role
  WHEN 'dentist' THEN 'DENTIST'
  WHEN 'staff' THEN 'STAFF'
  WHEN 'patient' THEN 'PATIENT'
  ELSE role
END;
