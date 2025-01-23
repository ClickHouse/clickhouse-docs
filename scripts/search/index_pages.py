import argparse
import json
import os
import re
import sys
from ruamel.yaml import YAML
from slugify import slugify
from algoliasearch.search.client import SearchClientSync
import networkx as nx

DOCS_PREFIX = 'https://clickhouse.com/docs'
HEADER_PATTERN = re.compile(r"^(.*?)(?:\s*\{#(.*?)\})$")
object_ids = set()

link_data = []


def read_metadata(text):
    parts = text.split("\n")
    metadata = {}
    for part in parts:
        parts = part.split(":")
        if len(parts) == 2:
            if parts[0] in ['title', 'description', 'slug', 'keyword']:
                metadata[parts[0]] = parts[1].strip()
    return metadata


def parse_metadata_and_content(root_directory, md_file_path):
    """Parse multiple metadata blocks and content from a Markdown file."""
    with open(md_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    content = remove_code_blocks(content)
    # Inject any snippets
    content = inject_snippets(root_directory, content)
    # Pattern to capture multiple metadata blocks
    metadata_pattern = r'---\n(.*?)\n---\n'
    metadata_blocks = re.findall(metadata_pattern, content, re.DOTALL)
    metadata = {}
    yaml = YAML()
    yaml.preserve_quotes = True
    for block in metadata_blocks:
        block_data = read_metadata(block)
        metadata.update(block_data)
    # Remove all metadata blocks from the content
    content = re.sub(metadata_pattern, '', content, flags=re.DOTALL)
    # Add file path to metadata
    metadata['file_path'] = md_file_path
    return metadata, content


def remove_code_blocks(content):
    # Remove code blocks
    content = re.sub(r'```.*?```', '', content, flags=re.DOTALL)
    # Replace `\` followed by a non-whitespace character
    content = re.sub(r'\\(\S)', r'\\\\\1', content)
    return content


def get_object_id(id):
    slug_id = custom_slugify(id)
    if not slug_id in object_ids:
        object_ids.add(slug_id)
        return slug_id
    else:
        i = 1
        while True:
            if not f'{slug_id}-{i}' in object_ids:
                object_ids.add(f'{slug_id}-{i}')
                return f'{slug_id}-{i}'
            i += 1


def split_large_document(doc, max_size=10000):
    max_size = max_size * 0.9  # buffer
    """
    Splits a document into smaller chunks if its content exceeds max_size bytes - 10000 is the max size for algolia.
    Appends a number to the objectID for each chunk if splitting is necessary.
    """
    content = doc['content']
    size = len(json.dumps(doc).encode('utf-8'))
    if size <= max_size:
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

        objectID = doc['objectID']
        # Yield each part as a separate document
        for i, part in enumerate(parts, start=1):
            chunked_doc = doc.copy()
            chunked_doc['content'] = part
            chunked_doc['objectID'] = f"{objectID}-{i}"
            yield chunked_doc


def inject_snippets(directory, content):
    snippet_pattern = re.compile(
        r"import\s+(\w+)\s+from\s+['\"]@site/((.*?))['\"];",
        re.DOTALL
    )
    matches = snippet_pattern.findall(content)
    snippet_map = {}

    for snippet_name, snippet_full_path, _ in matches:
        full_path = os.path.join(directory, snippet_full_path)
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as snippet_file:
                snippet_map[snippet_name] = remove_code_blocks(snippet_file.read())
        else:
            print(f"FATAL: Unable to handle snippet: {full_path}")
            sys.exit(1)
    content = snippet_pattern.sub("", content)
    for snippet_name, snippet_content in snippet_map.items():
        tag_pattern = re.compile(fr"<{snippet_name}\s*/>")
        content = tag_pattern.sub(snippet_content, content)
    return content


def custom_slugify(text):
    # Preprocess the text to remove specific characters
    text = text.replace("(", "").replace(")", "")  # Remove parentheses
    text = text.replace(",", "")  # Remove commas
    text = text.replace("[", "").replace("]", "")  # Remove [ and ]
    text = text.replace("\\", "")  # Remove \
    text = text.replace("...", "-")
    text = text.replace(" ", '-')  # Replace any whitespace character with a dash.
    text = re.sub(r'--{2,}', '--', text)  # more than 2 -- are replaced with a --
    text = re.sub(r'--$', '-', text)
    text = text.replace('--', 'TEMPDOUBLEHYPHEN')
    slug = slugify(text, lowercase=True, separator='-', regex_pattern=r'[^a-zA-Z0-9_]+')
    slug = slug.replace("tempdoublehyphen", "--")
    if text.endswith("-"):
        slug += '-'
    return slug


def extract_links_from_content(content):
    """
    Extract all Markdown links from the content.
    """
    # Markdown link pattern: [text](link)
    link_pattern = r'\[.*?\]\((.*?)\)'
    return re.findall(link_pattern, content)


def update_page_rank(url, content):
    links = extract_links_from_content(content)
    for target in links:
        if target.startswith('/docs/') and not target.endswith('.md'):
            link_data.append((url, f'{DOCS_PREFIX}{target.replace("/docs", "")}'))


def parse_markdown_content(directory, metadata, content):
    """Parse the Markdown content and generate sub-documents for each ##, ###, and #### heading."""
    slug = metadata.get('slug',
                        '/' + os.path.split(os.path.split(metadata['file_path'])[0])[1] + metadata['file_path'].replace(
                            directory, '').removesuffix('.md').removesuffix('.mdx'))
    slug = slug.removesuffix('/')
    heading_slug = slug
    lines = content.splitlines()
    current_h1 = metadata.get('title', '')

    current_subdoc = {
        'file_path': metadata.get('file_path', ''),
        'slug': heading_slug,
        'url': f'{DOCS_PREFIX}{heading_slug}',
        'h1': current_h1,
        'content': metadata.get('description', ''),
        'title': metadata.get('title', ''),
        'keywords': metadata.get('keywords', ''),
        'objectID': get_object_id(heading_slug),
    }

    for line in lines:
        if line.startswith('# '):
            if line[2:].strip():
                current_h1 = line[2:].strip()
            slug_match = re.match(HEADER_PATTERN, current_h1)
            if slug_match:
                current_h1 = slug_match.group(2)
                heading_slug = slug_match.group(2)
            current_subdoc['slug'] = heading_slug
            current_subdoc['url'] = f'{DOCS_PREFIX}{heading_slug}'
            current_subdoc['h1'] = current_h1
            current_subdoc['object_id'] = custom_slugify(heading_slug)
        elif line.startswith('## '):
            if current_subdoc:
                update_page_rank(current_subdoc['url'], current_subdoc['content'])
                yield from split_large_document(current_subdoc)
            current_h2 = line[3:].strip()
            slug_match = re.match(HEADER_PATTERN, current_h2)
            if slug_match:
                current_h2 = slug_match.group(2)
                heading_slug = f"{slug}#{current_h2}"
            else:
                heading_slug = f"{slug}#{custom_slugify(current_h2)}"
            current_subdoc = {
                'file_path': metadata.get('file_path', ''),
                'slug': f'{heading_slug}',
                'url': f'{DOCS_PREFIX}{heading_slug}',
                'title': current_h2,
                'h2': current_h2,
                'content': '',
                'keywords': metadata.get('keywords', ''),
                'objectID': get_object_id(f'{heading_slug}-{current_h2}')
            }
        elif line.startswith('### '):
            # note we send users to the h2 or h1 even on ###
            if current_subdoc:
                update_page_rank(current_subdoc['url'], current_subdoc['content'])
                yield from split_large_document(current_subdoc)
            current_h3 = line[4:].strip()
            slug_match = re.match(HEADER_PATTERN, current_h3)
            if slug_match:
                current_h3 = slug_match.group(2)
                heading_slug = f"{slug}#{current_h3}"
            else:
                heading_slug = f"{slug}#{custom_slugify(current_h3)}"
            current_subdoc = {
                'file_path': metadata.get('file_path', ''),
                'slug': f'{heading_slug}',
                'url': f'{DOCS_PREFIX}{heading_slug}',
                'title': current_h3,
                'h3': current_h3,
                'content': '',
                'keywords': metadata.get('keywords', ''),
                'objectID': get_object_id(f'{heading_slug}-{current_h3}')
            }
        elif line.startswith('#### '):
            if current_subdoc:
                update_page_rank(current_subdoc['url'], current_subdoc['content'])
                yield from split_large_document(current_subdoc)
            current_h4 = line[5:].strip()
            slug_match = re.match(HEADER_PATTERN, current_h4)
            if slug_match:
                current_h4 = slug_match.group(2)
            current_subdoc = {
                'file_path': metadata.get('file_path', ''),
                'slug': f'{heading_slug}',
                'url': f'{DOCS_PREFIX}{heading_slug}#',
                'title': current_h4,
                'h4': current_h4,
                'content': '',
                'keywords': metadata.get('keywords', ''),
                'objectID': get_object_id(f'{heading_slug}-{current_h4}')
            }
        elif current_subdoc:
            current_subdoc['content'] += line + '\n'

    if current_subdoc:
        update_page_rank(current_subdoc['url'], current_subdoc['content'])
        yield from split_large_document(current_subdoc)


def process_markdown_directory(root_directory, directory):
    """Recursively process Markdown files in a directory."""
    directory = os.path.abspath(directory)
    i = 0
    for root, dirs, files in os.walk(directory):
        # Skip `_snippets` and _placeholders subfolders
        dirs[:] = [d for d in dirs if d != '_snippets' and d != '_placeholders']
        for file in files:
            if file.endswith('.md') or file.endswith('.mdx'):
                md_file_path = os.path.join(root, file)
                metadata, content = parse_metadata_and_content(root_directory, md_file_path)
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


def compute_page_rank(link_data, damping_factor=0.85, max_iter=100, tol=1e-6):
    """
    Compute PageRank for a set of pages.

    :param link_data: List of tuples (source, target) representing links.
    :param damping_factor: Damping factor for PageRank.
    :param max_iter: Maximum number of iterations.
    :param tol: Convergence tolerance.
    :return: Dictionary of pages and their PageRank scores.
    """
    # Create a directed graph
    graph = nx.DiGraph()
    graph.add_edges_from(link_data)

    # Compute PageRank
    page_rank = nx.pagerank(graph, alpha=damping_factor, max_iter=max_iter, tol=tol)
    return page_rank


def main(root_directory, sub_directories, algolia_app_id, algolia_api_key, algolia_index_name, batch_size=1000,
         dry_run=False):
    client = SearchClientSync(algolia_app_id, algolia_api_key)
    batch = []
    t = 0
    docs = []
    for sub_directory in sub_directories:
        input_directory = os.path.join(root_directory, sub_directory)
        for doc in process_markdown_directory(root_directory, input_directory):
            docs.append(doc)
    page_rank_scores = compute_page_rank(link_data)
    # Add PageRank scores to the documents
    for doc in docs:
        rank = page_rank_scores.get(doc.get('url', ''), 0)
        doc['page_rank'] = int(rank * 10000000)
    for i in range(0, len(docs), batch_size):
        batch = docs[i:i + batch_size]  # Get the current batch
        if not dry_run:
            send_to_algolia(client, algolia_index_name, batch)
        else:
            for b in batch:
                print(json.dumps(b))
        print(f'{'processed' if dry_run else 'indexed'} {len(batch)} records')
        t += len(batch)
    print(f'total for {sub_directory}: {'processed' if dry_run else 'indexed'} {t} records')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Index search pages.')
    parser.add_argument(
        '-d',
        '--root_directory',
        help='Path to root directory of docs repo'
    )
    parser.add_argument(
        '-p',
        '--doc_paths',
        default="docs/en,knowledgebase",
        help='Sub path directories to index'
    )
    parser.add_argument(
        '-x',
        '--dry_run',
        action='store_true',
        help='Dry run, do not send results to Algolia.'
    )
    parser.add_argument('--algolia_app_id', required=True, help='Algolia Application ID')
    parser.add_argument('--algolia_api_key', required=True, help='Algolia Admin API Key')
    parser.add_argument('--algolia_index_name', required=True, help='Algolia Index Name')
    args = parser.parse_args()
    if args.dry_run:
        print('Dry running, not sending results to Algolia.')
    sub_directories = [p.strip() for p in args.doc_paths.split(',')]
    main(args.root_directory, sub_directories, args.algolia_app_id, args.algolia_api_key, args.algolia_index_name,
         dry_run=args.dry_run)
