#!/usr/bin/env python3

import os
import argparse
import pandas as pd
from collections import Counter
import fnmatch
import json
from tqdm import tqdm
import re
import requests
import time
from concurrent.futures import ThreadPoolExecutor

# Markdown processing - for cleaning
import markdown_it
from mdit_py_plugins.front_matter import front_matter_plugin
from bs4 import BeautifulSoup
import html2text

def clean_markdown(markdown_text):
    """Use proper markdown parsing tools to extract clean text"""
    # Set up markdown-it with front matter plugin
    md = markdown_it.MarkdownIt()
    md.use(front_matter_plugin)

    # Convert markdown to HTML
    html = md.render(markdown_text)

    # Use BeautifulSoup to remove unwanted elements
    soup = BeautifulSoup(html, 'html.parser')

    # Remove specific elements we don't want
    for tag in soup.find_all(['pre', 'code', 'table', 'img', 'script', 'style']):
        tag.decompose()

    # Convert back to plain text
    h2t = html2text.HTML2Text()
    h2t.ignore_links = True
    h2t.ignore_images = True
    h2t.ignore_tables = True
    h2t.ignore_emphasis = True
    h2t.body_width = 0

    text = h2t.handle(str(soup))

    # Clean up text
    text = re.sub(r'\s+', ' ', text).strip()

    return text

def extract_terms_with_claude(text, api_key, model="claude-3-sonnet-20240229", max_tokens=100000):
    """Extract technical terms using the Claude API"""
    # Truncate text if needed
    if len(text) > max_tokens:
        text = text[:max_tokens] + "..."

    # Create the prompt
    prompt = f"""
    Extract all technical terms and domain-specific keywords from the following text. 
    Focus on terms that would be important for a technical glossary.
    Include multi-word phrases and compound terms when relevant.
    Include programming terms, API names, technical concepts, and specialized terminology.
    
    Return the results as a JSON array of objects with 'term' and 'relevance' (from 0.0 to 1.0) properties.
    Do not include any explanations, just return valid JSON.
    
    Text:
    {text}
    """

    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,  # Low temperature for more deterministic results
        "max_tokens": 4000   # Enough for a large list of terms
    }

    # Make the API call
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers=headers,
        json=payload
    )

    if response.status_code != 200:
        print(f"Error from API: {response.status_code}")
        print(response.text)
        return []

    # Extract terms from response
    try:
        result = response.json()
        content = result["content"][0]["text"]

        # Find and parse the JSON array
        # Look for the first opening bracket and the last closing bracket
        start_idx = content.find('[')
        end_idx = content.rfind(']')

        if start_idx != -1 and end_idx != -1:
            json_text = content[start_idx:end_idx+1]
            terms = json.loads(json_text)
            return [(term["term"], term["relevance"]) for term in terms]
        else:
            print("Could not find JSON array in response")
            print(f"Response content: {content}")
            return []
    except Exception as e:
        print(f"Error parsing Claude API response: {e}")
        print(f"Response: {response.text}")
        return []

def process_file(file_path, api_key, model):
    """Process a single markdown file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()

        # Clean the markdown
        clean_text = clean_markdown(text)

        # Make sure we have meaningful content
        if len(clean_text.split()) < 20:
            print(f"Skipping {file_path}: not enough content")
            return []

        # Extract terms using Claude
        terms = extract_terms_with_claude(clean_text, api_key, model)

        return terms

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return []

def process_batch(files_batch, api_key, model):
    """Process a batch of files and return all terms"""
    all_batch_terms = []
    for file_path in files_batch:
        terms = process_file(file_path, api_key, model)
        all_batch_terms.extend(terms)
        # Add a delay to avoid rate limiting
        time.sleep(1)
    return all_batch_terms

def main():
    parser = argparse.ArgumentParser(description='Extract technical terms from markdown files using Claude')
    parser.add_argument('input_dir', help='Directory containing markdown files')
    parser.add_argument('--output', default='extracted_terms.csv', help='Output CSV filename')
    parser.add_argument('--top-n', type=int, default=1000, help='Number of top terms to extract')
    parser.add_argument('--min-freq', type=int, default=2, help='Minimum frequency for terms')
    parser.add_argument('--exclude-dirs', nargs='+', help='Directories to exclude')
    parser.add_argument('--api-key', required=True, help='Claude API key')
    parser.add_argument('--model', default='claude-3-sonnet-20240229', help='Claude model to use')
    parser.add_argument('--max-files', type=int, default=None, help='Maximum number of files to process')
    parser.add_argument('--workers', type=int, default=2, help='Number of parallel workers')

    args = parser.parse_args()

    # Find all markdown files
    markdown_files = []
    for root, dirs, files in os.walk(args.input_dir):
        # Skip excluded directories
        if args.exclude_dirs:
            dirs[:] = [d for d in dirs if d not in args.exclude_dirs]

        for file in files:
            if file.endswith('.md') or file.endswith('.mdx'):
                markdown_files.append(os.path.join(root, file))

    # Limit files if needed
    if args.max_files and len(markdown_files) > args.max_files:
        print(f"Limiting processing to {args.max_files} files (out of {len(markdown_files)} found)")
        markdown_files = markdown_files[:args.max_files]
    else:
        print(f"Found {len(markdown_files)} markdown files")

    # Process files in parallel with batching
    all_terms = []

    # Create batches - smaller batches for Claude to avoid timeouts
    batch_size = max(1, len(markdown_files) // args.workers)
    batches = [markdown_files[i:i+batch_size] for i in range(0, len(markdown_files), batch_size)]

    # Process batches in parallel
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = []
        for batch in batches:
            futures.append(executor.submit(process_batch, batch, args.api_key, args.model))

        # Collect results with progress bar
        for future in tqdm(futures, desc="Processing batches"):
            batch_terms = future.result()
            all_terms.extend(batch_terms)

    # Count term frequencies
    term_counter = Counter()
    term_scores = {}

    for term, score in all_terms:
        term = term.lower().strip()  # Normalize terms
        term_counter[term] += 1

        # Keep track of the best score (relevance) for each term
        if term not in term_scores or score > term_scores[term]:
            term_scores[term] = score

    # Filter and prepare data
    term_data = []
    for term, count in term_counter.items():
        if count >= args.min_freq:
            term_data.append({
                'term': term,
                'frequency': count,
                'relevance': term_scores[term]
            })

    # Create DataFrame and sort by frequency and relevance
    df = pd.DataFrame(term_data)
    if len(df) > 0:
        df = df.sort_values(['frequency', 'relevance'], ascending=[False, False])

        # Take top N
        df = df.head(args.top_n)

        # Save to CSV
        df.to_csv(args.output, index=False)
        print(f"Extracted {len(df)} terms to {args.output}")

        # Show top 10 terms
        print("\nTop 10 extracted terms:")
        for i, (_, row) in enumerate(df.head(10).iterrows(), 1):
            print(f"{i}. {row['term']} (frequency: {row['frequency']}, relevance: {row['relevance']:.2f})")
    else:
        print("No terms were extracted.")

if __name__ == "__main__":
    main()