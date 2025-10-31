---
'description': 'ClickHouseのStringデータ型に関するDocumentation'
'sidebar_label': '文字列'
'sidebar_position': 8
'slug': '/sql-reference/data-types/string'
'title': '文字列'
'doc_type': 'reference'
---


# String

任意の長さの文字列。長さに制限はありません。値は、NULLバイトを含む任意のバイトのセットを含むことができます。
String型は、他のDBMSからのVARCHAR、BLOB、CLOBなどの型に置き換わります。

テーブルを作成する際、文字列フィールドの数値パラメータを設定することができます（例: `VARCHAR(255)`）、しかしClickHouseはそれを無視します。

エイリアス:

- `String` — `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT`, `TEXT`, `LONGBLOB`, `MEDIUMBLOB`, `TINYBLOB`, `BLOB`, `VARCHAR`, `CHAR`, `CHAR LARGE OBJECT`, `CHAR VARYING`, `CHARACTER LARGE OBJECT`, `CHARACTER VARYING`, `NCHAR LARGE OBJECT`, `NCHAR VARYING`, `NATIONAL CHARACTER LARGE OBJECT`, `NATIONAL CHARACTER VARYING`, `NATIONAL CHAR VARYING`, `NATIONAL CHARACTER`, `NATIONAL CHAR`, `BINARY LARGE OBJECT`, `BINARY VARYING`,

## Encodings {#encodings}

ClickHouseはエンコーディングの概念を持っていません。文字列は、任意のバイトのセットを含むことができ、ありのままに保存および出力されます。
テキストを保存する必要がある場合は、UTF-8エンコーディングを使用することをお勧めします。少なくとも、ターミナルがUTF-8を使用している場合（推奨）、変換を行うことなく値を読み書きできます。
同様に、文字列に対して作業するための特定の関数には、文字列がUTF-8エンコードされたテキストを表すバイトのセットを含むという前提で動作する別のバリエーションがあります。
例えば、[length](../functions/string-functions.md#length)関数は文字列のバイト数を計算し、[lengthUTF8](../functions/string-functions.md#lengthutf8)関数は値がUTF-8エンコードされていると仮定して、Unicodeコードポイントにおける文字列の長さを計算します。
