/**
 * StreamVault — Demo Data Seeder
 * Run: node seed.js  (from /backend directory)
 * WARNING: Drops and re-creates all rows. Dev only.
 */

require('dotenv').config()
const { sequelize, User, Video, Comment, Like, Subscription } = require('./models')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')

const USERS = [
  { username: 'techwave',   email: 'techwave@demo.com',   bio: 'Tech tutorials and reviews 🚀' },
  { username: 'codeforge',  email: 'codeforge@demo.com',  bio: 'Full-stack dev content every week' },
  { username: 'pixelcraft', email: 'pixelcraft@demo.com', bio: 'Design, UI/UX, Figma deep-dives' },
  { username: 'gamelogic',  email: 'gamelogic@demo.com',  bio: 'Game dev with Unity & Godot' },
  { username: 'datastream', email: 'datastream@demo.com', bio: 'ML, data science, Python notebooks' },
]

const VIDEO_TEMPLATES = [
  { title: 'Building a REST API with Node.js and Express in 2025', description: 'Complete guide to building production-ready REST APIs using Node.js, Express, and best practices. We cover authentication, rate limiting, and deployment.', tags: ['nodejs', 'api', 'express', 'backend'] },
  { title: 'React 19 New Features — Every Hook Explained', description: 'Comprehensive walkthrough of React 19\'s new features including the new hooks, compiler improvements, and performance enhancements.', tags: ['react', 'javascript', 'frontend', 'hooks'] },
  { title: 'TailwindCSS Mastery — From Zero to Expert', description: 'Everything you need to know about TailwindCSS including responsive design, dark mode, animations, and custom themes.', tags: ['tailwind', 'css', 'design', 'frontend'] },
  { title: 'TypeScript in 2025 — The Definitive Guide', description: 'Master TypeScript with real-world examples. Covers generics, decorators, type utilities, and integration with popular frameworks.', tags: ['typescript', 'javascript', 'programming'] },
  { title: 'Docker & Kubernetes for Beginners', description: 'Start your DevOps journey with this hands-on guide to containerization and orchestration. Build, ship, and run anywhere.', tags: ['docker', 'kubernetes', 'devops', 'cloud'] },
  { title: 'System Design Interview — Scalable Architecture', description: 'Crack system design interviews with these proven patterns. We design Twitter, YouTube, and Uber from scratch.', tags: ['systemdesign', 'interview', 'architecture'] },
  { title: 'Figma to Code — Design Handoff in 2025', description: 'The complete workflow for converting Figma designs to production-ready React components using Figma Dev Mode and AI tools.', tags: ['figma', 'design', 'react', 'ui'] },
  { title: 'PostgreSQL Performance Tuning — Advanced Techniques', description: 'Deep dive into query optimization, indexing strategies, partitioning, and connection pooling for high-traffic applications.', tags: ['postgresql', 'database', 'performance', 'sql'] },
  { title: 'Next.js 15 App Router — Full Stack Project', description: 'Build a complete SaaS application with Next.js 15, Server Components, Server Actions, and Prisma ORM.', tags: ['nextjs', 'react', 'fullstack', 'saas'] },
  { title: 'Machine Learning with Python — Neural Networks From Scratch', description: 'Understand deep learning fundamentals by implementing a neural network without frameworks, then scale with PyTorch.', tags: ['machinelearning', 'python', 'ai', 'deeplearning'] },
  { title: 'Git & GitHub Advanced Workflows', description: 'Master advanced Git techniques: rebasing, bisect, worktrees, hooks, and team workflows that actually scale.', tags: ['git', 'github', 'devops', 'workflow'] },
  { title: 'CSS Grid & Flexbox — Layout Secrets Revealed', description: 'Stop fighting CSS layouts. Master Grid and Flexbox with visual demos and real-world component patterns.', tags: ['css', 'frontend', 'design', 'web'] },
  { title: 'GraphQL API Design — Best Practices', description: 'Build elegant, performant GraphQL APIs. Covers schema design, resolvers, subscriptions, and security.', tags: ['graphql', 'api', 'backend', 'nodejs'] },
  { title: 'Redis Caching Strategies for Node.js Apps', description: 'Boost your app performance 10x with smart Redis caching. Session storage, pub/sub, and distributed locking.', tags: ['redis', 'nodejs', 'performance', 'backend'] },
  { title: 'AWS Lambda & Serverless — Production Guide', description: 'Deploy scalable serverless applications on AWS. Cold starts, cost optimization, and monitoring strategies.', tags: ['aws', 'serverless', 'cloud', 'lambda'] },
]

