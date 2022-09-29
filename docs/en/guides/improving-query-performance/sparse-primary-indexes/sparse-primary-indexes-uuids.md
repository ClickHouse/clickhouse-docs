---
slug: /en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-uuids
sidebar_label: Identifying single rows efficiently
sidebar_position: 5
description: Identifying single rows efficiently
---

# Identifying single rows efficiently

Although in general it is [not](/docs/en/faq/use-cases/key-value.md) the best use case for ClickHouse, 
sometimes applications built on top of ClickHouse require to identify single rows of a ClickHouse table. 

 
An intuitive solution for that might be to use a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) column with a unique value per row and for fast retrieval of rows to use that column as a primary key column.

For the fastest retrieval, the UUID column [would need to be the first key column](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#the-primary-index-is-used-for-selecting-granules).

We discussed that because [a ClickHouse table's row data is stored on disk ordered by primary key column(s)](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#data-is-stored-on-disk-ordered-by-primary-key-columns), having a very high cardinality column (like a UUID column) in a primary key or in a compound primary key before columns with lower cardinality [is detrimental for the compression ratio of other table columns](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-cardinality.md/#optimal-compression-ratio-of-data-files).

A compromise between fastest retrieval and optimal data compression is to use a compound primary key where the UUID is the last key column, after low(er) cardinality key columns that are used to ensure a good compression ratio for some of the table's columns. 

# A concrete example

One concrete example is a the plaintext paste service https://pastila.nl that Alexey Milovidov developed and [blogged about](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

On every change to the text-area, the data is saved automatically into a ClickHouse table row (one row per change).

And one way to identify and retrieve (a specific version of) the pasted content is to use a hash of the content as the UUID for the table row that contains the content.

The following diagram shows 
- the insert order of rows when the content changes (for example because of keystrokes typing the text into the text-area) and
- the on-disk order of the data from the inserted rows when the `PRIMARY KEY (hash)` is used:
<img src={require('./images/sparse-primary-indexes-15a.png').default} class="image"/>

Because the `hash` column is used as the primary key column
- specific rows can be retrieved [very quickly](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#the-primary-index-is-used-for-selecting-granules), but
- the table's rows (their column data) are stored on disk ordered ascending by (the unique and random) hash values. Therefore also the content column's values are stored in random order with no data locality resulting in a **suboptimal compression ratio for the content column data file**.


In order to significantly improve the compression ratio for the content column while still achieving fast retrieval of specific rows, pastila.nl is using two hashes (and a compound primary key) for identifying a specific row: 
- a hash of the content, as discussed above, that is distinct for distinct data, and
- a [locality-sensitive hash (fingerprint)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing) that does **not** change on small changes of data.

The following diagram shows 
- the insert order of rows when the content changes (for example because of keystrokes typing the text into the text-area) and
- the on-disk order of the data from the inserted rows when the compound `PRIMARY KEY (fingerprint, hash)` is used:

<img src={require('./images/sparse-primary-indexes-15b.png').default} class="image"/>

Now the rows on disk are first ordered by `fingerprint`, and for rows with the same fingerprint value, their `hash` value determines the final order. 

Because data that differs only in small changes is getting the same fingerprint value, similar data is now stored on disk close to each other in the content column. And that is very good for the compression ratio of the content column, as a compression algorithm in general benefits from data locality (the more similar the data is the better the compression ratio is).

The compromise is that two fields (`fingerprint` and `hash`) are required for the retrieval of a specific row in order to optimally utilise the primary index that results from the compound `PRIMARY KEY (fingerprint, hash)`.  
