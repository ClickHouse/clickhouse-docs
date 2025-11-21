---
slug: /guides/developer/deduplication
sidebar_label: '去重策略'
sidebar_position: 3
description: '当你需要频繁执行 upsert、更新和删除操作时，可以使用去重。'
title: '去重策略'
keywords: ['去重策略', '数据去重', 'upsert', 'update 和 delete', '开发者指南']
doc_type: 'guide'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';


# 去重策略

**去重（Deduplication）**是指***移除数据集中重复行***的过程。在 OLTP 数据库中，这件事很容易做到，因为每一行都有唯一的主键——但代价是写入会变慢。每一行在插入前都需要先查找是否已存在，如已存在则需要替换原有行。

ClickHouse 在数据写入方面是为速度而设计的。其存储文件是不可变的，并且在插入行之前 ClickHouse 不会检查是否已经存在相同的主键——因此去重需要多做一些工作。这也意味着去重不是即时完成的，而是**最终进行的（eventual）**，这会带来一些后果：

- 在任何时间点，你的表中仍然可能存在重复数据行（具有相同排序键的行）
- 实际删除重复行的操作发生在数据分片（parts）合并期间
- 你的查询需要考虑可能存在重复行的情况

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="Deduplication Logo" size="sm"/>|ClickHouse 提供关于去重以及许多其他主题的免费培训课程。[“Deleting and Updating Data（删除和更新数据）”培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)是一个很好的起点。|

</div>



## 去重选项 {#options-for-deduplication}

ClickHouse 通过以下表引擎实现去重功能:

1. `ReplacingMergeTree` 表引擎:使用该表引擎时,具有相同排序键的重复行会在合并过程中被删除。`ReplacingMergeTree` 是模拟 upsert 行为的理想选择(即希望查询返回最后插入的行)。

2. 行折叠:`CollapsingMergeTree` 和 `VersionedCollapsingMergeTree` 表引擎采用一种逻辑,即将现有行"取消"并插入新行。它们的实现比 `ReplacingMergeTree` 更复杂,但您的查询和聚合编写起来会更简单,无需担心数据是否已完成合并。当您需要频繁更新数据时,这两个表引擎非常有用。

下文将详细介绍这两种技术。如需了解更多详情,请查看我们的免费点播课程[删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)。


## 使用 ReplacingMergeTree 实现 Upsert 操作 {#using-replacingmergetree-for-upserts}

让我们看一个简单的示例,表中包含 Hacker News 评论数据,其中 views 列表示评论的查看次数。假设我们在文章发布时插入一条新记录,并且当查看次数增加时,每天通过 upsert 操作更新总查看次数:

```sql
CREATE TABLE hackernews_rmt (
    id UInt32,
    author String,
    comment String,
    views UInt64
)
ENGINE = ReplacingMergeTree
PRIMARY KEY (author, id)
```

让我们插入两条记录:

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

要更新 `views` 列,插入一条具有相同主键的新记录(注意 `views` 列的新值):

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

此时表中有 4 条记录:

```sql
SELECT *
FROM hackernews_rmt
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │     0 │
│  1 │ ricardo │ This is post #1 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
```

输出中的两个独立框展示了底层的两个数据部分 - 这些数据尚未合并,因此重复的行还未被删除。让我们在 `SELECT` 查询中使用 `FINAL` 关键字,它会对查询结果进行逻辑合并:

```sql
SELECT *
FROM hackernews_rmt
FINAL
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
```

结果只有 2 条记录,返回的是最后插入的那条记录。

:::note
如果数据量较小,使用 `FINAL` 是可行的。但如果处理大量数据,
使用 `FINAL` 可能不是最佳选择。让我们讨论一个更好的方法来
获取列的最新值。
:::

### 避免使用 FINAL {#avoiding-final}

让我们再次更新这两条唯一记录的 `views` 列:

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

此时表中有 6 条记录,因为实际的合并尚未发生(只有在使用 `FINAL` 时才会进行查询时合并)。

