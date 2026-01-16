---
slug: /use-cases/AI/qbit-vector-search
sidebar_label: '使用 QBit 进行向量搜索'
title: '向量搜索与 QBit 简介'
pagination_prev: null
pagination_next: null
description: '了解 QBit 如何在 ClickHouse 中为向量搜索查询实现运行时可调的精度调优。'
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

:::note[在本指南中，你将：]

* 简要了解向量搜索
* 学习近似最近邻（Approximate Nearest Neighbours，ANN）和分层可导航小世界图（Hierarchical Navigable Small World，HNSW）
* 学习量化比特（Quantised Bit，QBit）
* 使用 QBit 对 DBpedia 数据集执行向量搜索
  :::


## 向量搜索入门 \\{#vector-search-primer\\}

在数学和物理中，向量被严格定义为同时具有大小和方向的对象。
它通常表现为空间中的线段或箭头，可用于表示速度、力和加速度等物理量。
在计算机科学中，向量是一个有限的数值序列。
换句话说，它是一种用于存储数值的数据结构。

在机器学习中，向量仍然是我们在计算机科学中讨论的数据结构，但其中存储的数值具有特殊含义。
当我们取一段文本或一张图像，并将其提炼为其中所代表的关键概念时，这个过程称为编码（encoding）。
其产生的输出是机器对这些关键概念的数值化表示。
这就是一个嵌入（embedding），并以向量形式存储。
换句话说，当这种上下文含义被嵌入到一个向量中时，我们可以将其称为一个嵌入（embedding）。

如今，向量搜索无处不在。
它为音乐推荐、大型语言模型中用于获取外部知识从而改进回答的检索增强生成（RAG）提供支持，甚至在某种程度上，搜索引擎本身也是由向量搜索驱动的。

