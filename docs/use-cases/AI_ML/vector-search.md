---
slug: /use-cases/AI/qbit-vector-search
sidebar_label: 'QBit: Runtime-adjustable vector search'
title: 'QBit: Runtime-adjustable vector search'
pagination_prev: null
pagination_next: null
description: 'Learn how QBit enables runtime-adjustable precision tuning for vector search queries in ClickHouse.'
keywords: ['QBit', 'vector search', 'AI', 'embeddings', 'ANN']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import diagram_1 from '@site/static/images/use-cases/AI_ML/QBit/diagram_1.jpg';
import diagram_2 from '@site/static/images/use-cases/AI_ML/QBit/diagram_2.jpg';
import diagram_3 from '@site/static/images/use-cases/AI_ML/QBit/diagram_3.jpg';
import diagram_4 from '@site/static/images/use-cases/AI_ML/QBit/diagram_4.jpg';
import diagram_5 from '@site/static/images/use-cases/AI_ML/QBit/diagram_5.jpg';
import diagram_6 from '@site/static/images/use-cases/AI_ML/QBit/diagram_6.jpg';
import diagram_7 from '@site/static/images/use-cases/AI_ML/QBit/diagram_7.jpg';
import diagram_8 from '@site/static/images/use-cases/AI_ML/QBit/diagram_8.jpg';
import diagram_9 from '@site/static/images/use-cases/AI_ML/QBit/diagram_9.jpg';
import diagram_10 from '@site/static/images/use-cases/AI_ML/QBit/diagram_10.jpg';
import diagram_11 from '@site/static/images/use-cases/AI_ML/QBit/diagram_11.jpg';
import diagram_12 from '@site/static/images/use-cases/AI_ML/QBit/diagram_12.jpg';
import diagram_13 from '@site/static/images/use-cases/AI_ML/QBit/diagram_13.jpg';
import diagram_14 from '@site/static/images/use-cases/AI_ML/QBit/diagram_14.jpg';
import diagram_15 from '@site/static/images/use-cases/AI_ML/QBit/diagram_15.jpg';
import diagram_16 from '@site/static/images/use-cases/AI_ML/QBit/diagram_16.jpg';
import diagram_17 from '@site/static/images/use-cases/AI_ML/QBit/diagram_17.jpg';

