import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function main() {
  // Create table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id          VARCHAR(36) PRIMARY KEY,
      title       TEXT NOT NULL,
      slug        TEXT UNIQUE NOT NULL,
      content     TEXT NOT NULL,
      excerpt     TEXT NOT NULL,
      coverImage  TEXT,
      publishedAt TIMESTAMPTZ,
      updatedAt   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      createdAt   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      authorId    TEXT NOT NULL,
      status      TEXT NOT NULL,
      tags        TEXT[]
    );
  `;

  // Dummy posts
  const posts = [
    {
      id: '1',
      title: 'Welcome to My Blog',
      slug: 'welcome-to-my-blog',
      content: '<h1>Welcome!</h1><p>This is a <strong>rich</strong> post created with a WYSIWYG editor. Enjoy reading!</p>',
      excerpt: 'This is a rich post created with a WYSIWYG editor.',
      coverImage: null,
      publishedAt: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      authorId: 'system',
      status: 'published',
      tags: ['welcome', 'intro']
    },
    {
      id: '2',
      title: 'Getting Started with Blogging',
      slug: 'getting-started-with-blogging',
      content: '<h2>Getting Started</h2><ul><li>Choose a topic</li><li>Write your thoughts</li><li>Publish!</li></ul>',
      excerpt: 'A quick guide to start your blogging journey.',
      coverImage: null,
      publishedAt: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      authorId: 'system',
      status: 'published',
      tags: ['guide', 'blogging']
    },
    {
      id: '3',
      title: 'Tips for Writing Engaging Content',
      slug: 'tips-for-writing-engaging-content',
      content: '<p>Use <em>headings</em>, <strong>lists</strong>, and <a href="#">links</a> to make your content more engaging!</p>',
      excerpt: 'Make your content more engaging with these tips.',
      coverImage: null,
      publishedAt: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      authorId: 'system',
      status: 'published',
      tags: ['tips', 'content']
    }
  ];

  // Insert posts
  for (const post of posts) {
    await sql`
      INSERT INTO posts (
        id, title, slug, content, excerpt, coverImage, publishedAt, updatedAt, createdAt, authorId, status, tags
      ) VALUES (
        ${post.id}, ${post.title}, ${post.slug}, ${post.content}, ${post.excerpt}, ${post.coverImage},
        ${post.publishedAt}, ${post.updatedAt}, ${post.createdAt}, ${post.authorId}, ${post.status}, ${post.tags}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  await sql.end();
  console.log('Database seeded!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
