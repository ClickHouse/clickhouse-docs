#!/usr/bin/env python3
"""
ClickHouse Documentation Diataxis Categorizer

This script crawls through the ClickHouse docs repository and categorizes
documents according to the Diataxis framework based on their titles and content.
"""

import argparse
import re
import yaml
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict
import sys

@dataclass
class CategoryResult:
    file_path: Path
    title: str
    category: str
    confidence: float
    scores: Dict[str, float]
    existing_doc_type: Optional[str] = None

class DiataxisPatterns:
    """Patterns for categorizing documents into Diataxis types"""
    
    PATTERNS = {
        'tutorial': {
            'keywords': [
                'tutorial', 'get started', 'getting started', 'quick start', 'quickstart',
                'first steps', 'your first', 'introduction to', 'beginner', 'walkthrough',
                'step by step', 'learn by doing', 'hands-on', 'follow along', 'build',
                'create your first', 'setup guide', 'installation guide', 'hello world',
                'learn', 'learning'
            ],
            'phrases': [
                'how to get started', 'follow this tutorial', 'in this tutorial',
                'lets build', 'we will create', 'step 1:', 'first, we', 'next, we',
                'finally, we', 'congratulations', 'you have learned', 'now you can',
                'by the end of this', 'you will learn'
            ],
            'path_patterns': [
                r'tutorial', r'getting-started', r'quick-start', r'intro', r'first-'
            ],
            'title_patterns': [
                r'^(getting started|quick start|tutorial|introduction)',
                r'your first', r'step by step', r'learn'
            ]
        },
        
        'how-to': {
            'keywords': [
                'guide', 'how to', 'configure', 'setup', 'install', 'deploy', 'migrate',
                'optimize', 'optimization', 'troubleshoot', 'fix', 'solve', 'implement', 
                'enable', 'disable', 'manage', 'monitor', 'backup', 'restore', 'scale',
                'secure', 'authenticate', 'connect', 'integrate', 'upgrade',
                'performance', 'tuning', 'maintenance', 'administration', 'best practices',
                'query optimization', 'schema design', 'indexing', 'partitioning',
                'clustering', 'replication', 'migration guide'
            ],
            'phrases': [
                'how to configure', 'how to setup', 'how to install', 'how to deploy',
                'how to migrate', 'how to optimize', 'how to troubleshoot',
                'how to implement', 'how to connect', 'how to integrate',
                'follow these steps', 'to accomplish this', 'here is how to',
                'complete the following', 'perform these steps', 'this guide',
                'methodology', 'approach', 'process for'
            ],
            'path_patterns': [
                r'how-to', r'guide', r'setup', r'install', r'deploy', r'manage',
                r'configure', r'migration', r'troubleshoot', r'operation', r'admin',
                r'optimize', r'performance', r'best-practices'
            ],
            'title_patterns': [
                r'^(how to|guide|configuration|installation|deployment)',
                r'migration', r'setup', r'managing', r'connecting', r'configuring',
                r'optimization', r'optimizing', r'performance', r'tuning'
            ]
        },
        
        'explanation': {
            'keywords': [
                'concept', 'concepts', 'overview', 'architecture', 'design',
                'theory', 'background', 'why', 'what is', 'understanding',
                'principles', 'fundamentals', 'internals', 'mechanics',
                'comparison', 'vs', 'versus', 'difference', 'when to use',
                'patterns', 'strategy', 'approach', 'philosophy', 'deep dive',
                'under the hood', 'how it works', 'explanation'
            ],
            'phrases': [
                'what is', 'this document explains', 'to understand', 'the concept of',
                'the idea behind', 'this section covers', 'background information',
                'the reason why', 'the difference between', 'compared to',
                'in contrast to', 'the advantage of', 'the purpose of',
                'understanding how', 'conceptual overview', 'deep dive into'
            ],
            'path_patterns': [
                r'concept', r'overview', r'architecture', r'design', r'theory',
                r'background', r'understanding', r'internals', r'comparison',
                r'about', r'explain', r'why-'
            ],
            'title_patterns': [
                r'^(concept|overview|architecture|design|understanding)',
                r'what is', r'vs\.|versus', r'comparison', r'background',
                r'introduction to', r'about', r'deep dive', r'explained'
            ]
        },
        
        'reference': {
            'keywords': [
                'reference', 'api', 'function', 'functions', 'method', 'methods',
                'command', 'commands', 'syntax', 'specification', 'format',
                'schema', 'properties', 'attributes', 'fields', 'dictionary',
                'list of', 'all available', 'supported', 'catalog'
            ],
            'phrases': [
                'reference documentation', 'api reference', 'function reference',
                'syntax reference', 'complete list of', 'all available',
                'supported formats', 'system tables', 'command line options',
                'parameter reference', 'function catalog'
            ],
            'path_patterns': [
                r'reference', r'api', r'function', r'command', r'syntax',
                r'format', r'spec', r'schema', r'dictionary', r'catalog'
            ],
            'title_patterns': [
                r'^(reference|api|function|command|syntax)',
                r'list$', r'catalog$', r'dictionary$', r'formats?$'
            ],
            'content_indicators': [
                # Strong indicators of reference material
                r'^\s*\|\s*[^|]+\s*\|\s*[^|]+\s*\|',  # Table rows
                r'^#{2,4}\s+[A-Z_][A-Z0-9_]*\s*\(',    # Function definitions
                r'^\s*-\s+`[^`]+`\s*:',                # Parameter lists
            ]
        },
        
        'overview': {
            'keywords': [
                'index', 'overview', 'table of contents', 'contents', 'summary',
                'introduction', 'welcome', 'home', 'main page', 'landing',
                'directory', 'catalog', 'browse', 'explore', 'navigation',
                'sitemap', 'outline', 'structure', 'organization'
            ],
            'phrases': [
                'this section contains', 'in this section', 'choose from the following',
                'select from', 'browse the', 'explore the', 'find information about',
                'covers the following', 'includes the following topics',
                'organized into', 'divided into', 'structured as follows',
                'main sections', 'primary areas', 'key topics'
            ],
            'path_patterns': [
                r'index', r'readme', r'main', r'home', r'landing',
                r'_index', r'overview', r'contents', r'toc'
            ],
            'title_patterns': [
                r'^(index|overview|contents|introduction|welcome|home)',
                r'table of contents', r'main page', r'landing page'
            ],
            'filename_patterns': [
                r'^index\.(md|mdx)$', r'^readme\.(md|mdx)$', r'^_index\.(md|mdx)$',
                r'^main\.(md|mdx)$', r'^home\.(md|mdx)$', r'^overview\.(md|mdx)$'
            ]
        }
    }

