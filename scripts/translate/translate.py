import glob
from datetime import datetime
import sys
import time
import xxhash
import argparse
import os

from anthropic import Anthropic
from llama_index.core import Document
from llama_index.core.node_parser import MarkdownNodeParser
import json
import math
import shutil
from openai import OpenAI
import anthropic
from concurrent.futures import ThreadPoolExecutor, as_completed

TRANSLATE_EXCLUDED_FILES = {"about-us/adopters.md", "index.md", "integrations/language-clients/java/jdbc-v1.md"}
TRANSLATE_EXCLUDED_FOLDERS = {"whats-new", "changelogs"}
IGNORE_FOLDERS = {"ru", "zh"}


client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)
print(f"OpenAI API Key available: {'Yes' if os.environ.get('ANTHROPIC_API_KEY') else 'No'}")

anthropic_client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY"),
)
print(f"Anthropic API Key available: {'Yes' if os.environ.get('ANTHROPIC_API_KEY') else 'No'}")

MAX_CHUNK_SIZE = 30000


def load_config(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            config = json.load(f)
            if not "language" in config:
                raise Exception("language not found in config")
            if not "lang_code" in config:
                config["lang_code"] = config["languages"][:2].lower()
            if "glossary" not in config:
                config["glossary"] = {}
                print("warning: no glossary in config file - continuing without glossary.")
            return config
    except FileNotFoundError as e:
        print(f"Config file not found at {file_path}. Exiting...")
        sys.exit(1)


def format_glossary_prompt(glossary):
    glossary_text = "\n".join([f"- {key}: {value}" for key, value in glossary.items()])
    return f"Use the following glossary for specific translations of key technical terms. Take these into account even when translating YAML frontmatter fields like title, sidebar_label etc. Translate these words like this, within the context of the sentence:\n{glossary_text}\n"

def format_translation_override_prompt(override):
    translation_text = "\n".join([f"- {key}: {value}" for key, value in override.items()])
    return f"If you encounter these phrases, take them as manual overrides and translate them accordingly:\n{translation_text}\n"

def hash_file(input_path, chunk_size=65536):
    hasher = xxhash.xxh64()
    with open(input_path, "rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def write_file_hash(input_path, output_path, chunk_size=65536):
    """Compute a fast hash of a file using xxHash64."""
    hash = hash_file(input_path, chunk_size)
    with open(output_path, "w") as f:
        f.write(hash + "\n")


def read_file_hash(input_path):
    """Reads a previously written hash from a file."""
    try:
        with open(input_path, "r") as f:
            return f.readline().strip()
    except FileNotFoundError:
        return ""

def write_complete_file(output_path):
    timestamp = datetime.utcnow().isoformat()  #
    with open(output_path, "w") as f:
        f.write(timestamp + "\n")

def translate_text(config, text, model="gpt-4o-mini", translation_override_prompt=""):
    language = config["language"]
    glossary = config["glossary"]
    prompt = config["prompt"] if "prompt" in config else f"""
        Translate the following ClickHouse documentation text from English to {language}. Ensure the following rules are followed:
            - This content may be part of a document, so maintain the original html tags and markdown formatting used in Docusaurus, including any headings, code blocks, lists, links, and inline formatting like bold or italic text. Code blocks should be preserved using ` and ```.
            - Ensure that no content, links, explicit heading ids (denoted by {{#my-explicit-id}}), or references are omitted or altered during translation, preserving the same amount of information as the original text. 
            - Do not translate code, URLs, or any links within markdown. Mark down links must be preserved and never modified. Urls in text should be surrounded by white space and never have adjacent {language} characters.
            - Ensure the markdown is MDX 3 compatible - escaping < and > with &lt; and &gt; and avoiding the creation of unclosed xml tags.
            - Do not add new code delimiters which are not present in the original content e.g. '```html', even if the content appears to contain this type.
            - Do not translate terms which indicate setting names. These are denoted by lower case and underscore e.g. live_view_heartbeat_interval.
            - Do not translate terms in all caps which are SQL statements. For example DESCRIBE TABLE, RENAME, SET ROLE etc.
            - Translate the title, sidebar_label, keywords (list of single quoted strings) and description in yaml metadata blocks if they exist. Ensure these are wrapped in single quotes. Do not add entries.
            - This translation is intended for users familiar with ClickHouse, databases, and IT terminology, so use technically accurate and context-appropriate language. Keep the translation precise and professional, reflecting the technical nature of the content. 
            - Strive to convey the original meaning clearly, adapting phrases where necessary to maintain natural and fluent {language}.
        """
    glossary_prompt = format_glossary_prompt(glossary)
    prompt_content = f"{glossary_prompt}\n{prompt}\n{translation_override_prompt}"
    try:
        if model=="claude-3-5-sonnet-20240620":
            with anthropic_client.messages.stream(
                    max_tokens=8192, # max allowed for claude-3-5-sonnet-20240620
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": text
                                }
                            ]
                        }
                    ],
                    model=model,
                    system=prompt_content
            ) as stream:
                full_response = ""

                # Process each chunk as it arrives
                for chunk in stream:
                    if chunk.type == "content_block_delta" and hasattr(chunk.delta, "text"):
                        # Add this chunk of text to our response
                        full_response += chunk.delta.text
                # Return the complete translated text
                return full_response
        else:
            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": prompt_content},
                    {"role": "user", "content": text}
                ]
            )
            return completion.choices[0].message.content
    except Exception as e:
        print(f"failed to translate: {e}")
        return None


