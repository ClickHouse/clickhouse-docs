---
'description': '指定されたパスに一致するファイルをクラスター内の複数のノードで同時に処理することを可能にします。起動者は作業ノードへの接続を確立し、ファイルパス内のグロブを展開し、ファイル読み取りタスクを作業ノードに委任します。各作業ノードは次に処理するファイルを取得するために起動者にクエリを送信し、すべてのタスクが完了するまで（すべてのファイルが読み取られるまで）繰り返します。'
'sidebar_label': 'fileCluster'
'sidebar_position': 61
'slug': '/sql-reference/table-functions/fileCluster'
'title': 'fileCluster'
'doc_type': 'reference'
---


# fileCluster テーブル関数

指定されたパスに一致するファイルをクラスタ内の複数のノードで同時に処理することを可能にします。イニシエーターはワーカーノードへの接続を確立し、ファイルパス内のグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードは次の処理対象のファイルについてイニシエーターに要求し、すべてのタスクが完了するまで（すべてのファイルが読み込まれるまで）繰り返します。

:::note    
この関数は、初めに指定されたパスに一致するファイルの集合がすべてのノードで同一であり、かつその内容が異なるノード間で一貫している場合にのみ、_正しく_ 動作します。  
これらのファイルがノード間で異なる場合、返される値は事前に決定することができず、ワーカーノードがイニシエーターからタスクを要求する順序に依存します。
:::

## 構文 {#syntax}

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

## 引数 {#arguments}

| 引数                 | 説明                                                                                                                                                                           |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`       | リモートおよびローカルサーバへのアドレスと接続パラメータを構築するために使用されるクラスタの名前。                                                                                       |
| `path`               | [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path) からのファイルへの相対パス。ファイルパスは [globs](#globs-in-path) もサポートします。 |
| `format`             | ファイルの[フォーマット](/sql-reference/formats)。タイプ: [String](../../sql-reference/data-types/string.md)。                                                                           |
| `structure`          | `'UserID UInt64, Name String'` 形式のテーブル構造。カラム名とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。                                      |
| `compression_method` | 圧縮方法。サポートされている圧縮タイプは `gz`, `br`, `xz`, `zst`, `lz4`, および `bz2` です。                                                                                |

## 返される値 {#returned_value}

指定されたフォーマットと構造を持ち、指定されたパスに一致するファイルからのデータを持つテーブル。

**例**

クラスタ名が `my_cluster` で、設定 `user_files_path` の次の値が与えられたとします:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
さらに、各クラスタノードの `user_files_path` 内に `test1.csv` と `test2.csv` のファイルがあり、その内容が異なるノード間で同一であるとします:
```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

例えば、これらのファイルを作成するには、各クラスタノードで次の2つのクエリを実行することができます:
```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

次に、`fileCluster` テーブル関数を介して `test1.csv` と `test2.csv` のデータ内容を読み取ります:

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

[File](../../sql-reference/table-functions/file.md#globs-in-path) テーブル関数でサポートされるすべてのパターンは、FileClusterでもサポートされています。

## 関連 {#related}

- [File テーブル関数](../../sql-reference/table-functions/file.md)
