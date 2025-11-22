---
description: 'このエンジンは、ClickHouse を介して HDFS 上のデータを管理できるようにすることで、Apache Hadoop エコシステムとの統合を実現します。このエンジンは File エンジンおよび URL エンジンに類似していますが、Hadoop 固有の機能を提供します。'
sidebar_label: 'HDFS'
sidebar_position: 80
slug: /engines/table-engines/integrations/hdfs
title: 'HDFS テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# HDFS テーブルエンジン

<CloudNotSupportedBadge/>

このエンジンは、ClickHouse から [HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) 上のデータを管理できるようにすることで、[Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop) エコシステムとの統合を実現します。このエンジンは [File](/engines/table-engines/special/file) エンジンおよび [URL](/engines/table-engines/special/url) エンジンと類似していますが、Hadoop 固有の機能を提供します。

この機能は ClickHouse エンジニアによってサポートされておらず、品質が安定していないことが知られています。問題が発生した場合は、ご自身で修正し、プルリクエストを送信してください。



## 使用方法 {#usage}

```sql
ENGINE = HDFS(URI, format)
```

**エンジンパラメータ**

- `URI` - HDFS内の完全なファイルURI。`URI`のパス部分にはglobパターンを含めることができます。この場合、テーブルは読み取り専用になります。
- `format` - 利用可能なファイル形式のいずれかを指定します。`SELECT`クエリを実行するには、その形式が入力をサポートしている必要があり、`INSERT`クエリを実行するには出力をサポートしている必要があります。利用可能な形式は[Formats](/sql-reference/formats#formats-overview)セクションに記載されています。
- [PARTITION BY 式]

### PARTITION BY {#partition-by}

`PARTITION BY` — オプション。ほとんどの場合、パーティションキーは不要です。必要な場合でも、通常は月単位より細かい粒度のパーティションキーは必要ありません。パーティショニングはクエリを高速化しません(ORDER BY式とは対照的です)。過度に細かい粒度のパーティショニングは使用しないでください。クライアント識別子や名前でデータをパーティション分割しないでください(代わりに、クライアント識別子や名前をORDER BY式の最初の列にしてください)。

月単位でパーティション分割するには、`toYYYYMM(date_column)`式を使用します。ここで`date_column`は[Date](/sql-reference/data-types/date.md)型の日付列です。パーティション名は`"YYYYMM"`形式になります。

**例:**

**1.** `hdfs_engine_table`テーブルを作成します:

```sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** ファイルにデータを挿入します:

```sql
INSERT INTO hdfs_engine_table VALUES ('one', 1), ('two', 2), ('three', 3)
```

**3.** データをクエリします:

```sql
SELECT * FROM hdfs_engine_table LIMIT 2
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```


## 実装の詳細 {#implementation-details}

- 読み取りと書き込みは並列実行可能です。
- サポートされていない機能:
  - `ALTER`および`SELECT...SAMPLE`操作
  - インデックス
  - [ゼロコピー](../../../operations/storing-data.md#zero-copy)レプリケーションは可能ですが、推奨されません。

  :::note ゼロコピーレプリケーションは本番環境に対応していません
  ゼロコピーレプリケーションは、ClickHouseバージョン22.8以降ではデフォルトで無効になっています。この機能は本番環境での使用を推奨しません。
  :::

**パス内のグロブ**

複数のパスコンポーネントにグロブを使用できます。処理対象となるには、ファイルが存在し、パスパターン全体に一致する必要があります。ファイルのリストは`SELECT`実行時に決定されます(`CREATE`時ではありません)。

- `*` — `/`を除く任意の文字を任意の数(空文字列を含む)に置換します。
- `?` — 任意の1文字に置換します。
- `{some_string,another_string,yet_another_one}` — `'some_string'`、`'another_string'`、`'yet_another_one'`のいずれかの文字列に置換します。
- `{N..M}` — NからMまでの範囲内の任意の数値に置換します(両端を含む)。

`{}`を使用した構文は、[remote](../../../sql-reference/table-functions/remote.md)テーブル関数と同様です。

**例**

1.  HDFS上に以下のURIを持つTSV形式のファイルがいくつかあるとします:
    - 'hdfs://hdfs1:9000/some_dir/some_file_1'
    - 'hdfs://hdfs1:9000/some_dir/some_file_2'
    - 'hdfs://hdfs1:9000/some_dir/some_file_3'
    - 'hdfs://hdfs1:9000/another_dir/some_file_1'
    - 'hdfs://hdfs1:9000/another_dir/some_file_2'
    - 'hdfs://hdfs1:9000/another_dir/some_file_3'

1.  6つのファイルすべてで構成されるテーブルを作成する方法はいくつかあります:

<!-- -->

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

別の方法:

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

両方のディレクトリ内のすべてのファイルで構成されるテーブル(すべてのファイルはクエリで記述された形式とスキーマを満たす必要があります):

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
ファイルのリストに先頭ゼロ付きの数値範囲が含まれる場合は、各桁に対して個別に中括弧を使用した構文を使用するか、`?`を使用してください。
:::

**例**

`file000`、`file001`、...、`file999`という名前のファイルでテーブルを作成する場合:


```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```

## 設定 {#configuration}

GraphiteMergeTreeと同様に、HDFSエンジンはClickHouse設定ファイルを使用した拡張設定をサポートしています。使用できる設定キーは2つあります：グローバル（`hdfs`）とユーザーレベル（`hdfs_*`）です。グローバル設定が最初に適用され、その後ユーザーレベル設定が適用されます（存在する場合）。

```xml
<!-- HDFSエンジンタイプのグローバル設定オプション -->
<hdfs>
  <hadoop_kerberos_keytab>/tmp/keytab/clickhouse.keytab</hadoop_kerberos_keytab>
  <hadoop_kerberos_principal>clickuser@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
  <hadoop_security_authentication>kerberos</hadoop_security_authentication>
</hdfs>

<!-- ユーザー "root" 専用の設定 -->
<hdfs_root>
  <hadoop_kerberos_principal>root@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
</hdfs_root>
```

### 設定オプション {#configuration-options}

#### libhdfs3でサポートされるオプション {#supported-by-libhdfs3}


| **パラメータ**                                   | **デフォルト値**       |
| ----------------------------------------------- | ----------------------- |
| rpc_client_connect_tcpnodelay                   | true                    |
| dfs_client_read_shortcircuit                    | true                    |
| output_replace-datanode-on-failure              | true                    |
| input_notretry-another-node                     | false                   |
| input_localread_mappedfile                      | true                    |
| dfs_client_use_legacy_blockreader_local         | false                   |
| rpc_client_ping_interval                        | 10 \* 1000              |
| rpc_client_connect_timeout                      | 600 \* 1000             |
| rpc_client_read_timeout                         | 3600 \* 1000            |
| rpc_client_write_timeout                        | 3600 \* 1000            |
| rpc_client_socket_linger_timeout                | -1                      |
| rpc_client_connect_retry                        | 10                      |
| rpc_client_timeout                              | 3600 \* 1000            |
| dfs_default_replica                             | 3                       |
| input_connect_timeout                           | 600 \* 1000             |
| input_read_timeout                              | 3600 \* 1000            |
| input_write_timeout                             | 3600 \* 1000            |
| input_localread_default_buffersize              | 1 _ 1024 _ 1024         |
| dfs_prefetchsize                                | 10                      |
| input_read_getblockinfo_retry                   | 3                       |
| input_localread_blockinfo_cachesize             | 1000                    |
| input_read_max_retry                            | 60                      |
| output_default_chunksize                        | 512                     |
| output_default_packetsize                       | 64 \* 1024              |
| output_default_write_retry                      | 10                      |
| output_connect_timeout                          | 600 \* 1000             |
| output_read_timeout                             | 3600 \* 1000            |
| output_write_timeout                            | 3600 \* 1000            |
| output_close_timeout                            | 3600 \* 1000            |
| output_packetpool_size                          | 1024                    |
| output_heartbeat_interval                       | 10 \* 1000              |
| dfs_client_failover_max_attempts                | 15                      |
| dfs_client_read_shortcircuit_streams_cache_size | 256                     |
| dfs_client_socketcache_expiryMsec               | 3000                    |
| dfs_client_socketcache_capacity                 | 16                      |
| dfs_default_blocksize                           | 64 _ 1024 _ 1024        |
| dfs_default_uri                                 | "hdfs://localhost:9000" |
| hadoop_security_authentication                  | "simple"                |
| hadoop_security_kerberos_ticket_cache_path      | ""                      |
| dfs_client_log_severity                         | "INFO"                  |
| dfs_domain_socket_path                          | ""                      |

[HDFS設定リファレンス](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html)で一部のパラメータの説明を参照できます。

#### ClickHouse固有のパラメータ {#clickhouse-extras}

| **parameter**             | **default value** |
| ------------------------- | ----------------- |
| hadoop_kerberos_keytab    | ""                |
| hadoop_kerberos_principal | ""                |
| libhdfs3_conf             | ""                |

### 制限事項 {#limitations}

- `hadoop_security_kerberos_ticket_cache_path`と`libhdfs3_conf`はグローバル設定のみ可能で、ユーザー固有の設定には対応していません


## Kerberosサポート {#kerberos-support}

`hadoop_security_authentication`パラメータの値が`kerberos`の場合、ClickHouseはKerberos経由で認証します。
パラメータは[こちら](#clickhouse-extras)にあり、`hadoop_security_kerberos_ticket_cache_path`が役立つ場合があります。
libhdfs3の制限により、従来型のアプローチのみがサポートされており、
datanodeの通信はSASLによって保護されないことに注意してください(`HADOOP_SECURE_DN_USER`はこのようなセキュリティアプローチの信頼できる指標です)。
参考として`tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh`を使用してください。


`hadoop_kerberos_keytab`、`hadoop_kerberos_principal`、または`hadoop_security_kerberos_ticket_cache_path`が指定されている場合、Kerberos認証が使用されます。この場合、`hadoop_kerberos_keytab`と`hadoop_kerberos_principal`は必須です。

## HDFS Namenode HA サポート {#namenode-ha}

libhdfs3はHDFS namenode HAをサポートしています。

- HDFSノードから`hdfs-site.xml`を`/etc/clickhouse-server/`にコピーします。
- ClickHouse設定ファイルに以下を追加します:

```xml
  <hdfs>
    <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
  </hdfs>
```

- 次に、`hdfs-site.xml`の`dfs.nameservices`タグの値をHDFS URIのnamenodeアドレスとして使用します。例えば、`hdfs://appadmin@192.168.101.11:8020/abc/`を`hdfs://appadmin@my_nameservice/abc/`に置き換えます。


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。


## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り詰めることを許可します。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - フォーマットに接尾辞がある場合、挿入ごとに新しいファイルを作成することを許可します。デフォルトでは無効です。
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効です。

**関連項目**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