```sql
SELECT *
FROM hackernews_rmt
```


```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ 这是第 2 篇帖子 │   200 │
│  1 │ ricardo │ 这是第 1 篇帖子 │   100 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ 这是第 2 篇帖子 │     0 │
│  1 │ ricardo │ 这是第 1 篇帖子 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ 这是第 2 篇帖子 │   250 │
│  1 │ ricardo │ 这是第 1 篇帖子 │   150 │
└────┴─────────┴─────────────────┴───────┘
```

与其使用 `FINAL`，不如利用一些业务逻辑——我们知道 `views` 列总是递增，因此在按所需列分组后，可以使用 `max` 函数选择值最大的那行：

```sql
SELECT
    id,
    author,
    comment,
    max(views)
FROM hackernews_rmt
GROUP BY (id, author, comment)
```

```response
┌─id─┬─author──┬─comment─────────┬─max(views)─┐
│  2 │ ch_fan  │ 这是第 2 篇帖子 │        250 │
│  1 │ ricardo │ 这是第 1 篇帖子 │        150 │
└────┴─────────┴─────────────────┴────────────┘
```

如上方查询所示的这种分组方式，在查询性能方面实际上可能比使用 `FINAL` 关键字更高效。

我们的 [Deleting and Updating Data 培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse\&utm_medium=docs)对该示例进行了更深入的讲解，包括如何在 `ReplacingMergeTree` 中使用 `version` 列。


## 使用 CollapsingMergeTree 频繁更新列 {#using-collapsingmergetree-for-updating-columns-frequently}

更新列需要删除现有行并用新值替换。正如您已经了解的,这种类型的变更在 ClickHouse 中是_最终一致_的 - 在合并期间发生。如果需要更新大量行,实际上避免使用 `ALTER TABLE..UPDATE`,而是直接在现有数据旁边插入新数据可能会更高效。我们可以添加一个列来标识数据是过时的还是最新的...实际上已经有一个表引擎很好地实现了这种行为,特别是它会自动为您删除过时的数据。让我们看看它是如何工作的。

假设我们使用外部系统跟踪 Hacker News 评论的浏览次数,并且每隔几个小时将数据推送到 ClickHouse。我们希望删除旧行,并让新行表示每个 Hacker News 评论的最新状态。我们可以使用 `CollapsingMergeTree` 来实现这种行为。

让我们定义一个表来存储浏览次数:

```sql
CREATE TABLE hackernews_views (
    id UInt32,
    author String,
    views UInt64,
    sign Int8
)
ENGINE = CollapsingMergeTree(sign)
PRIMARY KEY (id, author)
```

注意 `hackernews_views` 表有一个名为 sign 的 `Int8` 列,它被称为**符号**列。符号列的名称是任意的,但 `Int8` 数据类型是必需的,并且注意列名被传递给了 `CollapsingMergeTree` 表的构造函数。

`CollapsingMergeTree` 表的符号列是什么?它表示行的_状态_,符号列只能是 1 或 -1。它的工作原理如下:

- 如果两行具有相同的主键(或排序键,如果与主键不同),但符号列的值不同,则最后插入的符号为 +1 的行成为状态行,其他行相互抵消
- 相互抵消的行在合并期间被删除
- 没有匹配对的行被保留

让我们向 `hackernews_views` 表添加一行。由于它是此主键的唯一行,我们将其状态设置为 1:

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

现在假设我们想要更改 views 列。您需要插入两行:一行抵消现有行,另一行包含该行的新状态:

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

该表现在有 3 行具有主键 `(123, 'ricardo')`:

```sql
SELECT *
FROM hackernews_views
```

```response
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │     0 │   -1 │
│ 123 │ ricardo │   150 │    1 │
└─────┴─────────┴───────┴──────┘
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │     0 │    1 │
└─────┴─────────┴───────┴──────┘
```

注意添加 `FINAL` 会返回当前状态行:

```sql
SELECT *
FROM hackernews_views
FINAL
```

```response
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │   150 │    1 │
└─────┴─────────┴───────┴──────┘
```