尽管专用向量数据库有其优势，但用户往往更偏好具备按需（ad-hoc）向量能力的常规数据库，而不是完全专用的向量存储。
ClickHouse 同时支持[穷举向量搜索](/engines/table-engines/mergetree-family/annindexes#exact-nearest-neighbor-search)以及[近似最近邻（ANN）搜索方法](/engines/table-engines/mergetree-family/annindexes#approximate-nearest-neighbor-search)，包括 HNSW —— 当前用于快速向量检索的事实标准。

### 理解 embedding \{#understanding-embeddings\}

我们通过一个简单的示例来了解向量搜索是如何工作的。
先来看一些单词的 embedding（向量表示）：

<Image size="md" img={diagram_4} alt="水果和动物 embedding 可视化图" />

使用一些示例 embedding 创建如下表格：

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

你可以根据给定的 embedding 查询与其最相近的词：

```sql
SELECT word, L2Distance(
  vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770]
) AS distance
FROM fruit_animal
ORDER BY distance
LIMIT 5;
```

```response
┌─word───┬────────────distance─┐
│ apple  │ 0.14639757188169716 │
│ banana │  1.9989613690076786 │
│ orange │   2.039041552613732 │
│ horse  │  2.7555776805484813 │
│ dog    │   3.382295083120104 │
└────────┴─────────────────────┘
```

该查询嵌入与 &quot;apple&quot; 的距离最近（即距离最小），如果我们将这两个嵌入向量并排对比，就会发现这是合理的：

```response
apple:           [-0.99105519,1.28887844,-0.43526649,-0.98520696,0.66154391]
query embedding: [-0.88693672,1.31532824,-0.51182908,-0.99652702,0.5990777]
```


## 近似最近邻 (ANN) \\{#approximate-nearest-neighbours\\}

对于大型数据集，穷举搜索会变得过于缓慢。
这时就可以使用近似最近邻方法。

### 量化 \\{#quantisation\\}

量化是指将数据降级为更小的数值类型。
数值越小，数据越小，而数据越小，距离计算就越快。
ClickHouse 的向量化查询执行引擎在每次操作中可以在处理器寄存器中容纳更多的值，从而直接提高吞吐量。

你有两个选项：

1. **在原始列的基础上保留一份量化后的副本** —— 虽然会使存储占用翻倍，但很安全，因为我们始终可以回退到全精度
2. **完全替换原始值**（在插入时进行降级转换）—— 可以节省空间和 I/O，但这是单向选择，无法恢复到原始精度

### 分层可导航小世界（HNSW） \\{#hnsw\\}

<Image size="md" img={diagram_1} alt="HNSW 层级结构"/>

HNSW 由多个由节点（向量）组成的层构成。每个节点会被随机分配到一个或多个层，且出现在更高层的概率呈指数级下降。

执行搜索时，我们从顶层的一个节点开始，贪心地向最近的邻居移动。一旦无法找到更近的节点，就下降到下一个、更稠密的层级。

由于这种分层设计，HNSW 的搜索复杂度相对于节点数量可以达到对数级。

:::warning[HNSW 的局限性]
主要瓶颈是内存。ClickHouse 使用 HNSW 的 [usearch](https://github.com/unum-cloud/usearch) 实现，它是一种不支持拆分的内存中数据结构。
因此，更大的数据集需要按比例更多的 RAM。
:::

### 方法对比 \\{#comparison-approaches\\}

| Category | Brute-force | HNSW | QBit |
|----------|-------------|------|------|
| **Precision** | 完美 | 极佳 | 灵活 |
| **Speed** | 慢 | 快 | 灵活 |
| **Others** | 量化：占用更多空间或带来不可逆的精度损失 | 索引必须能放入内存并且需要预先构建 | 仍为 O(#records) 量级 |

## QBit 深入剖析 \\{#qbit-deepdive\\}

### 量化比特（QBit） \\{#quantised-bit\\}

QBit 是一种新的数据结构，可以利用浮点数的底层表示——比特位——来存储 `BFloat16`、`Float32` 和 `Float64` 值。
QBit 不再将每个数字作为一个整体来存储，而是将这些值拆分为**比特平面（bit planes）**：所有第 1 位比特、所有第 2 位比特、所有第 3 位比特，依此类推。

<Image size="md" img={diagram_2} alt="QBit 比特平面概念"/>

这种方法解决了传统量化的主要限制。不再需要存储重复数据，也不会冒着让数值失去意义的风险。它同样避免了 HNSW 的内存瓶颈，因为 QBit 直接作用于已存储的数据，而无需维护内存中的索引。

:::tip[优点]
**最重要的是，不需要做任何前期决策。**
可以在查询时动态调整精度和性能，使用户能够以极小成本探索准确性与速度之间的平衡。
:::

:::note 限制
尽管 QBit 加速了向量搜索，但其计算复杂度仍然是 O(n)。换句话说：如果你的数据集足够小，使得 HNSW 索引可以轻松放入 RAM，那么 HNSW 依然是速度最快的选择。
:::

### 数据类型 \{#the-data-type\}

下面介绍如何创建一个 QBit 列：

```sql
SET allow_experimental_qbit_type = 1;
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

<Image size="md" img={diagram_5} alt="QBit 数据结构转置" />

当数据写入 QBit 列时，它会被转置：所有第 1 位对齐在一起、所有第 2 位对齐在一起，依此类推。我们把这些称为**分组**。

每个分组存储在单独的 `FixedString(N)` 列中：固定长度为 N 字节的字符串，在内存中连续存储，其间没有分隔符。所有这些分组随后被打包到一个 `Tuple` 中，这个 Tuple 构成了 QBit 的底层结构。

**示例：** 如果我们从一个包含 8×Float64 元素的向量开始，每个分组会包含 8 位。由于一个 Float64 有 64 位，我们最终会得到 64 个分组（每一位对应一个分组）。因此，`QBit(Float64, 8)` 的内部布局看起来就像一个由 64×FixedString(1) 列组成的 Tuple。

:::tip
如果原始向量长度不能被 8 整除，该结构将通过填充额外的“不可见”元素的方式对齐到 8。这可以确保与 FixedString 的兼容性，因为 FixedString 严格按完整字节进行操作。
:::


### 距离计算 \{#the-distance-calculation\}

使用 QBit 进行查询时，请使用带有精度参数的 [`L2DistanceTransposed`](/sql-reference/functions/distance-functions#L2DistanceTransposed) 函数：

```sql
SELECT
  word,
  L2DistanceTransposed(vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770], 16) AS distance
FROM fruit_animal
ORDER BY distance;
```

```response
┌─word───┬────────────distance─┐
│ apple  │ 0.15196434766705247 │
│ banana │   1.966091150410285 │
│ orange │  1.9864477714218596 │
│ horse  │  2.7306267946594005 │
│ dog    │  3.2849989362383165 │
└────────┴─────────────────────┘
```

第三个参数（16）指定精度，单位为比特。


### I/O 优化 \\{#io-optimisation\\}

<Image size="md" img={diagram_3} alt="QBit I/O 优化"/>

在计算距离之前，必须先从磁盘读取所需数据，然后进行“反转置”（从按位分组的表示转换回完整向量）。由于 QBit 按精度级别以按位转置的方式存储数值，ClickHouse 只需读取用于在目标精度下重建数值所需的最高位平面。

在上面的查询中，我们使用精度级别 16。由于一个 Float64 有 64 位，我们只需读取前 16 个位平面，**跳过了 75% 的数据**。

<Image size="md" img={diagram_6} alt="QBit 重建"/>

读取完成后，我们仅根据加载的位平面重建每个数值的高位部分，未读取的位保持为零。

### 计算优化 \\{#calculation-optimisation\\}

<Image size="md" img={diagram_7} alt="降精度转换对比"/>

有人可能会问，将类型转换为更小的类型（例如 Float32 或 BFloat16）是否可以消除这部分未使用的空间。这样确实可行，但对每一行都进行显式类型转换的代价很高。

相反，我们可以只对引用向量进行降精度处理，并将 QBit 数据视为其中只包含精度更低的值（“忽略”某些列的存在），因为它的布局通常与这些类型截断后的版本相对应。

#### BFloat16 优化 \\{#bfloat16-optimization\\}

BFloat16 是在 Float32 基础上按位截断一半精度得到的类型。它保留相同的符号位和 8 位指数位，但在 23 位尾数中仅保留最高的 7 位。正因为如此，从 QBit 列中读取前 16 个比特平面时，其效果等同于重现 BFloat16 值的内存布局。因此，在这种情况下，我们可以（并且确实会）安全地将参考向量转换为 BFloat16。

#### Float64 复杂度 \\{#float64-complexity\\}

然而，Float64 的情况则完全不同。它使用 11 位指数位和 52 位尾数位，这意味着它并不是简单地将 Float32 的位数翻倍。它的结构和指数偏置都完全不同。将 Float64 向下转换为像 Float32 这样更小的格式时，需要执行真正的 IEEE-754 转换，其中每个值都会被舍入到最接近且可由 Float32 表示的数值。这个舍入步骤在计算上开销很大。

:::tip
如果你对 QBit 的性能要素感兴趣并想深入了解，请参阅 ["Let’s vectorise"](https://clickhouse.com/blog/qbit-vector-search#lets-vectorise)
:::

## 使用 DBpedia 的示例 \\{#example\\}

下面通过一个真实案例来看看 QBit 的实际效果，使用的是 DBpedia 数据集，其中包含 100 万篇 Wikipedia 文章，这些文章被表示为 Float32 类型的嵌入向量。

### 环境准备 \{#setup\}

首先，创建数据表

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);
```

在命令行中插入数据：

```bash
for i in $(seq 0 25); do
  echo "Processing file ${i}..."
  clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/${i}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
  echo "File ${i} complete."
done
```

:::tip
插入数据可能会花一些时间。
正好去喝杯咖啡休息一下！
:::

或者，你也可以按照下面的示例，分别运行 SQL 语句来加载这 25 个 Parquet 文件（每个文件一条语句）：

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
```

确认在 dbpedia 表中能看到 100 万行：

```sql
SELECT count(*)
FROM dbpedia

┌─count()─┐
│ 1000000 │
└─────────┘
```

接下来，添加一个 QBit 列：

```sql
SET allow_experimental_qbit_type = 1;

-- Assuming you have a table with Float32 embeddings
ALTER TABLE dbpedia ADD COLUMN qbit QBit(Float32, 1536);
ALTER TABLE dbpedia UPDATE qbit = vector WHERE 1;
```


### 搜索查询 \{#search-query\}

我们将查找与以下所有太空相关搜索词最相关的概念：Moon、Apollo 11、Space Shuttle、Astronaut、Rocket：

```sql
SELECT
    title,
    text,
    COUNT(DISTINCT concept) AS num_concepts_matched,
    MIN(distance) AS min_distance,
    AVG(distance) AS avg_distance
FROM (
         (
             SELECT title, text, 'Moon' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Moon'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Moon'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Apollo 11' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Apollo 11'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Apollo 11'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Space Shuttle' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Space Shuttle'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Space Shuttle'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Astronaut' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Astronaut'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Astronaut'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Rocket' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Rocket'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Rocket'
             ORDER BY distance ASC
                 LIMIT 1000
         )
     )
WHERE title NOT IN ('Moon', 'Apollo 11', 'Space Shuttle', 'Astronaut', 'Rocket')
GROUP BY title, text
HAVING num_concepts_matched >= 3
ORDER BY num_concepts_matched DESC, min_distance ASC
    LIMIT 10;
```

该查询会针对这五个概念中的每一个检索语义上最相似的前 1000 个条目。
它返回的是那些至少出现在这五个结果中任意三个中的条目，并按其匹配的概念数量以及到任一概念的最小距离进行排序（不包括原始条目）。

只使用 5 位（1 位符号位 + 4 位指数位，尾数为零）：


```response
Row 1:
──────
title:                Aintree railway station
text:                 For a guide to the various Aintree stations that have existed and their relationship to each other see Aintree Stations.Aintree railway station is a railway station in Aintree, Merseyside, England.  It is on the Ormskirk branch of the Merseyrail network's Northern Line.  Until 1968 it was known as Aintree Sefton Arms after a nearby public house. The station's design reflects the fact it is the closest station to Aintree Racecourse, where the annual Grand National horse race takes place.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 2:
──────
title:                AP German Language
text:                 Advanced Placement German Language (also known as AP German Language or AP German) is a course and examination provided by the College Board through the Advanced Placement Program. This course  is designed to give high school students the opportunity to receive credit in a college-level German language course.Originally the College Board had offered two AP German exams, one with AP German Language and another with AP German Literature.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 3:
──────
title:                Adelospondyli
text:                 Adelospondyli is an order of elongate, presumably aquatic, Carboniferous amphibians.  The skull is solidly roofed, and elongate, with the orbits located very far forward.  The limbs are well developed.  Most adelospondyls belong to the family Adelogyrinidae, although the adelospondyl Acherontiscus has been placed in its own family, Acherontiscidae. The group is restricted to the Mississippian (Serpukhovian Age) of Scotland.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 4:
──────
title:                Adrien-Henri de Jussieu
text:                 Adrien-Henri de Jussieu (23 December 1797 – 29 June 1853) was a French botanist.Born in Paris as the son of botanist Antoine Laurent de Jussieu, he received the degree of Doctor of Medicine in 1824 with a treatise of the plant family Euphorbiaceae.  When his father retired in 1826, he succeeded him at the Jardin des Plantes; in 1845 he became professor of organography of plants.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 5:
──────
title:                Alan Taylor (footballer, born 1953)
text:                 Alan Taylor (born 14 November 1953) is an English former professional footballer best known for his goalscoring exploits with West Ham United in their FA Cup success of 1975, culminating in two goals in that season's final.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 6:
──────
title:                Abstract algebraic logic
text:                 In mathematical logic, abstract algebraic logic is the study of the algebraization of deductive systemsarising as an abstraction of the well-known Lindenbaum-Tarski algebra, and how the resulting algebras are related to logical systems.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 7:
──────
title:                Ahsan Saleem Hyat
text:                 General Ahsan Saleem Hayat (Urdu: احسن سلیم حیات; born 10 January 1948), is a retired four-star general who served as the vice chief of army staff of the Pakistan Army from 2004 until his retirement in 2007. Prior to that, he served as the operational field commander of the V Corps in Sindh Province and was a full-tenured professor of war studies at the National Defence University. He was succeeded by General Ashfaq Parvez Kayani on 8 October 2007.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 8:
──────
title:                Al Wafa al Igatha al Islamia
text:                 There is another organization named Al Wafa (Israel), a charity, in Israel, devoted to womenThere is another organization Jamaiat Al-Wafa LiRayat Al-Musenin which is proscribed by the Israeli government.Al Wafa is an Islamic charity listed in Executive Order 13224 as an entity that supports terrorism.United States intelligence officials state that it was founded in Afghanistan by Adil Zamil Abdull Mohssin Al Zamil,Abdul Aziz al-Matrafi and Samar Khand.According to Saad Madai Saad al-Azmi's Combatant Status Review Tribunal Al Wafa is located in the Wazir Akhbar Khan area ofAfghanistan.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 9:
───────
title:                Alex Baumann
text:                 Alexander Baumann, OC OOnt (born April 21, 1964) is a Canadian former competitive swimmer who won two gold medals and set two world records at the 1984 Summer Olympics in Los Angeles.Born in Prague (former Czechoslovakia), Baumann was raised in Canada after his family moved there in 1969 following the Prague Spring.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 10:
───────
title:                Alberni-Clayoquot Regional District
text:                 The Alberni-Clayoquot Regional District (2006 population 30,664) of British Columbia is located on west central Vancouver Island.  Adjacent regional districts it shares borders with are the Strathcona and Comox Valley Regional Districts to the north, and the Nanaimo and Cowichan Valley Regional Districts to the east. The regional district offices are located in Port Alberni.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

10 rows in set. Elapsed: 0.542 sec. Processed 5.01 million rows, 1.86 GB (9.24 million rows/s., 3.43 GB/s.)
Peak memory usage: 327.04 MiB.
```

**性能：**Set 中有 10 行。耗时：0.271 秒。处理了 846 万行、4.54 GB（3119 万行/秒，16.75 GB/秒）。峰值内存使用：**739.82 MiB**。

<details>
  <summary>与暴力搜索比较性能</summary>

  ```sql
  SELECT 
      title,
      text,
      COUNT(DISTINCT concept) AS num_concepts_matched,
      MIN(distance) AS min_distance,
      AVG(distance) AS avg_distance
  FROM (
      (
          SELECT title, text, 'Moon' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Moon'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Moon'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Apollo 11' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Apollo 11'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Apollo 11'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Space Shuttle' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Space Shuttle'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Space Shuttle'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Astronaut' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Astronaut'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Astronaut'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Rocket' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Rocket'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Rocket'
          ORDER BY distance ASC
          LIMIT 1000
      )
  )
  WHERE title NOT IN ('Moon', 'Apollo 11', 'Space Shuttle', 'Astronaut', 'Rocket')
  GROUP BY title, text
  HAVING num_concepts_matched >= 3
  ORDER BY num_concepts_matched DESC, min_distance ASC
  LIMIT 10;
  ```

  ```response
  Row 1:
  ──────
  title:                Apollo program
  text:                 The Apollo program, also known as Project Apollo, was the third United States human spaceflight program carried out by the National Aeronautics and Space Administration (NASA), which accomplished landing the first humans on the Moon from 1969 to 1972. First conceived during Dwight D. Eisenhower's administration as a three-man spacecraft to follow the one-man Project Mercury which put the first Americans in space, Apollo was later dedicated to President John F.
  num_concepts_matched: 4
  min_distance:         0.82420665
  avg_distance:         1.0207901149988174

  Row 2:
  ──────
  title:                Apollo 8
  text:                 Apollo 8, the second human spaceflight mission in the United States Apollo space program, was launched on December 21, 1968, and became the first manned spacecraft to leave Earth orbit, reach the Earth's Moon, orbit it and return safely to Earth.
  num_concepts_matched: 4
  min_distance:         0.8285278
  avg_distance:         1.0357224345207214

  Row 3:
  ──────
  title:                Lunar Orbiter 1
  text:                 The Lunar Orbiter 1 robotic (unmanned) spacecraft, part of the Lunar Orbiter Program, was the first American spacecraft to orbit the Moon.  It was designed primarily to photograph smooth areas of the lunar surface for selection and verification of safe landing sites for the Surveyor and Apollo missions. It was also equipped to collect selenodetic, radiation intensity, and micrometeoroid impact data.The spacecraft was placed in an Earth parking orbit on August 10, 1966 at 19:31 (UTC).
  num_concepts_matched: 4
  min_distance:         0.94581836
  avg_distance:         1.0584313124418259

  Row 4:
  ──────
  title:                Apollo (spacecraft)
  text:                 The Apollo spacecraft was composed of three parts designed to accomplish the American Apollo program's goal of landing astronauts on the Moon by the end of the 1960s and returning them safely to Earth.  The expendable (single-use) spacecraft consisted of a combined Command/Service Module (CSM) and a Lunar Module (LM).
  num_concepts_matched: 4
  min_distance:         0.9643517
  avg_distance:         1.0367188602685928

  Row 5:
  ──────
  title:                Surveyor 1
  text:                 Surveyor 1 was the first lunar soft-lander in the unmanned  Surveyor program of the National Aeronautics and Space Administration (NASA, United States). This lunar soft-lander gathered data about the lunar surface that would be needed for the manned Apollo Moon landings that began in 1969.
  num_concepts_matched: 4
  min_distance:         0.9738264
  avg_distance:         1.0988530814647675

  Row 6:
  ──────
  title:                Spaceflight
  text:                 Spaceflight (also written space flight) is ballistic flight into or through outer space. Spaceflight can occur with spacecraft with or without humans on board. Examples of human spaceflight include the Russian Soyuz program, the U.S. Space shuttle program, as well as the ongoing International Space Station. Examples of unmanned spaceflight include space probes that leave Earth orbit, as well as satellites in orbit around Earth, such as communications satellites.
  num_concepts_matched: 4
  min_distance:         0.9831049
  avg_distance:         1.060678943991661

  Row 7:
  ──────
  title:                Skylab
  text:                 Skylab was a space station launched and operated by NASA and was the United States' first space station. Skylab orbited the Earth from 1973 to 1979, and included a workshop, a solar observatory, and other systems. It was launched unmanned by a modified Saturn V rocket, with a weight of 169,950 pounds (77 t).  Three manned missions to the station, conducted between 1973 and 1974 using the Apollo Command/Service Module (CSM) atop the smaller Saturn IB, each delivered a three-astronaut crew.
  num_concepts_matched: 4
  min_distance:         0.99155205
  avg_distance:         1.0769911855459213

  Row 8:
  ──────
  title:                Orbital spaceflight
  text:                 An orbital spaceflight (or orbital flight) is a spaceflight in which a spacecraft is placed on a trajectory where it could remain in space for at least one orbit. To do this around the Earth, it must be on a free trajectory which has an altitude at perigee (altitude at closest approach) above 100 kilometers (62 mi) (this is, by at least one convention, the boundary of space).  To remain in orbit at this altitude requires an orbital speed of ~7.8 km/s.
  num_concepts_matched: 4
  min_distance:         1.0075209
  avg_distance:         1.085978478193283

  Row 9:
  ───────
  title:                Dragon (spacecraft)
  text:                 Dragon is a partially reusable spacecraft developed by SpaceX, an American private space transportation company based in Hawthorne, California. Dragon is launched into space by the SpaceX Falcon 9 two-stage-to-orbit launch vehicle, and SpaceX is developing a crewed version called the Dragon V2.During its maiden flight in December 2010, Dragon became the first commercially built and operated spacecraft to be recovered successfully from orbit.
  num_concepts_matched: 4
  min_distance:         1.0222818
  avg_distance:         1.0942841172218323

  Row 10:
  ───────
  title:                Space capsule
  text:                 A space capsule is an often manned spacecraft which has a simple shape for the main section, without any wings or other features to create lift during atmospheric reentry.Capsules have been used in most of the manned space programs to date, including the world's first manned spacecraft Vostok and Mercury, as well as in later Soviet Voskhod, Soyuz, Zond/L1, L3, TKS, US Gemini, Apollo Command Module, Chinese Shenzhou and US, Russian and Indian manned spacecraft currently being developed.
  num_concepts_matched: 4
  min_distance:         1.0262821
  avg_distance:         1.0882147550582886
  ```

  **性能:** 返回 10 行。耗时: 1.157 秒。已处理 1000 万行,32.76 GB (864 万行/秒,28.32 GB/秒)。峰值内存使用: **6.05 GiB**。
</details>

### 关键洞见 \\{#key-insight\\}

结果如何？不只是好，而是好得出乎意料。并不容易想到的是，即使把浮点数的整个尾数和一半的指数都去掉，它们仍然保留了有意义的信息。

**QBit 的关键洞见在于：即使忽略那些不重要的位，向量搜索依然有效。**

内存占用从 **6.05 GB 降低到 740 MB**，同时仍然保持了出色的语义搜索质量！

## 结论 \\{#result\\}

QBit 是一种使用位平面存储浮点数的列类型。
它允许你在向量搜索时选择读取多少位，从而在不改变数据的前提下微调召回率和性能。
每种向量搜索方法都有自己的参数，用来在召回率、准确性和性能之间做权衡。
通常，这些参数必须在一开始就选定。
如果选错，会浪费大量时间和资源，后续再调整方向会变得非常痛苦。
使用 QBit，则无需提前做出这些决定。
你可以在查询时直接调整精度与速度之间的权衡，并在实践中探索合适的平衡点。

---

*改编自 Raufs Dunamalijevs 于 2025 年 10 月 28 日发布的[博客文章](https://clickhouse.com/blog/qbit-vector-search)*