---
description: '指定された構造でサーバーに送信されたデータを、別の構造のテーブルへ効率的に変換して挿入できるテーブル関数です。'
sidebar_label: 'input'
sidebar_position: 95
slug: /sql-reference/table-functions/input
title: 'input'
doc_type: 'reference'
---

# input テーブル関数 \{#input-table-function\}

`input(structure)` - クライアントからサーバーに送信される、指定された構造を持つデータを、別の構造を持つテーブルへ効率的に変換して挿入するためのテーブル関数です。

`structure` - サーバーに送信されるデータの構造を、次の形式で指定します: `'column1_name column1_type, column2_name column2_type, ...'`。
例えば、`'id UInt32, name String'` のように指定します。

この関数は `INSERT SELECT` クエリの中でのみ、かつ 1 回だけ使用できますが、それ以外は通常のテーブル関数と同様に動作します
（例えば、サブクエリ内で使用することもできます）。

データは通常の `INSERT` クエリと同様に任意の方法で送信でき、任意の利用可能な [format](/sql-reference/formats)
で渡すことができます。そのフォーマットはクエリの末尾で指定する必要があります（通常の `INSERT SELECT` とは異なります）。

この関数の主な特徴は、サーバーがクライアントからデータを受信する際に、`SELECT` 句中の式リストに従って同時にデータを変換し、
その結果をターゲットテーブルに直接挿入する点です。転送されたすべてのデータを保持する一時テーブルは作成されません。

## 例 \{#examples\}

* `test` テーブルが `(a String, b String)` という構造を持ち、
  `data.csv` 内のデータが `(col1 String, col2 Date, col3 Int32)` という別の構造であるとします。`data.csv` から `test` テーブルへデータを挿入しつつ、同時に型変換も行うクエリは次のようになります。

{/* */ }

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

* `data.csv` がテーブル `test` と同じ構造 `test_structure` を持つデータを含んでいる場合、次の 2 つのクエリは等価です。

{/* */ }

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
