import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';


ClickHouse tables using the **MergeTree engine** store data on disk as **immutable parts**, which are created every time data is inserted. 

Each insert creates a new part containing sorted, compressed column files, along with metadata like indexes and checksums. For a detailed description of part structures and how they are formed we recommend this [guide](/parts).

Over time, background processes merge smaller parts into larger ones to reduce fragmentation and improve query performance.

<Image img={simple_merges} size="md" alt="Simple merges" />

While it's tempting to manually trigger this merge using:

```sql
OPTIMIZE TABLE <table> FINAL;
```

**you should avoid this operation in most cases** as it initiates resource intensive operations which may impact cluster performance.

## Why Avoid?  \{#why-avoid}

### It's expensive \{#its-expensive}

Running `OPTIMIZE FINAL` forces ClickHouse to merge **all** active parts into a **single part**, even if large merges have already occurred. This involves:

1. **Decompressing** all parts
2. **Merging** the data
3. **Compressing** it again
4. **Writing** the final part to disk or object storage

These steps are **CPU and I/O-intensive** and can put significant strain on your system, especially when large datasets are involved.

### It ignores safety limits \{#it-ignores-safety-limits}

Normally, ClickHouse avoids merging parts larger than ~150 GB (configurable via [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)). But `OPTIMIZE FINAL` **ignores this safeguard**, which means:

* It may try to merge **multiple 150 GB parts** into one massive part
* This could result in **long merge times**, **memory pressure**, or even **out-of-memory errors**
* These large parts may become challenging to merge i.e. attempts to merge them further fails for the reasons stated above. In cases where merges are required for correct query time behavior, this can result in undesired consequences e.g. [duplicates accumulating for a ReplacingMergeTree](/guides/developer/deduplication#using-replacingmergetree-for-upserts), increasing query time performance.

## Let background merges do the work \{#let-background-merges-do-the-work}

ClickHouse already performs smart background merges to optimize storage and query efficiency. These are incremental, resource-aware, and respect configured thresholds. Unless you have a very specific need (e.g., finalizing data before freezing a table or exporting), **you're better off letting ClickHouse manage merges on its own**.
