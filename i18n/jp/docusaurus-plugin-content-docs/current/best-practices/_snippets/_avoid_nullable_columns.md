[`Nullable` カラム](/sql-reference/data-types/nullable/)（例: `Nullable(String)`）は、`UInt8` 型の別のカラムを作成します。この追加カラムは、ユーザーが Nullable カラムを扱うたびに毎回処理する必要があります。その結果、追加のストレージ容量を消費し、ほとんどの場合パフォーマンスに悪影響を及ぼします。

`Nullable` カラムを避けるには、そのカラムにデフォルト値を設定することを検討してください。たとえば、次のようにする代わりに:

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

使用

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

ユースケースを踏まえて検討してください。デフォルト値が適切でない場合があります。
