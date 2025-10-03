---
description: '特定のパスに一致するファイルの同時処理をクラスタ内の複数ノードで可能にします。イニシエータはワーカーノードに接続を確立し、ファイルパスのグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードは次に処理するファイルを取得するためにイニシエータにクエリを実行し、すべてのタスクが完了するまで繰り返します（すべてのファイルが読み取られます）。'
sidebar_label: 'ファイルクラスタ'
sidebar_position: 61
slug: '/sql-reference/table-functions/fileCluster'
title: 'fileCluster'
---




# fileCluster テーブル関数

指定されたパスに一致するファイルをクラスター内の複数のノードで同時に処理することを可能にします。イニシエータはワーカーノードに接続を確立し、ファイルパスのグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードは次の処理すべきファイルをイニシエータにクエリし、すべてのタスクが完了するまで繰り返します（すべてのファイルが読み取られます）。

:::note    
この関数は、最初に指定したパスに一致するファイルのセットがすべてのノードで同一であり、異なるノード間でその内容が一貫している場合にのみ _正しく_ 動作します。  
これらのファイルがノード間で異なる場合、返り値は予測できず、ワーカーノードがイニシエータからタスクをリクエストする順序によって異なります。
:::

## 構文 {#syntax}

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

## 引数 {#arguments}

| 引数                   | 説明                                                                                                                                                                                |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`         | リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。                                                                                                                     |
| `path`                 | [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path) からのファイルへの相対パス。ファイルへのパスは[グロブ](#globs-in-path)もサポートしています。                      |
| `format`               | ファイルの[フォーマット](/sql-reference/formats)。タイプ: [String](../../sql-reference/data-types/string.md)。                                                                                      |
| `structure`            | `'UserID UInt64, Name String'`形式のテーブル構造。カラム名とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。                                               |
| `compression_method`   | 圧縮方法。サポートされている圧縮タイプは `gz`, `br`, `xz`, `zst`, `lz4`, および `bz2` です。                                                                                               |

## 返り値 {#returned_value}

指定されたフォーマットと構造のテーブルで、指定されたパスに一致するファイルからのデータを含みます。

**例**

`my_cluster` という名前のクラスターがあり、次の `user_files_path` 設定の値があるとします:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
また、各クラスターノードの `user_files_path` に `test1.csv` および `test2.csv` というファイルがあり、その内容が異なるノード間で同一であるとします:
```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

たとえば、各クラスターノードで以下の2つのクエリを実行することで、これらのファイルを作成できます:
```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

次に、`fileCluster` テーブル関数を使用して `test1.csv` および `test2.csv` のデータ内容を読み取ります:

```sql
SELECT * FROM fileCluster('my_cluster', 'file{1,2}.csv', 'CSV', 'i UInt32, s String') ORDER BY i, s
```

```response
┌──i─┬─s──────┐
│  1 │ file1  │
│ 11 │ file11 │
└────┴────────┘
┌──i─┬─s──────┐
│  2 │ file2  │
│ 22 │ file22 │
└────┴────────┘
```

## パス内のグロブ {#globs-in-path}

[File](../../sql-reference/table-functions/file.md#globs-in-path) テーブル関数によってサポートされるすべてのパターンは FileCluster にもサポートされています。

## 関連 {#related}

- [File テーブル関数](../../sql-reference/table-functions/file.md)
