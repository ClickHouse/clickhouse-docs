---
description: 'このエンジンは、ClickHouseを介してHDFS上のデータを管理することで、Apache Hadoopエコシステムとの統合を提供します。このエンジンは、FileおよびURLエンジンに似ていますが、Hadoop特有の機能を提供します。'
sidebar_label: 'HDFS'
sidebar_position: 80
slug: /engines/table-engines/integrations/hdfs
title: 'HDFS'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# HDFS

<CloudNotSupportedBadge/>

このエンジンは、[Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop)エコシステムとの統合を提供し、ClickHouseを介して[HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)上のデータを管理できるようにします。このエンジンは、[File](/engines/table-engines/special/file)および[URL](/engines/table-engines/special/url)エンジンに似ていますが、Hadoop特有の機能を提供します。

この機能はClickHouseエンジニアによってサポートされておらず、品質が不安定であることが知られています。問題が発生した場合は、自分で修正し、プルリクエストを送信してください。

## 使用法 {#usage}

```sql
ENGINE = HDFS(URI, format)
```

**エンジンパラメーター**

- `URI` - HDFS内のファイル全体のURI。`URI`のパス部分はワイルドカードを含む場合があります。この場合、テーブルは読み取り専用になります。
- `format` - 利用可能なファイル形式の1つを指定します。`SELECT`クエリを実行するには、形式が入力としてサポートされている必要があり、`INSERT`クエリを実行するには、出力としてサポートされている必要があります。利用可能な形式は、[Formats](/sql-reference/formats#formats-overview)セクションにリストされています。
- [PARTITION BY expr]

### PARTITION BY {#partition-by}

`PARTITION BY` — オプションです。ほとんどの場合、パーティションキーは必要ありません。必要な場合でも、一般的に月単位よりも粒度の細かいパーティションキーは必要ありません。パーティショニングはクエリを高速化しません（ORDER BY式とは対照的に）。あまり細かいパーティショニングは使用しないでください。クライアントの識別子や名前でデータをパーティショニングしないでください（代わりに、クライアントの識別子や名前をORDER BY式の最初のカラムにしてください）。

月単位でパーティショニングするには、`toYYYYMM(date_column)`式を使用します。この場合、`date_column`は[Date](/sql-reference/data-types/date.md)型の日付を持つカラムです。ここでのパーティション名は`"YYYYMM"`形式です。

**例:**

**1.** `hdfs_engine_table`テーブルをセットアップします：

```sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** ファイルを埋めます：

```sql
INSERT INTO hdfs_engine_table VALUES ('one', 1), ('two', 2), ('three', 3)
```

**3.** データをクエリします：

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

- 読み取りと書き込みは並行して行うことができます。
- サポートされていません：
    - `ALTER`および`SELECT...SAMPLE`操作。
    - インデックス。
    - [Zero-copy](../../../operations/storing-data.md#zero-copy)レプリケーションは可能ですが、推奨されません。

  :::note Zero-copyレプリケーションは本番環境での使用に適していない
  ClickHouseバージョン22.8以降ではZero-copyレプリケーションがデフォルトで無効になっています。この機能は本番環境での使用は推奨されません。
  :::

**パスのワイルドカード**

複数のパスコンポーネントにワイルドカードを使用できます。処理されるファイルは存在し、完全なパスパターンと一致する必要があります。ファイルのリストは`SELECT`中に決定されます（`CREATE`の直後ではありません）。

- `*` — 空文字列を含む任意の数の任意の文字を置き換えます。
- `?` — 単一の文字を置き換えます。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかを置き換えます。
- `{N..M}` — NからMまでの範囲内の任意の数を置き換えます。

`{}`を使用した構文は、[remote](../../../sql-reference/table-functions/remote.md)テーブル関数に似ています。

**例**

1.  HDFS上に次のURIでTSV形式のファイルがいくつかあるとします：

    - 'hdfs://hdfs1:9000/some_dir/some_file_1'
    - 'hdfs://hdfs1:9000/some_dir/some_file_2'
    - 'hdfs://hdfs1:9000/some_dir/some_file_3'
    - 'hdfs://hdfs1:9000/another_dir/some_file_1'
    - 'hdfs://hdfs1:9000/another_dir/some_file_2'
    - 'hdfs://hdfs1:9000/another_dir/some_file_3'

1.  これら6つのファイルで構成されるテーブルを作成する方法は複数あります：

<!-- -->

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

別の方法：

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

テーブルは両方のディレクトリ内のすべてのファイルで構成されています（すべてのファイルはクエリで説明された形式とスキーマを満たす必要があります）：

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
ファイルのリストに先頭ゼロを含む数値範囲がある場合は、各桁に対してブレースを使用するか、`?`を使用してください。
:::

**例**

`file000`、`file001`、...、`file999`という名前のファイルでテーブルを作成します：

```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```
## 設定 {#configuration}

GraphiteMergeTreeと同様に、HDFSエンジンはClickHouse設定ファイルを使用した拡張設定をサポートしています。使用できる2つの設定キーがあります：グローバル（`hdfs`）およびユーザーレベル（`hdfs_*`）。グローバル設定は最初に適用され、その後ユーザーレベルの設定が適用されます（存在する場合）。

```xml
<!-- HDFSエンジンタイプのグローバル設定オプション -->
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

#### libhdfs3によってサポートされている {#supported-by-libhdfs3}


| **パラメータ**                                         | **デフォルト値**       |
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
| output\_heartbeat\_interval                           | 10 * 1000               |
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


[HDFS設定リファレンス](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html)では、いくつかのパラメータについて説明している場合があります。


#### ClickHouse拡張 {#clickhouse-extras}

| **パラメータ**                                         | **デフォルト値**       |
| -                                                  | -                    |
| hadoop\_kerberos\_keytab                               | ""                      |
| hadoop\_kerberos\_principal                            | ""                      |
| libhdfs3\_conf                                         | ""                      |

### 制限事項 {#limitations}
* `hadoop_security_kerberos_ticket_cache_path`および`libhdfs3_conf`はグローバルのみに設定できて、ユーザー特有にはできません。

## Kerberosサポート {#kerberos-support}

`hadoop_security_authentication`パラメータが`kerberos`の値を持つ場合、ClickHouseはKerberosを介して認証を行います。
パラメータは[こちら](#clickhouse-extras)にあり、`hadoop_security_kerberos_ticket_cache_path`が役立つ場合があります。
libhdfs3の制限のため、古典的なアプローチのみがサポートされていることに注意してください。
データノード間の通信はSASLによって保護されていません（`HADOOP_SECURE_DN_USER`はそのようなセキュリティアプローチの信頼できる指標です）。リファレンスのために`tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh`を使用してください。

`hadoop_kerberos_keytab`、`hadoop_kerberos_principal`、または`hadoop_security_kerberos_ticket_cache_path`が指定されている場合、Kerberos認証が使用されます。この場合、`hadoop_kerberos_keytab`および`hadoop_kerberos_principal`は必須です。
## HDFS Namenode HAサポート {#namenode-ha}

libhdfs3はHDFS Namenode HAをサポートしています。

- HDFSノードから`hdfs-site.xml`を`/etc/clickhouse-server/`にコピーします。
- 次の部分をClickHouse設定ファイルに追加します：

```xml
  <hdfs>
    <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
  </hdfs>
```

- その後、HDFS URIのNamenodeアドレスに`hdfs-site.xml`の`dfs.nameservices`タグの値を使用します。例えば、`hdfs://appadmin@192.168.101.11:8020/abc/`を`hdfs://appadmin@my_nameservice/abc/`に置き換えます。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイル名。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終変更日時。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は`NULL`です。

## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り詰めることを許可します。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - 形式にサフィックスがある場合、各挿入で新しいファイルを作成することを許可します。デフォルトでは無効です。
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 読み込み時に空のファイルをスキップすることを許可します。デフォルトでは無効です。

**参照先**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
