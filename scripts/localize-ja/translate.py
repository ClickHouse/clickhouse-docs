import os
import time
import argparse
import json
import math
from datetime import datetime
from openai import OpenAI
from concurrent.futures import ThreadPoolExecutor


client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

MAX_CHUNK_SIZE = 30000
#MAX_CHUNK_SIZE = 100000

def load_glossary(file_path="glossary.json"):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            glossary = json.load(f)
        print("Glossary loaded successfully.")
        return glossary
    except FileNotFoundError:
        print("Glossary file not found. Continuing without glossary.")
        return {}

def format_glossary_prompt(glossary):
    glossary_text = "\n".join([f"- {key}: {value}" for key, value in glossary.items()])
    return f"Use the following glossary for specific translations:\n{glossary_text}\n"

def translate_text(text, glossary, model="gpt-4o-mini"):
    glossary_prompt = format_glossary_prompt(glossary)
    prompt_content = f"{glossary_prompt}Translate the following ClickHouse documentation text from English to Japanese. This content may be part of a document, so maintain the original html tags and markdown formatting used in Docusaurus, including any headings, code blocks, lists, links, and inline formatting like bold or italic text. Ensure that no content, links, or references are omitted or altered during translation, preserving the same amount of information as the original text. Do not translate code, URLs, or any links within markdown. This translation is intended for users familiar with ClickHouse, databases, and IT terminology, so use technically accurate and context-appropriate language. Keep the translation precise and professional, reflecting the technical nature of the content. Strive to convey the original meaning clearly, adapting phrases where necessary to maintain natural and fluent Japanese."
    try:
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

def split_text(text, max_chunk_size):
    chunks = []
    current_chunk = ""

    for line in text.splitlines(keepends=True):
        if len(current_chunk) + len(line) > max_chunk_size:
            chunks.append(current_chunk)
            current_chunk = line
        else:
            current_chunk += line

    if current_chunk:
        chunks.append(current_chunk)

    return chunks

def translate_file(input_file_path, output_file_path, glossary, model):
    print(f"start translation: input[{input_file_path}], output[{output_file_path}]")
    start_time = time.time()

    try:
        with open(input_file_path, "r", encoding="utf-8") as input_file:
            original_text = input_file.read()
#            print(f" - length: {len(original_text)}")

        # Split text into chunks and translate
        num_chunk = math.ceil(len(original_text) / MAX_CHUNK_SIZE)
        count = 1
        translated_text = ""
        for chunk in split_text(original_text, MAX_CHUNK_SIZE):
            print(f" - start [{count}/{num_chunk}], [{input_file_path}]")
            translated_chunk = translate_text(chunk, glossary, model)
            if translated_chunk:
                translated_text += translated_chunk + "\n"
                count+=1
            else:
                print(f"failed to translate a chunk: [{input_file_path}]")
                return

        os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
        with open(output_file_path, "w", encoding="utf-8") as output_file:
            output_file.write(translated_text)

        # Rename input file with translated_ prefix
        translated_file_name = f"translated_{os.path.basename(input_file_path)}"
        translated_file_path = os.path.join(os.path.dirname(input_file_path), translated_file_name)
        
        os.rename(input_file_path, translated_file_path)
#        print(f" - input file renamed to {translated_file_path}")

    except FileNotFoundError:
        print(f"no file: {input_file_path}")
    except Exception as e:
        print(f"error occurred: {e}")

    end_time = time.time()
    duration = end_time - start_time
    print(f"finished translation: input[{input_file_path}], output[{output_file_path}], duration seconds[{duration:.2f}]")

def translate_folder(input_folder, output_folder, glossary, model="gpt-4o-mini"):
    excluded_files = {"about-us/adopters.md"}
    excluded_folders = {"whats-new","chnagelogs"}


    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = []
        for root, _, files in os.walk(input_folder):
            relative_folder_path = os.path.relpath(root, input_folder)
            if any(excluded in relative_folder_path for excluded in excluded_folders):
                print(f" - Skipping due to exclusion target: {relative_folder_path}")
                continue

            for file in files:
                if file.endswith((".md", ".mdx")):
                    input_file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(input_file_path, input_folder)        
                    output_file_path = os.path.join(output_folder, relative_path)
                    
                    # Skip files that are in the excluded files set
                    if relative_path in excluded_files:
                        print(f" - Skipping due to exclusion target: {input_file_path}")
                        continue

                    # Skip files that already have the translated_ prefix
                    if file.startswith("translated_"):
                        continue

                    # Submit the translation task to be run in parallel
                    futures.append(executor.submit(translate_file, input_file_path, output_file_path, glossary, model))

        # Wait for all futures to complete
        for future in futures:
            future.result()




def main():
    parser = argparse.ArgumentParser(description="Translate Markdown files in a folder.")
    parser.add_argument("input_folder", help="Path to the input folder containing markdown files")
    parser.add_argument("output_folder", help="Path to the output folder where translated files will be saved")
    parser.add_argument("--model", default="gpt-4o-mini", help="Specify the openai model to use for translation")
    args = parser.parse_args()

    glossary = load_glossary()
    translate_folder(args.input_folder, args.output_folder, glossary, args.model)

if __name__ == "__main__":
    main()
