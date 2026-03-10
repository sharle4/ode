-- Insert Dummy Authors
-- Insert Dummy Authors
insert into public.authors (id, name, slug, biography) values
('a1111111-1111-1111-1111-111111111111', 'Charles Baudelaire', 'charles-baudelaire', 'Poète maudit français.'),
('a2222222-2222-2222-2222-222222222222', 'Arthur Rimbaud', 'arthur-rimbaud', 'L''homme aux semelles de vent.');

-- Insert Dummy Collections
insert into public.collections (id, title, slug, publication_year) values
('c1111111-1111-1111-1111-111111111111', 'Les Fleurs du Mal', 'les-fleurs-du-mal-1857', 1857),
('c2222222-2222-2222-2222-222222222222', 'Illuminations', 'illuminations-1886', 1886);

insert into public.collection_authors (collection_id, author_id) values
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'),
('c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222');

-- Insert Dummy Poems
insert into public.poems (id, title, slug, collection_id, section_title, content, normalized_text, hub_page_id) values
('d1111111-1111-1111-1111-111111111111', 'L''Albatros', 'charles-baudelaire-l-albatros', 'c1111111-1111-1111-1111-111111111111', 'Spleen et Idéal', '{"stanzas": [["Souvent, pour s''amuser, les hommes d''équipage", "Prennent des albatros, vastes oiseaux des mers,", "Qui suivent, indolents compagnons de voyage,", "Le navire glissant sur les gouffres amers."], ["À peine les ont-ils déposés sur les planches,", "Que ces rois de l''azur, maladroits et honteux,", "Laissent piteusement leurs grandes ailes blanches", "Comme des avirons traîner à côté d''eux."]]}', 'Souvent pour s''amuser les hommes d''équipage...', 1),
('d2222222-2222-2222-2222-222222222222', 'Aube', 'arthur-rimbaud-aube', 'c2222222-2222-2222-2222-222222222222', null, '{"stanzas": [["J''ai embrassé l''aube d''été.", "Rien ne bougeait encore au front des palais. L''eau était morte. Les camps d''ombres ne quittaient pas la route du bois. J''ai marché, réveillant les haleines vives et tièdes, et les pierreries regardèrent, et les ailes se levèrent sans bruit."]]}', 'J''ai embrassé l''aube d''été...', 2);

insert into public.poem_authors (poem_id, author_id) values
('d1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'),
('d2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222');

-- Add some categories
insert into public.categories (id, name, description) values 
('e1111111-1111-1111-1111-111111111111', 'Mélancolie', 'Theme: Mélancolie'),
('e2222222-2222-2222-2222-222222222222', 'Sonnet', 'Form: Sonnet');

insert into public.poem_categories (poem_id, category_id) values
('d1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111');
