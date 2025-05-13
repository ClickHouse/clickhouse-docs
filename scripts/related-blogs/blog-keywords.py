import os
from openai import OpenAI
import json
import time
import requests

KEYWORDS_FILE_PATH = 'keywords.json'
ERROR_LOG_DIR = 'error_logs' # Store error logs in a subdirectory
OPENAI_ERROR_LOG_PATH = os.path.join(ERROR_LOG_DIR, 'openai_error.log')
ALGOLIA_ERROR_LOG_PATH = os.path.join(ERROR_LOG_DIR, 'algolia_error.log')

# Create error log directory if it doesn't exist
os.makedirs(ERROR_LOG_DIR, exist_ok=True)

required_vars = {
    "ALGOLIA_APP_ID": os.getenv("ALGOLIA_APP_ID"),
    "ALGOLIA_WRITE_KEY": os.getenv("ALGOLIA_WRITE_KEY"),
    "ALGOLIA_INDEX_NAME": os.getenv("ALGOLIA_INDEX_NAME", "clickhouse_blogs_articles"), # Default if not set
    "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY")
}

missing_vars = [var_name for var_name, value in required_vars.items() if not value]

if missing_vars:
    missing_list = ", ".join(missing_vars)
    raise RuntimeError(f"Missing required environment variables: {missing_list}\n")

openai_client = OpenAI(api_key=required_vars["OPENAI_API_KEY"])

def log_error(log_file_path, error_message, content_info=None):
    """Helper function to log errors to a specified file."""
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    with open(log_file_path, 'a', encoding='utf-8') as f:
        f.write(f"{timestamp} - {error_message}\n")
        if content_info:
            for key, value in content_info.items():
                f.write(f"  {key}: {str(value)}\n") # Ensure value is string
        f.write("-" * 80 + "\n")