def split_text(text, input_file_path, max_chunk_size=MAX_CHUNK_SIZE):
    if len(text) <= max_chunk_size:
        return [text]
    parser = MarkdownNodeParser()
    document = Document(text=text)
    nodes = parser.get_nodes_from_node(document)

    chunks = []
    current_chunk = ""
    for node in nodes:
        node_text = node.text
        if len(current_chunk) + len(node_text) > max_chunk_size:
            chunks.append(current_chunk.strip())
            if len(node_text)  > max_chunk_size: # can happen if no obvious header splits
                raise Exception(f"Error: unable to split ${input_file_path} - no clear split")
            else:
                current_chunk = node_text
        else:
            current_chunk += "\n" + node_text

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def translate_file(config, input_file_path, output_file_path, model):
    print(f"Starting translation: input[{input_file_path}], output[{output_file_path}]")
    start_time = time.time()

    try:
        with open(input_file_path, "r", encoding="utf-8") as input_file:
            original_text = input_file.read()
            print(f" - length: {len(original_text)}")
        # Split text into chunks and translate
        num_chunk = math.ceil(len(original_text) / MAX_CHUNK_SIZE)
        count = 1
        translated_text = ""
        chunks = split_text(original_text, input_file_path, MAX_CHUNK_SIZE)
        for chunk in chunks:
            print(f" - start [{count}/{len(chunks)}], [{input_file_path}]")

            # check for per file translation override
            base_path = os.path.splitext(output_file_path)[0]
            translation_override_path = base_path + ".translate_override"
            translation_override_prompt = ""
            try:
                with open(translation_override_path, "r", encoding="utf-8") as override_file:
                    translation_override = json.load(override_file)
                    if config["language"] not in translation_override:
                        print(f"Warning: {config['language']} not found in translation override file")
                    else:
                        override = translation_override[config["language"]]
                        translation_override_prompt = format_translation_override_prompt(override)
                        print(f"Successfully loaded override for {config['language']}")
            except FileNotFoundError as e:
                pass
            except json.JSONDecodeError:
                print(f"Error parsing JSON in override file: {translation_override_path}")
            except Exception as e:
                print(f"Unexpected error with override file: {str(e)}")
            translated_chunk = translate_text(config, chunk, model, translation_override_prompt)
            if translated_chunk:
                if translated_chunk.startswith("```markdown"):
                    translated_chunk = translated_chunk.removeprefix("```markdown")
                translated_text += translated_chunk + "\n"
                count += 1
            else:
                print(f"failed to translate a chunk: [{input_file_path}]")
                return

        c=0
        bt = False
        with open(output_file_path, "w", encoding="utf-8") as output_file:
            lines = translated_text.splitlines()
            for line in lines:
                c += 1
                if c == 1 and line.startswith("```"): # llm can add backticks
                    bt = True
                    continue
                if line.startswith("# "):
                    output_file.write("\n")  # ensures import statements have a new line after them
                if c == len(lines) and line == "```" and bt: # drop ending bts
                    continue
                output_file.write(line + "\n")

        # Rename output file with .translate suffix to .translated - do this to help with debugging during a translation and if updating
        # Note: this could be removed and we just rename the file to the target, write the hash
        os.rename(output_file_path, f"{output_file_path}d")
        # generate hash file - TODO: This should probably happen after the files being renamed.
        write_file_hash(input_file_path, output_file_path.removesuffix(".translate") + ".hash", chunk_size=65536)

    except FileNotFoundError as e:
        print(f"no file: {input_file_path}")
    except Exception as e:
        raise e

    end_time = time.time()
    duration = end_time - start_time
    print(
        f"Finished translation: input[{input_file_path}], output[{output_file_path}d], duration seconds[{duration:.2f}]")


