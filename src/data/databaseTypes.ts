import type { SimulatorDetailsData } from "@/components/interactiveLab/SimulatorDetails";

export type DatabaseMode = "sqlConcepts" | "nosqlConcepts" | "btree" | "types";

export type DatabaseCategory = "relational" | "document" | "keyValue" | "graph" | "columnar";

export interface DatabaseCategoryInfo {
  name: string;
  description: string;
  examples: string[];
  useCases: string[];
  scalingType: "vertical" | "horizontal" | "both";
}

export interface SqlQueryExample {
  title: string;
  description: string;
  query: string;
  resultDescription: string;
}

export interface NoSqlExample {
  title: string;
  type: "document" | "keyValue" | "graph";
  description: string;
  operation: string;
  resultDescription: string;
}

export const SQL_QUERY_EXAMPLES: SqlQueryExample[] = [
  {
    title: "SELECT + WHERE",
    description: "Retrieve specific rows from a table based on a condition.",
    query: "SELECT name, email\nFROM users\nWHERE age > 25;",
    resultDescription: "Returns name and email of users older than 25.",
  },
  {
    title: "JOIN",
    description: "Combine rows from two tables based on a related column.",
    query: "SELECT orders.id, users.name,\n       products.title\nFROM orders\nJOIN users ON orders.user_id = users.id\nJOIN products ON orders.product_id = products.id;",
    resultDescription: "Returns orders with user names and product titles.",
  },
  {
    title: "GROUP BY + Aggregation",
    description: "Group rows and apply aggregate functions like COUNT, SUM, AVG.",
    query: "SELECT department, COUNT(*) as total,\n       AVG(salary) as avg_salary\nFROM employees\nGROUP BY department\nHAVING AVG(salary) > 50000;",
    resultDescription: "Returns departments with more than 50k average salary.",
  },
  {
    title: "INSERT",
    description: "Add new rows into a table.",
    query: "INSERT INTO users (name, email, age)\nVALUES ('Alice', 'alice@mail.com', 28);",
    resultDescription: "Inserts a new user record into the users table.",
  },
  {
    title: "Subquery",
    description: "Nest a query inside another query for complex filtering.",
    query: "SELECT name FROM users\nWHERE id IN (\n  SELECT user_id FROM orders\n  WHERE total > 100\n);",
    resultDescription: "Returns users who placed orders over $100.",
  },
  {
    title: "Transaction",
    description: "Wrap multiple operations in an atomic transaction. All succeed or all roll back.",
    query: "BEGIN TRANSACTION;\n\nUPDATE accounts\n  SET balance = balance - 500\n  WHERE id = 1;\n\nUPDATE accounts\n  SET balance = balance + 500\n  WHERE id = 2;\n\nCOMMIT;",
    resultDescription: "Transfers $500 atomically — if any step fails, both are rolled back.",
  },
  {
    title: "SELECT FOR UPDATE",
    description: "Lock rows for update to prevent concurrent modifications (pessimistic locking).",
    query: "BEGIN;\n\nSELECT balance FROM accounts\n  WHERE id = 1\n  FOR UPDATE;\n\n-- Row is now locked\n-- Other transactions wait\n\nUPDATE accounts\n  SET balance = balance - 100\n  WHERE id = 1;\n\nCOMMIT;",
    resultDescription: "Locks the row during read, preventing race conditions on concurrent updates.",
  },
  {
    title: "Window Functions",
    description: "Compute values across a set of rows related to the current row.",
    query: "SELECT name, department, salary,\n  RANK() OVER (\n    PARTITION BY department\n    ORDER BY salary DESC\n  ) as dept_rank,\n  AVG(salary) OVER (\n    PARTITION BY department\n  ) as dept_avg\nFROM employees;",
    resultDescription: "Ranks employees within each department and shows department average.",
  },
  {
    title: "CTE + Recursive",
    description: "Common Table Expressions for readable complex queries and recursive hierarchies.",
    query: "WITH RECURSIVE org_tree AS (\n  SELECT id, name, manager_id, 1 as level\n  FROM employees\n  WHERE manager_id IS NULL\n\n  UNION ALL\n\n  SELECT e.id, e.name, e.manager_id,\n         t.level + 1\n  FROM employees e\n  JOIN org_tree t ON e.manager_id = t.id\n)\nSELECT * FROM org_tree\nORDER BY level;",
    resultDescription: "Traverses the entire org hierarchy starting from the CEO.",
  },
];

export const NOSQL_EXAMPLES: NoSqlExample[] = [
  {
    title: "Document: Find",
    type: "document",
    description: "MongoDB-style document query. Find documents matching criteria.",
    operation: "db.users.find({\n  age: { $gt: 25 },\n  status: \"active\"\n}).sort({ name: 1 })",
    resultDescription: "Returns active users over 25, sorted by name.",
  },
  {
    title: "Document: Aggregate",
    type: "document",
    description: "MongoDB aggregation pipeline for complex transformations.",
    operation: "db.orders.aggregate([\n  { $match: { status: \"completed\" } },\n  { $group: {\n      _id: \"$category\",\n      total: { $sum: \"$amount\" }\n  }}\n])",
    resultDescription: "Groups completed orders by category and sums amounts.",
  },
  {
    title: "Key-Value: SET/GET",
    type: "keyValue",
    description: "Redis-style key-value operations for fast data access.",
    operation: "SET user:1001 '{\"name\":\"Alice\"}'\nGET user:1001\nSETEX session:abc 3600 '{\"userId\":1001}'",
    resultDescription: "Store/retrieve user data and expiring session tokens.",
  },
  {
    title: "Graph: MATCH",
    type: "graph",
    description: "Neo4j Cypher query to traverse relationships.",
    operation: "MATCH (u:User)-[:FOLLOWS]->(f:User)\nWHERE u.name = 'Alice'\nRETURN f.name, f.email",
    resultDescription: "Finds all users that Alice follows in the social graph.",
  },
  {
    title: "Graph: Path Query",
    type: "graph",
    description: "Find the shortest path between two nodes.",
    operation: "MATCH path = shortestPath(\n  (a:User {name:'Alice'})\n  -[:KNOWS*]->  \n  (b:User {name:'Bob'})\n)\nRETURN path",
    resultDescription: "Finds the shortest connection between Alice and Bob.",
  },
];

