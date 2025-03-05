---
slug: /sql-reference/table-functions/fileCluster
sidebar_position: 61
sidebar_label: fileCluster
title: "fileCluster"
description: "指定されたパスに一致するファイルをクラスタ内の複数のノードで同時に処理することを可能にします。イニシエーターはワーカーノードへの接続を確立し、ファイルパス内のグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードは、処理する次のファイルについてイニシエーターにクエリを送り、すべてのタスクが完了するまで（すべてのファイルが読み取られるまで）繰り返します。"
---


# fileCluster テーブル関数

指定されたパスに一致するファイルをクラスタ内の複数のノードで同時に処理することを可能にします。イニシエーターはワーカーノードへの接続を確立し、ファイルパス内のグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードは、処理する次のファイルについてイニシエーターにクエリを送り、すべてのタスクが完了するまで（すべてのファイルが読み取られるまで）繰り返します。

:::note    
この関数は、最初に指定されたパスに一致するファイルのセットがすべてのノードで同一であり、異なるノード間でその内容が一貫している場合にのみ正しく動作します。  
これらのファイルがノード間で異なる場合、返される値はあらかじめ決定できず、ワーカーノードがイニシエーターからタスクを要求する順序に依存します。
:::

**構文**

``` sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。
- `path` — [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path) からのファイルへの相対パス。ファイルへのパスは [globs](#globs-in-path) もサポートしています。
- `format` — ファイルの [フォーマット](../../interfaces/formats.md#formats)。型: [String](../../sql-reference/data-types/string.md)。
- `structure` — `'UserID UInt64, Name String'` フォーマットのテーブル構造。カラム名と型を決定します。型: [String](../../sql-reference/data-types/string.md)。
- `compression_method` — 圧縮方法。サポートされている圧縮タイプは `gz`, `br`, `xz`, `zst`, `lz4`, および `bz2` です。

**返される値**

指定されたフォーマットと構造を持ち、指定されたパスに一致するファイルからデータを持つテーブル。

**例**

クラスタの名前が `my_cluster` で、設定 `user_files_path` の次の値があるとします：

``` bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
また、各クラスタノードの `user_files_path` 内にファイル `test1.csv` および `test2.csv` があり、それらの内容が異なるノード間で同一であるとしましょう：
```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

たとえば、これらのファイルを作成するには、各クラスタノードで次の2つのクエリを実行できます：
```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

次に、`fileCluster` テーブル関数を介して `test1.csv` および `test2.csv` のデータ内容を読み取ります：

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

**参照**

- [File テーブル関数](../../sql-reference/table-functions/file.md)
