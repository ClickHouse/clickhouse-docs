---
description: '指定されたパスにマッチするファイルを、クラスタ内の複数ノードで同時に処理できるようにします。イニシエータはワーカーノードへの接続を確立し、ファイルパス中のグロブを展開して、ファイル読み取りタスクをワーカーノードへ委譲します。各ワーカーノードは、処理すべき次のファイルを取得するためにイニシエータへ問い合わせを行い、すべてのタスク（すべてのファイルの読み取り）が完了するまでこの処理を繰り返します。'
sidebar_label: 'fileCluster'
sidebar_position: 61
slug: /sql-reference/table-functions/fileCluster
title: 'fileCluster'
doc_type: 'reference'
---

# fileCluster テーブル関数 \{#filecluster-table-function\}

指定されたパスに一致するファイルを、クラスター内の複数ノードにまたがって同時に処理できるようにします。イニシエータはワーカーノードへの接続を確立し、ファイルパス内のグロブを展開し、ファイル読み取りタスクをワーカーノードに委譲します。各ワーカーノードは、処理すべき次のファイルを取得するためにイニシエータへ問い合わせを行い、すべてのタスクが完了する（すべてのファイルが読み込まれる）までこれを繰り返します。

:::note    
この関数が_正しく_動作するのは、最初に指定されたパスに一致するファイルの集合がすべてのノードで同一であり、かつそれらの内容がノード間で一貫している場合に限られます。  
これらのファイルがノード間で異なる場合、戻り値は事前には決定できず、どの順序でワーカーノードがイニシエータへタスクを要求するかに依存します。
:::

## 構文 \{#syntax\}

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

## 引数 \{#arguments\}

| 引数                 | 説明                                                                                                                                                                               |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`       | リモートおよびローカルサーバーのアドレスおよび接続パラメータの集合を構築するために使用するクラスター名。                                                                            |
| `path`               | [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path) からのファイルへの相対パス。ファイルパスは [グロブ](#globs-in-path) もサポートします。 |
| `format`             | ファイルの[フォーマット](/sql-reference/formats)。型: [String](../../sql-reference/data-types/string.md)。                                   |
| `structure`          | `'UserID UInt64, Name String'` 形式のテーブル構造。列名と型を決定します。型: [String](../../sql-reference/data-types/string.md)。            |
| `compression_method` | 圧縮方式。サポートされる圧縮形式は `gz`、`br`、`xz`、`zst`、`lz4`、`bz2` です。                                                                                                   |

## 返される値 \{#returned_value\}

指定されたフォーマットと構造を持ち、指定されたパスに一致するファイルからのデータを含むテーブルが返されます。

**例**

クラスタ名が `my_cluster` で、設定 `user_files_path` の値が次のとおりであると仮定します：

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

また、各クラスターノードの `user_files_path` 内に `test1.csv` と `test2.csv` というファイルが存在し、その内容は全ノードで同一であるとします。

```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

たとえば、各クラスター ノードで次の 2 つのクエリを実行することで、これらのファイルを作成できます。

```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

次に、`fileCluster` テーブル関数を使って `test1.csv` と `test2.csv` のデータ内容を読み込みます。

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

## パスのグロブ \{#globs-in-path\}

[File](../../sql-reference/table-functions/file.md#globs-in-path) テーブル関数でサポートされているすべてのパターンは、FileCluster でもサポートされています。

## 関連項目 \{#related\}

- [file テーブル関数](../../sql-reference/table-functions/file.md)