In this guide, originally published on our [blog](https://clickhouse.com/blog/qbit-vector-search), you will learn about:
- Approximate Nearest Neighbours (ANN)
- Hierarchical Navigable Small World (HNSW)
- Quantised Bit (QBit)

## Vector search primer {#vector-search-primer}

In mathematics and physics, a vector is formally defined as an object that has both a magnitude and direction.
This often takes the form of a line segment or an arrow through space and can be used to represent quantities such as velocity, force and acceleration. In computer science, a vector is a finite sequence of numbers. In other words, it’s a data structure that is used to store numeric values.

In machine learning, vectors are the same data structures we talk about in computer science, but the numerical values stored in them have a special meaning. When we take a block of text or an image, and distill it down to the key concepts that it represents, this process is called encoding. The resulting output is a machine’s representation of those key concepts in numerical form. This is an embedding, and is stored in a vector. Said differently, when this contextual meaning is embedded in a vector, we can refer to it as an embedding.

Vector search is everywhere now.
It powers music recommendations, retrieval-augmented generation (RAG) for large language models where external knowledge is fetched to improve answers, and even googling is powered by vector search to some extent.

Users often prefer regular databases with ad-hoc vector capabilities over fully specialized vector stores, despite specialized databases' advantages.
ClickHouse supports [brute-force vector search](/engines/table-engines/mergetree-family/annindexes#exact-nearest-neighbor-search) as well as [methods for approximate nearest neighbour (ANN) search](/engines/table-engines/mergetree-family/annindexes#approximate-nearest-neighbor-search), including HNSW – the current standard for fast vector retrieval.

### Understanding embeddings {#understanding-embeddings}

Let's look at a simple example to understand how vector search works.
Consider embeddings (vector representations) of words:

<Image size="md" img={diagram_4} alt="Fruit and animal embeddings visualization"/>

Create the table below with some sample embeddings:

```sql
CREATE TABLE fruit_animal
ENGINE = MergeTree
ORDER BY word
AS SELECT *
FROM VALUES(
  'word String, vec Array(Float64)',
  ('apple', [-0.99105519, 1.28887844, -0.43526649, -0.98520696, 0.66154391]),
  ('banana', [-0.69372815, 0.25587061, -0.88226235, -2.54593015, 0.05300475]),
  ('orange', [0.93338752, 2.06571317, -0.54612565, -1.51625717, 0.69775337]),
  ('dog', [0.72138876, 1.55757105, 2.10953259, -0.33961248, -0.62217325]),
  ('horse', [-0.61435682, 0.48542571, 1.21091247, -0.62530446, -1.33082533])
);
```

Now we can search for the most similar words to a given embedding:

```sql
SELECT word, L2Distance(
  vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770]
) AS distance
FROM fruit_animal
ORDER BY distance
LIMIT 5;
```

Results:

| Word | Distance |
|------|----------|
| apple | 0.14639757188169716 |
| banana | 1.9989613690076786 |
| orange | 2.039041552613732 |
| horse | 2.7555776805484813 |
| dog | 3.382295083120104 |

The query embedding is closest to "apple", which makes sense!

## Approximate Nearest Neighbours (ANN) {#approximate-nearest-neighbours}

For large datasets, brute-force search becomes too slow. This is where Approximate Nearest Neighbours methods come in.

### Quantisation {#quantisation}

Quantisation involves downcasting to smaller numeric types. Smaller numbers mean smaller data, and smaller data means faster distance calculations. ClickHouse's vectorized query execution engine can fit more values into processor registers per operation, increasing throughput directly.

You have two options:

1. **Keep the quantised copy alongside the original column** - This doubles storage, but it's safe as we can always fall back to full precision
2. **Replace the original values entirely** (by downcasting on insertion) - This saves space and I/O, but it's a one-way door

### Hierarchical Navigable Small World (HNSW) {#hnsw}

<Image size="md" img={diagram_1} alt="HNSW layer structure"/>

HNSW is built from multiple layers of nodes (vectors). Each node is randomly assigned to one or more layers, with the chance of appearing in higher layers decreasing exponentially.

When performing a search, we start from a node at the top layer and move greedily towards the closest neighbours. Once no closer node can be found, we descend to the next, denser layer.

Because of this layered design, HNSW achieves logarithmic search complexity with respect to the number of nodes.

**HNSW limitation:** The main bottleneck is memory. ClickHouse uses the [usearch](https://github.com/unum-cloud/usearch) implementation of HNSW, which is an in-memory data structure that doesn't support splitting. As a result, larger datasets require proportionally more RAM.

### Comparison of approaches {#comparison-approaches}

| Category | Brute-force | HNSW | QBit |
|----------|-------------|------|------|
| **Precision** | Perfect | Great | Flexible |
| **Speed** | Slow | Fast | Flexible |
| **Others** | Quantized: more space or irreversible precision | Index has to fit in memory and has to be built | Still O(#records) |

## QBit deepdive {#qbit-deepdive}

### Quantised Bit (QBit) {#quantised-bit}

QBit is a new data structure that can store `BFloat16`, `Float32`, and `Float64` values by taking advantage of how floating-point numbers are represented – as bits. Instead of storing each number as a whole, QBit splits the values into **bit planes**: every first bit, every second bit, every third bit, and so on.

<Image size="md" img={diagram_2} alt="QBit bit planes concept"/>

This approach solves the main limitation of traditional quantisation. There's no need to store duplicated data or risk making values meaningless. It also avoids the RAM bottlenecks of HNSW, since QBit works directly with the stored data rather than maintaining an in-memory index.

**Most importantly, no upfront decisions are required.** Precision and performance can be adjusted dynamically at query time, allowing users to explore the balance between accuracy and speed with minimal friction.

:::note Limitation
Although QBit speeds up vector search, its computational complexity remains O(n). In other words: if your dataset is small enough for an HNSW index to fit comfortably in RAM, that is still the fastest choice.
:::

### The data type {#the-data-type}

Here's how to create a QBit column:

```sql
CREATE TABLE fruit_animal
(
    word String,
    vec QBit(Float64, 5)
)
ENGINE = MergeTree
ORDER BY word;

INSERT INTO fruit_animal VALUES
('apple',  [-0.99105519, 1.28887844, -0.43526649, -0.98520696, 0.66154391]),
('banana', [-0.69372815, 0.25587061, -0.88226235, -2.54593015, 0.05300475]),
('orange', [0.93338752, 2.06571317, -0.54612565, -1.51625717, 0.69775337]),
('dog',    [0.72138876, 1.55757105, 2.10953259, -0.33961248, -0.62217325]),
('horse',  [-0.61435682, 0.48542571, 1.21091247, -0.62530446, -1.33082533]);
```

<Image size="md" img={diagram_5} alt="QBit data structure transposition"/>

When data is inserted into a QBit column, it is transposed so that all first bits line up together, all second bits line up together, and so on. We call these **groups**.

Each group is stored in a separate `FixedString(N)` column: fixed-length strings of N bytes stored consecutively in memory with no separators between them. All such groups are then bundled together into a single `Tuple`, which forms the underlying structure of QBit.

**Example:** If we start with a vector of 8×Float64 elements, each group will contain 8 bits. Because a Float64 has 64 bits, we end up with 64 groups (one for each bit). Therefore, the internal layout of `QBit(Float64, 8)` looks like a Tuple of 64×FixedString(1) columns.

:::tip
If the original vector length doesn't divide evenly by 8, the structure is padded with invisible elements to make it align to 8. This ensures compatibility with FixedString, which operates strictly on full bytes.
:::

### The distance calculation {#the-distance-calculation}

To query with QBit, use the `L2DistanceTransposed` function with a precision parameter:

```sql
SELECT
  word,
  L2DistanceTransposed(vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770], 16) AS distance
FROM fruit_animal
ORDER BY distance;
```

Results:

| Word | Distance |
|------|----------|
| apple | 0.14639757188169716 |
| banana | 1.998961369007679 |
| orange | 2.039041552613732 |
| horse | 2.7555776805484813 |
| dog | 3.382295083120104 |

The third parameter (16) specifies the precision level in bits.

### I/O Optimisation {#io-optimisation}

<Image size="md" img={diagram_3} alt="QBit I/O optimization"/>

Before we can calculate distances, the required data must be read from disk and then untransposed (converted back from the grouped bit representation into full vectors). Because QBit stores values bit-transposed by precision level, ClickHouse can read only the top bit planes needed to reconstruct numbers up to the desired precision.

In the query above, we use a precision level of 16. Since a Float64 has 64 bits, we only read the first 16 bit planes, **skipping 75% of the data**.

<Image size="md" img={diagram_6} alt="QBit reconstruction"/>

After reading, we reconstruct only the top portion of each number from the loaded bit planes, leaving the unread bits zeroed out.

### Calculation optimisation {#calculation-optimisation}

<Image size="md" img={diagram_7} alt="Downcasting comparison"/>

One might ask whether casting to a smaller type, such as Float32 or BFloat16, could eliminate this unused portion. It does work, but explicit casts are expensive when applied to every row.

Instead, we can downcast only the reference vector and treat the QBit data as if it contained narrower values ("forgetting" the existence of some columns), since its layout often corresponds to a truncated version of those types.

#### BFloat16 Optimization {#bfloat16-optimization}

BFloat16 is a Float32 truncated by half. It keeps the same sign bit and 8-bit exponent, but only the upper 7 bits of the 23-bit mantissa. Because of this, reading the first 16 bit planes from a QBit column effectively reproduces the layout of BFloat16 values. So in this case, we can (and do) safely convert the reference vector to BFloat16.

#### Float64 Complexity {#float64-complexity}

Float64, however, is a different story. It uses an 11-bit exponent and a 52-bit mantissa, meaning it's not simply a Float32 with twice the bits. Its structure and exponent bias are completely different. Downcasting a Float64 to a smaller format like Float32 requires an actual IEEE-754 conversion, where each value is rounded to the nearest representable Float32. This rounding step is computationally expensive.

### Let's vectorise {#lets-vectorise}

#### What's vectorisation {#whats-vectorisation}

Vectorisation allows the CPU to process multiple values in a single instruction using SIMD (Single-Instruction-Multiple-Data) registers. The term originates from the fact that SIMD instructions operate on small batches (vectors) of data.

There are two approaches:

1. **Auto-vectorisation** - Write an algorithm in such a way that the compiler will figure out the concrete SIMD instructions itself
2. **Intrinsics** - Write the algorithm using explicit intrinsics: special functions that compilers map directly into CPU instructions

#### General algorithm {#general-algorithm}

<Image size="md" img={diagram_8} alt="Untransposition algorithm step 1"/>

<Image size="md" img={diagram_9} alt="Untransposition algorithm step 2"/>

<Image size="md" img={diagram_10} alt="Untransposition algorithm step 3"/>

<Image size="md" img={diagram_11} alt="Untransposition algorithm step 4"/>

We loop through all FixedString columns of the QBit (64 of them for Float64). Within each column, we iterate over every byte of the FixedString, and within each byte, over every bit.

If a bit is 0, we apply a zero mask to the destination at the corresponding position. If a bit is 1, we apply a mask that depends on its position within the byte.

#### Vectorized algorithm {#vectorized-algorithm}

<Image size="md" img={diagram_12} alt="AVX-512 vectorization"/>

<Image size="md" img={diagram_13} alt="SIMD lane mapping"/>

<Image size="md" img={diagram_14} alt="Bitmask application"/>

<Image size="md" img={diagram_15} alt="Destination merging"/>

<Image size="md" img={diagram_16} alt="Conditional merge intrinsic"/>

AVX-512 operates on 512-bit registers, which correspond to eight 64-bit lanes.

AVX-512 provides an intrinsic that does exactly this: it merges elements conditionally within the lanes, choosing between `upd` and the `dst` based on the mask bits.

**Congratulations, we've just unpacked eight values in a single iteration!**

Now that the data is ready, we can compute distances. For that, we use [SimSimd](https://github.com/ashvardanian/SimSIMD), an amazing library that performs vectorized distance calculations on almost any hardware.

## Benchmarks {#benchmarks}

We ran benchmarks on the HackerNews dataset, which contains around 29 million comments represented as Float32 embeddings. We measured the speed of searching for a single new comment (using its embedding) and computed the recall based on 10 new comments.

**Recall** here is the fraction of true nearest neighbours that appear among the top-k retrieved results (in our case, k = 20). **Granularity** is how many bit groups we read.

<Image size="md" img={diagram_17} alt="Benchmark results chart"/>

We achieved nearly **2× speed-up with a good recall**. More importantly, we can now control the speed-accuracy balance directly, adjusting it to match the workload.

:::note
Take the Float64 recall results with a grain of salt: these embeddings are simply upcast versions of Float32, so the lower half of the Float64 bits carries little to none information, thus removing them didn't affect the recall as much as it can.
:::

## Fun {#fun}

Let's see QBit in action with a real-world example using the DBpedia dataset, which contains 1 million Wikipedia articles represented as Float32 embeddings.

### Setup {#setup}

First, create a table and add a QBit column:

```sql
SET allow_experimental_qbit_type = 1;

-- Assuming you have a table with Float32 embeddings
ALTER TABLE dbpedia ADD COLUMN qbit QBit(Float32, 1536);
ALTER TABLE dbpedia UPDATE qbit = vector WHERE 1;
```

### Search query {#search-query}

We'll look for concepts most related to all space-related search terms: Moon, Apollo 11, Space Shuttle, Astronaut, Rocket.

The query searches the top 1000 semantically similar entries to each of the five concepts. It returns entries that appear in at least three of those results, ranked by how many concepts they match and their minimum distance to any of them (excluding the originals).

### Brute-Force Results {#brute-force-results}

| Rank | Title | Concepts Matched | Min Distance |
|------|-------|------------------|--------------|
| 1 | Apollo program | 4 | 0.82420665 |
| 2 | Apollo 8 | 4 | 0.8285278 |
| 3 | Lunar Orbiter 1 | 4 | 0.94581836 |
| 4 | Apollo (spacecraft) | 4 | 0.9643517 |
| 5 | Surveyor 1 | 4 | 0.9738264 |
| 6 | Spaceflight | 4 | 0.9831049 |
| 7 | Skylab | 4 | 0.99155205 |
| 8 | Orbital spaceflight | 4 | 1.0075209 |
| 9 | Dragon (spacecraft) | 4 | 1.0222818 |
| 10 | Space capsule | 4 | 1.0262821 |

**Performance:** 10 rows in set. Elapsed: 1.157 sec. Processed 10.00 million rows, 32.76 GB (8.64 million rows/s., 28.32 GB/s.) Peak memory usage: **6.05 GiB**.

### QBit Results (Precision 5) {#qbit-results}

Using just 5 bits (1 sign + 4 exponent bits, zero mantissa):

| Rank | Title | Concepts Matched | Min Distance |
|------|-------|------------------|--------------|
| 1 | Apollo 8 | 4 | 0.9924246668815613 |
| 2 | Apollo program | 4 | 0.9924481511116028 |
| 3 | Apollo 5 | 4 | 0.9925317764282227 |
| 4 | Apollo (spacecraft) | 4 | 0.9926576018333435 |
| 5 | Lunar Orbiter 1 | 4 | 0.9926905632019043 |
| 6 | Spaceflight | 4 | 0.9927355647087097 |
| 7 | Surveyor 1 | 4 | 0.9927787184715271 |
| 8 | Orbital spaceflight | 4 | 0.9927811026573181 |
| 9 | DSE-Alpha | 4 | 0.9928749799728394 |
| 10 | Luna programme | 4 | 0.9929065704345703 |

**Performance:** 10 rows in set. Elapsed: 0.271 sec. Processed 8.46 million rows, 4.54 GB (31.19 million rows/s., 16.75 GB/s.) Peak memory usage: **739.82 MiB**.

### Key Insight {#key-insight}

The results? Not just good. Surprisingly good. It's not obvious that floating points stripped of their entire mantissa and half their exponent still hold meaningful information.

**The key insight behind QBit is that vector search still works if we ignore insignificant bits.**

Memory usage reduced from **6.05 GB to 740 MB** while maintaining excellent semantic search quality!

## Result {#result}

We've built a new data type, QBit, which lets you control how many bits of a float are used for distance calculations in vector search. This means you can now adjust the precision/speed trade-off at runtime – no upfront decisions.

In practice, this reduces both I/O and computation time for vector search queries, while keeping accuracy remarkably high. And as we've seen, even 5 bits are enough to fly to the moon 🚀

---

*Based on the blog post by Raufs Dunamalijevs, published October 28, 2025*