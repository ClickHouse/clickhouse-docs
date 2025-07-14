import sys
import re

def clean_md_file(filename):
    with open(filename, "r", encoding="utf-8") as f:
        lines = f.readlines()

    result = []
    inside_list = False
    blank_line_count = 0
    started = False  # Flag: have we reached first heading?

    for line in lines:
        # Detect first Markdown heading (level 1)
        if not started and re.match(r'^\s*#\s+', line):
            started = True  # Start processing from this line
        if not started:
            # Before first heading, just copy lines as-is
            result.append(line)
            continue

        stripped = line.strip()

        # From here on: your existing logic

        # Detect list item
        if re.match(r'^(\s*([-+*])|\s*\d+\.)\s', line):
            inside_list = True
            blank_line_count = 0
            result.append(line)
            continue

        # While inside list: remove <br/> lines
        if inside_list:
            if stripped == "":
                # blank lines inside list allowed
                blank_line_count = 0
                result.append(line)
                continue
            elif re.match(r'^<br\s*/?>$', stripped, re.I):
                # skip <br/> lines inside list
                continue
            else:
                # non-blank, non-<br/> line means list ended
                inside_list = False
                blank_line_count = 0
                result.append(line)
                continue

        # Outside list: collapse multiple blank lines to one
        if stripped == "":
            blank_line_count += 1
            if blank_line_count <= 1:
                result.append(line)
            else:
                # skip extra blank lines
                continue
        else:
            blank_line_count = 0
            result.append(line)

    with open(filename, "w", encoding="utf-8") as f:
        f.writelines(result)

    print(f"Cleaned up {filename}: removed <br/> after lists and collapsed blank lines (starting after first heading).")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python clean_md_file.py file.md")
        sys.exit(1)
    clean_md_file(sys.argv[1])
