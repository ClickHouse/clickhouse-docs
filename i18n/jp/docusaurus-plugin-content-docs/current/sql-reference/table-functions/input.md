---
'description': 'テーブル関数で、指定された構造のデータをサーバーに送信して、別の構造のテーブルに効果的に変換して挿入することを可能にします。'
'sidebar_label': '入力'
'sidebar_position': 95
'slug': '/sql-reference/table-functions/input'
'title': '入力'
'doc_type': 'reference'
---


# input テーブル関数

`input(structure)` - 指定された構造のデータを別の構造をもつテーブルへ効果的に変換して挿入することを許可するテーブル関数です。

`structure` - サーバーに送信されるデータの構造で、次の形式で指定されます `'column1_name column1_type, column2_name column2_type, ...'`。
例えば、`'id UInt32, name String'`のようになります。

この関数は `INSERT SELECT` クエリ内でのみ使用でき、1回のみ使用可能ですが、その他は通常のテーブル関数のように振る舞います（例えば、サブクエリ内での使用など）。

データは通常の `INSERT` クエリと同様に任意の方法で送信でき、クエリの終わりに指定されなければならない任意の [format](/sql-reference/formats) で渡すことができます（通常の `INSERT SELECT` とは異なり）。

この関数の主な特徴は、サーバーがクライアントからデータを受信すると同時に、それを `SELECT` 句の式リストに従って変換し、ターゲットテーブルに挿入することです。一時テーブルにすべての転送データが作成されることはありません。

## 例 {#examples}

- `test` テーブルが次の構造 `(a String, b String)` を持ち、`data.csv` のデータが異なる構造 `(col1 String, col2 Date, col3 Int32)` であると仮定します。`data.csv` から `test` テーブルに同時変換でデータを挿入するためのクエリは次のようになります：

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- `data.csv` がテーブル `test` と同じ構造 `test_structure` のデータを含む場合、これらの2つのクエリは等価です：

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
