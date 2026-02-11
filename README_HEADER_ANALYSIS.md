# Documentation Header Analysis

This directory contains the results of a comprehensive analysis of documentation headers in the ClickHouse documentation to identify headers that don't adequately describe their content.

## Deliverables

### Main Reports

1. **[HEADER_ANALYSIS_REPORT.md](HEADER_ANALYSIS_REPORT.md)** - Comprehensive human-readable report
   - Executive summary with key findings
   - Detailed analysis of "What is X?" headers (29 problematic out of 31 total)
   - Analysis of overly generic headers (33 instances)
   - Specific recommendations for each issue
   - Writing guidelines for future headers

2. **[problematic_headers.csv](problematic_headers.csv)** - Actionable tracking spreadsheet
   - 62 problematic headers identified
   - Sorted by priority (High/Medium)
   - Includes file path, line number, current header, suggested improvement
   - Ready for import into issue tracking or spreadsheet tools

3. **[HEADER_FIX_GUIDE.md](HEADER_FIX_GUIDE.md)** - Step-by-step fix guide
   - Quick start instructions
   - Fix patterns for each category
   - Before/after examples
   - Validation checklist
   - Common mistakes to avoid

### Analysis Scripts

Scripts used to generate the analysis (can be re-run to update findings):

- `analyze_headers.py` - Main analysis script with heuristics
- `focused_analysis.py` - Focused analysis on specific patterns
- `comprehensive_what_is_analysis.py` - Deep dive into "What is X?" headers
- `prepare_candidates.py` - Prepares sections for AI review
- `generate_csv.py` - Generates the CSV report

### Intermediate Data Files

These JSON files contain detailed analysis data (gitignored but can be regenerated):

- `sections_for_analysis.json` - All 7,664 substantial sections parsed from docs
- `what_is_headers_analysis.json` - Detailed categorization of 31 "What is X?" headers
- `candidates_for_ai_review.json` - 40 sections prepared for detailed AI analysis
- `focused_header_issues.json` - Heuristic-based issue detection results

## Key Findings Summary

### Statistics
- **874 markdown files** analyzed
- **10,020 total sections** found
- **62 problematic headers** identified requiring fixes

### Primary Issues

1. **"What is X?" Headers (29 issues, HIGH PRIORITY)**
   - Headers that ask questions but don't answer them directly
   - Example: "What is compute-compute separation?" opens with availability info instead of a definition
   - 93.5% of "What is" headers are problematic

2. **Generic Headers (33 issues, MEDIUM PRIORITY)**
   - Headers using "Description", "Overview", or "Introduction" when content is specific
   - Example: 24 aggregate function pages all use "Description" instead of describing the specific function
   - Especially common in technical reference pages

## Example Issues

### Before
**Header**: "What is compute-compute separation?"
**Opens with**: "Compute-compute separation is available for Scale and Enterprise tiers..."

### After (Recommended)
**Header**: "Compute-compute separation overview"
**Opens with**: "Compute-compute separation allows you to create multiple compute node groups that share the same storage..."

Or keep the question but fix the content:
**Header**: "What is compute-compute separation?"
**Opens with**: "Compute-compute separation is a feature that allows you to create multiple compute node groups, each with its own endpoint, that share the same object storage..."

## How to Use These Reports

### For Documentation Writers
1. Review `HEADER_ANALYSIS_REPORT.md` for context and examples
2. Use `problematic_headers.csv` to track which headers you've fixed
3. Follow the "Writing Guidelines for Headers" section when creating new headers

### For Project Managers
1. Import `problematic_headers.csv` into your project tracking system
2. Assign high-priority "What is X?" headers first (29 items)
3. Then tackle generic headers (33 items)

### To Re-run Analysis
```bash
# Parse all markdown files and extract sections
python3 analyze_headers.py

# Analyze "What is X?" headers specifically
python3 comprehensive_what_is_analysis.py

# Generate CSV report
python3 generate_csv.py
```

## Recommendations

### Immediate Actions
1. Fix all 29 "What is X?" headers - ensure content directly answers the question
2. Update 24 aggregate function combinator pages to use specific headers
3. Replace remaining generic "Overview"/"Description"/"Introduction" headers with specific descriptors

### Long-term Improvements
- Add header quality checks to documentation review process
- Create templates for common documentation patterns
- Consider automated linting for header-content alignment

## Contact
For questions about this analysis, refer to the problem statement in the original issue.

---
Generated: 2026-02-11
Analysis Coverage: 874 markdown files, 10,020 sections
