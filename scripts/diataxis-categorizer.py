#!/usr/bin/env python3
"""
Simple ClickHouse Documentation Diataxis Categorizer

Categorizes docs using file structure first, then content analysis as fallback.
"""

import argparse
import re
import yaml
from pathlib import Path
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class CategoryResult:
    file_path: Path
    title: str
    category: str
    reason: str

class DiataxisCategorizer:
    # Directory patterns for each category
    CATEGORY_PATHS = {
        'tutorial': ['/tutorial/', '/getting-started/', '/quick-start/', '/quickstart/'],
        'how-to': ['/how-to/', '/guides/', '/cookbook/', '/examples/', '/deployment/', 
                  '/installation/', '/configuration/', '/migration/', '/optimization/', 
                  '/troubleshooting/', '/administration/', '/operations/', '/management/'],
        'reference': ['/sql-reference/', '/functions/', '/engines/', '/formats/', 
                     '/system-tables/', '/interfaces/', '/api/', '/reference/', 
                     '/syntax/', '/commands/', '/operators/', '/settings/'],
        'explanation': ['/concepts/', '/architecture/', '/theory/', '/background/', 
                       '/understanding/', '/overview/', '/principles/', '/design/', 
                       '/best-practices/', '/internals/', '/fundamentals/']
    }
    
    # Skip these directories
    SKIP_DIRS = {'_clients', '_placeholders', '_snippets', 'about-us', 'example-datasets', 'whats-new'}
    
    # SQL commands that indicate reference material
    SQL_COMMANDS = ['select', 'insert', 'update', 'delete', 'create', 'drop', 'alter', 
                   'truncate', 'show', 'describe', 'explain', 'grant', 'revoke',
                   'backup', 'restore', 'optimize', 'check', 'repair']
    
    def __init__(self, docs_path: Path):
        self.docs_path = Path(docs_path)
    
    def extract_frontmatter(self, content: str) -> Tuple[Dict, str]:
        """Extract YAML frontmatter and return (frontmatter_dict, content_without_frontmatter)"""
        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if match:
            try:
                frontmatter = yaml.safe_load(match.group(1)) or {}
                return frontmatter, content[match.end():]
            except yaml.YAMLError:
                pass
        return {}, content
    
    def get_title(self, content: str, frontmatter: Dict, file_path: Path) -> str:
        """Extract document title from various sources"""
        # Priority: frontmatter title > frontmatter sidebar_label > first H1 > filename
        for key in ['title', 'sidebar_label']:
            if key in frontmatter:
                return frontmatter[key]
        
        h1_match = re.search(r'^#\s+(.+)', content, re.MULTILINE)
        if h1_match:
            return h1_match.group(1).strip()
        
        return file_path.stem.replace('-', ' ').replace('_', ' ').title()
    
    def categorize_by_path(self, file_path: Path) -> Tuple[str, str]:
        """Try to categorize based on file path"""
        path_str = str(file_path).lower()
        
        for category, patterns in self.CATEGORY_PATHS.items():
            for pattern in patterns:
                if pattern in path_str:
                    return category, f"Located in {category} directory"
        
        return None, None
    
    def categorize_by_content(self, file_path: Path, title: str, content: str) -> Tuple[str, str]:
        """Categorize based on content when path doesn't provide clear signal"""
        title_lower = title.lower()
        filename = file_path.name.lower()
        
        # Overview/Index pages
        if (filename in ['index.md', 'readme.md', '_index.md', 'overview.md'] or
            'table of contents' in title_lower or
            title_lower in ['overview', 'introduction', 'contents']):
            return 'overview', f"Index/overview file: {filename}"
        
        # Many links + short content = overview
        link_count = len(re.findall(r'\[.*?\]\([^)]+\)', content))
        if link_count > 8 and len(content.split()) < 1000:
            return 'overview', f"Many links ({link_count}) with short content"
        
        # Tutorial indicators
        if any(keyword in title_lower for keyword in ['tutorial', 'getting started', 'quick start', 'your first']):
            return 'tutorial', "Tutorial keywords in title"
        
        # How-to indicators
        if ('how to' in title_lower or
            any(title_lower.startswith(word) for word in ['configure', 'setup', 'install', 'deploy', 'optimize']) or
            any(word in title_lower for word in ['guide', 'migration', 'troubleshoot'])):
            return 'how-to', "How-to patterns in title"
        
        # Step-by-step content
        step_patterns = len(re.findall(r'\b(step \d+|first,|next,|then,|finally)\b', content.lower()))
        numbered_steps = len(re.findall(r'^\s*\d+\.\s', content, re.MULTILINE))
        if step_patterns > 2 or numbered_steps > 3:
            return 'how-to', "Step-by-step content detected"
        
        # Reference indicators
        if any(keyword in title_lower for keyword in ['reference', 'api', 'function', 'syntax', 'settings', 'format']):
            return 'reference', "Reference keywords in title"
        
        # SQL commands
        if any(cmd in title_lower for cmd in self.SQL_COMMANDS):
            return 'reference', f"SQL command in title: {title}"
        
        # Technical reference patterns
        if any(title_lower.endswith(suffix) for suffix in [' table', ' tables', ' function', ' functions', ' operator', ' command']):
            return 'reference', "Reference-style title pattern"
        
        # Reference structure (lots of tables/parameters)
        table_count = content.count('|')
        param_lists = len(re.findall(r'^\s*-\s+`[^`]+`\s*:', content, re.MULTILINE))
        if table_count > 20 or param_lists > 5:
            return 'reference', f"Reference structure (tables: {table_count//2}, params: {param_lists})"
        
        # Explanation indicators
        if any(keyword in title_lower for keyword in ['concept', 'overview', 'architecture', 'understanding', 'what is', 'why']):
            return 'explanation', "Explanation keywords in title"
        
        # Default fallback
        return 'explanation', "Default category (conceptual content)"
    
    def categorize_document(self, file_path: Path, title: str, content: str) -> Tuple[str, str]:
        """Main categorization logic: try path first, then content"""
        # Try path-based categorization first
        category, reason = self.categorize_by_path(file_path)
        if category:
            return category, reason
        
        # Fall back to content-based categorization
        return self.categorize_by_content(file_path, title, content)
    
    def find_markdown_files(self) -> List[Path]:
        """Find all markdown files, excluding skip directories"""
        files = []
        for pattern in ['**/*.md', '**/*.mdx']:
            for file_path in self.docs_path.glob(pattern):
                if not any(skip_dir in str(file_path) for skip_dir in self.SKIP_DIRS):
                    files.append(file_path)
        return files
    
    def update_frontmatter(self, content: str, doc_type: str) -> str:
        """Add or update doc_type in frontmatter"""
        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        
        if match:
            yaml_content = match.group(1)
            body = content[match.end():]
            
            if re.search(r'^doc_type\s*:', yaml_content, re.MULTILINE):
                # Replace existing doc_type
                updated_yaml = re.sub(r'^(\s*)doc_type\s*:.*$', f'\\1doc_type: {doc_type}', 
                                    yaml_content, flags=re.MULTILINE)
            else:
                # Add doc_type
                updated_yaml = yaml_content.rstrip() + f'\ndoc_type: {doc_type}'
            
            return f"---\n{updated_yaml}\n---\n\n{body}"
        else:
            # Create new frontmatter
            return f"---\ndoc_type: {doc_type}\n---\n\n{content}"
    
    def process_files(self, dry_run: bool = True, force: bool = False) -> List[CategoryResult]:
        """Process all markdown files and optionally update them"""
        md_files = self.find_markdown_files()
        print(f"Found {len(md_files)} markdown files")
        
        results = []
        updated_count = 0
        
        for file_path in md_files:
            try:
                content = file_path.read_text(encoding='utf-8', errors='ignore')
                frontmatter, content_body = self.extract_frontmatter(content)
                
                # Skip if doc_type exists and not forcing
                if frontmatter.get('doc_type') and not force:
                    continue
                
                title = self.get_title(content_body, frontmatter, file_path)
                category, reason = self.categorize_document(file_path, title, content_body)
                
                results.append(CategoryResult(
                    file_path=file_path,
                    title=title,
                    category=category,
                    reason=reason
                ))
                
                # Update file if not dry run
                if not dry_run:
                    updated_content = self.update_frontmatter(content, category)
                    if updated_content != content:
                        file_path.write_text(updated_content, encoding='utf-8')
                        updated_count += 1
                        print(f"Updated: {file_path.relative_to(self.docs_path)} → {category}")
                
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
        
        if not dry_run and updated_count:
            print(f"\nUpdated {updated_count} files")
        
        return results
    
    def generate_report(self, results: List[CategoryResult]):
        """Generate and print categorization report"""
        if not results:
            print("No files processed")
            return
        
        # Count by category
        counts = {}
        for result in results:
            counts[result.category] = counts.get(result.category, 0) + 1
        
        print(f"\n=== CATEGORIZATION REPORT ===")
        print(f"Total files: {len(results)}")
        print("\nBreakdown:")
        
        for category in ['tutorial', 'how-to', 'reference', 'explanation', 'overview']:
            count = counts.get(category, 0)
            if count > 0:
                pct = (count / len(results)) * 100
                print(f"  {category}: {count} ({pct:.1f}%)")
        
        # Show examples
        print(f"\nExamples:")
        for category in ['tutorial', 'how-to', 'reference', 'explanation', 'overview']:
            examples = [r for r in results if r.category == category][:2]
            if examples:
                print(f"\n{category.title()}:")
                for ex in examples:
                    print(f"  • {ex.title} ({ex.file_path.name})")
                    print(f"    → {ex.reason}")

def main():
    parser = argparse.ArgumentParser(description='Categorize ClickHouse docs using Diataxis framework')
    parser.add_argument('docs_path', nargs='?', default='docs', help='Path to docs directory')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without updating files')
    parser.add_argument('--force', action='store_true', help='Update files even if doc_type exists')
    
    args = parser.parse_args()
    
    docs_path = Path(args.docs_path)
    if not docs_path.exists():
        print(f"Error: {docs_path} does not exist")
        return 1
    
    categorizer = DiataxisCategorizer(docs_path)
    results = categorizer.process_files(dry_run=args.dry_run, force=args.force)
    categorizer.generate_report(results)
    
    if args.dry_run:
        print("\n(Dry run - no files were updated)")
    
    return 0

if __name__ == '__main__':
    exit(main())