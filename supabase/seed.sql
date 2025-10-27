-- Insert predefined courses
INSERT INTO courses (course_number, course_name, session_type) VALUES
(1, 'The art science of facial aesthetics', 'Theoretical and practical'),
(2, 'Skin structure and function', 'Theory'),
(3, 'Skin typing', 'Theoretical and practical'),
(4, 'Common skin condition', 'Theory'),
(5, 'Hair and nail structure and growth', 'Theory'),
(6, 'Skin cosmetics', 'Theory'),
(7, 'Hair cosmetics', 'Theory'),
(8, 'Hair analyzer', 'Practical'),
(9, 'Skin analyzer', 'Practical'),
(10, 'Hydrafacial', 'Practical'),
(11, 'Microneedling', 'Practical'),
(12, 'PRP(platelet-rich-plasma)', 'Practical'),
(13, 'Chemical peel', 'Practical'),
(14, 'RF (Radio frequency)', 'Practical'),
(15, 'DPN(Dermatosis papulosis nigra) removal', 'Practical'),
(16, 'Laser( hair removal)', 'Practical')
ON CONFLICT (course_number) DO NOTHING;

