UPDATE profile SET name='Test', bio='Test bio', email='test@example.com' WHERE id=1;
INSERT INTO social_links (platform, url, sort_order) VALUES ('Instagram','https://instagram.com/test',1);
INSERT INTO projects (slug, title, description, toolkit, sort_order)
VALUES ('test-project','Test Project','Short description','["Blender","After Effects"]',1);