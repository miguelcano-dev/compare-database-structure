import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ComparisonResult } from '@/types/comparison';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-tomorrow.css';

interface SyntaxHighlighterProps {
  results: ComparisonResult;
}

export function SyntaxHighlighter({ results }: SyntaxHighlighterProps) {
  const [sqlDiff, setSqlDiff] = useState<string>('');
  
  useEffect(() => {
    // Generate SQL diff from the comparison results
    let sql = '';
    
    // Generate SQL for table differences
    if (results.tableDiffs.length > 0) {
      sql += '-- TABLE DIFFERENCES\n\n';
      
      results.tableDiffs.forEach((diff) => {
        if (diff.sourceOnly) {
          sql += `-- Table '${diff.table}' exists in source but missing in target '${diff.targetDb}'\n`;
        } else if (diff.targetOnly) {
          sql += `-- Table '${diff.table}' exists in target '${diff.targetDb}' but missing in source\n`;
        }
        sql += '\n';
      });
    }
    
    // Generate SQL for column differences
    if (results.columnDiffs.length > 0) {
      sql += '-- COLUMN DIFFERENCES\n\n';
      
      results.columnDiffs.forEach((diff) => {
        sql += `-- ${diff.issue} in table '${diff.table}', column '${diff.column}', target '${diff.targetDb}'\n`;
        
        if (diff.source.type !== diff.target.type) {
          sql += `ALTER TABLE \`${diff.table}\` MODIFY COLUMN \`${diff.column}\` ${diff.source.type}; -- Source type: ${diff.source.type}, Target type: ${diff.target.type}\n`;
        }
        
        if (diff.source.nullable !== diff.target.nullable) {
          sql += `ALTER TABLE \`${diff.table}\` MODIFY COLUMN \`${diff.column}\` ${diff.source.type} ${diff.source.nullable ? 'NULL' : 'NOT NULL'}; -- Source nullable: ${diff.source.nullable}, Target nullable: ${diff.target.nullable}\n`;
        }
        
        sql += '\n';
      });
    }
    
    // Generate SQL for index differences
    if (results.indexDiffs.length > 0) {
      sql += '-- INDEX DIFFERENCES\n\n';
      
      results.indexDiffs.forEach((diff) => {
        sql += `-- ${diff.issue} in table '${diff.table}', index '${diff.indexName}', target '${diff.targetDb}'\n`;
        
        // For missing indexes in target, create them
        if (diff.issue.includes('missing in target')) {
          const columns = diff.source.columns?.map(col => `\`${col}\``).join(', ');
          const indexType = diff.source.type === 'PRIMARY' ? 'PRIMARY KEY' : 
                          diff.source.type === 'UNIQUE' ? 'UNIQUE INDEX' : 'INDEX';
          
          if (diff.source.type === 'PRIMARY') {
            sql += `ALTER TABLE \`${diff.table}\` ADD PRIMARY KEY (${columns});\n`;
          } else {
            sql += `ALTER TABLE \`${diff.table}\` ADD ${indexType} \`${diff.indexName}\` (${columns});\n`;
          }
        }
        
        // For indexes that exist in both but are different
        else if (diff.issue.includes('different structure')) {
          // Drop old index
          if (diff.target.type !== 'PRIMARY') {
            sql += `ALTER TABLE \`${diff.table}\` DROP INDEX \`${diff.indexName}\`;\n`;
          } else {
            sql += `ALTER TABLE \`${diff.table}\` DROP PRIMARY KEY;\n`;
          }
          
          // Create new index
          const columns = diff.source.columns?.map(col => `\`${col}\``).join(', ');
          const indexType = diff.source.type === 'PRIMARY' ? 'PRIMARY KEY' : 
                          diff.source.type === 'UNIQUE' ? 'UNIQUE INDEX' : 'INDEX';
          
          if (diff.source.type === 'PRIMARY') {
            sql += `ALTER TABLE \`${diff.table}\` ADD PRIMARY KEY (${columns});\n`;
          } else {
            sql += `ALTER TABLE \`${diff.table}\` ADD ${indexType} \`${diff.indexName}\` (${columns});\n`;
          }
        }
        
        sql += '\n';
      });
    }
    
    // Set a default message if no SQL was generated
    if (sql === '') {
      sql = '-- No SQL changes required; databases have matching structures';
    }
    
    setSqlDiff(sql);
    
    // Highlight the SQL syntax after updating the content
    setTimeout(() => {
      Prism.highlightAll();
    }, 0);
  }, [results]);

  return (
    <div className="rounded-md border overflow-hidden bg-slate-950">
      <ScrollArea className="h-[500px] w-full">
        <pre className="p-4">
          <code className="language-sql">{sqlDiff}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}