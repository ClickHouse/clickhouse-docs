## asynchronous&#95;metric&#95;log {#asynchronous_metric_log}

在 ClickHouse Cloud 部署中默认启用。

如果在你的环境中该设置不是默认启用的，则根据 ClickHouse 的安装方式不同，你可以按照以下说明来启用或禁用它。

**启用**

要手动开启异步指标日志历史记录收集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` 文件，并写入以下内容：

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

要禁用 `asynchronous_metric_log` 设置，请创建以下文件 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`，内容如下：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />

## auth_use_forwarded_address {#auth_use_forwarded_address}

对通过代理连接的客户端，在认证时使用其源地址。

:::note
此设置应格外谨慎使用，因为转发地址很容易被伪造——接受此类认证的服务器不应被直接访问，而应仅通过受信任的代理访问。
:::

## 备份 {#backups}

用于在执行 [`BACKUP` 和 `RESTORE`](../backup.md) 语句时的备份相关设置。

以下设置可通过子标签进行配置：

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','确定是否允许在同一主机上并发运行多个备份操作。', 'true'),
    ('allow_concurrent_restores', 'Bool', '确定是否允许在同一主机上并发运行多个恢复操作。', 'true'),
    ('allowed_disk', 'String', '使用 `File()` 时用于备份的磁盘。必须先设置此参数才能使用 `File`。', ''),
    ('allowed_path', 'String', '使用 `File()` 时用于备份的路径。必须先设置此参数才能使用 `File`。', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '在比较收集到的元数据后发现不一致的情况下，在进入休眠前尝试收集元数据的次数。', '2'),
    ('collect_metadata_timeout', 'UInt64', '在备份期间收集元数据的超时时间（毫秒）。', '600000'),
    ('compare_collected_metadata', 'Bool', '如果为 true，则会将收集到的元数据与现有元数据进行比较，以确保它们在备份过程中未被更改。', 'true'),
    ('create_table_timeout', 'UInt64', '在恢复期间创建表的超时时间（毫秒）。', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '在协调备份/恢复时遇到版本错误后重试的最大次数。', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '在下一次尝试收集元数据之前的最大休眠时间（毫秒）。', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '在下一次尝试收集元数据之前的最小休眠时间（毫秒）。', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '如果 `BACKUP` 命令失败，ClickHouse 将尝试删除在失败前已复制到备份中的文件；否则会保留这些已复制的文件。', 'true'),
    ('sync_period_ms', 'UInt64', '协调备份/恢复的同步周期（毫秒）。', '5000'),
    ('test_inject_sleep', 'Bool', '用于测试的休眠。', 'false'),
    ('test_randomize_order', 'Bool', '如果为 true，为测试目的随机化某些操作的执行顺序。', 'false'),
    ('zookeeper_path', 'String', '在使用 `ON CLUSTER` 子句时，存储备份和恢复元数据的 ZooKeeper 路径。', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }

| 设置                                                  | 类型       | 描述                                                                 | 默认                    |
| :-------------------------------------------------- | :------- | :----------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | 布尔型      | 确定是否允许在同一主机上同时运行多个备份操作。                                            | `true`                |
| `allow_concurrent_restores`                         | Bool     | 确定是否允许在同一主机上并行执行多个恢复操作。                                            | `true`                |
| `allowed_disk`                                      | 字符串      | 使用 `File()` 时用于备份的磁盘。要使用 `File`，必须先配置此设置。                          | ``                    |
| `allowed_path`                                      | 字符串      | 使用 `File()` 时的备份路径。必须配置此项才能使用 `File`。                              | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt     | 在比较已收集的元数据后如果发现不一致，在进入休眠前重试收集元数据的次数。                               | `2`                   |
| `collect_metadata_timeout`                          | UInt64   | 用于在备份期间收集元数据的超时时间（毫秒）。                                             | `600000`              |
| `compare_collected_metadata`                        | Bool     | 若设置为 `true`，则会将收集的元数据与现有元数据进行比较，以确保它们在备份过程中未发生更改。                  | `true`                |
| `create_table_timeout`                              | UInt64   | 在恢复过程中创建表的超时时间（毫秒）。                                                | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64   | 在协调备份或恢复过程中遇到 bad version 错误时的最大重试次数。                              | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64   | 在下一次尝试收集元数据之前的最大休眠时间（毫秒）。                                          | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64   | 在下一次尝试收集元数据前的最小休眠时间（以毫秒为单位）。                                       | `5000`                |
| `remove_backup_files_after_failure`                 | Bool（布尔） | 如果 `BACKUP` 命令失败，ClickHouse 会尝试删除在失败前已复制到备份中的文件，否则会保留这些已复制的文件原样不动。 | `true`                |
| `sync_period_ms`                                    | UInt64   | 用于协调备份和恢复的同步周期，单位为毫秒。                                              | `5000`                |
| `test_inject_sleep`                                 | Bool     | 测试中的休眠                                                             | `false`               |
| `test_randomize_order`                              | 布尔型      | 如果为 true，则会将某些操作的执行顺序随机化，用于测试。                                     | `false`               |
| `zookeeper_path`                                    | 字符串      | 在使用 `ON CLUSTER` 子句时，ZooKeeper 中存储备份和恢复元数据的路径。                     | `/clickhouse/backups` |

此设置的默认配置如下：

```xml
<backups>
    ....
</backups>
```

## bcrypt&#95;workfactor {#bcrypt_workfactor}

用于 `bcrypt_password` 认证类型的工作因子，该类型使用 [Bcrypt 算法](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)。
工作因子决定了计算哈希值和验证密码所需的计算量和时间。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
对于需要高频鉴权的应用程序，
建议考虑使用其他鉴权方式，
因为在较高成本因子（cost factor）下，bcrypt 的计算开销较大。
:::

## table_engines_require_grant {#table_engines_require_grant}

如果设置为 `true`，用户需要被授予相应权限才能创建具有特定引擎的表，例如：`GRANT TABLE ENGINE ON TinyLog to user`。

:::note
默认情况下，为了向后兼容，使用特定表引擎创建表时会忽略权限检查，不过你可以通过将此设置为 `true` 来更改该行为。
:::

## builtin&#95;dictionaries&#95;reload&#95;interval {#builtin_dictionaries_reload_interval}

以秒为单位设置重新加载内置字典的时间间隔。

ClickHouse 每隔 x 秒重新加载一次内置字典。这样就可以在不重启服务器的情况下“即时”编辑字典。

**示例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

## 压缩 {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的数据压缩设置。

:::note
如果您刚开始使用 ClickHouse，建议不要修改此设置。
:::

**配置模板**：

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

**`<case>` 字段**：

