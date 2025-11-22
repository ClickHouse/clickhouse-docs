## asynchronous_metric_log {#asynchronous_metric_log}

在 ClickHouse Cloud 部署中默认启用。

如果该设置在您的环境中默认未启用,可根据 ClickHouse 的安装方式,按照以下说明进行启用或禁用。

**启用**

要手动启用异步指标日志历史记录收集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md),请创建 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` 文件,内容如下:

```xml
<clickhouse>
     <asynchronous_metric_log>
        <database>system</database>
        <table>asynchronous_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </asynchronous_metric_log>
</clickhouse>
```

**禁用**

要禁用 `asynchronous_metric_log` 设置,请创建以下文件 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`,内容如下:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## auth_use_forwarded_address {#auth_use_forwarded_address}

对通过代理连接的客户端使用原始地址进行身份验证。

:::note
使用此设置时应格外谨慎,因为转发地址很容易被伪造。接受此类身份验证的服务器不应被直接访问,而应仅通过受信任的代理访问。
:::


## backups {#backups}

备份设置，用于执行 [`BACKUP` 和 `RESTORE`](../backup.md) 语句时使用。

可通过以下子标签进行配置：


<!-- SQL
WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','Determines whether multiple backup operations can run concurrently on the same host.', 'true'),
    ('allow_concurrent_restores', 'Bool', 'Determines whether multiple restore operations can run concurrently on the same host.', 'true'),
    ('allowed_disk', 'String', 'Disk to backup to when using `File()`. This setting must be set in order to use `File`.', ''),
    ('allowed_path', 'String', 'Path to backup to when using `File()`. This setting must be set in order to use `File`.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', 'Number of attempts to collect metadata before sleeping in case of inconsistency after comparing collected metadata.', '2'),
    ('collect_metadata_timeout', 'UInt64', 'Timeout in milliseconds for collecting metadata during backup.', '600000'),
    ('compare_collected_metadata', 'Bool', 'If true, compares the collected metadata with the existing metadata to ensure they are not changed during backup .', 'true'),
    ('create_table_timeout', 'UInt64', 'Timeout in milliseconds for creating tables during restore.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', 'Maximum number of attempts to retry after encountering a bad version error during coordinated backup/restore.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Maximum sleep time in milliseconds before the next attempt to collect metadata.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Minimum sleep time in milliseconds before the next attempt to collect metadata.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', 'If the `BACKUP` command fails, ClickHouse will try to remove the files already copied to the backup before the failure,  otherwise it will leave the copied files as they are.', 'true'),
    ('sync_period_ms', 'UInt64', 'Synchronization period in milliseconds for coordinated backup/restore.', '5000'),
    ('test_inject_sleep', 'Bool', 'Testing related sleep', 'false'),
    ('test_randomize_order', 'Bool', 'If true, randomizes the order of certain operations for testing purposes.', 'false'),
    ('zookeeper_path', 'String', 'Path in ZooKeeper where backup and restore metadata is stored when using `ON CLUSTER` clause.', '/clickhouse/backups')
  ]) AS t )
SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
-->

| 设置                                             | 类型   | 描述                                                                                                                                                                   | 默认值               |
| :-------------------------------------------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 确定是否允许在同一主机上并发运行多个备份操作。                                                                                          | `true`                |
| `allow_concurrent_restores`                         | Bool   | 确定是否允许在同一主机上并发运行多个恢复操作。                                                                                         | `true`                |
| `allowed_disk`                                      | String | 使用 `File()` 时备份的目标磁盘。必须设置此项才能使用 `File`。                                                                                       | ``                    |
| `allowed_path`                                      | String | 使用 `File()` 时备份的目标路径。必须设置此项才能使用 `File`。                                                                                       | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 在比较收集的元数据后发现不一致时,休眠前尝试收集元数据的次数。                                                           | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | 备份期间收集元数据的超时时间(毫秒)。                                                                                                                | `600000`              |
| `compare_collected_metadata`                        | Bool   | 如果为 true,则将收集的元数据与现有元数据进行比较,以确保它们在备份期间未被更改。                                                            | `true`                |
| `create_table_timeout`                              | UInt64 | 恢复期间创建表的超时时间(毫秒)。                                                                                                                   | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | 在协调备份/恢复期间遇到版本错误后重试的最大次数。                                                                 | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 下次尝试收集元数据之前的最大休眠时间(毫秒)。                                                                                               | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 下次尝试收集元数据之前的最小休眠时间(毫秒)。                                                                                               | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | 如果 `BACKUP` 命令失败,ClickHouse 将尝试删除失败前已复制到备份的文件,否则将保留已复制的文件。 | `true`                |
| `sync_period_ms`                                    | UInt64 | 协调备份/恢复的同步周期(毫秒)。                                                                                                        | `5000`                |
| `test_inject_sleep`                                 | Bool   | 与测试相关的休眠                                                                                                                                                         | `false`               |
| `test_randomize_order`                              | Bool   | 如果为 true,则为测试目的随机化某些操作的顺序。                                                                                                     | `false`               |
| `zookeeper_path`                                    | String | 使用 `ON CLUSTER` 子句时,在 ZooKeeper 中存储备份和恢复元数据的路径。                                                                                 | `/clickhouse/backups` |

此设置的默认值为：

```xml
<backups>
    ....
</backups>
```


## bcrypt_workfactor {#bcrypt_workfactor}

`bcrypt_password` 身份验证类型的工作因子，该类型使用 [Bcrypt 算法](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)。
工作因子定义了计算哈希值和验证密码所需的计算量和时间。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
对于需要高频身份验证的应用程序，
由于 bcrypt 在较高工作因子下存在较大的计算开销，
建议考虑使用其他身份验证方法。
:::


## table_engines_require_grant {#table_engines_require_grant}

如果设置为 true,用户需要获得授权才能使用特定引擎创建表,例如 `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
默认情况下,为保持向后兼容性,使用特定表引擎创建表时不需要授权,但您可以将此项设置为 true 来改变这一行为。
:::


## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

重新加载内置字典的时间间隔(以秒为单位)。

ClickHouse 每隔 x 秒重新加载内置字典。这使得可以在不重启服务器的情况下"动态"编辑字典。

**示例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的数据压缩设置。

:::note
如果您刚开始使用 ClickHouse,建议不要更改此设置。
:::

**配置模板**:

```xml
<compression>
    <case>
      <min_part_size>...</min_part_size>
      <min_part_size_ratio>...</min_part_size_ratio>
      <method>...</method>
      <level>...</level>
    </case>
    ...
</compression>
```

**`<case>` 字段**:

- `min_part_size` – 数据分区的最小大小。
- `min_part_size_ratio` – 数据分区大小与表大小的比率。
- `method` – 压缩方法。可接受的值:`lz4`、`lz4hc`、`zstd`、`deflate_qpl`。
- `level` – 压缩级别。参见 [编解码器](/sql-reference/statements/create/table#general-purpose-codecs)。

:::note
您可以配置多个 `<case>` 部分。
:::

**满足条件时的操作**:

- 如果数据分区匹配某个条件集,ClickHouse 将使用指定的压缩方法。
- 如果数据分区匹配多个条件集,ClickHouse 将使用第一个匹配的条件集。

:::note
如果数据分区不满足任何条件,ClickHouse 将使用 `lz4` 压缩。
:::

**示例**

```xml
<compression incl="clickhouse_compression">
    <case>
        <min_part_size>10000000000</min_part_size>
        <min_part_size_ratio>0.01</min_part_size_ratio>
        <method>zstd</method>
        <level>1</level>
    </case>
</compression>
```


## encryption {#encryption}

配置用于获取密钥的命令,该密钥将被[加密编解码器](/sql-reference/statements/create/table#encryption-codecs)使用。密钥应写入环境变量或在配置文件中设置。

密钥可以是十六进制格式或长度为 16 字节的字符串。

**示例**

从配置文件加载:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
不建议在配置文件中存储密钥,这样做不安全。您可以将密钥移至安全磁盘上的单独配置文件中,并在 `config.d/` 文件夹中创建指向该配置文件的符号链接。
:::

从配置文件加载十六进制格式的密钥:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

从环境变量加载密钥:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 设置用于加密的当前密钥,所有指定的密钥均可用于解密。

以上每种方法都可以应用于多个密钥:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 指定用于加密的当前密钥。

此外,用户还可以添加长度必须为 12 字节的 nonce(默认情况下,加密和解密过程使用由零字节组成的 nonce):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

也可以设置为十六进制格式:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
上述所有内容同样适用于 `aes_256_gcm_siv`(但密钥长度必须为 32 字节)。
:::


## error_log {#error_log}

默认情况下处于禁用状态。

**启用**

要手动启用错误历史记录收集 [`system.error_log`](../../operations/system-tables/error_log.md),请创建 `/etc/clickhouse-server/config.d/error_log.xml` 文件,内容如下:

```xml
<clickhouse>
    <error_log>
        <database>system</database>
        <table>error_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </error_log>
