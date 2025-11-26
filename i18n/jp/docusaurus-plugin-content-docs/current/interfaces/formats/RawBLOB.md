---
description: 'RawBLOB フォーマットに関するドキュメント'
keywords: ['RawBLOB']
slug: /interfaces/formats/RawBLOB
title: 'RawBLOB'
doc_type: 'reference'
---



## 説明

`RawBLOB` 形式は、すべての入力データを単一の値として読み取ります。これは、[`String`](/sql-reference/data-types/string.md) 型またはそれに類似した単一フィールドのみを持つテーブルだけをパースできます。
結果は区切り文字やエスケープなしのバイナリ形式として出力されます。2 つ以上の値が出力される場合、この形式はあいまいになり、データを読み戻すことは不可能になります。

### Raw フォーマットの比較

以下は、`RawBLOB` と [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md) フォーマットの比較です。

`RawBLOB`:

* データはバイナリ形式で出力され、エスケープは行われません。
* 値同士の間に区切り文字はありません。
* 各値の末尾には改行がありません。

`TabSeparatedRaw`:

* データはエスケープなしで出力されます。
* 行にはタブで区切られた値が含まれます。
* 各行の最後の値の後に改行文字があります。

以下は、`RawBLOB` と [RowBinary](./RowBinary/RowBinary.md) フォーマットの比較です。

`RawBLOB`:

* String フィールドは長さを表すプレフィックスなしで出力されます。

`RowBinary`:

* String フィールドは、可変長整数 (varint) 形式（符号なし [LEB128] ([https://en.wikipedia.org/wiki/LEB128](https://en.wikipedia.org/wiki/LEB128))) の長さで表現され、その後に文字列のバイト列が続きます。

`RawBLOB` 入力に空のデータが渡されると、ClickHouse は例外をスローします。

```text
コード: 108. DB::Exception: 挿入するデータがありません
```


## 使用例

```bash title="Query"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="Response"
f9725a22f9191e064120d718e26862a9  -
```


## フォーマットの設定 {#format-settings}
