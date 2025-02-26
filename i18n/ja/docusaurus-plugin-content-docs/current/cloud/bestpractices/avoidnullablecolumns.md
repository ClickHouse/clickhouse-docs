---
slug: /cloud/bestpractices/avoid-nullable-columns
sidebar_label: Nullableカラムを避ける
title: Nullableカラムを避ける
---

[`Nullable`カラム](/sql-reference/data-types/nullable/)（例：`Nullable(String)`）は、`UInt8`型の別のカラムを作成します。この追加のカラムは、ユーザーがnullableカラムを使用するたびに処理しなければなりません。これにより、追加のストレージスペースが必要になり、ほぼ常にパフォーマンスに悪影響を及ぼします。

`Nullable`カラムを避けるには、そのカラムにデフォルト値を設定することを検討してください。例えば、次のようにするのではなく：

```sql
CREATE TABLE default.sample
(
    `x` Int8,
    # highlight-next-line
    `y` Nullable(Int8)
)
ENGINE = MergeTree
ORDER BY x
```
次のように使用します：

```sql
CREATE TABLE default.sample2
(
    `x` Int8,
    # highlight-next-line
    `y` Int8 DEFAULT 0
)
ENGINE = MergeTree
ORDER BY x
```

:::note
使用ケースを考慮して、デフォルト値が適切でない場合もあります。
:::