def translate_docs_folder(config, input_folder, output_folder, model="gpt-4o-mini", overwrite=False):
    """Translates Markdown and MDX files in the input folder while handling exclusions and errors safely."""
    files_translated = set()

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = []
        try:
            for root, _, files in os.walk(input_folder):
                relative_folder_path = os.path.relpath(root, input_folder)

                if any(relative_folder_path.startswith(ignore) for ignore in IGNORE_FOLDERS):
                    print(f"Ignoring folder: {relative_folder_path}")
                    continue

                if any(excluded in relative_folder_path for excluded in TRANSLATE_EXCLUDED_FOLDERS):
                    print(f"Skipping translation due to excluded folder target: {relative_folder_path}")
                    shutil.copytree(
                        os.path.join(input_folder, relative_folder_path),
                        os.path.join(output_folder, relative_folder_path),
                        dirs_exist_ok=True
                    )
                    for file in files:
                        input_file_path = os.path.join(root, file)
                        relative_path = os.path.relpath(input_file_path, input_folder)
                        files_translated.add(os.path.join(output_folder, relative_path))
                    continue

                for file in files:
                    input_file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(input_file_path, input_folder)

                    if file.endswith((".md", ".mdx")):
                        files_translated.add(os.path.join(output_folder, relative_path))
                        current_hash = hash_file(input_file_path)
                        output_file_path = os.path.join(output_folder, relative_path)

                        if os.path.exists(output_file_path):
                            new_hash = read_file_hash(output_file_path + ".hash")
                            if not overwrite and new_hash == current_hash:
                                print(f"Skipping unchanged file: {input_file_path}")
                                continue

                        if relative_path in TRANSLATE_EXCLUDED_FILES:
                            print(f"Skipping translation due to exclusion: {input_file_path}")
                            shutil.copy(input_file_path, output_file_path)
                            continue

                        if os.path.exists(output_file_path + ".translated"):
                            print(f"Skipping already translated file: {input_file_path}")
                            continue

                        if os.path.exists(output_file_path + ".translate"):
                            os.remove(output_file_path + ".translate")

                        os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
                        futures.append(
                            executor.submit(translate_file, config, input_file_path, output_file_path + ".translate",
                                            model))

                    elif not file.endswith(".DS_Store"):
                        try:
                            output_file_path = os.path.join(output_folder, relative_path)
                            files_translated.add(output_file_path)
                            if os.path.exists(output_file_path) and not overwrite:
                                continue
                            os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
                            print(f"WARNING: Copying file {relative_path}")
                            shutil.copy(input_file_path, output_file_path)
                            print(f" - Copied file: {output_file_path} -> {input_file_path}")
                        except OSError as e:
                            print(f" - Failed to copy file: {input_file_path} -> {output_file_path}, Error: {e}")

            # Monitor futures and exit if any thread fails
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    print(f"Error occurred: {e}", file=sys.stderr)
                    executor.shutdown(wait=False)
                    sys.exit(1)  # Exit immediately

        finally:
            executor.shutdown(wait=True)  # Ensure cleanup before exiting

    return files_translated

def rename_translated_files(output_folder):
    for root, _, files in os.walk(output_folder):
        for file in files:
            if file.endswith(".translated"):
                original_path = os.path.join(root, file)
                new_path = os.path.join(root, file[:-11])  # Remove ".translated" extension
                try:
                    # Remove existing file if it exists to avoid conflicts
                    if os.path.exists(new_path):
                        os.remove(new_path)
                    # Rename the file
                    os.rename(original_path, new_path)
                    print(f"Renamed: {original_path} -> {new_path}")
                except OSError as e:
                    print(f"Error renaming {original_path}: {e}")


