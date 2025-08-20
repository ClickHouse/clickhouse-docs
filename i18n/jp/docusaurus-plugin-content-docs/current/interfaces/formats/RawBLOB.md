---
description: 'RawBLOB形式のドキュメント'
keywords:
- 'RawBLOB'
slug: '/interfaces/formats/RawBLOB'
title: 'RawBLOB'
---



## 説明 {#description}

`RawBLOB` 形式は、すべての入力データを単一の値として読み取ります。単一の [`String`](/sql-reference/data-types/string.md) 型のフィールドを持つテーブルのみを解析することが可能です。結果は、区切り文字やエスケープなしのバイナリ形式で出力されます。複数の値が出力されると形式は曖昧になり、データを読み返すことは不可能になります。

### Raw形式の比較 {#raw-formats-comparison}

以下は `RawBLOB` と [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md) 形式の比較です。

`RawBLOB`:
- データはバイナリ形式で出力され、エスケープなし；
- 値の間に区切り文字はありません；
- 各値の末尾に改行はありません。

`TabSeparatedRaw`:
- データはエスケープなしで出力されます；
- 行にはタブで分けられた値が含まれています；
- 各行の最終値の後には改行があります。

以下は `RawBLOB` と [RowBinary](./RowBinary/RowBinary.md) 形式の比較です。

`RawBLOB`:
- String フィールドは、長さのプレフィックスなしで出力されます。

`RowBinary`:
- String フィールドは、長さが varint 形式 （符号なし [LEB128](https://en.wikipedia.org/wiki/LEB128)）で表示され、その後に文字列のバイトが続きます。

`RawBLOB` 入力に空のデータが渡されると、ClickHouse は例外をスローします：

```text
Code: 108. DB::Exception: No data to insert
```

## 使用例 {#example-usage}

```bash title="クエリ"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="レスポンス"
f9725a22f9191e064120d718e26862a9  -
```

## 形式の設定 {#format-settings}
