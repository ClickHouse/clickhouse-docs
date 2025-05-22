import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# HDFS

<CloudNotSupportedBadge/>

该引擎通过允许在 ClickHouse 中管理 [HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) 上的数据，实现了与 [Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop) 生态系统的集成。该引擎类似于 [File](/engines/table-engines/special/file) 和 [URL](/engines/table-engines/special/url) 引擎，但提供了 Hadoop 特有的功能。

该功能不受 ClickHouse 工程师的支持，并且已知存在不稳定的质量。如果出现任何问题，请自行修复并提交拉取请求。

## 用法 {#usage}

```sql
ENGINE = HDFS(URI, format)
```

**引擎参数**

- `URI` - HDFS 中整个文件的 URI。`URI` 的路径部分可以包含通配符。在这种情况下，表将是只读的。
- `format` - 指定可用的文件格式之一。要执行 `SELECT` 查询，该格式必须支持输入；要执行 `INSERT` 查询，该格式必须支持输出。可用格式在 [Formats](/sql-reference/formats#formats-overview) 部分列出。
- [PARTITION BY expr]

### PARTITION BY {#partition-by}

`PARTITION BY` — 可选。在大多数情况下，您不需要分区键，如果需要，一般不需要比按月更细的分区键。分区不会加速查询（与 ORDER BY 表达式相对）。您永远不应使用过于细粒度的分区。不要按客户标识符或名称对数据进行分区（而是将客户标识符或名称作为 ORDER BY 表达式中的第一列）。

按月分区，请使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是类型为 [Date](/sql-reference/data-types/date.md) 的日期列。这里的分区名称使用 `"YYYYMM"` 格式。

**示例：**

**1.** 设置 `hdfs_engine_table` 表：

```sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** 填充文件：

```sql
INSERT INTO hdfs_engine_table VALUES ('one', 1), ('two', 2), ('three', 3)
```

**3.** 查询数据：

```sql
SELECT * FROM hdfs_engine_table LIMIT 2
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## 实现细节 {#implementation-details}

- 读取和写入可以并行进行。
- 不支持：
    - `ALTER` 和 `SELECT...SAMPLE` 操作。
    - 索引。
    - [Zero-copy](../../../operations/storing-data.md#zero-copy) 复制是可能的，但不推荐使用。

  :::note Zero-copy replication is not ready for production
  在 ClickHouse 22.8 版本及更高版本中，默认情况下禁用零拷贝复制。 不推荐将此功能用于生产环境。
  :::

**路径中的通配符**

多个路径组件可以包含通配符。要处理的文件必须存在并且匹配整个路径模式。在 `SELECT` 时确定文件列表（而非在 `CREATE` 时）。

- `*` — 替代除 `/` 外的任意数量的任意字符，包括空字符串。
- `?` — 替代任何单个字符。
- `{some_string,another_string,yet_another_one}` — 替代任何字符串 `'some_string', 'another_string', 'yet_another_one'`。
- `{N..M}` — 替代范围从 N 到 M 的任意数字，包括两个边界。

具有 `{}` 的结构类似于 [remote](../../../sql-reference/table-functions/remote.md) 表函数。

**示例**

1. 假设我们有几个 TSV 格式的文件，其在 HDFS 上的 URI 如下：

    - 'hdfs://hdfs1:9000/some_dir/some_file_1'
    - 'hdfs://hdfs1:9000/some_dir/some_file_2'
    - 'hdfs://hdfs1:9000/some_dir/some_file_3'
    - 'hdfs://hdfs1:9000/another_dir/some_file_1'
    - 'hdfs://hdfs1:9000/another_dir/some_file_2'
    - 'hdfs://hdfs1:9000/another_dir/some_file_3'

2. 有几种方法可以创建一个包含所有六个文件的表：

<!-- -->

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

另一种方法：

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

该表包含两个目录中的所有文件（所有文件应满足查询中描述的格式和模式）：

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
如果文件列表包含带有前导零的数字范围，则对每个数字单独使用大括号构造或使用 `?`。
:::

**示例**

创建一个包含名称为 `file000`、`file001`、...、`file999` 的文件的表：

```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```
## 配置 {#configuration}

与 GraphiteMergeTree 相似，HDFS 引擎支持使用 ClickHouse 配置文件进行扩展配置。您可以使用两个配置键：全局 (`hdfs`) 和用户级别 (`hdfs_*`)。全局配置首先应用，然后应用用户级别配置（如果存在）。

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

### 配置选项 {#configuration-options}

#### libhdfs3 支持的选项 {#supported-by-libhdfs3}

| **参数**                                         | **默认值**       |
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


[HDFS 配置参考](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html) 可能会解释某些参数。


#### ClickHouse 附加选项 {#clickhouse-extras}

| **参数**                                         | **默认值**       |
| -                                                  | -                    |
| hadoop\_kerberos\_keytab                               | ""                      |
| hadoop\_kerberos\_principal                            | ""                      |
| libhdfs3\_conf                                         | ""                      |

### 限制 {#limitations}
* `hadoop_security_kerberos_ticket_cache_path` 和 `libhdfs3_conf` 仅能为全局配置，而不能为用户特定配置

## Kerberos 支持 {#kerberos-support}

如果 `hadoop_security_authentication` 参数值为 `kerberos`，ClickHouse 通过 Kerberos 进行身份验证。
参数在 [这里](#clickhouse-extras)，`hadoop_security_kerberos_ticket_cache_path` 可能会有所帮助。
请注意，由于 libhdfs3 的限制，仅支持传统方法，数据节点通信未通过 SASL 保护（`HADOOP_SECURE_DN_USER` 是该安全方法的可靠指标）。请参考 `tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh`。

如果指定了 `hadoop_kerberos_keytab`、`hadoop_kerberos_principal` 或 `hadoop_security_kerberos_ticket_cache_path`，将使用 Kerberos 身份验证。在这种情况下，`hadoop_kerberos_keytab` 和 `hadoop_kerberos_principal` 是必需的。
## HDFS Namenode HA 支持 {#namenode-ha}

libhdfs3 支持 HDFS namenode HA。

- 将 `hdfs-site.xml` 从 HDFS 节点复制到 `/etc/clickhouse-server/`。
- 将以下部分添加到 ClickHouse 配置文件中：

```xml
<hdfs>
  <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
</hdfs>
```

- 然后使用 `hdfs-site.xml` 中 `dfs.nameservices` 标签的值作为 HDFS URI 中的 namenode 地址。例如，将 `hdfs://appadmin@192.168.101.11:8020/abc/` 替换为 `hdfs://appadmin@my_nameservice/abc/`。


## 虚拟列 {#virtual-columns}

- `_path` — 文件的路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。

## 存储设置 {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - 允许在插入到文件之前截断文件。默认情况下禁用。
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - 允许在每次插入时如果格式有后缀则创建新文件。默认情况下禁用。
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 允许在读取时跳过空文件。默认情况下禁用。

**另请参见**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