def translate_plugin_data(output_folder, config, model="gpt-4o-mini"):
    json_files = glob.glob(os.path.join(output_folder, "*.json")) + glob.glob(
        os.path.join(output_folder, "*", "*.json"))
    language = config["language"]
    glossary = config["glossary"]
    prompt = f"""
    Translate the following Docusaurus translation file from English to {language}. This content is JSON. Please preserve the structure and only translate values for the message keys. Ensure the response is JSON only and preserve any translated values. Do not translate description values. If values are already translated preserve them.

    This translation is intended for users familiar with ClickHouse, databases, and IT terminology, so use technically accurate and context-appropriate language. Keep the translation precise and professional, reflecting the technical nature of the content. Strive to convey the original meaning clearly, adapting phrases where necessary to maintain natural and fluent {language}.
    """

    glossary_prompt = format_glossary_prompt(glossary)
    prompt_content = f"{glossary_prompt}\n{prompt}"
    for file_path in json_files:
        if not os.path.exists(file_path + ".done"):
            print(f"processing config {file_path}")
            with open(file_path, "r", encoding="utf-8") as f:
                text = json.load(f)
                try:
                    completion = client.chat.completions.create(
                        model=model,
                        messages=[
                            {"role": "system", "content": prompt_content},
                            {"role": "user", "content": json.dumps(text)},
                        ],
                        response_format={"type": "json_object"}
                    )
                    translated_text = completion.choices[0].message.content
                    translated_config = json.loads(translated_text)
                    with open(file_path + ".translated", "w", encoding="utf-8") as output_file:
                        output_file.write(json.dumps(translated_config, indent=2, ensure_ascii=False))
                    os.rename(file_path + ".translated", file_path)
                    write_complete_file(file_path + ".done")
                except Exception as e:
                    print(f"failed to translate: {e}")
                    raise e
        else:
            print(f"skipping config {file_path} as .done exists")

script_dir = os.path.dirname(os.path.abspath(__file__))
default_input_folder = os.path.abspath(os.path.join(script_dir, "../../docs/"))


#removes files which no longer exist in source
def remove_old_files(files_translated, output_folder):
    current_files = set()
    for root, _, files in os.walk(output_folder):
        for file in files:
            input_file_path = os.path.join(root, file)
            relative_path = os.path.relpath(input_file_path, output_folder)
            if not file.endswith(".DS_Store") and not file.endswith(".hash"):
                current_files.add(os.path.join(output_folder, relative_path))
    files_to_remove = current_files - files_translated

    # Filter out special files that should be preserved
    files_to_remove = {file_path for file_path in files_to_remove if not file_path.endswith(".md.translate_override")}

    # Remove the unnecessary files
    for file_path in files_to_remove:
        try:
            os.remove(file_path)
            print(f"Removed old file: {file_path}")
        except OSError as e:
            print(f"Error removing file {file_path}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Translate Markdown files in a folder.")
    parser.add_argument(
        "--input-folder",
        type=str,
        default=default_input_folder,
        help=f"Path to the input folder containing markdown files (default: {default_input_folder})",
    )
    parser.add_argument("--config", required=True, help="Path to the config file, containing language and glossary")
    parser.add_argument("--output-folder", required=True,
                        help="Path to the output folder where translated files will be saved")
    parser.add_argument("--model", default="gpt-4o-mini", help="Specify the OpenAI model to use for translation")
    parser.add_argument("--force_overwrite", action="store_true",
                        help="Overwrite existing translated files even if not changed")
    parser.add_argument("--keep_old_files", action="store_true",
                        help="Keep translated files even if the original no longer exists")

    args = parser.parse_args()

    config = load_config(args.config)
    translate_plugin_data(args.output_folder, config, model=args.model)
    files_translated = translate_docs_folder(config, args.input_folder,
                                             os.path.join(args.output_folder, "docusaurus-plugin-content-docs/current"),
                                             args.model, overwrite=args.force_overwrite)
    rename_translated_files(args.output_folder)
    remove_old_files(files_translated, os.path.join(args.output_folder, "docusaurus-plugin-content-docs/current"))


if __name__ == "__main__":
    main()
