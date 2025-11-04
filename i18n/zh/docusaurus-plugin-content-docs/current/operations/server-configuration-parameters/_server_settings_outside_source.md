## asynchronous_metric_log {#asynchronous_metric_log}

在 ClickHouse Cloud 部署中默认启用。

如果在您的环境中默认未启用此设置，您可以根据 ClickHouse 的安装方式，按照以下说明启用或禁用它。

**启用**

要手动开启异步指标日志历史记录收集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` 并包含以下内容：

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

要禁用 `asynchronous_metric_log` 设置，您需创建以下文件 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` 并包含以下内容：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## auth_use_forwarded_address {#auth_use_forwarded_address}

通过代理连接的客户端使用原始地址进行身份验证。

:::note
此设置应谨慎使用，因为转发的地址很容易被伪造 - 接受此类身份验证的服务器不应直接访问，而应通过受信任的代理访问。
:::
## backups {#backups}

备份设置，用于写入 `BACKUP TO File()`。

可以通过子标签配置以下设置：

| Setting                             | Description                                                                                                                                                                    | Default |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                      | 使用 `File()` 时的备份路径。此设置必须设置才能使用 `File`。路径可以相对于实例目录，也可以是绝对路径。                            | `true`  |
| `remove_backup_files_after_failure` | 如果 `BACKUP` 命令失败，ClickHouse 将尝试移除在失败之前已复制到备份的文件，否则它将保留已复制的文件不变。                           | `true`  |

此设置默认配置如下：

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## bcrypt_workfactor {#bcrypt_workfactor}

`bcrypt_password` 身份验证类型的工作因子，使用的是 [Bcrypt 算法](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)。工作因子定义了计算哈希和验证密码所需的计算量和时间。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
对于高频身份验证的应用程序，
考虑使用其他身份验证方法，因为
bcrypt 在较高工作因子下的计算开销较大。
:::
## table_engines_require_grant {#table_engines_require_grant}

如果设置为 true，用户要求获取授权才能使用特定引擎创建表，例如 `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
默认情况下，为了向后兼容，使用特定表引擎创建表时会忽略授权，但是您可以通过将此设置为 true 来改变此行为。
:::
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

在重新加载内置字典之前的秒数间隔。

ClickHouse 每 x 秒重新加载内置字典。这使得可以在不重启服务器的情况下“动态”编辑字典。

**示例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的数据压缩设置。

:::note
我们建议在刚开始使用 ClickHouse 时不要更改此设置。
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

- `min_part_size` – 数据分片的最小大小。
- `min_part_size_ratio` – 数据分片大小与表大小的比例。
- `method` – 压缩方法。可接受的值：`lz4`，`lz4hc`，`zstd`，`deflate_qpl`。
- `level` – 压缩级别。参见 [Codecs](/sql-reference/statements/create/table#general-purpose-codecs)。

:::note
可以配置多个 `<case>` 部分。
:::

**条件满足时的操作**：

- 如果数据分片满足设置的条件，ClickHouse 将使用指定的压缩方法。
- 如果数据分片匹配多个条件集，ClickHouse 将使用第一个匹配的条件集。

:::note
如果数据分片没有满足条件，ClickHouse 将使用 `lz4` 压缩。
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

配置一个命令以获取用于 [加密编解码器](/sql-reference/statements/create/table#encryption-codecs) 的密钥。密钥（或多个密钥）应写入环境变量或在配置文件中设置。

密钥可以是 hex 或长度为 16 字节的字符串。

**示例**

从配置加载：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
不建议将密钥存储在配置文件中。这不安全。您可以将密钥移动到安全磁盘上的单独配置文件中，并在 `config.d/` 文件夹中放置该配置文件的符号链接。
:::

从配置加载，当密钥为 hex 时：

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

这里 `current_key_id` 设置当前加密密钥，并且所有指定的密钥可以用于解密。

每种方法都可以用于多个密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 显示当前的加密密钥。

此外，用户可以添加必须为 12 字节长的 nonce（默认情况下，加密和解密过程使用由零字节组成的 nonce）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

或者可以设置为 hex：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上述所有内容可适用于 `aes_256_gcm_siv`（但密钥必须为 32 字节长）。
:::
## error_log {#error_log}

默认情况下禁用。

**启用**

要手动开启错误历史记录收集 [`system.error_log`](../../operations/system-tables/error_log.md)，请创建 `/etc/clickhouse-server/config.d/error_log.xml` 并包含以下内容：

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

要禁用 `error_log` 设置，您需创建以下文件 `/etc/clickhouse-server/config.d/disable_error_log.xml` 并包含以下内容：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## custom_settings_prefixes {#custom_settings_prefixes}

[自定义设置](/operations/settings/query-level#custom_settings)的前缀列表。前缀必须用逗号分隔。

**示例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**另见**

- [自定义设置](/operations/settings/query-level#custom_settings)
## core_dump {#core_dump}

配置核心转储文件大小的软限制。

:::note
硬限制通过系统工具配置
:::

**示例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## default_profile {#default_profile}

默认设置配置文件。设置配置文件位于 `user_config` 设置指定的文件中。

**示例**

```xml
<default_profile>default</default_profile>
```
## dictionaries_config {#dictionaries_config}

字典配置文件的路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 * 和 ?。

另见：
- "[字典](../../sql-reference/dictionaries/index.md)"。

**示例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

用户定义可执行函数的配置文件路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 * 和 ?。

另见：
- "[可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions)"。

**示例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## format_schema_path {#format_schema_path}

输入数据模式的目录路径，例如 [CapnProto](../../interfaces/formats.md#capnproto) 格式的模式。

**示例**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## graphite {#graphite}

将数据发送到 [Graphite](https://github.com/graphite-project)。

设置：

- `host` – Graphite 服务器。
- `port` – Graphite 服务器的端口。
- `interval` – 发送的时间间隔，以秒为单位。
- `timeout` – 发送数据的超时，以秒为单位。
- `root_path` – 键的前缀。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表中发送数据。
- `events` – 从 [system.events](/operations/system-tables/events) 表中发送在此时间段内累积的增量数据。
- `events_cumulative` – 从 [system.events](/operations/system-tables/events) 表中发送累积数据。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中发送数据。

您可以配置多个 `<graphite>` 子句。例如，您可以使用此方法以不同时间间隔发送不同的数据。

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

为 Graphite 压缩数据的设置。

有关更多详细信息，请参阅 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)。

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

允许使用自定义 HTTP 处理程序。
要添加新的 http 处理程序，只需添加一个新的 `<rule>`。
规则按从上到下的顺序检查，
第一个匹配的规则将运行处理程序。

以下设置可以通过子标签配置：

| Sub-tags             | Definition                                                                                                                                        |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | 要匹配请求 URL，您可以使用 'regex:' 前缀进行正则匹配（可选）                                                           |
| `methods`            | 要匹配请求方法，您可以使用逗号分隔多个方法匹配（可选）                                                       |
| `headers`            | 要匹配请求头，匹配每个子元素（子元素名称是头名称），您可以使用 'regex:' 前缀进行正则匹配（可选） |
| `handler`            | 请求处理程序                                                                                                                               |
| `empty_query_string` | 检查 URL 中没有查询字符串                                                                                                    |

`handler` 包含以下设置，可以通过子标签配置：

| Sub-tags           | Definition                                                                                                                                                            |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | 重定向位置                                                                                                                                               |
| `type`             | 支持的类型：static, dynamic_query_handler, predefined_query_handler, redirect                                                                                    |
| `status`           | 与 static 类型一起使用，响应状态代码                                                                                                                            |
| `query_param_name` | 与 dynamic_query_handler 类型一起使用，从 HTTP 请求参数中提取和执行与 `<query_param_name>` 值对应的值                             |
| `query`            | 与 predefined_query_handler 类型一起使用，在调用处理程序时执行查询                                                                                     |
| `content_type`     | 与 static 类型一起使用，响应内容类型                                                                                                                           |
| `response_content` | 与 static 类型一起使用，发送到客户端的响应内容，当使用前缀 'file://' 或 'config://' 时，从文件或配置中查找内容并发送给客户端 |

除了规则列表外，您还可以指定 `<defaults/>`，它指定启用所有默认处理程序。

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
## http_server_default_response {#http_server_default_response}

访问 ClickHouse HTTP(s) 服务器时默认显示的页面。
默认值为 "Ok."（末尾带换行）。

**示例**

当访问 `http://localhost: http_port` 时，打开 `https://tabix.io/`。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

