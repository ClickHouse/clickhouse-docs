#!/usr/bin/env python3
"""
Document Categorizer using Custom Framework
Automatically categorizes markdown documents and updates frontmatter with doc_type.
"""

import os
import re
import asyncio
import aiohttp
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import argparse
import json
from datetime import datetime

# Configuration
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
API_URL = 'https://api.anthropic.com/v1/messages'
MODEL = 'claude-3-haiku-20240307'
MAX_CONTENT_LENGTH = 8000
BATCH_SIZE = 5
RATE_LIMIT_DELAY = 2

# Categorization prompt
CATEGORIZATION_PROMPT = """
Categorize this markdown document using the following framework. 

Categories:
- guide: Task-oriented content with actionable steps, procedures, or learning paths that users follow to accomplish something
- reference: Information-oriented material that users look up for specific facts, including technical specifications and lookup data
- landing-page: Navigation pages that primarily link to other documents (index pages, TOCs, directory listings with minimal content per item)
- changelog: Version history, release notes, change logs, what's new pages

Key distinctions:

GUIDE vs REFERENCE:
- Guide: "How to do X" - Users follow steps to accomplish a task or learn a skill
  * Installation instructions, tutorials, walkthroughs, setup procedures
  * Configuration guides with specific steps and code examples
  * Decision-making frameworks ("How to choose the right engine")
  * Learning paths with exercises or examples to follow along
  * Step-by-step processes, workflows, procedures
  * Migration guides, troubleshooting procedures
  * Case studies and success stories that demonstrate implementation approaches
  * Documents that show "how to configure/implement/set up/use" something
  * Examples: "Getting Started Tutorial", "How to Create Tables", "Setting Up Replication", "Migrating from PostgreSQL", "Defining Ordering Keys", "Creative Use Cases"

- Reference: Pure lookup material users consult for technical information
  * API documentation, function definitions, configuration parameter lists
  * Engine specifications, data type references, SQL syntax documentation
  * Pure technical specifications without implementation guidance
  * Adopters lists, error code references, parameter tables
  * Architecture overviews that explain concepts without showing implementation steps
  * Function syntax, data type definitions, specification documents
  * Examples: "SQL Functions Reference", "MergeTree Engine Specification", "Configuration Parameters List", "Data Types Documentation", "ClickHouse Adopters"

REFERENCE vs LANDING-PAGE:
- Reference: Contains substantial technical information that users look up
- Landing-page: Primarily navigation with minimal content per item (lists of links, table of contents, directory pages)

Decision framework:
1. Does it document version changes, release notes, or what's new? → changelog
2. Is it primarily navigation with minimal content per item? → landing-page
3. Does it provide step-by-step instructions, procedures, or implementation guidance (including case studies)? → guide  
4. Does it contain technical specifications or information users look up? → reference

Examples by category:
- Guide: "Installing ClickHouse", "Creating Your First Dashboard", "Migration from MySQL Tutorial", "Setting Up Authentication", "Creative Use Cases"
- Reference: "SQL Functions", "MergeTree Engine Documentation", "Configuration Parameters", "Data Types", "ClickHouse Architecture", "Adopters List"
- Landing-page: "Documentation Home", "Table of Contents", "Available Integrations", "Function Categories"
- Changelog: "Release Notes v22.8", "What's New", "Version History", "Breaking Changes"

Filename: {filename}
Title: {title}
Description: {description}

Content: {content}

IMPORTANT: Respond with ONLY one word: guide, reference, landing-page, or changelog
"""

