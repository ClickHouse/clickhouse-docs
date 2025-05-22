---
'description': 'ClickHouse における String データ型のドキュメント'
'sidebar_label': '文字列'
'sidebar_position': 8
'slug': '/sql-reference/data-types/string'
'title': 'String'
---




# String

任意の長さの文字列です。長さに制限はありません。値は、nullバイトを含む任意のバイトセットを含むことができます。
String型は、他のDBMSのVARCHAR、BLOB、CLOBなどの型を置き換えます。

テーブル作成時に、文字列フィールドの数値パラメータを設定できます（例: `VARCHAR(255)`）、しかしClickHouseはそれを無視します。

エイリアス：

- `String` — `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT`, `TEXT`, `LONGBLOB`, `MEDIUMBLOB`, `TINYBLOB`, `BLOB`, `VARCHAR`, `CHAR`, `CHAR LARGE OBJECT`, `CHAR VARYING`, `CHARACTER LARGE OBJECT`, `CHARACTER VARYING`, `NCHAR LARGE OBJECT`, `NCHAR VARYING`, `NATIONAL CHARACTER LARGE OBJECT`, `NATIONAL CHARACTER VARYING`, `NATIONAL CHAR VARYING`, `NATIONAL CHARACTER`, `NATIONAL CHAR`, `BINARY LARGE OBJECT`, `BINARY VARYING`,

## Encodings {#encodings}

ClickHouseにはエンコーディングの概念はありません。文字列は、任意のバイトセットを含むことができ、ありのままに保存および出力されます。
テキストを保存する必要がある場合は、UTF-8エンコーディングの使用を推奨します。少なくとも、ターミナルがUTF-8を使用している場合（推奨）、変換を行わずに値を読み書きできます。
同様に、文字列操作用の特定の関数には、文字列がUTF-8エンコードされたテキストを表すバイトセットを含むという前提で動作する別のバリエーションがあります。
例えば、[length](../functions/string-functions.md#length)関数は、文字列の長さをバイト単位で計算しますが、[lengthUTF8](../functions/string-functions.md#lengthutf8)関数は、その値がUTF-8エンコードされていると仮定して文字列の長さをUnicodeコードポイントで計算します。
