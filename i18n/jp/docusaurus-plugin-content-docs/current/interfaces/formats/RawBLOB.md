---
description: 'RawBLOBフォーマットのドキュメント'
keywords: ['RawBLOB']
slug: /interfaces/formats/RawBLOB
title: 'RawBLOB'
---

## 説明 {#description}

`RawBLOB`フォーマットは、すべての入力データを単一の値として読み取ります。 [`String`](/sql-reference/data-types/string.md)型またはそれに類似した単一フィールドのテーブルのみを解析することが可能です。 結果は、区切り文字やエスケープなしでバイナリフォーマットとして出力されます。 1つ以上の値が出力される場合、フォーマットは曖昧になり、データを再度読み取ることが不可能になります。

### Rawフォーマットの比較 {#raw-formats-comparison}

以下は、`RawBLOB`と[`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md)フォーマットの比較です。

`RawBLOB`:
- データはバイナリフォーマットで出力され、エスケープはありません。
- 値の間に区切り文字はありません。
- 各値の最後に改行はありません。

`TabSeparatedRaw`:
- データはエスケープなしで出力されます。
- 行はタブで区切られた値を含みます。
- 各行の最後の値の後には改行があります。

以下は、`RawBLOB`と[RowBinary](./RowBinary/RowBinary.md)フォーマットの比較です。

`RawBLOB`:
- Stringフィールドは長さのプレフィックスなしで出力されます。

`RowBinary`:
- Stringフィールドは、バイナリ形式の長さ（unsigned [LEB128] (https://en.wikipedia.org/wiki/LEB128)）で表現され、その後に文字列のバイトが続きます。

空のデータが`RawBLOB`入力に渡されると、ClickHouseは例外をスローします：

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

## フォーマット設定 {#format-settings}
