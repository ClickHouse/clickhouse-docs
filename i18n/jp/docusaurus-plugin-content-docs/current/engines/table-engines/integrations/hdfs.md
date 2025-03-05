---
slug: /engines/table-engines/integrations/hdfs
sidebar_position: 80
sidebar_label: HDFS
title: "HDFS"
description: "このエンジンは、ClickHouse を介して HDFS 上のデータを管理することにより、Apache Hadoop エコシステムとの統合を提供します。このエンジンは、File および URL エンジンに似ていますが、Hadoop 特有の機能を提供します。"
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# HDFS

<CloudNotSupportedBadge/>

このエンジンは、[Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop) エコシステムとの統合を提供し、ClickHouse を介して [HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) 上のデータを管理することを可能にします。このエンジンは、[File](/engines/table-engines/special/file) エンジンおよび [URL](/engines/table-engines/special/url) エンジンに似ていますが、Hadoop 特有の機能を提供します。

この機能は ClickHouse エンジニアによってサポートされていないため、品質が不安定であることが知られています。問題が発生した場合は、自分で修正し、プルリクエストを提出してください。

## 使用法 {#usage}

``` sql
ENGINE = HDFS(URI, format)
```

**エンジンパラメータ**

- `URI` - HDFS の全ファイル URI。`URI` のパス部分にはグロブを含めることができます。この場合、テーブルは読み取り専用になります。
- `format` - 利用可能なファイル形式のいずれかを指定します。`SELECT` クエリを実行するには、形式が入力用にサポートされている必要があり、`INSERT` クエリを実行するには出力用にサポートされている必要があります。利用可能な形式は、[Formats](/sql-reference/formats#formats-overview) セクションにリストされています。
- [PARTITION BY expr]

### PARTITION BY {#partition-by}

`PARTITION BY` — オプションです。ほとんどのケースではパーティションキーは必要ありませんが、必要な場合は一般的に月単位のそれよりも細かいパーティションキーは必要ありません。パーティショニングはクエリの速度を向上させません（ORDER BY 式と対照的です）。あまりにも細かいパーティショニングは使用しないでください。クライアント識別子や名前でデータをパーティショニングしないでください（代わりに、クライアント識別子または名前を ORDER BY 式の最初のカラムにしてください）。

月単位でのパーティショニングには、`toYYYYMM(date_column)` 式を使用します。ここで、`date_column` は [Date](/sql-reference/data-types/date.md) 型の日付を持つカラムです。ここでのパーティション名は `"YYYYMM"` 形式です。

**例:**

**1.** `hdfs_engine_table` テーブルを設定します：

``` sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** ファイルを埋めます：

``` sql
INSERT INTO hdfs_engine_table VALUES ('one', 1), ('two', 2), ('three', 3)
```

**3.** データをクエリします：

``` sql
SELECT * FROM hdfs_engine_table LIMIT 2
```

``` text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## 実装の詳細 {#implementation-details}

- 読み込みと書き込みは並列で行えます。
- サポートされていないもの：
    - `ALTER` および `SELECT...SAMPLE` 操作。
    - インデックス。
    - [ゼロコピー](../../../operations/storing-data.md#zero-copy) 複製は可能ですが、推奨されません。

  :::note ゼロコピー複製は生産準備が整っていません
  ゼロコピー複製は ClickHouse バージョン 22.8 以降でデフォルトで無効です。この機能は本番環境での使用は推奨されません。
  :::

**パス内のグロブ**

複数のパスコンポーネントにグロブを使用できます。処理されるファイルは、存在し、全パターンと一致する必要があります。ファイルのリストは `SELECT` 中に決定されます（`CREATE` 時ではありません）。

- `*` — `/` を除く任意の数の任意の文字（空文字列を含む）の代わりに使用できます。
- `?` — 任意の一文字の代わりに使用できます。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかの代わりに使用できます。
- `{N..M}` — N から M までの範囲内の任意の数の代わりに使用できます（両端を含む）。

`{}` を使用した構文は、[remote](../../../sql-reference/table-functions/remote.md) テーブル関数に似ています。

**例**

1.  HDFS 上に次の URIs を持つ TSF 形式のファイルがいくつかあるとします：

    - 'hdfs://hdfs1:9000/some_dir/some_file_1'
    - 'hdfs://hdfs1:9000/some_dir/some_file_2'
    - 'hdfs://hdfs1:9000/some_dir/some_file_3'
    - 'hdfs://hdfs1:9000/another_dir/some_file_1'
    - 'hdfs://hdfs1:9000/another_dir/some_file_2'
    - 'hdfs://hdfs1:9000/another_dir/some_file_3'

1.  これらの6つのファイルで構成されるテーブルを作成する方法はいくつかあります：

<!-- -->

``` sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

もう一つの方法：

``` sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

テーブルは両方のディレクトリ内の全ファイルで構成されます（すべてのファイルは、クエリで記述された形式とスキーマに適合している必要があります）：

``` sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
ファイルのリストに先頭ゼロのある数値範囲が含まれる場合は、各桁ごとに中括弧を使用する構文を使用するか、`?` を使用してください。
:::

**例**

`file000`, `file001`, ... , `file999` というファイルを持つテーブルを作成します：

``` sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```
## 設定 {#configuration}

GraphiteMergeTree と同様に、HDFS エンジンは ClickHouse 設定ファイルを使用して拡張設定をサポートしています。使用できる2つの設定キーがあります：グローバル（`hdfs`）およびユーザーレベル（`hdfs_*`）。グローバル設定が最初に適用され、次にユーザーレベルの設定が適用されます（存在する場合）。

``` xml
  <!-- HDFS エンジンタイプのグローバル設定オプション -->
  <hdfs>
	<hadoop_kerberos_keytab>/tmp/keytab/clickhouse.keytab</hadoop_kerberos_keytab>
	<hadoop_kerberos_principal>clickuser@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
	<hadoop_security_authentication>kerberos</hadoop_security_authentication>
  </hdfs>

  <!-- ユーザー "root" 用の設定 -->
  <hdfs_root>
	<hadoop_kerberos_principal>root@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
  </hdfs_root>
```

### 設定オプション {#configuration-options}

#### libhdfs3 でサポートされている {#supported-by-libhdfs3}


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


[HDFS 設定リファレンス](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html) では、いくつかのパラメータについて説明されているかもしれません。


#### ClickHouse の特別オプション {#clickhouse-extras}

| **parameter**                                         | **default value**       |
| -                                                  | -                    |
|hadoop\_kerberos\_keytab                               | ""                      |
|hadoop\_kerberos\_principal                            | ""                      |
|libhdfs3\_conf                                         | ""                      |

### 制限 {#limitations}
* `hadoop_security_kerberos_ticket_cache_path` と `libhdfs3_conf` は、ユーザー特有ではなくグローバルのみで設定できます。

## Kerberos サポート {#kerberos-support}

`hadoop_security_authentication` パラメータが `kerberos` の値を持つ場合、ClickHouse は Kerberos を介して認証を行います。
パラメータは [ここ](#clickhouse-extras) にあり、`hadoop_security_kerberos_ticket_cache_path` は役立つ場合があります。
libhdfs3 の制限により、古典的なアプローチのみがサポートされており、データノード間の通信は SASL で保護されていません（`HADOOP_SECURE_DN_USER` はそのようなセキュリティアプローチの信頼できる指標です）。参照用に `tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh` を使用してください。

`hadoop_kerberos_keytab`、`hadoop_kerberos_principal` または `hadoop_security_kerberos_ticket_cache_path` が指定されている場合、Kerberos 認証が使用されます。この場合、`hadoop_kerberos_keytab` と `hadoop_kerberos_principal` は必須です。

## HDFS Namenode HA サポート {#namenode-ha}

libhdfs3 は HDFS namenode HA をサポートしています。

- HDFS ノードから `hdfs-site.xml` を `/etc/clickhouse-server/` にコピーします。
- ClickHouse 設定ファイルに次の部分を追加します：

``` xml
  <hdfs>
    <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
  </hdfs>
```

- 次に、HDFS URI 内の namenode アドレスとして `hdfs-site.xml` の `dfs.nameservices` タグの値を使用します。例えば、`hdfs://appadmin@192.168.101.11:8020/abc/` を `hdfs://appadmin@my_nameservice/abc/` に置き換えます。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` になります。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` になります。

## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り詰めることを可能にします。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - 各挿入時に新しいファイルを作成することを可能にします。形式にサフィックスがある場合に適用されます。デフォルトでは無効です。
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 読み込み時に空のファイルをスキップすることを可能にします。デフォルトでは無効です。

**関連項目**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
