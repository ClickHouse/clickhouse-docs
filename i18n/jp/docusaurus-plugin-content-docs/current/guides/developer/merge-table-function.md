---
'slug': '/guides/developer/merge-table-function'
'sidebar_label': 'Merge table function'
'title': 'Merge table function'
'description': '同時に複数のテーブルにクエリを実行します。'
'doc_type': 'reference'
---

The [merge table function](https://clickhouse.com/docs/sql-reference/table-functions/merge) は、複数のテーブルに対して並行してクエリを実行することを可能にします。これを実現するために、一時的な [Merge](https://clickhouse.com/docs/engines/table-engines/special/merge) テーブルを作成し、その構造をカラムのユニオンを取ることで導出し、共通の型を導出します。

<iframe width="768" height="432" src="https://www.youtube.com/embed/b4YfRhD9SSI?si=MuoDwDWeikAV5ttk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## テーブルの設定 {#setup-tables}

私たちは、[Jeff Sackmann のテニスデータセット](https://github.com/JeffSackmann/tennis_atp)の助けを借りて、この関数の使い方を学びます。1960年代に遡る試合を含むCSVファイルを処理しますが、各10年ごとに少し異なるスキーマを作成します。1990年代には、いくつかの追加カラムも加えます。

インポート文は以下の通りです：

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

## 複数テーブルのスキーマ {#schema-multiple-tables}

各テーブルのカラムとその型を横並びでリストするために、以下のクエリを実行できます。これにより、違いが見やすくなります。

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

違いを見ていきましょう：

* 1970年代は `winner_seed` の型を `Nullable(String)` から `Nullable(UInt8)` に、`score` を `String` から `Array(String)` に変更します。
* 1980年代は `winner_seed` と `loser_seed` の型を `Nullable(UInt8)` から `Nullable(UInt16)` に変更します。
* 1990年代は `surface` の型を `String` から `Enum('Hard', 'Grass', 'Clay', 'Carpet')` に変更し、`walkover` と `retirement` のカラムを追加します。

## マージを使用した複数テーブルのクエリ {#querying-multiple-tables}

ジョン・マッケンローが第1シードの選手に勝った試合を見つけるクエリを書いてみましょう：

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

次に、マッケンローが第3シード以下であった試合をフィルタリングしたいとしましょう。これは少し難しいです。なぜなら、`winner_seed` は異なるテーブルで異なる型を使用しているからです：

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

[`variantType`](/docs/sql-reference/functions/other-functions#varianttype) 関数を使用して各行の `winner_seed` の型をチェックし、その後 [`variantElement`](/docs/sql-reference/functions/other-functions#variantelement) で基礎的な値を抽出します。型が `String` の場合、数値にキャストして比較を行います。クエリを実行した結果は以下の通りです：

```text
┌─loser_name────┬─score─────────┬─winner_seed─┐
│ Bjorn Borg    │ ['6-3','6-4'] │ 3           │
│ Stefan Edberg │ ['6-2','6-3'] │ 6           │
│ Stefan Edberg │ ['7-6','6-2'] │ 4           │
│ Stefan Edberg │ ['6-2','6-2'] │ 7           │
└───────────────┴───────────────┴─────────────┘
```

## マージを使用する場合、行はどのテーブルから来るのか？ {#which-table-merge}

行がどのテーブルから来たのか知りたい場合は、以下のクエリのように `_table` 仮想カラムを使用できます：

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

この仮想カラムを利用して `walkover` カラムの値をカウントするクエリの一部としても使用できます：

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

`walkover` カラムは `atp_matches_1990s` を除いてすべて `NULL` であることがわかります。`walkover` カラムが `NULL` の場合、`score` カラムが `W/O` という文字列を含むかどうかを確認するようにクエリを更新する必要があります：

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

`score` の基礎的な型が `Array(String)` である場合、配列を繰り返し `W/O` を探す必要がありますが、型が `String` の場合は、文字列内で直接 `W/O` を検索できます。

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
