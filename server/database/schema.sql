-- Algovista Database Schema
-- Run this script in MySQL / phpMyAdmin / MySQL Workbench to initialize the database

CREATE DATABASE IF NOT EXISTS algovista;
USE algovista;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Algorithms Table
CREATE TABLE IF NOT EXISTS algorithms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(30) NOT NULL,
    description TEXT,
    slug VARCHAR(50) UNIQUE NOT NULL
);

-- 3. Progress Table
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

-- Insert Default 7 Algorithms
INSERT INTO algorithms (name, category, difficulty, description, slug) VALUES
('Bubble Sort', 'Sorting', 'Easy', 'Repeatedly compares adjacent elements and swaps them if they are in the wrong order.', 'bubble-sort'),
('Selection Sort', 'Sorting', 'Easy', 'Finds the minimum element from the unsorted part and places it at the beginning.', 'selection-sort'),
('Insertion Sort', 'Sorting', 'Easy', 'Builds the final sorted array one item at a time by repeatedly inserting elements into their correct position.', 'insertion-sort'),
('Linear Search', 'Searching', 'Easy', 'Sequentially checks each element of the list until a match is found or the whole list has been searched.', 'linear-search'),
('Binary Search', 'Searching', 'Medium', 'Efficiently finds an item from a sorted list by repeatedly halving the search interval.', 'binary-search'),
('Breadth First Search (BFS)', 'Graph', 'Medium', 'Traverses or searches graph data structures level by level using a queue.', 'bfs'),
('Depth First Search (DFS)', 'Graph', 'Medium', 'Explores as far as possible along each branch before backtracking using a stack/recursion.', 'dfs')
ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), difficulty=VALUES(difficulty), description=VALUES(description);
