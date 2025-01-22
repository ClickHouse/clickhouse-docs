import argparse
import json
import os
import re
import sys

import yaml
from slugify import slugify
from algoliasearch.search.client import SearchClient, SearchClientSync

DOCS_PREFIX = 'http://clickhouse.com/docs'
CODE_PATTERN = re.compile(r"```.*?```", re.DOTALL)


def parse_metadata_and_content(md_file_path):
    """Parse metadata and content from a Markdown file."""
    with open(md_file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Extract metadata block
    metadata_match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
    metadata = {}
    if metadata_match:
        metadata = yaml.safe_load(metadata_match.group(1))
        content = content[metadata_match.end():]  # Remove metadata from content
    metadata['file_path'] = md_file_path
    return metadata, content

def remove_code_blocks(content):
    """
    Remove all code blocks (``` ... ```) from the Markdown content.
    """
    return CODE_PATTERN.sub('', content)


def split_large_document(doc, max_size=10000):
    max_size = max_size * 0.9  # buffer
    """
    Splits a document into smaller chunks if its content exceeds max_size bytes - 10000 is the max size for algolia.
    Appends a number to the objectID for each chunk if splitting is necessary.
    """
    content = doc['content']
    size = len(json.dumps(doc).encode('utf-8'))
    if size <= max_size:
        doc['objectID'] = slugify(doc['slug'], lowercase=True, separator='-')
        yield doc
    else:
        # Split content into smaller chunks
        parts = []
        current_chunk = []
        # get current size without content
        del doc['content']
        initial_size = len(json.dumps(doc).encode('utf-8'))
        current_size = initial_size

        for line in content.splitlines(keepends=True):
            line_size = len(line.encode('utf-8'))
            if current_size + line_size > max_size:
                parts.append(''.join(current_chunk))
                current_chunk = []
                current_size = initial_size
            current_chunk.append(line)
            current_size += line_size

        if current_chunk:
            parts.append(''.join(current_chunk))

        # Yield each part as a separate document
        for i, part in enumerate(parts, start=1):
            chunked_doc = doc.copy()
            chunked_doc['content'] = part
            chunked_doc['objectID'] = f"{slugify(doc['url'], lowercase=True, separator='-')}-{i}"
            yield chunked_doc


# TODO: this is currently language specific
def inject_snippets(directory, content):
    snippet_pattern = re.compile(
        r"import\s+(\w+)\s+from\s+['\"]@site/docs/en/((.*?))['\"];",
        re.DOTALL
    )
    matches = snippet_pattern.findall(content)
    snippet_map = {}

    for snippet_name, snippet_full_path, _ in matches:
        full_path = os.path.join(directory, snippet_full_path)
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as snippet_file:
                snippet_map[snippet_name] = snippet_file.read()
        else:
            print(f"FATAL: Unable to handle snippet: {full_path}")
            sys.exit(1)
    content = snippet_pattern.sub("", content)
    for snippet_name, snippet_content in snippet_map.items():
        tag_pattern = re.compile(fr"<{snippet_name}\s*/>")
        try:
            content = tag_pattern.sub(re.escape(snippet_content), content)
        except Exception as e:
            print(e)
    return content


def parse_markdown_content(directory, metadata, content):
    """Parse the Markdown content and generate sub-documents for each ##, ###, and #### heading."""
    current_h1 = None
    current_h2 = None
    current_h3 = None
    slug = metadata.get(
        'slug',
        '/' + os.path.split(os.path.split(metadata['file_path'])[0])[1] + metadata['file_path'].replace(directory,
                                                                                                        '').removesuffix(
            '.md').removesuffix('.mdx')
    )


    # Inject any snippets
    content = inject_snippets(directory, content)
    # Remove any code blocks - we don't wanna index
    content = re.sub(r'```.*?```', '', content, flags=re.DOTALL)
    lines = content.splitlines()
    current_subdoc = None
    for line in lines:
        if line.startswith('# '):
            current_h1 = line[2:].strip() if line[2:].strip() else metadata.get('title', '')
            doc = {
                'file_path': metadata.get('file_path', ''),
                'slug': slug,
                'url': f'{DOCS_PREFIX}{slug}',
                'h1': current_h1,
                'content': metadata.get('description', ''),
                'title': metadata.get('title', ''),
                'keywords': metadata.get('keywords', '')
            }
            yield from split_large_document(doc)
        elif line.startswith('## '):
            # TODO: capture case with no h1
            if current_subdoc:
                yield from split_large_document(current_subdoc)
            current_h2 = line[3:].strip()
            current_h3 = None  # Reset h3 when a new h2 is found
            heading_slug = slugify(current_h2, lowercase=True, separator='-')
            current_subdoc = {
                'file_path': metadata.get('file_path', ''),
                'slug': f'{slug}#{heading_slug}',
                'url': f'{DOCS_PREFIX}{slug}#{heading_slug}',
                'h1': current_h1,
                'h2': current_h2,
                'content': '',
                'keywords': metadata.get('keywords', ''),
            }
        elif line.startswith('### '):
            if current_subdoc:
                yield from split_large_document(current_subdoc)
            current_h3 = line[4:].strip()
            heading_slug = slugify(f'{current_h2} {current_h3}', lowercase=True, separator='-')
            current_subdoc = {
                'file_path': metadata.get('file_path', ''),
                'slug': f'{slug}#{heading_slug}',
                'url': f'{DOCS_PREFIX}{slug}#{heading_slug}',
                'h1': current_h1,
                'h2': current_h2,
                'h3': current_h3,
                'content': '',
                'keywords': metadata.get('keywords', ''),
            }
        elif line.startswith('#### '):
            if current_subdoc:
                yield from split_large_document(current_subdoc)
            current_h4 = line[5:].strip()
            heading_slug = slugify(f'{current_h2} {current_h3} {current_h4}', lowercase=True, separator='-')
            current_subdoc = {
                'file_path': metadata.get('file_path', ''),
                'slug': f'{slug}#{heading_slug}',
                'url': f'{DOCS_PREFIX}{slug}#{heading_slug}',
                'h1': current_h1,
                'h2': current_h2,
                'h3': current_h3,
                'h4': current_h4,
                'content': '',
                'keywords': metadata.get('keywords', ''),
            }
        elif current_subdoc:
            current_subdoc['content'] += line + '\n'

    if current_subdoc:
        yield from split_large_document(current_subdoc)


def process_markdown_directory(directory):
    """Recursively process Markdown files in a directory."""
    directory = os.path.abspath(directory)
    i = 0
    for root, dirs, files in os.walk(directory):
        # Skip `_snippets` and _placeholders subfolders
        dirs[:] = [d for d in dirs if d != '_snippets' and d != '_placeholders']
        for file in files:
            if file.endswith('.md') or file.endswith('.mdx'):
                md_file_path = os.path.join(root, file)
                metadata, content = parse_metadata_and_content(md_file_path)
                for subdoc in parse_markdown_content(directory, metadata, content):
                    yield subdoc


def send_to_algolia(client, index_name, records):
    """Send records to Algolia."""
    if records:
        client.batch(index_name=index_name, batch_write_params={
            "requests": [{"action": "addObject", "body": record} for record in records],
        })
        print(f"Successfully sent {len(records)} records to Algolia.")
    else:
        print("No records to send to Algolia.")


# TODO: handle snippets - handle the markdown with mdx
def main(input_directory, algolia_app_id, algolia_api_key, algolia_index_name, batch_size=1000):
    client = SearchClientSync(algolia_app_id, algolia_api_key)

    batch = []
    t = 0
    for doc in process_markdown_directory(input_directory):
        # Ensure each record has a unique objectID
        doc['objectID'] = slugify(doc['url'], lowercase=True, separator='-')
        batch.append(doc)

        # Send batch to Algolia when it reaches the batch size
        if len(batch) >= batch_size:
            send_to_algolia(client, algolia_index_name, batch)
            print(f'indexed {len(batch)} records')
            t += len(batch)
            batch = []
    # Send any remaining records
    if batch:
        send_to_algolia(client, algolia_index_name, batch)
        t += len(batch)
        print(f'indexed {len(batch)} records')
    print(f'total: indexed {t} records')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Index search pages.')
    parser.add_argument(
        '-d',
        '--input_directory',
        help='Path to root directory of docs'
    )
    parser.add_argument('--algolia_app_id', required=True, help='Algolia Application ID')
    parser.add_argument('--algolia_api_key', required=True, help='Algolia Admin API Key')
    parser.add_argument('--algolia_index_name', required=True, help='Algolia Index Name')
    args = parser.parse_args()
    main(args.input_directory, args.algolia_app_id, args.algolia_api_key, args.algolia_index_name)
