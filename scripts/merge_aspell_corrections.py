#!/usr/bin/env python3
"""
Merge aspell corrections back to original file, preserving filtered lines.
"""
import sys
import re

def should_filter_line(line):
    """Check if this entire line was completely removed during preprocessing."""
    # Must match EXACTLY what bash grep -Ev does
    patterns = [
        r'^import .* from ',           # From: grep -Ev
        r'^\s*slug:',                   # From: grep -Ev (in frontmatter context)
        r'^<details>',                  # From: grep -Ev (note: NO \s* - must start at beginning)
        r'^<summary>',                  # From: grep -Ev
    ]
    for pattern in patterns:
        if re.match(pattern, line):
            return True
    return False

def has_image_tag(line):
    """Check if line contains an Image component."""
    return bool(re.search(r'<Image[^>]*\/?>', line))

def merge_corrections(original_file, corrected_file, output_file):
    """Merge corrections while preserving imports, Image tags, anchors, etc."""
    
    with open(original_file, 'r', encoding='utf-8') as f:
        original_lines = f.readlines()
    
    with open(corrected_file, 'r', encoding='utf-8') as f:
        corrected_lines = f.readlines()
    
    # Build mapping: original line index -> corrected line index
    line_mapping = {}
    corrected_idx = 0
    in_frontmatter = False
    
    for i, orig_line in enumerate(original_lines):
        # Handle frontmatter (removed by awk)
        if i == 0 and orig_line.strip() == '---':
            in_frontmatter = True
            continue
        
        if in_frontmatter:
            if orig_line.strip() == '---':
                in_frontmatter = False
            continue
        
        # Skip lines that were filtered out completely
        if should_filter_line(orig_line):
            continue
        
        # This line made it through preprocessing (even if emptied)
        line_mapping[i] = corrected_idx
        corrected_idx += 1
    
    # Build result
    result = []
    for i, orig_line in enumerate(original_lines):
        if i in line_mapping:
            # Line went through aspell
            corr_idx = line_mapping[i]
            if corr_idx < len(corrected_lines):
                corr_line = corrected_lines[corr_idx]
                
                # If original has Image tag, always keep original
                if has_image_tag(orig_line):
                    result.append(orig_line)
                # Don't add blank corrected lines that came from stripping content
                # unless the original was also blank
                elif corr_line.strip() == '' and orig_line.strip() != '':
                    result.append(orig_line)
                else:
                    # Apply corrections, preserving anchors
                    anchor_match = re.search(r'\{#[^}]*\}', orig_line)
                    if anchor_match:
                        anchor = anchor_match.group(0)
                        result.append(f"{corr_line.rstrip()} {anchor}\n")
                    else:
                        result.append(corr_line)
            else:
                result.append(orig_line)
        else:
            # Line was filtered - keep original unchanged
            result.append(orig_line)
    
    # Remove trailing blank lines that weren't in the original
    while result and result[-1].strip() == '' and original_lines and original_lines[-1].strip() != '':
        result.pop()
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(result)

if __name__ == '__main__':
    if len(sys.argv) != 4:
        sys.exit(1)
    
    try:
        merge_corrections(sys.argv[1], sys.argv[2], sys.argv[3])
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
