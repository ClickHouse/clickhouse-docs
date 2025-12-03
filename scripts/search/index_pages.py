import argparse
import json
import os
import re
import sys
from ruamel.yaml import YAML
from slugify import slugify
from algoliasearch.search.client import SearchClientSync
import networkx as nx
from urllib.parse import urlparse, urlunparse

IGNORE_FILES = ["index.md"]

SUB_DIRECTORIES = {
    "docs": "https://clickhouse.com/docs",
    "knowledgebase": "https://clickhouse.com/docs/knowledgebase",
}

LOCALE_CONFIG = {
    'en': {
        'base_path': '',  # docs/ and knowledgebase/ at root
        'url_prefix': '',
        'index_suffix': ''
    },
    'jp': {
        'base_path': 'i18n/jp/docusaurus-plugin-content-docs/current',
        'url_prefix': '/jp',
        'index_suffix': '-jp'
    },
    'zh': {
        'base_path': 'i18n/zh/docusaurus-plugin-content-docs/current',
        'url_prefix': '/zh',
        'index_suffix': '-zh'
    },
    'ru': {
        'base_path': 'i18n/ru/docusaurus-plugin-content-docs/current',
        'url_prefix': '/ru',
        'index_suffix': '-ru'
    }
}

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'settings.json'), 'r') as f:
    settings = json.load(f)
HEADER_PATTERN = re.compile(r"^(.*?)(?:\s*\{#(.*?)\})$")
object_ids = set()
files_processed = set()
link_data = []


def get_doc_type_rank(doc_type):
    """Return numeric rank for doc_type to use in Algolia customRanking."""
    ranks = {
        'guide': 3,
        'reference': 3,
        'changelog': 1,
        'landing_page': 1
    }
    return ranks.get(doc_type, 2)  # Default to 2 for unspecified types


def split_url_and_anchor(url):
    parsed_url = urlparse(url)
    url_without_anchor = urlunparse(parsed_url._replace(fragment=""))
    anchor = parsed_url.fragment
    return url_without_anchor, anchor


def read_metadata(text):
    parts = text.split("\n")
    metadata = {}
    for part in parts:
        parts = part.split(":")
        if len(parts) == 2:
            if parts[0] in ['title', 'description', 'slug', 'keywords', 'score', 'doc_type']:
                value = parts[1].strip()
                # Strip quotes only from doc_type
                if parts[0] == 'doc_type':
                    value = value.strip("'\"")
                metadata[parts[0]] = int(value) if parts[0] == 'score' else value
    return metadata


