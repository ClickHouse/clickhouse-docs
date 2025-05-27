---
'slug': '/guides/developer/deduplication'
'sidebar_label': '去重策略'
'sidebar_position': 3
'description': '当您需要执行频繁的 upserts、更新和删除时，请使用去重.'
'title': '去重策略'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';


# 去重策略

**去重** 是指 ***删除数据集中重复行的过程***。在OLTP数据库中，这很容易实现，因为每一行都有唯一的主键，但代价是插入速度较慢。每一行插入前必须先进行查找，如果找到，就需要替换。

ClickHouse在数据插入方面是为速度而构建的。存储文件是不可变的，ClickHouse在插入一行之前不会检查现有的主键，因此去重需要更多的工作。这也意味着去重不是即时的，它是 **最终的**，这有几个副作用：

- 在任何时刻，您的表仍然可能有重复项（具有相同排序键的行）
- 真实的重复行删除发生在合并分区的过程中
- 您的查询需要允许存在重复项的可能性

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="去重标志" size="sm"/>|ClickHouse提供关于去重以及许多其他主题的免费培训。[删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)是一个很好的起点。|

</div>

## 去重选项 {#options-for-deduplication}

ClickHouse使用以下表引擎实现去重：

1. `ReplacingMergeTree` 表引擎：使用此表引擎时，具有相同排序键的重复行会在合并期间被删除。`ReplacingMergeTree`是模拟upsert行为的一个好选择（当您希望查询返回最后插入的行时）。

2. 消除行：`CollapsingMergeTree`和`VersionedCollapsingMergeTree`表引擎使用一种逻辑，其中现有行被“取消”，并插入新行。它们的实现比`ReplacingMergeTree`更复杂，但您的查询和聚合可以更简单地编写，而不必担心数据是否已经合并。这两个表引擎在您需要频繁更新数据时非常有用。

我们在下面将详细介绍这两种技术。有关更多详细信息，请查看我们的免费的按需[删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)。

## 使用 ReplacingMergeTree 实现 Upserts {#using-replacingmergetree-for-upserts}

让我们看一个简单的例子，其中一张表包含 Hacker News 的评论，具有表示评论被查看次数的 views 列。假设我们在文章发布时插入一行，并在每天上插入一行，如果视图次数增加，则更新该行：

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

让我们插入两行：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

要更新`views`列，可以插入一行具有相同主键的新行（注意`views`列的新值）：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

现在表中有4行：

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

上面输出中的单独框演示了幕后发生的两个部分——数据尚未合并，因此重复行尚未被删除。让我们在`SELECT`查询中使用`FINAL`关键字，这将导致查询结果的逻辑合并：

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

结果只有2行，且最后插入的行是返回的行。

:::note
如果您的数据量很小，使用`FINAL`是可以的。如果您处理大量数据，使用`FINAL`可能不是最佳选择。让我们讨论一下更好的选择，以查找列的最新值...
:::

### 避免使用 FINAL {#avoiding-final}

让我们再次更新两个唯一行的`views`列：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

现在表中有6行，因为实际合并尚未发生（仅在使用`FINAL`时进行了查询时间合并）。

```sql
SELECT *
FROM hackernews_rmt
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │     0 │
│  1 │ ricardo │ This is post #1 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   250 │
│  1 │ ricardo │ This is post #1 │   150 │
└────┴─────────┴─────────────────┴───────┘
```

