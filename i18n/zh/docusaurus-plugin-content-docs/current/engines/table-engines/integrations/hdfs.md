---
description: '该引擎通过允许使用 ClickHouse 管理 HDFS 上的数据，与 Apache Hadoop 生态系统集成。该引擎类似于 File 和 URL 引擎，但提供了 Hadoop 特有的功能。'
sidebar_label: 'HDFS'
sidebar_position: 80
slug: /engines/table-engines/integrations/hdfs
title: 'HDFS 表引擎'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# HDFS 表引擎

<CloudNotSupportedBadge/>

该引擎通过允许使用 ClickHouse 管理 [HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) 上的数据，与 [Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop) 生态系统集成。该引擎类似于 [File](/engines/table-engines/special/file) 和 [URL](/engines/table-engines/special/url) 引擎，但提供了面向 Hadoop 的特定功能。

该功能不由 ClickHouse 工程团队维护，且已知质量较为粗糙。如遇任何问题，请自行修复并提交 pull request。



## 用法 {#usage}

```sql
ENGINE = HDFS(URI, format)
```

**引擎参数**

- `URI` - HDFS 中的完整文件 URI。`URI` 的路径部分可以包含通配符。在这种情况下,表将为只读。
- `format` - 指定可用的文件格式之一。要执行 `SELECT` 查询,格式必须支持输入;要执行 `INSERT` 查询,格式必须支持输出。可用格式列表请参见 [Formats](/sql-reference/formats#formats-overview) 部分。
- [PARTITION BY expr]

### PARTITION BY {#partition-by}

`PARTITION BY` — 可选参数。在大多数情况下不需要分区键,即使需要,通常也不需要比按月更细的分区粒度。分区不会加速查询(与 ORDER BY 表达式相反)。不应使用过细的分区粒度。不要按客户端标识符或名称对数据进行分区(而应将客户端标识符或名称作为 ORDER BY 表达式中的第一列)。

对于按月分区,使用 `toYYYYMM(date_column)` 表达式,其中 `date_column` 是 [Date](/sql-reference/data-types/date.md) 类型的日期列。此处的分区名称采用 `"YYYYMM"` 格式。

**示例:**

**1.** 创建 `hdfs_engine_table` 表:

```sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** 填充数据:

```sql
INSERT INTO hdfs_engine_table VALUES ('one', 1), ('two', 2), ('three', 3)
```

**3.** 查询数据:

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

- 支持并行读写。
- 不支持：
  - `ALTER` 和 `SELECT...SAMPLE` 操作。
  - 索引。
  - [零拷贝](../../../operations/storing-data.md#zero-copy)复制虽然可行,但不推荐使用。

  :::note 零拷贝复制尚未准备好用于生产环境
  在 ClickHouse 22.8 及更高版本中,零拷贝复制默认处于禁用状态。不推荐在生产环境中使用此功能。
  :::

**路径中的通配符**

路径的多个组件可以包含通配符。要处理的文件必须存在且匹配完整的路径模式。文件列表在执行 `SELECT` 时确定(而非在 `CREATE` 时)。

- `*` — 匹配除 `/` 之外的任意数量字符,包括空字符串。
- `?` — 匹配任意单个字符。
- `{some_string,another_string,yet_another_one}` — 匹配 `'some_string'`、`'another_string'`、`'yet_another_one'` 中的任意一个字符串。
- `{N..M}` — 匹配从 N 到 M 范围内的任意数字,包括两端边界。

使用 `{}` 的构造方式类似于 [remote](../../../sql-reference/table-functions/remote.md) 表函数。

**示例**

1.  假设我们在 HDFS 上有多个 TSV 格式的文件,其 URI 如下:
    - 'hdfs://hdfs1:9000/some_dir/some_file_1'
    - 'hdfs://hdfs1:9000/some_dir/some_file_2'
    - 'hdfs://hdfs1:9000/some_dir/some_file_3'
    - 'hdfs://hdfs1:9000/another_dir/some_file_1'
    - 'hdfs://hdfs1:9000/another_dir/some_file_2'
    - 'hdfs://hdfs1:9000/another_dir/some_file_3'

1.  有几种方法可以创建包含所有六个文件的表:

<!-- -->

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

另一种方法:

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

表包含两个目录中的所有文件(所有文件都应满足查询中描述的格式和架构):

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
如果文件列表包含带前导零的数字范围,请对每个数字分别使用大括号构造,或使用 `?`。
:::

**示例**

创建包含名为 `file000`、`file001`、...、`file999` 的文件的表:


```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```

## 配置 {#configuration}

与 GraphiteMergeTree 类似,HDFS 引擎支持通过 ClickHouse 配置文件进行扩展配置。有两种可用的配置键:全局配置(`hdfs`)和用户级配置(`hdfs_*`)。全局配置首先生效,然后应用用户级配置(如果存在)。

```xml
<!-- HDFS 引擎类型的全局配置选项 -->
<hdfs>
  <hadoop_kerberos_keytab>/tmp/keytab/clickhouse.keytab</hadoop_kerberos_keytab>
  <hadoop_kerberos_principal>clickuser@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
  <hadoop_security_authentication>kerberos</hadoop_security_authentication>
</hdfs>

<!-- 用户 "root" 的专用配置 -->
<hdfs_root>
  <hadoop_kerberos_principal>root@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
</hdfs_root>
```

### 配置选项 {#configuration-options}

#### libhdfs3 支持的选项 {#supported-by-libhdfs3}


| **参数**                                        | **默认值**              |
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

[HDFS 配置参考](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html) 中可能包含部分参数的说明。

#### ClickHouse 扩展参数 {#clickhouse-extras}

| **参数**                  | **默认值**        |
| ------------------------- | ----------------- |
| hadoop_kerberos_keytab    | ""                |
| hadoop_kerberos_principal | ""                |
| libhdfs3_conf             | ""                |

### 限制 {#limitations}

- `hadoop_security_kerberos_ticket_cache_path` 和 `libhdfs3_conf` 只能作为全局配置,不支持用户级别配置


## Kerberos 支持 {#kerberos-support}

如果 `hadoop_security_authentication` 参数的值为 `kerberos`,ClickHouse 将通过 Kerberos 进行身份验证。
相关参数请参见[此处](#clickhouse-extras),`hadoop_security_kerberos_ticket_cache_path` 参数可能会有所帮助。
请注意,由于 libhdfs3 的限制,目前仅支持传统方式,
datanode 通信未通过 SASL 进行安全保护(`HADOOP_SECURE_DN_USER` 是此类安全方式的可靠指标)。
请参考 `tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh`。


如果指定了 `hadoop_kerberos_keytab`、`hadoop_kerberos_principal` 或 `hadoop_security_kerberos_ticket_cache_path`,将使用 Kerberos 身份验证。此时 `hadoop_kerberos_keytab` 和 `hadoop_kerberos_principal` 为必填项。

## HDFS Namenode 高可用支持 {#namenode-ha}

libhdfs3 支持 HDFS namenode 高可用。

- 将 HDFS 节点上的 `hdfs-site.xml` 复制到 `/etc/clickhouse-server/`。
- 在 ClickHouse 配置文件中添加以下内容:

```xml
  <hdfs>
    <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
  </hdfs>
```

- 然后使用 `hdfs-site.xml` 中 `dfs.nameservices` 标签的值作为 HDFS URI 中的 namenode 地址。例如,将 `hdfs://appadmin@192.168.101.11:8020/abc/` 替换为 `hdfs://appadmin@my_nameservice/abc/`。


## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型:`LowCardinality(String)`。
- `_file` — 文件名。类型:`LowCardinality(String)`。
- `_size` — 文件大小(以字节为单位)。类型:`Nullable(UInt64)`。如果大小未知,则值为 `NULL`。
- `_time` — 文件最后修改时间。类型:`Nullable(DateTime)`。如果时间未知,则值为 `NULL`。


## 存储设置 {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - 允许在插入数据前截断文件。默认禁用。
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - 当格式包含后缀时,允许每次插入时创建新文件。默认禁用。
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 允许在读取时跳过空文件。默认禁用。

**另请参阅**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
