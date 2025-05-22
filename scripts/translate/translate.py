import glob
from datetime import datetime
import sys
import time
import xxhash
import argparse
import os
import re
import yaml
from frontmatter.default_handlers import DEFAULT_POST_TEMPLATE, YAMLHandler

from llama_index.core import Document
from llama_index.core.node_parser import MarkdownNodeParser
import json
import math
import shutil
from openai import OpenAI
from concurrent.futures import ThreadPoolExecutor, as_completed
import frontmatter
import textwrap

TRANSLATE_EXCLUDED_FILES = {"about-us/adopters.md", "index.md", "integrations/language-clients/java/jdbc-v1.md", "cloud/reference/changelog.md"}
TRANSLATE_EXCLUDED_FOLDERS = {"whats-new", "changelogs", "cloud/changelogs"}

IGNORE_FOLDERS = {"ru", "zh"}

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)
print(f"OpenAI API Key available: {'Yes' if os.environ.get('ANTHROPIC_API_KEY') else 'No'}")

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
            - This content may be part of a document, so maintain the original HTML tags and markdown formatting used in Docusaurus, including any headings, lists, links, and inline formatting like bold or italic text.
        IMPORTANT: 
            - Ensure that no content, links, explicit heading ids (denoted by {{#my-explicit-id}}), or references are omitted or altered during translation, preserving the semantic meaning of the text.
            - Never translate components, for example <DeprecatedBadge/>, <CloudBadge/>, <VersionHistory/> etc.
            - Never translate any comments, for example <!-- example comment -->
            - Never translate URLs of markdown links like "[some text](../../sql-reference/statements/create/dictionary.md)". You may translate the text inside the square brackets if appropriate. Urls in text should be surrounded by white space and never have adjacent {language} characters.
            - Ensure the markdown is MDX 3 compatible - escaping < and > with &lt; and &gt; and avoiding the creation of unclosed xml tags.
            - Never translate terms which indicate setting names. These are denoted by lower case and underscore e.g. live_view_heartbeat_interval or max_os_cpu_wait_time_ratio_to_throw.
            - Never translate terms in all caps which are SQL statements. For example DESCRIBE TABLE, RENAME, SET ROLE etc.
            - This translation is intended for users familiar with ClickHouse, databases, and IT terminology, so use technically accurate and context-appropriate language. Keep the translation precise and professional, reflecting the technical nature of the content.
            - Strive to convey the original meaning clearly, adapting phrases where necessary to maintain natural and fluent {language}.
            - If the only thing you're given is something that doesn't need to be translated, just return it as is (even if it's blank space). Eg. Given "<Content/>" return "<Content/>".
              You should absolutely NEVER provide a response like "I'm sorry, but it seems that you have not provided any specific content to translate." in this case.
            
        I suggest a two step approach in which you first translate, and afterwards compare the original text to the translation
        and critically evaluate it and make modifications as appropriate.
        
        """
    glossary_prompt = format_glossary_prompt(glossary)
    prompt_content = f"{prompt}\n{glossary_prompt}\n{translation_override_prompt}"
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

class QuotedStringDumper(yaml.SafeDumper):
    def represent_str(self, data):
        return yaml.ScalarNode('tag:yaml.org,2002:str', data, style="'")

# Create a custom handler that preserves whitespace
class yamlFrontMatterHandler(YAMLHandler):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def format(self, post, **kwargs):
        """
        Turn a post into a string, used in ``frontmatter.dumps``.
        Changed from default handler to not remove the last empty line
        """
        start_delimiter = kwargs.pop("start_delimiter", self.START_DELIMITER)
        end_delimiter = kwargs.pop("end_delimiter", self.END_DELIMITER)

        metadata = self.export(post.metadata, **kwargs)

        return DEFAULT_POST_TEMPLATE.format(
            metadata=metadata,
            content=post.content,
            start_delimiter=start_delimiter,
            end_delimiter=end_delimiter,
        ).lstrip()

# Configure YAML dumper to use single quotes for strings
QuotedStringDumper.add_representer(str, QuotedStringDumper.represent_str)
def translate_frontmatter(frontmatter, glossary):
    # Extract only the fields we want to translate
    fields_to_translate = {}
    for key in ["title", "sidebar_label", "description"]:
        if key in frontmatter:
            fields_to_translate[key] = frontmatter[key]

    # If no translatable fields found, return early
    if not fields_to_translate:
        return

    # Check if any field has mixed-case content (not just pure ALL CAPS)
    has_translatable_content = False
    for value in fields_to_translate.values():
        # Remove pure ALL CAPS words/phrases to see if there's mixed-case content left
        # Pattern matches: word boundaries + sequences of caps/digits/underscores/spaces between caps words
        pure_caps_pattern = r'\b[A-Z][A-Z0-9_]*(?:\s+[A-Z][A-Z0-9_]*)*\b'
        remaining_text = re.sub(pure_caps_pattern, '', value).strip()

        # If there's any non-whitespace content left after removing pure ALL CAPS, it's translatable
        if remaining_text and not remaining_text.isspace():
            has_translatable_content = True
            break

    # If no translatable content (only pure ALL CAPS), return original frontmatter
    if not has_translatable_content:
        return frontmatter

    system_prompt = f"""
You are a translator. 

You will receive a JSON object containing frontmatter fields from a markdown document.
Translate the values while preserving the JSON structure.

EXTREMELY IMPORTANT: DO NOT translate any words that are in ALL CAPITAL LETTERS.
This includes:
- Single words like DATABASE, TABLE, INDEX, CREATE, SELECT
- Multi-word phrases like CREATE DATABASE, ALTER TABLE, DROP INDEX
- Any uppercase words within mixed-case sentences like "SELECT statement" or "Documentation for CREATE DATABASE"

For mixed-case phrases:
- "SELECT statement" → translate to something like "SELECT 语句" (Chinese), "SELECT ステートメント" (Japanese), "Инструкция SELECT" (Russian)
- "CREATE DATABASE command" → "CREATE DATABASE 命令" (Chinese), "CREATE DATABASE コマンド" (Japanese), "Команда CREATE DATABASE" (Russian)

IMPORTANT: Keep ALL CAPS words exactly as they are, only translate the lowercase/mixed-case words around them. Adjust word order as needed for proper grammar in the target language.

You can use the following glossary for translating technical terms: {glossary}
    """

    # Define the JSON schema for the response
    response_schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "translated_frontmatter",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    key: {"type": "string"}
                    for key in fields_to_translate.keys()
                },
                "required": list(fields_to_translate.keys()),
                "additionalProperties": False
            }
        }
    }

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(fields_to_translate)}
        ],
        response_format=response_schema
    )

    translated_content = json.loads(completion.choices[0].message.content)

    # Update the original frontmatter with translated values
    for key, translated_value in translated_content.items():
        if key in frontmatter:
            frontmatter[key] = translated_value

    return frontmatter

# We need to apply a transformation from @site/docs to @site/i18n/{lang_code}/docusaurus-plugin-content-docs/current/
def replaceSnippetImports(import_statements, lang_code):
    for i in range(len(import_statements)):
        import_statements[i] = import_statements[i].replace(
            "@site/docs/",
            "@site/i18n/jp/docusaurus-plugin-content-docs/current/"
        )

def extract_import_statements(text):
    # Regular expression to match import statements
    import_regex = r'^import\s+.+\s+from\s+[\'"].+[\'"];?$'

    # Find all matches
    import_statements = re.findall(import_regex, text, re.MULTILINE)

    return import_statements

def remove_import_statements(text):
    # Regular expression to match import statements
    import_regex = r'^import\s+.+\s+from\s+[\'"].+[\'"];?$'

    # Remove import statements line by line to have more control
    lines = text.splitlines(True)  # Keep line endings
    cleaned_lines = []

    import_line_indices = []
    # First, identify all import lines
    for i, line in enumerate(lines):
        if re.match(import_regex, line):
            import_line_indices.append(i)

    # Now process the lines, handling consecutive import lines specially
    skip_next_blank = False
    for i, line in enumerate(lines):
        if i in import_line_indices:
            # This is an import line - skip it
            # If this is the last of a sequence of imports, we might want to skip the next blank line
            is_last_in_sequence = (i+1) not in import_line_indices
            next_is_blank = (i+1 < len(lines) and lines[i+1].strip() == '')

            if is_last_in_sequence and next_is_blank:
                skip_next_blank = True
            continue

        if skip_next_blank and line.strip() == '':
            # This is a blank line right after import(s) - skip it
            skip_next_blank = False
            continue

        # For all other lines, keep them
        cleaned_lines.append(line)

    return ''.join(cleaned_lines)

def replace_code_blocks_with_custom_placeholders(markdown_text):
    lines = markdown_text.split('\n')
    result_lines = []
    code_blocks = []

    in_code_block = False
    current_block = {
        'language': '',
        'content': []
    }

    for line in lines:
        stripped_line = line.strip()

        if stripped_line.startswith('```') and not in_code_block:
            # Start of a code block
            in_code_block = True
            language_part = stripped_line[3:].strip()  # Remove ``` and whitespace
            current_block = {
                'language': language_part,
                'content': []
            }
        elif stripped_line == '```' and in_code_block:
            # End of a code block
            in_code_block = False

            # Remove common leading whitespace from code content
            content_lines = current_block['content']
            if content_lines:
                # Use textwrap.dedent to remove common leading whitespace
                dedented_content = textwrap.dedent('\n'.join(content_lines))
            else:
                dedented_content = ''

            code_blocks.append({
                'language': current_block['language'],
                'content': dedented_content
            })
            result_lines.append(f"<CODEBLOCK_{len(code_blocks)}>")
        elif in_code_block:
            # Inside a code block - preserve original line (with indentation)
            current_block['content'].append(line)
        else:
            # Outside a code block - preserve original line
            result_lines.append(line)

    return '\n'.join(result_lines), code_blocks

def restore_code_blocks(modified_text, code_blocks):

    restored_text = modified_text

    # Replace each placeholder with its corresponding code block
    for i, block in enumerate(code_blocks, 1):
        language = block['language']
        content = block['content']

        # Create the code block with proper backticks and language
        if language:
            code_block = f"```{language}\n{content}\n```"
        else:
            code_block = f"```\n{content}\n```"

        # Replace the placeholder
        placeholder = f"<CODEBLOCK_{i}>"
        restored_text = restored_text.replace(placeholder, code_block)

    return restored_text

def replace_components_with_placeholders(markdown_text):
    components = []

    # Pattern for SettingsInfoBlock components
    settings_pattern = r'<SettingsInfoBlock\s+[^>]*?/>'

    # Pattern for VersionHistory components
    version_pattern = r'<VersionHistory\s+[^>]*?/>'

    def replace_component(match):
        component_tag = match.group(0)
        components.append(component_tag)
        return f"<COMPONENT_{len(components)}>"

    # Replace SettingsInfoBlock components
    processed_text = re.sub(settings_pattern, replace_component, markdown_text)

    # Replace VersionHistory components
    processed_text = re.sub(version_pattern, replace_component, processed_text)

    return processed_text, components

def restore_components_from_placeholders(processed_text, components):
    result = processed_text

    for i, component in enumerate(components, 1):
        placeholder = f"<COMPONENT_{i}>"
        result = result.replace(placeholder, component)

    return result

def translate_file(config, input_file_path, output_file_path, model):
    print(f"Starting translation: input[{input_file_path}], output[{output_file_path}]")
    start_time = time.time()

    try:
        with open(input_file_path, "r", encoding="utf-8") as input_file:
            # Before splitting text into chunks, split the content and the frontmatter
            # custom handler used below as library strips whitespace by default
            post = frontmatter.load(input_file, handler=yamlFrontMatterHandler())
            metadata = post.metadata
            original_text = post.content

            print(f" - length: {len(original_text)}")

        # Translate the metadata
        metadata = translate_frontmatter(metadata, config["glossary"])

        # Extract codeblocks and replace them with numbered placeholders
        # that we will replace after translations are done.
        # We do this first so that the next step doesn't remove import statements inside codeblocks
        cleaned_text, code_blocks = replace_code_blocks_with_custom_placeholders(original_text)

        # On certain pages replace some custom components which give issues
        cleaned_text, custom_components = replace_components_with_placeholders(cleaned_text)

        # Next extract all import statements from the text
        imports = extract_import_statements(cleaned_text)
        # transformation from @site/static to @site/i18n/{lang}/current...
        replaceSnippetImports(imports, config["lang_code"])
        cleaned_text = remove_import_statements(cleaned_text)

        # Split text into chunks and translate
        num_chunk = math.ceil(len(cleaned_text) / MAX_CHUNK_SIZE)
        count = 1
        translated_text = ""
        chunks = split_text(cleaned_text, input_file_path, MAX_CHUNK_SIZE)
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
                elif translated_chunk.startswith("```html"):
                    translated_chunk = translated_chunk.removeprefix("```html")
                elif translated_chunk.startswith("```javascript"):
                    # One such case in academic overview (VLDB paper page)
                    translated_chunk = translated_chunk.removeprefix("```javascript")
                translated_text += translated_chunk + "\n"
                count += 1
            else:
                print(f"failed to translate a chunk: [{input_file_path}]")
                return

        c=0
        bt = False

        # GPT loves to hallucinate ``` at the end so we check for these
        # Must be done before adding codeblocks back as codeblock is often last
        translated_text = re.sub(r'^\s*```\s*$', '', translated_text, flags=re.MULTILINE)

        # Now we work backwards
        translated_text = restore_code_blocks(translated_text, code_blocks)

        # For some pages we need to restore custom components
        translated_text = restore_components_from_placeholders(translated_text, custom_components)

        if imports:
            imports_text = "\n".join(imports)
            translated_text = imports_text + "\n\n" + translated_text
        else:
            imports_text = ""

        yaml_str = yaml.dump(
            metadata,
            Dumper=QuotedStringDumper,
            default_flow_style=False,
            sort_keys=False,
            allow_unicode=True
        )

        if yaml_str != "":
            formatted_frontmatter = f"---\n{yaml_str}---\n\n"
            translated_text = formatted_frontmatter + translated_text

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
