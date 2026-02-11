# Quick Fix Guide for Problematic Headers

This guide provides actionable steps to fix the 62 problematic headers identified in the analysis.

## Quick Start

1. Open `problematic_headers.csv` in Excel, Google Sheets, or any spreadsheet tool
2. Sort by Priority column to see High priority items first
3. For each row:
   - Open the file at the specified line number
   - Review the current header and content
   - Apply the appropriate fix based on the category

## Fix Patterns by Category

### Category: "What is X?" Headers

**Problem**: Header asks "What is X?" but content doesn't directly answer the question

#### Fix Option 1: Restructure Content (Preferred)
Add a direct answer as the first sentence:

**Before**:
```markdown
## What is compute-compute separation?

Compute-compute separation is available for Scale and Enterprise tiers.

Each ClickHouse Cloud service includes:
...
```

**After**:
```markdown
## What is compute-compute separation?

Compute-compute separation is a feature that allows you to create multiple compute node groups, each with its own endpoint, that share the same object storage. This enables workload isolation and independent scaling of different workloads.

This feature is available for Scale and Enterprise tiers.

Each ClickHouse Cloud service includes:
...
```

#### Fix Option 2: Change Header to Statement
Remove the question format:

**Before**: "What is compute-compute separation?"
**After**: "Compute-compute separation overview" or "About compute-compute separation"

#### Fix Option 3: Change to Match Content
If the content focuses on features/availability:

**Before**: "What is compute-compute separation?"
**After**: "Compute-compute separation: Availability and features"

### Category: Too Generic Headers

**Problem**: Header is "Description", "Overview", or "Introduction" but content is specific

#### Fix: Make Header Specific

**Pattern for Aggregate Functions** (24 instances):

**Before**:
```markdown
## Description

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) aggregate function to select the first encountered element from a given column that matches the given condition.
```

**After**:
```markdown
## Using anyIf to select conditional values

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) aggregate function to select the first encountered element from a given column that matches the given condition.
```

**Other Examples**:

| Old Header | New Header | Rationale |
|------------|------------|-----------|
| Overview | Migration approaches: remoteSecure() vs BACKUP/RESTORE | Describes what the section actually covers |
| Introduction | Connecting to Kafka using named collections | States the specific topic |
| Description | Using UUID macros for unique Keeper paths | Describes the specific feature being explained |

## Priority Order

### High Priority (29 items)
All "What is X?" headers - These are most misleading to readers

**Recommended approach**:
1. Review each file
2. Decide if the content can be restructured (preferred) or if header should change
3. If restructuring, ensure the first paragraph directly answers the question
4. Test by asking: "If I only read the first paragraph, do I know what X is?"

### Medium Priority (33 items)
Generic headers - These reduce discoverability

**Recommended approach**:
1. Read the content of the section
2. Identify the main topic or action described
3. Replace generic header with specific descriptor
4. Follow the pattern: [Action/Feature] [specific detail]

## Validation Checklist

After fixing a header, verify:
- [ ] Header accurately describes what follows
- [ ] If header asks a question, first paragraph answers it
- [ ] Header uses specific terms that appear in the content
- [ ] Header helps readers decide if this section is relevant to them
- [ ] Header is consistent with other headers at the same level

## Common Mistakes to Avoid

❌ **Don't**: Change headers without reading the content
❌ **Don't**: Make headers too long (> 10 words is usually too much)
❌ **Don't**: Use jargon in headers that isn't explained in the content
❌ **Don't**: Create headers that are questions without ensuring the content answers them

✅ **Do**: Read the full section before changing the header
✅ **Do**: Use active, specific language
✅ **Do**: Test headers by asking "Does this tell me what I'll learn?"
✅ **Do**: Be consistent with similar sections

## Examples of Great Headers

From the analysis, these "What is X?" headers were GOOD:

1. **"What is a warehouse?"** → Opens with: "In ClickHouse Cloud, a _warehouse_ is a set of services that share the same data."
   - ✅ Directly defines the term
   - ✅ First sentence answers the question

2. **"What are settings?"** → Opens with a clear definition
   - ✅ Immediately explains what settings are
   - ✅ Provides context

## Bulk Updates

For the 24 aggregate function combinator pages, you might want to:

1. Create a template:
```markdown
## Using [FunctionName] to [Purpose]

The [`[Combinator]`](/link) combinator can be applied to the [`[BaseFunction]`](/link) aggregate function to [specific purpose].
```

2. Apply consistently across all files in `docs/guides/examples/aggregate_function_combinators/`

## Tracking Progress

Use the CSV file to track your progress:
1. Add a "Status" column
2. Mark each row as "Fixed", "In Progress", or "Needs Review"
3. Add a "Date Fixed" column to track completion
4. Sort by status to see remaining work

## Questions?

Refer to:
- `HEADER_ANALYSIS_REPORT.md` for detailed analysis
- `README_HEADER_ANALYSIS.md` for overall context
- Original problem statement for the rationale

---

Remember: The goal is to help readers quickly understand what each section contains. Headers should set accurate expectations and improve documentation navigation.