export const DATABASE_CATEGORIES: Record<DatabaseCategory, DatabaseCategoryInfo> = {
  relational: {
    name: "Relational Databases",
    description: "Structured data organized in tables with rows and columns, enforcing ACID properties and relationships through foreign keys.",
    examples: ["PostgreSQL", "MySQL", "Oracle", "SQL Server"],
    useCases: ["Financial transactions", "E-commerce systems", "ERP systems", "CRM platforms"],
    scalingType: "vertical",
  },
  document: {
    name: "Document Databases",
    description: "Store semi-structured data as documents (JSON, BSON) with flexible schemas, optimized for hierarchical data.",
    examples: ["MongoDB", "CouchDB", "Firestore", "DynamoDB"],
    useCases: ["Content management", "User profiles", "Catalogs", "Real-time analytics"],
    scalingType: "horizontal",
  },
  keyValue: {
    name: "Key-Value Stores",
    description: "Simple data model mapping keys to values, optimized for high-speed read/write operations and caching.",
    examples: ["Redis", "Memcached", "Amazon DynamoDB", "Riak"],
    useCases: ["Session storage", "Caching", "Real-time leaderboards", "Configuration management"],
    scalingType: "horizontal",
  },
  graph: {
    name: "Graph Databases",
    description: "Store entities (nodes) and relationships (edges) as first-class citizens, optimized for traversing complex relationships.",
    examples: ["Neo4j", "Amazon Neptune", "ArangoDB", "Dgraph"],
    useCases: ["Social networks", "Recommendation engines", "Fraud detection", "Knowledge graphs"],
    scalingType: "horizontal",
  },
  columnar: {
    name: "Columnar Databases",
    description: "Store data by columns rather than rows, enabling efficient compression and analytical queries on large datasets.",
    examples: ["ClickHouse", "Apache Cassandra", "Amazon Redshift", "BigQuery"],
    useCases: ["Data warehousing", "Business intelligence", "Time-series analytics", "OLAP workloads"],
    scalingType: "horizontal",
  },
};

export const DATABASE_MODE_INFO: Record<DatabaseMode, SimulatorDetailsData> = {
  sqlConcepts: {
    name: "SQL Concepts",
    description: "SQL (Structured Query Language) is the standard language for managing relational databases. It provides powerful operations for querying, inserting, updating, and deleting data with precise control over relationships and transactions.",
    badges: [
      { label: "Language", value: "SQL (Structured Query Language)" },
      { label: "Transactions", value: "ACID guaranteed" },
      { label: "Paradigm", value: "Declarative" },
    ],
    lists: [
      {
        title: "Core SQL Operations",
        items: ["SELECT: query data from tables", "JOIN: combine related tables", "WHERE: filter rows by condition", "GROUP BY: aggregate data", "INSERT/UPDATE/DELETE: modify data"],
        variant: "info",
      },
    ],
  },
  nosqlConcepts: {
    name: "NoSQL Concepts",
    description: "NoSQL databases provide flexible data models optimized for specific use cases: documents for hierarchical data, key-value for speed, and graphs for relationships.",
    badges: [
      { label: "Schema", value: "Flexible" },
      { label: "Scaling", value: "Horizontal" },
      { label: "Consistency", value: "Eventual (BASE)" },
    ],
    lists: [
      {
        title: "NoSQL Data Models",
        items: ["Document: JSON-like flexible documents", "Key-Value: fast lookups by key", "Graph: nodes and edges for relationships", "Column: columnar storage for analytics"],
        variant: "info",
      },
    ],
  },
  btree: {
    name: "B-Tree Indexing",
    description: "B-trees are self-balancing tree data structures that maintain sorted data and enable efficient search, insertion, and deletion operations in O(log n) time.",
    badges: [
      { label: "Search", value: "O(log n)" },
      { label: "Insert", value: "O(log n)" },
      { label: "Fanout", value: "High branching factor" },
    ],
    lists: [
      {
        title: "B-Tree Properties",
        items: ["All leaves at the same level", "Multiple keys per node", "Self-balancing through splits", "Used in database indexes"],
        variant: "info",
      },
    ],
  },
  types: {
    name: "Database Categories",
    description: "Modern databases are categorized by their data model: relational, document, key-value, graph, and columnar. Each is optimized for specific use cases.",
    badges: [
      { label: "Categories", value: "5 main types" },
      { label: "Scaling", value: "Vertical vs Horizontal" },
    ],
    lists: [
      {
        title: "Choosing a Database",
        items: ["Structured data + transactions → Relational", "Flexible schema + rapid dev → Document", "Speed + caching → Key-Value", "Relationships → Graph", "Analytics → Columnar"],
        variant: "info",
      },
    ],
  },
};