def load_existing_keywords():
    if os.path.exists(KEYWORDS_FILE_PATH):
        try:
            with open(KEYWORDS_FILE_PATH, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content:
                    return json.loads(content)
                else:
                    print(f"Info: {KEYWORDS_FILE_PATH} exists but is empty. Starting with an empty keywords dictionary.")
        except json.JSONDecodeError as e:
            print(f"Warning: Error loading keywords from {KEYWORDS_FILE_PATH}: {str(e)}. Backing up corrupted file.")
            backup_path = f"{KEYWORDS_FILE_PATH}.bak.{int(time.time())}"
            try:
                if os.path.exists(KEYWORDS_FILE_PATH): # Ensure file exists before renaming
                    os.rename(KEYWORDS_FILE_PATH, backup_path)
                    print(f"Backed up corrupted file to {backup_path}")
                else:
                    print(f"Warning: Corrupted file {KEYWORDS_FILE_PATH} disappeared before backup.")
            except OSError as ose:
                print(f"Warning: Could not back up corrupted file {KEYWORDS_FILE_PATH} to {backup_path}: {ose}")
    return {}

def save_keywords_to_file(keywords_data):
    temp_path = f"{KEYWORDS_FILE_PATH}.tmp"
    try:
        with open(temp_path, 'w', encoding='utf-8') as f:
            json.dump(keywords_data, f, indent=4)
        os.replace(temp_path, KEYWORDS_FILE_PATH)
    except IOError as e:
        print(f"CRITICAL IO ERROR: Failed to save keywords to {KEYWORDS_FILE_PATH} via temp file {temp_path}. Error: {e}")
        # Attempt to save to a backup path as a last resort if os.replace failed
        try:
            backup_save_path = f"{KEYWORDS_FILE_PATH}.save_error.{int(time.time())}"
            with open(backup_save_path, 'w', encoding='utf-8') as bf:
                json.dump(keywords_data, bf, indent=4)
            print(f"CRITICAL IO ERROR: Keywords saved to emergency backup {backup_save_path} instead.")
        except IOError as ioe_backup:
            print(f"CRITICAL IO ERROR: Failed to save keywords to emergency backup path as well. Error: {ioe_backup}. DATA MAY BE LOST IF SCRIPT TERMINATES AND MAIN FILE IS CORRUPT.")

def generate_keywords(content_text: str, article_url: str = "N/A") -> list[str]:
    """
    Generates keywords for the given content using OpenAI API.
    Aims for a clean JSON list response.
    """
    system_prompt_content = """You are an AI assistant that extracts keywords from text.
Your task is to identify exactly 5 most relevant keywords from the provided ClickHouse blog post content.
Focus on terms that are highly specific and likely to appear in ClickHouse technical documentation, such as specific functions (e.g., `groupArray`, `arrayJoin`), table engines (e.g., `MergeTree`, `ReplacingMergeTree`), data formats (e.g., `Parquet`, `Arrow`), or unique ClickHouse concepts (e.g., `materialized views`, `sharding`, `replication`).
Do NOT include the keyword "ClickHouse" itself.
Avoid generic technical terms unless they are part of a very specific ClickHouse feature (e.g., "vector search" is ok if specifically about ClickHouse vector search, but "performance", "scalability", "database", "query", "data", "analytics", "big data", "cloud" are too generic).
The response MUST be a valid JSON object containing a single key "keywords" whose value is a JSON array of exactly 5 strings.
Example: {"keywords": ["groupArray", "MergeTree", "Parquet", "materialized views", "sharding"]}
Ensure the entire response body is ONLY this JSON object, with no additional text, comments, or markdown formatting surrounding it.
"""

    user_prompt = f"""Here is the ClickHouse blog post content:
\"\"\"{content_text}\"\"\"
Extract the 5 most relevant keywords based on the instructions.
"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=[
                {"role": "system", "content": system_prompt_content},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )
    except Exception as e:
        error_msg = f"OpenAI API request failed for article {article_url}: {str(e)}"
        print(f"Error: {error_msg}")
        log_error(OPENAI_ERROR_LOG_PATH, error_msg, {"article_url": article_url, "content_length": len(content_text)})
        raise RuntimeError(error_msg)

    if not response.choices or not response.choices[0].message or not response.choices[0].message.content:
        error_msg = f"OpenAI API returned an unexpected or empty response structure for article {article_url}."
        print(f"Error: {error_msg}")
        log_error(OPENAI_ERROR_LOG_PATH, error_msg, {"article_url": article_url, "raw_response_object": str(response)})
        raise RuntimeError(error_msg)

    raw_response_content = response.choices[0].message.content

    try:
        data = json.loads(raw_response_content.strip())

        if not isinstance(data, dict):
            raise ValueError("Response is not a JSON object (dictionary).")

        keywords = data.get("keywords")
        if keywords is None:
            raise ValueError("JSON object does not contain 'keywords' key.")

        if not isinstance(keywords, list):
            raise ValueError("'keywords' field is not a JSON array (list).")

        if not all(isinstance(kw, str) for kw in keywords):
            raise ValueError("Not all items in 'keywords' array are strings.")

        # Optional: Strict check for the number of keywords.
        # The prompt asks for 5. If it's critical, enforce it here.
        # if len(keywords) != 5:
        #     warning_msg = f"OpenAI returned {len(keywords)} keywords for {article_url}, expected 5. Using them anyway."
        #     print(f"Warning: {warning_msg}")
        #     log_error(OPENAI_ERROR_LOG_PATH, warning_msg, {"article_url": article_url, "response": raw_response_content})

        return [kw for kw in keywords if kw] # Filter out potential empty strings

    except (json.JSONDecodeError, ValueError) as e:
        error_msg = f"Failed to parse OpenAI response as valid keyword JSON for article {article_url}: {str(e)}"
        print(f"Error: {error_msg}")
        log_error(OPENAI_ERROR_LOG_PATH, error_msg, {
            "article_url": article_url,
            "raw_response": raw_response_content[:500] + "..." if len(raw_response_content) > 500 else raw_response_content
        })
        raise RuntimeError(error_msg)


class AlgoliaAPI:
    def __init__(self, app_id, api_key, index_name):
        self.app_id = app_id
        self.api_key = api_key
        self.index_name = index_name
        self.base_url = f"https://{app_id}.algolia.net/1/indexes/{index_name}"
        self.session = requests.Session()
        self.session.headers.update({
            "X-Algolia-API-Key": api_key,
            "X-Algolia-Application-Id": app_id,
            "Content-Type": "application/json"
        })

    def browse(self, params=None):
        effective_params = {'hitsPerPage': 1000} # Default, consider making configurable
        if params:
            effective_params.update(params)

        try:
            response = self.session.get(
                f"{self.base_url}/browse",
                params=effective_params,
                timeout=30 # Added timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            error_msg = f"Algolia browse request failed: {str(e)}"
            print(f"Error: {error_msg}")
            log_error(ALGOLIA_ERROR_LOG_PATH, error_msg, {"params": effective_params})
            raise RuntimeError(error_msg)

    def browse_from(self, cursor):
        try:
            response = self.session.get(
                f"{self.base_url}/browse",
                params={'cursor': cursor},
                timeout=30 # Added timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            error_msg = f"Algolia browse_from request failed with cursor: {str(e)}"
            print(f"Error: {error_msg}")
            log_error(ALGOLIA_ERROR_LOG_PATH, error_msg, {"cursor_start": cursor[:50] if cursor else "N/A"})
            raise RuntimeError(error_msg)

    def partial_update_objects(self, objects_to_update):
        if not objects_to_update:
            print("Info: No objects to update in Algolia for this batch.")
            return {"message": "No objects to update."} # Return a dict similar to successful API response
        try:
            response = self.session.post(
                f"{self.base_url}/batch",
                json={
                    "requests": [
                        {
                            "action": "partialUpdateObject",
                            "body": obj_data, # Contains 'keywords'
                            "objectID": obj_data['objectID']
                        } for obj_data in objects_to_update # obj_data is {'objectID': id, 'keywords': [...]}
                    ]
                },
                timeout=60 # Batch updates can take longer
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            error_msg = f"Algolia partial_update_objects batch request failed: {str(e)}"
            object_ids_sample = [obj.get('objectID', 'N/A') for obj in objects_to_update[:3]]
            print(f"Error: {error_msg}")
            log_error(ALGOLIA_ERROR_LOG_PATH, error_msg, {"num_objects": len(objects_to_update), "sample_object_ids": object_ids_sample })
            return None # Indicate failure for this batch


def process_records():
    algolia = AlgoliaAPI(
        required_vars["ALGOLIA_APP_ID"],
        required_vars["ALGOLIA_WRITE_KEY"],
        required_vars["ALGOLIA_INDEX_NAME"]
    )

    existing_keywords = load_existing_keywords()
    cursor = None
    total_records_fetched = 0
    total_processed_for_keywords = 0
    total_skipped_due_to_cache = 0
    total_newly_generated = 0
    total_failed_generation = 0
    total_algolia_updates_submitted = 0

    try:
        while True:
            print(f"\nFetching new batch of records from Algolia... (Cursor active: {cursor is not None})")
            try:
                response_data = algolia.browse_from(cursor) if cursor else algolia.browse()
            except RuntimeError as e:
                print(f"Critical error fetching from Algolia, cannot continue: {e}")
                break

            hits = response_data.get('hits', [])
            current_cursor = response_data.get('cursor')
            total_records_fetched += len(hits)

            if not hits and not current_cursor:
                print("No more hits from Algolia and no new cursor. Processing complete.")
                break
            if not hits and current_cursor:
                print("No hits in current page, but cursor exists. Continuing to next page.")
                cursor = current_cursor # Update cursor to continue
                continue

            cursor = current_cursor # Update cursor for the next iteration

            updates_for_algolia_batch = []
            batch_newly_generated = 0
            batch_skipped_cache = 0
            batch_failed_generation = 0

            for i, hit in enumerate(hits):
                total_processed_for_keywords +=1
                # print(f"\nProcessing record {i+1}/{len(hits)} in current batch (Total for keywords: {total_processed_for_keywords})")
                url = hit.get('url')
                object_id = hit.get('objectID')

                if not url or not object_id:
                    print(f"Warning: Skipping record with missing URL or objectID. ObjectID: {object_id}, URL: {url}")
                    continue

                if url in existing_keywords:
                    # print(f"Found in cache: {url}")
                    keywords_for_hit = existing_keywords[url]
                    total_skipped_due_to_cache +=1
                    batch_skipped_cache +=1
                else:
                    print(f"Not in cache, generating keywords for: {url} (ObjectID: {object_id})")
                    content = hit.get('content') or hit.get('body', '')
                    if not content:
                        print(f"Warning: No content found for {url} (ObjectID: {object_id}). Skipping keyword generation.")
                        log_error(OPENAI_ERROR_LOG_PATH, "No content for keyword generation.", {"article_url": url, "object_id": object_id})
                        total_failed_generation +=1 # Count as a failure type
                        batch_failed_generation +=1
                        continue

                    max_chars = 30000
                    if len(content) > max_chars:
                        print(f"Info: Content for {url} is long ({len(content)} chars). Truncating to {max_chars} chars for OpenAI.")
                        content = content[:max_chars]

                    try:
                        keywords_for_hit = generate_keywords(content, article_url=url)
                        existing_keywords[url] = keywords_for_hit
                        total_newly_generated += 1
                        batch_newly_generated +=1
                        print(f"Generated keywords for {url}: {keywords_for_hit}")
                    except RuntimeError: # Error already logged by generate_keywords
                        print(f"Failed to generate keywords for {url}. This item will not be updated with new keywords.")
                        total_failed_generation +=1
                        batch_failed_generation +=1
                        continue

                updates_for_algolia_batch.append({
                    'objectID': object_id,
                    'keywords': keywords_for_hit
                })

                # Save keyword progress frequently if new keywords were added or if it was a cache hit
                # This ensures that even if Algolia update fails, the generated/retrieved keywords are safe
                if url not in existing_keywords or keywords_for_hit: # simplified condition
                    save_keywords_to_file(existing_keywords)

                time.sleep(0.5) # Rate limiting for OpenAI API

            print(f"\nBatch summary: Processed for keywords={len(hits)}, New keywords={batch_newly_generated}, From cache={batch_skipped_cache}, Failed generation={batch_failed_generation}")

            if updates_for_algolia_batch:
                print(f"Attempting to update {len(updates_for_algolia_batch)} records in Algolia...")
                update_result = algolia.partial_update_objects(updates_for_algolia_batch)
                if update_result and update_result.get('taskID'):
                    total_algolia_updates_submitted += len(updates_for_algolia_batch)
                    print(f"Successfully submitted {len(updates_for_algolia_batch)} updates to Algolia. Task ID: {update_result.get('taskID')}")
                else:
                    print(f"Failed to submit updates to Algolia for {len(updates_for_algolia_batch)} records this batch. Check algolia_error.log. Keywords are saved locally.")
            else:
                print("No records to update in Algolia for this batch (either all failed generation or were skipped).")

            save_keywords_to_file(existing_keywords) # Save after each batch processing and Algolia update attempt
            print("Local keyword cache saved after batch processing.")

            if not cursor: # If Algolia signals no more data
                print("\nNo more records to process from Algolia (cursor is null after current batch).")
                break
            print("-" * 60)

    except KeyboardInterrupt:
        print("\n--- KeyboardInterrupt Detected ---")
        log_error(OPENAI_ERROR_LOG_PATH, "Process interrupted by user (KeyboardInterrupt).")
    except Exception as e:
        print(f"\n--- An unexpected error occurred in the main processing loop: {str(e)} ---")
        import traceback
        log_error(OPENAI_ERROR_LOG_PATH, f"Unhandled exception in process_records: {str(e)}\n{traceback.format_exc()}")
    finally:
        print("\n--- Processing Summary ---")
        print(f"Total records fetched from Algolia: {total_records_fetched}")
        print(f"Total records attempted for keyword processing: {total_processed_for_keywords}")
        print(f"Keywords taken from local cache: {total_skipped_due_to_cache}")
        print(f"Keywords newly generated via OpenAI: {total_newly_generated}")
        print(f"Keyword generation/processing failures: {total_failed_generation}")
        print(f"Total records submitted for Algolia update: {total_algolia_updates_submitted}")
        print("Ensuring final save of all keywords...")
        save_keywords_to_file(existing_keywords)
        print("Keyword extraction process finished.")

        error_logs_exist = any(os.path.exists(p) and os.path.getsize(p) > 0 for p in [OPENAI_ERROR_LOG_PATH, ALGOLIA_ERROR_LOG_PATH])
        if total_failed_generation > 0 or error_logs_exist:
            print(f"There were {total_failed_generation} keyword generation failures.")
            print(f"Please check logs in the '{ERROR_LOG_DIR}' directory for details.")

if __name__ == '__main__':
    process_records()
