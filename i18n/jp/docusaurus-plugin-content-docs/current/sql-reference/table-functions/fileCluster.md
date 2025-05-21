---
description: '指定されたパスに一致するファイルをクラスタ内の複数のノードで同時に処理できるようにします。イニシエータはワーカーノードに接続を確立し、ファイルパス内のグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードは次に処理するファイルをイニシエータにクエリし、すべてのタスクが完了するまで（すべてのファイルが読み取られるまで）繰り返します。'
sidebar_label: 'fileCluster'
sidebar_position: 61
slug: /sql-reference/table-functions/fileCluster
title: 'fileCluster'
---


# fileCluster テーブル関数

指定されたパスに一致するファイルをクラスタ内の複数のノードで同時に処理できるようにします。イニシエータはワーカーノードに接続を確立し、ファイルパス内のグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードは次に処理するファイルをイニシエータにクエリし、すべてのタスクが完了するまで（すべてのファイルが読み取られるまで）繰り返します。

:::note    
この関数は、初めに指定されたパスに一致するファイルのセットがすべてのノードで同一であり、異なるノード間でその内容が一貫している場合にのみ、_正しく_ 動作します。  
これらのファイルがノード間で異なる場合、戻り値は事前に決定できず、ワーカーノードがイニシエータからタスクをリクエストする順序に依存します。
:::

**構文**

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータを構築するために使用されるクラスタの名前。
- `path` — [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path) からのファイルへの相対パス。ファイルへのパスは [グロブ](#globs-in-path) もサポートしています。
- `format` — ファイルの[フォーマット](/sql-reference/formats)。タイプ: [String](../../sql-reference/data-types/string.md)。
- `structure` — `'UserID UInt64, Name String'` 形式のテーブル構造。カラム名と型を決定します。タイプ: [String](../../sql-reference/data-types/string.md)。
- `compression_method` — 圧縮方法。サポートされている圧縮タイプは `gz`, `br`, `xz`, `zst`, `lz4`, および `bz2` です。

**返される値**

指定されたフォーマットと構造、および指定されたパスに一致するファイルからのデータを持つテーブル。

**例**

`my_cluster` という名前のクラスタがあり、次の `user_files_path` 設定の値があるとします：

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
また、各クラスタノードの `user_files_path` 内にファイル `test1.csv` と `test2.csv` があり、その内容が異なるノード間で同一であるとします：
```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

たとえば、次の2つのクエリを各クラスタノードで実行することにより、これらのファイルを作成できます：
```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

次に、`fileCluster` テーブル関数を使用して `test1.csv` と `test2.csv` のデータ内容を読み取ります：

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

[File](../../sql-reference/table-functions/file.md#globs-in-path) テーブル関数でサポートされているすべてのパターンは、FileClusterでもサポートされています。

**関連項目**

- [File テーブル関数](../../sql-reference/table-functions/file.md)