</clickhouse>
```

**禁用**

要禁用 `error_log` 设置,请创建以下文件 `/etc/clickhouse-server/config.d/disable_error_log.xml`,内容如下:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## custom_settings_prefixes {#custom_settings_prefixes}

[自定义设置](/operations/settings/query-level#custom_settings)的前缀列表。多个前缀之间必须用逗号分隔。

**示例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**另请参阅**

- [自定义设置](/operations/settings/query-level#custom_settings)


## core_dump {#core_dump}

配置核心转储文件大小的软限制。

:::note
硬限制需通过系统工具进行配置
:::

**示例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## default_profile {#default_profile}

默认设置配置文件。设置配置文件位于 `user_config` 设置所指定的文件中。

**示例**

```xml
<default_profile>default</default_profile>
```


## dictionaries_config {#dictionaries_config}

字典配置文件的路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 \* 和 ?。

另请参阅：

- "[字典](../../sql-reference/dictionaries/index.md)"。

**示例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## user_defined_executable_functions_config {#user_defined_executable_functions_config}

可执行用户自定义函数配置文件的路径。

路径：

- 指定绝对路径或相对于服务器配置文件的相对路径。
- 路径可以包含通配符 \* 和 ?。

另请参阅：

- "[可执行用户自定义函数](/sql-reference/functions/udf#executable-user-defined-functions)"。

**示例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## format_schema_path {#format_schema_path}

输入数据模式文件所在目录的路径,例如 [CapnProto](/interfaces/formats/CapnProto) 格式的模式文件。

**示例**

```xml
<!-- 包含各种输入格式模式文件的目录。 -->
<format_schema_path>format_schemas/</format_schema_path>
```


## graphite {#graphite}

向 [Graphite](https://github.com/graphite-project) 发送数据。

配置项:

- `host` – Graphite 服务器地址。
- `port` – Graphite 服务器端口。
- `interval` – 发送间隔,单位为秒。
- `timeout` – 发送数据的超时时间,单位为秒。
- `root_path` – 键名前缀。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表发送数据。
- `events` – 从 [system.events](/operations/system-tables/events) 表发送时间段内累积的增量数据。
- `events_cumulative` – 从 [system.events](/operations/system-tables/events) 表发送累积数据。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表发送数据。

可以配置多个 `<graphite>` 子句。例如,可以用于以不同的间隔发送不同的数据。

**示例**

```xml
<graphite>
    <host>localhost</host>
    <port>42000</port>
    <timeout>0.1</timeout>
    <interval>60</interval>
    <root_path>one_min</root_path>
    <metrics>true</metrics>
    <events>true</events>
    <events_cumulative>false</events_cumulative>
    <asynchronous_metrics>true</asynchronous_metrics>
</graphite>
```


## graphite_rollup {#graphite_rollup}

Graphite 数据精简配置。

更多详情请参阅 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)。

**示例**

```xml
<graphite_rollup_example>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup_example>
```


## google_protos_path {#google_protos_path}

定义包含 Protobuf 类型的 proto 文件的目录。

示例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## http_handlers {#http_handlers}

允许使用自定义 HTTP 处理器。
要添加新的 http 处理器,只需添加一个新的 `<rule>`。
规则按照定义的顺序从上到下进行检查,
第一个匹配的规则将运行相应的处理器。

以下设置可通过子标签进行配置:

| 子标签               | 定义                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | 用于匹配请求 URL,可以使用 'regex:' 前缀进行正则表达式匹配(可选)                                                           |
| `methods`            | 用于匹配请求方法,可以使用逗号分隔多个方法(可选)                                                       |
| `headers`            | 用于匹配请求头,匹配每个子元素(子元素名称为请求头名称),可以使用 'regex:' 前缀进行正则表达式匹配(可选) |
| `handler`            | 请求处理器                                                                                                                               |
| `empty_query_string` | 检查 URL 中是否不包含查询字符串                                                                                                    |

`handler` 包含以下设置,可通过子标签进行配置:

| 子标签           | 定义                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | 重定向的目标位置                                                                                                                                               |
| `type`             | 支持的类型:static、dynamic_query_handler、predefined_query_handler、redirect                                                                                    |
| `status`           | 与 static 类型配合使用,指定响应状态码                                                                                                                            |
| `query_param_name` | 与 dynamic_query_handler 类型配合使用,提取并执行 HTTP 请求参数中与 `<query_param_name>` 值对应的值                           |
| `query`            | 与 predefined_query_handler 类型配合使用,在调用处理器时执行查询                                                                                     |
| `content_type`     | 与 static 类型配合使用,指定响应的 content-type                                                                                                                           |
| `response_content` | 与 static 类型配合使用,发送给客户端的响应内容,当使用前缀 'file://' 或 'config://' 时,从文件或配置中查找内容并发送给客户端 |

除了规则列表之外,还可以指定 `<defaults/>` 来启用所有默认处理器。

示例:

```xml
<http_handlers>
    <rule>
        <url>/</url>
        <methods>POST,GET</methods>
        <headers><pragma>no-cache</pragma></headers>
        <handler>
            <type>dynamic_query_handler</type>
            <query_param_name>query</query_param_name>
        </handler>
    </rule>

    <rule>
        <url>/predefined_query</url>
        <methods>POST,GET</methods>
        <handler>
            <type>predefined_query_handler</type>
            <query>SELECT * FROM system.settings</query>
        </handler>
    </rule>

    <rule>
        <handler>
            <type>static</type>
            <status>200</status>
            <content_type>text/plain; charset=UTF-8</content_type>
            <response_content>config://http_server_default_response</response_content>
        </handler>
    </rule>
</http_handlers>
```


## http_server_default_response {#http_server_default_response}

访问 ClickHouse HTTP(s) 服务器时默认显示的页面。
默认值为 "Ok."(末尾带换行符)

**示例**

访问 `http://localhost: http_port` 时打开 `https://tabix.io/`。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## http_options_response {#http_options_response}

用于在 `OPTIONS` HTTP 请求的响应中添加请求头。
`OPTIONS` 方法在发起 CORS 预检请求时使用。

更多信息请参阅 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)。

示例:

```xml
<http_options_response>
     <header>
            <name>Access-Control-Allow-Origin</name>
            <value>*</value>
     </header>
     <header>
          <name>Access-Control-Allow-Headers</name>
          <value>origin, x-requested-with, x-clickhouse-format, x-clickhouse-user, x-clickhouse-key, Authorization</value>
     </header>
     <header>
          <name>Access-Control-Allow-Methods</name>
          <value>POST, GET, OPTIONS</value>
     </header>
     <header>
          <name>Access-Control-Max-Age</name>
          <value>86400</value>
     </header>
</http_options_response>
```


## hsts_max_age {#hsts_max_age}

HSTS 的过期时间(秒)。

:::note
值为 `0` 表示 ClickHouse 禁用 HSTS。如果设置为正数,则启用 HSTS,max-age 为所设置的数值。
:::

**示例**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## mlock_executable {#mlock_executable}

在启动后执行 `mlockall` 以降低首次查询的延迟,并防止 ClickHouse 可执行文件在高 IO 负载下被换出内存。

:::note
建议启用此选项,但会导致启动时间增加最多几秒钟。
请注意,如果没有 "CAP_IPC_LOCK" 能力,此设置将无法生效。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```


## include_from {#include_from}

用于替换的文件路径。支持 XML 和 YAML 格式。

更多信息请参阅"[配置文件](/operations/configuration-files)"部分。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## interserver_listen_host {#interserver_listen_host}

限制可在 ClickHouse 服务器之间交换数据的主机。
如果使用 Keeper,同样的限制将应用于不同 Keeper 实例之间的通信。

:::note
默认情况下,该值等于 [`listen_host`](#listen_host) 设置。
:::

**示例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

类型:

默认值:


## interserver_http_port {#interserver_http_port}

用于 ClickHouse 服务器之间交换数据的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_http_host {#interserver_http_host}

其他服务器用于访问本服务器的主机名。

如果省略,则其定义方式与 `hostname -f` 命令相同。

用于绑定到特定网络接口之外的场景。

**示例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_https_port {#interserver_https_port}

用于 ClickHouse 服务器之间通过 `HTTPS` 交换数据的端口。

**示例**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_https_host {#interserver_https_host}

类似于 [`interserver_http_host`](#interserver_http_host),但此主机名用于其他服务器通过 `HTTPS` 访问本服务器。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_http_credentials {#interserver_http_credentials}

用于在[复制](../../engines/table-engines/mergetree-family/replication.md)期间连接到其他服务器的用户名和密码。此外,服务器使用这些凭据对其他副本进行身份验证。
因此,集群中所有副本的 `interserver_http_credentials` 必须相同。

:::note

- 默认情况下,如果省略 `interserver_http_credentials` 配置段,则复制期间不使用身份验证。
- `interserver_http_credentials` 设置与 ClickHouse 客户端凭据[配置](../../interfaces/cli.md#configuration_files)无关。
- 这些凭据适用于通过 `HTTP` 和 `HTTPS` 进行的复制。
  :::

可以通过以下子标签配置设置:

- `user` — 用户名。
- `password` — 密码。
- `allow_empty` — 如果为 `true`,则即使设置了凭据,也允许其他副本在不进行身份验证的情况下连接。如果为 `false`,则拒绝未经身份验证的连接。默认值:`false`。
- `old` — 包含凭据轮换期间使用的旧 `user` 和 `password`。可以指定多个 `old` 配置段。

**凭据轮换**

ClickHouse 支持动态的服务器间凭据轮换,无需同时停止所有副本来更新其配置。凭据可以分多个步骤进行更改。

要启用身份验证,请将 `interserver_http_credentials.allow_empty` 设置为 `true` 并添加凭据。这允许带身份验证和不带身份验证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

配置所有副本后,将 `allow_empty` 设置为 `false` 或删除此设置。这将强制要求使用新凭据进行身份验证。

要更改现有凭据,请将用户名和密码移至 `interserver_http_credentials.old` 配置段,并使用新值更新 `user` 和 `password`。此时,服务器使用新凭据连接到其他副本,并接受使用新凭据或旧凭据的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>222</password>
    <old>
        <user>admin</user>
        <password>111</password>
    </old>
    <old>
        <user>temp</user>
        <password>000</password>
    </old>
</interserver_http_credentials>
```

当新凭据应用于所有副本后,可以删除旧凭据。


## ldap_servers {#ldap_servers}

在此列出 LDAP 服务器及其连接参数,用于:

- 作为专用本地用户的身份验证器,这些用户指定了 'ldap' 身份验证机制而非 'password'
- 作为远程用户目录

以下设置可通过子标签进行配置:

