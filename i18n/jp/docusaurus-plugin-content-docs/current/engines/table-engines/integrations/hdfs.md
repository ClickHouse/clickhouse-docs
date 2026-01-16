---
description: 'このエンジンは、ClickHouse 経由で HDFS 上のデータを管理できるようにすることで、Apache Hadoop エコシステムとの統合を実現します。このエンジンは File エンジンおよび URL エンジンに似ていますが、Hadoop 固有の機能を備えています。'
sidebar_label: 'HDFS'
sidebar_position: 80
slug: /engines/table-engines/integrations/hdfs
title: 'HDFS テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# HDFS テーブルエンジン \\{#hdfs-table-engine\\}

<CloudNotSupportedBadge/>

このエンジンは、ClickHouse から [HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) 上のデータを管理できるようにすることで、[Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop) エコシステムとの統合を提供します。このエンジンは [File](/engines/table-engines/special/file) エンジンや [URL](/engines/table-engines/special/url) エンジンと似ていますが、Hadoop 固有の機能を提供します。

この機能は ClickHouse のエンジニアによる公式サポート対象ではなく、その品質には問題があることが知られています。問題が発生した場合は、ご自身で修正し、pull request を送信してください。

## 使用方法 \\{#usage\\}

```sql
ENGINE = HDFS(URI, format)
```

**エンジンパラメータ**

