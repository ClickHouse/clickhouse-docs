---
slug: /engines/table-engines/integrations/hdfs
sidebar_position: 80
sidebar_label: HDFS
title: "HDFS"
description: "このエンジンは、ClickHouseを介してHDFS上のデータを管理することを可能にすることにより、Apache Hadoopエコシステムとの統合を提供します。このエンジンはFileおよびURLエンジンに似ていますが、Hadoop特有の機能を提供します。"
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# HDFS

<CloudNotSupportedBadge/>

このエンジンは、ClickHouseを介して[HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)上のデータを管理することを可能にすることにより、[Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop)エコシステムとの統合を提供します。このエンジンは、[File](../../../engines/table-engines/special/file.md#table_engines-file)および[URL](../../../engines/table-engines/special/url.md#table_engines-url)エンジンに似ていますが、Hadoop特有の機能を提供します。

この機能はClickHouseエンジニアによってサポートされておらず、その品質は不安定であることが知られています。問題が発生した場合は、自分で修正し、プルリクエストを提出してください。

## 使用法 {#usage}

``` sql
ENGINE = HDFS(URI, format)
```

**エンジンパラメータ**

- `URI` - HDFS内の完全なファイルURI。`URI`のパス部分には、グロブを含むことができます。この場合、テーブルは読み取り専用になります。
- `format` - 利用可能なファイルフォーマットの1つを指定します。`SELECT`クエリを実行するには、フォーマットが入力用にサポートされている必要があり、`INSERT`クエリを実行するには出力用にサポートされている必要があります。利用可能なフォーマットは、[フォーマット](../../../interfaces/formats.md#formats)セクションにリストされています。
- [PARTITION BY expr]

### PARTITION BY {#partition-by}

`PARTITION BY` — オプションです。ほとんどの場合、パーティションキーは必要ありません。必要な場合でも、通常は月ごとより詳細なパーティションキーは必要ありません。パーティション分割はクエリを高速化しません（ORDER BY表現とは対照的です）。必要以上に細かいパーティション分割は使用すべきではありません。クライアント識別子や名前でデータをパーティション分割しないでください（代わりに、クライアント識別子や名前をORDER BY式の最初のカラムにしてください）。

月ごとにパーティションを分割するには、`toYYYYMM(date_column)`式を使用します。ここで、`date_column`は[Date](/sql-reference/data-types/date.md)型の日付を持つカラムです。パーティション名はここで`"YYYYMM"`形式になります。

**例:**

**1.** `hdfs_engine_table`テーブルを設定します:

``` sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** ファイルを埋めます:

``` sql
INSERT INTO hdfs_engine_table VALUES ('one', 1), ('two', 2), ('three', 3)
```

**3.** データをクエリします:

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

- 読み取りと書き込みは並列で行うことができます。
- サポートされていません：
    - `ALTER`および`SELECT...SAMPLE`操作。
    - インデックス。
    - [ゼロコピー](../../../operations/storing-data.md#zero-copy)レプリケーションは可能ですが、推奨されません。

  :::note ゼロコピー複製は生産用には準備ができていません
  ゼロコピー複製はClickHouseバージョン22.8以降でデフォルトで無効です。この機能は本番環境での使用は推奨されません。
  :::

**パス内でのグロブ**

複数のパスコンポーネントにグロブを使用できます。処理されるファイルは存在する必要があり、全体のパスパターンに一致する必要があります。ファイルのリストは`SELECT`の際に決定され（`CREATE`の時点ではありません）、以下のように機能します。

- `*` — `/`を除く任意の文字が0回以上置き換え可能。空文字列も含む。
- `?` — 任意の1文字が置き換え可能。
- `{some_string,another_string,yet_another_one}` — 文字列のいずれかが置き換え可能です。`'some_string', 'another_string', 'yet_another_one'`のいずれか。
- `{N..M}` — NからMまでの範囲の任意の数字が置き換え可能。両端を含みます。

`{}`を使用した構造は、[リモート](../../../sql-reference/table-functions/remote.md)テーブル関数に似ています。

**例**

1. TSV形式で、HDFS上に以下のURIを持つ複数のファイルがあるとしましょう:

    - 'hdfs://hdfs1:9000/some_dir/some_file_1'
    - 'hdfs://hdfs1:9000/some_dir/some_file_2'
    - 'hdfs://hdfs1:9000/some_dir/some_file_3'
    - 'hdfs://hdfs1:9000/another_dir/some_file_1'
    - 'hdfs://hdfs1:9000/another_dir/some_file_2'
    - 'hdfs://hdfs1:9000/another_dir/some_file_3'

1. 6つのファイルすべてを含むテーブルを作成する方法はいくつかあります：

``` sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

別の方法：

``` sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

両方のディレクトリ内のすべてのファイルを含むテーブル（すべてのファイルはクエリで説明されたフォーマットおよびスキーマを満たす必要があります）：

``` sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
ファイルのリストに先頭ゼロを含む数値範囲が含まれている場合は、各桁ごとにブレースを使用した構造を使うか、`?`を使用してください。
:::

**例**

`file000`, `file001`, ..., `file999`という名前のファイルを持つテーブルを作成します:

``` sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```
## 設定 {#configuration}

GraphiteMergeTreeに似て、HDFSエンジンはClickHouseの設定ファイルを使用して拡張設定をサポートします。使用できる設定キーは2つあります：グローバル (`hdfs`) およびユーザーレベル (`hdfs_*`)。グローバル設定は最初に適用され、その後ユーザーレベルの設定が適用されます（存在する場合）。

``` xml
  <!-- HDFSエンジンタイプのためのグローバル設定オプション -->
  <hdfs>
	<hadoop_kerberos_keytab>/tmp/keytab/clickhouse.keytab</hadoop_kerberos_keytab>
	<hadoop_kerberos_principal>clickuser@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
	<hadoop_security_authentication>kerberos</hadoop_security_authentication>
  </hdfs>

  <!-- ユーザー "root" に特有の設定 -->
  <hdfs_root>
	<hadoop_kerberos_principal>root@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
  </hdfs_root>
```

### 設定オプション {#configuration-options}

#### libhdfs3によってサポートされている {#supported-by-libhdfs3}

| **parameter**                                         | **default value**       |
| -                                                  | -                    |
| rpc_client_connect_tcpnodelay                      | true                    |
| dfs_client_read_shortcircuit                       | true                    |
| output_replace-datanode-on-failure                   | true                    |
| input_notretry-another-node                          | false                   |
| input_localread_mappedfile                          | true                    |
| dfs_client_use_legacy_blockreader_local          | false                   |
| rpc_client_ping_interval                           | 10  * 1000              |
| rpc_client_connect_timeout                         | 600 * 1000              |
| rpc_client_read_timeout                            | 3600 * 1000             |
| rpc_client_write_timeout                           | 3600 * 1000             |
| rpc_client_socket_linger_timeout                  | -1                      |
| rpc_client_connect_retry                           | 10                      |
| rpc_client_timeout                                  | 3600 * 1000             |
| dfs_default_replica                                 | 3                       |
| input_connect_timeout                               | 600 * 1000              |
| input_read_timeout                                  | 3600 * 1000             |
| input_write_timeout                                 | 3600 * 1000             |
| input_localread_default_buffersize                 | 1 * 1024 * 1024         |
| dfs_prefetchsize                                     | 10                      |
| input_read_getblockinfo_retry                      | 3                       |
| input_localread_blockinfo_cachesize                | 1000                    |
| input_read_max_retry                               | 60                      |
| output_default_chunksize                            | 512                     |
| output_default_packetsize                           | 64 * 1024               |
| output_default_write_retry                         | 10                      |
| output_connect_timeout                              | 600 * 1000              |
| output_read_timeout                                 | 3600 * 1000             |
| output_write_timeout                                | 3600 * 1000             |
| output_close_timeout                                | 3600 * 1000             |
| output_packetpool_size                              | 1024                    |
| output_heartbeat_interval                          | 10 * 1000               |
| dfs_client_failover_max_attempts                  | 15                      |
| dfs_client_read_shortcircuit_streams_cache_size | 256                     |
| dfs_client_socketcache_expiryMsec                  | 3000                    |
| dfs_client_socketcache_capacity                    | 16                      |
| dfs_default_blocksize                               | 64 * 1024 * 1024        |
| dfs_default_uri                                     | "hdfs://localhost:9000" |
| hadoop_security_authentication                      | "simple"                |
| hadoop_security_kerberos_ticket_cache_path       | ""                      |
| dfs_client_log_severity                            | "INFO"                  |
| dfs_domain_socket_path                             | ""                      |

[HDFS 設定リファレンス](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html)は、いくつかのパラメータを説明しているかもしれません。

#### ClickHouseの追加オプション {#clickhouse-extras}

| **parameter**                                         | **default value**       |
| -                                                  | -                    |
|hadoop_kerberos_keytab                               | ""                      |
|hadoop_kerberos_principal                            | ""                      |
|libhdfs3_conf                                         | ""                      |

### 制限事項 {#limitations}
* `hadoop_security_kerberos_ticket_cache_path` と `libhdfs3_conf` はグローバルのみ、ユーザー特有ではありません。

## Kerberosサポート {#kerberos-support}

`hadoop_security_authentication`パラメータの値が`kerberos`である場合、ClickHouseはKerberosを介して認証します。
パラメータは[ここ](#clickhouse-extras)にあり、`hadoop_security_kerberos_ticket_cache_path`が役立つかもしれません。
libhdfs3の制限により、古い方法のアプローチのみがサポートされていることに注意してください。
データノード通信はSASLによって保護されておらず（`HADOOP_SECURE_DN_USER`はそのようなセキュリティアプローチの信頼できる指標です）。
参照のために`tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh`を使用してください。

`hadoop_kerberos_keytab`, `hadoop_kerberos_principal`, または `hadoop_security_kerberos_ticket_cache_path`が指定されている場合、Kerberos認証が使用されます。この場合、`hadoop_kerberos_keytab`および `hadoop_kerberos_principal`は必須です。
## HDFS Namenode HAサポート {#namenode-ha}

libhdfs3はHDFS namenode HAをサポートしています。

- HDFSノードから`hdfs-site.xml`を`/etc/clickhouse-server/`にコピーします。
- ClickHouse設定ファイルに次の部分を追加します：

``` xml
  <hdfs>
    <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
  </hdfs>
```

- 次に、HDFS URIのnamenodeアドレスとして`hdfs-site.xml`の`dfs.nameservices`タグの値を使用します。例えば、`hdfs://appadmin@192.168.101.11:8020/abc/`を`hdfs://appadmin@my_nameservice/abc/`に置き換えます。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイルの名前。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は`NULL`です。

## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り詰めることを許可します。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - フォーマットにサフィックスがある場合、各挿入時に新しいファイルを作成することを許可します。デフォルトでは無効です。
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り時に空ファイルをスキップすることを許可します。デフォルトでは無効です。

**参考情報**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
