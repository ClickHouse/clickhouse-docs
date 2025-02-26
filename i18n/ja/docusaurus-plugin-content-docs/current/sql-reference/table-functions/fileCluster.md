---
slug: /sql-reference/table-functions/fileCluster
sidebar_position: 61
sidebar_label: fileCluster
---

# fileCluster テーブル関数

クラスタ内の複数のノードにわたって指定されたパスに一致するファイルの同時処理を可能にします。イニシエーターは、ワーカーノードへの接続を確立し、ファイルパス内のグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードは、次に処理するファイルをイニシエーターにクエリし、すべてのタスクが完了するまで（すべてのファイルが読み取られるまで）この処理を繰り返します。

:::note    
この関数は、最初に指定されたパスに一致するファイルのセットがすべてのノード間で同一であり、その内容が異なるノード間で一貫している場合にのみ、_正しく_動作します。  
これらのファイルがノード間で異なる場合、返される値は予測できず、ワーカーノードがイニシエーターからタスクをリクエストする順序に依存します。
:::

**構文**

``` sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。
- `path` — [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path)からのファイルへの相対パス。ファイルへのパスは、[グロブ](#globs-in-path)もサポートしています。
- `format` — ファイルの[フォーマット](../../interfaces/formats.md#formats)。タイプ: [String](../../sql-reference/data-types/string.md)。
- `structure` — `'UserID UInt64, Name String'`形式のテーブル構造。カラム名とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。
- `compression_method` — 圧縮方法。サポートされている圧縮タイプは`gz`、`br`、`xz`、`zst`、`lz4`、`bz2`です。

**返される値**

指定されたフォーマットと構造を持ち、指定されたパスに一致するファイルからのデータを含むテーブル。

**例**

`my_cluster`という名のクラスタがあり、以下の設定値`user_files_path`があるとします：

``` bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
また、各クラスタノードの`user_files_path`内に`test1.csv`と`test2.csv`というファイルがあり、その内容は異なるノード間で同一であるとします：
```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

例えば、これらのファイルを作成するには、各クラスタノードで以下の2つのクエリを実行します：
```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

次に、`fileCluster`テーブル関数を使用して`test1.csv`と`test2.csv`のデータ内容を読み取ります：

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

[File](../../sql-reference/table-functions/file.md#globs-in-path)テーブル関数でサポートされているすべてのパターンはFileClusterでもサポートされています。

**関連項目**

- [Fileテーブル関数](../../sql-reference/table-functions/file.md)
