---
title: RawBLOB
slug: /interfaces/formats/RawBLOB
keywords: [RawBLOB]
---

## 説明 {#description}

`RawBLOB` フォーマットは、すべての入力データを単一の値として読み込みます。 [`String`](/sql-reference/data-types/string.md) 型のフィールドが1つだけのテーブルの解析が可能です。
結果はデリミタやエスケープなしのバイナリ形式で出力されます。複数の値が出力される場合、フォーマットは曖昧となり、データを再読み込みすることは不可能です。

### Raw フォーマットの比較 {#raw-formats-comparison}

以下は、`RawBLOB` と [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md) フォーマットの比較です。

`RawBLOB`:
- データはエスケープなしのバイナリ形式で出力されます；
- 値の間にデリミタはありません；
- 各値の終わりには改行がありません。

`TabSeparatedRaw`:
- データはエスケープなしで出力されます；
- 行はタブで区切られた値を含みます；
- 各行の最後の値の後には改行があります。

以下は、`RawBLOB` と [RowBinary](./RowBinary/RowBinary.md) フォーマットの比較です。

`RawBLOB`:
- String フィールドは長さのプレフィックスなしで出力されます。

`RowBinary`:
- String フィールドは長さが varint 形式で表示され（unsigned [LEB128] (https://en.wikipedia.org/wiki/LEB128)）、その後に文字列のバイトが続きます。

`RawBLOB` 入力に空のデータが渡されると、ClickHouse は例外を投げます：

```text
コード: 108. DB::Exception: No data to insert
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
