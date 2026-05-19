---
description: 'ClickHouse のデータフォーマットを扱うための format ユーティリティの使用ガイド'
slug: /operations/utilities/clickhouse-format
title: 'clickhouse-format'
doc_type: 'reference'
---

入力クエリを整形します。

オプション:

* `--help` または `-h` — ヘルプメッセージを出力します。
* `--query` — 任意の長さや複雑さのクエリを整形します。
* `--hilite` または `--highlight` — ANSI ターミナルのエスケープシーケンスを使用して構文ハイライトを追加します。
* `--oneline` — 1 行で整形します。
* `--max_line_length` — 指定した長さ未満のクエリを 1 行で整形します。
* `--comments` — 出力にコメントを保持します。
* `--quiet` または `-q` — 構文のみをチェックし、成功時は出力しません。
* `--multiquery` または `-n` — 同一ファイル内で複数のクエリを許可します。
* `--obfuscate` — 整形の代わりに難読化を行います。
* `--seed <string>` — 難読化の結果を決定する任意のシード文字列を指定します。
* `--backslash` — 整形されたクエリの各行末にバックスラッシュを追加します。複数行のクエリを Web などからコピーしてコマンドラインで実行したい場合に便利です。
* `--semicolons_inline` — multiquery モードで、クエリの末尾行では改行せず同じ行にセミコロンを書きます。

## 例 \{#examples\}

1. クエリの整形:

```bash title="Query"
$ clickhouse-format --query "select number from numbers(10) where number%2 order by number desc;"
```

```bash title="Response"
SELECT number
FROM numbers(10)
WHERE number % 2
ORDER BY number DESC
```

2. ハイライト表示と1行表示:

```bash title="Query"
$ clickhouse-format --oneline --hilite <<< "SELECT sum(number) FROM numbers(5);"
```

```sql title="Response"
SELECT sum(number) FROM numbers(5)
```

3. 複数クエリ:

```bash title="Query"
$ clickhouse-format -n <<< "SELECT min(number) FROM numbers(5); SELECT max(number) FROM numbers(5);"
```

```sql title="Response"
SELECT min(number)
FROM numbers(5)
;

SELECT max(number)
FROM numbers(5)
;

```

4. 難読化:

```bash title="Query"
$ clickhouse-format --seed Hello --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

```sql title="Response"
SELECT treasury_mammoth_hazelnut BETWEEN nutmeg AND span, CASE WHEN chive >= 116 THEN switching ELSE ANYTHING END;
```

同じクエリと別のシード文字列:

```bash title="Query"
$ clickhouse-format --seed World --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

```sql title="Response"
SELECT horse_tape_summer BETWEEN folklore AND moccasins, CASE WHEN intestine >= 116 THEN nonconformist ELSE FORESTRY END;
```

5. バックスラッシュを追加する:

```bash title="Query"
$ clickhouse-format --backslash <<< "SELECT * FROM (SELECT 1 AS x UNION ALL SELECT 1 UNION DISTINCT SELECT 3);"
```

```sql title="Response"
SELECT * \
FROM  \
( \
    SELECT 1 AS x \
    UNION ALL \
    SELECT 1 \
    UNION DISTINCT \
    SELECT 3 \
)
```