| 设置                        | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `host`                         | LDAP 服务器主机名或 IP 地址,此参数为必填项且不能为空。                                                                                                                                                                                                                                                                                                                                                                               |
| `port`                         | LDAP 服务器端口,如果 `enable_tls` 设置为 true,则默认为 636,否则为 `389`。                                                                                                                                                                                                                                                                                                                                                                                          |
| `bind_dn`                      | 用于构造绑定 DN 的模板。在每次身份验证尝试期间,将模板中的所有 `\{user_name\}` 子字符串替换为实际用户名,从而构造出最终的 DN。                                                                                                                                                                                                                                                                                                               |
| `user_dn_detection`            | 包含用于检测绑定用户实际用户 DN 的 LDAP 搜索参数的配置段。主要用于当服务器为 Active Directory 时,在搜索过滤器中进行进一步的角色映射。生成的用户 DN 将在允许的任何位置替换 `\{user_dn\}` 子字符串。默认情况下,用户 DN 设置为等于绑定 DN,但一旦执行搜索,它将更新为实际检测到的用户 DN 值。 |
| `verification_cooldown`        | 成功绑定尝试后的一段时间(以秒为单位),在此期间,用户将被视为对所有后续请求已成功进行身份验证,而无需联系 LDAP 服务器。指定 `0`(默认值)以禁用缓存并强制对每个身份验证请求联系 LDAP 服务器。                                                                                                                    |
| `enable_tls`                   | 用于启用到 LDAP 服务器的安全连接的标志。指定 `no` 表示明文 (`ldap://`) 协议(不推荐)。指定 `yes` 表示 LDAP over SSL/TLS (`ldaps://`) 协议(推荐,默认值)。指定 `starttls` 表示传统 StartTLS 协议(明文 (`ldap://`) 协议,升级到 TLS)。                                                                                                                 |
| `tls_minimum_protocol_version` | SSL/TLS 的最低协议版本。可接受的值为:`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`(默认值)。                                                                                                                                                                                                                                                                                                                                  |
| `tls_require_cert`             | SSL/TLS 对等证书验证行为。可接受的值为:`never`、`allow`、`try`、`demand`(默认值)。                                                                                                                                                                                                                                                                                                                                                                                                      |
| `tls_cert_file`                | 证书文件路径。                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tls_key_file`                 | 证书密钥文件路径。                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_ca_cert_file`             | CA 证书文件路径。                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tls_ca_cert_dir`              | 包含 CA 证书的目录路径。                                                                                                                                                                                                                                                                                                                                                                                                          |
| `tls_cipher_suite`             | 允许的密码套件(使用 OpenSSL 表示法)。                                                                                                                                                                                                                                                                                                                                                                                                                |

设置 `user_dn_detection` 可通过子标签进行配置:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base_dn`       | 用于构造 LDAP 搜索的基础 DN 的模板。在 LDAP 搜索期间,将模板中的所有 `\{user_name\}` 和 '\{bind_dn\}' 子字符串替换为实际用户名和绑定 DN,从而构造出最终的 DN。                                                                                                        |
| `scope`         | LDAP 搜索的范围。可接受的值为:`base`、`one_level`、`children`、`subtree`(默认值)。                                                                                                                                                                                                                                            |
| `search_filter` | 用于构造 LDAP 搜索的搜索过滤器的模板。在 LDAP 搜索期间,将模板中的所有 `\{user_name\}`、`\{bind_dn\}` 和 `\{base_dn\}` 子字符串替换为实际用户名、绑定 DN 和基础 DN,从而构造出最终的过滤器。注意,特殊字符必须在 XML 中正确转义。 |

示例:


```xml
<my_ldap_server>
    <host>localhost</host>
    <port>636</port>
    <bind_dn>uid={user_name},ou=users,dc=example,dc=com</bind_dn>
    <verification_cooldown>300</verification_cooldown>
    <enable_tls>yes</enable_tls>
    <tls_minimum_protocol_version>tls1.2</tls_minimum_protocol_version>
    <tls_require_cert>demand</tls_require_cert>
    <tls_cert_file>/path/to/tls_cert_file</tls_cert_file>
    <tls_key_file>/path/to/tls_key_file</tls_key_file>
    <tls_ca_cert_file>/path/to/tls_ca_cert_file</tls_ca_cert_file>
    <tls_ca_cert_dir>/path/to/tls_ca_cert_dir</tls_ca_cert_dir>
    <tls_cipher_suite>ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:AES256-GCM-SHA384</tls_cipher_suite>
</my_ldap_server>
```

示例（典型 Active Directory，已配置用户 DN 检测，用于后续角色映射）：

```xml
<my_ad_server>
    <host>localhost</host>
    <port>389</port>
    <bind_dn>EXAMPLE\{user_name}</bind_dn>
    <user_dn_detection>
        <base_dn>CN=Users,DC=example,DC=com</base_dn>
        <search_filter>(&amp;(objectClass=user)(sAMAccountName={user_name}))</search_filter>
    </user_dn_detection>
    <enable_tls>no</enable_tls>
</my_ad_server>
```


## listen_host {#listen_host}

限制可以发送请求的主机。如果希望服务器响应所有主机的请求，请指定 `::`。

示例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen_try {#listen_try}

当尝试监听时,如果 IPv6 或 IPv4 网络不可用,服务器不会退出。

**示例**

```xml
<listen_try>0</listen_try>
```


## listen_reuse_port {#listen_reuse_port}

允许多个服务器监听同一地址和端口。操作系统会将请求随机路由到其中一个服务器。不建议启用此设置。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

类型:

默认值:


## listen_backlog {#listen_backlog}

监听套接字的积压队列(待处理连接的队列大小)。默认值 `4096` 与 Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4) 的值相同。

通常不需要更改此值,原因如下:

- 默认值已经足够大,
- 服务器使用独立线程来接受客户端连接。

因此,即使 `TcpExtListenOverflows`(来自 `nstat`)非零且此计数器在 ClickHouse 服务器上持续增长,也不意味着需要增加此值,原因如下:

