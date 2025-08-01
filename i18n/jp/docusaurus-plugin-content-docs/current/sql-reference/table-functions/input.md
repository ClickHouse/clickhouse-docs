---
description: 'サーバーに送信されたデータを指定された構造で効果的に変換および挿入し、別の構造のテーブルに変換するテーブル関数。'
sidebar_label: '入力'
sidebar_position: 95
slug: '/sql-reference/table-functions/input'
title: 'input'
---




# input テーブル関数

`input(structure)` - 指定された構造でサーバに送信されたデータを、別の構造を持つテーブルに効果的に変換して挿入するテーブル関数です。

`structure` - サーバに送信されるデータの構造を次の形式で指定します： `'column1_name column1_type, column2_name column2_type, ...'`。例えば、`'id UInt32, name String'` のようになります。

この関数は `INSERT SELECT` クエリ内でのみ使用でき、1回のみ使用可能ですが、その他は通常のテーブル関数と同様に動作します（例えば、サブクエリ内で使用することができます）。

データは通常の `INSERT` クエリと同様の方法で送信でき、クエリの末尾に指定する必要がある任意の利用可能な [format](/sql-reference/formats) で渡すことができます（通常の `INSERT SELECT` とは異なります）。

この関数の主な特徴は、サーバがクライアントからデータを受信すると、同時に `SELECT` 句の式リストに従ってデータを変換し、ターゲットテーブルに挿入する点です。すべての転送データを含む一時テーブルは作成されません。

## 例 {#examples}

- `test` テーブルの構造が `(a String, b String)` であり、`data.csv` 内のデータが異なる構造 `(col1 String, col2 Date, col3 Int32)` を持っているとします。`data.csv` から `test` テーブルに同時に変換してデータを挿入するためのクエリは次のようになります：

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- `data.csv` がテーブル `test` と同じ構造 `test_structure` のデータを含んでいる場合、これら2つのクエリは等しくなります：

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"

