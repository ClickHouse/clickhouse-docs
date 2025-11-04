---
'description': 'RawBLOB フォーマットのドキュメント'
'keywords':
- 'RawBLOB'
'slug': '/interfaces/formats/RawBLOB'
'title': 'RawBLOB'
'doc_type': 'reference'
---

## 説明 {#description}

`RawBLOB` フォーマットは、すべての入力データを単一の値として読み取ります。 [`String`](/sql-reference/data-types/string.md) 型やそれに類似した型の単一フィールドを持つテーブルのみを解析することが可能です。結果は、区切り文字やエスケープなしのバイナリフォーマットとして出力されます。複数の値が出力されるとフォーマットが曖昧になり、データを再読込することは不可能になります。

### Rawフォーマットの比較 {#raw-formats-comparison}

以下は `RawBLOB` と [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md) フォーマットの比較です。

`RawBLOB`:
- データはバイナリフォーマットで出力され、エスケープはありません；
- 値の間に区切り文字はありません；
- 各値の終わりに改行はありません。

`TabSeparatedRaw`:
- データはエスケープなしで出力されます；
- 行はタブで区切られた値を含みます；
- 各行の最後の値の後に行送りがあります。

次に、`RawBLOB` と [RowBinary](./RowBinary/RowBinary.md) フォーマットの比較を示します。

`RawBLOB`:
- 文字列フィールドは、その長さのプレフィックスなしで出力されます。

`RowBinary`:
- 文字列フィールドは、長さを varint フォーマット（非符号 [LEB128] (https://en.wikipedia.org/wiki/LEB128)）で表現し、次に文字列のバイトが続きます。

空のデータが `RawBLOB` 入力に渡されると、ClickHouse は例外をスローします：

```text
Code: 108. DB::Exception: No data to insert
```

## 使用例 {#example-usage}

```bash title="Query"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="Response"
f9725a22f9191e064120d718e26862a9  -
```

## フォーマット設定 {#format-settings}
