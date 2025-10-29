---
'description': 'このエンジンは、データを ClickHouse を介して HDFS 上で管理することを可能にすることにより、Apache Hadoop
  エコシステムとの統合を提供します。このエンジンは、File エンジンおよび URL エンジンに似ていますが、Hadoop 特有の機能を提供します。'
'sidebar_label': 'HDFS'
'sidebar_position': 80
'slug': '/engines/table-engines/integrations/hdfs'
'title': 'HDFS'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# HDFS

<CloudNotSupportedBadge/>

このエンジンは、ClickHouseを介して[HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)上のデータを管理することで、[Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop)エコシステムとの統合を提供します。このエンジンは、[File](/engines/table-engines/special/file)および[URL](/engines/table-engines/special/url)エンジンと似ていますが、Hadoop特有の機能を提供します。

この機能はClickHouseエンジニアによってサポートされておらず、品質が不安定であることが知られています。問題が発生した場合は、自分で修正し、プルリクエストを提出してください。

## 使用方法 {#usage}

```sql
ENGINE = HDFS(URI, format)
```

**エンジンパラメータ**

- `URI` - HDFSにおけるファイルの全URI。`URI`のパス部分にはグロブが含まれる場合があります。この場合、テーブルは読み取り専用になります。
- `format` - 利用可能なファイル形式のいずれかを指定します。`SELECT`クエリを実行するには、形式が入力用にサポートされていなければならず、`INSERT`クエリを実行するには出力用にサポートされていなければなりません。利用可能な形式は、[Formats](/sql-reference/formats#formats-overview)セクションにリストされています。
- [PARTITION BY expr]

### PARTITION BY {#partition-by}

`PARTITION BY` — オプションです。ほとんどの場合、パーティションキーは必要ありません。必要であれば、一般的に月単位のパーティションキー以上の詳細は必要ありません。パーティショニングは、クエリを高速化しません（ORDER BY式とは対照的です）。過度に詳細なパーティショニングは決して使用しないでください。クライアント識別子や名前でデータをパーティションせず（その代わりに、クライアント識別子や名前をORDER BY式の最初のカラムにします）。

月単位で分割するには、`toYYYYMM(date_column)`式を使用します。ここで、`date_column`は[Date](/sql-reference/data-types/date.md)型の日付を持つカラムです。パーティション名はここで`"YYYYMM"`形式になります。

**例:**

**1.** `hdfs_engine_table`テーブルを設定します:

```sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** ファイルを埋め込みます:

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

- 読み込みと書き込みは並行で行うことができます。
- サポートされていないもの:
  - `ALTER`および`SELECT...SAMPLE`操作。
  - インデックス。
  - [ゼロコピー](../../../operations/storing-data.md#zero-copy)レプリケーションは可能ですが、推奨されません。

  :::note ゼロコピーのレプリケーションは本番環境用ではありません
  ゼロコピーのレプリケーションは、ClickHouseバージョン22.8以降ではデフォルトで無効です。この機能は本番環境での使用は推奨されません。
  :::

**パスのグロブ**

複数のパスコンポーネントにグロブを含めることができます。処理されるファイルは存在し、全てのパスパターンに一致している必要があります。ファイルのリストは`SELECT`中に決定されます（`CREATE`の瞬間ではありません）。

- `*` — 空の文字列を含む`/`以外の任意の文字の任意の数を置き換えます。
- `?` — 任意の1文字を置き換えます。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'`のいずれかを置き換えます。
- `{N..M}` — NからMまでの範囲内の任意の数を含めて置き換えます。

`{}`を使った構造は、[remote](../../../sql-reference/table-functions/remote.md)テーブル関数に似ています。

**例**

1.  HDFS上に以下のURIを持つTSV形式のファイルがいくつかあるとします:

    - 'hdfs://hdfs1:9000/some_dir/some_file_1'
    - 'hdfs://hdfs1:9000/some_dir/some_file_2'
    - 'hdfs://hdfs1:9000/some_dir/some_file_3'
    - 'hdfs://hdfs1:9000/another_dir/some_file_1'
    - 'hdfs://hdfs1:9000/another_dir/some_file_2'
    - 'hdfs://hdfs1:9000/another_dir/some_file_3'

1.  すべての6ファイルを含むテーブルを作成する方法はいくつかあります:

<!-- -->

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

別の方法:

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

テーブルは両方のディレクトリにあるすべてのファイルで構成されます（すべてのファイルはクエリで説明された形式およびスキーマに一致する必要があります）:

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
ファイルのリストに先頭0を含む数値範囲がある場合は、各桁ごとにブレースを使った構造を使用するか、`?`を使用してください。
:::

**例**

`file000`, `file001`, ... , `file999`という名前のファイルを持つテーブルを作成します:

```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```
## 設定 {#configuration}

GraphiteMergeTreeに似て、HDFSエンジンはClickHouseの設定ファイルを使用した拡張設定をサポートしています。使用できる設定キーは、グローバル(`hdfs`)およびユーザーレベル(`hdfs_*`)の2つです。グローバル設定が最初に適用され、その後にユーザーレベルの設定が適用されます（存在する場合）。

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

### 設定オプション {#configuration-options}

#### libhdfs3によってサポートされる {#supported-by-libhdfs3}

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

[HDFS 構成リファレンス](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html)は、いくつかのパラメータについて説明しています。

#### ClickHouseの追加オプション {#clickhouse-extras}

| **parameter**                                         | **default value**       |
| -                                                  | -                    |
|hadoop\_kerberos\_keytab                               | ""                      |
|hadoop\_kerberos\_principal                            | ""                      |
|libhdfs3\_conf                                         | ""                      |

### 制限事項 {#limitations}
* `hadoop_security_kerberos_ticket_cache_path`および`libhdfs3_conf`はグローバルのみで、ユーザ固有ではありません。

## Kerberosサポート {#kerberos-support}

もし`hadoop_security_authentication`パラメータが`kerberos`の値を持っている場合、ClickHouseはKerberosを介して認証します。
パラメータは[ここ](#clickhouse-extras)にあり、`hadoop_security_kerberos_ticket_cache_path`が役立つ場合があります。
libhdfs3の制限により、古い方法のみがサポートされていますので、datanodeの通信はSASLによって保護されていません（`HADOOP_SECURE_DN_USER`は、そのようなセキュリティアプローチの信頼できる指標です）。参考のために、`tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh`を使用してください。

`hadoop_kerberos_keytab`、`hadoop_kerberos_principal`、または`hadoop_security_kerberos_ticket_cache_path`が指定されている場合は、Kerberos認証が使用されます。この場合、`hadoop_kerberos_keytab`および`hadoop_kerberos_principal`は必須です。
## HDFS Namenode HAサポート {#namenode-ha}

libhdfs3はHDFS namenode HAをサポートしています。

- HDFSノードから`hdfs-site.xml`を`/etc/clickhouse-server/`にコピーします。
- 次の部分をClickHouse設定ファイルに追加します:

```xml
<hdfs>
  <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
</hdfs>
```

- その後、`hdfs-site.xml`の`dfs.nameservices`タグの値をHDFS URIのnamenodeアドレスとして使用します。たとえば、`hdfs://appadmin@192.168.101.11:8020/abc/`を`hdfs://appadmin@my_nameservice/abc/`に置き換えます。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合は、値は`NULL`です。
- `_time` — ファイルの最終更新時刻。タイプ: `Nullable(DateTime)`。時刻が不明な場合は、値は`NULL`です。

## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入する前にファイルを切り捨てることを可能にします。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - フォーマットにサフィックスがある場合、各挿入時に新しいファイルを作成できます。デフォルトでは無効です。
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り中に空のファイルをスキップすることを可能にします。デフォルトでは無効です。

**関連情報**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