* `min_part_size` – 数据分片的最小大小。
* `min_part_size_ratio` – 数据分片大小与表大小的比例。
* `method` – 压缩方法。可接受的取值：`lz4`、`lz4hc`、`zstd`、`deflate_qpl`。
* `level` – 压缩级别。参见 [Codecs](/sql-reference/statements/create/table#general-purpose-codecs)。

:::note
可以配置多个 `<case>` 区块。
:::

**条件满足时的操作**：

* 如果数据分片满足某个条件集，ClickHouse 使用指定的压缩方法。
* 如果数据分片同时满足多个条件集，ClickHouse 使用第一个匹配的条件集。

:::note
如果某个数据分片不满足任何条件，ClickHouse 使用 `lz4` 压缩。
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

配置用于获取密钥的命令，该密钥将用于[加密编解码器](/sql-reference/statements/create/table#encryption-codecs)。密钥（或多个密钥）应通过环境变量提供，或在配置文件中进行设置。

密钥可以是十六进制字符串，或长度等于 16 字节的普通字符串。

**示例**

从配置中加载：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
不建议在配置文件中存储密钥，这样做并不安全。你可以将密钥移到安全磁盘上的单独配置文件中，然后在 `config.d/` 文件夹中创建指向该配置文件的符号链接。
:::

当密钥为十六进制格式时，从配置中加载：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

从环境变量中加载密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里，`current_key_id` 指定当前用于加密的密钥，而所有已指定的密钥都可用于解密。

以下每种方法都可以应用于多个密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

此处的 `current_key_id` 表示当前用于加密的密钥。

此外，用户可以添加长度必须为 12 字节的 nonce（默认情况下，加密和解密过程使用由全零字节组成的 nonce）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

或者可以设置为十六进制：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
上述所有内容同样适用于 `aes_256_gcm_siv`（但密钥长度必须为 32 字节）。
:::

## error&#95;log {#error_log}

默认情况下处于禁用状态。

**启用**

要手动开启错误历史记录收集功能 [`system.error_log`](../../operations/system-tables/error_log.md)，请创建 `/etc/clickhouse-server/config.d/error_log.xml` 文件，并填写如下内容：

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

要禁用 `error_log` 设置，应创建以下文件 `/etc/clickhouse-server/config.d/disable_error_log.xml`，其内容如下：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## custom&#95;settings&#95;prefixes {#custom_settings_prefixes}

[自定义设置](/operations/settings/query-level#custom_settings) 的前缀列表。多个前缀之间必须以逗号分隔。

**示例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**另请参阅**

* [自定义设置](/operations/settings/query-level#custom_settings)

## core&#95;dump {#core_dump}

配置核心转储（core dump）文件大小的软限制。

:::note
硬限制需通过系统工具进行配置。
:::

**示例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

## default&#95;profile {#default_profile}

默认设置概要。设置概要位于由 `user_config` 设置指定的文件中。

**示例**

```xml
<default_profile>default</default_profile>
```

## dictionaries&#95;config {#dictionaries_config}

字典配置文件的路径。

路径：

* 指定绝对路径或相对于服务器配置文件的相对路径。
* 路径中可以包含通配符 * 和 ?。

另请参阅：

* &quot;[Dictionaries](../../sql-reference/dictionaries/index.md)&quot;。

**示例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```

## user&#95;defined&#95;executable&#95;functions&#95;config {#user_defined_executable_functions_config}

可执行用户自定义函数配置文件的路径。

路径：

* 指定绝对路径或相对于服务器配置文件的相对路径。
* 路径可以包含通配符 * 和 ?。

另请参阅：

* “[可执行用户自定义函数](/sql-reference/functions/udf#executable-user-defined-functions)”。

**示例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```

## format&#95;schema&#95;path {#format_schema_path}

包含输入数据 schema 的目录路径，例如用于 [CapnProto](/interfaces/formats/CapnProto) 格式的 schema。

**示例**

```xml
<!-- 包含各种输入格式架构文件的目录。 -->
<format_schema_path>format_schemas/</format_schema_path>
```

## graphite {#graphite}

将数据发送至 [Graphite](https://github.com/graphite-project)。

配置：

* `host` – Graphite 服务器地址。
* `port` – Graphite 服务器的端口。
* `interval` – 发送间隔（秒）。
* `timeout` – 发送数据的超时时间（秒）。
* `root_path` – 键的前缀。
* `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表发送数据。
* `events` – 从 [system.events](/operations/system-tables/events) 表发送在该时间段内累积的增量数据。
* `events_cumulative` – 从 [system.events](/operations/system-tables/events) 表发送累计数据。
* `asynchronous_metrics` – 从 [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 表发送数据。

你可以配置多个 `<graphite>` 配置段。例如，可以用它们以不同的时间间隔发送不同的数据。

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

## graphite&#95;rollup {#graphite_rollup}

用于对 Graphite 数据进行降采样的设置。

更多详情参见 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)。

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

## google&#95;protos&#95;path {#google_protos_path}

定义一个包含 Protobuf 类型所需 proto 文件的目录。

示例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```

## http&#95;handlers {#http_handlers}

允许使用自定义 HTTP 处理器。
要添加一个新的 http 处理器，只需添加一个新的 `<rule>`。
规则会按照定义的顺序从上到下进行检查，
第一个匹配到的规则会运行对应的处理器。

以下设置可以通过子标签进行配置：

| Sub-tags             | Definition                                                       |
| -------------------- | ---------------------------------------------------------------- |
| `url`                | 用于匹配请求 URL，可以使用前缀 &#39;regex:&#39; 来启用正则匹配（可选）                   |
| `methods`            | 用于匹配请求方法，可以使用逗号分隔多个待匹配方法（可选）                                     |
| `headers`            | 用于匹配请求头，匹配每个子元素（子元素名称为请求头名称），可以使用前缀 &#39;regex:&#39; 来启用正则匹配（可选） |
| `handler`            | 请求处理器                                                            |
| `empty_query_string` | 检查 URL 中是否不存在查询字符串                                               |

`handler` 包含以下设置，这些设置可以通过子标签进行配置：

| Sub-tags           | Definition                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `url`              | 重定向的目标地址                                                                                        |
| `type`             | 支持的类型：static、dynamic&#95;query&#95;handler、predefined&#95;query&#95;handler、redirect            |
| `status`           | 与 static 类型配合使用，响应状态码                                                                           |
| `query_param_name` | 与 dynamic&#95;query&#95;handler 类型配合使用，从 HTTP 请求参数中提取并执行名称为 `<query_param_name>` 的参数值           |
| `query`            | 与 predefined&#95;query&#95;handler 类型配合使用，在处理器被调用时执行该查询                                         |
| `content_type`     | 与 static 类型配合使用，响应的 content-type                                                                |
| `response_content` | 与 static 类型配合使用，发送给客户端的响应内容。当使用前缀 &#39;file://&#39; 或 &#39;config://&#39; 时，将从文件或配置中读取内容并发送给客户端 |

除了规则列表之外，你还可以指定 `<defaults/>`，用于启用所有默认处理器。

示例：

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

## http&#95;server&#95;default&#95;response {#http_server_default_response}

在访问 ClickHouse HTTP(s) 服务器时默认显示的页面。
默认值为 &quot;Ok.&quot;（结尾带有换行符）。

**示例**

在访问 `http://localhost: http_port` 时会打开 `https://tabix.io/`。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```

## http&#95;options&#95;response {#http_options_response}

用于在 `OPTIONS` HTTP 请求的响应中添加响应头。
`OPTIONS` 方法用于发起 CORS 预检请求。

更多信息参见 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)。

示例：

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

## hsts&#95;max&#95;age {#hsts_max_age}

HSTS 的有效期（单位：秒）。

:::note
值为 `0` 表示 ClickHouse 会禁用 HSTS。若设置为正数，则会启用 HSTS，且 max-age 即为你设置的数值。
:::

**示例**

```xml
<hsts_max_age>600000</hsts_max_age>
```

## mlock&#95;executable {#mlock_executable}

在启动后执行 `mlockall`，以降低首次查询的延迟，并防止在高 IO 负载下 ClickHouse 可执行文件被换出到磁盘。

:::note
建议启用此选项，但会导致启动时间最多增加几秒钟。
请注意，如果没有 `CAP_IPC_LOCK` 能力，此设置将不起作用。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```

## include&#95;from {#include_from}

替换定义所在的文件路径。支持 XML 和 YAML 格式。

有关更多信息，请参阅“[配置文件](/operations/configuration-files)”一节。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```

## interserver&#95;listen&#95;host {#interserver_listen_host}

对可在 ClickHouse 服务器之间交换数据的主机进行限制。
如果使用 Keeper，则同样的限制也会应用于不同 Keeper 实例之间的通信。

:::note
默认情况下，该值等于 [`listen_host`](#listen_host) 设置。
:::

**示例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

类型：

默认值：

## interserver&#95;http&#95;port {#interserver_http_port}

用于 ClickHouse 服务器之间数据交换的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```

## interserver&#95;http&#95;host {#interserver_http_host}

可供其他服务器访问本服务器时使用的主机名。

如果省略，则会以与 `hostname -f` 命令相同的方式确定。

在需要不再绑定到某个特定网络接口时非常有用。

**示例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```

## interserver&#95;https&#95;port {#interserver_https_port}

用于通过 `HTTPS` 在 ClickHouse 服务器之间进行数据交换的端口。

**示例**

```xml
<interserver_https_port>9010</interserver_https_port>
```

## interserver&#95;https&#95;host {#interserver_https_host}

与 [`interserver_http_host`](#interserver_http_host) 类似，不同之处在于，该主机名供其他服务器通过 `HTTPS` 访问本服务器时使用。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```

## interserver&#95;http&#95;credentials {#interserver_http_credentials}

在[复制](../../engines/table-engines/mergetree-family/replication.md)期间用于连接其他服务器的用户名和密码。此外，服务器也使用这些凭据对其他副本进行身份验证。
因此，集群中所有副本的 `interserver_http_credentials` 必须相同。

:::note

* 默认情况下，如果省略 `interserver_http_credentials` 部分，在复制过程中将不使用身份验证。
* `interserver_http_credentials` 设置与 ClickHouse 客户端凭据[配置](../../interfaces/cli.md#configuration_files)无关。
* 这些凭据同时适用于通过 `HTTP` 和 `HTTPS` 进行的复制。
  :::

可以通过子标签配置以下设置：

* `user` — 用户名。
* `password` — 密码。
* `allow_empty` — 如果为 `true`，即使已设置凭据，也允许其他副本在不进行身份验证的情况下连接。如果为 `false`，则拒绝未进行身份验证的连接。默认值：`false`。
* `old` — 包含在凭据轮换期间使用的旧 `user` 和 `password`。可以指定多个 `old` 部分。

**凭据轮换**

ClickHouse 支持在无需同时停止所有副本以更新其配置的情况下，动态轮换 interserver 凭据。可以分几步更改凭据。

要启用身份验证，请将 `interserver_http_credentials.allow_empty` 设置为 `true` 并添加凭据。这样既允许使用身份验证的连接，也允许不使用身份验证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

在所有副本都配置完成后，将 `allow_empty` 设置为 `false`，或者移除该设置。这样会强制要求必须使用新凭据进行身份验证。

要更改现有凭据，将用户名和密码移动到 `interserver_http_credentials.old` 部分，并使用新值更新 `user` 和 `password`。此时，服务器会使用新凭据连接其他副本，并接受使用新旧两套凭据发起的连接。

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

当新凭证已应用于所有副本后，即可删除旧凭证。

## ldap_servers {#ldap_servers}

在此列出 LDAP 服务器及其连接参数，以便：
- 将其用作指定本地用户的认证源，这类用户在认证机制中指定 `ldap` 而不是 `password`
- 将其用作远程用户目录。

可以通过子标签配置以下设置：

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP 服务器主机名或 IP，此参数为必填项且不能为空。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP 服务器端口，如果 `enable_tls` 设置为 true，则默认值为 636，否则为 `389`。                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                      | 用于构造绑定 DN 的模板。最终 DN 将通过在每次认证尝试期间，将模板中的所有 `\{user_name\}` 子串替换为实际的用户名来构造。                                                                                                                                                                                                                                                                                               |
| `user_dn_detection`            | 用于检测已绑定用户实际用户 DN 的 LDAP 搜索参数配置段。当服务器为 Active Directory 时，这主要用于在后续角色映射时的搜索过滤器中。最终用户 DN 将在需要替换 `\{user_dn\}` 子串的地方使用。默认情况下，用户 DN 被设置为绑定 DN，但一旦搜索执行完成，它将被更新为实际检测到的用户 DN 值。 |
| `verification_cooldown`        | 在一次成功的绑定尝试之后的一段时间（以秒为单位），在此期间会假定该用户在所有连续请求中均已成功通过认证，而无需联系 LDAP 服务器。指定 `0`（默认值）以禁用缓存，并强制对每个认证请求都联系 LDAP 服务器。                                                                                                                  |
| `enable_tls`                   | 用于触发与 LDAP 服务器建立安全连接的标志。指定 `no` 以使用明文协议 (`ldap://`)（不推荐）。指定 `yes` 以使用基于 SSL/TLS 的 LDAP (`ldaps://`) 协议（推荐，默认值）。指定 `starttls` 以使用传统 StartTLS 协议（先使用明文协议 `ldap://`，然后升级为 TLS）。                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLS 的最小协议版本。可接受的值为：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（默认值）。                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`             | SSL/TLS 对端证书验证行为。可接受的值为：`never`、`allow`、`try`、`demand`（默认值）。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 证书文件路径。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 证书密钥文件路径。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA 证书文件路径。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | 包含 CA 证书的目录路径。                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 允许的密码套件（使用 OpenSSL 表示法）。                                                                                                                                                                                                                                                                                                                                                                                              |

`user_dn_detection` 设置可以使用子标签进行配置：

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | 用于构造 LDAP 搜索基础 DN 的模板。最终 DN 将通过在 LDAP 搜索期间，将模板中的所有 `\{user_name\}` 和 `\{bind_dn\}` 子串替换为实际用户名和绑定 DN 来构造。                                                                                                       |
| `scope`         | LDAP 搜索的范围。可接受的值为：`base`、`one_level`、`children`、`subtree`（默认值）。                                                                                                                                                                                                                                       |
| `search_filter` | 用于构造 LDAP 搜索过滤器的模板。最终过滤器将通过在 LDAP 搜索期间，将模板中的所有 `\{user_name\}`、`\{bind_dn\}` 和 `\{base_dn\}` 子串替换为实际用户名、绑定 DN 和基础 DN 来构造。注意，特殊字符必须在 XML 中正确转义。  |

示例：

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

示例（典型 Active Directory，已配置用户 DN 检测，以便进行后续角色映射）：

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

## listen&#95;host {#listen_host}

用于限制允许发起请求的主机范围。如果希望服务器响应所有主机，请指定 `::`。

示例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```

## listen&#95;try {#listen_try}

在尝试开始监听时，即使 IPv6 或 IPv4 网络不可用，服务器也不会退出。

**示例**

```xml
<listen_try>0</listen_try>
```

## listen&#95;reuse&#95;port {#listen_reuse_port}

允许多个服务器监听同一地址和端口（address:port）。操作系统会将请求随机路由到某个服务器。不建议启用此设置。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

类型：

默认值：

## listen&#95;backlog {#listen_backlog}

监听套接字的 backlog（待处理连接的队列大小）。默认值 `4096` 与 Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)) 的默认值相同。

通常不需要修改该值，因为：

* 默认值已经足够大，
* 为了接受客户端连接，服务器有单独的线程。

因此，即使你看到 ClickHouse 服务器的 `TcpExtListenOverflows`（来自 `nstat`）为非零且该计数器在增长，也并不意味着需要增大这个值，因为：

* 通常如果 `4096` 都不够，这说明存在某些 ClickHouse 内部的扩展性问题，因此最好报告一个问题（提交 issue）。
* 这并不意味着服务器之后就能处理更多连接（即便可以，到那时客户端可能已经离开或断开连接）。

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```

## logger {#logger}

日志消息的位置和格式。

**键**：

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | 日志级别。可接受的值：`none`（关闭日志），`fatal`，`critical`，`error`，`warning`，`notice`，`information`，`debug`，`trace`，`test`                 |
| `log`                  | 日志文件的路径。                                                                                                                                          |
| `errorlog`             | 错误日志文件的路径。                                                                                                                                    |
| `size`                 | 轮转策略：日志文件的最大大小（字节数）。一旦日志文件大小超过该阈值，它会被重命名并归档，然后创建新的日志文件。 |
| `count`                | 轮转策略：最多保留的历史日志文件数量。                                                                                        |
| `stream_compress`      | 使用 LZ4 压缩日志消息。设置为 `1` 或 `true` 以启用。                                                                                                   |
| `console`              | 启用日志输出到控制台。设置为 `1` 或 `true` 以启用。如果 ClickHouse 不以守护进程模式运行，默认值为 `1`，否则为 `0`。                            |
| `console_log_level`    | 控制台输出的日志级别。默认为 `level`。                                                                                                                 |
| `formatting.type`      | 控制台输出的日志格式。目前仅支持 `json`。                                                                                                 |
| `use_syslog`           | 同时将日志输出转发到 syslog。                                                                                                                                 |
| `syslog_level`         | 输出到 syslog 的日志级别。                                                                                                                                   |
| `async`                | 当为 `true`（默认）时，日志将异步记录（每个输出通道使用一个后台线程）。否则将在调用 LOG 的线程中同步记录。           |
| `async_queue_max_size` | 使用异步日志记录时，队列中等待刷新的最大消息数量。超过部分的消息将被丢弃。                       |
| `startup_level`        | 启动级别，用于在服务器启动时设置根 logger 的级别。启动完成后，日志级别会恢复为 `level` 设置。                                   |
| `shutdown_level`       | 关闭级别，用于在服务器关闭时设置根 logger 的级别。                                                                                            |

**日志格式说明符**

`log` 和 `errorLog` 路径中的文件名支持以下格式说明符，用于生成最终的文件名（目录部分不支持这些说明符）。

“Example” 列展示了在 `2023-07-06 18:32:07` 时的输出结果。

| 说明符  | 说明                                                                                                     | 示例                         |
| ---- | ------------------------------------------------------------------------------------------------------ | -------------------------- |
| `%%` | 字面百分号 (%)                                                                                              | `%`                        |
| `%n` | 换行符                                                                                                    |                            |
| `%t` | 水平制表符字符                                                                                                |                            |
| `%Y` | 年份（十进制表示），例如 2017                                                                                      | `2023`                     |
| `%y` | 年份最后两位，以十进制表示（范围 [00,99]）                                                                              | `23`                       |
| `%C` | 年份的前 2 位数字，以十进制表示（范围 [00,99]）                                                                          | `20`                       |
| `%G` | 四位数的 [ISO 8601 周历年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。通常仅在与 `%V` 搭配使用时才有意义 | `2023`                     |
| `%g` | [基于周的 ISO 8601 年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) 的后 2 位数字，即包含指定周的年份。              | `23`                       |
| `%b` | 缩写的月份名称，例如 Oct（取决于区域设置）                                                                                | `7月`                       |
| `%h` | %b 的同义词                                                                                                | `7月`                       |
| `%B` | 完整的月份名称，例如 “October”（依赖于区域设置）                                                                          | `7月`                       |
| `%m` | 以十进制数字表示的月份（范围为 [01,12]）                                                                               | `07`                       |
| `%U` | 一年中的第几周，以十进制数表示（星期日为每周的第一天）（范围 [00,53]）                                                                | `27`                       |
| `%W` | 以十进制数字表示的一年中的周序号（星期一为每周的第一天）（范围 [00,53]）                                                               | `27`                       |
| `%V` | ISO 8601 周编号（范围 [01,53]）                                                                               | `27`                       |
| `%j` | 一年中的第几天，按十进制数表示（范围为 [001,366]）                                                                         | `187`                      |
| `%d` | 月份中的日期，以零填充的十进制数字表示（范围 [01,31]）。个位数前加前导零。                                                              | `06`                       |
| `%e` | 月份中的日期，使用空格填充的十进制数字（范围 [1,31]）。若为一位数，则在前面补一个空格。                                                        | `&nbsp; 6`                 |
| `%a` | 缩写的星期名称，例如 Fri（取决于区域设置）                                                                                | `周四`                       |
| `%A` | 完整的星期名称，例如 Friday（依区域设置而定）                                                                             | `星期四`                      |
| `%w` | 以整数表示星期几，其中星期日为 0（范围 [0-6]）                                                                            | `4`                        |
| `%u` | 星期几的十进制表示，其中星期一为 1（ISO 8601 格式）（范围 [1-7]）                                                              | `4`                        |
| `%H` | 以十进制表示的小时数，24 小时制（范围 [00-23]）                                                                          | `18`                       |
| `%I` | 以十进制表示的小时数（12 小时制，范围 [01,12]）                                                                          | `06`                       |
| `%M` | 以十进制数表示的分钟（范围 [00,59]）                                                                                 | `32`                       |
| `%S` | 秒（十进制数，范围 [00,60]）                                                                                     | `07`                       |
| `%c` | 标准日期和时间字符串，例如 Sun Oct 17 04:41:13 2010（取决于区域设置）                                                        | `Thu Jul  6 18:32:07 2023` |
| `%x` | 本地化日期表示（取决于区域设置）                                                                                       | `07/06/23`                 |
| `%X` | 本地化的时间表示形式，例如 18:40:20 或 6:40:20 PM（因区域设置而异）                                                           | `18:32:07`                 |
| `%D` | 短格式 MM/DD/YY 日期，与 %m/%d/%y 等价                                                                          | `07/06/23`                 |
| `%F` | 短日期格式 YYYY-MM-DD，与 %Y-%m-%d 等价                                                                         | `2023-07-06`               |
| `%r` | 本地化的 12 小时制时间（取决于区域设置）                                                                                 | `06:32:07 PM`              |
| `%R` | 等同于 &quot;%H:%M&quot;                                                                                  | `18:32`                    |
| `%T` | 等同于 &quot;%H:%M:%S&quot;（ISO 8601 时间格式）                                                                | `18:32:07`                 |
| `%p` | 本地化的 a.m./p.m. 标记（依区域设置而定）                                                                             | `下午`                       |
| `%z` | 以 ISO 8601 格式表示的相对于 UTC 的偏移量（例如 -0430），如果时区信息不可用则留空                                                    | `+0800`                    |
| `%Z` | 与当前语言环境相关的时区名称或缩写；如果时区信息不可用，则为空字符串                                                                     | `Z AWST `                  |

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

若只想在控制台输出日志消息：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**按级别覆盖**

可以单独覆盖某些日志名称的日志级别。例如，要静默日志记录器 “Backup” 和 “RBAC” 的所有消息。

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

要同时将日志消息写入 syslog：

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

| Key        | Description                                                                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | syslog 的地址，格式为 `host\[:port\]`。如果省略，则使用本地 syslog 守护进程。                                                                                                                                       |
| `hostname` | 产生日志的主机名（可选）。                                                                                                                                                                                |
| `facility` | syslog 的 [facility 关键字](https://en.wikipedia.org/wiki/Syslog#Facility)。必须使用大写并以 “LOG&#95;” 为前缀，例如 `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` 等。默认值：如果指定了 `address`，则为 `LOG_USER`，否则为 `LOG_DAEMON`。 |
| `format`   | 日志消息格式。可选值：`bsd` 和 `syslog`。                                                                                                                                                                 |

**日志格式**

可以指定输出到控制台的日志格式。目前仅支持 JSON。

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

要启用对 JSON 日志的支持，请使用以下代码片段：

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- 可按通道单独配置(log、errorlog、console、syslog),或对所有通道进行全局配置(全局配置时省略此项)。 -->
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

可以通过注释掉属性来省略日志属性。例如，如果不希望日志打印 `query_id`，可以注释掉 `<query_id>` 标签。

## send&#95;crash&#95;reports {#send_crash_reports}

用于向 ClickHouse 核心开发团队发送崩溃报告的设置。

特别是在预生产环境中，强烈建议启用此功能。

键：

| Key                   | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| `enabled`             | 控制是否启用该功能的布尔开关，默认为 `true`。设置为 `false` 可避免发送崩溃报告。                                 |
| `send_logical_errors` | `LOGICAL_ERROR` 类似于 `assert`，表示 ClickHouse 中的一个缺陷。此布尔开关用于控制是否发送这些异常（默认值：`true`）。 |
| `endpoint`            | 可自定义用于发送崩溃报告的 endpoint URL。                                                      |

**推荐用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## ssh&#95;server {#ssh_server}

主机密钥的公钥部分会在首次连接时写入 SSH 客户端的 known&#95;hosts 文件中。

主机密钥配置默认处于未启用状态。
取消注释主机密钥配置，并提供相应 SSH 密钥的路径以将其启用：

示例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## tcp&#95;ssh&#95;port {#tcp_ssh_port}

用于 SSH 服务器的端口，允许用户通过 PTY 使用内置客户端进行交互式连接并执行查询。

示例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```

## storage&#95;configuration {#storage_configuration}

允许进行多磁盘存储配置。

存储配置的结构如下：

```xml
<storage_configuration>
    <disks>
        <!-- 配置 -->
    </disks>
    <policies>
        <!-- 配置 -->
    </policies>
</storage_configuration>
```

### 磁盘配置 {#configuration-of-disks}

`disks` 的配置结构如下：

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

以上子标签定义了 `disks` 的以下设置：

| Setting                 | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `<disk_name_N>`         | 磁盘名称，必须唯一。                                     |
| `path`                  | 用于存储服务器数据（`data` 和 `shadow` 目录）的路径。必须以 `/` 结尾。 |
| `keep_free_space_bytes` | 磁盘上预留空闲空间的大小。                                  |

:::note
磁盘的顺序没有影响。
:::

### 策略配置 {#configuration-of-policies}

以上子标签定义了 `policies` 的以下设置：

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | 策略名称。策略名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | 卷名称。卷名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `disk`                       | 位于该卷内部的磁盘。                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`   | 可以驻留在此卷中任一磁盘上的数据分片的最大大小。如果合并结果预计会产生大于 `max_data_part_size_bytes` 的分片，则该分片会被写入下一个卷。基本上，该特性允许你将新的/较小的分片存储在热（SSD）卷上，并在其达到较大尺寸时将其移动到冷（HDD）卷。如果策略仅包含一个卷，请不要使用此选项。                                                                 |
| `move_factor`                | 卷上可用空闲空间的占比。如果可用空间低于该占比，数据将开始转移到下一个卷（如果存在）。在转移过程中，分片按大小从大到小（降序）排序，选择其总大小足以满足 `move_factor` 条件的分片；如果所有分片的总大小仍不足以满足该条件，则会移动所有分片。                                                                                                             |
| `perform_ttl_move_on_insert` | 禁用在插入时移动已过期 TTL 的数据。默认情况下（启用时），如果插入的数据根据 TTL 移动规则已过期，则会立刻被移动到规则中指定的卷/磁盘。如果目标卷/磁盘较慢（例如 S3），这会显著减慢写入。如果禁用该选项，已过期的数据部分会先写入默认卷，然后根据过期 TTL 规则立即移动到指定的卷。 |
| `load_balancing`             | 磁盘负载均衡策略，`round_robin` 或 `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`          | 设置更新所有磁盘可用空间的超时时间（以毫秒为单位）（`0` — 始终更新，`-1` — 从不更新，默认值为 `60000`）。注意，如果磁盘仅由 ClickHouse 使用，并且不会在运行中进行文件系统容量调整，可以使用 `-1`。在其他所有情况下都不推荐这样做，因为最终会导致错误的空间分配。                                                                                                                   |
| `prefer_not_to_merge`        | 禁用在该卷上对数据分片进行合并。注意：这可能有害并导致性能下降。当启用此设置时（不要这样做），禁止在该卷上合并数据（这很糟糕）。这允许控制 ClickHouse 与慢磁盘的交互方式。我们建议完全不要使用此设置。                                                                                                                                                                                       |
| `volume_priority`            | 定义填充卷的优先级（顺序）。值越小，优先级越高。参数值必须是自然数，并且无间断地覆盖从 1 到 N 的范围（N 为指定的最大参数值）。                                                                                                                                                                                                                                                                                                                                 |

对于 `volume_priority`：
- 如果所有卷都设置了该参数，则按指定顺序确定优先级。
- 如果只有_部分_卷设置了该参数，未设置该参数的卷优先级最低。已设置该参数的卷根据该参数值确定优先级，其余卷的优先级由它们在配置文件中的描述顺序相互之间决定。
- 如果_没有任何_卷设置该参数，则按它们在配置文件中的描述顺序确定优先级。
- 各卷的优先级可以不同。

## macros {#macros}

用于复制表的参数替换。

如果不使用复制表，则可以省略此配置。

有关更多信息，请参阅[创建复制表](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)部分。

**示例**

```xml
<macros incl="macros" optional="true" />
```

## replica&#95;group&#95;name {#replica_group_name}

用于 Replicated 数据库的副本组名称。

由 Replicated 数据库创建的集群将由同一副本组中的副本组成。
DDL 查询只会等待同一副本组中的副本完成。

默认为空。

**示例**

```xml
<replica_group_name>备份</replica_group_name>
```

## remap&#95;executable {#remap_executable}

用于将机器码（“text”）的内存重新映射到大页上的设置。

:::note
此功能仍处于高度实验阶段。
:::

示例：

```xml
<remap_executable>false</remap_executable>
```

## max&#95;open&#95;files {#max_open_files}

最大可打开文件数。

:::note
我们建议在 macOS 上使用此选项，因为 `getrlimit()` 函数返回的值不正确。
:::

**示例**

```xml
<max_open_files>262144</max_open_files>
```

## max&#95;session&#95;timeout {#max_session_timeout}

会话的最大超时时长（单位：秒）。

示例：

```xml
<max_session_timeout>3600</max_session_timeout>
```

## merge&#95;tree {#merge_tree}

针对 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的调优设置。

有关更多信息，请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## metric&#95;log {#metric_log}

默认禁用。

**启用**

要手动开启指标历史数据收集功能 [`system.metric_log`](../../operations/system-tables/metric_log.md)，请创建 `/etc/clickhouse-server/config.d/metric_log.xml` 文件，并填入以下内容：

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

要禁用 `metric_log` 设置，请创建以下文件 `/etc/clickhouse-server/config.d/disable_metric_log.xml`，内容如下：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## replicated&#95;merge&#95;tree {#replicated_merge_tree}

针对 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 中各表的微调配置。此设置具有更高优先级。

有关更多信息，请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```

## opentelemetry&#95;span&#95;log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 系统表的设置。

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

SSL 支持由 `libpoco` 库提供。可用的配置选项详见 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)。默认值可在 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) 中找到。

服务器/客户端设置的键名：

| 选项                            | 说明                                                                                                                                                                                                                                                               | 默认值                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 证书私钥文件的路径。该文件也可以同时包含私钥和证书。                                                                                                                                                                                                                                   |                                                                                            |
| `certificateFile`             | PEM 格式的客户端/服务器证书文件路径。如果 `privateKeyFile` 已包含证书，则可以省略本项。                                                                                                                                                                                                          |                                                                                            |
| `caConfig`                    | 包含受信任 CA 证书的文件或目录路径。若指向文件，则该文件必须为 PEM 格式，并且可以包含多个 CA 证书。若指向目录，则该目录中每个 CA 证书必须对应一个 .pem 文件。文件名是根据 CA 主体名称的哈希值进行查找的。更多细节请参阅 [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) 的 man 手册。 |                                                                                            |
| `verificationMode`            | 用于校验节点证书的方法。详细信息请参见 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的描述。可选值：`none`、`relaxed`、`strict`、`once`。                                                                                        | `relaxed`                                                                                  |
| `verificationDepth`           | 验证链的最大长度。如果证书链长度超过该值，则验证将失败。                                                                                                                                                                                                                                     | `9`                                                                                        |
| `loadDefaultCAFile`           | 是否使用 OpenSSL 的内置 CA 证书。ClickHouse 假定 OpenSSL 的内置 CA 证书位于文件 `/etc/ssl/cert.pem`（或对应的目录 `/etc/ssl/certs`）中，或者位于由环境变量 `SSL_CERT_FILE`（或对应的 `SSL_CERT_DIR`）指定的文件（或目录）中。                                                                                              | `true`                                                                                     |
| `cipherList`                  | 支持的 OpenSSL 加密算法。                                                                                                                                                                                                                                                | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | 启用或禁用会话缓存。必须与 `sessionIdContext` 一起使用。可选值：`true`、`false`。                                                                                                                                                                                                        | `false`                                                                                    |
| `sessionIdContext`            | 服务器为每个生成的标识符追加的一组唯一的随机字符。该字符串的长度不得超过 `SSL_MAX_SSL_SESSION_ID_LENGTH`。始终建议设置此参数，因为无论是服务器缓存会话还是客户端请求缓存，它都有助于避免出现问题。                                                                                                                                                | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | 服务器可缓存的最大会话数量。值为 `0` 表示不限制会话数量。                                                                                                                                                                                                                                  | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | 会话在服务器上的缓存时间（单位：小时）。                                                                                                                                                                                                                                             | `2`                                                                                        |
| `extendedVerification`        | 如果启用此选项，请验证证书的 CN 或 SAN 是否与对端主机名匹配。                                                                                                                                                                                                                              | `false`                                                                                    |
| `requireTLSv1`                | 是否要求使用 TLSv1 连接。可选值：`true`、`false`。                                                                                                                                                                                                                              | `false`                                                                                    |
| `requireTLSv1_1`              | 是否要求使用 TLSv1.1 连接。可选值：`true`、`false`。                                                                                                                                                                                                                            | `false`                                                                                    |
| `requireTLSv1_2`              | 是否要求 TLSv1.2 连接。可选值：`true`、`false`。                                                                                                                                                                                                                              | `false`                                                                                    |
| `fips`                        | 启用 OpenSSL 的 FIPS 模式。仅当该库所使用的 OpenSSL 版本支持 FIPS 时才受支持。                                                                                                                                                                                                           | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 用于请求私钥访问口令的类（PrivateKeyPassphraseHandler 的子类）。例如：`<privateKeyPassphraseHandler>`、`<name>KeyFileHandler</name>`、`<options><password>test</password></options>`、`</privateKeyPassphraseHandler>`。                                                                  | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 用于验证无效证书的类（CertificateHandler 的子类）。例如：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`。                                                                                                                          | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 禁止使用的协议。                                                                                                                                                                                                                                                         |                                                                                            |
| `preferServerCiphers`         | 客户端优先的服务器端密码套件。                                                                                                                                                                                                                                                  | `false`                                                                                    |

**配置示例：**

```xml
<openSSL>
    <server>
        <!-- openssl req -subj "/CN=localhost" -new -newkey rsa:2048 -days 365 -nodes -x509 -keyout /etc/clickhouse-server/server.key -out /etc/clickhouse-server/server.crt -->
        <certificateFile>/etc/clickhouse-server/server.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/server.key</privateKeyFile>
        <!-- openssl dhparam -out /etc/clickhouse-server/dhparam.pem 4096 -->
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

## part&#95;log {#part_log}

记录与 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 相关的日志事件，例如添加或合并数据。可以使用该日志来模拟合并算法并比较它们的特性，也可以将合并过程可视化。

查询会记录在 [system.part&#95;log](/operations/system-tables/part_log) 表中，而不是单独的文件中。可以通过 `table` 参数（见下文）配置该表的名称。

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

包含数据的目录路径。

:::note
路径末尾必须带斜杠。
:::

**示例**

```xml
<path>/var/lib/clickhouse/</path>
```

## processors&#95;profile&#95;log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) 系统表的相关设置。

<SystemLogParameters />

默认设置如下：

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

将指标数据暴露出来，供 [Prometheus](https://prometheus.io) 抓取。

设置：

* `endpoint` – Prometheus 服务器抓取指标的 HTTP 端点。以 &#39;/&#39; 开头。
* `port` – `endpoint` 使用的端口。
* `metrics` – 暴露 [system.metrics](/operations/system-tables/metrics) 表中的指标。
* `events` – 暴露 [system.events](/operations/system-tables/events) 表中的指标。
* `asynchronous_metrics` – 暴露 [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 表中的当前指标值。
* `errors` - 暴露自上次服务器重启以来按错误码统计的错误数量。也可以从 [system.errors](/operations/system-tables/errors) 中获取这类信息。

**Example**

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

检查（将 `127.0.0.1` 替换为你的 ClickHouse 服务器 IP 地址或主机名）：

```bash
curl 127.0.0.1:9363/metrics
```

## query&#95;log {#query_log}

用于在启用 [log&#95;queries=1](../../operations/settings/settings.md) 设置时记录接收到的查询。

查询会被记录到 [system.query&#95;log](/operations/system-tables/query_log) 表中，而不是单独的文件。可以在 `table` 参数中更改该表的名称（见下文）。

<SystemLogParameters />

如果该表不存在，ClickHouse 会自动创建它。如果在更新 ClickHouse 服务器时查询日志的结构发生了变化，具有旧结构的表会被重命名，并自动创建一个新表。

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

## query&#95;metric&#95;log {#query_metric_log}

默认为禁用。

**启用**

要手动启用指标历史记录收集功能 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/query_metric_log.xml` 文件，内容如下：

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

要禁用 `query_metric_log` 设置，请创建以下文件 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`，内容如下：

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## query&#95;cache {#query_cache}

[查询缓存](../query-cache.md) 配置。

可用的设置如下：

| Setting                   | Description                      | Default Value |
| ------------------------- | -------------------------------- | ------------- |
| `max_size_in_bytes`       | 以字节为单位的最大缓存大小。`0` 表示禁用查询缓存。      | `1073741824`  |
| `max_entries`             | 在缓存中可存储的 `SELECT` 查询结果的最大数量。     | `1024`        |
| `max_entry_size_in_bytes` | 能够被缓存的单个 `SELECT` 查询结果的最大大小（字节）。 | `1048576`     |
| `max_entry_size_in_rows`  | 能够被缓存的单个 `SELECT` 查询结果的最大行数。     | `30000000`    |

:::note

* 修改后的设置会立即生效。
* 查询缓存的数据分配在 DRAM 中。如果内存紧张，请确保为 `max_size_in_bytes` 设置较小的值，或者完全禁用查询缓存。
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

## query&#95;thread&#95;log {#query_thread_log}

用于在启用 [log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads) 设置时记录接收查询的线程。

查询会记录到 [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) 表中，而不是单独的文件中。您可以通过 `table` 参数更改该表的名称（见下文）。

<SystemLogParameters />

如果该表不存在，ClickHouse 会创建它。如果在更新 ClickHouse 服务器后查询线程日志的结构发生了变化，则具有旧结构的表会被重命名，并自动创建一个新表。

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

## query&#95;views&#95;log {#query_views_log}

用于记录视图（live、materialized 等）访问情况的日志设置，受接收到的查询以及 [log&#95;query&#95;views=1](/operations/settings/settings#log_query_views) 设置的影响。

查询会被记录到 [system.query&#95;views&#95;log](/operations/system-tables/query_views_log) 表中，而不是写入单独的文件。可以通过 `table` 参数更改该表的名称（见下文）。

<SystemLogParameters />

如果该表不存在，ClickHouse 会创建它。如果在更新 ClickHouse 服务器时查询视图日志的结构发生变化，旧结构的表会被重命名，并自动创建一个新表。

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

## text&#95;log {#text_log}

用于记录文本消息的 [text&#95;log](/operations/system-tables/text_log) 系统表的设置。

<SystemLogParameters />

此外：

| 设置      | 描述                         | 默认值     |
| ------- | -------------------------- | ------- |
| `level` | 要写入该表的最大消息级别（默认为 `Trace`）。 | `Trace` |

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

## trace&#95;log {#trace_log}

用于 [trace&#95;log](/operations/system-tables/trace_log) 系统表的相关设置。

<SystemLogParameters />

默认的服务器配置文件 `config.xml` 包含以下配置段：

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

## asynchronous&#95;insert&#95;log {#asynchronous_insert_log}

用于配置 [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) 系统表，以记录异步插入操作的日志。

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

## crash&#95;log {#crash_log}

[crash&#95;log](../../operations/system-tables/crash_log.md) 系统表相关操作的设置。

可以通过以下子标签来配置这些设置：

| Setting                            | Description                                                                                                       | Default             | Note                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------ |
| `database`                         | 数据库名称。                                                                                                            |                     |                                                                    |
| `table`                            | 系统表名称。                                                                                                            |                     |                                                                    |
| `engine`                           | 系统表的 [MergeTree 引擎定义](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。 |                     | 如果已定义 `partition_by` 或 `order_by`，则不能使用该参数。如果未指定，则默认使用 `MergeTree` |
| `partition_by`                     | 系统表的[自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                                 |                     | 如果为系统表指定了 `engine`，则应在 &#39;engine&#39; 中直接指定 `partition_by` 参数    |
| `ttl`                              | 指定表的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)。                         |                     | 如果为系统表指定了 `engine`，则应在 &#39;engine&#39; 中直接指定 `ttl` 参数             |
| `order_by`                         | 系统表的[自定义排序键](/engines/table-engines/mergetree-family/mergetree#order_by)。如果已定义 `engine`，则不能使用该参数。                 |                     | 如果为系统表指定了 `engine`，则应在 &#39;engine&#39; 中直接指定 `order_by` 参数        |
| `storage_policy`                   | 表所使用的存储策略名称（可选）。                                                                                                  |                     | 如果为系统表指定了 `engine`，则应在 &#39;engine&#39; 中直接指定 `storage_policy` 参数  |
| `settings`                         | 控制 MergeTree 行为的[附加参数](/engines/table-engines/mergetree-family/mergetree/#settings)（可选）。                          |                     | 如果为系统表指定了 `engine`，则应在 &#39;engine&#39; 中直接指定 `settings` 参数        |
| `flush_interval_milliseconds`      | 将内存中缓冲区的数据刷新到表中的时间间隔。                                                                                             | `7500`              |                                                                    |
| `max_size_rows`                    | 日志的最大行数。当未刷新的日志数量达到 `max_size_rows` 时，会将日志写入磁盘。                                                                   | `1024`              |                                                                    |
| `reserved_size_rows`               | 为日志预分配的内存行数。                                                                                                      | `1024`              |                                                                    |
| `buffer_size_rows_flush_threshold` | 行数阈值。如果达到该阈值，则会在后台触发日志刷盘操作。                                                                                       | `max_size_rows / 2` |                                                                    |
| `flush_on_crash`                   | 设置在发生崩溃时是否应将日志写入磁盘。                                                                                               | `false`             |                                                                    |

默认的服务器配置文件 `config.xml` 包含以下设置部分：

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

## custom&#95;cached&#95;disks&#95;base&#95;directory {#custom_cached_disks_base_directory}

此设置用于指定自定义（通过 SQL 创建的）缓存磁盘的缓存路径。
对于自定义磁盘，`custom_cached_disks_base_directory` 的优先级高于 `filesystem_caches_path`（定义在 `filesystem_caches_path.xml` 中），
如果前者不存在，则使用后者。
文件系统缓存配置的路径必须位于该目录之内，
否则将抛出异常，阻止磁盘被创建。

:::note
这不会影响那些在旧版本中创建、随后升级服务器得到的磁盘。
在这种情况下，为了允许服务器成功启动，将不会抛出异常。
:::

示例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```

## backup&#95;log {#backup_log}

用于 [backup&#95;log](../../operations/system-tables/backup_log.md) 系统表的设置，该系统表用于记录 `BACKUP` 和 `RESTORE` 操作。

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

## blob&#95;storage&#95;log {#blob_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) 系统表的相关设置。

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

## query&#95;masking&#95;rules {#query_masking_rules}

基于正则表达式的规则，在将查询以及所有日志消息写入服务器日志（[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) 表）以及发送给客户端之前应用。这样可以防止 SQL 查询中的敏感数据（例如姓名、电子邮件、个人身份标识信息或信用卡号）泄露到日志中。

**示例**

```xml
<query_masking_rules>
    <rule>
        <name>隐藏 SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**配置字段**：

| Setting   | Description              |
| --------- | ------------------------ |
| `name`    | 规则名称（可选）                 |
| `regexp`  | RE2 兼容的正则表达式（必需）         |
| `replace` | 用于替换敏感数据的字符串（可选，默认是六个星号） |

掩码规则会应用到整个查询上（以防止因格式错误 / 无法解析的查询泄露敏感数据）。

[`system.events`](/operations/system-tables/events) 表中有计数器 `QueryMaskingRulesMatch`，记录查询掩码规则匹配的总次数。

对于分布式查询，每台服务器都必须单独配置，否则传递到其他节点的子查询将会在未进行掩码的情况下被存储。

## remote&#95;servers {#remote_servers}

用于 [Distributed](../../engines/table-engines/special/distributed.md) 表引擎和 `cluster` 表函数的集群配置。

**示例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

有关 `incl` 属性值，请参阅“[配置文件](/operations/configuration-files)”一节。

**另请参阅**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [集群发现](../../operations/cluster-discovery.md)
* [复制数据库引擎](../../engines/database-engines/replicated.md)

## remote&#95;url&#95;allow&#95;hosts {#remote_url_allow_hosts}

允许在与 URL 相关的存储引擎和表函数中使用的主机列表。

在使用 `\<host\>` XML 标签添加主机时：

* 必须与 URL 中的写法完全一致地指定，因为在 DNS 解析之前会先对名称进行检查。例如：`<host>clickhouse.com</host>`
* 如果在 URL 中显式指定了端口，则会将 host:port 作为整体进行检查。例如：`<host>clickhouse.com:80</host>`
* 如果主机未带端口进行指定，则该主机上的任意端口都被允许。例如：如果指定了 `<host>clickhouse.com</host>`，则 `clickhouse.com:20`（FTP）、`clickhouse.com:80`（HTTP）、`clickhouse.com:443`（HTTPS）等都是允许的。
* 如果主机被指定为 IP 地址，则会按 URL 中的写法进行检查。例如：`[2a02:6b8:a::a]`。
* 如果存在重定向且已启用重定向支持，则每一次重定向（location 字段）都会被检查。

例如：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## timezone {#timezone}

服务器的时区。

指定为表示 UTC 时区或地理位置的 IANA 标识符（例如，Africa/Abidjan）。

在 String 与 DateTime 格式之间进行转换时需要使用时区：当以文本格式输出 DateTime 字段（打印到屏幕或写入文件），以及从字符串解析 DateTime 时，都需要依赖时区。除此之外，对于处理时间和日期的函数，如果其输入参数中未显式传入时区，也会使用该时区。

**示例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**另请参见**

* [session&#95;timezone](../settings/settings.md#session_timezone)

## tcp&#95;port {#tcp_port}

用于与客户端进行 TCP 协议通信的端口。

**示例**

```xml
<tcp_port>9000</tcp_port>
```

## tcp&#95;port&#95;secure {#tcp_port_secure}

用于与客户端进行安全通信的 TCP 端口。应配合 [OpenSSL](#openssl) 设置一起使用。

**默认值**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## mysql&#95;port {#mysql_port}

用于通过 MySQL 协议与客户端进行通信的端口。

:::note

* 正整数表示要监听的端口号
* 留空则表示禁用通过 MySQL 协议与客户端的通信。
  :::

**示例**

```xml
<mysql_port>9004</mysql_port>
```

## postgresql&#95;port {#postgresql_port}

用于通过 PostgreSQL 协议与客户端进行通信的端口。

:::note

* 正整数表示要监听的端口号
* 空值表示禁用通过 PostgreSQL 协议与客户端的通信
  :::

**示例**

```xml
<postgresql_port>9005</postgresql_port>
```

## mysql_require_secure_transport {#mysql_require_secure_transport}

如果设置为 true，则要求通过 [mysql_port](#mysql_port) 与客户端进行安全通信。带有 `--ssl-mode=none` 选项的连接将被拒绝。应与 [OpenSSL](#openssl) 相关设置配合使用。

## postgresql_require_secure_transport {#postgresql_require_secure_transport}

当设置为 true 时，要求通过 [postgresql_port](#postgresql_port) 与客户端进行安全通信。带有 `sslmode=disable` 选项的连接将被拒绝。请与 [OpenSSL](#openssl) 相关设置配合使用。

## tmp&#95;path {#tmp_path}

本地文件系统上用于存储大查询处理中临时数据的路径。

:::note

* 临时数据存储只能从以下选项中选择一个进行配置：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
* 路径末尾必须包含斜杠。
  :::

**示例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## url&#95;scheme&#95;mappers {#url_scheme_mappers}

用于将简写或符号化的 URL 前缀映射为完整 URL 的配置。

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

## user&#95;files&#95;path {#user_files_path}

用户文件所在的目录。用于表函数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md)。

**示例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## user&#95;scripts&#95;path {#user_scripts_path}

用户脚本所在的目录。供可执行用户定义函数（Executable User Defined Functions）使用，参见 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)。

**示例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

类型：

默认值：

## user&#95;defined&#95;path {#user_defined_path}

用于存放用户定义文件的目录。供 SQL 用户定义函数使用，详见 [SQL 用户定义函数](/sql-reference/functions/udf)。

**示例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## users&#95;config {#users_config}

包含以下内容的文件的路径：

* 用户配置。
* 访问权限。
* 设置配置文件。
* 配额设置。

**示例**

```xml
<users_config>users.xml</users_config>
```

## access&#95;control&#95;improvements {#access_control_improvements}

访问控制系统可选增强功能的相关设置。

| Setting                                         | Description                                                                                                                                                                                                                                                                                   | Default |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | 设置没有宽松行策略的用户是否仍然可以通过 `SELECT` 查询读取行。例如，如果有两个用户 A 和 B，并且只为 A 定义了行策略，那么当此设置为 true 时，用户 B 将看到所有行；当此设置为 false 时，用户 B 将看不到任何行。                                                                                                                                                                     | `true`  |
| `on_cluster_queries_require_cluster_grant`      | 设置 `ON CLUSTER` 查询是否需要 `CLUSTER` 授权。                                                                                                                                                                                                                                                          | `true`  |
| `select_from_system_db_requires_grant`          | 设置 `SELECT * FROM system.<table>` 是否需要任何权限，以及是否可由任意用户执行。如果设置为 true，则该查询需要 `GRANT SELECT ON system.<table>`，与非 system 表相同。例外情况：少数几个 system 表（`tables`、`columns`、`databases`，以及一些常量表，如 `one`、`contributors`）仍然对所有人可访问；并且如果授予了某个 `SHOW` 权限（例如 `SHOW USERS`），则相应的 system 表（即 `system.users`）将可访问。 | `true`  |
| `select_from_information_schema_requires_grant` | 设置 `SELECT * FROM information_schema.<table>` 是否需要任何权限，以及是否可由任意用户执行。如果设置为 true，则此查询需要 `GRANT SELECT ON information_schema.<table>`，与普通表相同。                                                                                                                                                    | `true`  |
| `settings_constraints_replace_previous`         | 设置配置文件中针对某个设置的约束，是否会覆盖该设置上先前的约束（在其他配置文件中定义），包括那些未被新约束显式设置的字段。它还会启用 `changeable_in_readonly` 约束类型。                                                                                                                                                                                             | `true`  |
| `table_engines_require_grant`                   | 设置在使用特定表引擎创建表时是否需要授权。                                                                                                                                                                                                                                                                         | `false` |
| `role_cache_expiration_time_seconds`            | 设置自上次访问以来角色在 Role Cache 中保留的时间（以秒为单位）。                                                                                                                                                                                                                                                        | `600`   |

Example:

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

## s3queue&#95;log {#s3queue_log}

用于 `s3queue_log` 系统表的设置。

<SystemLogParameters />

默认设置如下：

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```

## dead&#95;letter&#95;queue {#dead_letter_queue}

`dead_letter_queue` 系统表的设置。

<SystemLogParameters />

默认设置为：

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```

## zookeeper {#zookeeper}

包含允许 ClickHouse 与 [ZooKeeper](http://zookeeper.apache.org/) 集群交互的设置。ClickHouse 在使用复制表（replicated tables）时，会使用 ZooKeeper 存储副本的元数据。如果不使用复制表，可以省略本节参数。

以下设置可以通过子标签进行配置：

| Setting                                    | Description                                                                                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeper 端点。可以设置多个端点。例如：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性指定在尝试连接 ZooKeeper 集群时节点的顺序。 |
| `session_timeout_ms`                       | 客户端会话的最大超时时间，单位为毫秒。                                                                                                                |
| `operation_timeout_ms`                     | 单个操作的最大超时时间，单位为毫秒。                                                                                                                 |
| `root` (optional)                          | ClickHouse 服务器用于其 znodes 的根 znode。                                                                                                 |
| `fallback_session_lifetime.min` (optional) | 当主节点不可用时（负载均衡场景），到回退节点的 ZooKeeper 会话生命周期的最小限制。单位为秒。默认值：3 小时。                                                                       |
| `fallback_session_lifetime.max` (optional) | 当主节点不可用时（负载均衡场景），到回退节点的 ZooKeeper 会话生命周期的最大限制。单位为秒。默认值：6 小时。                                                                       |
| `identity` (optional)                      | 访问目标 znodes 时 ZooKeeper 所需的用户名和密码。                                                                                                 |
| `use_compression` (optional)               | 若设为 true，则在 Keeper 协议中启用压缩。                                                                                                        |

还有一个可选设置 `zookeeper_load_balancing`，用于选择 ZooKeeper 节点的负载均衡算法：

| Algorithm Name                  | Description                                       |
| ------------------------------- | ------------------------------------------------- |
| `random`                        | 随机选择一个 ZooKeeper 节点。                              |
| `in_order`                      | 选择第一个 ZooKeeper 节点，如果不可用则选择第二个，依此类推。              |
| `nearest_hostname`              | 选择主机名与服务器主机名最相似的 ZooKeeper 节点，主机名根据名称前缀进行比较。      |
| `hostname_levenshtein_distance` | 与 `nearest_hostname` 类似，但以 Levenshtein 距离方式比较主机名。 |
| `first_or_random`               | 选择第一个 ZooKeeper 节点，如果不可用则从剩余 ZooKeeper 节点中随机选择一个。 |
| `round_robin`                   | 选择第一个 ZooKeeper 节点，如果发生重连，则选择下一个。                 |

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
    <!-- 可选。Chroot 后缀。该路径必须存在。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- 可选。Zookeeper 摘要 ACL 字符串。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**另请参阅**

* [复制](../../engines/table-engines/mergetree-family/replication.md)
* [ZooKeeper 程序员指南](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [ClickHouse 与 ZooKeeper 之间的可选安全通信](/operations/ssl-zookeeper)

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

在 ZooKeeper 中存储数据分片（data part）头部的方式。此设置仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family) 系列表引擎。可以通过以下方式指定：

**在 `config.xml` 文件的 [merge_tree](#merge_tree) 部分中进行全局设置**

ClickHouse 会对服务器上的所有表使用该设置。可以随时更改这一设置。现有表在设置变更后会改变其行为。

**对每个表进行单独设置**

在创建表时，指定相应的 [engine setting](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。已有表在创建时配置了该设置后，其行为不会因全局设置的改变而发生变化。

**可能的取值**

- `0` — 功能关闭。
- `1` — 功能开启。

如果 [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)，则 [replicated](../../engines/table-engines/mergetree-family/replication.md) 表会使用单个 `znode` 以紧凑方式存储数据分片头部。如果表包含大量列，这种存储方式可以显著减少在 ZooKeeper 中存储的数据量。

:::note
在应用 `use_minimalistic_part_header_in_zookeeper = 1` 之后，无法将 ClickHouse 服务器降级到不支持该设置的版本。在集群中的服务器上升级 ClickHouse 时请谨慎操作。不要一次性升级所有服务器。更安全的做法是在测试环境或集群中的少量服务器上先测试新版本的 ClickHouse。

已经使用此设置存储的数据分片头部无法恢复为之前的（非紧凑）表示形式。
:::

## distributed&#95;ddl {#distributed_ddl}

用于管理在集群上执行[分布式 DDL 查询](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）。
仅在启用 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 时生效。

`<distributed_ddl>` 中可配置的参数包括：

| Setting                | Description                                             | Default Value             |
| ---------------------- | ------------------------------------------------------- | ------------------------- |
| `path`                 | Keeper 中用于 DDL 查询 `task_queue` 的路径                      |                           |
| `profile`              | 用于执行 DDL 查询的 profile                                    |                           |
| `pool_size`            | 可同时运行的 `ON CLUSTER` 查询数量                                |                           |
| `max_tasks_in_queue`   | 队列中可存在的最大任务数量。                                          | `1,000`                   |
| `task_max_lifetime`    | 如果节点存在时间超过该值则会被删除。                                      | `7 * 24 * 60 * 60`（一周的秒数） |
| `cleanup_delay_period` | 如果距离上次清理已过去至少 `cleanup_delay_period` 秒，则在接收到新节点事件后开始清理。 | `60` 秒                    |

**示例**

```xml
<distributed_ddl>
    <!-- ZooKeeper 中 DDL 查询队列的路径 -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- 执行 DDL 查询时将使用此配置文件中的设置 -->
    <profile>default</profile>

    <!-- 控制可同时运行的 ON CLUSTER 查询数量 -->
    <pool_size>1</pool_size>

    <!--
         清理设置（活动任务不会被移除）
    -->

    <!-- 控制任务 TTL（默认 1 周）-->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- 控制清理执行频率（以秒为单位）-->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- 控制队列中可容纳的任务数量 -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## access_control_path {#access_control_path}

ClickHouse 服务器用于存储通过 SQL 命令创建的用户和角色配置的文件夹路径。

**另请参阅**

- [访问控制和账户管理](/operations/access-rights#access-control-usage)

## allow&#95;plaintext&#95;password {#allow_plaintext_password}

设置是否允许使用明文密码类型（不安全）。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow&#95;no&#95;password {#allow_no_password}

设置是否允许使用不安全的 `no&#95;password` 密码类型。

```xml
<allow_no_password>1</allow_no_password>
```

## allow&#95;implicit&#95;no&#95;password {#allow_implicit_no_password}

禁止在未显式指定 &#39;IDENTIFIED WITH no&#95;password&#39; 的情况下创建无密码用户。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## default&#95;session&#95;timeout {#default_session_timeout}

默认会话超时时间（秒）。

```xml
<default_session_timeout>60</default_session_timeout>
```

## default&#95;password&#95;type {#default_password_type}

设置在类似 `CREATE USER u IDENTIFIED BY 'p'` 这样的查询中自动设置的密码类型。

可接受的值为：

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```

## user&#95;directories {#user_directories}

配置文件中包含以下设置的部分：

* 预定义用户配置文件的路径。
* 通过 SQL 命令创建的用户所存储的文件夹路径。
* 通过 SQL 命令创建并进行复制的用户在 ZooKeeper 中存储的节点路径。

如果指定了此部分，则不会使用 [users&#95;config](/operations/server-configuration-parameters/settings#users_config) 和 [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) 中的路径。

`user_directories` 部分可以包含任意数量的条目，条目的顺序表示其优先级（位置越靠前优先级越高）。

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

用户、角色、行级策略、配额和设置配置文件也可以存储在 ZooKeeper 中：

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

你还可以定义 `memory` 节 —— 表示仅在内存中存储信息，不写入磁盘，以及 `ldap` 节 —— 表示在 LDAP 服务器上存储信息。

要将 LDAP 服务器添加为远程用户目录，用于那些未在本地定义的用户，请定义一个单独的 `ldap` 节，并使用以下设置：

| Setting  | Description                                                                                                           |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| `server` | 在 `ldap_servers` 配置节中定义的某个 LDAP 服务器名称。此参数为必填项，不能为空。                                                                   |
| `roles`  | 包含本地定义角色列表的节，这些角色将被分配给从 LDAP 服务器获取的每个用户。如果未指定任何角色，用户在通过身份验证后将无法执行任何操作。如果在身份验证时，列出的任意角色在本地尚未定义，则身份验证尝试将失败，就像提供了错误密码一样。 |

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

## top&#95;level&#95;domains&#95;list {#top_level_domains_list}

定义要添加的自定义顶级域名列表，其中每个条目的格式为 `<name>/path/to/file</name>`。

例如：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

另请参阅：

* 函数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) 及其变体，
  它接受一个自定义 TLD 列表的名称，并返回域名中包含顶级子域在内、直到第一个重要子域名的那一部分。

## proxy {#proxy}

为 HTTP 和 HTTPS 请求定义代理服务器，目前 S3 存储、S3 表函数以及 URL 函数支持该功能。

定义代理服务器有三种方式：

* 环境变量
* 代理列表
* 远程代理解析器。

还可以通过使用 `no_proxy` 为特定主机绕过代理服务器。

**环境变量**

通过环境变量 `http_proxy` 和 `https_proxy` 可以为相应协议指定
代理服务器。如果已在系统中进行了配置，将会自动生效并无缝工作。

如果某个协议只有一个代理服务器且该代理服务器不会变化，
这是最简单的方式。

**代理列表**

这种方式允许为某个协议指定一个或多个
代理服务器。如果定义了多个代理服务器，
ClickHouse 会以轮询（round-robin）的方式使用不同的代理，以在服务器之间平衡
负载。如果某个协议有多个代理服务器，并且代理服务器列表不会变化，这是最简单的方式。

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

在下方的选项卡中选择一个父字段以查看其子字段：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | 字段        | 描述                |
    | --------- | ----------------- |
    | `<http>`  | 一个或多个 HTTP 代理的列表  |
    | `<https>` | 一个或多个 HTTPS 代理的列表 |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | 字段      | 描述      |
    | ------- | ------- |
    | `<uri>` | 代理的 URI |
  </TabItem>
</Tabs>

**远程代理解析器**

代理服务器可能会动态变化。在这种情况下，可以定义解析器的端点（endpoint）。ClickHouse 会向该端点发送一个空的 GET 请求，远程解析器应返回代理主机。
ClickHouse 将使用以下模板构造代理 URI：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

在下方选项卡中选择一个父级字段以查看其子级字段：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | 字段        | 描述                  |
    | --------- | ------------------- |
    | `<http>`  | 一个或多个 resolver 的列表* |
    | `<https>` | 一个或多个 resolver 的列表* |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | 字段           | 描述                               |
    | ------------ | -------------------------------- |
    | `<resolver>` | resolver 的端点以及该 resolver 的其他详细信息 |

    :::note
    您可以定义多个 `<resolver>` 元素，但对于给定协议，只会使用第一个
    `<resolver>`。对于该协议的其他任意 `<resolver>`
    元素都会被忽略。这意味着（如有需要）负载均衡应由远程 resolver 实现。
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | 字段                   | 描述                                                                                                |
    | -------------------- | ------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | 代理 resolver 的 URI                                                                                 |
    | `<proxy_scheme>`     | 最终代理 URI 的协议。可以是 `http` 或 `https`。                                                                |
    | `<proxy_port>`       | 代理 resolver 的端口号                                                                                  |
    | `<proxy_cache_time>` | ClickHouse 应该将来自 resolver 的值缓存的时间（秒）。将该值设置为 `0` 会导致 ClickHouse 针对每个 HTTP 或 HTTPS 请求都联系该 resolver。 |
  </TabItem>
</Tabs>

**优先级**

代理设置按以下顺序确定：

| 顺序 | 设置                     |
|------|--------------------------|
| 1.   | 远程代理解析器           |
| 2.   | 代理列表                 |
| 3.   | 环境变量                 |

ClickHouse 会根据请求协议，先检查最高优先级的解析器类型。若未定义，
则会检查优先级次高的解析器类型，直到检查到环境变量解析器为止。
因此也可以混合使用多种解析器类型。

## disable&#95;tunneling&#95;for&#95;https&#95;requests&#95;over&#95;http&#95;proxy {#disable_tunneling_for_https_requests_over_http_proxy}

默认情况下，会使用隧道（即 `HTTP CONNECT`）通过 `HTTP` 代理发起 `HTTPS` 请求。可以通过此设置禁用该行为。

**no&#95;proxy**

默认情况下，所有请求都会经过代理。若要对特定主机禁用代理，必须设置 `no_proxy` 变量。
对于 list 和 remote 解析器，可以在 `<proxy>` 子句中进行设置；对于 environment 解析器，可以通过环境变量进行设置。
它支持 IP 地址、域名、子域名以及用于完全绕过的通配符 `'*'`。开头的点号会被去除，其行为与 curl 一致。

**Example**

下面的配置会绕过对 `clickhouse.cloud` 以及其所有子域名（例如 `auth.clickhouse.cloud`）的代理请求。
GitLab 也是如此，即使它前面带有一个点号。`gitlab.com` 和 `about.gitlab.com` 都会绕过代理。

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

## workload&#95;path {#workload_path}

作为所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询存储位置的目录。默认情况下，使用服务器工作目录下的 `/workload/` 文件夹。

**示例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**另请参阅**

* [工作负载层次结构](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)

## workload&#95;zookeeper&#95;path {#workload_zookeeper_path}

指向 ZooKeeper 节点的路径，用作所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的存储位置。为保持一致性，所有 SQL 定义都会作为同一个 znode 的值进行存储。默认情况下不使用 ZooKeeper，而是将定义存储在[磁盘](#workload_path)上。

**示例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**另请参阅**

* [工作负载层次结构](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)

## zookeeper&#95;log {#zookeeper_log}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) 系统表的设置。

以下设置可以通过子标签进行配置：

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