与其使用`FINAL`，不如使用一些业务逻辑——我们知道`views`列始终在增加，因此我们可以使用`max`函数选择具有最大值的行，以所需列进行分组：

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
│  2 │ ch_fan  │ This is post #2 │        250 │
│  1 │ ricardo │ This is post #1 │        150 │
└────┴─────────┴─────────────────┴────────────┘
```

如上所示的聚合查询实际上在查询性能上可能比使用`FINAL`关键字更优。

我们的[删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)进一步扩展了这个例子，包括如何使用`version`列与`ReplacingMergeTree`。

## 使用 CollapsingMergeTree 频繁更新列 {#using-collapsingmergetree-for-updating-columns-frequently}

更新列涉及删除现有行并用新值替换它。正如您已经看到的，这种类型的修改在 ClickHouse 中是 _最终_ 发生的——即在合并时。如果您需要更新许多行，避免使用`ALTER TABLE..UPDATE`而只是插入新数据与现有数据并行，实际上可能更高效。我们可以添加一列来表明数据是过期的还是新的……而实际上，有一个表引擎已经很好地实现了这一行为，特别是考虑到它会自动为您删除过期数据。让我们看看它是如何工作的。

假设我们使用外部系统跟踪Hacker News评论的查看次数，每隔几个小时将数据推送到ClickHouse。我们希望删除旧行，新行表示每个Hacker News评论的新状态。我们可以使用`CollapsingMergeTree`实现这一行为。

让我们定义一个表来存储查看次数：

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

注意，`hackernews_views`表中有一个Int8类型的列，命名为sign，这被称为 **状态** 列。状态列的名称是任意的，但`Int8`数据类型是必需的，请注意，此列名称是在`CollapsingMergeTree`表的构造函数中传递的。

`CollapsingMergeTree`表的状态列是什么？它表示行的 _状态_，并且状态列只能为1或-1。它的工作原理如下：

- 如果两行具有相同的主键（如果排序顺序与主键不同），但具有不同的状态列值，则被插入的最后一行用+1表示，并成为状态行，其他行互相取消。
- 在合并期间取消的行会被删除。
- 没有匹配对的行将保留。

让我们向`hackernews_views`表中添加一行。由于它是此主键的唯一行，因此我们将其状态设置为1：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

现在假设我们想更改`views`列。您插入两行：一行取消现有行，另一行包含该行的新状态：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

此时表中具有主键`(123, 'ricardo')`的行有3行：

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

注意添加`FINAL`将返回当前状态行：

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

但显然，对于大型表，不推荐使用`FINAL`。

:::note
在我们的示例中，传入`views`列的值并不是必需的，也不必与旧行的`views`当前值匹配。实际上，您只需使用主键和-1即可取消一行：

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## 来自多个线程的实时更新 {#real-time-updates-from-multiple-threads}

使用`CollapsingMergeTree`表，行使用状态列彼此取消，并且行的状态由最后插入的行确定。但是，如果您在不同的线程中插入行，而行的插入顺序可能不一致，这可能会造成问题。使用“最后”行在这种情况下不起作用。

这时，`VersionedCollapsingMergeTree` 就派上用场了——它像`CollapsingMergeTree`一样合并行，但不再保留最后插入的行，而是保留您指定的具有最高版本列值的行。

让我们看个例子。假设我们想跟踪 Hacker News 评论的查看次数，并且数据经常更新。我们希望报表使用最新值，而无需强制或等待合并。我们从一个与`CollapsedMergeTree`类似的表开始，但我们添加了一列来存储行状态的版本：

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

注意表使用`VersionsedCollapsingMergeTree`作为引擎，并传递了 **状态列** 和 **版本列**。这里是表的工作原理：

- 删除具有相同主键和版本且状态不同的每对行。
- 行插入的顺序无关紧要。
- 请注意，如果版本列不是主键的一部分，ClickHouse会隐式将其作为最后一个字段添加到主键中。

编写查询时，使用相同类型的逻辑——按主键分组，并使用巧妙的逻辑避免那些已经被取消但尚未删除的行。让我们向`hackernews_views_vcmt`表中添加一些行：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

现在我们更新其中两行并删除其中一行。要取消一行，请确保包含之前的版本号（因为它是主键的一部分）：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

我们将运行与之前相同的查询，该查询巧妙地根据状态列添加和减去值：

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

结果是两行：

```response
┌─id─┬─author──┬─sum(multiply(views, sign))─┐
│  1 │ ricardo │                         50 │
│  3 │ kenny   │                       1000 │
└────┴─────────┴────────────────────────────┘
```

让我们强制进行表合并：

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

结果中应该只有两行：

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

当您想在从多个客户端和/或线程插入行时实现去重时，`VersionedCollapsingMergeTree`表非常方便。

## 为什么我的行没有去重？ {#why-arent-my-rows-being-deduplicated}

插入的行可能未去重的一个原因是您在`INSERT`语句中使用了非幂等的函数或表达式。例如，如果您插入行时列是`createdAt DateTime64(3) DEFAULT now()`，那么您的行一定是唯一的，因为每一行将具有`createdAt`列的唯一默认值。MergeTree / ReplicatedMergeTree表引擎将不知道去重，因为每条插入的行都会生成唯一的校验和。

在这种情况下，您可以为每批行指定自己的`insert_deduplication_token`，以确保对同一批的多次插入不会导致相同的行被重新插入。有关如何使用此设置的详细信息，请参见 [有关 `insert_deduplication_token` 的文档](/operations/settings/settings#insert_deduplication_token)。
