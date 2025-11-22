---
description: 'RawBLOB フォーマットに関するドキュメント'
keywords: ['RawBLOB']
slug: /interfaces/formats/RawBLOB
title: 'RawBLOB'
doc_type: 'reference'
---



## Description {#description}

`RawBLOB`フォーマットは、すべての入力データを単一の値として読み取ります。[`String`](/sql-reference/data-types/string.md)型または類似の型の単一フィールドを持つテーブルのみを解析できます。
結果は、区切り文字やエスケープなしのバイナリフォーマットで出力されます。複数の値が出力される場合、フォーマットが曖昧になり、データを読み戻すことができなくなります。

### Rawフォーマットの比較 {#raw-formats-comparison}

以下は、`RawBLOB`と[`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md)フォーマットの比較です。

`RawBLOB`:

- データはバイナリフォーマットで出力され、エスケープはありません
- 値の間に区切り文字はありません
- 各値の末尾に改行はありません

`TabSeparatedRaw`:

- データはエスケープなしで出力されます
- 行にはタブで区切られた値が含まれます
- すべての行の最後の値の後に改行があります

以下は、`RawBLOB`と[RowBinary](./RowBinary/RowBinary.md)フォーマットの比較です。

`RawBLOB`:

- String型フィールドは長さのプレフィックスなしで出力されます

`RowBinary`:

- String型フィールドは、varintフォーマット(符号なし[LEB128] (https://en.wikipedia.org/wiki/LEB128))の長さとして表現され、その後に文字列のバイト列が続きます

空のデータが`RawBLOB`入力に渡されると、ClickHouseは例外をスローします:

```text
Code: 108. DB::Exception: No data to insert
```


## 使用例 {#example-usage}

```bash title="クエリ"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="応答"
f9725a22f9191e064120d718e26862a9  -
```


## フォーマット設定 {#format-settings}
