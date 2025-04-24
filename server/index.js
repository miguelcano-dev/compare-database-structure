import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Decrypt sensitive data from requests
 * This is a simple base64 decoding for demonstration purposes
 * In a real application, use a proper decryption library
 */
function decryptSensitiveData(data) {
  if (!data) return data;
  
  const result = { ...data };
  
  if (result.password && typeof result.password === 'string') {
    try {
      // Simple Base64 decoding with Buffer
      result.password = Buffer.from(result.password, 'base64').toString('utf-8');
    } catch (error) {
      console.warn('Error decrypting password, using as-is');
    }
  }
  
  return result;
}

// Test connection endpoint
app.post('/test-connection', async (req, res) => {
  const connectionData = decryptSensitiveData(req.body);
  
  if (!connectionData || !connectionData.host || !connectionData.database) {
    return res.status(400).json({ 
      message: 'Invalid connection data. Please provide all required fields.' 
    });
  }
  
  let connection;
  try {
    // Attempt to create a connection
    connection = await createConnection({
      host: connectionData.host,
      port: connectionData.port,
      user: connectionData.user,
      password: connectionData.password,
      database: connectionData.database,
    });
    
    // If we got here, connection was successful
    await connection.end();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to connect to database' 
    });
  }
});

// Database comparison endpoint
app.post('/compare', async (req, res) => {
  let source = decryptSensitiveData(req.body.source);
  let targets = Array.isArray(req.body.targets) 
    ? req.body.targets.map(target => decryptSensitiveData(target))
    : [];
  
  if (!source || !targets || targets.length === 0) {
    return res.status(400).json({ 
      message: 'Invalid request. Please provide source and target connections.' 
    });
  }
  
  try {
    // Perform the actual comparison
    const result = await compareDbStructures(source, targets);
    res.json(result);
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ 
      message: error.message || 'Error comparing database structures' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Compare database structures between a source and multiple targets
 */
async function compareDbStructures(source, targets) {
  // Initialize result structure
  const result = {
    columnDiffs: [],
    tableDiffs: [],
    indexDiffs: [],
    summary: {
      totalTables: 0,
      tablesWithDiffs: 0,
      tablesOnlyInSource: 0,
      tablesOnlyInTargets: 0,
      columnsWithDiffs: 0,
      indexesWithDiffs: 0,
    },
  };
  
  try {
    // Connect to source database
    const sourceConn = await createConnection(source);
    
    // Get source tables
    const sourceTables = await getTables(sourceConn, source.database);
    result.summary.totalTables = sourceTables.length;
    
    // Process each target database
    for (const target of targets) {
      try {
        // Connect to target database
        const targetConn = await createConnection(target);
        
        // Get target tables
        const targetTables = await getTables(targetConn, target.database);
        
        // Compare tables
        await compareTables(sourceConn, targetConn, source, target, sourceTables, targetTables, result);
        
        // Close target connection
        await targetConn.end();
      } catch (targetError) {
        console.error(`Error connecting to target database ${target.name}:`, targetError);
        throw new Error(`Failed to connect to target database ${target.name}: ${targetError.message}`);
      }
    }
    
    // Close source connection
    await sourceConn.end();
    
    return result;
  } catch (error) {
    console.error('Error in database comparison:', error);
    throw error;
  }
}

/**
 * Create a database connection
 */
async function createConnection(config) {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    });
    
    return connection;
  } catch (error) {
    console.error(`Failed to connect to database at ${config.host}:${config.port}/${config.database}`, error);
    throw error;
  }
}

/**
 * Get all tables in a database
 */
