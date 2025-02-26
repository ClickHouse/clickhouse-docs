---
title : RawBLOB
slug: /interfaces/formats/RawBLOB
keywords : [RawBLOB]
---

## 説明 {#description}

`RawBLOB`フォーマットは、すべての入力データを単一の値として読み取ります。型が[`String`](/sql-reference/data-types/string.md)またはそれに類似した単一フィールドのテーブルのみを解析することが可能です。結果は、区切り文字やエスケープなしのバイナリフォーマットとして出力されます。複数の値が出力される場合、フォーマットは曖昧になり、データを読み戻すことが不可能になります。

### Rawフォーマットの比較 {#raw-formats-comparison}

以下は、`RawBLOB`と[`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md)フォーマットの比較です。

`RawBLOB`:
- データはバイナリフォーマットで出力され、エスケープはありません；
- 値の間に区切り文字はありません；
- 各値の末尾に改行はありません。

`TabSeparatedRaw`:
- データはエスケープなしで出力されます；
- 行はタブで区切られた値を含みます；
- 各行の最後の値の後には改行があります。

次に、`RawBLOB`と[RowBinary](./RowBinary/RowBinary.md)フォーマットの比較を示します。

`RawBLOB`:
- Stringフィールドは長さでプレフィックスされずに出力されます。

`RowBinary`:
- Stringフィールドは長さがvarintフォーマット（符号なし[LEB128](https://en.wikipedia.org/wiki/LEB128)）で表され、その後に文字列のバイトが続きます。

空のデータが`RawBLOB`入力に渡されると、ClickHouseは例外をスローします：

```text
コード: 108. DB::例外: 挿入するデータがありません
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