class DocumentCategorizer:
    def __init__(self, api_key: str, dry_run: bool = False, force: bool = False):
        self.api_key = api_key
        self.dry_run = dry_run
        self.force = force
        self.session = None
        self.results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def extract_frontmatter_info(self, content: str) -> Tuple[Optional[Dict], str, bool]:
        """Extract frontmatter info without full parsing."""
        frontmatter_pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
        match = re.match(frontmatter_pattern, content, re.DOTALL)
        
        if not match:
            return None, content, False
        
        try:
            yaml_content = match.group(1)
            body_content = match.group(2)
            frontmatter_dict = yaml.safe_load(yaml_content)
            has_doc_type = frontmatter_dict and 'doc_type' in frontmatter_dict
            return frontmatter_dict or {}, body_content, has_doc_type
        except yaml.YAMLError as e:
            print(f"YAML parsing error: {e}")
            return None, content, False
    
    async def categorize_document(self, content: str, filename: str, frontmatter: Dict) -> str:
        """Send document to Claude API for categorization."""
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")
        
        # Prepare content for API
        truncated_content = content[:MAX_CONTENT_LENGTH]
        if len(content) > MAX_CONTENT_LENGTH:
            truncated_content += "\n... (truncated)"
        
        # Build prompt
        prompt = CATEGORIZATION_PROMPT.format(
            filename=filename,
            title=frontmatter.get('title', ''),
            description=frontmatter.get('description', ''),
            content=truncated_content
        )
        
        # API request
        headers = {
            'x-api-key': self.api_key,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }
        
        data = {
            'model': MODEL,
            'max_tokens': 20,
            'messages': [{'role': 'user', 'content': prompt}]
        }
        
        async with self.session.post(API_URL, headers=headers, json=data) as response:
            if response.status != 200:
                error_text = await response.text()
                raise Exception(f"API request failed: {response.status} - {error_text}")
            
            result = await response.json()
            raw_response = result['content'][0]['text'].strip().lower()
            
            # Extract category from response
            valid_categories = {'guide', 'reference', 'landing-page', 'changelog'}
            
            # Look for exact matches first
            for category in valid_categories:
                if category in raw_response:
                    return category
            
            # Fallback patterns with updated logic
            if any(term in raw_response for term in ['changelog', 'change log', 'release notes', 'version history', 'what\'s new']):
                return 'changelog'
            elif any(term in raw_response for term in ['tutorial', 'how-to', 'how to', 'step-by-step', 'learning', 'guide', 'installation', 'setup']):
                return 'guide'
            elif any(term in raw_response for term in ['index', 'toc', 'table of contents', 'navigation', 'directory', 'links to']):
                return 'landing-page'
            else:
                return 'reference'
    
    def add_doc_type_to_frontmatter(self, file_path: Path, category: str) -> bool:
        """Add or update doc_type to existing frontmatter without reformatting."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find the frontmatter sections
            match = re.match(r'^(---\s*\n)(.*?)(\n---\s*\n)(.*)$', content, re.DOTALL)
            if not match:
                return False
            
            frontmatter_start = match.group(1)  # "---\n"
            frontmatter_content = match.group(2)  # The YAML content
            frontmatter_end = match.group(3)  # "\n---\n" 
            body = match.group(4)  # Rest of document
            
            # Check if doc_type already exists and update it, otherwise add it
            doc_type_pattern = r'^doc_type:\s*.*$'
            lines = frontmatter_content.split('\n')
            
            doc_type_updated = False
            for i, line in enumerate(lines):
                if re.match(doc_type_pattern, line.strip()):
                    lines[i] = f"doc_type: '{category}'"
                    doc_type_updated = True
                    break
            
            if not doc_type_updated:
                # Add doc_type as the last line in frontmatter
                new_frontmatter_content = frontmatter_content + f"\ndoc_type: '{category}'"
            else:
                new_frontmatter_content = '\n'.join(lines)
            
            new_content = f"{frontmatter_start}{new_frontmatter_content}{frontmatter_end}{body}"
            
            if not self.dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
            
            return True
        except Exception as e:
            print(f"Error updating {file_path}: {e}")
            return False
    
    async def process_document(self, file_path: Path) -> Dict:
        """Process a single document."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            frontmatter_dict, body, has_doc_type = self.extract_frontmatter_info(content)
            
            # Skip files without frontmatter
            if frontmatter_dict is None:
                return {
                    'file': str(file_path),
                    'status': 'skipped',
                    'reason': 'no_frontmatter'
                }
            
            # Skip if already categorized (unless force is enabled)
            if has_doc_type and not self.force:
                return {
                    'file': str(file_path),
                    'status': 'skipped',
                    'reason': 'already_categorized',
                    'existing_category': frontmatter_dict['doc_type']
                }
            
            # Categorize using API
            category = await self.categorize_document(body, file_path.name, frontmatter_dict)
            
            # Update file
            if self.add_doc_type_to_frontmatter(file_path, category):
                return {
                    'file': str(file_path),
                    'status': 'success',
                    'category': category
                }
            else:
                return {
                    'file': str(file_path),
                    'status': 'error',
                    'reason': 'failed_to_update'
                }
                
        except Exception as e:
            return {
                'file': str(file_path),
                'status': 'error',
                'reason': str(e)
            }
    
    async def process_batch(self, files: List[Path]) -> List[Dict]:
        """Process a batch of files."""
        tasks = [self.process_document(file_path) for file_path in files]
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    async def process_directory(self, directory: Path, pattern: str = "*.md") -> None:
        """Process all matching files in directory."""
        files = list(directory.rglob(pattern))
        total_files = len(files)
        
        print(f"Found {total_files} markdown files")
        if self.dry_run:
            print("DRY RUN MODE - No files will be modified")
        if self.force:
            print("FORCE MODE - Re-categorizing documents that already have doc_type")
        
        processed = 0
        
        # Process in batches
        for i in range(0, total_files, BATCH_SIZE):
            batch = files[i:i + BATCH_SIZE]
            print(f"Processing batch {i // BATCH_SIZE + 1} ({len(batch)} files)...")
            
            try:
                results = await self.process_batch(batch)
                self.results.extend(results)
                processed += len(batch)
                
                # Rate limiting
                if i + BATCH_SIZE < total_files:
                    await asyncio.sleep(RATE_LIMIT_DELAY)
                
                # Progress update
                print(f"Progress: {processed}/{total_files} files processed")
                
            except Exception as e:
                print(f"Error processing batch: {e}")
                continue
    
    def print_summary(self) -> None:
        """Print processing summary."""
        success = sum(1 for r in self.results if r.get('status') == 'success')
        skipped = sum(1 for r in self.results if r.get('status') == 'skipped')
        errors = sum(1 for r in self.results if r.get('status') == 'error')
        
        print(f"\n=== Summary ===")
        print(f"Successfully categorized: {success}")
        print(f"Skipped (already categorized or no frontmatter): {skipped}")
        print(f"Errors: {errors}")
        
        # Show category breakdown
        categories = {}
        for r in self.results:
            if r.get('status') == 'success':
                cat = r.get('category')
                categories[cat] = categories.get(cat, 0) + 1
        
        if categories:
            print(f"\nCategory breakdown:")
            for cat, count in sorted(categories.items()):
                print(f"  {cat}: {count}")
        
        # Show errors
        error_results = [r for r in self.results if r.get('status') == 'error']
        if error_results:
            print(f"\nErrors:")
            for r in error_results[:10]:
                print(f"  {r['file']}: {r.get('reason', 'Unknown error')}")
            if len(error_results) > 10:
                print(f"  ... and {len(error_results) - 10} more")