async function getTables(connection, database) {
  const [rows] = await connection.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = ? 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `, [database]);
  
  return rows.map(row => row.table_name);
}

/**
 * Compare tables between source and target
 */
async function compareTables(sourceConn, targetConn, source, target, sourceTables, targetTables, result) {
  // Find tables only in source
  const tablesOnlyInSource = sourceTables.filter(table => !targetTables.includes(table));
  
  // Find tables only in target
  const tablesOnlyInTarget = targetTables.filter(table => !sourceTables.includes(table));
  
  // Add table differences
  tablesOnlyInSource.forEach(table => {
    result.tableDiffs.push({
      table,
      sourceOnly: true,
      targetOnly: false,
      targetDb: target.name,
    });
  });
  
  tablesOnlyInTarget.forEach(table => {
    result.tableDiffs.push({
      table,
      sourceOnly: false,
      targetOnly: true,
      targetDb: target.name,
    });
  });
  
  // Update summary
  result.summary.tablesOnlyInSource += tablesOnlyInSource.length;
  result.summary.tablesOnlyInTargets += tablesOnlyInTarget.length;
  
  // Find common tables
  const commonTables = sourceTables.filter(table => targetTables.includes(table));
  
  // Compare columns for common tables
  for (const table of commonTables) {
    const hasColumnDiffs = await compareColumns(
      sourceConn, 
      targetConn, 
      source.database, 
      target.database, 
      table, 
      target.name, 
      result
    );
    
    const hasIndexDiffs = await compareIndexes(
      sourceConn, 
      targetConn, 
      source.database, 
      target.database, 
      table, 
      target.name, 
      result
    );
    
    if (hasColumnDiffs || hasIndexDiffs) {
      result.summary.tablesWithDiffs++;
    }
  }
}

/**
 * Compare columns between source and target tables
 */
async function compareColumns(sourceConn, targetConn, sourceDb, targetDb, table, targetName, result) {
  // Get columns from source
  const [sourceColumns] = await sourceConn.query(`
    SELECT 
      column_name,
      column_type,
      is_nullable,
      column_default,
      extra
    FROM 
      information_schema.columns
    WHERE 
      table_schema = ? 
      AND table_name = ?
    ORDER BY ordinal_position
  `, [sourceDb, table]);
  
  // Get columns from target
  const [targetColumns] = await targetConn.query(`
    SELECT 
      column_name,
      column_type,
      is_nullable,
      column_default,
      extra
    FROM 
      information_schema.columns
    WHERE 
      table_schema = ? 
      AND table_name = ?
    ORDER BY ordinal_position
  `, [targetDb, table]);
  
  // Convert to maps for easier comparison
  const sourceColumnsMap = new Map(
    sourceColumns.map(col => [
      col.column_name, 
      {
        type: col.column_type,
        nullable: col.is_nullable === 'YES',
        default: col.column_default,
        extra: col.extra,
      }
    ])
  );
  
  const targetColumnsMap = new Map(
    targetColumns.map(col => [
      col.column_name, 
      {
        type: col.column_type,
        nullable: col.is_nullable === 'YES',
        default: col.column_default,
        extra: col.extra,
      }
    ])
  );
  
  let hasDifferences = false;
  
  // Find columns only in source
  for (const [columnName, sourceColDetails] of sourceColumnsMap) {
    if (!targetColumnsMap.has(columnName)) {
      // Column exists in source but not in target
      result.columnDiffs.push({
        table,
        column: columnName,
        source: sourceColDetails,
        target: {},
        issue: `Column exists in source but missing in target`,
        targetDb: targetName,
      });
      
      hasDifferences = true;
      result.summary.columnsWithDiffs++;
    } else {
      // Column exists in both, compare details
      const targetColDetails = targetColumnsMap.get(columnName);
      
      // Check for differences
      if (
        sourceColDetails.type !== targetColDetails.type ||
        sourceColDetails.nullable !== targetColDetails.nullable ||
        sourceColDetails.extra !== targetColDetails.extra ||
        // Handle default values that might be null or different formats
        ((sourceColDetails.default === null) !== (targetColDetails.default === null) ||
         (sourceColDetails.default !== null && 
          targetColDetails.default !== null && 
          String(sourceColDetails.default) !== String(targetColDetails.default)))
      ) {
        // Found differences
        const issues = [];
        
        if (sourceColDetails.type !== targetColDetails.type) {
          issues.push(`type mismatch (${sourceColDetails.type} vs ${targetColDetails.type})`);
        }
        
        if (sourceColDetails.nullable !== targetColDetails.nullable) {
          issues.push(`nullability mismatch (${sourceColDetails.nullable ? 'NULL' : 'NOT NULL'} vs ${targetColDetails.nullable ? 'NULL' : 'NOT NULL'})`);
        }
        
        if (sourceColDetails.extra !== targetColDetails.extra) {
          issues.push(`extra attributes mismatch (${sourceColDetails.extra || 'none'} vs ${targetColDetails.extra || 'none'})`);
        }
        
        if ((sourceColDetails.default === null) !== (targetColDetails.default === null) ||
            (sourceColDetails.default !== null && 
             targetColDetails.default !== null && 
             String(sourceColDetails.default) !== String(targetColDetails.default))) {
          issues.push(`default value mismatch (${sourceColDetails.default || 'NULL'} vs ${targetColDetails.default || 'NULL'})`);
        }
        
        result.columnDiffs.push({
          table,
          column: columnName,
          source: sourceColDetails,
          target: targetColDetails,
          issue: `Column ${issues.join(', ')}`,
          targetDb: targetName,
        });
        
        hasDifferences = true;
        result.summary.columnsWithDiffs++;
      }
    }
  }
  
  // Find columns only in target
  for (const [columnName, targetColDetails] of targetColumnsMap) {
    if (!sourceColumnsMap.has(columnName)) {
      // Column exists in target but not in source
      result.columnDiffs.push({
        table,
        column: columnName,
        source: {},
        target: targetColDetails,
        issue: `Column exists in target but missing in source`,
        targetDb: targetName,
      });
      
      hasDifferences = true;
      result.summary.columnsWithDiffs++;
    }
  }
  
  return hasDifferences;
}

/**
 * Compare indexes between source and target tables
 */
async function compareIndexes(sourceConn, targetConn, sourceDb, targetDb, table, targetName, result) {
  // Get indexes from source
  const [sourceIndexes] = await sourceConn.query(`
    SELECT 
      index_name,
      group_concat(column_name order by seq_in_index) as columns,
      index_type,
      non_unique
    FROM 
      information_schema.statistics
    WHERE 
      table_schema = ? 
      AND table_name = ?
    GROUP BY
      index_name
    ORDER BY
      index_name
  `, [sourceDb, table]);
  
  // Get indexes from target
  const [targetIndexes] = await targetConn.query(`
    SELECT 
      index_name,
      group_concat(column_name order by seq_in_index) as columns,
      index_type,
      non_unique
    FROM 
      information_schema.statistics
    WHERE 
      table_schema = ? 
      AND table_name = ?
    GROUP BY
      index_name
    ORDER BY
      index_name
  `, [targetDb, table]);
  
  // Convert to maps for easier comparison
  const sourceIndexMap = new Map(
    sourceIndexes.map(idx => [
      idx.index_name, 
      {
        columns: idx.columns.split(','),
        type: idx.index_name === 'PRIMARY' ? 'PRIMARY' : (idx.non_unique === 0 ? 'UNIQUE' : 'INDEX'),
        indexType: idx.index_type,
      }
    ])
  );
  
  const targetIndexMap = new Map(
    targetIndexes.map(idx => [
      idx.index_name, 
      {
        columns: idx.columns.split(','),
        type: idx.index_name === 'PRIMARY' ? 'PRIMARY' : (idx.non_unique === 0 ? 'UNIQUE' : 'INDEX'),
        indexType: idx.index_type,
      }
    ])
  );
  
  let hasDifferences = false;
  
  // Find indexes only in source
  for (const [indexName, sourceIdxDetails] of sourceIndexMap) {
    if (!targetIndexMap.has(indexName)) {
      // Index exists in source but not in target
      result.indexDiffs.push({
        table,
        indexName,
        source: {
          columns: sourceIdxDetails.columns,
          type: sourceIdxDetails.type,
        },
        target: {},
        issue: `Index exists in source but missing in target`,
        targetDb: targetName,
      });
      
      hasDifferences = true;
      result.summary.indexesWithDiffs++;
    } else {
      // Index exists in both, compare details
      const targetIdxDetails = targetIndexMap.get(indexName);
      
      // Check for differences in columns or type
      const sourceColumnsStr = sourceIdxDetails.columns.join(',');
      const targetColumnsStr = targetIdxDetails.columns.join(',');
      
      if (
        sourceColumnsStr !== targetColumnsStr ||
        sourceIdxDetails.type !== targetIdxDetails.type
      ) {
        // Found differences
        const issues = [];
        
        if (sourceColumnsStr !== targetColumnsStr) {
          issues.push(`columns mismatch (${sourceColumnsStr} vs ${targetColumnsStr})`);
        }
        
        if (sourceIdxDetails.type !== targetIdxDetails.type) {
          issues.push(`type mismatch (${sourceIdxDetails.type} vs ${targetIdxDetails.type})`);
        }
        
        result.indexDiffs.push({
          table,
          indexName,
          source: {
            columns: sourceIdxDetails.columns,
            type: sourceIdxDetails.type,
          },
          target: {
            columns: targetIdxDetails.columns,
            type: targetIdxDetails.type,
          },
          issue: `Index ${issues.join(', ')}`,
          targetDb: targetName,
        });
        
        hasDifferences = true;
        result.summary.indexesWithDiffs++;
      }
    }
  }
  
  // Find indexes only in target
  for (const [indexName, targetIdxDetails] of targetIndexMap) {
    if (!sourceIndexMap.has(indexName)) {
      // Index exists in target but not in source
      result.indexDiffs.push({
        table,
        indexName,
        source: {},
        target: {
          columns: targetIdxDetails.columns,
          type: targetIdxDetails.type,
        },
        issue: `Index exists in target but missing in source`,
        targetDb: targetName,
      });
      
      hasDifferences = true;
      result.summary.indexesWithDiffs++;
    }
  }
  
  return hasDifferences;
}