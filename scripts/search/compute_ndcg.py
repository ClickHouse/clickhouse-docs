import csv
import math
import argparse
from urllib.parse import urlparse
from bs4 import BeautifulSoup

import requests
from algoliasearch.search.client import SearchClientSync

ALGOLIA_INDEX_NAME = "clickhouse"

# dev details
ALGOLIA_APP_ID = "7AL1W7YVZK"
ALGOLIA_API_KEY = "43bd50d4617a97c9b60042a2e8a348f9"

# Prod details
# ALGOLIA_APP_ID = "5H9UG7CX5W"
# ALGOLIA_API_KEY = "4a7bf25cf3edbef29d78d5e1eecfdca5"


client = SearchClientSync(ALGOLIA_APP_ID, ALGOLIA_API_KEY)

def compute_dcg(relevance_scores):
    """Compute Discounted Cumulative Gain (DCG)."""
    return sum(rel / math.log2(idx + 2) for idx, rel in enumerate(relevance_scores))


def verify_link(link):
    if not link:
        return True
    """Verify that a given link is valid and exists, including checking anchor existence."""
    parsed_url = urlparse(link)
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"
    anchor = parsed_url.fragment  # Extract anchor if present

    try:
        response = requests.get(base_url, timeout=10, allow_redirects=True)
        response.raise_for_status()  # Raise an error for HTTP failures (4xx, 5xx)
    except requests.RequestException as e:
        print(f"Error: Unable to reach {base_url} - {e}")
        exit(1)

    # If no anchor, the base page is sufficient
    if not anchor:
        return True

    # Parse the page and check for the anchor
    soup = BeautifulSoup(response.text, 'html.parser')
    element = soup.find(id=anchor) or soup.find(attrs={"name": anchor})  # Check for both `id` and `name`

    if not element:
        print(f"Error: Anchor #{anchor} not found in {base_url}")
        exit(1)

def compute_ndcg(expected_links, retrieved_links, k):
    """Compute normalized DCG."""
    relevance_scores = [1 if link in expected_links else 0 for link in retrieved_links[:k]]
    dcg = compute_dcg(relevance_scores)

    ideal_relevance_scores = [1] * min(len(expected_links), k)
    idcg = compute_dcg(ideal_relevance_scores)

    return dcg / idcg if idcg > 0 else 0


def main(input_csv, detailed, validate, k=3):
    """Main function to compute nDCG for search terms in a CSV."""
    with open(input_csv, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        rows = list(reader)
    results = []
    total_ndcg = 0

    if validate:
        print("Validating links...")
        for row in rows:
            for link in row[1:4]:
                if link:
                    print(f"Checking link {link}...", end="")
                    verify_link(link)
                    print("OK")
        print("All links validated.")
    else:
        print("Skipping link validation.")

    for row in rows:
        term = row[0]
        # Remove duplicates in expected links - can happen as some docs return same url
        expected_links = list(dict.fromkeys([link for link in row[1:4] if link]))  # Ensure uniqueness

        # Query Algolia
        response = client.search(
            search_method_params={
                "requests": [
                    {
                        "indexName": ALGOLIA_INDEX_NAME,
                        "query": term,
                        "hitsPerPage": k,
                    },
                ],
            },
        )
        retrieved_links = [hit.url for hit in response.results[0].actual_instance.hits]

        # Compute nDCG
        ndcg = compute_ndcg(expected_links, retrieved_links, k)
        total_ndcg += ndcg
        results.append({"term": term, "nDCG": ndcg})

    # Sort results by descending nDCG
    results.sort(key=lambda x: x['nDCG'], reverse=True)

    # Display results
    if detailed:
        print("\nSearch Term\t\tnDCG")
        print("=" * 30)
        for result in results:
            print(f"{result['term']}\t\t{result['nDCG']:.4f}")

    # Calculate Mean nDCG
    mean_ndcg = total_ndcg / len(rows) if rows else 0
    print(f"Mean nDCG: {mean_ndcg:.4f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Compute nDCG for Algolia search results.")
    parser.add_argument(
        "input_csv",
        nargs="?",
        default="results.csv",
        help="Path to the input CSV file (default: results.csv)."
    )
    parser.add_argument(
        "-d",
        "--detailed",
        action="store_true",
        help="Print detailed results for each search term."
    )
    parser.add_argument(
        "-v",
        "--validate",
        action="store_true",
        help="Validate links."
    )
    args = parser.parse_args()

    main(args.input_csv, args.detailed, args.validate)
