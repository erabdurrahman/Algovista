const mysql = require('mysql2/promise')

let pool = null
let isConnected = false

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'algovista',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Initial algorithms seed data
const initialAlgorithms = [
  {
    name: 'Bubble Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    description: 'Repeatedly compares adjacent elements and swaps them if they are in the wrong order.',
    slug: 'bubble-sort',
  },
  {
    name: 'Selection Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    description: 'Finds the minimum element from the unsorted part and places it at the beginning.',
    slug: 'selection-sort',
  },
  {
    name: 'Insertion Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    description: 'Builds the sorted array one element at a time by repeatedly inserting elements into their correct position.',
    slug: 'insertion-sort',
  },
  {
    name: 'Linear Search',
    category: 'Searching',
    difficulty: 'Easy',
    description: 'Sequentially checks each element of the list until a match is found or the list ends.',
    slug: 'linear-search',
  },
  {
    name: 'Binary Search',
    category: 'Searching',
    difficulty: 'Medium',
    description: 'Efficiently finds an item from a sorted list by repeatedly dividing the search interval in half.',
    slug: 'binary-search',
  },
  {
    name: 'Breadth First Search (BFS)',
    category: 'Graph',
    difficulty: 'Medium',
    description: 'Traverses or searches graph data structures level by level using a queue.',
    slug: 'bfs',
  },
  {
    name: 'Depth First Search (DFS)',
    category: 'Graph',
    difficulty: 'Medium',
    description: 'Explores as far as possible along each branch before backtracking using a stack or recursion.',
    slug: 'dfs',
  },
]

const initDB = async () => {
  try {
    // 1. Check server connection and create database if not exists
    const serverConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    })

    await serverConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`)
    await serverConnection.end()

    // 2. Initialize connection pool targeting the database
    pool = mysql.createPool(dbConfig)

    // 3. Create Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 4. Create Algorithms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS algorithms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        difficulty VARCHAR(30) NOT NULL,
        description TEXT,
        slug VARCHAR(50) UNIQUE NOT NULL
      );
    `)

    // 5. Create Progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        algorithm_id INT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        practice_count INT DEFAULT 0,
        last_practiced TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE(user_id, algorithm_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (algorithm_id) REFERENCES algorithms(id) ON DELETE CASCADE
      );
    `)

    // 6. Seed initial algorithms
    for (const algo of initialAlgorithms) {
      await pool.query(
        `INSERT INTO algorithms (name, category, difficulty, description, slug)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), difficulty=VALUES(difficulty), description=VALUES(description);`,
        [algo.name, algo.category, algo.difficulty, algo.description, algo.slug],
      )
    }

    isConnected = true
    console.log('✅ MySQL Database connected and initialized successfully.')
    return true
  } catch (error) {
    isConnected = false
    console.warn('⚠️ [Database Notice] MySQL connection failed:', error.message)
    console.warn('💡 If using XAMPP, ensure MySQL is started in the XAMPP Control Panel.')
    return false
  }
}

const query = async (sql, params = []) => {
  if (!pool) {
    throw new Error('Database is not connected. Please ensure MySQL is running.')
  }
  const [rows] = await pool.query(sql, params)
  return rows
}

const getIsConnected = () => isConnected

module.exports = {
  initDB,
  query,
  getIsConnected,
}