async def main():
    parser = argparse.ArgumentParser(description='Categorize markdown documents using custom framework')
    parser.add_argument('directory', help='Directory containing markdown files')
    parser.add_argument('--pattern', default='*.md', help='File pattern to match (default: *.md)')
    parser.add_argument('--force', action='store_true', help='Re-categorize documents that already have doc_type')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without making changes')
    parser.add_argument('--output-log', help='Save results to JSON file')
    
    args = parser.parse_args()
    
    directory = Path(args.directory)
    if not directory.exists():
        print(f"Error: Directory {directory} does not exist")
        return 1
    
    if not ANTHROPIC_API_KEY:
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        print("Get your API key from: https://console.anthropic.com/")
        return 1
    
    async with DocumentCategorizer(ANTHROPIC_API_KEY, args.dry_run, args.force) as categorizer:
        try:
            await categorizer.process_directory(directory, args.pattern)
            categorizer.print_summary()
            
            if args.output_log:
                with open(args.output_log, 'w') as f:
                    json.dump({
                        'timestamp': datetime.now().isoformat(),
                        'directory': str(directory),
                        'pattern': args.pattern,
                        'dry_run': args.dry_run,
                        'force': args.force,
                        'results': categorizer.results
                    }, f, indent=2)
                print(f"Results saved to {args.output_log}")
                
        except KeyboardInterrupt:
            print("\nInterrupted by user")
            return 1
        except Exception as e:
            print(f"Error: {e}")
            return 1
    
    return 0

if __name__ == '__main__':
    exit(asyncio.run(main()))