但当然,对于大型表不建议使用 `FINAL`。

:::note
在我们的示例中,为 `views` 列传入的值实际上并不需要,也不必与旧行的 `views` 当前值匹配。实际上,您可以仅使用主键和 -1 来抵消一行:

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```

:::


## 来自多个线程的实时更新 {#real-time-updates-from-multiple-threads}

在 `CollapsingMergeTree` 表中,行通过符号列相互抵消,行的状态由最后插入的行决定。但如果从不同线程插入行,行可能会乱序插入,这就会产生问题。在这种情况下,使用"最后"一行的方式不起作用。

这就是 `VersionedCollapsingMergeTree` 派上用场的地方——它像 `CollapsingMergeTree` 一样折叠行,但不是保留最后插入的行,而是保留您指定的版本列中值最高的行。

让我们看一个例子。假设我们想要跟踪 Hacker News 评论的浏览次数,并且数据更新频繁。我们希望报表使用最新值,而无需强制或等待合并。我们从一个类似于 `CollapsingMergeTree` 的表开始,但添加了一列来存储行状态的版本:

```sql
CREATE TABLE hackernews_views_vcmt (
    id UInt32,
    author String,
    views UInt64,
    sign Int8,
    version UInt32
)
ENGINE = VersionedCollapsingMergeTree(sign, version)
PRIMARY KEY (id, author)
```

注意该表使用 `VersionedCollapsingMergeTree` 作为引擎,并传入**符号列**和**版本列**。该表的工作原理如下:

- 它删除具有相同主键和版本但符号不同的每对行
- 行的插入顺序无关紧要
- 请注意,如果版本列不是主键的一部分,ClickHouse 会隐式地将其作为最后一个字段添加到主键中

编写查询时使用相同类型的逻辑——按主键分组并使用巧妙的逻辑来避免已被抵消但尚未删除的行。让我们向 `hackernews_views_vcmt` 表添加一些行:

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

现在我们更新其中两行并删除其中一行。要抵消一行,请确保包含先前的版本号(因为它是主键的一部分):

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

我们将运行与之前相同的查询,该查询根据符号列巧妙地加减值:

```sql
SELECT
    id,
    author,
    sum(views * sign)
FROM hackernews_views_vcmt
GROUP BY (id, author)
HAVING sum(sign) > 0
ORDER BY id ASC
```

结果是两行:

```response
┌─id─┬─author──┬─sum(multiply(views, sign))─┐
│  1 │ ricardo │                         50 │
│  3 │ kenny   │                       1000 │
└────┴─────────┴────────────────────────────┘
```

让我们强制执行表合并:

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

结果中应该只有两行:

```sql
SELECT *
FROM hackernews_views_vcmt
```

```response
┌─id─┬─author──┬─views─┬─sign─┬─version─┐
│  1 │ ricardo │    50 │    1 │       2 │
│  3 │ kenny   │  1000 │    1 │       2 │
└────┴─────────┴───────┴──────┴─────────┘
```

当您想要在从多个客户端和/或线程插入行时实现去重时,`VersionedCollapsingMergeTree` 表非常实用。


## 为什么我的数据行没有被去重? {#why-arent-my-rows-being-deduplicated}

插入的数据行可能无法去重的一个原因是在 `INSERT` 语句中使用了非幂等函数或表达式。例如,如果插入的数据行包含 `createdAt DateTime64(3) DEFAULT now()` 列,那么这些行必然是唯一的,因为每一行的 `createdAt` 列都会有一个唯一的默认值。由于每个插入的行都会生成唯一的校验和,MergeTree / ReplicatedMergeTree 表引擎将无法对这些行进行去重。

在这种情况下,您可以为每批数据行指定自己的 `insert_deduplication_token`,以确保同一批次的多次插入不会导致相同的行被重复插入。有关如何使用此设置的更多详细信息,请参阅 [`insert_deduplication_token` 文档](/operations/settings/settings#insert_deduplication_token)。
