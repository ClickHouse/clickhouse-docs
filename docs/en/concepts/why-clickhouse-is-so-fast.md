---
sidebar_position: 1
sidebar_label: Why is ClickHouse so Fast?
description: "It was designed to be fast. Query execution performance has always been a top priority during the development process, but other important characteristics like user-friendliness, scalability, and security were also considered so ClickHouse could become a real production system."
---

# Why is ClickHouse so fast? {#why-clickhouse-is-so-fast}

<!-- slug: /en/faq/general/why-clickhouse-is-so-fast  -->

It was designed to be fast. Query execution performance has always been a top priority during the development process, but other important characteristics like user-friendliness, scalability, and security were also considered so ClickHouse could become a real production system.

### "Building for Fast", Alexey Milovidov (CTO, ClickHouse)

<iframe width="675" height="380" src="https://www.youtube.com/embed/CAS2otEoerM" frameborder="0" allow="accelerometer; autoplay; gyroscope; picture-in-picture" allowfullscreen></iframe>

["Building for Fast"](https://www.youtube.com/watch?v=CAS2otEoerM) talk from ClickHouse Meetup Amsterdam, June 2022.

["Secrets of ClickHouse Performance Optimizations"](https://www.youtube.com/watch?v=ZOZQCQEtrz8) talk from Big Data Technology Conference, December 2019, offers a more technical take on the same topic.

## What Makes ClickHouse so Fast?

### Architecture choices

ClickHouse was initially built as a prototype to do just a single task well: to filter and aggregate data as fast as possible. That’s what needs to be done to build a typical analytical report, and that’s what a typical [GROUP BY](../sql-reference/statements/select/group-by.md) query does. The ClickHouse team has made several high-level decisions that, when combined, made achieving this task possible:

**Column-oriented storage:**   Source data often contain hundreds or even thousands of columns, while a report can use just a few of them. The system needs to avoid reading unnecessary columns to avoid expensive disk read operations.

**Indexes:**  Memory resident ClickHouse data structures allow the reading of only the necessary columns, and only the necessary row ranges of those columns.

**Data compression:**   Storing different values of the same column together often leads to better compression ratios (compared to row-oriented systems) because in real data a column often has the same, or not so many different, values for neighboring rows. In addition to general-purpose compression, ClickHouse supports [specialized codecs](../sql-reference/statements/create/table.md/#specialized-codecs) that can make data even more compact.

**Vectorized query execution:**  ClickHouse not only stores data in columns but also processes data in columns. This leads to better CPU cache utilization and allows for [SIMD](https://en.wikipedia.org/wiki/SIMD) CPU instructions usage.

**Scalability:**   ClickHouse can leverage all available CPU cores and disks to execute even a single query. Not only on a single server but all CPU cores and disks of a cluster as well.

### Attention to Low-Level Details

But many other database management systems use similar techniques. What really makes ClickHouse stand out is **attention to low-level details**. Most programming languages provide implementations for most common algorithms and data structures, but they tend to be too generic to be effective. Every task can be considered as a landscape with various characteristics, instead of just throwing in random implementation. For example, if you need a hash table, here are some key questions to consider:

- Which hash function to choose?
- Collision resolution algorithm: [open addressing](https://en.wikipedia.org/wiki/Open_addressing) vs [chaining](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)?
- Memory layout: one array for keys and values or separate arrays? Will it store small or large values?
- Fill factor: when and how to resize? How to move values around on resize?
- Will values be removed and which algorithm will work better if they will?
- Will we need fast probing with bitmaps, inline placement of string keys, support for non-movable values, prefetch, and batching?

Hash table is a key data structure for `GROUP BY` implementation and ClickHouse automatically chooses one of [30+ variations](https://github.com/ClickHouse/ClickHouse/blob/master/src/Interpreters/Aggregator.h) for each specific query.

The same goes for algorithms, for example, in sorting you might consider:

- What will be sorted: an array of numbers, tuples, strings, or structures?
- Is all data available completely in RAM?
- Do we need a stable sort?
- Do we need a full sort? Maybe partial sort or n-th element will suffice?
- How to implement comparisons?
- Are we sorting data that has already been partially sorted?

Algorithms that rely on characteristics of data they are working with can often do better than their generic counterparts. If it is not really known in advance, the system can try various implementations and choose the one that works best in runtime. For example, see an [article on how LZ4 decompression is implemented in ClickHouse](https://habr.com/en/company/yandex/blog/457612/).

Last but not least, the ClickHouse team always monitors the Internet on people claiming that they came up with the best implementation, algorithm, or data structure to do something and tries it out. Those claims mostly appear to be false, but from time to time you’ll indeed find a gem.

:::info Tips for building your own high-performance software
- Keep in mind low-level details when designing your system.
- Design based on hardware capabilities.
- Choose data structures and abstractions based on the needs of the task.
- Provide specializations for special cases.
- Try new, "best" algorithms, that you read about yesterday.
- Choose an algorithm in runtime based on statistics.
- Benchmark on real datasets.
- Test for performance regressions in CI.
- Measure and observe everything.
:::


## VLDB 2024 paper

In August 2024, we had our first research paper accepted and published at VLDB. 
VLDB in an international conference on very large databases, and is widely regarded as one of the leading conferences in the field of data management. 
Among the hundreds of submissions, VLDB generally has an acceptance rate of ~20%.

You can read a [PDF of the paper](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf), which gives a concise description of ClickHouse's most interesting architectural and system design components that make it so fast.

Alexey Milovidov, our CTO and the creator of ClickHouse, presented the paper (slides [here](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/vldb_2024/VLDB_2024_presentation.pdf)), followed by a Q&A (that quickly ran out of time!). 
You can catch the recorded presentation here: 

<iframe width="768" height="432" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>