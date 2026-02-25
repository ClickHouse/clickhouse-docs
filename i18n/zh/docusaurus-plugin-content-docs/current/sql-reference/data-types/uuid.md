---
description: 'ClickHouse 中 UUID 数据类型文档'
sidebar_label: 'UUID'
sidebar_position: 24
slug: /sql-reference/data-types/uuid
title: 'UUID'
doc_type: 'reference'
---

# UUID \{#uuid\}

通用唯一标识符（UUID）是一种用于标识记录的 16 字节值。有关 UUID 的详细信息，请参阅 [维基百科](https://en.wikipedia.org/wiki/Universally_unique_identifier)。

尽管存在不同的 UUID 变体，例如 UUIDv4 和 UUIDv7（参见[此处](https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis)），ClickHouse 并不会校验插入的 UUID 是否符合某个特定变体。
在 SQL 层面，UUID 在内部被视为由 16 个随机字节组成的序列，并采用 [8-4-4-4-12 的表示形式](https://en.wikipedia.org/wiki/Universally_unique_identifier#Textual_representation)。

UUID 值示例：

```text
61f0c404-5cb3-11e7-907b-a6006ad3dba0
```

默认的 UUID 全为零。例如，在插入一条新记录但未为 UUID 列提供值时，将使用该值：

```text
00000000-0000-0000-0000-000000000000
```

:::warning
因历史原因，UUID 在排序时是依据其后半部分进行排序的。

对于 UUIDv4 值这没有问题，但在主键索引定义中使用 UUIDv7 列时，这可能会降低性能（在排序键或分区键中的使用是可以的）。
更具体地说，UUIDv7 值的前半部分由时间戳组成，后半部分由计数器组成。
因此，在稀疏主键索引中（即每个索引粒度的首个值），UUIDv7 的排序将依据计数器字段进行。
如果假设 UUID 是按照前半部分（时间戳）排序的，那么在查询开始时的主键索引分析步骤预期可以在除一个分区片段外的所有分区片段中裁剪掉所有标记。
然而，由于按后半部分（计数器）排序，预期每个分区片段都至少会返回一个标记，从而导致不必要的磁盘访问。
:::

示例：

```sql
CREATE TABLE tab (uuid UUID) ENGINE = MergeTree PRIMARY KEY (uuid);

INSERT INTO tab SELECT generateUUIDv7() FROM numbers(50);
SELECT * FROM tab;
```

结果：

```text
┌─uuid─────────────────────────────────┐
│ 36a0b67c-b74a-4640-803b-e44bb4547e3c │
│ 3a00aeb8-2605-4eec-8215-08c0ecb51112 │
│ 3fda7c49-282e-421a-85ab-c5684ef1d350 │
│ 16ab55a7-45f6-44a8-873c-7a0b44346b3e │
│ e3776711-6359-4f22-878d-bf290d052c85 │
│                [...]                 │
│ 9eceda2f-6946-40e3-b725-16f2709ca41a │
│ 03644f74-47ba-4020-b865-be5fd4c8c7ff │
│ ce3bc93d-ab19-4c74-b8cc-737cb9212099 │
│ b7ad6c91-23d6-4b5e-b8e4-a52297490b56 │
│ 06892f64-cc2d-45f3-bf86-f5c5af5768a9 │
└──────────────────────────────────────┘
```

作为一种变通方案，可以将 UUID 转换为由其后半部分提取出的时间戳：

```sql
CREATE TABLE tab (uuid UUID) ENGINE = MergeTree PRIMARY KEY (UUIDv7ToDateTime(uuid));
-- Or alternatively:                      [...] PRIMARY KEY (toStartOfHour(UUIDv7ToDateTime(uuid)));

INSERT INTO tab SELECT generateUUIDv7() FROM numbers(50);
SELECT * FROM tab;
```

ORDER BY (UUIDv7ToDateTime(uuid), uuid)


## 生成 UUID \{#generating-uuids\}

ClickHouse 提供了 [generateUUIDv4](../../sql-reference/functions/uuid-functions.md) 函数，用于生成随机的第 4 版 UUID 值。

## 使用示例 \{#usage-example\}

**示例 1**

此示例演示如何创建一个带有 UUID 列的表，并向该表插入一个值。

```sql
CREATE TABLE t_uuid (x UUID, y String) ENGINE=TinyLog

INSERT INTO t_uuid SELECT generateUUIDv4(), 'Example 1'

SELECT * FROM t_uuid
```

结果：

```text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ Example 1 │
└──────────────────────────────────────┴───────────┘
```

**示例 2**

在此示例中，插入记录时未指定 UUID 列的值，因此将插入默认的 UUID 值：

```sql
INSERT INTO t_uuid (y) VALUES ('Example 2')

SELECT * FROM t_uuid
```

```text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ Example 1 │
│ 00000000-0000-0000-0000-000000000000 │ Example 2 │
└──────────────────────────────────────┴───────────┘
```


## 限制 \{#restrictions\}

`UUID` 数据类型只支持 [`String`](../../sql-reference/data-types/string.md) 数据类型也支持的函数（例如 [`min`](/sql-reference/aggregate-functions/reference/min)、[`max`](/sql-reference/aggregate-functions/reference/max) 和 [`count`](/sql-reference/aggregate-functions/reference/count)）。

`UUID` 数据类型不支持算术运算（例如 [`abs`](/sql-reference/functions/arithmetic-functions#abs)）或聚合函数，例如 [`sum`](/sql-reference/aggregate-functions/reference/sum) 和 [`avg`](/sql-reference/aggregate-functions/reference/avg)。