def parse_metadata_and_content(directory, base_directory, md_file_path, log_snippet_failure=True):
    """Parse multiple metadata blocks and content from a Markdown file."""
    try:
        with open(md_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
    except:
        if log_snippet_failure:
            print(f"Warning: couldn't read metadata from {md_file_path}")
        return {}, ''
    content = clean_content(content)
    # Inject any snippets
    content = inject_snippets(base_directory, content)
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
    # Note: we assume last sub folder in directory is in url
    slug = metadata.get('slug', metadata['file_path'].replace(directory, ''))
    for p in ['.md', '.mdx', '"', "'"]:
        slug = slug.removeprefix(p).removesuffix(p)
    slug = slug.removesuffix('/')
    content = re.sub(r'^import .+?from .+?$', '', content, flags=re.MULTILINE)  # remove import
    content = re.sub(r'<[A-Za-z0-9_-]+\s*[^>]*\/>', '', content)  # report components
    metadata['slug'] = slug
    metadata['title'] = metadata.get('title', '').strip()
    return metadata, content


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


def clean_content(content):
    content = re.sub(r'\\(\S)', r'\\\\\1', content)  # Replace `\` followed by a non-whitespace character
    content = re.sub(r'```.*?```', '', content, flags=re.DOTALL)  # replace code blocks
    content = re.sub(r'<iframe.*?</iframe>', '', content, flags=re.DOTALL) # remove iframe
    content = re.sub(r'<div.*?</div>', '', content, flags=re.DOTALL)
    return content


def inject_snippets(directory, content):
    snippet_pattern = re.compile(
        r"import\s+(\w+)\s+from\s+['\"]@site/(docs/(.*?))['\"];",
        re.DOTALL
    )
    matches = snippet_pattern.findall(content)
    snippet_map = {}

    for snippet_name, snippet_full_path, _ in matches:
        full_path = os.path.join(directory, snippet_full_path)
        if full_path not in files_processed:  # we dont index snippets more than once
            if os.path.exists(full_path):
                with open(full_path, 'r', encoding='utf-8') as snippet_file:
                    snippet_map[snippet_name] = clean_content(snippet_file.read())
                    files_processed.add(full_path)
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


def remove_markdown_links(text):
    # Remove inline Markdown links: [text](url)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    # Remove autolinks: <http://example.com>
    text = re.sub(r'<https?://[^>]+>', '', text)
    return text


# best effort at creating links between docs - handling both md and urls. Challenge here some files import others
# e.g. /opt/clickhouse-docs/docs/en/sql-reference/formats.mdx - we don't recursively resolve here
def update_page_links(directory, base_directory, page_path, url, content, base_url):
    links = extract_links_from_content(content)
    fail = False
    for target in links:
        if target.endswith('.md') and not target.startswith('https'):
            if os.path.isabs(target):
                c_page = os.path.abspath(directory + '/' + target)
            else:
                c_page = os.path.abspath(os.path.join(os.path.dirname(page_path), './' + target))
            metadata, _ = parse_metadata_and_content(directory, base_directory, c_page, log_snippet_failure=False)
            if 'slug' in metadata:
                link_data.append((url, f"{base_url}{metadata.get('slug')}"))
            else:
                fail = True
        elif target.startswith('/'):  # ignore external links
            target = target.removesuffix('/')
            link_data.append((url, f"{base_url}{target}"))
    if fail:
        print(f"Warning: couldn't resolve link for {page_path}")


def parse_markdown_content(metadata, content, base_url):
    """Parse the Markdown content and generate sub-documents for each ##, ###, and #### heading."""
    slug = metadata['slug']
    heading_slug = slug
    lines = content.splitlines()
    current_h1 = metadata.get('title', '')
    current_h2 = None
    current_h3 = None
    current_subdoc = {
        'file_path': metadata.get('file_path', ''),
        'slug': slug,
        'url': f'{base_url}{heading_slug}',
        'h1': current_h1,
        'h1_camel': current_h1,
        'title': metadata.get('title', ''),
        'content': metadata.get('description', ''),
        'keywords': metadata.get('keywords', ''),
        'objectID': get_object_id(heading_slug),
        'type': 'lvl1',
        'hierarchy': {
            'lvl0': current_h1,
            'lvl1': current_h1
        },
        'score': metadata.get('score', 0),
        'doc_type': metadata.get('doc_type', ''),
        'doc_type_rank': get_doc_type_rank(metadata.get('doc_type', ''))
    }
    for line in lines:
        if line.startswith('# '):
            if line[2:].strip():
                current_h1 = line[2:].strip()
            slug_match = re.match(HEADER_PATTERN, current_h1)
            if slug_match:
                current_h1 = slug_match.group(1)
                heading_slug = f"{slug}"
            current_subdoc['slug'] = heading_slug
            current_subdoc['url'] = f'{base_url}{heading_slug}'
            current_subdoc['h1'] = current_h1
            current_subdoc['h1_camel'] = current_h1
            current_subdoc['title'] = current_h1
            current_subdoc['type'] = 'lvl1'
            current_subdoc['object_id'] = custom_slugify(heading_slug)
            current_subdoc['hierarchy']['lvl1'] = current_h1
            current_subdoc['hierarchy']['lvl0'] = current_h1 if metadata.get('title', '') == '' else metadata.get('title', '')
        elif line.startswith('## '):
            if current_subdoc:
                yield from split_large_document(current_subdoc)
            current_h2 = line[3:].strip()
            slug_match = re.match(HEADER_PATTERN, current_h2)
            if slug_match:
                current_h2 = slug_match.group(1)
                heading_slug = f"{slug}#{slug_match.group(2)}"
            else:
                heading_slug = f"{slug}#{custom_slugify(current_h2)}"
            current_subdoc = {
                'file_path': metadata.get('file_path', ''),
                'slug': f'{heading_slug}',
                'url': f'{base_url}{heading_slug}',
                'title': current_h2,
                'h2': current_h2,
                'h2_camel': current_h2,
                'content': '',
                'keywords': metadata.get('keywords', ''),
                'objectID': get_object_id(f'{heading_slug}-{current_h2}'),
                'type': 'lvl2',
                'hierarchy': {
                    'lvl0': current_h1 if metadata.get('title', '') == '' else metadata.get('title', ''),
                    'lvl1': current_h1,
                    'lvl2': current_h2,
                },
                'doc_type': metadata.get('doc_type', ''),
                'doc_type_rank': get_doc_type_rank(metadata.get('doc_type', ''))
            }
        elif line.startswith('### '):
            # note we send users to the h2 or h1 even on ###
            if current_subdoc:
                yield from split_large_document(current_subdoc)
            current_h3 = line[4:].strip()
            slug_match = re.match(HEADER_PATTERN, current_h3)
            if slug_match:
                current_h3 = slug_match.group(1)
                heading_slug = f"{slug}#{slug_match.group(2)}"
            else:
                heading_slug = f"{slug}#{custom_slugify(current_h3)}"
            current_subdoc = {
                'file_path': metadata.get('file_path', ''),
                'slug': f'{heading_slug}',
                'url': f'{base_url}{heading_slug}',
                'title': current_h3,
                'h3': current_h3,
                'h3_camel': current_h3,
                'content': '',
                'keywords': metadata.get('keywords', ''),
                'objectID': get_object_id(f'{heading_slug}-{current_h3}'),
                'type': 'lvl3',
                'hierarchy': {
                    'lvl0': current_h1 if metadata.get('title', '') == '' else metadata.get('title', ''),
                    'lvl1': current_h1,
                    'lvl2': current_h2,
                    'lvl3': current_h3,
                },
                'doc_type': metadata.get('doc_type', ''),
                'doc_type_rank': get_doc_type_rank(metadata.get('doc_type', ''))
            }
        elif line.startswith('#### '):
            if current_subdoc:
                yield from split_large_document(current_subdoc)
            current_h4 = line[5:].strip()
            slug_match = re.match(HEADER_PATTERN, current_h4)
            if slug_match:
                current_h4 = slug_match.group(1)
            current_subdoc = {
                'file_path': metadata.get('file_path', ''),
                'slug': f'{heading_slug}',
                'url': f'{base_url}{heading_slug}',
                'title': current_h4,
                'h4': current_h4,
                'h4_camel': current_h4,
                'content': '',
                'keywords': metadata.get('keywords', ''),
                'objectID': get_object_id(f'{heading_slug}-{current_h4}'),
                'type': 'lvl4',
                'hierarchy': {
                    'lvl0': current_h1 if metadata.get('title', '') == '' else metadata.get('title', ''),
                    'lvl1': current_h1,
                    'lvl2': current_h2,
                    'lvl3': current_h3,
                    'lvl4': current_h4,
                },
                'doc_type': metadata.get('doc_type', ''),
                'doc_type_rank': get_doc_type_rank(metadata.get('doc_type', ''))
            }
        elif current_subdoc:
            current_subdoc['content'] += line + '\n'

    if current_subdoc:
        yield from split_large_document(current_subdoc)


def process_markdown_directory(directory, base_directory, base_url):
    """Recursively process Markdown files in a directory."""
    for root, dirs, files in os.walk(directory):
        # Skip `_snippets` and _placeholders subfolders
        dirs[:] = [d for d in dirs if d != '_snippets' and d != '_placeholders']
        for file in files:
            relative_file_path = os.path.relpath(os.path.join(root, file), directory)
            if (file.endswith('.md') or file.endswith('.mdx')) and relative_file_path not in IGNORE_FILES:
                md_file_path = os.path.join(root, file)
                if md_file_path not in files_processed:
                    files_processed.add(md_file_path)
                    metadata, content = parse_metadata_and_content(directory, base_directory, md_file_path)
                    for sub_doc in parse_markdown_content(metadata, content, base_url):
                        url_without_anchor, anchor = split_url_and_anchor(sub_doc['url'])
                        sub_doc['url_without_anchor'] = url_without_anchor
                        sub_doc['anchor'] = anchor
                        update_page_links(directory, base_directory, metadata.get('file_path', ''), sub_doc['url'],
                                          sub_doc['content'], base_url)
                        sub_doc['content'] = remove_markdown_links(sub_doc['content'])
                        yield sub_doc


def send_to_algolia(client, index_name, records):
    """Send records to Algolia."""
    if records:
        client.save_objects(index_name, records)
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


def create_new_index(client, index_name):
    try:
        client.delete_index(index_name)
        print(f"Temporary index '{index_name}' deleted successfully.")
    except:
        print(f"Temporary index '{index_name}' does not exist or could not be deleted")
    client.set_settings(index_name, settings['settings'])
    client.save_rules(index_name, settings['rules'])
    print(f"Settings applied to temporary index '{index_name}'.")


def main(base_directory, algolia_app_id, algolia_api_key, algolia_index_name,
         batch_size=1000, dry_run=False, locale='en'):
    # Get locale configuration
    locale_config = LOCALE_CONFIG.get(locale)
    if not locale_config:
        print(f"Error: Unsupported locale '{locale}'")
        sys.exit(1)
    
    # Update index name with locale suffix
    algolia_index_name = f"{algolia_index_name}{locale_config['index_suffix']}"
    temp_index_name = f"{algolia_index_name}_temp"
    client = SearchClientSync(algolia_app_id, algolia_api_key)
    if not dry_run:
        create_new_index(client, temp_index_name)
    docs = []
    
    # For non-English locales, use the locale-specific path
    if locale == 'en':
        # Process standard docs and knowledgebase directories
        for sub_directory, base_url in SUB_DIRECTORIES.items():
            directory = os.path.join(base_directory, sub_directory)
            for doc in process_markdown_directory(directory, base_directory, base_url):
                docs.append(doc)
    else:
        # Process locale-specific documentation
        locale_path = os.path.join(base_directory, locale_config['base_path'])
        # Update base URL with locale suffix
        base_url = f"https://clickhouse.com/docs{locale_config['url_prefix']}"
        for doc in process_markdown_directory(locale_path, base_directory, base_url):
            docs.append(doc)
    page_rank_scores = compute_page_rank(link_data)
    # Add PageRank scores to the documents
    t = 0
    for doc in docs:
        rank = page_rank_scores.get(doc.get('url', ''), 0)
        doc['page_rank'] = int(rank * 10000000)
    for i in range(0, len(docs), batch_size):
        batch = docs[i:i + batch_size]  # Get the current batch
        if not dry_run:
            send_to_algolia(client, temp_index_name, batch)
        else:
            for d in batch:
                print(f"{d['url']} - {d['page_rank']}")
            # Print a sample record to verify doc_type is included
            if batch:
                print("\n--- Sample record ---")
                sample_record = batch[0]
                print(f"Title: {sample_record.get('title', 'N/A')}")
                print(f"URL: {sample_record.get('url', 'N/A')}")
                print(f"Type: {sample_record.get('type', 'N/A')}")
                print(f"Doc Type: {sample_record.get('doc_type', 'N/A')}")
                print(f"Doc Type Rank: {sample_record.get('doc_type_rank', 'N/A')}")
                print(f"Keywords: {sample_record.get('keywords', 'N/A')}")
                print("--- End sample ---\n")
        print(f"{'processed' if dry_run else 'indexed'} {len(batch)} records")
        t += len(batch)
    print(f"total {'processed' if dry_run else 'indexed'} {t} records")
    if not dry_run:
        print('switching temporary index...', end='')
        client.operation_index(temp_index_name, {"operation": "move", "destination": algolia_index_name})
    print('done')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Index search pages.')
    parser.add_argument(
        '-d',
        '--base_directory',
        help='Path to root directory of docs repo'
    )
    parser.add_argument(
        '-x',
        '--dry_run',
        action='store_true',
        help='Dry run, do not send results to Algolia.'
    )
    parser.add_argument('--algolia_app_id', required=True, help='Algolia Application ID')
    parser.add_argument('--algolia_api_key', required=True, help='Algolia Admin API Key')
    parser.add_argument('--algolia_index_name', default='clickhouse', help='Algolia Index Name')
    parser.add_argument(
        '--locale',
        default='en',
        choices=['en', 'jp', 'zh', 'ru'],
        help='Locale to index (default: en)'
    )
    args = parser.parse_args()
    if args.dry_run:
        print('Dry running, not sending results to Algolia.')
    print(f'Indexing locale: {args.locale}')
    main(args.base_directory, args.algolia_app_id, args.algolia_api_key, args.algolia_index_name,
         dry_run=args.dry_run, locale=args.locale)