async function seed() {
  try {
    console.log('🌱 Connecting to database...')
    await sequelize.authenticate()
    await sequelize.sync({ force: true })
    console.log('✅ Tables created\n')

    const password = await bcrypt.hash('password123', 12)
    console.log('👤 Creating users...')
    const users = await Promise.all(
      USERS.map(u => User.create({ ...u, password, id: uuidv4() }))
    )
    console.log(`   ✓ ${users.length} users created`)

    console.log('🎬 Creating videos...')
    const videos = []
    for (let i = 0; i < VIDEO_TEMPLATES.length; i++) {
      const tmpl = VIDEO_TEMPLATES[i]
      const owner = users[i % users.length]
      const v = await Video.create({
        id: uuidv4(),
        ...tmpl,
        video_url: `/uploads/videos/demo_${i + 1}.mp4`,
        thumbnail_url: `https://picsum.photos/seed/${i + 10}/1280/720`,
        user_id: owner.id,
        views: Math.floor(Math.random() * 500000),
        duration: Math.floor(Math.random() * 3600) + 120,
        likes_count: Math.floor(Math.random() * 5000),
        comments_count: Math.floor(Math.random() * 200),
        status: 'published',
      })
      videos.push(v)
    }
    console.log(`   ✓ ${videos.length} videos created`)

    console.log('💬 Creating comments...')
    const COMMENT_TEXTS = [
      'This is exactly what I needed, thank you!',
      'Amazing explanation, very clear and concise.',
      'Could you do a follow-up on advanced topics?',
      'Been watching for 2 hours straight, great content!',
      'Finally someone explains this properly.',
      'Subscribed! Keep up the great work.',
      'The code examples are really helpful.',
      'Watched this 3 times, still learning new things.',
    ]
    let commentCount = 0
    for (const video of videos.slice(0, 8)) {
      for (let j = 0; j < 3; j++) {
        const commenter = users[(j + 1) % users.length]
        await Comment.create({
          id: uuidv4(),
          user_id: commenter.id,
          video_id: video.id,
          comment_text: COMMENT_TEXTS[Math.floor(Math.random() * COMMENT_TEXTS.length)],
        })
        commentCount++
      }
    }
    console.log(`   ✓ ${commentCount} comments created`)

    console.log('❤️  Creating likes...')
    let likeCount = 0
    for (const video of videos) {
      for (const liker of users.slice(0, 3)) {
        if (liker.id !== video.user_id) {
          try {
            await Like.create({ id: uuidv4(), user_id: liker.id, video_id: video.id, type: 'like' })
            likeCount++
          } catch { /* skip dups */ }
        }
      }
    }
    console.log(`   ✓ ${likeCount} likes created`)

    console.log('🔔 Creating subscriptions...')
    let subCount = 0
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (i !== j && Math.random() > 0.4) {
          try {
            await Subscription.create({ id: uuidv4(), subscriber_id: users[i].id, channel_id: users[j].id })
            await users[j].increment('subscriber_count')
            subCount++
          } catch { /* skip dups */ }
        }
      }
    }
    console.log(`   ✓ ${subCount} subscriptions created`)

    console.log('\n🎉 Seed complete!\n')
    console.log('📋 Demo accounts (all use password: password123)')
    console.log('──────────────────────────────────────────────')
    users.forEach(u => console.log(`   ${u.email.padEnd(28)} → ${u.username}`))
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seed()
