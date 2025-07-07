---
'description': 'rank ウィンドウ関数のドキュメント'
'sidebar_label': 'ランク'
'sidebar_position': 6
'slug': '/sql-reference/window-functions/rank'
'title': 'rank'
---




# rank

パーティション内で現在の行のランクをギャップを伴ってランク付けします。言い換えれば、遭遇した任意の行の値が以前の行の値と等しい場合、その行はその以前の行と同じランクを受けます。次の行のランクは、前の行のランクに前のランクが与えられた回数に等しいギャップを加えたものになります。

[dense_rank](./dense_rank.md) 関数は同じ動作を提供しますが、ランク付けにギャップはありません。

**構文**

```sql
rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS または RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数の構文に関する詳細は、[ウィンドウ関数 - 構文](./index.md/#syntax)を参照してください。

**返される値**

- ギャップを含むそのパーティション内の現在の行に対する数値。[UInt64](../data-types/int-uint.md)。

**例**

以下の例は、ビデオ教材 [ClickHouse におけるランクウィンドウ関数](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA) に提供された例に基づいています。

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
    ('ポートエリザベスバーバリアンズ', 'マイケル・スタンリー', 150000, 'D'),
    ('ニューコレイスタッド大公', 'スコット・ハリソン', 150000, 'D'),
    ('ポートエリザベスバーバリアンズ', 'ロバート・ジョージ', 195000, 'M'),
    ('サウスハンプトンシーガルズ', 'ダグラス・ベンソン', 150000, 'M'),
    ('サウスハンプトンシーガルズ', 'ジェームズ・ヘンダーソン', 140000, 'M');
```

```sql
SELECT player, salary,
       rank() OVER (ORDER BY salary DESC) AS rank
FROM salaries;
```

結果:

```response
   ┌─player──────────┬─salary─┬─rank─┐
1. │ ゲイリー・チェン       │ 195000 │    1 │
2. │ ロバート・ジョージ   │ 195000 │    1 │
3. │ チャールズ・フアレス  │ 190000 │    3 │
4. │ ダグラス・ベンソン  │ 150000 │    4 │
5. │ マイケル・スタンリー │ 150000 │    4 │
6. │ スコット・ハリソン  │ 150000 │    4 │
7. │ ジェームズ・ヘンダーソン │ 140000 │    7 │
   └─────────────────┴────────┴──────┘
```
