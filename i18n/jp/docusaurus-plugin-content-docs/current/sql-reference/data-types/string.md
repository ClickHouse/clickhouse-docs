---
description: 'ClickHouse の String データ型に関するドキュメント'
sidebar_label: 'String'
sidebar_position: 8
slug: /sql-reference/data-types/string
title: 'String'
doc_type: 'reference'
---



# String

任意の長さの文字列型です。長さに制限はありません。値には、ヌルバイトを含む任意のバイト列を格納できます。
String 型は、他の DBMS の VARCHAR、BLOB、CLOB などの型を置き換えるものです。

テーブルを作成する際、文字列フィールドに対して数値パラメータ（例: `VARCHAR(255)`）を指定できますが、ClickHouse はこれらを無視します。

エイリアス:

- `String` — `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT`, `TEXT`, `LONGBLOB`, `MEDIUMBLOB`, `TINYBLOB`, `BLOB`, `VARCHAR`, `CHAR`, `CHAR LARGE OBJECT`, `CHAR VARYING`, `CHARACTER LARGE OBJECT`, `CHARACTER VARYING`, `NCHAR LARGE OBJECT`, `NCHAR VARYING`, `NATIONAL CHARACTER LARGE OBJECT`, `NATIONAL CHARACTER VARYING`, `NATIONAL CHAR VARYING`, `NATIONAL CHARACTER`, `NATIONAL CHAR`, `BINARY LARGE OBJECT`, `BINARY VARYING`,



## エンコーディング {#encodings}

ClickHouse にはエンコーディングという概念がありません。文字列は任意のバイト列を含むことができ、それらはそのままの形で保存および出力されます。
テキストを保存する必要がある場合は、UTF-8 エンコーディングの使用を推奨します。少なくとも、端末が（推奨どおり）UTF-8 を使用している場合は、値を変換することなく読み書きできます。
同様に、文字列を扱う一部の関数には、その文字列が UTF-8 でエンコードされたテキストを表すバイト列であることを前提として動作する別バージョンがあります。
たとえば、[length](/sql-reference/functions/array-functions#length) 関数は文字列の長さをバイト数で計算し、[lengthUTF8](../functions/string-functions.md#lengthUTF8) 関数は値が UTF-8 でエンコードされていると仮定して、文字列の長さを Unicode コードポイント数で計算します。
