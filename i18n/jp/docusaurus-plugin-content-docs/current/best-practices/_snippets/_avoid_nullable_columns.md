

[`Nullable` カラム](/sql-reference/data-types/nullable/) (例: `Nullable(String)`) は、`UInt8` 型の別のカラムを作成します。この追加のカラムは、ユーザーが Nullable カラムを操作するたびに処理される必要があります。これにより、追加のストレージスペースが使用され、ほぼ常にパフォーマンスに悪影響を与えます。

`Nullable` カラムを避けるために、そのカラムにデフォルト値を設定することを検討してください。例えば、以下のようにするのではなく:

```sql
CREATE TABLE default.sample
(
    `x` Int8,
    -- highlight-next-line
    `y` Nullable(Int8)
)
ENGINE = MergeTree
ORDER BY x
```
次のように使用します:

```sql
CREATE TABLE default.sample2
(
    `x` Int8,
    -- highlight-next-line
    `y` Int8 DEFAULT 0
)
ENGINE = MergeTree
ORDER BY x
```

使用ケースによっては、デフォルト値が不適切である場合があります。
