---
'description': 'This engine provides integration with the Apache Hadoop ecosystem
  by allowing to manage data on HDFS via ClickHouse. This engine is similar to the
  File and URL engines, but provides Hadoop-specific features.'
'sidebar_label': 'HDFS'
'sidebar_position': 80
'slug': '/engines/table-engines/integrations/hdfs'
'title': 'HDFS'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# HDFS

<CloudNotSupportedBadge/>

このエンジンは、ClickHouse経由で[HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)上のデータを管理することにより、[Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop)エコシステムとの統合を提供します。このエンジンは、[File](/engines/table-engines/special/file)および[URL](/engines/table-engines/special/url)エンジンに似ていますが、Hadoop特有の機能を提供します。

この機能はClickHouseエンジニアによってサポートされておらず、品質が不安定であることが知られています。問題が発生した場合は、自分で修正し、プルリクエストを提出してください。

## 使用法 {#usage}

```sql
ENGINE = HDFS(URI, format)
```

**エンジンパラメータ**

- `URI` - HDFS内のファイルの完全 URI。`URI`のパス部分にはグロブが含まれる場合があります。この場合、テーブルは読み取り専用になります。
- `format` - 利用可能なファイル形式のいずれかを指定します。`SELECT`クエリを実行するには、形式が入力に対してサポートされている必要があり、`INSERT`クエリを実行するには、出力に対してサポートされている必要があります。利用可能な形式については、[Formats](/sql-reference/formats#formats-overview)セクションに一覧があります。
- [PARTITION BY expr]

### PARTITION BY {#partition-by}

`PARTITION BY` — オプション。ほとんどのケースではパーティションキーは必要ありませんが、必要な場合でも、一般的には月単位以上の詳細なパーティションキーを必要としません。パーティショニングはクエリの高速化には寄与しません（ORDER BY式とは対照的です）。詳細なパーティショニングは決して使用しないでください。クライアント識別子や名前でデータをパーティショニングしないでください（代わりに、クライアント識別子や名前をORDER BY式の最初のカラムにしてください）。

月単位でのパーティショニングには、`toYYYYMM(date_column)`式を使用します。ここで`date_column`は[Date](/sql-reference/data-types/date.md)型の日付を含むカラムです。ここでのパーティション名は`"YYYYMM"`形式になります。

**例:**

**1.** `hdfs_engine_table`テーブルを設定します:

```sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** ファイルを埋めます:

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

## 実装詳細 {#implementation-details}

- 読み書きは並列で行うことができます。
- サポートされていないもの：
    - `ALTER`および`SELECT...SAMPLE`操作。
    - インデックス。
    - [ゼロコピー](../../../operations/storing-data.md#zero-copy)レプリケーションは可能ですが、推奨されません。

  :::note ゼロコピーレプリケーションは本番環境には未対応
  ゼロコピーレプリケーションは、ClickHouse バージョン 22.8 以降でデフォルトで無効です。この機能は本番環境での使用は推奨されていません。
  :::

**パスにおけるグロブ**

複数のパスコンポーネントにグロブを使用できます。処理されるファイルは存在し、全体のパスパターンに一致する必要があります。ファイルのリストは`SELECT`時に決定されます（`CREATE`時ではありません）。

- `*` — `/`を含む任意の文字の任意の数を置き換え、空文字列も含みます。
- `?` — 任意の単一文字を置き換えます。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかを置き換えます。
- `{N..M}` — NからMまでの範囲の任意の数を置き換えます（両端を含む）。

`{}`を使用した構造は、[リモート](../../../sql-reference/table-functions/remote.md)テーブル関数に似ています。

**例**

1.  HDFS上に以下のURIを持つTSV形式のいくつかのファイルがあるとします:

    - 'hdfs://hdfs1:9000/some_dir/some_file_1'
    - 'hdfs://hdfs1:9000/some_dir/some_file_2'
    - 'hdfs://hdfs1:9000/some_dir/some_file_3'
    - 'hdfs://hdfs1:9000/another_dir/some_file_1'
    - 'hdfs://hdfs1:9000/another_dir/some_file_2'
    - 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  すべての6つのファイルを含むテーブルを作成する方法はいくつかあります:

<!-- -->

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

別の方法:

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

テーブルは両方のディレクトリ内のすべてのファイルで構成されます（すべてのファイルは、クエリで説明されている形式およびスキーマに一致する必要があります）:

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
ファイルのリストに先頭ゼロを伴う数値範囲が含まれている場合、それぞれの桁に対して波括弧を使うか、`?`を使用してください。
:::

**例**

`file000`, `file001`, ... , `file999` という名前のファイルを持つテーブルを作成します:

```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```

## 設定 {#configuration}

GraphiteMergeTreeに似て、HDFSエンジンはClickHouse設定ファイルを使った拡張設定をサポートしています。使用できる設定キーは2つあります：グローバル（`hdfs`）とユーザーレベル（`hdfs_*`）。グローバル設定が最初に適用され、その後ユーザーレベルの設定が存在する場合に適用されます。

```xml
<!-- HDFSエンジンタイプに対するグローバル設定オプション -->
<hdfs>
  <hadoop_kerberos_keytab>/tmp/keytab/clickhouse.keytab</hadoop_kerberos_keytab>
  <hadoop_kerberos_principal>clickuser@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
  <hadoop_security_authentication>kerberos</hadoop_security_authentication>
</hdfs>

<!-- ユーザー"root"専用の設定 -->
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

[HDFS Configuration Reference](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html)は、一部のパラメータについて説明しています。

#### ClickHouseの追加機能 {#clickhouse-extras}

| **パラメータ**                                         | **デフォルト値**       |
| -                                                  | -                    |
| hadoop\_kerberos\_keytab                               | ""                      |
| hadoop\_kerberos\_principal                            | ""                      |
| libhdfs3\_conf                                         | ""                      |

### 制限事項 {#limitations}
* `hadoop_security_kerberos_ticket_cache_path`および`libhdfs3_conf`はグローバル専用で、ユーザー専用ではありません。

## Kerberosサポート {#kerberos-support}

`hadoop_security_authentication`パラメータが`kerberos`の値を持つ場合、ClickHouseはKerberosを介して認証します。
パラメータは[こちら](#clickhouse-extras)にあり、`hadoop_security_kerberos_ticket_cache_path`が役立つ場合があります。
libhdfs3の制限により、古典的なアプローチのみがサポートされているため、データノードの通信はSASLによって保護されていません（`HADOOP_SECURE_DN_USER`はそのようなセキュリティアプローチの信頼できる指標です）。リファレンスとして`tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh`を使用してください。

`hadoop_kerberos_keytab`、`hadoop_kerberos_principal`または`hadoop_security_kerberos_ticket_cache_path`が指定されている場合、Kerberos認証が使用されます。この場合、`hadoop_kerberos_keytab`と`hadoop_kerberos_principal`は必須です。

## HDFS Namenode HAサポート {#namenode-ha}

libhdfs3はHDFS namenode HAをサポートしています。

- HDFSノードから`hdfs-site.xml`を`/etc/clickhouse-server/`へコピーします。
- ClickHouse設定ファイルに以下の部分を追加します:

```xml
  <hdfs>
    <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
  </hdfs>
```

- その後、`hdfs-site.xml`の`dfs.nameservices`タグの値をHDFS URIのnamenodeアドレスとして使用します。たとえば、`hdfs://appadmin@192.168.101.11:8020/abc/`を`hdfs://appadmin@my_nameservice/abc/`に置き換えます。

## バーチャルカラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイル名。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終変更時間。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は`NULL`です。

## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り捨てることを許可します。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - 各挿入時にサフィックスのある新しいファイルを作成することを許可します。デフォルトでは無効です。
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効です。

**関連項目**

- [バーチャルカラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
