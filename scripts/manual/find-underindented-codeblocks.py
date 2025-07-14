import sys
import re

def indent_block(lines, start_idx, list_indent):
    """
    Indent lines starting from start_idx if they are too shallow.
    Only indent lines that are less than or equal to list_indent spaces.
    """
    i = start_idx
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Stop conditions
        new_list_match = re.match(r'^(\s*)(\d+\.\s|[-+*]\s)', line)
        if new_list_match and len(new_list_match.group(1)) <= list_indent:
            break

        if re.match(r'^\s*#{1,6}\s+', line):
            break

        if re.match(r'^\s*([-*_]\s*){3,}$', line):
            break

        if re.match(r'^(```|~~~)', line):
            break

        if re.match(r'^\s*<br\s*/?>\s*$', line, re.IGNORECASE):
            break

        if re.match(r'^\s*:::\s*', line):
            break

        if stripped == "" and i + 1 < len(lines):
            next_line = lines[i + 1]
            if next_line.strip() and not next_line.startswith(" "):
                break

        # Check indent level
        line_indent = len(line) - len(line.lstrip())
        if stripped != "" and line_indent <= list_indent:
            new_indent = list_indent + 4
            lines[i] = " " * new_indent + line.lstrip()

        i += 1

    return i

def fix_list_item_blocks(filename):
    if "/changelogs/" in filename.replace("\\", "/"):
        print(f"Skipping changelogs file: {filename}")
        return

    with open(filename, "r", encoding="utf-8") as f:
        lines = f.readlines()

    changed = False
    i = 0
    inside_code_block = False

    while i < len(lines):
        line = lines[i]

        # Check for entering/exiting fenced code block
        fence_match = re.match(r'^(\s*)(```|~~~)', line)
        if fence_match:
            inside_code_block = not inside_code_block
            i += 1
            continue

        if inside_code_block:
            i += 1
            continue

        # List item detection
        list_match = re.match(r'^(\s*)(\d+\.\s|[-+*]\s)', line)
        if list_match:
            list_indent = len(list_match.group(1))
            next_i = indent_block(lines, i + 1, list_indent)
            if next_i > i + 1:
                changed = True
            i = next_i
        else:
            i += 1

    if changed:
        with open(filename, "w", encoding="utf-8") as f:
            f.writelines(lines)
        print(f"💾 Updated and saved {filename}")
    else:
        print(f"No changes needed in {filename}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fix_list_item_blocks.py your_file.md")
        sys.exit(1)

    fix_list_item_blocks(sys.argv[1])
