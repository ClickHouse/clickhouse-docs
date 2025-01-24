import csv
import math
import argparse
from algoliasearch.search.client import SearchClientSync

ALGOLIA_INDEX_NAME = "clickhouse"


# Initialize Algolia client
ALGOLIA_APP_ID = "5H9UG7CX5W"
ALGOLIA_API_KEY = "4a7bf25cf3edbef29d78d5e1eecfdca5"

# old search engine using crawler
# ALGOLIA_APP_ID = "62VCH2MD74"
# ALGOLIA_API_KEY = "b78244d947484fe3ece7bc5472e9f2af"


client = SearchClientSync(ALGOLIA_APP_ID, ALGOLIA_API_KEY)

def compute_dcg(relevance_scores):
    """Compute Discounted Cumulative Gain (DCG)."""
    return sum(rel / math.log2(idx + 2) for idx, rel in enumerate(relevance_scores))


def compute_ndcg(expected_links, retrieved_links, k):
    """Compute normalized DCG."""
    relevance_scores = [1 if link in expected_links else 0 for link in retrieved_links[:k]]
    dcg = compute_dcg(relevance_scores)

    ideal_relevance_scores = [1] * min(len(expected_links), k)
    idcg = compute_dcg(ideal_relevance_scores)

    return dcg / idcg if idcg > 0 else 0


def main(input_csv, detailed, k=3):
    """Main function to compute nDCG for search terms in a CSV."""
    with open(input_csv, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        rows = list(reader)
    results = []
    total_ndcg = 0

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
    args = parser.parse_args()

    main(args.input_csv, args.detailed)
