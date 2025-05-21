
[`Nullable` カラム](/sql-reference/data-types/nullable/) (例: `Nullable(String)`) は `UInt8` 型の別のカラムを作成します。この追加のカラムは、ユーザーが Nullable カラムで作業するたびに処理される必要があります。これにより、追加のストレージスペースが使用され、ほとんどの場合、パフォーマンスに悪影響を及ぼします。

`Nullable` カラムを避けるために、そのカラムにデフォルト値を設定することを検討してください。たとえば、以下のようにする代わりに：

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
次のように使用します：

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

使用例に応じて、デフォルト値は不適切な場合があります。
```
