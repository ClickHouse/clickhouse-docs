---
slug: /guides/developer/merge-table-function
sidebar_label: 'Merge テーブル関数'
title: 'Merge テーブル関数'
description: '複数のテーブルに同時にクエリを実行します。'
doc_type: 'reference'
keywords: ['merge', 'table function', 'query patterns', 'table engine', 'data access']
---

[Merge テーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/merge) を使用すると、複数のテーブルに対して並列にクエリを実行できます。
一時的な [Merge](https://clickhouse.com/docs/engines/table-engines/special/merge) テーブルを作成し、対象となるテーブル群のカラムの和集合を取り、共通の型を導出することでそのテーブルの構造を決定します。

<iframe width="768" height="432" src="https://www.youtube.com/embed/b4YfRhD9SSI?si=MuoDwDWeikAV5ttk" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

## テーブルのセットアップ \\{#setup-tables\\}

[Jeff Sackmann のテニスデータセット](https://github.com/JeffSackmann/tennis_atp)を使いながら、この関数の使い方を学んでいきます。
1960年代までさかのぼる試合が記録された CSV ファイルを処理しますが、各年代ごとに少し異なるスキーマを作成します。
また、1990年代のスキーマには、いくつか列も追加します。

インポート文は以下のとおりです：

```sql
CREATE OR REPLACE TABLE atp_matches_1960s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1968..1969}.csv')
SETTINGS schema_inference_make_columns_nullable=0, 
         schema_inference_hints='winner_seed Nullable(String), loser_seed Nullable(UInt8)';

CREATE OR REPLACE TABLE atp_matches_1970s ORDER BY tourney_id AS 
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1970..1979}.csv')
SETTINGS schema_inference_make_columns_nullable=0, 
         schema_inference_hints='winner_seed Nullable(UInt8), loser_seed Nullable(UInt8)';

CREATE OR REPLACE TABLE atp_matches_1980s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1980..1989}.csv')
SETTINGS schema_inference_make_columns_nullable=0,
         schema_inference_hints='winner_seed Nullable(UInt16), loser_seed Nullable(UInt16)';

CREATE OR REPLACE TABLE atp_matches_1990s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score,
       toBool(arrayExists(x -> position(x, 'W/O') > 0, score))::Nullable(bool) AS walkover,
       toBool(arrayExists(x -> position(x, 'RET') > 0, score))::Nullable(bool) AS retirement
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1990..1999}.csv')
SETTINGS schema_inference_make_columns_nullable=0,
         schema_inference_hints='winner_seed Nullable(UInt16), loser_seed Nullable(UInt16), surface Enum(\'Hard\', \'Grass\', \'Clay\', \'Carpet\')';
```

## 複数テーブルのスキーマ \\{#schema-multiple-tables\\}

次のクエリを実行すると、各テーブルのカラムとその型を横並びで一覧表示できるため、差分を把握しやすくなります。

```sql
SELECT * EXCEPT(position) FROM (
    SELECT position, name,
       any(if(table = 'atp_matches_1960s', type, null)) AS 1960s,
       any(if(table = 'atp_matches_1970s', type, null)) AS 1970s,
       any(if(table = 'atp_matches_1980s', type, null)) AS 1980s,
       any(if(table = 'atp_matches_1990s', type, null)) AS 1990s
    FROM system.columns
    WHERE database = currentDatabase() AND table LIKE 'atp_matches%'
    GROUP BY ALL
    ORDER BY position ASC
)
SETTINGS output_format_pretty_max_value_width=25;
```

```text
┌─name────────┬─1960s────────────┬─1970s───────────┬─1980s────────────┬─1990s─────────────────────┐
│ tourney_id  │ String           │ String          │ String           │ String                    │
│ surface     │ String           │ String          │ String           │ Enum8('Hard' = 1, 'Grass'⋯│
│ winner_name │ String           │ String          │ String           │ String                    │
│ loser_name  │ String           │ String          │ String           │ String                    │
│ winner_seed │ Nullable(String) │ Nullable(UInt8) │ Nullable(UInt16) │ Nullable(UInt16)          │
│ loser_seed  │ Nullable(UInt8)  │ Nullable(UInt8) │ Nullable(UInt16) │ Nullable(UInt16)          │
│ score       │ String           │ Array(String)   │ Array(String)    │ Array(String)             │
│ walkover    │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ            │ ᴺᵁᴸᴸ             │ Nullable(Bool)            │
│ retirement  │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ            │ ᴺᵁᴸᴸ             │ Nullable(Bool)            │
└─────────────┴──────────────────┴─────────────────┴──────────────────┴───────────────────────────┘
```

違いを確認していきます。

* 1970s では、`winner_seed` の型を `Nullable(String)` から `Nullable(UInt8)` に、`score` の型を `String` から `Array(String)` に変更しています。
* 1980s では、`winner_seed` と `loser_seed` の型を `Nullable(UInt8)` から `Nullable(UInt16)` に変更しています。
* 1990s では、`surface` の型を `String` から `Enum('Hard', 'Grass', 'Clay', 'Carpet')` に変更し、`walkover` および `retirement` 列を追加しています。

## merge を使って複数テーブルをクエリする \\{#querying-multiple-tables\\}

John McEnroe が第1シードの選手に勝利した試合を見つけるクエリを書いてみましょう。

```sql
SELECT loser_name, score
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1;
```

```text
┌─loser_name────┬─score───────────────────────────┐
│ Bjorn Borg    │ ['6-3','6-4']                   │
│ Bjorn Borg    │ ['7-6','6-1','6-7','5-7','6-4'] │
│ Bjorn Borg    │ ['7-6','6-4']                   │
│ Bjorn Borg    │ ['4-6','7-6','7-6','6-4']       │
│ Jimmy Connors │ ['6-1','6-3']                   │
│ Ivan Lendl    │ ['6-2','4-6','6-3','6-7','7-6'] │
│ Ivan Lendl    │ ['6-3','3-6','6-3','7-6']       │
│ Ivan Lendl    │ ['6-1','6-3']                   │
│ Stefan Edberg │ ['6-2','6-3']                   │
│ Stefan Edberg │ ['7-6','6-2']                   │
│ Stefan Edberg │ ['6-2','6-2']                   │
│ Jakob Hlasek  │ ['6-3','7-6']                   │
└───────────────┴─────────────────────────────────┘
```

次に、McEnroe が第 3 シード以下だった試合だけに絞り込みたいとします。
ここからが少し厄介です。というのも、`winner_seed` はテーブルごとに異なる型を使っているためです。

```sql
SELECT loser_name, score, winner_seed
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1
AND multiIf(
  variantType(winner_seed) = 'UInt8', variantElement(winner_seed, 'UInt8') >= 3,
  variantType(winner_seed) = 'UInt16', variantElement(winner_seed, 'UInt16') >= 3,
  variantElement(winner_seed, 'String')::UInt16 >= 3
);
```

各行の `winner_seed` の型を確認するために [`variantType`](/docs/sql-reference/functions/other-functions#variantType) 関数を使用し、その後 [`variantElement`](/docs/sql-reference/functions/other-functions#variantElement) を用いて実際の値を抽出します。
型が `String` の場合は数値にキャストしてから比較を行います。
クエリを実行した結果を以下に示します。

```text
┌─loser_name────┬─score─────────┬─winner_seed─┐
│ Bjorn Borg    │ ['6-3','6-4'] │ 3           │
│ Stefan Edberg │ ['6-2','6-3'] │ 6           │
│ Stefan Edberg │ ['7-6','6-2'] │ 4           │
│ Stefan Edberg │ ['6-2','6-2'] │ 7           │
└───────────────┴───────────────┴─────────────┘
```

## merge を使用している場合、行はどのテーブルに由来するのか？ \\{#which-table-merge\\}

行がどのテーブルに由来しているのかを知りたい場合はどうすればよいでしょうか？
次のクエリに示すように、`_table` 仮想カラムを使うことで確認できます。

```sql
SELECT _table, loser_name, score, winner_seed
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1
AND multiIf(
  variantType(winner_seed) = 'UInt8', variantElement(winner_seed, 'UInt8') >= 3,
  variantType(winner_seed) = 'UInt16', variantElement(winner_seed, 'UInt16') >= 3,
  variantElement(winner_seed, 'String')::UInt16 >= 3
);
```

```text
┌─_table────────────┬─loser_name────┬─score─────────┬─winner_seed─┐
│ atp_matches_1970s │ Bjorn Borg    │ ['6-3','6-4'] │ 3           │
│ atp_matches_1980s │ Stefan Edberg │ ['6-2','6-3'] │ 6           │
│ atp_matches_1980s │ Stefan Edberg │ ['7-6','6-2'] │ 4           │
│ atp_matches_1980s │ Stefan Edberg │ ['6-2','6-2'] │ 7           │
└───────────────────┴───────────────┴───────────────┴─────────────┘
```

この仮想カラムは、`walkover` カラムの値をカウントするクエリの一部として使用することもできます。

```sql
SELECT _table, walkover, count()
FROM merge('atp_matches*')
GROUP BY ALL
ORDER BY _table;
```

```text
┌─_table────────────┬─walkover─┬─count()─┐
│ atp_matches_1960s │ ᴺᵁᴸᴸ     │    7542 │
│ atp_matches_1970s │ ᴺᵁᴸᴸ     │   39165 │
│ atp_matches_1980s │ ᴺᵁᴸᴸ     │   36233 │
│ atp_matches_1990s │ true     │     128 │
│ atp_matches_1990s │ false    │   37022 │
└───────────────────┴──────────┴─────────┘
```

`walkover` 列は `atp_matches_1990s` 以外ではすべて `NULL` になっていることが分かります。
`walkover` 列が `NULL` の場合に、`score` 列に文字列 `W/O` が含まれているかどうかを確認するようクエリを更新する必要があります。

```sql
SELECT _table,
   multiIf(
     walkover IS NOT NULL,
     walkover,
     variantType(score) = 'Array(String)',
     toBool(arrayExists(
        x -> position(x, 'W/O') > 0,
        variantElement(score, 'Array(String)')
     )),
     variantElement(score, 'String') LIKE '%W/O%'
   ),
   count()
FROM merge('atp_matches*')
GROUP BY ALL
ORDER BY _table;
```

`score` の実際の型が `Array(String)` の場合は、配列を走査して `W/O` を探す必要がありますが、型が `String` の場合は、その文字列内で `W/O` を検索するだけで済みます。

```text
┌─_table────────────┬─multiIf(isNo⋯, '%W/O%'))─┬─count()─┐
│ atp_matches_1960s │ true                     │     242 │
│ atp_matches_1960s │ false                    │    7300 │
│ atp_matches_1970s │ true                     │     422 │
│ atp_matches_1970s │ false                    │   38743 │
│ atp_matches_1980s │ true                     │      92 │
│ atp_matches_1980s │ false                    │   36141 │
│ atp_matches_1990s │ true                     │     128 │
│ atp_matches_1990s │ false                    │   37022 │
└───────────────────┴──────────────────────────┴─────────┘
```
