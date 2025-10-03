import os
import re
import json

GLOSSARY_JSON_PATH = "/home/dtran/clickhouse-docs/src/components/GlossaryTooltip/glossary.json"
DOCS_PATH = "/home/dtran/clickhouse-docs/docs"

IGNORE_DIRS = {
    "changelog", "changelogs", "i18n", "scripts", "static", "styles",
    "contribute", "about-us", "_placeholders"
}

GLOSSARY_IMPORT = "import GlossaryTooltip from '@site/src/components/GlossaryTooltip/GlossaryTooltip.jsx';"

def load_glossary(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def mask_ignores(text):
    placeholders = {}
    patterns = {
        'codeblocks': r'```[\s\S]*?```',
        'inline_code': r'`[^`\n]+`',
        'frontmatter': r'^---[\s\S]+?---',
        'imports': r'^import .*?;$',
        'headers': r'^(#+ .*)$',
        'html_blocks': r'<(div|details|summary)[\s\S]*?<\/\1>',
        'blockquotes': r'^\s*>.*$',
        'links': r'\[([^\]]+)\]\([^)]+\)',
        'images': r'!\[[^\]]*\]\([^)]+\)',
        'comments': r'<!--[\s\S]*?-->',
    }

    for name, pattern in patterns.items():
        regex = re.compile(pattern, re.MULTILINE)
        matches = list(regex.finditer(text))
        for i, match in enumerate(matches):
            key = f"__MASKED_{name.upper()}_{i}__"
            placeholders[key] = match.group(0)
            text = text.replace(match.group(0), key)

    return text, placeholders

def unmask_ignores(text, placeholders):
    for key, value in placeholders.items():
        text = text.replace(key, value)
    return text

def inject_tooltips(text, glossary):
    def replacement(match):
        word = match.group(0)
        definition = glossary.get(word)
        if definition:
            return f'<GlossaryTooltip term="{word}" definition="{definition}">{word}</GlossaryTooltip>'
        return word

    pattern = r'\b(' + '|'.join(re.escape(k) for k in glossary.keys()) + r')\b'
    return re.sub(pattern, replacement, text)

def process_file(path, glossary):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    masked_text, placeholders = mask_ignores(content)
    replaced = inject_tooltips(masked_text, glossary)
    final_text = unmask_ignores(replaced, placeholders)

    if '<GlossaryTooltip' in final_text and GLOSSARY_IMPORT not in final_text:
        final_text = GLOSSARY_IMPORT + "\n" + final_text

    if '<GlossaryTooltip' in final_text and final_text != content:
        new_path = path.replace(".md", ".mdx")
        with open(new_path, 'w', encoding='utf-8') as f:
            f.write(final_text)
        os.remove(path)
        print(f"✔ Renamed and updated: {path} -> {new_path}")
    else:
        print(f"– Skipped (no change): {path}")

def process_directory(base_path, glossary):
    for root, dirs, files in os.walk(base_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for file in files:
            if file.endswith(".md") and not file.startswith("_"):
                path = os.path.join(root, file)
                process_file(path, glossary)

if __name__ == "__main__":
    glossary = load_glossary(GLOSSARY_JSON_PATH)
    process_directory(DOCS_PATH, glossary)
