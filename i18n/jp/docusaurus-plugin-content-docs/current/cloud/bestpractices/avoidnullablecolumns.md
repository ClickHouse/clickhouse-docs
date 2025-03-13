---
slug: /cloud/bestpractices/avoid-nullable-columns
sidebar_label: Nullableカラムの回避
title: Nullableカラムの回避
---

[`Nullable`カラム](/sql-reference/data-types/nullable/) (例: `Nullable(String)`) は `UInt8` 型の別のカラムを作成します。この追加のカラムは、ユーザーがnullableカラムを使用するたびに処理される必要があります。これにより、追加のストレージスペースが必要となり、ほぼ常にパフォーマンスに悪影響を及ぼします。

`Nullable`カラムを避けるためには、そのカラムにデフォルト値を設定することを検討してください。例えば、次のようにする代わりに：

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
次のようにします：

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
使用ケースを考慮してください。デフォルト値が不適切な場合もあります。
:::
