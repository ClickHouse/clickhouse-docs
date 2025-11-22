---
description: 'クラスター内の複数ノードで、指定されたパスにマッチするファイルを同時に処理できるようにします。イニシエーターがワーカーノードへの接続を確立し、ファイルパス内のグロブを展開し、ファイル読み取りタスクをワーカーノードに委譲します。各ワーカーノードは処理すべき次のファイルをイニシエーターに問い合わせ、すべてのタスク（すべてのファイルの読み取り）が完了するまでこれを繰り返します。'
sidebar_label: 'fileCluster'
sidebar_position: 61
slug: /sql-reference/table-functions/fileCluster
title: 'fileCluster'
doc_type: 'reference'
---



# fileCluster テーブル関数

指定されたパスにマッチするファイルを、クラスタ内の複数ノードで同時に処理できるようにします。イニシエータはワーカーノードへの接続を確立し、ファイルパス内のグロブの展開を行い、ファイル読み取りタスクをワーカーノードに委譲します。各ワーカーノードは処理すべき次のファイルをイニシエータに問い合わせ、すべてのタスクが完了する（すべてのファイルが読み込まれる）までこの処理を繰り返します。

:::note    
この関数が _正しく_ 動作するのは、最初に指定したパスにマッチするファイルの集合がすべてのノードで同一であり、かつそれらの内容がノード間で一貫している場合に限られます。  
これらのファイルがノード間で異なる場合、戻り値は事前に予測できず、ワーカーノードがイニシエータへタスクを要求する順序に依存します。
:::



## 構文 {#syntax}

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```


## 引数 {#arguments}

| 引数             | 説明                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`       | リモートサーバーおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタ名。                                                                  |
| `path`               | [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path)からのファイルへの相対パス。ファイルパスは[globs](#globs-in-path)もサポートします。 |
| `format`             | ファイルの[フォーマット](/sql-reference/formats)。型: [String](../../sql-reference/data-types/string.md)。                                                                           |
| `structure`          | `'UserID UInt64, Name String'`形式のテーブル構造。カラム名と型を決定します。型: [String](../../sql-reference/data-types/string.md)。                             |
| `compression_method` | 圧縮方式。サポートされている圧縮タイプは`gz`、`br`、`xz`、`zst`、`lz4`、および`bz2`です。                                                                                     |


## 戻り値 {#returned_value}

指定されたフォーマットと構造を持ち、指定されたパスに一致するファイルからのデータを含むテーブル。

**例**

`my_cluster`という名前のクラスタがあり、`user_files_path`設定が以下の値である場合:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

また、各クラスタノードの`user_files_path`内に`test1.csv`と`test2.csv`というファイルがあり、それらの内容が異なるノード間で同一である場合:

```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

例えば、すべてのクラスタノードで以下の2つのクエリを実行することで、これらのファイルを作成できます:

```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

次に、`fileCluster`テーブル関数を使用して`test1.csv`と`test2.csv`のデータ内容を読み取ります:

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

[File](../../sql-reference/table-functions/file.md#globs-in-path) テーブル関数でサポートされているすべてのパターンは、FileCluster でもサポートされています。


## 関連項目 {#related}

- [Fileテーブル関数](../../sql-reference/table-functions/file.md)
