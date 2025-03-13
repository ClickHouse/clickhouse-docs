---
slug: /sql-reference/window-functions/dense_rank
sidebar_label: dense_rank
sidebar_position: 7
---


# dense_rank

現在の行をそのパーティション内でギャップなくランク付けします。言い換えれば、遇った新しい行の値が以前の行のいずれかの値と等しい場合、それはギャップのない次の連続ランクを受け取ります。

[rank](./rank.md) 関数は同様の動作を提供しますが、ランク付けにギャップがあります。

**構文**

エイリアス: `denseRank`（大文字と小文字を区別）

```sql
dense_rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数構文の詳細については、[ウィンドウ関数 - 構文](./index.md/#syntax)を参照してください。

**返される値**

- ギャップなくパーティション内の現在の行の数。 [UInt64](../data-types/int-uint.md)。

**例**

以下の例は、動画教材[ClickHouseにおけるランク付けウィンドウ関数](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA)に提供された例に基づいています。

クエリ:

```sql
CREATE TABLE salaries
(
    `team` String,
    `player` String,
    `salary` UInt32,
    `position` String
)
Engine = Memory;

INSERT INTO salaries FORMAT Values
    ('ポートエリザベスバーバリアンズ', 'ゲイリー・チェン', 195000, 'F'),
    ('ニューコレイスタッド大公', 'チャールズ・フアレス', 190000, 'F'),
    ('ポートエリザベスバーバリアンズ', 'マイケル・スタンレー', 150000, 'D'),
    ('ニューコレイスタッド大公', 'スコット・ハリソン', 150000, 'D'),
    ('ポートエリザベスバーバリアンズ', 'ロバート・ジョージ', 195000, 'M'),
    ('サウスハンプトンシーガルズ', 'ダグラス・ベンソン', 150000, 'M'),
    ('サウスハンプトンシーガルズ', 'ジェームズ・ヘンダーソン', 140000, 'M');
```

```sql
SELECT player, salary,
       dense_rank() OVER (ORDER BY salary DESC) AS dense_rank
FROM salaries;
```

結果:

```response
   ┌─player──────────┬─salary─┬─dense_rank─┐
1. │ ゲイリー・チェン │ 195000 │          1 │
2. │ ロバート・ジョージ │ 195000 │          1 │
3. │ チャールズ・フアレス │ 190000 │          2 │
4. │ マイケル・スタンレー │ 150000 │          3 │
5. │ ダグラス・ベンソン │ 150000 │          3 │
6. │ スコット・ハリソン │ 150000 │          3 │
7. │ ジェームズ・ヘンダーソン │ 140000 │          4 │
   └─────────────────┴────────┴────────────┘
```
