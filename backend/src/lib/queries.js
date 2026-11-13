export const SQL = {
  profile: 'SELECT * FROM profile WHERE id = 1',
  social: 'SELECT * FROM social_links ORDER BY sort_order ASC, id ASC',
  publishedProjects: 'SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC, id ASC',
  allProjects: 'SELECT * FROM projects ORDER BY sort_order ASC, id ASC',
  projectBySlug: 'SELECT * FROM projects WHERE slug = ? AND published = 1',
  imagesBySlug: `SELECT i.* FROM project_images i
                 JOIN projects p ON p.id = i.project_id
                 WHERE p.slug = ? AND p.published = 1
                 ORDER BY i.sort_order ASC, i.id ASC`,
  projectById: 'SELECT * FROM projects WHERE id = ?',
  imagesByProjectId: 'SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC, id ASC',
  imageById: 'SELECT * FROM project_images WHERE id = ?',
  socialById: 'SELECT * FROM social_links WHERE id = ?',
};