* `URI` - HDFS 内のファイル全体を指す URI。`URI` のパス部分にはグロブパターンを含めることができます。この場合、テーブルは読み取り専用になります。
* `format` - 利用可能なファイルフォーマットの 1 つを指定します。
  `SELECT` クエリを実行するには、そのフォーマットが入力用としてサポートされている必要があり、`INSERT` クエリを実行するには出力用としてサポートされている必要があります。利用可能なフォーマットは
  [Formats](/sql-reference/formats#formats-overview) セクションに一覧されています。
* [PARTITION BY expr]

### PARTITION BY \\{#partition-by\\}

`PARTITION BY` — 任意です。ほとんどの場合、パーティションキーは不要であり、必要な場合でも、一般的には月単位より細かいパーティションキーは不要です。パーティショニングは（ORDER BY 式とは対照的に）クエリを高速化しません。細かすぎるパーティショニングは決して行うべきではありません。クライアント ID や名前でデータをパーティションしないでください（代わりに、ORDER BY 式の先頭のカラムとしてクライアント ID または名前を指定してください）。

月単位でパーティショニングするには、`toYYYYMM(date_column)` 式を使用します。ここで、`date_column` は [Date](/sql-reference/data-types/date.md) 型の日付を格納するカラムです。この場合のパーティション名は `"YYYYMM"` 形式になります。

**例:**

**1.** `hdfs_engine_table` テーブルを作成します:

```sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** ファイルに内容を記述します:

```sql
INSERT INTO hdfs_engine_table VALUES ('one', 1), ('two', 2), ('three', 3)
```

**3.** データをクエリする：

```sql
SELECT * FROM hdfs_engine_table LIMIT 2
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## 実装の詳細 \\{#implementation-details\\}

* 読み取りと書き込みは並列に実行できます。
* 次の機能はサポートされません:

  * `ALTER` および `SELECT...SAMPLE` の操作。
  * インデックス。
  * [Zero-copy](../../../operations/storing-data.md#zero-copy) レプリケーションは利用可能ですが、推奨されません。

  :::note Zero-copy replication は本番利用には準備ができていません
  Zero-copy レプリケーションは ClickHouse バージョン 22.8 以降ではデフォルトで無効化されています。この機能は本番環境での使用は推奨されません。
  :::

**パス内のグロブ**

複数のパス要素でグロブを使用できます。処理対象となるには、ファイルが存在し、パス全体のパターンに一致している必要があります。ファイルの一覧は `SELECT` 実行時に決定されます（`CREATE` 時点ではありません）。

* `*` — 空文字列を含め、`/` 以外の任意の文字列（任意個の文字）にマッチします。
* `?` — 任意の 1 文字にマッチします。
* `{some_string,another_string,yet_another_one}` — 文字列 `'some_string'`, `'another_string'`, `'yet_another_one'` のいずれかにマッチします。
* `{N..M}` — N から M までの範囲（両端を含む）の任意の数値にマッチします。

`{}` を用いた構文は [remote](../../../sql-reference/table-functions/remote.md) テーブル関数と類似しています。

**例**

1. HDFS 上に、次の URI を持つ TSV 形式のファイルが複数あるとします:

   * &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;1&#39;
   * &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;2&#39;
   * &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;3&#39;
   * &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;1&#39;
   * &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;2&#39;
   * &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;3&#39;

2. これら 6 ファイルすべてから成るテーブルを作成する方法がいくつかあります:

{/* */ }

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

別の方法：

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

テーブルは、両方のディレクトリ内にあるすべてのファイルから構成されます（各ファイルは、クエリで定義されたフォーマットおよびスキーマを満たしている必要があります）:

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
ファイル一覧に先頭ゼロ付きの数値範囲が含まれる場合は、各桁を個別に波かっこで囲む構文を使うか、`?` を使用してください。
:::

**例**

`file000`、`file001`、...、`file999` という名前のファイルでテーブルを作成します。

```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```

## 設定 \\{#configuration\\}

GraphiteMergeTree と同様に、HDFS エンジンでは ClickHouse の設定ファイルを用いた拡張的な設定が可能です。使用できる設定キーは 2 種類あり、グローバル (`hdfs`) とユーザーレベル (`hdfs_*`) です。最初にグローバル設定が適用され、その後に（存在する場合は）ユーザーレベルの設定が適用されます。

```xml
<!-- Global configuration options for HDFS engine type -->
<hdfs>
  <hadoop_kerberos_keytab>/tmp/keytab/clickhouse.keytab</hadoop_kerberos_keytab>
  <hadoop_kerberos_principal>clickuser@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
  <hadoop_security_authentication>kerberos</hadoop_security_authentication>
</hdfs>

<!-- Configuration specific for user "root" -->
<hdfs_root>
  <hadoop_kerberos_principal>root@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
</hdfs_root>
```

### 設定オプション \\{#configuration-options\\}

#### libhdfs3 がサポートする項目 \\{#supported-by-libhdfs3\\}

| **parameter**                                         | **default value**       |
| -                                                  | -                    |
| rpc\_client\_connect\_tcpnodelay                      | true                    |
| dfs\_client\_read\_shortcircuit                       | true                    |
| output\_replace-datanode-on-failure                   | true                    |
| input\_notretry-another-node                          | false                   |
| input\_localread\_mappedfile                          | true                    |
| dfs\_client\_use\_legacy\_blockreader\_local          | false                   |
| rpc\_client\_ping\_interval                           | 10  * 1000              |
| rpc\_client\_connect\_timeout                         | 600 * 1000              |
| rpc\_client\_read\_timeout                            | 3600 * 1000             |
| rpc\_client\_write\_timeout                           | 3600 * 1000             |
| rpc\_client\_socket\_linger\_timeout                  | -1                      |
| rpc\_client\_connect\_retry                           | 10                      |
| rpc\_client\_timeout                                  | 3600 * 1000             |
| dfs\_default\_replica                                 | 3                       |
| input\_connect\_timeout                               | 600 * 1000              |
| input\_read\_timeout                                  | 3600 * 1000             |
| input\_write\_timeout                                 | 3600 * 1000             |
| input\_localread\_default\_buffersize                 | 1 * 1024 * 1024         |
| dfs\_prefetchsize                                     | 10                      |
| input\_read\_getblockinfo\_retry                      | 3                       |
| input\_localread\_blockinfo\_cachesize                | 1000                    |
| input\_read\_max\_retry                               | 60                      |
| output\_default\_chunksize                            | 512                     |
| output\_default\_packetsize                           | 64 * 1024               |
| output\_default\_write\_retry                         | 10                      |
| output\_connect\_timeout                              | 600 * 1000              |
| output\_read\_timeout                                 | 3600 * 1000             |
| output\_write\_timeout                                | 3600 * 1000             |
| output\_close\_timeout                                | 3600 * 1000             |
| output\_packetpool\_size                              | 1024                    |
| output\_heartbeat\_interval                          | 10 * 1000               |
| dfs\_client\_failover\_max\_attempts                  | 15                      |
| dfs\_client\_read\_shortcircuit\_streams\_cache\_size | 256                     |
| dfs\_client\_socketcache\_expiryMsec                  | 3000                    |
| dfs\_client\_socketcache\_capacity                    | 16                      |
| dfs\_default\_blocksize                               | 64 * 1024 * 1024        |
| dfs\_default\_uri                                     | "hdfs://localhost:9000" |
| hadoop\_security\_authentication                      | "simple"                |
| hadoop\_security\_kerberos\_ticket\_cache\_path       | ""                      |
| dfs\_client\_log\_severity                            | "INFO"                  |
| dfs\_domain\_socket\_path                             | ""                      |

[HDFS Configuration Reference](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html) には、一部のパラメータの説明が記載されています。

#### ClickHouse の追加設定 \\{#clickhouse-extras\\}

| **parameter**                                         | **default value**       |
| -                                                  | -                    |
|hadoop\_kerberos\_keytab                               | ""                      |
|hadoop\_kerberos\_principal                            | ""                      |
|libhdfs3\_conf                                         | ""                      |

### 制限事項 \\{#limitations\\}
* `hadoop_security_kerberos_ticket_cache_path` と `libhdfs3_conf` は、ユーザー単位ではなくグローバル設定としてのみ利用できます

## Kerberos サポート \\{#kerberos-support\\}

`hadoop_security_authentication` パラメータの値が `kerberos` の場合、ClickHouse は Kerberos を介して認証を行います。
パラメータについては[こちら](#clickhouse-extras)を参照してください。`hadoop_security_kerberos_ticket_cache_path` が役に立つ場合があります。
libhdfs3 の制限により、古典的な方式のみがサポートされており、
データノードとの通信は SASL によって保護されません（`HADOOP_SECURE_DN_USER` はその種の
セキュリティ方式の信頼できる指標です）。参考として `tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh` を使用してください。

`hadoop_kerberos_keytab`、`hadoop_kerberos_principal` または `hadoop_security_kerberos_ticket_cache_path` が指定されている場合、Kerberos 認証が使用されます。この場合、`hadoop_kerberos_keytab` と `hadoop_kerberos_principal` は必須となります。

## HDFS NameNode HA サポート \\{#namenode-ha\\}

libhdfs3 は HDFS NameNode の HA をサポートします。

* HDFS ノードから `hdfs-site.xml` を `/etc/clickhouse-server/` にコピーします。
* 次の内容を ClickHouse の設定ファイルに追加します。

```xml
  <hdfs>
    <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
  </hdfs>
```

* 次に、HDFS URI 内の名前ノードのアドレスとして、`hdfs-site.xml` の `dfs.nameservices` タグの値を使用します。たとえば、`hdfs://appadmin@192.168.101.11:8020/abc/` を `hdfs://appadmin@my_nameservice/abc/` に置き換えます。

## 仮想カラム \\{#virtual-columns\\}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` となります。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` となります。

## ストレージ設定 \\{#storage-settings\\}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り詰められるようにします。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - フォーマットにサフィックスがある場合、挿入ごとに新しいファイルを作成できるようにします。デフォルトでは無効です。
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り時に空のファイルを読み飛ばせるようにします。デフォルトでは無効です。

**関連項目**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