class DiataxisCategorizer:
    """Main categorizer class"""
    
    # Hard-coded directories to skip
    SKIP_DIRECTORIES = [
        '_clients',
        '_placeholders',
        '_snippets',
        'about-us',
        'example-datasets',
        'whats-new',
    ]
    
    def __init__(self, docs_path: Path):
        self.docs_path = Path(docs_path)
        self.results: List[CategoryResult] = []
        
    def extract_frontmatter(self, content: str) -> Tuple[Dict, str]:
        """Extract YAML frontmatter from markdown content"""
        frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if frontmatter_match:
            try:
                frontmatter = yaml.safe_load(frontmatter_match.group(1)) or {}
                content_without_frontmatter = content[frontmatter_match.end():]
                return frontmatter, content_without_frontmatter
            except yaml.YAMLError as e:
                print(f"Warning: Failed to parse frontmatter: {e}")
        
        return {}, content
    
    def analyze_content(self, title: str, content: str, file_path: Path) -> Dict:
        """Analyze content to determine Diataxis category"""
        scores = defaultdict(float)
        
        title_lower = title.lower()
        content_lower = content.lower()
        path_lower = str(file_path).lower()
        
        for category, patterns in DiataxisPatterns.PATTERNS.items():
            # Filename patterns (highest weight for overview)
            if category == 'overview':
                for pattern in patterns.get('filename_patterns', []):
                    if re.search(pattern, file_path.name, re.IGNORECASE):
                        scores[category] += 30
            
            # Title patterns (highest weight)
            for pattern in patterns.get('title_patterns', []):
                if re.search(pattern, title, re.IGNORECASE):
                    weight = 25 if category == 'how-to' else 20  # Boost how-to title matches
                    scores[category] += weight
            
            # Path patterns (high weight)
            for pattern in patterns.get('path_patterns', []):
                if re.search(pattern, path_lower):
                    scores[category] += 15
            
            # Keywords in title (high weight, boosted for how-to guides)
            for keyword in patterns.get('keywords', []):
                if keyword in title_lower:
                    weight = 15 if category == 'how-to' and keyword in ['guide', 'optimization', 'optimize'] else 10
                    scores[category] += weight
            
            # Phrases in content (medium weight)
            for phrase in patterns.get('phrases', []):
                matches = len(re.findall(re.escape(phrase), content_lower))
                scores[category] += matches * 5
            
            # Keywords in content (reduced weight for reference to avoid over-scoring)
            for keyword in patterns.get('keywords', []):
                pattern = r'\b' + re.escape(keyword) + r'\b'
                matches = len(re.findall(pattern, content_lower))
                
                # Reduce scoring for reference technical terms that appear in how-to guides
                if category == 'reference' and keyword in ['setting', 'settings', 'parameter', 'parameters', 'option', 'options', 'configuration', 'table', 'tables']:
                    scores[category] += matches * 0.5  # Reduced from 2
                else:
                    scores[category] += matches * 2
            
            # Special content indicators for reference
            if category == 'reference':
                for pattern in patterns.get('content_indicators', []):
                    matches = len(re.findall(pattern, content, re.MULTILINE))
                    scores[category] += matches * 8  # Strong indicator
        
        # Apply structural heuristics
        self._apply_structural_heuristics(content, scores, file_path, title)
        
        # Find best category
        best_category = max(scores, key=scores.get) if scores else 'explanation'
        confidence = scores[best_category] if scores else 0
        
        return {
            'category': best_category,
            'scores': dict(scores),
            'confidence': confidence
        }
    
    def _apply_structural_heuristics(self, content: str, scores: Dict[str, float], file_path: Path, title: str):
        """Apply heuristics based on document structure"""
        lines = content.split('\n')
        
        # Special handling for index files
        if file_path.name.lower() in ['index.md', 'index.mdx', 'readme.md', 'readme.mdx', '_index.md', '_index.mdx', 'main.md', 'main.mdx', 'home.md', 'home.mdx']:
            scores['overview'] += 25
        
        # Count links to other documents (high for overview pages)
        internal_links = len(re.findall(r'\[.*?\]\([^)]*\.(md|mdx)[^)]*\)', content))
        if internal_links > 5:
            scores['overview'] += 10
        elif internal_links > 10:
            scores['overview'] += 15
        
        # Count list items (often navigation in overview pages)
        list_items = sum(1 for line in lines if re.match(r'^\s*[-*+]\s', line))
        if list_items > 8:
            scores['overview'] += 8
        
        # Count code blocks (favor tutorial and how-to)
        code_blocks = content.count('```') // 2
        if code_blocks > 3:
            scores['tutorial'] += 8
            scores['how-to'] += 8
        
        # Count numbered lists (strong indicator of how-to guides)
        numbered_lists = sum(1 for line in lines if re.match(r'^\s*\d+\.\s', line))
        if numbered_lists > 3:
            scores['tutorial'] += 8
            scores['how-to'] += 12  # Boosted for how-to guides
        
        # Step-by-step indicators (strong how-to signal)
        step_indicators = len(re.findall(r'\b(step \d+|first,|next,|then,|finally,|methodology|process)\b', content.lower()))
        if step_indicators > 3:
            scores['how-to'] += 15
        
        # Count function/parameter definitions (reference material)
        function_defs = sum(1 for line in lines if (
            re.match(r'^#{2,4}\s+[A-Z_][A-Z0-9_]*\s*\(', line) or  # Function definitions
            re.match(r'^\s*-\s+`[^`]+`\s*:', line) or  # Parameter lists
            re.match(r'^\|\s*[^|]+\s*\|\s*[^|]+\s*\|', line)  # Table rows
        ))
        if function_defs > 8:  # Increased threshold to avoid false positives
            scores['reference'] += 15
        
        # Count conceptual indicators
        conceptual_pattern = r'\b(concept|principle|theory|architecture|design|approach|strategy|pattern)\b'
        conceptual_matches = len(re.findall(conceptual_pattern, content, re.IGNORECASE))
        if conceptual_matches > 3:
            scores['explanation'] += 10
        
        # Short content with many links is likely overview
        if len(content.split()) < 500 and internal_links > 3:
            scores['overview'] += 12
        
        # Boost how-to for guides with practical content
        if 'guide' in title.lower() and code_blocks > 1:
            scores['how-to'] += 10
        
        # Performance/optimization content is usually how-to
        if any(word in title.lower() for word in ['optimization', 'optimize', 'performance', 'tuning', 'best practices']):
            scores['how-to'] += 15
        
        # Troubleshooting content is how-to
        if any(word in content.lower() for word in ['troubleshoot', 'solve', 'fix', 'problem', 'issue', 'debug']):
            scores['how-to'] += 8
    
    def get_title_from_content(self, content: str, file_path: Path) -> str:
        """Extract title from content or filename"""
        # Look for first heading
        title_match = re.search(r'^#\s+(.+)', content, re.MULTILINE)
        if title_match:
            return title_match.group(1).strip()
        
        # Fallback to filename
        return file_path.stem.replace('-', ' ').replace('_', ' ').title()
    
    def process_file(self, file_path: Path, force: bool = False) -> Optional[CategoryResult]:
        """Process a single markdown file"""
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            frontmatter, content_without_frontmatter = self.extract_frontmatter(content)
            
            # Skip if doc_type already exists and not forcing
            existing_doc_type = frontmatter.get('doc_type')
            if existing_doc_type and not force:
                print(f"Skipping {file_path} (doc_type already exists: {existing_doc_type})")
                return None
            
            # Get title
            title = (frontmatter.get('title') or 
                    frontmatter.get('sidebar_label') or 
                    self.get_title_from_content(content_without_frontmatter, file_path))
            
            # Analyze content
            analysis = self.analyze_content(title, content_without_frontmatter, file_path)
            
            result = CategoryResult(
                file_path=file_path,
                title=title,
                category=analysis['category'],
                confidence=analysis['confidence'],
                scores=analysis['scores'],
                existing_doc_type=existing_doc_type
            )
            
            return result
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            return None
    
    def find_markdown_files(self) -> List[Path]:
        """Recursively find all markdown files (.md and .mdx), excluding specified directories"""
        files = []
        
        def should_skip_directory(path: Path) -> bool:
            """Check if directory should be skipped"""
            path_str = str(path).lower()
            path_parts = [p.lower() for p in path.parts]
            
            for skip_dir in self.SKIP_DIRECTORIES:
                skip_lower = skip_dir.lower()
                # Check exact match in path parts
                if skip_lower in path_parts:
                    return True
                # Check if path contains the skip pattern
                if skip_lower in path_str:
                    return True
            return False
        
        skipped_count = 0
        
        # Find both .md and .mdx files
        for pattern in ['*.md', '*.mdx']:
            for file_path in self.docs_path.rglob(pattern):
                # Skip if any parent directory should be skipped
                if should_skip_directory(file_path.parent):
                    skipped_count += 1
                    continue
                files.append(file_path)
        
        if skipped_count > 0:
            print(f"Skipped {skipped_count} files in excluded directories")
            print(f"Excluded directories: {', '.join(self.SKIP_DIRECTORIES[:8])}{'...' if len(self.SKIP_DIRECTORIES) > 8 else ''}")
        
        return files
    
    def categorize(self, force: bool = False) -> List[CategoryResult]:
        """Main categorization method"""
        print(f"Scanning for markdown files in: {self.docs_path}")
        
        markdown_files = self.find_markdown_files()
        print(f"Found {len(markdown_files)} markdown files (.md and .mdx)")
        
        results = []
        for file_path in markdown_files:
            if file_path.name.startswith('.'):
                continue  # Skip hidden files
                
            result = self.process_file(file_path, force)
            if result:
                results.append(result)
        
        self.results = results
        return results
    
    def update_frontmatter(self, content: str, doc_type: str) -> str:
        """Add or update doc_type in frontmatter while preserving original formatting"""
        frontmatter, content_body = self.extract_frontmatter(content)
        
        # Check if we have existing frontmatter
        frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if frontmatter_match:
            original_yaml = frontmatter_match.group(1)
            
            # Check if doc_type already exists in original
            if re.search(r'^doc_type\s*:', original_yaml, re.MULTILINE):
                # Replace existing doc_type line, preserving indentation and style
                updated_yaml = re.sub(
                    r'^(\s*)doc_type\s*:.*$',
                    f'\\1doc_type: \'{doc_type}\'',
                    original_yaml,
                    flags=re.MULTILINE
                )
            else:
                # Add doc_type at the end, preserving original formatting
                # Remove any trailing whitespace and add the new line
                updated_yaml = original_yaml.rstrip() + f'\ndoc_type: \'{doc_type}\''
            
            return f"---\n{updated_yaml}\n---\n\n{content_body}"
        else:
            # No existing frontmatter, create minimal new one
            return f"---\ndoc_type: '{doc_type}'\n---\n\n{content}"
    
    def update_files(self) -> int:
        """Update files with doc_type in frontmatter"""
        updated = 0
        
        for result in self.results:
            try:
                original_content = result.file_path.read_text(encoding='utf-8')
                updated_content = self.update_frontmatter(original_content, result.category)
                
                if original_content != updated_content:
                    result.file_path.write_text(updated_content, encoding='utf-8')
                    updated += 1
                    print(f"Updated {result.file_path} -> {result.category}")
                    
            except Exception as e:
                print(f"Failed to update {result.file_path}: {e}")
        
        print(f"\nUpdated {updated} files")
        return updated
    
    def generate_report(self) -> Dict:
        """Generate categorization report"""
        if not self.results:
            print("No results to report")
            return {}
        
        category_stats = defaultdict(int)
        low_confidence_files = []
        
        for result in self.results:
            category_stats[result.category] += 1
            if result.confidence < 10:
                low_confidence_files.append(result)
        
        print('\n=== CATEGORIZATION REPORT ===')
        print(f'Total files processed: {len(self.results)}')
        print('\nCategory distribution:')
        
        # Sort by count descending
        sorted_stats = sorted(category_stats.items(), key=lambda x: x[1], reverse=True)
        for category, count in sorted_stats:
            percentage = (count / len(self.results)) * 100
            print(f'  {category}: {count} files ({percentage:.1f}%)')
        
        if low_confidence_files:
            print(f'\n⚠️  Low confidence categorizations ({len(low_confidence_files)} files):')
            # Sort by confidence ascending
            low_confidence_files.sort(key=lambda x: x.confidence)
            for result in low_confidence_files[:10]:  # Show top 10
                print(f'  {result.file_path}: {result.category} (confidence: {result.confidence:.1f})')
                # Show scores for debugging
                scores_str = ', '.join([f'{k}: {v:.1f}' for k, v in result.scores.items() if v > 0])
                if scores_str:
                    print(f'    Scores: {scores_str}')
            if len(low_confidence_files) > 10:
                print(f'    ... and {len(low_confidence_files) - 10} more')
        
        return {
            'total_files': len(self.results),
            'category_stats': dict(category_stats),
            'low_confidence_count': len(low_confidence_files)
        }

def main():
    """CLI interface"""
    parser = argparse.ArgumentParser(
        description='Categorize ClickHouse documentation using Diataxis framework'
    )
    parser.add_argument('docs_path', nargs='?', default='docs', 
                       help='Path to docs directory (default: docs)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Analyze files but do not update them')
    parser.add_argument('--force', action='store_true',
                       help='Update files even if doc_type already exists')
    parser.add_argument('--report-only', action='store_true',
                       help='Generate report without processing files')
    
    args = parser.parse_args()
    
    docs_path = Path(args.docs_path)
    if not docs_path.exists():
        print(f"Error: Directory {docs_path} does not exist")
        sys.exit(1)
    
    try:
        categorizer = DiataxisCategorizer(docs_path)
        
        if not args.report_only:
            results = categorizer.categorize(force=args.force)
            if not results:
                print("No files to process")
                return
        
        report = categorizer.generate_report()
        
        if not args.dry_run and not args.report_only and categorizer.results:
            print('\nUpdating files...')
            categorizer.update_files()
        elif args.dry_run:
            print('\n(Dry run - no files were updated)')
            
    except Exception as e:
        print(f'Error: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()