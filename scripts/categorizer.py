#!/usr/bin/env python3
"""
Document Categorizer using Diataxis Framework
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
RATE_LIMIT_DELAY = 1

# Categorization prompt
CATEGORIZATION_PROMPT = """
Categorize this markdown document using the Diataxis framework. 

Categories:
- tutorial: Learning-oriented, step-by-step learning journey
- how-to: Task-oriented, problem-solving guides with procedures 
- reference: Information-oriented, systematic lookup material (APIs, tables, indexes)
- explanation: Understanding-oriented, conceptual background and context

Guidelines:
- Index/TOC pages with tables of links → reference
- Step-by-step guides with procedures → how-to  
- Conceptual overviews and FAQs → explanation
- Learning journeys for beginners → tutorial

Filename: {filename}
Title: {title}
Description: {description}

Content: {content}

IMPORTANT: Respond with ONLY one word: tutorial, how-to, reference, or explanation
"""

class DocumentCategorizer:
    def __init__(self, api_key: str, dry_run: bool = False):
        self.api_key = api_key
        self.dry_run = dry_run
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
            valid_categories = {'tutorial', 'how-to', 'reference', 'explanation'}
            
            # Look for exact matches first
            for category in valid_categories:
                if category in raw_response:
                    return category
            
            # Fallback patterns
            if 'tutorial' in raw_response or 'learning' in raw_response:
                return 'tutorial'
            elif 'how-to' in raw_response or 'how to' in raw_response or 'step-by-step' in raw_response:
                return 'how-to'
            elif 'reference' in raw_response or 'lookup' in raw_response or 'api' in raw_response:
                return 'reference'
            else:
                return 'explanation'
    
    def add_doc_type_to_frontmatter(self, file_path: Path, category: str) -> bool:
        """Add doc_type to existing frontmatter without reformatting."""
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
            
            # Add doc_type as the last line in frontmatter
            new_frontmatter_content = frontmatter_content + f"\ndoc_type: '{category}'"
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
            
            # Skip if already categorized
            if has_doc_type:
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
    parser = argparse.ArgumentParser(description='Categorize markdown documents using Diataxis framework')
    parser.add_argument('directory', help='Directory containing markdown files')
    parser.add_argument('--pattern', default='*.md', help='File pattern to match (default: *.md)')
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
    
    async with DocumentCategorizer(ANTHROPIC_API_KEY, args.dry_run) as categorizer:
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