用于在 `OPTIONS` HTTP 请求中向响应添加头信息。
`OPTIONS` 方法用于生成 CORS 预检请求。

有关更多信息，请参见 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)。

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
## hsts_max_age {#hsts_max_age}

HSTS 的过期时间（以秒为单位）。

:::note
值为 `0` 表示 ClickHouse 禁用 HSTS。如果您设置为正数，则启用 HSTS，并且 max-age 是您设置的数字。
:::

**示例**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

启动后执行 `mlockall` 以降低初始查询延迟，并在高 IO 负载下防止 ClickHouse 可执行文件被换出。

:::note
推荐启用此选项，但将导致启动时间增加数秒。请注意，此设置在没有 "CAP_IPC_LOCK" 权限的情况下无法使用。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

包含替代项的文件路径。支持 XML 和 YAML 格式。

有关更多信息，请参见 "[配置文件](/operations/configuration-files)"。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

限制可以在 ClickHouse 服务器之间交换数据的主机。
如果使用 Keeper，则同样的限制将适用于不同 Keeper 实例间的通信。

:::note
默认情况下，其值等于 [`listen_host`](#listen_host) 设置。
:::

**示例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

类型：

默认值：
## interserver_http_port {#interserver_http_port}

用于在 ClickHouse 服务器之间交换数据的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_http_host {#interserver_http_host}

其他服务器可以用来访问此服务器的主机名。

如果省略，则按与 `hostname -f` 命令相同的方式定义。

适用于从特定网络接口断开。

**示例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_https_port {#interserver_https_port}

用于通过 `HTTPS` 在 ClickHouse 服务器之间交换数据的端口。

**示例**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_https_host {#interserver_https_host}

类似于 [`interserver_http_host`](#interserver_http_host)，但此主机名可供其他服务器通过 `HTTPS` 访问此服务器。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

用于 [复制](../../engines/table-engines/mergetree-family/replication.md) 时连接到其他服务器的用户名和密码。此外，服务器还使用这些凭证对其他副本进行身份验证。
因此，`interserver_http_credentials` 必须在集群中所有副本中保持一致。

:::note
- 默认情况下，如果省略 `interserver_http_credentials` 部分，则在复制过程中不使用身份验证。
- `interserver_http_credentials` 设置与 ClickHouse 客户端凭证 [配置](../../interfaces/cli.md#configuration_files) 无关。
- 这些凭证适用于通过 `HTTP` 和 `HTTPS` 进行复制。
:::

可以通过子标签配置以下设置：

- `user` — 用户名。
- `password` — 密码。
- `allow_empty` — 如果 `true`，则允许其他副本在设置凭证的情况下无身份验证连接。如果为 `false`，则拒绝没有身份验证的连接。默认值：`false`。
- `old` — 包含凭证轮换期间使用的旧 `user` 和 `password`。可以指定多个 `old` 部分。

**凭证轮换**

ClickHouse 支持动态的跨服务器凭证轮换，而无须同时停止所有副本以更新其配置。凭证可以分几步进行更改。

要启用身份验证，将 `interserver_http_credentials.allow_empty` 设置为 `true` 并添加凭证。这允许进行身份验证的连接和没有身份验证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

配置所有副本后，将 `allow_empty` 设置为 `false` 或删除该设置。这样将使新凭证的身份验证成为强制。

要更改现有凭证，将用户名和密码移动到 `interserver_http_credentials.old` 部分，并用新值更新 `user` 和 `password`。此时，服务器将使用新凭证连接到其他副本，并接受使用新凭证或旧凭证的连接。

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

当所有副本都应用新凭证后，旧凭证可以删除。
## ldap_servers {#ldap_servers}

在此列出 LDAP 服务器及其连接参数，以：
- 将它们用作具有指定“ldap”身份验证机制的专用本地用户的身份验证器，而不是“password”
- 将它们用作远程用户目录。

可以通过子标签配置以下设置：

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP 服务器主机名或 IP，此参数是必需的且不能为空。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP 服务器端口，如果 `enable_tls` 设置为 true，默认是 636，否则为 389。                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                      | 用于构建绑定时的 DN 的模板。在每次身份验证尝试期间，结果 DN 将通过替换模板中所有 `\{user_name\}` 子字符串来构造实际用户名。                                                                                                                                                                                                                               |
| `user_dn_detection`            | 用于检测绑定用户实际用户 DN 的 LDAP 搜索参数部分。这主要用于在服务器为 Active Directory 时用于后续角色映射的搜索过滤器。生成的用户 DN 将在允许的地方替换 `\{user_dn\}` 子字符串。默认情况下，用户 DN 设置为等于绑定 DN，但在执行搜索后，它将使用实际检测到的用户 DN 值进行更新。 |
| `verification_cooldown`        | 成功绑定后的一段时间（以秒为单位），在此期间，用户将被假定为所有连续请求成功通过身份验证，而无需联系 LDAP 服务器。设置为 `0`（默认）以禁用缓存，并强制在每次身份验证请求时联系 LDAP 服务器。                                                                                                                  |
| `enable_tls`                   | 触发与 LDAP 服务器建立安全连接的标志。设置为 `no` 表示纯文本 (`ldap://`) 协议（不推荐）。设置为 `yes` 表示使用 SSL/TLS 的 LDAP (`ldaps://`) 协议（推荐，默认）。设置为 `starttls` 表示使用传统的 StartTLS 协议（纯文本 (`ldap://`) 协议，升级为 TLS）。                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLS 的最低协议版本。接受的值包括：`ssl2`，`ssl3`，`tls1.0`，`tls1.1`，`tls1.2`（默认）。                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`             | SSL/TLS 对等证书验证行为。接受的值包括：`never`，`allow`，`try`，`demand`（默认）。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 证书文件路径。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 证书密钥文件路径。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA 证书文件路径。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | 包含 CA 证书的目录路径。                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 允许的加密套件（以 OpenSSL 表示法）。                                                                                                                                                                                                                                                                                                                                                                                              |

设置 `user_dn_detection` 可以通过子标签配置：

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | 用于构建 LDAP 搜索的基本 DN 的模板。在 LDAP 搜索中，结果 DN 将通过替换模板中的所有 `\{user_name\}` 和 '\{bind_dn\}' 子字符串来构造。                                                                                                       |
| `scope`         | LDAP 搜索的作用域。接受的值包括：`base`，`one_level`，`children`，`subtree`（默认）。                                                                                                                                                                                                                                       |
| `search_filter` | 用于构建 LDAP 搜索的搜索过滤器模板。生成的过滤器将在 LDAP 搜索期间通过替换模板中所有 `\{user_name\}`， `\{bind_dn\}`，和 `\{base_dn\}` 子字符串来构造。请注意，特殊字符必须在 XML 中正确转义。  |

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

示例（典型的 Active Directory，配置了用户 DN 检测以进行后续角色映射）：

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

限制请求来源的主机。如果您希望服务器回应所有请求，请指定 `::`。

示例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

如果 IPv6 或 IPv4 网络在尝试监听时不可用，服务器将不会退出。

**示例**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

允许多个服务器监听同一地址：端口。请求将由操作系统随机路由到某个服务器。建议不要启用此设置。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

类型：

默认值：
## listen_backlog {#listen_backlog}

监听套接字的 backlog（待处理连接的队列大小）。默认值 `4096` 与 linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4) 的值相同。

通常不需要更改此值，因为：
- 默认值已足够大，
- 服务器为接受客户端连接提供了独立线程。

因此即使 `TcpExtListenOverflows` （来自 `nstat`）非零，并且该计数器在 ClickHouse 服务器上增长，也并不意味着需要增加此值，因为：
- 通常，如果 `4096` 不够，这表明存在某种内部 ClickHouse 扩展问题，因此最好报告一个问题。
- 这并不意味着服务器将来可以处理更多连接（即使可以，届时客户端可能已离开或断开连接）。

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

日志消息的位置和格式。

**键**：

| 键                     | 描述                                                                                                                                                            |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | 日志级别。可接受的值：`none`（关闭日志记录），`fatal`，`critical`，`error`，`warning`，`notice`，`information`，`debug`，`trace`，`test`                  |
| `log`                  | 日志文件的路径。                                                                                                                                               |
| `errorlog`             | 错误日志文件的路径。                                                                                                                                           |
| `size`                 | 轮换策略：日志文件的最大大小（以字节为单位）。一旦日志文件大小超过该阈值，它将被重命名并存档，并创建一个新的日志文件。                                     |
| `count`                | 轮换策略：ClickHouse最多保留多少个历史日志文件。                                                                                                             |
| `stream_compress`      | 使用 LZ4 压缩日志消息。设置为 `1` 或 `true` 以启用。                                                                                                            |
| `console`              | 启用控制台日志记录。设置为 `1` 或 `true` 以启用。如果 ClickHouse 不在守护进程模式下运行，默认值为 `1`，否则为 `0`。                                          |
| `console_log_level`    | 控制台输出的日志级别。默认为 `level`。                                                                                                                         |
| `formatting.type`      | 控制台输出的日志格式。目前仅支持 `json`                                                                                                                        |
| `use_syslog`           | 同时将日志输出转发到 syslog。                                                                                                                                  |
| `syslog_level`         | 日志到 syslog 的日志级别。                                                                                                                                   |
| `async`                | 当 `true`（默认）时，日志将异步记录（每个输出通道一个后台线程）。否则它将在调用 LOG 的线程内记录。                                                               |
| `async_queue_max_size` | 使用异步日志记录时，保持在等候刷新队列中的消息最大数量。多余的消息将被丢弃。                                                                                    |
| `startup_level`        | 启动级别用于设置服务器启动时根日志记录器的级别。启动后，日志级别将恢复到 `level` 设置。                                                                     |
| `shutdown_level`       | 关闭级别用于设置服务器关闭时根日志记录器的级别。                                                                                                             |

**日志格式说明符**

`log` 和 `errorLog` 路径中的文件名支持以下格式说明符用于生成的文件名（目录部分不支持它们）。

“示例”列显示输出为 `2023-07-06 18:32:07`。

| 说明符      | 描述                                                                                                               | 示例                      |
|-------------|--------------------------------------------------------------------------------------------------------------------|---------------------------|
| `%%`        | 字面上的 %                                                                                                          | `%`                       |
| `%n`        | 换行符                                                                                                            |                           |
| `%t`        | 水平制表符                                                                                                          |                           |
| `%Y`        | 以十进制数字表示的年份，例如 2017                                                                                     | `2023`                    |
| `%y`        | 以十进制数字表示的年份最后两位数字（范围 [00,99]）                                                                | `23`                      |
| `%C`        | 以十进制数字表示的年份前两位数字（范围 [00,99]）                                                                  | `20`                      |
| `%G`        | 四位数的 [ISO 8601 基于周的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。通常仅与 `%V` 一起使用 | `2023`                    |
| `%g`        | 以十进制数字表示的 [ISO 8601 基于周的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。   | `23`                      |
| `%b`        | 缩写的月份名称，例如 Oct（依赖于区域设置）                                                                         | `Jul`                     |
| `%h`        | %b 的同义词                                                                                                          | `Jul`                     |
| `%B`        | 完整的月份名称，例如 October（依赖于区域设置）                                                                     | `July`                    |
| `%m`        | 以十进制数字表示的月份（范围 [01,12]）                                                                             | `07`                      |
| `%U`        | 以十进制数字表示的年份周数（以星期日为一周的第一天）（范围 [00,53]）                                               | `27`                      |
| `%W`        | 以十进制数字表示的年份周数（以星期一为一周的第一天）（范围 [00,53]）                                               | `27`                      |
| `%V`        | ISO 8601 周数（范围 [01,53]）                                                                                       | `27`                      |
| `%j`        | 以十进制数字表示的年份中的日数（范围 [001,366]）                                                                    | `187`                     |
| `%d`        | 以零填充的十进制数表示的月份中的日（范围 [01,31]）。单个数字前有零。                                               | `06`                      |
| `%e`        | 以空格填充的十进制数表示的月份中的日（范围 [1,31]）。单个数字前有空格。                                            | `&nbsp; 6`                |
| `%a`        | 缩写的星期几名称，例如 Fri（依赖于区域设置）                                                                          | `Thu`                     |
| `%A`        | 完整的星期几名称，例如 Friday（依赖于区域设置）                                                                        | `Thursday`                |
| `%w`        | 以整数表示的星期几，星期日为 0（范围 [0-6]）                                                                         | `4`                       |
| `%u`        | 以十进制数表示的星期几，其中星期一为 1（ISO 8601 格式）（范围 [1-7]）                                               | `4`                       |
| `%H`        | 以十进制数表示的小时，24小时制（范围 [00-23]）                                                                      | `18`                      |
| `%I`        | 以十进制数表示的小时，12小时制（范围 [01,12]）                                                                      | `06`                      |
| `%M`        | 以十进制数表示的分钟（范围 [00,59]）                                                                                | `32`                      |
| `%S`        | 以十进制数表示的秒数（范围 [00,60]）                                                                                | `07`                      |
| `%c`        | 标准日期和时间字符串，例如 Sun Oct 17 04:41:13 2010（依赖于区域设置）                                                | `Thu Jul  6 18:32:07 2023` |
| `%x`        | 本地化的日期表示（依赖于区域设置）                                                                                  | `07/06/23`                |
| `%X`        | 本地化的时间表示，例如 18:40:20 或 6:40:20 PM（依赖于区域设置）                                                      | `18:32:07`                |
| `%D`        | 短的 MM/DD/YY 日期，相当于 %m/%d/%y                                                                                    | `07/06/23`                |
| `%F`        | 短的 YYYY-MM-DD 日期，相当于 %Y-%m-%d                                                                                  | `2023-07-06`              |
| `%r`        | 本地化的 12 小时制时间（依赖于区域设置）                                                                              | `06:32:07 PM`             |
| `%R`        | 相当于 "%H:%M"                                                                                                      | `18:32`                   |
| `%T`        | 相当于 "%H:%M:%S"（ISO 8601 时间格式）                                                                                | `18:32:07`                |
| `%p`        | 本地化的上午或下午标识（依赖于区域设置）                                                                              | `PM`                       |
| `%z`        | ISO 8601 格式的 UTC 偏移（例如 -0430），如果没有时区信息则不显示任何字符                                             | `+0800`                   |
| `%Z`        | 本地化的时区名称或缩写，如果没有时区信息则不显示任何字符                                                               | `Z AWST `                 |

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

仅在控制台打印日志消息：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**每级覆盖**

可以重写单个日志名称的日志级别。例如，您可以静音日志名称为 "Backup" 和 "RBAC" 的所有消息。

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

将日志消息额外写入到 syslog：

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

用于 `<syslog>` 的键：

| 键         | 描述                                                                                                                                                                                                                                        |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | 格式为 `host\[:port\]` 的 syslog 地址。如果省略，则使用本地守护进程。                                                                                                                                                                       |
| `hostname` | 发送日志的主机名（可选）。                                                                                                                                                                                                                   |
| `facility` | syslog [设施关键字](https://en.wikipedia.org/wiki/Syslog#Facility)。必须使用大写字母并带有 "LOG_" 前缀，例如 `LOG_USER`，`LOG_DAEMON`，`LOG_LOCAL3` 等。如果指定了 `address`，默认值为 `LOG_USER`，否则为 `LOG_DAEMON`。                     |
| `format`   | 日志消息格式。可能的值：`bsd` 和 `syslog`。                                                                                                                                                                                                   |

**日志格式**

您可以指定将在控制台日志中输出的日志格式。目前，仅支持 JSON。

**示例**

以下是输出 JSON 日志的示例：

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "Received signal 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

要启用 JSON 日志支持，请使用以下代码段：

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Can be configured on a per-channel basis (log, errorlog, console, syslog), or globally for all channels (then just omit it). -->
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

**重命名 JSON 日志的键**

通过更改 `<names>` 标签中的标签值可以修改键名称。例如，要将 `DATE_TIME` 更改为 `MY_DATE_TIME`，可以使用 `<date_time>MY_DATE_TIME</date_time>`。

**省略 JSON 日志的键**

可以通过注释掉属性来省略日志属性。例如，如果您不希望日志打印 `query_id`，可以注释掉 `<query_id>` 标签。
## send_crash_reports {#send_crash_reports}

发送崩溃报告到 ClickHouse 核心开发团队的设置。

在预生产环境中启用此功能尤为重要。

键：

| 键                    | 描述                                                                                                           |
|-----------------------|----------------------------------------------------------------------------------------------------------------|
| `enabled`             | 布尔标志以启用该功能，默认值为 `true`。设置为 `false` 以避免发送崩溃报告。                                        |
| `send_logical_errors` | `LOGICAL_ERROR` 好比一个 `assert`，它是 ClickHouse 的错误。此布尔标志启用发送此异常（默认值：`true`）。   |
| `endpoint`            | 您可以覆盖发送崩溃报告的端点 URL。                                                                             |

**推荐用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## ssh_server {#ssh_server}

主机密钥的公钥部分将在第一次连接时写入 SSH 客户端的 known_hosts 文件。

主机密钥配置默认是不活动的。
取消注释主机密钥配置，并提供相应 ssh 密钥的路径以激活它们：

示例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## tcp_ssh_port {#tcp_ssh_port}

允许用户通过 PTY 使用嵌入式客户端交互执行查询的 SSH 服务器的端口。

示例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## storage_configuration {#storage_configuration}

允许对存储进行多磁盘配置。

存储配置遵循以下结构：

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
### Configuration of disks {#configuration-of-disks}

`disks` 的配置遵循以下结构：

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

上述子标签为 `disks` 定义了以下设置：

| 设置                   | 描述                                                                                           |
|------------------------|------------------------------------------------------------------------------------------------|
| `<disk_name_N>`        | 磁盘的名称，应该是唯一的。                                                                     |
| `path`                 | 服务器数据将存储到的路径（`data` 和 `shadow` 目录）。应以 `/` 结尾                         |
| `keep_free_space_bytes`| 磁盘上保留的空闲空间大小。                                                                     |

:::note
磁盘的顺序无关紧要。
:::
### Configuration of policies {#configuration-of-policies}

上述子标签为 `policies` 定义了以下设置：

| 设置                          | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`               | 策略名称。策略名称必须是唯一的。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `volume_name_N`               | 卷的名称。卷名称必须是唯一的。                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `disk`                        | 位于卷内的磁盘。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `max_data_part_size_bytes`    | 可以存在于该卷中任何磁盘上的数据块的最大大小。如果合并结果的块大小大于 `max_data_part_size_bytes`，该块将写入下一个卷。基本上，该功能允许您在热（SSD）卷上存储新的/小的块，并在它们达到大尺寸时将它们移动到冷（HDD）卷。如果策略仅包含一个卷，请不要使用此选项。                                                                                                      |
| `move_factor`                 | 卷中可用的空闲空间的份额。如果空间变少，数据将开始转移到下一个卷（如果有的话）。对于转移，块按大小从大到小（降序）排序，并选择总大小足以满足 `move_factor` 条件的块，如果所有块的总大小不足，将移动所有块。                                                                                                                |
| `perform_ttl_move_on_insert`  | 在插入时禁用将过期 TTL 的数据移动。默认情况下（如果启用），如果我们插入的某个数据已经根据生命规则过期，它将立即移动到移动规则中指定的卷/磁盘。如果目标卷/磁盘很慢（例如 S3），这会显著减慢插入速度。如果禁用，则过期的数据部分将写入默认卷，然后立即移动到规则中指定的过期 TTL 的卷。                                                                                      |
| `load_balancing`              | 磁盘平衡策略，`round_robin` 或 `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `least_used_ttl_ms`           | 设置更新所有磁盘上可用空间的超时（以毫秒为单位）（`0` - 始终更新，`-1` - 从不更新，默认值为 `60000`）。注意，如果磁盘仅被 ClickHouse 使用且不会被文件系统动态调整大小，则可以使用 `-1` 值。在所有其他情况下，不建议使用，因为最终会导致空间分配不正确。                                                                                                              |
| `prefer_not_to_merge`         | 禁用合并此卷上的数据部分。注意：这可能会有害，并可能导致性能下降。当启用此设置时（不要这样做），禁止对该卷上的数据进行合并（这是不好的）。这允许控制 ClickHouse 如何与慢磁盘进行交互。我们建议根本不要使用此设置。                                                                                                                                                                        |
| `volume_priority`             | 定义填写卷的优先级（顺序）。值越小，优先级越高。参数值必须是自然数，并覆盖从 1 到 N 的范围（N 为指定的最大参数值），且没有间隔。                                                                                                                                                                                                                                         |

对于 `volume_priority`：
- 如果所有卷都有此参数，则按指定顺序优先排序。
- 如果只有 _某些_ 卷有此参数，则没有此参数的卷优先级最低。有此参数的卷根据标签值优先，其他卷的优先级根据配置文件中的描述顺序确定。
- 如果 _没有_ 卷被赋予该参数，则其顺序由配置文件中的描述顺序确定。
- 卷的优先级可能不相同。
## macros {#macros}

复制表的参数替换。

如果没有使用复制表，则可以省略。

有关更多信息，请参阅 [创建复制表](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) 部分。

**示例**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

复制数据库的副本组名称。

由复制数据库创建的集群将由同一组中的副本组成。DDL 查询将仅等待同一组中的副本。

默认为空。

**示例**

```xml
<replica_group_name>backups</replica_group_name>
```
## remap_executable {#remap_executable}

用于使用大页重新分配机器代码（“文本”的设置）。

:::note
此功能高度实验性。
:::

示例：

```xml
<remap_executable>false</remap_executable>
```
## max_open_files {#max_open_files}

最大打开文件数。

:::note
我们建议在 macOS 中使用此选项，因为 `getrlimit()` 函数返回不正确的值。
:::

**示例**

```xml
<max_open_files>262144</max_open_files>
```
## max_session_timeout {#max_session_timeout}

最大会话超时时间，以秒为单位。

示例：

```xml
<max_session_timeout>3600</max_session_timeout>
```
## merge_tree {#merge_tree}

对[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)中表格的微调。

有关更多信息，请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

默认情况下是禁用的。

**启用**

要手动开启指标历史收集 [`system.metric_log`](../../operations/system-tables/metric_log.md)，创建 `/etc/clickhouse-server/config.d/metric_log.xml` 并使用以下内容：

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

要禁用 `metric_log` 设置，您需要创建以下文件 `/etc/clickhouse-server/config.d/disable_metric_log.xml` 并使用以下内容：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## replicated_merge_tree {#replicated_merge_tree}

对 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 中表格的微调。此设置具有更高优先级。

有关更多信息，请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## opentelemetry_span_log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 系统表的设置。

<SystemLogParameters/>

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

SSL 的支持由 `libpoco` 库提供。可用的配置选项在 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) 中进行了说明。默认值可以在 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) 中找到。

服务器/客户端设置的密钥：

| 选项                          | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 默认值                                   |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `privateKeyFile`              | PEM 证书的私钥文件路径。该文件可以同时包含密钥和证书。                                                                                                                                                                                                                                                                                                                                              |                                          |
| `certificateFile`             | PEM 格式的客户端/服务器证书文件路径。如果 `privateKeyFile` 包含证书，则可以省略此项。                                                                                                                                                                                                                                                                                                                                                |                                          |
| `caConfig`                    | 包含受信任 CA 证书的文件或目录路径。如果指向文件，则必须为 PEM 格式，并且可以包含多个 CA 证书。如果指向目录，则必须为每个 CA 证书包含一个 .pem 文件。文件名通过 CA 主体名称的哈希值查找。详细信息可以在 [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) 的手册页中找到。 |                                          |
| `verificationMode`            | 检查节点证书的方法。详细信息请参见 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的描述。可能的值：`none`、`relaxed`、`strict`、`once`。                                                                                                                                                                                                         | `relaxed`                               |
| `verificationDepth`           | 验证链的最大长度。如果证书链长度超过设置值，则验证将失败。                                                                                                                                                                                                                                                                                                                                            | `9`                                      |
| `loadDefaultCAFile`           | 是否使用 OpenSSL 的内置 CA 证书。ClickHouse 假定内置的 CA 证书位于文件 `/etc/ssl/cert.pem`（或目录 `/etc/ssl/certs`），或在环境变量 `SSL_CERT_FILE`（或 `SSL_CERT_DIR`）指定的文件（或目录）中。                                                                                                                                                                        | `true`                                   |
| `cipherList`                  | 支持的 OpenSSL 加密方式。                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH` |
| `cacheSessions`               | 启用或禁用会话缓存。必须与 `sessionIdContext` 结合使用。可接受的值：`true`、`false`。                                                                                                                                                                                                                                                                                                                                         | `false`                                  |
| `sessionIdContext`            | 一组唯一的随机字符，服务器将其附加到每个生成的标识符中。字符串的长度不得超过 `SSL_MAX_SSL_SESSION_ID_LENGTH`。始终推荐使用此参数，因为它有助于避免服务器缓存会话和客户端请求缓存时的问题。                                                                                                                                                       | `$\{application.name\}`                   |
| `sessionCacheSize`            | 服务器缓存的会话最大数量。值为 `0` 意味着无限制会话。                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                             |
| `sessionTimeout`              | 服务器上缓存会话的时间（小时）。                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                      |
| `extendedVerification`        | 如果启用，验证证书 CN 或 SAN 是否与对等主机名匹配。                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                  |
| `requireTLSv1`                | 要求建立 TLSv1 连接。可接受的值：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                  |
| `requireTLSv1_1`              | 要求建立 TLSv1.1 连接。可接受的值：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                  |
| `requireTLSv1_2`              | 要求建立 TLSv1.2 连接。可接受的值：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                  |
| `fips`                        | 激活 OpenSSL FIPS 模式。仅在库的 OpenSSL 版本支持 FIPS 的情况下有效。                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                  |
| `privateKeyPassphraseHandler` | 请求访问私钥的密码短语的类（PrivateKeyPassphraseHandler 子类）。例如：`<privateKeyPassphraseHandler>`、`<name>KeyFileHandler</name>`、`<options><password>test</password></options>`、`</privateKeyPassphraseHandler>`。                                                                                                                                                                                                | `KeyConsoleHandler`                      |
| `invalidCertificateHandler`   | 验证无效证书的类（CertificateHandler 的子类）。例如：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` 。                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`               |
| `disableProtocols`            | 不允许使用的协议。                                                                                                                                                                                                                                                                                                                                                                                                                             |                                          |
| `preferServerCiphers`         | 客户端优选的服务器密码。                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                  |

**设置示例：**

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
        <!-- Use for self-signed: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Use for self-signed: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```
## part_log {#part_log}

记录与 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 相关的事件。例如，添加或合并数据。您可以使用日志模拟合并算法并比较其特性。您可以通过可视化合并过程。

查询记录在 [system.part_log](/operations/system-tables/part_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中配置此表的名称（见下文）。

<SystemLogParameters/>

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
尾随斜杠是强制的。
:::

**示例**

```xml
<path>/var/lib/clickhouse/</path>
```
## processors_profile_log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) 系统表的设置。

<SystemLogParameters/>

默认设置为：

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

暴露用于从 [Prometheus](https://prometheus.io) 抓取的指标数据。

设置：

- `endpoint` – Prometheus 服务器抓取指标的 HTTP 端点。从 '/' 开始。
- `port` – `endpoint` 的端口。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表中暴露指标。
- `events` – 从 [system.events](/operations/system-tables/events) 表中暴露指标。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中暴露当前指标值。
- `errors` - 暴露自上次服务器重启以来按错误代码发生的错误数量。此信息也可以从 [system.errors](/operations/system-tables/errors) 中获得。

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

记录通过 [log_queries=1](../../operations/settings/settings.md) 设置接收到的查询的设置。

查询记录在 [system.query_log](/operations/system-tables/query_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中更改此表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在更新 ClickHouse 服务器时查询日志的结构发生变化，则旧结构的表将被重命名，并自动创建新表。

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

默认情况下禁用。

**启用**

要手动启用度量历史收集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/query_metric_log.xml` 文件，内容如下：

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

要禁用 `query_metric_log` 设置，您应创建以下文件 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`，内容如下：

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

[查询缓存](../query-cache.md) 配置。

可用的设置如下：

| 设置                     | 描述                                                                            | 默认值          |
|---------------------------|--------------------------------------------------------------------------------|------------------|
| `max_size_in_bytes`       | 最大缓存大小（以字节为单位）。`0` 表示禁用查询缓存。                         | `1073741824`     |
| `max_entries`             | 缓存中存储的 `SELECT` 查询结果的最大数量。                                    | `1024`           |
| `max_entry_size_in_bytes` | `SELECT` 查询结果在缓存中保存最大字节数。                                     | `1048576`        |
| `max_entry_size_in_rows`  | `SELECT` 查询结果在缓存中保存的最大行数。                                     | `30000000`       |

:::note
- 改变的设置会立即生效。
- 查询缓存的数据分配在 DRAM 中。如果内存紧张，请确保将 `max_size_in_bytes` 设置为较小值或完全禁用查询缓存。
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

记录通过 [log_query_threads=1](/operations/settings/settings#log_query_threads) 设置接收到的查询线程的设置。

查询记录在 [system.query_thread_log](/operations/system-tables/query_thread_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中更改此表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在更新 ClickHouse 服务器时查询线程日志的结构发生变化，则旧结构的表将被重命名，并自动创建新表。

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

记录依赖于通过 [log_query_views=1](/operations/settings/settings#log_query_views) 设置接收到的查询的视图（实时的、物化的等）的设置。

查询记录在 [system.query_views_log](/operations/system-tables/query_views_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中更改此表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在更新 ClickHouse 服务器时查询视图日志的结构发生变化，则旧结构的表将被重命名，并自动创建新表。

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

用于记录文本消息的 [text_log](/operations/system-tables/text_log) 系统表的设置。

<SystemLogParameters/>

此外：

| 设置   | 描述                                                                                                                                                                                                 | 默认值       |
|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `level` | 记录在表中的最大消息级别（默认为 `Trace`）。                                                                                                                                                         | `Trace`      |

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

用于 [trace_log](/operations/system-tables/trace_log) 系统表操作的设置。

<SystemLogParameters/>

默认的服务器配置文件 `config.xml` 中包含以下设置部分：

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

用于记录异步插入的 [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) 系统表的设置。

<SystemLogParameters/>

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

用于 [crash_log](../../operations/system-tables/crash_log.md) 系统表操作的设置。

<SystemLogParameters/>

默认的服务器配置文件 `config.xml` 中包含以下设置部分：

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

此设置指定自定义（由 SQL 创建的）缓存磁盘的缓存路径。
`custom_cached_disks_base_directory` 对自定义磁盘的优先级高于 `filesystem_caches_path`（在 `filesystem_caches_path.xml` 中），如果前者不存在，则使用后者。
文件系统缓存设置路径必须位于该目录内，否则将引发异常，阻止磁盘创建。

:::note
这不会影响在较旧版本上创建的磁盘，该版本是通过升级服务器得到的。
在这种情况下，将不会抛出异常，以允许服务器成功启动。
:::

示例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## backup_log {#backup_log}

用于记录 `BACKUP` 和 `RESTORE` 操作的 [backup_log](../../operations/system-tables/backup_log.md) 系统表的设置。

<SystemLogParameters/>

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

用于 [`blob_storage_log`](../system-tables/blob_storage_log.md) 系统表的设置。

<SystemLogParameters/>

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

基于正则表达式的规则，这些规则将在将查询以及所有日志消息存储到服务器日志中之前应用于它们，
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) 表，以及发送给客户端的日志。这可以防止
从 SQL 查询中泄漏敏感数据，例如姓名、电子邮件、个人标识符或信用卡号码到日志中。

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

**配置字段**：

| 设置     | 描述                                                                     |
|-----------|--------------------------------------------------------------------------|
| `name`    | 规则名称（可选）                                                        |
| `regexp`  | 兼容 RE2 的正则表达式（强制）                                          |
| `replace` | 敏感数据的替换字符串（可选，默认 - 六个星号）                        |

掩码规则应用于整个查询（防止因为格式错误/无法解析的查询而泄漏敏感数据）。

[`system.events`](/operations/system-tables/events) 表有计数器 `QueryMaskingRulesMatch`，包含查询掩码规则匹配的总数。

对于分布式查询，每个服务器必须单独配置，否则传递给其他节点的子查询将不进行掩码处理。
## remote_servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) 表引擎和 `cluster` 表函数使用的集群配置。

**示例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

有关 `incl` 属性的值，请参见 “[配置文件](/operations/configuration-files)”。

**另请参见**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [集群发现](../../operations/cluster-discovery.md)
- [复制数据库引擎](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

允许在与 URL 相关的存储引擎和表函数中使用的主机列表。

添加带有 `<host>` xml 标签的主机时：
- 应该按 URL 中的指定格式准确指定，因为名称在 DNS 解析之前会进行检查。例如：`<host>clickhouse.com</host>`
- 如果在 URL 中明确指定了端口，则会整体检查 host:port。例如：`<host>clickhouse.com:80</host>`
- 如果未在端口中指定主机，则允许该主机的任何端口。例如：如果指定了 `<host>clickhouse.com</host>` ，则允许 `clickhouse.com:20`（FTP）、`clickhouse.com:80`（HTTP）、`clickhouse.com:443`（HTTPS）等。
- 如果主机作为 IP 地址指定，则检查 URL 中的规定格式。例如：[2a02:6b8:a::a]。
- 如果存在重定向并且启用了重定向支持，则检查每个重定向（位置字段）。

例如：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## timezone {#timezone}

服务器的时区。

指定为 IANA 的 UTC 时区或地理位置标识符（例如，Africa/Abidjan）。

时区对于在 DateTime 字段输出到文本格式（在屏幕上或文件中打印时）和从字符串获取 DateTime 时的字符串和 DateTime 格式之间的转换是必要的。此外，如果没有在输入参数中接收时区，则在处理时间和日期的函数中也会使用该时区。

**示例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**另请参见**

- [session_timezone](../settings/settings.md#session_timezone)
## tcp_port {#tcp_port}

与客户端通过 TCP 协议进行通信的端口。

**示例**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

与客户端安全通信的 TCP 端口。与 [OpenSSL](#openssl) 设置一起使用。

**默认值**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## mysql_port {#mysql_port}

与客户端通过 MySQL 协议进行通信的端口。

:::note
- 正整数指定要监听的端口号
- 空值用于禁用通过 MySQL 协议与客户端的通信。
:::

**示例**

```xml
<mysql_port>9004</mysql_port>
```
## postgresql_port {#postgresql_port}

与客户端通过 PostgreSQL 协议进行通信的端口。

:::note
- 正整数指定要监听的端口号
- 空值用于禁用通过 PostgreSQL 协议与客户端的通信。
:::

**示例**

```xml
<postgresql_port>9005</postgresql_port>
```
## mysql_require_secure_transport {#mysql_require_secure_transport}

如果设置为 true，则需要通过 [mysql_port](#mysql_port) 与客户端进行安全通信。将拒绝使用 `--ssl-mode=none` 选项进行的连接。与 [OpenSSL](#openssl) 设置一起使用。
## postgresql_require_secure_transport {#postgresql_require_secure_transport}

如果设置为 true，则需要通过 [postgresql_port](#postgresql_port) 与客户端进行安全通信。将拒绝使用 `sslmode=disable` 选项进行的连接。与 [OpenSSL](#openssl) 设置一起使用。
## tmp_path {#tmp_path}

在本地文件系统上存储处理大查询的临时数据的路径。

:::note
- 只能使用一个选项来配置临时数据存储：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
- 尾随斜杠是强制的。
:::

**示例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

翻译缩写或符号 URL 前缀为完整 URL 的配置。

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

用户文件的目录。用于表函数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md)。

**示例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path}

用户脚本文件的目录。用于可执行用户定义函数 [可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions)。

**示例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

类型：

默认：
## user_defined_path {#user_defined_path}

用户定义文件的目录。用于 SQL 用户定义函数 [SQL 用户定义函数](/sql-reference/functions/udf)。

**示例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## users_config {#users_config}

包含的文件路径：

- 用户配置。
- 访问权限。
- 设置配置。
- 配额设置。

**示例**

```xml
<users_config>users.xml</users_config>
```
## access_control_improvements {#access_control_improvements}

访问控制系统中的可选改进设置。

| 设置                                                | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 默认值  |
|---------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`         | 设置没有权限行策略的用户是否可以通过 `SELECT` 查询读取行。例如，如果有两个用户 A 和 B，并且仅为 A 定义了行策略，则如果此设置为 true，用户 B 将看到所有行。如果此设置为 false，用户 B 将看不到任何行。                                                                                                                                                                                                                                        | `true`  |
| `on_cluster_queries_require_cluster_grant`         | 设置 `ON CLUSTER` 查询是否需要 `CLUSTER` 权限。                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `true`  |
| `select_from_system_db_requires_grant`             | 设置 `SELECT * FROM system.<table>` 是否需要任何权限，并且可以被任何用户执行。如果设置为 true，则此查询需要 `GRANT SELECT ON system.<table>`，与普通表相同。例外情况：一些系统表（`tables`、`columns`、`databases` 和一些常量表，如 `one`、`contributors`）仍然可以被所有人访问；如果授予了 `SHOW` 权限（例如 `SHOW USERS`），则相应的系统表（即 `system.users`）将可访问。       | `true`  |
| `select_from_information_schema_requires_grant`    | 设置 `SELECT * FROM information_schema.<table>` 是否需要任何权限，并且可以被任何用户执行。如果设置为 true，则此查询需要 `GRANT SELECT ON information_schema.<table>`，与普通表相同。                                                                                                                                                                                                                                                                                                     | `true`  |
| `settings_constraints_replace_previous`            | 设置某个设置的设置配置文件中的约束是否会取消其他配置文件中对该设置的先前约束的操作，包括新约束未设置的字段。它还启用了 `changeable_in_readonly` 约束类型。                                                                                                                                                                                                                                                                                                          | `true`  |
| `table_engines_require_grant`                      | 设置创建具有特定表引擎的表是否需要权限。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `false` |
| `role_cache_expiration_time_seconds`               | 设置角色在角色缓存中存储的最后访问时间的秒数。                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `600`   |

示例：

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

`s3queue_log` 系统表的设置。

<SystemLogParameters/>

默认设置为：

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```
## dead_letter_queue {#dead_letter_queue}

“dead_letter_queue” 系统表的设置。

<SystemLogParameters/>

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

包含允许 ClickHouse 与 [ZooKeeper](http://zookeeper.apache.org/) 集群交互的设置。ClickHouse 使用 ZooKeeper 存储复制表的副本的元数据。如果未使用复制表，则可以省略此参数部分。

可通过子标签配置以下设置：

| 设置                                      | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                    | ZooKeeper 端点。可以设置多个端点。例如 `<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性指定在尝试连接到 ZooKeeper 集群时节点的顺序。                                                                                                                                                                                                                                                                                          |
| `session_timeout_ms`                      | 客户端会话的最大超时，单位为毫秒。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `operation_timeout_ms`                    | 单个操作的最大超时，单位为毫秒。                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `root` (可选)                             | 用作 ClickHouse 服务器使用的 znode 的根节点。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `fallback_session_lifetime.min` (可选)   | 在主节点不可用时，回退节点的 ZooKeeper 会话的最小生存时间（负载均衡）。以秒为单位。默认：3小时。                                                                                                                                                                                                                                                                                                                                                           |
| `fallback_session_lifetime.max` (可选)   | 在主节点不可用时，回退节点的 ZooKeeper 会话的最大生存时间（负载均衡）。以秒为单位。默认：6小时。                                                                                                                                                                                                                                                                                                                                                           |
| `identity` (可选)                         | ZooKeeper 访问请求的 znode 所需的用户和密码。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `use_compression` (可选)                  | 如果设置为 true，则启用 Keeper 协议中的压缩。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

还有 `zookeeper_load_balancing` 设置（可选），让您选择 ZooKeeper 节点选择的算法：

| 算法名称                   | 描述                                                                                                                           |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------|
| `random`                   | 随机选择一个 ZooKeeper 节点。                                                                                                   |
| `in_order`                 | 选择第一个可用的 ZooKeeper 节点，如果不可用则选择第二个，以此类推。                                                                  |
| `nearest_hostname`         | 选择与服务器主机名最相似的 ZooKeeper 节点，主机名通过名称前缀进行比较。                                                             |
| `hostname_levenshtein_distance` | 与 nearest_hostname 一样，但以 levenshtein 距离的方式进行主机名比较。                                                        |
| `first_or_random`          | 选择第一个 ZooKeeper 节点，如果不可用则随机选择剩余的 ZooKeeper 节点。                                                               |
| `round_robin`              | 选择第一个 ZooKeeper 节点，如果需要重新连接则选择下一个。                                                                           |

**示例配置**

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
    <!-- Optional. Chroot suffix. Should exist. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Optional. Zookeeper digest ACL string. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**另请参见**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper Programmer's Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse 与 Zookeeper 之间的可选安全通信](/operations/ssl-zookeeper)
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeper 中数据部分头的存储方法。此设置仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family) 家族。可以在以下位置指定：

**在 `config.xml` 文件的 [merge_tree](#merge_tree) 部分中全局设置**

ClickHouse 将对服务器上的所有表使用此设置。可以随时更改此设置。现有表在设置更改时会更改其行为。

**对于每个表**

创建表时，指定相应的 [引擎设置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。现有表的此设置的行为不会改变，即使全局设置更改。

**可能值**

- `0` — 功能关闭。
- `1` — 功能开启。

如果 [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)，则 [replicated](../../engines/table-engines/mergetree-family/replication.md) 表以紧凑的方式使用单个 `znode` 存储数据部分的头。如果表包含许多列，此存储方法显著减少存储在 ZooKeeper 中的数据量。

:::note
应用 `use_minimalistic_part_header_in_zookeeper = 1` 后，您不能将 ClickHouse 服务器降级到不支持此设置的版本。在对集群中的服务器升级 ClickHouse 时要小心。不要一次升级所有服务器。最好在测试环境中或在集群中的少数几台服务器上测试新版本的 ClickHouse。

已经以此设置存储的数据部分头无法恢复为其先前（非紧凑）表示形式。
:::
## distributed_ddl {#distributed_ddl}

管理在集群上执行 [distributed ddl queries](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）。仅在启用 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 的情况下工作。

`<distributed_ddl>` 内的可配置设置包括：

| 设置                     | 描述                                                                                                                              | 默认值                                   |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|
| `path`                   | Keeper 中用于 DDL 查询的 `task_queue` 路径                                                                                        |                                         |
| `profile`                | 执行 DDL 查询时使用的配置文件                                                                                                     |                                         |
| `pool_size`              | 可以同时运行多少个 `ON CLUSTER` 查询                                                                                             |                                         |
| `max_tasks_in_queue`     | 队列中可以存在的最大任务数量。                                                                                                     | `1,000`                                 |
| `task_max_lifetime`      | 如果节点的寿命超过此值，则删除节点。                                                                                               | `7 * 24 * 60 * 60`（一周的秒数）          |
| `cleanup_delay_period`   | 在接收到新节点事件后，清理将在上次清理未早于 `cleanup_delay_period` 秒钟后开始。                                              | `60` 秒                                 |

**示例**

```xml
<distributed_ddl>
    <!-- Path in ZooKeeper to queue with DDL queries -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Settings from this profile will be used to execute DDL queries -->
    <profile>default</profile>

    <!-- Controls how much ON CLUSTER queries can be run simultaneously. -->
    <pool_size>1</pool_size>

    <!--
         Cleanup settings (active tasks will not be removed)
    -->

    <!-- Controls task TTL (default 1 week) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Controls how often cleanup should be performed (in seconds) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Controls how many tasks could be in the queue -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## access_control_path {#access_control_path}

ClickHouse 服务器存储由 SQL 命令创建的用户和角色配置的文件夹路径。

**另请参见**

- [访问控制和帐户管理](/operations/access-rights#access-control-usage)
## allow_plaintext_password {#allow_plaintext_password}

设置是否允许明文密码类型（不安全）。 

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_no_password {#allow_no_password}

设置是否允许不安全的无密码密码类型。

```xml
<allow_no_password>1</allow_no_password>
```
## allow_implicit_no_password {#allow_implicit_no_password}

禁止创建没有密码的用户，除非明确指定 'IDENTIFIED WITH no_password'。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## default_session_timeout {#default_session_timeout}

默认会话超时，单位为秒。

```xml
<default_session_timeout>60</default_session_timeout>
```
## default_password_type {#default_password_type}

设置在 `CREATE USER u IDENTIFIED BY 'p'` 等查询中自动设置的密码类型。

接受的值为：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## user_directories {#user_directories}

配置文件的部分，包含以下设置：
- 与预定义用户的配置文件路径。
- 通过 SQL 命令创建的用户存储的文件夹路径。
- 通过 SQL 命令创建的用户存储和复制的 ZooKeeper 节点路径（实验性）。

如果指定此部分，将不会使用来自 [users_config](/operations/server-configuration-parameters/settings#users_config) 和 [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) 的路径。

`user_directories` 部分可以包含任意数量的项目，项目的顺序表示优先级（项目越高，优先级越高）。

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

用户、角色、行策略、配额和配置文件也可以存储在 ZooKeeper 中：

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

您还可以定义 `memory` 部分——表示仅在内存中存储信息，而不写入磁盘；以及 `ldap` 部分——表示在 LDAP 服务器上存储信息。

要将 LDAP 服务器添加为未在本地定义的用户的远程用户目录，请定义一个具有以下设置的单一 `ldap` 部分：

| 设置    | 描述                                                                                                                                                                                                                                                                                                                                                                  |
|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | 定义在 `ldap_servers` 配置部分中的 LDAP 服务器名称之一。此参数是必需的，并且不能为空。                                                                                                                                                                                                                                                                            |
| `roles`  | 列出将分配给从 LDAP 服务器检索到的每个用户的本地定义角色的部分。如果没有指定角色，用户在身份验证后将无法执行任何操作。如果在身份验证时列出的任何角色在本地未定义，身份验证尝试将失败，仿佛提供的密码不正确。                                                                                      |

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

定义要添加的自定义顶级域的列表，每个条目的格式为 `<name>/path/to/file</name>`。

例如：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

另请参见：
- 函数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) 及其变体，
  它接受自定义 TLD 列表名称，返回包含顶级子域的域部分，直到第一个重要子域。
## proxy {#proxy}

定义 HTTP 和 HTTPS 请求的代理服务器，目前支持 S3 存储、S3 表函数和 URL 函数。

定义代理服务器有三种方法：
- 环境变量
- 代理列表
- 远程代理解析器。

使用 `no_proxy` 也支持为特定主机绕过代理服务器。

**环境变量**

`http_proxy` 和 `https_proxy` 环境变量允许您为给定协议指定代理服务器。如果在您的系统上设置，它应该可以无缝工作。

这是最简单的方法，如果给定协议只有一个代理服务器，并且该代理服务器不变。

**代理列表**

此方法允许您为协议指定一个或多个代理服务器。如果定义了多个代理服务器，ClickHouse 将以轮询方式使用不同的代理，负载在服务器之间均衡分配。如果有多个代理服务器适用于协议，并且代理服务器列表没有变化，这是最简单的方法。

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
选择下方选项卡中的父字段以查看其子字段：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段      | 描述                                |
|-----------|-------------------------------------|
| `<http>`  | 一个或多个 HTTP 代理的列表         |
| `<https>` | 一个或多个 HTTPS 代理的列表        |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| 字段    | 描述                     |
|--------|-------------------------|
| `<uri>` | 代理的 URI             |

  </TabItem>
</Tabs>

**远程代理解析器**

可能会动态更改代理服务器。在这种情况下，可以定义解析器的端点。ClickHouse 向该端点发送一个空的 GET 请求，远程解析器应返回代理主机。ClickHouse 将使用它形成代理 URI，使用以下模板： `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

选择下方选项卡中的父字段以查看其子字段：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段      | 描述                             |
|-----------|----------------------------------|
| `<http>`  | 一个或多个解析器的列表*          |
| `<https>` | 一个或多个解析器的列表*        |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| 字段          | 描述                                           |
|---------------|------------------------------------------------|
| `<resolver>`   | 解析器的端点和其他详细信息                       |

:::note
您可以有多个 `<resolver>` 元素，但仅使用给定协议的第一个 `<resolver>`。该协议的任何其他 `<resolver>` 元素将被忽略。这意味着负载均衡（如有需要）应由远程解析器实现。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| 字段                | 描述                                                                                                                                                                             |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | 代理解析器的 URI                                                                                                                                                                |
| `<proxy_scheme>`    | 最终代理 URI 的协议。可以是 `http` 或 `https`。                                                                                                                                       |
| `<proxy_port>`      | 代理解析器的端口号                                                                                                                                                              |
| `<proxy_cache_time>` | ClickHouse 应缓存来自解析器的值的秒数。将此值设置为 `0` 将导致 ClickHouse 在每个 HTTP 或 HTTPS 请求时联系解析器。                                                                |

  </TabItem>
</Tabs>

**优先级**

代理设置按以下顺序确定：

| 顺序 | 设置                    |
|------|------------------------|
| 1.   | 远程代理解析器          |
| 2.   | 代理列表                 |
| 3.   | 环境变量                |

ClickHouse 将检查请求协议的最高优先级解析器类型。如果未定义，它将检查下一个最高优先级解析器类型，直到达到环境解析器。这也允许混合使用解析器类型。
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

默认情况下，隧道（即 `HTTP CONNECT`）用于通过 `HTTP` 代理发起 `HTTPS` 请求。此设置可用于禁用它。

**no_proxy**

默认情况下，所有请求将通过代理。为了禁用特定主机的代理，必须设置 `no_proxy` 变量。
它可以在代理子句中设置用于列表和远程解析器，以及作为环境解析器的环境变量。它支持 IP 地址、域、子域和 `'*'` 通配符进行完全绕过。前导点就像 curl 一样被剥离。

**示例**

以下配置绕过对 `clickhouse.cloud` 及其所有子域（例如 `auth.clickhouse.cloud`）的代理请求。
对于 GitLab 也是如此，即使它有前导点。 `gitlab.com` 和 `about.gitlab.com` 都将绕过代理。

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

用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的目录。默认情况下使用服务器工作目录下的 `/workload/` 文件夹。

**示例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**另请参见**
- [工作负载层次结构](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的 ZooKeeper 节点路径。为确保一致性，所有 SQL 定义都存储为此单个 znode 的值。默认情况下不使用 ZooKeeper，定义存储在 [disk](#workload_path) 上。

**示例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**另请参见**
- [工作负载层次结构](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