- 通常如果 `4096` 不够用,说明存在 ClickHouse 内部扩展性问题,因此最好提交问题报告。
- 这并不意味着服务器稍后能够处理更多连接(即使可以,到那时客户端可能已经离开或断开连接)。

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```


## logger {#logger}

日志消息的位置和格式。

**配置项**:

| 配置项                    | 说明                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `level`                | 日志级别。可接受的值:`none`(关闭日志)、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                 |
| `log`                  | 日志文件的路径。                                                                                                                                          |
| `errorlog`             | 错误日志文件的路径。                                                                                                                                    |
| `size`                 | 轮转策略:日志文件的最大大小(字节)。当日志文件大小超过此阈值时,将被重命名并归档,然后创建新的日志文件。 |
| `count`                | 轮转策略:ClickHouse 最多保留的历史日志文件数量。                                                                                        |
| `stream_compress`      | 使用 LZ4 压缩日志消息。设置为 `1` 或 `true` 启用。                                                                                                   |
| `console`              | 启用控制台日志输出。设置为 `1` 或 `true` 启用。如果 ClickHouse 不以守护进程模式运行,默认值为 `1`,否则为 `0`。                            |
| `console_log_level`    | 控制台输出的日志级别。默认为 `level`。                                                                                                                 |
| `formatting.type`      | 控制台输出的日志格式。目前仅支持 `json`。                                                                                                 |
| `use_syslog`           | 同时将日志输出转发到 syslog。                                                                                                                                 |
| `syslog_level`         | 输出到 syslog 的日志级别。                                                                                                                                   |
| `async`                | 当设置为 `true`(默认值)时,日志将异步记录(每个输出通道一个后台线程)。否则将在调用 LOG 的线程内同步记录           |
| `async_queue_max_size` | 使用异步日志时,队列中等待刷新的最大消息数量。超出的消息将被丢弃                       |
| `startup_level`        | 启动级别用于在服务器启动时设置根日志记录器级别。启动完成后,日志级别将恢复为 `level` 设置                                   |
| `shutdown_level`       | 关闭级别用于在服务器关闭时设置根日志记录器级别。                                                                                            |

**日志格式说明符**

`log` 和 `errorLog` 路径中的文件名支持以下格式说明符来生成最终的文件名(目录部分不支持这些说明符)。

"示例"列显示了在 `2023-07-06 18:32:07` 时的输出。


| 说明符  | 说明                                                                                                         | 示例                         |
| ---- | ---------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%` | 字面量 %                                                                                                      | `%`                        |
| `%n` | 换行符                                                                                                        |                            |
| `%t` | 水平制表符                                                                                                      |                            |
| `%Y` | 年份的十进制表示，例如 2017                                                                                           | `2023`                     |
| `%y` | 年份最后 2 位，以十进制表示（范围 [00,99]）                                                                                | `23`                       |
| `%C` | 年份的前两位数字，十进制数（范围 [00,99]）                                                                                  | `20`                       |
| `%G` | 四位数的 [ISO 8601 以周为单位的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。通常仅在与 `%V` 搭配使用时才有意义 | `2023`                     |
| `%g` | [ISO 8601 周历年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) 的最后 2 位数字，即包含指定周的年份。                    | `23`                       |
| `%b` | 缩写的月份名称，例如 Oct（取决于区域设置）                                                                                    | `Jul`                      |
| `%h` | %b 的别名                                                                                                     | `Jul`                      |
| `%B` | 完整月份名称，例如 October（与区域设置有关）                                                                                 | `七月`                       |
| `%m` | 月份的十进制表示（范围 [01,12]）                                                                                       | `07`                       |
| `%U` | 一年中的周数，以十进制数表示（星期日为一周的第一天）（范围为 [00,53]）                                                                    | `27`                       |
| `%W` | 一年中的第几周，以十进制数表示（星期一为一周的第一天）（范围为 [00,53]）                                                                   | `27`                       |
| `%V` | ISO 8601 周数（范围 [01,53]）                                                                                    | `27`                       |
| `%j` | 一年中的第几天，以十进制数表示（范围 [001,366]）                                                                              | `187`                      |
| `%d` | 以零填充的十进制数表示的月份中的日期（范围 [01,31]）。当为个位数时在前面补零。                                                                | `06`                       |
| `%e` | 以空格填充的十进制日期（范围 [1,31]）。一位数前加一个空格。                                                                          | `&nbsp; 6`                 |
| `%a` | 星期的缩写名称，例如 Fri（因区域设置而异）                                                                                    | `周四`                       |
| `%A` | 完整的星期名称，例如 Friday（因区域设置而异）                                                                                 | `星期四`                      |
| `%w` | 用整数表示的星期几，星期日为 0（范围为 [0-6]）                                                                                | `4`                        |
| `%u` | 用十进制数字表示的星期，星期一为 1（ISO 8601 格式）（范围 [1-7]）                                                                  | `4`                        |
| `%H` | 以十进制数表示的小时，24 小时制（范围 [00-23]）                                                                              | `18`                       |
| `%I` | 以十进制数表示的小时数，12 小时制（范围 [01,12]）                                                                             | `06`                       |
| `%M` | 以十进制数表示的分钟数（范围 [00,59]）                                                                                    | `32`                       |
| `%S` | 秒数，以十进制数表示（范围 [00,60]）                                                                                     | `07`                       |
| `%c` | 标准日期和时间字符串，例如 Sun Oct 17 04:41:13 2010（取决于区域设置）                                                            | `Thu Jul  6 18:32:07 2023` |
| `%x` | 本地化日期格式（依赖于区域设置）                                                                                           | `07/06/23`                 |
| `%X` | 本地化的时间表示形式，例如 18:40:20 或 6:40:20 PM（取决于区域设置）                                                               | `18:32:07`                 |
| `%D` | 短格式 MM/DD/YY 日期格式，与 %m/%d/%y 等价                                                                            | `07/06/23`                 |
| `%F` | 短日期格式 YYYY-MM-DD，等同于 %Y-%m-%d                                                                              | `2023-07-06`               |
| `%r` | 根据区域设置本地化的 12 小时制时间                                                                                        | `06:32:07 PM`              |
| `%R` | 等同于 &quot;%H:%M&quot;                                                                                      | `18:32`                    |
| `%T` | 等同于 &quot;%H:%M:%S&quot;（ISO 8601 时间格式）                                                                    | `18:32:07`                 |
| `%p` | 本地化的 a.m. / p.m. 标记（取决于 locale）                                                                            | `PM`                       |
| `%z` | ISO 8601 格式的 UTC 偏移量（例如 -0430），如果时区信息不可用，则不包含任何字符                                                          | `+0800`                    |
| `%Z` | 取决于区域设置的时区名称或缩写；如果时区信息不可用，则不包含任何字符                                                                         | `Z AWST `                  |

**示例**

```xml
<logger>
    <level>trace</level>
    <log>/var/log/clickhouse-server/clickhouse-server-%F-%T.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server-%F-%T.err.log</errorlog>
    <size>1000M</size>
    <count>10</count>
    <stream_compress>true</stream_compress>
</logger>
```

要仅在控制台输出日志消息：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**按日志名称覆盖**

可以为单独的日志名称覆盖日志级别。例如，要屏蔽日志记录器“Backup”和“RBAC”的所有消息。

```xml
<logger>
    <levels>
        <logger>
            <name>Backup</name>
            <level>none</level>
        </logger>
        <logger>
            <name>RBAC</name>
            <level>none</level>
        </logger>
    </levels>
</logger>
```

**syslog**

要将日志消息额外写入 syslog，请执行以下操作：

```xml
<logger>
    <use_syslog>1</use_syslog>
    <syslog>
        <address>syslog.remote:10514</address>
        <hostname>myhost.local</hostname>
        <facility>LOG_LOCAL6</facility>
        <format>syslog</format>
    </syslog>
</logger>
```

`<syslog>` 的键：

| Key        | Description                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | syslog 的地址，格式为 `host\[:port\]`。如果省略，则使用本地守护进程。                                                                                                                                                          |
| `hostname` | 发送日志的主机名称（可选）。                                                                                                                                                                                          |
| `facility` | syslog 的 [facility 关键字](https://en.wikipedia.org/wiki/Syslog#Facility)。必须使用大写，并带有 &quot;LOG&#95;&quot; 前缀，例如 `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` 等。默认值：如果指定了 `address`，则为 `LOG_USER`，否则为 `LOG_DAEMON`。 |
| `format`   | 日志消息格式。可选值：`bsd` 和 `syslog.`                                                                                                                                                                            |

**日志格式**

可以指定输出到控制台日志中的日志格式。目前仅支持 JSON。

**示例**

下面是一个 JSON 日志输出示例：

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "已接收信号 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

要启用 JSON 日志支持，请使用以下代码片段：

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- 可以按通道单独配置(log、errorlog、console、syslog),也可以为所有通道全局配置(全局配置时省略此项即可)。 -->
        <!-- <channel></channel> -->
        <names>
            <date_time>date_time</date_time>
            <thread_name>thread_name</thread_name>
            <thread_id>thread_id</thread_id>
            <level>level</level>
            <query_id>query_id</query_id>
            <logger_name>logger_name</logger_name>
            <message>message</message>
            <source_file>source_file</source_file>
            <source_line>source_line</source_line>
        </names>
    </formatting>
</logger>
```

**为 JSON 日志重命名键**

可以通过修改 `<names>` 标签内各标签的值来更改键名。例如，要将 `DATE_TIME` 更改为 `MY_DATE_TIME`，可以使用 `<date_time>MY_DATE_TIME</date_time>`。

**在 JSON 日志中省略键**

可以通过将属性注释掉来省略对应的日志属性。例如，如果不希望日志输出 `query_id`，可以将 `<query_id>` 标签注释掉。


## send_crash_reports {#send_crash_reports}

用于向 ClickHouse 核心开发团队发送崩溃报告的设置。

强烈建议启用此功能，特别是在预生产环境中。

配置项：

| 配置项                   | 说明                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`             | 用于启用该功能的布尔标志，默认值为 `true`。设置为 `false` 可禁止发送崩溃报告。                                |
| `send_logical_errors` | `LOGICAL_ERROR` 类似于 `assert`，表示 ClickHouse 中的 bug。此布尔标志用于启用发送此类异常（默认值：`true`）。 |
| `endpoint`            | 您可以自定义用于发送崩溃报告的端点 URL。                                                                         |

**推荐用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## ssh_server {#ssh_server}

首次连接时,主机密钥的公钥部分将被写入 SSH 客户端的 known_hosts 文件。

主机密钥配置默认为未启用状态。
取消主机密钥配置的注释,并提供相应 SSH 密钥的路径以启用它们:

示例:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## tcp_ssh_port {#tcp_ssh_port}

SSH 服务器端口,允许用户通过 PTY 使用嵌入式客户端以交互方式连接并执行查询。

示例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## storage_configuration {#storage_configuration}

允许配置多磁盘存储。

存储配置遵循以下结构:

```xml
<storage_configuration>
    <disks>
        <!-- configuration -->
    </disks>
    <policies>
        <!-- configuration -->
    </policies>
</storage_configuration>
```

### 磁盘配置 {#configuration-of-disks}

`disks` 的配置遵循以下结构:

```xml
<storage_configuration>
    <disks>
        <disk_name_1>
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>
        ...
    </disks>
</storage_configuration>
```

以下子标签定义了 `disks` 的配置项:

| 配置项                  | 描述                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `<disk_name_N>`         | 磁盘名称,必须唯一。                                                         |
| `path`                  | 服务器数据的存储路径(`data` 和 `shadow` 目录)。路径必须以 `/` 结尾 |
| `keep_free_space_bytes` | 磁盘上预留的空闲空间大小。                                                              |

:::note
磁盘的顺序不影响配置。
:::

### 策略配置 {#configuration-of-policies}

以下子标签定义了 `policies` 的配置项:


| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | 策略名称。策略名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | 卷名称。卷名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `disk`                       | 位于该卷中的磁盘。                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`   | 可以驻留在该卷任意磁盘上的数据分片的最大大小。如果合并后得到的分片大小预计会大于 `max_data_part_size_bytes`，则该分片将被写入下一个卷。基本上，此功能允许你将新的 / 较小的分片存储在热（SSD）卷上，并在其达到较大尺寸时将其移动到冷（HDD）卷。如果策略中只有一个卷，请不要使用此选项。                                                                 |
| `move_factor`                | 卷中可用空闲空间的占比。如果空间变少，数据将开始转移到下一个卷（如果存在）。在转移过程中，分片会按大小从大到小（降序）排序，并选择总大小足以满足 `move_factor` 条件的分片；如果所有分片的总大小仍不足以满足条件，则会移动所有分片。                                                                                                             |
| `perform_ttl_move_on_insert` | 禁用在插入时移动 TTL 已过期的数据。默认情况下（启用时），如果我们插入的一部分数据根据按 TTL 移动规则已经过期，则会立即将其移动到规则中指定的卷 / 磁盘。如果目标卷 / 磁盘较慢（例如 S3），这可能会显著降低插入速度。如果禁用，则已过期的数据部分会先写入默认卷，然后立即根据该过期 TTL 的规则移动到指定的卷。 |
| `load_balancing`             | 磁盘负载均衡策略，`round_robin` 或 `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`          | 设置更新所有磁盘可用空间的超时时间（以毫秒为单位）（`0` - 始终更新，`-1` - 从不更新，默认值为 `60000`）。注意，如果磁盘仅由 ClickHouse 使用，并且不会在运行时对文件系统进行动态扩容或缩容，你可以使用 `-1`。在所有其他情况下，不建议这样做，因为最终会导致空间分配不正确。                                                                                                                   |
| `prefer_not_to_merge`        | 禁用在此卷上合并数据分片。注意：这可能有害，并会导致性能下降。当启用此设置时（不建议这样做），禁止在此卷上进行数据合并（这是不利的）。这用于控制 ClickHouse 与慢磁盘的交互方式。我们建议完全不要使用此设置。                                                                                                                                                                                       |
| `volume_priority`            | 定义填充卷的优先级（顺序）。值越小，优先级越高。参数值必须是自然数，并且在 1 到 N 的范围内连续覆盖（N 为指定的最大参数值），中间不能有间隔。                                                                                                                                                                                                                                                                |

对于 `volume_priority`：
- 如果所有卷都具有此参数，则按指定顺序确定其优先级。
- 如果只有_部分_卷具有此参数，则未设置该参数的卷优先级最低。已设置该参数的卷根据该参数值确定优先级，其余卷的优先级则按照它们在配置文件中的描述顺序彼此决定。
- 如果_没有_任何卷设置该参数，则它们的顺序由它们在配置文件中的描述顺序决定。
- 各卷的优先级可以不相同。



## macros {#macros}

复制表的参数替换配置。

如果不使用复制表，可以省略。

更多信息请参阅[创建复制表](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)章节。

**示例**

```xml
<macros incl="macros" optional="true" />
```


## replica_group_name {#replica_group_name}

Replicated 数据库的副本组名称。

由 Replicated 数据库创建的集群将由同一组内的副本组成。
DDL 查询仅会等待同一组内的副本。

默认为空。

**示例**

```xml
<replica_group_name>backups</replica_group_name>
```


## remap_executable {#remap_executable}

使用大页重新分配机器代码（"text"）内存的设置。

:::note
此功能为高度实验性功能。
:::

示例：

```xml
<remap_executable>false</remap_executable>
```


## max_open_files {#max_open_files}

最大打开文件数。

:::note
我们建议在 macOS 上使用此选项,因为 `getrlimit()` 函数返回的值不正确。
:::

**示例**

```xml
<max_open_files>262144</max_open_files>
```


## max_session_timeout {#max_session_timeout}

最大会话超时时间,以秒为单位。

示例:

```xml
<max_session_timeout>3600</max_session_timeout>
```


## merge_tree {#merge_tree}

用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的精细调优配置。

有关更多信息,请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## metric_log {#metric_log}

默认情况下处于禁用状态。

**启用**

要手动启用指标历史记录收集 [`system.metric_log`](../../operations/system-tables/metric_log.md),请创建 `/etc/clickhouse-server/config.d/metric_log.xml` 文件,内容如下:

```xml
<clickhouse>
    <metric_log>
        <database>system</database>
        <table>metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </metric_log>
</clickhouse>
```

**禁用**

要禁用 `metric_log` 设置,请创建文件 `/etc/clickhouse-server/config.d/disable_metric_log.xml`,内容如下:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## replicated_merge_tree {#replicated_merge_tree}

用于 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的精细调优配置。此设置具有更高的优先级。

有关更多信息,请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## opentelemetry_span_log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 系统表的配置设置。

<SystemLogParameters />

示例：

```xml
<opentelemetry_span_log>
    <engine>
        engine MergeTree
        partition by toYYYYMM(finish_date)
        order by (finish_date, finish_time_us, trace_id)
    </engine>
    <database>system</database>
    <table>opentelemetry_span_log</table>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</opentelemetry_span_log>
```


## openSSL {#openSSL}

SSL 客户端/服务器配置。

SSL 支持由 `libpoco` 库提供。可用的配置选项说明请参见 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)。默认值可在 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) 中找到。

服务器/客户端设置的配置键:


| 选项                            | 说明                                                                                                                                                                                                                                                                           | 默认值                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 证书私钥文件的路径。该文件中可以同时包含私钥和证书。                                                                                                                                                                                                                                               |                                                                                            |
| `certificateFile`             | PEM 格式的客户端/服务器证书文件路径。如果 `privateKeyFile` 已包含该证书，则可以省略此项。                                                                                                                                                                                                                     |                                                                                            |
| `caConfig`                    | 包含受信任 CA 证书的文件或目录的路径。如果指向的是一个文件，则该文件必须为 PEM 格式，并且可以包含多个 CA 证书。如果指向的是一个目录，则该目录中必须每个 CA 证书对应一个 .pem 文件。文件名将根据 CA 主题名的哈希值进行查找。详细信息可在 [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) 的 man 手册页中找到。 |                                                                                            |
| `verificationMode`            | 用于验证节点的证书的方法。详细信息请参阅 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的说明。可能的取值：`none`、`relaxed`、`strict`、`once`。                                                                                                 | `relaxed`                                                                                  |
| `verificationDepth`           | 验证链的最大长度。一旦证书链长度超过该设置值，验证将失败。                                                                                                                                                                                                                                                | `9`                                                                                        |
| `loadDefaultCAFile`           | 是否使用 OpenSSL 的内置 CA 证书。ClickHouse 假定这些内置 CA 证书存放在文件 `/etc/ssl/cert.pem`（或目录 `/etc/ssl/certs`）中，或者存放在由环境变量 `SSL_CERT_FILE`（或 `SSL_CERT_DIR`）指定的文件（或目录）中。                                                                                                                      | `true`                                                                                     |
| `cipherList`                  | 受支持的 OpenSSL 加密套件。                                                                                                                                                                                                                                                           | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | 启用或禁用会话缓存。必须与 `sessionIdContext` 配合使用。可接受的值：`true`、`false`。                                                                                                                                                                                                                  | `false`                                                                                    |
| `sessionIdContext`            | 服务器会为每个生成的标识符附加的一组唯一随机字符。字符串的长度不得超过 `SSL_MAX_SSL_SESSION_ID_LENGTH`。始终建议设置此参数，因为无论是服务器缓存会话还是客户端请求缓存会话，它都能帮助避免相关问题。                                                                                                                                                           | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | 服务器缓存的最大会话数量。值为 `0` 表示会话数量不受限制。                                                                                                                                                                                                                                              | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | 服务器上会话缓存的时间（小时）。                                                                                                                                                                                                                                                             | `2`                                                                                        |
| `extendedVerification`        | 如果启用，则会验证证书中的 CN 或 SAN 是否与对端主机名匹配。                                                                                                                                                                                                                                           | `false`                                                                                    |
| `requireTLSv1`                | 是否要求使用 TLSv1 连接。可接受的值：`true`、`false`。                                                                                                                                                                                                                                        | `false`                                                                                    |
| `requireTLSv1_1`              | 要求使用 TLSv1.1 连接。允许的取值：`true`、`false`。                                                                                                                                                                                                                                        | `false`                                                                                    |
| `requireTLSv1_2`              | 要求 TLSv1.2 连接。可接受的值：`true`、`false`。                                                                                                                                                                                                                                          | `false`                                                                                    |
| `fips`                        | 启用 OpenSSL FIPS 模式。仅在库所使用的 OpenSSL 版本支持 FIPS 时才受支持。                                                                                                                                                                                                                          | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 用于请求用于访问私钥的口令的类（PrivateKeyPassphraseHandler 的子类）。例如：`<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`。                                                                        | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 用于验证证书是否无效的类（CertificateHandler 的子类）。例如：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`。                                                                                                                                    | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 禁止使用的协议。                                                                                                                                                                                                                                                                     |                                                                                            |
| `preferServerCiphers`         | 客户端首选的服务器密码套件。                                                                                                                                                                                                                                                               | `false`                                                                                    |

**设置示例：**

```xml
<openSSL>
    <server>
        <!-- openssl req -subj "/CN=localhost" -new -newkey rsa:2048 -days 365 -nodes -x509 -keyout /etc/clickhouse-server/server.key -out /etc/clickhouse-server/server.crt 生成服务器证书 -->
        <certificateFile>/etc/clickhouse-server/server.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/server.key</privateKeyFile>
        <!-- openssl dhparam -out /etc/clickhouse-server/dhparam.pem 4096 生成 DH 参数 -->
        <dhParamsFile>/etc/clickhouse-server/dhparam.pem</dhParamsFile>
        <verificationMode>none</verificationMode>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
    </server>
    <client>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
        <!-- 用于自签名证书: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 用于自签名证书: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```


## part_log {#part_log}

记录与 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 相关的事件。例如,添加或合并数据。您可以使用该日志来模拟合并算法并比较它们的特性。您可以可视化合并过程。

事件记录在 [system.part_log](/operations/system-tables/part_log) 表中,而不是单独的文件中。您可以在 `table` 参数中配置此表的名称(见下文)。

<SystemLogParameters />

**示例**

```xml
<part_log>
    <database>system</database>
    <table>part_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</part_log>
```


## path {#path}

数据目录的路径。

:::note
必须包含尾部斜杠。
:::

**示例**

```xml
<path>/var/lib/clickhouse/</path>
```


## processors_profile_log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) 系统表的配置。

<SystemLogParameters />

默认配置如下：

```xml
<processors_profile_log>
    <database>system</database>
    <table>processors_profile_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</processors_profile_log>
```


## prometheus {#prometheus}

公开指标数据供 [Prometheus](https://prometheus.io) 抓取。

设置：

- `endpoint` – Prometheus 服务器抓取指标的 HTTP 端点。必须以 '/' 开头。
- `port` – `endpoint` 的端口号。
- `metrics` – 公开 [system.metrics](/operations/system-tables/metrics) 表中的指标。
- `events` – 公开 [system.events](/operations/system-tables/events) 表中的指标。
- `asynchronous_metrics` – 公开 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中的当前指标值。
- `errors` - 公开自上次服务器重启以来按错误代码分类的错误数量。此信息也可以从 [system.errors](/operations/system-tables/errors) 表中获取。

**示例**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
        <errors>true</errors>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

检查（将 `127.0.0.1` 替换为您的 ClickHouse 服务器的 IP 地址或主机名）：

```bash
curl 127.0.0.1:9363/metrics
```


## query_log {#query_log}

用于记录通过 [log_queries=1](../../operations/settings/settings.md) 设置接收到的查询的配置。

查询会被记录到 [system.query_log](/operations/system-tables/query_log) 表中,而非单独的文件。您可以通过 `table` 参数更改表名(见下文)。

<SystemLogParameters />

如果表不存在,ClickHouse 会自动创建。如果 ClickHouse 服务器更新时查询日志的结构发生了变化,旧结构的表会被重命名,并自动创建新表。

**示例**

```xml
<query_log>
    <database>system</database>
    <table>query_log</table>
    <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_log>
```


## query_metric_log {#query_metric_log}

默认情况下处于禁用状态。

**启用**

要手动启用指标历史记录收集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md),请创建 `/etc/clickhouse-server/config.d/query_metric_log.xml` 文件,内容如下:

```xml
<clickhouse>
    <query_metric_log>
        <database>system</database>
        <table>query_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_metric_log>
</clickhouse>
```

**禁用**

要禁用 `query_metric_log` 设置,请创建文件 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`,内容如下:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query_cache {#query_cache}

[查询缓存](../query-cache.md)配置。

以下配置项可用:

| 配置项                   | 描述                                                                          | 默认值 |
| ------------------------- | ------------------------------------------------------------------------------------ | ------------- |
| `max_size_in_bytes`       | 缓存的最大字节数。`0` 表示禁用查询缓存。              | `1073741824`  |
| `max_entries`             | 缓存中存储的 `SELECT` 查询结果的最大数量。                    | `1024`        |
| `max_entry_size_in_bytes` | `SELECT` 查询结果可保存到缓存中的最大字节数。  | `1048576`     |
| `max_entry_size_in_rows`  | `SELECT` 查询结果可保存到缓存中的最大行数。 | `30000000`    |

:::note

- 配置项的更改会立即生效。
- 查询缓存的数据分配在 DRAM 中。如果内存不足,请确保为 `max_size_in_bytes` 设置较小的值或完全禁用查询缓存。
  :::

**示例**

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```


## query_thread_log {#query_thread_log}

用于记录查询线程的设置,需配合 [log_query_threads=1](/operations/settings/settings#log_query_threads) 设置使用。

查询线程日志记录在 [system.query_thread_log](/operations/system-tables/query_thread_log) 表中,而非单独的文件。您可以通过 `table` 参数更改表名(见下文)。

<SystemLogParameters />

如果表不存在,ClickHouse 会自动创建。当 ClickHouse 服务器更新导致查询线程日志结构发生变化时,旧结构的表会被重命名,并自动创建新表。

**示例**

```xml
<query_thread_log>
    <database>system</database>
    <table>query_thread_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_thread_log>
```


## query_views_log {#query_views_log}

用于记录查询所依赖的视图(实时视图、物化视图等)的配置,需配合 [log_query_views=1](/operations/settings/settings#log_query_views) 设置使用。

查询记录在 [system.query_views_log](/operations/system-tables/query_views_log) 表中,而非单独的文件。您可以通过 `table` 参数更改表名(见下文)。

<SystemLogParameters />

如果表不存在,ClickHouse 会自动创建。如果 ClickHouse 服务器更新时查询视图日志的结构发生变化,旧结构的表将被重命名,并自动创建新表。

**示例**

```xml
<query_views_log>
    <database>system</database>
    <table>query_views_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_views_log>
```


## text_log {#text_log}

[text_log](/operations/system-tables/text_log) 系统表的配置,用于记录文本消息。

<SystemLogParameters />

此外:

| 设置 | 描述                                                                 | 默认值 |
| ------- | --------------------------------------------------------------------------- | ------------- |
| `level` | 将存储在表中的最大消息级别(默认为 `Trace`)。 | `Trace`       |

**示例**

```xml
<clickhouse>
    <text_log>
        <level>notice</level>
        <database>system</database>
        <table>text_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <partition_by>event_date</partition_by> -->
        <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    </text_log>
</clickhouse>
```


## trace_log {#trace_log}

[trace_log](/operations/system-tables/trace_log) 系统表的操作设置。

<SystemLogParameters />

默认服务器配置文件 `config.xml` 包含以下设置部分:

```xml
<trace_log>
    <database>system</database>
    <table>trace_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <symbolize>false</symbolize>
</trace_log>
```


## asynchronous_insert_log {#asynchronous_insert_log}

[asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) 系统表的设置,用于记录异步插入操作。

<SystemLogParameters />

**示例**

```xml
<clickhouse>
    <asynchronous_insert_log>
        <database>system</database>
        <table>asynchronous_insert_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </asynchronous_insert_log>
</clickhouse>
```


## crash_log {#crash_log}

[crash_log](../../operations/system-tables/crash_log.md) 系统表的操作设置。

可通过以下子标签配置这些设置:

| 设置                                | 描述                                                                                                                                          | 默认值               | 注意事项                                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `database`                         | 数据库名称。                                                                                                                                   |                     |                                                                                                                    |
| `table`                            | 系统表名称。                                                                                                                                   |                     |                                                                                                                    |
| `engine`                           | 系统表的 [MergeTree 引擎定义](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。                      |                     | 如果已定义 `partition_by` 或 `order_by` 则不能使用。如果未指定,默认使用 `MergeTree`                                          |
| `partition_by`                     | 系统表的[自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                                                     |                     | 如果为系统表指定了 `engine`,则应在 'engine' 内部直接指定 `partition_by` 参数                                                 |
| `ttl`                              | 指定表的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)。                                                |                     | 如果为系统表指定了 `engine`,则应在 'engine' 内部直接指定 `ttl` 参数                                                          |
| `order_by`                         | 系统表的[自定义排序键](/engines/table-engines/mergetree-family/mergetree#order_by)。如果已定义 `engine` 则不能使用。                                 |                     | 如果为系统表指定了 `engine`,则应在 'engine' 内部直接指定 `order_by` 参数                                                      |
| `storage_policy`                   | 表使用的存储策略名称(可选)。                                                                                                                      |                     | 如果为系统表指定了 `engine`,则应在 'engine' 内部直接指定 `storage_policy` 参数                                                |
| `settings`                         | 控制 MergeTree 行为的[附加参数](/engines/table-engines/mergetree-family/mergetree/#settings)(可选)。                                             |                     | 如果为系统表指定了 `engine`,则应在 'engine' 内部直接指定 `settings` 参数                                                      |
| `flush_interval_milliseconds`      | 将数据从内存缓冲区刷新到表的时间间隔。                                                                                                               | `7500`              |                                                                                                                    |
| `max_size_rows`                    | 日志的最大行数。当未刷新日志的数量达到该最大值时,日志将被转储到磁盘。                                                                                   | `1024`              |                                                                                                                    |
| `reserved_size_rows`               | 为日志预分配的内存大小(以行为单位)。                                                                                                                 | `1024`              |                                                                                                                    |
| `buffer_size_rows_flush_threshold` | 行数阈值。达到该阈值时,将在后台启动日志刷新到磁盘的操作。                                                                                             | `max_size_rows / 2` |                                                                                                                    |
| `flush_on_crash`                   | 设置在发生崩溃时是否应将日志转储到磁盘。                                                                                                              | `false`             |                                                                                                                    |

默认服务器配置文件 `config.xml` 包含以下设置部分:

```xml
<crash_log>
    <database>system</database>
    <table>crash_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1024</max_size_rows>
    <reserved_size_rows>1024</reserved_size_rows>
    <buffer_size_rows_flush_threshold>512</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</crash_log>
```


## custom_cached_disks_base_directory {#custom_cached_disks_base_directory}

此设置指定自定义缓存磁盘(通过 SQL 创建)的缓存路径。
对于自定义磁盘,`custom_cached_disks_base_directory` 的优先级高于 `filesystem_caches_path`(位于 `filesystem_caches_path.xml` 中),
当前者不存在时才会使用后者。
文件系统缓存设置路径必须位于该目录内,
否则将抛出异常并阻止磁盘创建。

:::note
这不会影响服务器升级前在旧版本上创建的磁盘。
在这种情况下,不会抛出异常,以确保服务器能够成功启动。
:::

示例:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## backup_log {#backup_log}

[backup_log](../../operations/system-tables/backup_log.md) 系统表的配置，用于记录 `BACKUP` 和 `RESTORE` 操作。

<SystemLogParameters />

**示例**

```xml
<clickhouse>
    <backup_log>
        <database>system</database>
        <table>backup_log</table>
        <flush_interval_milliseconds>1000</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </backup_log>
</clickhouse>
```


## blob_storage_log {#blob_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) 系统表的配置项。

<SystemLogParameters />

示例：

```xml
<blob_storage_log>
    <database>system</database
    <table>blob_storage_log</table
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```


## query_masking_rules {#query_masking_rules}

基于正则表达式的规则,在将查询和所有日志消息存储到服务器日志、
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) 表以及发送到客户端的日志之前应用。这可以防止
SQL 查询中的敏感数据(如姓名、电子邮件、个人标识符或信用卡号)泄漏到日志中。

**示例**

```xml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**配置字段**:

| 设置      | 描述                                                                          |
| --------- | ----------------------------------------------------------------------------- |
| `name`    | 规则的名称(可选)                                                              |
| `regexp`  | RE2 兼容的正则表达式(必需)                                                    |
| `replace` | 敏感数据的替换字符串(可选,默认为六个星号)                                     |

掩码规则应用于整个查询(以防止格式错误或无法解析的查询泄漏敏感数据)。

[`system.events`](/operations/system-tables/events) 表包含计数器 `QueryMaskingRulesMatch`,用于记录查询掩码规则匹配的总次数。

对于分布式查询,每个服务器必须单独配置,否则传递到其他节点的子查询将在未掩码的情况下存储。


## remote_servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) 表引擎和 `cluster` 表函数使用的集群配置。

**示例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

有关 `incl` 属性的值,请参阅"[配置文件](/operations/configuration-files)"章节。

**另请参阅**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [集群发现](../../operations/cluster-discovery.md)
- [Replicated 数据库引擎](../../engines/database-engines/replicated.md)


## remote_url_allow_hosts {#remote_url_allow_hosts}

允许在 URL 相关存储引擎和表函数中使用的主机列表。

使用 `\<host\>` XML 标签添加主机时:

- 必须与 URL 中的形式完全一致,因为主机名会在 DNS 解析之前进行检查。例如:`<host>clickhouse.com</host>`
- 如果 URL 中明确指定了端口,则会将 host:port 作为整体进行检查。例如:`<host>clickhouse.com:80</host>`
- 如果指定主机时未指定端口,则允许该主机的任意端口。例如:如果指定了 `<host>clickhouse.com</host>`,则允许 `clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) 等。
- 如果主机指定为 IP 地址,则按 URL 中指定的形式进行检查。例如:`[2a02:6b8:a::a]`。
- 如果存在重定向且已启用重定向支持,则会检查每个重定向(location 字段)。

例如:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## timezone {#timezone}

服务器时区。

以 IANA 标识符的形式指定 UTC 时区或地理位置(例如 Africa/Abidjan)。

时区用于以下场景:当 DateTime 字段输出为文本格式(打印到屏幕或文件)时,需要在 String 和 DateTime 格式之间进行转换;以及从字符串获取 DateTime 时。此外,如果处理时间和日期的函数在输入参数中未指定时区,则会使用此时区设置。

**示例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**另请参阅**

- [session_timezone](../settings/settings.md#session_timezone)


## tcp_port {#tcp_port}

通过 TCP 协议与客户端通信的端口。

**示例**

```xml
<tcp_port>9000</tcp_port>
```


## tcp_port_secure {#tcp_port_secure}

用于与客户端进行安全通信的 TCP 端口。需配合 [OpenSSL](#openssl) 设置使用。

**默认值**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## mysql_port {#mysql_port}

用于通过 MySQL 协议与客户端通信的端口。

:::note

- 正整数指定要监听的端口号
- 空值用于禁用通过 MySQL 协议与客户端的通信。
  :::

**示例**

```xml
<mysql_port>9004</mysql_port>
```


## postgresql_port {#postgresql_port}

用于通过 PostgreSQL 协议与客户端通信的端口。

:::note

- 正整数指定要监听的端口号
- 空值用于禁用通过 PostgreSQL 协议与客户端的通信
  :::

**示例**

```xml
<postgresql_port>9005</postgresql_port>
```


## mysql_require_secure_transport {#mysql_require_secure_transport}

如果设置为 true,则要求客户端通过 [mysql_port](#mysql_port) 进行安全通信。带有 `--ssl-mode=none` 选项的连接将被拒绝。需配合 [OpenSSL](#openssl) 设置使用。


## postgresql_require_secure_transport {#postgresql_require_secure_transport}

如果设置为 true,则要求客户端通过 [postgresql_port](#postgresql_port) 进行安全通信。使用 `sslmode=disable` 选项的连接将被拒绝。需配合 [OpenSSL](#openssl) 设置使用。


## tmp_path {#tmp_path}

本地文件系统上用于存储处理大型查询时产生的临时数据的路径。

:::note

- 配置临时数据存储时只能使用以下选项之一：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
- 路径末尾的斜杠为必填项。
  :::

**示例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## url_scheme_mappers {#url_scheme_mappers}

用于将缩短或符号化的 URL 前缀转换为完整 URL 的配置。

示例：

```xml
<url_scheme_mappers>
    <s3>
        <to>https://{bucket}.s3.amazonaws.com</to>
    </s3>
    <gs>
        <to>https://storage.googleapis.com/{bucket}</to>
    </gs>
    <oss>
        <to>https://{bucket}.oss.aliyuncs.com</to>
    </oss>
</url_scheme_mappers>
```


## user_files_path {#user_files_path}

用户文件所在目录。用于表函数 [file()](../../sql-reference/table-functions/file.md) 和 [fileCluster()](../../sql-reference/table-functions/fileCluster.md)。

**示例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_scripts_path {#user_scripts_path}

用户脚本文件所在的目录。用于可执行用户自定义函数 [可执行用户自定义函数](/sql-reference/functions/udf#executable-user-defined-functions)。

**示例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

类型：

默认值：


## user_defined_path {#user_defined_path}

存储用户自定义文件的目录。用于 SQL 用户自定义函数 [SQL 用户自定义函数](/sql-reference/functions/udf)。

**示例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## users_config {#users_config}

包含以下内容的文件路径：

- 用户配置。
- 访问权限。
- 配置文件设置。
- 配额设置。

**示例**

```xml
<users_config>users.xml</users_config>
```


## access_control_improvements {#access_control_improvements}

访问控制系统可选改进的设置。

| 设置                                         | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 默认值 |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | 设置没有宽松行策略的用户是否仍可以使用 `SELECT` 查询读取行。例如,如果有两个用户 A 和 B,且仅为 A 定义了行策略,那么当此设置为 true 时,用户 B 将看到所有行。当此设置为 false 时,用户 B 将看不到任何行。                                                                                                                                                                                                                    | `true`  |
| `on_cluster_queries_require_cluster_grant`      | 设置 `ON CLUSTER` 查询是否需要 `CLUSTER` 授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`          | 设置 `SELECT * FROM system.<table>` 是否需要任何授权以及是否可由任何用户执行。如果设置为 true,则此查询需要 `GRANT SELECT ON system.<table>`,与非系统表相同。例外情况:少数系统表(`tables`、`columns`、`databases` 以及一些常量表如 `one`、`contributors`)仍对所有人可访问;并且如果授予了 `SHOW` 权限(例如 `SHOW USERS`),则相应的系统表(即 `system.users`)将可访问。 | `true`  |
| `select_from_information_schema_requires_grant` | 设置 `SELECT * FROM information_schema.<table>` 是否需要任何授权以及是否可由任何用户执行。如果设置为 true,则此查询需要 `GRANT SELECT ON information_schema.<table>`,与普通表相同。                                                                                                                                                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | 设置设置配置文件中某个设置的约束是否会取消该设置的先前约束(在其他配置文件中定义)的操作,包括新约束未设置的字段。它还启用 `changeable_in_readonly` 约束类型。                                                                                                                                                                                                                            | `true`  |
| `table_engines_require_grant`                   | 设置使用特定表引擎创建表是否需要授权。                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`            | 设置角色在角色缓存中存储的时长(自上次访问以来的秒数)。                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`   |

示例:

```xml
<access_control_improvements>
    <users_without_row_policies_can_read_rows>true</users_without_row_policies_can_read_rows>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
    <select_from_system_db_requires_grant>true</select_from_system_db_requires_grant>
    <select_from_information_schema_requires_grant>true</select_from_information_schema_requires_grant>
    <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
    <table_engines_require_grant>false</table_engines_require_grant>
    <role_cache_expiration_time_seconds>600</role_cache_expiration_time_seconds>
</access_control_improvements>
```


## s3queue_log {#s3queue_log}

`s3queue_log` 系统表的配置。

<SystemLogParameters />

默认配置如下:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```


## dead_letter_queue {#dead_letter_queue}

用于配置 'dead_letter_queue' 系统表的设置。

<SystemLogParameters />

默认设置如下：

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```


## zookeeper {#zookeeper}

包含允许 ClickHouse 与 [ZooKeeper](http://zookeeper.apache.org/) 集群交互的设置。ClickHouse 在使用复制表时使用 ZooKeeper 存储副本的元数据。如果不使用复制表,可以省略此参数部分。

以下设置可以通过子标签进行配置:

| 设置                                        | 描述                                                                                                                                                                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeper 端点。可以设置多个端点。例如:`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性指定尝试连接 ZooKeeper 集群时的节点顺序。 |
| `session_timeout_ms`                       | 客户端会话的最大超时时间,以毫秒为单位。                                                                                                                                                                                      |
| `operation_timeout_ms`                     | 单个操作的最大超时时间,以毫秒为单位。                                                                                                                                                                                           |
| `root` (可选)                          | 用作 ClickHouse 服务器所使用 znode 的根节点。                                                                                                                                                 |
| `fallback_session_lifetime.min` (可选) | 当主节点不可用时(负载均衡),备用节点 ZooKeeper 会话生命周期的最小限制。以秒为单位设置。默认值:3 小时。                                                                   |
| `fallback_session_lifetime.max` (可选) | 当主节点不可用时(负载均衡),备用节点 ZooKeeper 会话生命周期的最大限制。以秒为单位设置。默认值:6 小时。                                                                   |
| `identity` (可选)                      | ZooKeeper 访问所请求 znode 所需的用户名和密码。                                                                                                                                                                                          |
| `use_compression` (可选)               | 如果设置为 true,则在 Keeper 协议中启用压缩。                                                                                                                                                                                       |

还有 `zookeeper_load_balancing` 设置(可选),用于选择 ZooKeeper 节点选择算法:

| 算法名称                  | 描述                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `random`                        | 随机选择一个 ZooKeeper 节点。                                                                                       |
| `in_order`                      | 选择第一个 ZooKeeper 节点,如果不可用则选择第二个,依此类推。                                            |
| `nearest_hostname`              | 选择主机名与服务器主机名最相似的 ZooKeeper 节点,通过名称前缀比较主机名。 |
| `hostname_levenshtein_distance` | 与 nearest_hostname 类似,但使用莱文斯坦距离方式比较主机名。                                         |
| `first_or_random`               | 选择第一个 ZooKeeper 节点,如果不可用则从剩余 ZooKeeper 节点中随机选择一个。                |
| `round_robin`                   | 选择第一个 ZooKeeper 节点,如果发生重新连接则选择下一个节点。                                                    |

**配置示例**

```xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <session_timeout_ms>30000</session_timeout_ms>
    <operation_timeout_ms>10000</operation_timeout_ms>
    <!-- 可选。Chroot 后缀。应该存在。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- 可选。ZooKeeper 摘要 ACL 字符串。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**另请参阅**

- [复制](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper 程序员指南](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse 与 ZooKeeper 之间的可选安全通信](/operations/ssl-zookeeper)


## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeper 中数据分片头的存储方式。此设置仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family) 系列引擎。可以通过以下方式指定:

**在 `config.xml` 文件的 [merge_tree](#merge_tree) 部分进行全局设置**

ClickHouse 将此设置应用于服务器上的所有表。您可以随时更改此设置。当设置更改时,现有表的行为也会随之改变。

**为每个表单独设置**

在创建表时,指定相应的[引擎设置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。具有此设置的现有表的行为不会改变,即使全局设置发生变化。

**可选值**

- `0` — 关闭功能。
- `1` — 开启功能。

如果设置 [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper),则[复制表](../../engines/table-engines/mergetree-family/replication.md)会使用单个 `znode` 以紧凑方式存储数据分片的头信息。如果表包含大量列,此存储方式可以显著减少 Zookeeper 中存储的数据量。

:::note
应用 `use_minimalistic_part_header_in_zookeeper = 1` 后,您无法将 ClickHouse 服务器降级到不支持此设置的版本。在集群服务器上升级 ClickHouse 时需谨慎。不要一次性升级所有服务器。更安全的做法是在测试环境中或仅在集群的少数服务器上测试新版本的 ClickHouse。

已使用此设置存储的数据分片头无法恢复到之前的(非紧凑)表示形式。
:::


## distributed_ddl {#distributed_ddl}

管理在集群上执行[分布式 DDL 查询](../../sql-reference/distributed-ddl.md)(`CREATE`、`DROP`、`ALTER`、`RENAME`)。
仅在启用 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 时有效。

`<distributed_ddl>` 中的可配置设置包括:

| 设置                   | 描述                                                                                                                              | 默认值                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `path`                 | Keeper 中用于 DDL 查询的 `task_queue` 路径                                                                                         |                                        |
| `profile`              | 用于执行 DDL 查询的配置文件                                                                                                        |                                        |
| `pool_size`            | 可同时运行的 `ON CLUSTER` 查询数量                                                                                               |                                        |
| `max_tasks_in_queue`   | 队列中可容纳的最大任务数                                                                             | `1,000`                                |
| `task_max_lifetime`    | 当节点存在时间超过此值时删除该节点                                                                                | `7 * 24 * 60 * 60`(一周的秒数)         |
| `cleanup_delay_period` | 当上次清理时间距今超过 `cleanup_delay_period` 秒时,收到新节点事件后开始清理 | `60` 秒                                |

**示例**

```xml
<distributed_ddl>
    <!-- ZooKeeper 中 DDL 查询队列的路径 -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- 此配置文件中的设置将用于执行 DDL 查询 -->
    <profile>default</profile>

    <!-- 控制可同时运行的 ON CLUSTER 查询数量 -->
    <pool_size>1</pool_size>

    <!--
         清理设置(活动任务不会被删除)
    -->

    <!-- 控制任务 TTL(默认 1 周) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- 控制清理执行频率(以秒为单位) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- 控制队列中可容纳的任务数量 -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```


## access_control_path {#access_control_path}

ClickHouse 服务器存储由 SQL 命令创建的用户和角色配置的文件夹路径。

**另请参阅**

- [访问控制和账户管理](/operations/access-rights#access-control-usage)


## allow_plaintext_password {#allow_plaintext_password}

设置是否允许使用明文密码类型(不安全)。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_no_password {#allow_no_password}

设置是否允许使用不安全的 no_password 密码类型。

```xml
<allow_no_password>1</allow_no_password>
```


## allow_implicit_no_password {#allow_implicit_no_password}

禁止创建无密码用户,除非显式指定 'IDENTIFIED WITH no_password'。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## default_session_timeout {#default_session_timeout}

默认会话超时时间（秒）。

```xml
<default_session_timeout>60</default_session_timeout>
```


## default_password_type {#default_password_type}

设置在类似 `CREATE USER u IDENTIFIED BY 'p'` 查询中自动使用的密码类型。

可接受的值包括:

- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## user_directories {#user_directories}

配置文件中包含以下设置的部分:

- 预定义用户配置文件的路径。
- 存储通过 SQL 命令创建的用户的文件夹路径。
- 存储和复制通过 SQL 命令创建的用户的 ZooKeeper 节点路径。

如果指定了此部分,则不会使用 [users_config](/operations/server-configuration-parameters/settings#users_config) 和 [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) 中的路径。

`user_directories` 部分可以包含任意数量的项,项的顺序表示其优先级(项越靠前优先级越高)。

**示例**

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <local_directory>
        <path>/var/lib/clickhouse/access/</path>
    </local_directory>
</user_directories>
```

用户、角色、行策略、配额和配置文件也可以存储在 ZooKeeper 中:

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <replicated>
        <zookeeper_path>/clickhouse/access/</zookeeper_path>
    </replicated>
</user_directories>
```

您还可以定义 `memory` 部分——表示仅在内存中存储信息而不写入磁盘,以及 `ldap` 部分——表示在 LDAP 服务器上存储信息。

要将 LDAP 服务器添加为本地未定义用户的远程用户目录,请使用以下设置定义单个 `ldap` 部分:

| 设置  | 描述                                                                                                                                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `server` | 在 `ldap_servers` 配置部分中定义的 LDAP 服务器名称之一。此参数为必填项且不能为空。                                                                                                                                                                                                                                                            |
| `roles`  | 包含本地定义角色列表的部分,这些角色将分配给从 LDAP 服务器检索的每个用户。如果未指定角色,用户在身份验证后将无法执行任何操作。如果在身份验证时列出的任何角色未在本地定义,则身份验证尝试将失败,就像提供的密码不正确一样。 |

**示例**

```xml
<ldap>
    <server>my_ldap_server</server>
        <roles>
            <my_local_role1 />
            <my_local_role2 />
        </roles>
</ldap>
```


## top_level_domains_list {#top_level_domains_list}

定义要添加的自定义顶级域名列表,其中每个条目的格式为 `<name>/path/to/file</name>`。

例如:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

另请参阅:

- 函数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) 及其变体,
  该函数接受自定义 TLD 列表名称,返回域名中从顶级域名到第一个有效子域名的部分。


## proxy {#proxy}

为 HTTP 和 HTTPS 请求定义代理服务器,目前支持 S3 存储、S3 表函数和 URL 函数。

定义代理服务器有三种方式:

- 环境变量
- 代理列表
- 远程代理解析器

还支持使用 `no_proxy` 为特定主机绕过代理服务器。

**环境变量**

`http_proxy` 和 `https_proxy` 环境变量允许您为指定协议设置代理服务器。如果您在系统上设置了这些变量,它应该可以无缝工作。

如果指定协议只有一个代理服务器且该代理服务器不会更改,这是最简单的方法。

**代理列表**

此方法允许您为一个协议指定一个或多个代理服务器。如果定义了多个代理服务器,ClickHouse 会以轮询方式使用不同的代理,在服务器之间平衡负载。如果一个协议有多个代理服务器且代理服务器列表不会更改,这是最简单的方法。

**配置模板**

```xml
<proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```

在下面的选项卡中选择父字段以查看其子字段:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段      | 描述                         |
| --------- | ----------------------------------- |
| `<http>`  | 一个或多个 HTTP 代理的列表  |
| `<https>` | 一个或多个 HTTPS 代理的列表 |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| 字段    | 描述          |
| ------- | -------------------- |
| `<uri>` | 代理的 URI |

  </TabItem>
</Tabs>

**远程代理解析器**

代理服务器可能会动态更改。在这种情况下,您可以定义解析器的端点。ClickHouse 向该端点发送一个空的 GET 请求,远程解析器应返回代理主机。ClickHouse 将使用以下模板来构建代理 URI:`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**配置模板**

```xml
<proxy>
    <http>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>80</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </http>

    <https>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>3128</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </https>

</proxy>
```

在下面的选项卡中选择父字段以查看其子字段:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段      | 描述                       |
| --------- | --------------------------------- |
| `<http>`  | 一个或多个解析器的列表\* |
| `<https>` | 一个或多个解析器的列表\* |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| 字段         | 描述                                   |
| ------------ | --------------------------------------------- |
| `<resolver>` | 解析器的端点和其他详细信息 |

:::note
您可以有多个 `<resolver>` 元素,但对于指定协议只使用第一个 `<resolver>`。该协议的任何其他 `<resolver>` 元素都会被忽略。这意味着负载均衡(如果需要)应由远程解析器实现。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| 字段                 | 描述                                                                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<endpoint>`         | 代理解析器的 URI                                                                                                                                                                          |
| `<proxy_scheme>`     | 最终代理 URI 的协议。可以是 `http` 或 `https`。                                                                                                             |
| `<proxy_port>`       | 代理解析器的端口号                                                                                                                                                                  |
| `<proxy_cache_time>` | ClickHouse 应缓存来自解析器的值的时间(以秒为单位)。将此值设置为 `0` 会导致 ClickHouse 在每次 HTTP 或 HTTPS 请求时都联系解析器。 |

  </TabItem>
</Tabs>

**优先级**

代理设置按以下顺序确定:


| 顺序 | 设置                    |
|------|-------------------------|
| 1.   | 远程代理解析器          |
| 2.   | 代理列表                |
| 3.   | 环境变量                |

ClickHouse 会根据请求协议检查优先级最高的解析器类型。如果未定义，
则检查下一个优先级的解析器类型，直到检查到环境解析器为止。
这也支持同时混合使用多种解析器类型。



## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

默认情况下,通过 `HTTP` 代理发起 `HTTPS` 请求时会使用隧道技术(即 `HTTP CONNECT`)。此设置可用于禁用该功能。

**no_proxy**

默认情况下,所有请求都会通过代理。若要对特定主机禁用代理,必须设置 `no_proxy` 变量。
对于列表解析器和远程解析器,可以在 `<proxy>` 子句中设置该变量;对于环境解析器,可以将其设置为环境变量。
该变量支持 IP 地址、域名、子域名以及用于完全绕过的 `'*'` 通配符。前导点会被去除,处理方式与 curl 相同。

**示例**

以下配置会绕过对 `clickhouse.cloud` 及其所有子域名(例如 `auth.clickhouse.cloud`)的代理请求。
同样的规则也适用于 GitLab,即使它带有前导点。`gitlab.com` 和 `about.gitlab.com` 都会绕过代理。

```xml
<proxy>
    <no_proxy>clickhouse.cloud,.gitlab.com</no_proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```


## workload_path {#workload_path}

用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的目录。默认使用服务器工作目录下的 `/workload/` 文件夹。

**示例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**另请参阅**

- [工作负载层次结构](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)


## workload_zookeeper_path {#workload_zookeeper_path}

ZooKeeper 节点的路径,用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询。为确保一致性,所有 SQL 定义都作为单个 znode 的值进行存储。默认情况下不使用 ZooKeeper,定义存储在[磁盘](#workload_path)上。

**示例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**另请参阅**

- [工作负载层次结构](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)


## zookeeper_log {#zookeeper_log}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) 系统表的配置。

可通过以下子标签进行配置:

<SystemLogParameters />

**示例**

```xml
<clickhouse>
    <zookeeper_log>
        <database>system</database>
        <table>zookeeper_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <ttl>event_date + INTERVAL 1 WEEK DELETE</ttl>
    </zookeeper_log>
</clickhouse>
```
