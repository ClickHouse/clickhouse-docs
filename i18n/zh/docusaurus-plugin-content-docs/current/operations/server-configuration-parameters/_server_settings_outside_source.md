---
{}
---

## asynchronous_metric_log {#asynchronous_metric_log}

在 ClickHouse Cloud 部署中默认启用。

如果在您的环境中该设置未默认启用，根据 ClickHouse 的安装方式，可以按照以下说明启用或禁用它。

**启用**

要手动开启异步指标日志历史收集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml`，内容如下：

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

要禁用 `asynchronous_metric_log` 设置，您应创建以下文件 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`，内容如下：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## auth_use_forwarded_address {#auth_use_forwarded_address}

使用通过代理连接的客户端的原始地址进行身份验证。

:::note
此设置应谨慎使用，因为转发的地址可以很容易地被伪造 - 接受此类身份验证的服务器不应直接访问，而应专门通过受信任的代理访问。
:::
## backups {#backups}

备份的设置，用于写入 `BACKUP TO File()`。

可以通过子标签配置以下设置：

| 设置                                   | 描述                                                                                                                                                                      | 默认值 |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `allowed_path`                         | 使用 `File()` 时备份到的路径。此设置必须设置才能使用 `File`。路径可以是相对实例目录也可以是绝对路径。                                                                 | `true` |
| `remove_backup_files_after_failure`    | 如果 `BACKUP` 命令失败，ClickHouse 将尝试删除在失败之前已经复制到备份的文件，否则将保留已复制的文件原样。                                                               | `true` |

该设置默认配置为：

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## bcrypt_workfactor {#bcrypt_workfactor}

用于 bcrypt_password 身份验证类型的工作因子，使用 [Bcrypt 算法](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```
## table_engines_require_grant {#table_engines_require_grant}

如果设置为 true，用户创建特定引擎表时需要授予，例如 `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
默认情况下，为了向后兼容，创建特定表引擎的表会忽略授予，但您可以通过将其设置为 true 来更改此行为。
:::
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

在重新加载内置字典之前的间隔（以秒为单位）。

ClickHouse 每 x 秒重新加载内置字典。这使得可以在不重新启动服务器的情况下“实时”编辑字典。

**示例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的数据压缩设置。

:::note
如果您刚开始使用 ClickHouse，我们建议不要更改此设置。
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

- `min_part_size` – 数据部分的最小大小。
- `min_part_size_ratio` – 数据部分大小与表大小的比率。
- `method` – 压缩方法。可接受的值：`lz4`，`lz4hc`，`zstd`，`deflate_qpl`。
- `level` – 压缩级别。请参见 [Codecs](/sql-reference/statements/create/table#general-purpose-codecs)。

:::note
您可以配置多个 `<case>` 部分。
:::

**满足条件时的操作**：

- 如果数据部分满足条件，ClickHouse 使用指定的压缩方法。
- 如果数据部分满足多个条件集，ClickHouse 使用第一个匹配的条件集。

:::note
如果数据部分不满足任何条件，ClickHouse 使用 `lz4` 压缩。
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

配置获取用于 [加密编解码器](/sql-reference/statements/create/table#encryption-codecs) 的密钥的命令。密钥（或密钥）应写入环境变量或配置文件中。

密钥可以是十六进制或长度为 16 字节的字符串。

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
不建议将密钥存储在配置文件中。这并不安全。您可以将密钥移动到安全磁盘上的单独配置文件中，并将 symlink 放入 `config.d/` 文件夹中。
:::

从配置加载，当密钥为十六进制时：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

从环境变量加载密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 设置当前用于加密的密钥，所有指定的密钥可以用于解密。

这些方法中的每一个可以应用于多个密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 显示当前用于加密的密钥。

此外，用户可以添加必须为 12 字节长的 nonce（默认情况下加密和解密过程使用由零字节组成的 nonce）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

或者可以以十六进制设置：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上述所有内容均可适用于 `aes_256_gcm_siv`（但密钥必须为 32 字节长）。
:::
## error_log {#error_log}

默认情况下禁用。

**启用**

要手动开启错误历史收集 [`system.error_log`](../../operations/system-tables/error_log.md)，请创建 `/etc/clickhouse-server/config.d/error_log.xml`，内容如下：

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

要禁用 `error_log` 设置，您应创建以下文件 `/etc/clickhouse-server/config.d/disable_error_log.xml`，内容如下：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## custom_settings_prefixes {#custom_settings_prefixes}

[自定义设置](/operations/settings/query-level#custom_settings) 的前缀列表。前缀必须用逗号分隔。

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

字典的配置文件路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 * 和 ?。

还请参阅：
- "[字典](../../sql-reference/dictionaries/index.md)"。

**示例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

用户自定义可执行函数的配置文件路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 * 和 ?。

还请参阅：
- "[可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions)"。

**示例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## format_schema_path {#format_schema_path}

输入数据架构的目录路径，如 [CapnProto](../../interfaces/formats.md#capnproto) 格式的架构。

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
- `interval` – 发送的间隔，以秒为单位。
- `timeout` – 发送数据的超时，以秒为单位。
- `root_path` – 键的前缀。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表发送数据。
- `events` – 从 [system.events](/operations/system-tables/events) 表发送在时间段内累计的数据。
- `events_cumulative` – 从 [system.events](/operations/system-tables/events) 表发送累计数据。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表发送数据。

您可以配置多个 `<graphite>` 子句。例如，您可以为不同的间隔发送不同的数据。

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

Graphite 数据简化的设置。

有关详细信息，请参阅 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)。

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

定义包含 Protobuf 类型 proto 文件的目录。

示例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

允许使用自定义 HTTP 处理程序。
要添加新的 http 处理程序，只需添加一个新的 `<rule>`。
规则按自上而下的顺序检查，第一次匹配将运行处理程序。

以下设置可以通过子标签进行配置：

| 子标签                  | 定义                                                                                                                                                                           |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                   | 要匹配的请求 URL，您可以使用 'regex:' 前缀进行正则匹配（可选）                                                                                                               |
| `methods`               | 要匹配请求方法，可以使用逗号分隔多个方法匹配（可选）                                                                                                                        |
| `headers`               | 要匹配请求头，匹配每个子元素（子元素名称为头名称），可以使用 'regex:' 前缀进行正则匹配（可选）                                                                               |
| `handler`               | 请求处理程序                                                                                                                                                                 |
| `empty_query_string`    | 检查 URL 中是否没有查询字符串                                                                                                                                               |

`handler` 包含以下设置，可以通过子标签进行配置：

| 子标签                   | 定义                                                                                                                                                 |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                    | 重定向的地址                                                                                                                                          |
| `type`                   | 支持的类型：静态、dynamic_query_handler、predefined_query_handler、重定向                                                                                     |
| `status`                 | 静态类型时使用的响应状态码                                                                                                                                 |
| `query_param_name`       | 与 dynamic_query_handler 类型配合使用，提取并执行与 HTTP 请求参数中的 `<query_param_name>` 值对应的值                                                           |
| `query`                  | 与 predefined_query_handler 类型配合使用，处理程序被调用时执行查询                                                                                          |
| `content_type`           | 静态类型时使用的响应内容类型                                                                                                                                 |
| `response_content`       | 静态类型时使用，发送到客户端的响应内容，当使用前缀 'file://' 或 'config://' 时，从文件或配置中找到内容发送到客户端。                                        |

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
默认值是 "Ok."（末尾带换行符）

**示例**

访问 `http://localhost: http_port` 时打开 `https://tabix.io/`。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

用于在 `OPTIONS` HTTP 请求中向响应添加头信息。
`OPTIONS` 方法在进行 CORS 预检请求时使用。

有关更多信息，请参阅 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)。

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

HSTS 的到期时间（以秒为单位）。

:::note
设置为 `0` 表示 ClickHouse 禁用 HSTS。如果您设置为正数，则 HSTS 将启用，max-age 为您设置的数字。
:::

**示例**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

启动后执行 `mlockall` 以降低首次查询延迟并防止 ClickHouse 可执行文件在高 IO 负载下被页出。

:::note
建议启用此选项，但将导致启动时间增加最多几秒。
请记住，如果没有 "CAP_IPC_LOCK" 权限，此设置将无效。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

包含替换的文件路径。支持 XML 和 YAML 格式。

有关更多信息，请参阅 "[配置文件](/operations/configuration-files)"。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

对在 ClickHouse 服务器之间交换数据的主机的限制。
如果使用 Keeper，则该限制将适用于不同 Keeper 实例之间的通信。

:::note
默认情况下，该值与 [`listen_host`](#listen_host) 设置相等。
:::

**示例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

类型：

默认值：
## interserver_http_port {#interserver_http_port}

ClickHouse 服务器之间交换数据的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_http_host {#interserver_http_host}

其他服务器可用于访问此服务器的主机名。

如果省略，它的定义方式与 `hostname -f` 命令相同。

对于突破特定网络接口是有用的。

**示例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_https_port {#interserver_https_port}

ClickHouse 服务器之间通过 `HTTPS` 交换数据的端口。

**示例**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_https_host {#interserver_https_host}

类似于 [`interserver_http_host`](#interserver_http_host)，只不过这个主机名可供其他服务器通过 `HTTPS` 访问此服务器。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

用于连接到其他服务器的用户名和密码，在 [复制](../../engines/table-engines/mergetree-family/replication.md) 过程中使用。此外，服务器使用这些凭据对其他副本进行身份验证。
因此 `interserver_http_credentials` 必须在集群中的所有副本中相同。

:::note
- 默认情况下，如果省略 `interserver_http_credentials` 部分，则在复制过程中不使用身份验证。
- `interserver_http_credentials` 设置与 ClickHouse 客户端凭据 [配置](../../interfaces/cli.md#configuration_files) 无关。
- 这些凭据对于通过 `HTTP` 和 `HTTPS` 的复制是通用的。
:::

可以通过子标签配置以下设置：

- `user` — 用户名。
- `password` — 密码。
- `allow_empty` — 如果为 `true`，则允许其他副本在设置凭据的情况下无需身份验证进行连接。如果为 `false`，则拒绝未经身份验证的连接。默认值：`false`。
- `old` — 包含在凭据轮换期间使用的旧 `user` 和 `password`。可以指定多个 `old` 部分。

**凭据轮换**

ClickHouse 支持动态双服务器凭据轮换，而无需同时停止所有副本以更新其配置。凭据可以分几步进行更改。

要启用身份验证，将 `interserver_http_credentials.allow_empty` 设置为 `true` 并添加凭据。这允许带身份验证和不带身份验证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

在配置所有副本后，将 `allow_empty` 设置为 `false` 或移除此设置。这样，使用新凭据进行身份验证变为强制。

若要更改现有凭据，请将用户名和密码移动到 `interserver_http_credentials.old` 部分，并使用新值更新 `user` 和 `password`。此时，服务器使用新凭据连接到其他副本，并接受新旧凭据的连接。

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

当新凭据应用于所有副本时，可以删除旧凭据。
## ldap_servers {#ldap_servers}

在此处列出 LDAP 服务器及其连接参数，以：
- 将其用作具有'ldap' 身份验证机制的专用本地用户的身份验证器，而不是'password'
- 将其用作远程用户目录。

可以通过子标签配置以下设置：

| 设置                              | 描述                                                                                                                                                                                                                                                                                                                                                                                                                         |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                              | LDAP 服务器主机名或 IP，此参数为必填项，不能为空。                                                                                                                                                                                                                                                                                                                                                                          |
| `port`                              | LDAP 服务器端口，如果 `enable_tls` 设置为 true，则默认是 636，否则为 389。                                                                                                                                                                                                                                                                                                                                                   |
| `bind_dn`                          | 用于构造绑定时的 DN 的模板。在每次身份验证尝试中，结果 DN 将通过替换模板中的所有 `\{user_name\}` 子串构造。                                                                                                                                                                                                                                                                                                             |
| `user_dn_detection`                 | 带有 LDAP 搜索参数的部分，用于检测绑定用户的实际用户 DN。这主要用于在服务器为活动目录时进一步角色映射的搜索过滤器。替换 `\{user_dn\}` 子串时将使用结果用户 DN。默认情况下，用户 DN 被设置为与绑定 DN 相同，但一旦执行搜索，它将更新为实际检测到的用户 DN 值。                                                                    |
| `verification_cooldown`             | 成功绑定尝试后的一段时间（以秒为单位），在此期间用户将被假定为已成功验证，可以接受所有后续请求而无需联系 LDAP 服务器。指定 `0`（默认值）以禁用缓存，并强制每次身份验证请求联系 LDAP 服务器。                                                                                                                                                |
| `enable_tls`                        | 触发使用与 LDAP 服务器的安全连接的标志。指定 `no` 以使用明文（`ldap://`）协议（不推荐）。指定 `yes` 以使用 SSL/TLS（`ldaps://`）协议（推荐，默认）。指定 `starttls` 以使用传统的 StartTLS 协议（明文（`ldap://`）协议，升级为 TLS）。                                                                       |
| `tls_minimum_protocol_version`      | SSL/TLS 的最小协议版本。接受的值为：`ssl2`，`ssl3`，`tls1.0`，`tls1.1`，`tls1.2`（默认值）。                                                                                                                                                                                                                                                                                                    |
| `tls_require_cert`                  | SSL/TLS 对等证书验证行为。接受的值为：`never`，`allow`，`try`，`demand`（默认值）。                                                                                                                                                                                                                                                                                                                                 |
| `tls_cert_file`                     | 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                          |
| `tls_key_file`                      | 证书密钥文件的路径。                                                                                                                                                                                                                                                                                                                                                        |
| `tls_ca_cert_file`                  | CA 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                           |
| `tls_ca_cert_dir`                   | 包含 CA 证书的目录的路径。                                                                                                                                                                                                                                                                                                                                                   |
| `tls_cipher_suite`                  | 允许的加密算法套件（以 OpenSSL 表示法）。                                                                                                                                                                                                                                                                                                                                                                     |

设置 `user_dn_detection` 可以通过子标签进行配置：

| 设置             | 描述                                                                                                                                                                                                                                                                    |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`        | 用于构造 LDAP 搜索的基 DN 的模板。结果 DN 将通过在 LDAP 搜索中替换所有 `\{user_name\}` 和 '\{bind_dn\}' 子串来构造。                                                                                                                  |
| `scope`          | LDAP 搜索的范围。接受的值为：`base`，`one_level`，`children`，`subtree`（默认值）。                                                                                                                                                                                      |
| `search_filter`  | 用于构造 LDAP 搜索的搜索过滤器模板。结果过滤器将通过替换模板中的所有 `\{user_name\}`，` \{bind_dn\}` 和 `\{base_dn\}` 子串来构造。请注意，在 XML 中必须正确转义特殊字符。                                                                                          |

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

示例（典型的活动目录，配置的用户 DN 检测以进一步角色映射）：

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

对请求可以来自的主机的限制。如果您希望服务器回答所有请求，请指定 `::`。

示例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

尝试监听时，如果 IPv6 或 IPv4 网络不可用，服务器不会退出。

**示例**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

允许多个服务器在相同的地址：端口上进行监听。请求将由操作系统路由到随机服务器。启用此设置不推荐。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

类型：

默认值：
## listen_backlog {#listen_backlog}

监听套接字的待处理连接队列大小（回溯）。 默认值 `4096` 与 Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)) 的值相同。

通常情况下，此值不需要更改，因为：
- 默认值已经足够大，
- 服务器用于接受客户端连接有单独的线程。

因此，即使 `TcpExtListenOverflows`（来自 `nstat`）非零，并且该计数器在 ClickHouse 服务器上增长，也并不意味着该值需要增加，因为：
- 通常，如果 `4096` 不够，会显示某些内部 ClickHouse 扩展问题，因此最好报告一个问题。
- 这并不意味着服务器可以处理更多的连接（即使可以，在那种情况下客户端可能已经消失或断开连接）。 

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

日志消息的位置和格式。

**键**：

| 键                        | 描述                                                                                                                                                                                |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | 日志级别。可接受的值： `none`（关闭日志）， `fatal`， `critical`， `error`， `warning`， `notice`， `information`， `debug`， `trace`， `test`                                   |
| `log`                     | 日志文件的路径。                                                                                                                                                                    |
| `errorlog`                | 错误日志文件的路径。                                                                                                                                                                 |
| `size`                    | 旋转策略：日志文件的最大大小（以字节为单位）。一旦日志文件大小超过此阈值，该文件将被重命名并归档，并创建一个新的日志文件。                                                      |
| `count`                   | 旋转策略：Clickhouse 最多保留多少历史日志文件。                                                                                                                                       |
| `stream_compress`         | 使用 LZ4 压缩日志消息。设置为 `1` 或 `true` 以启用。                                                                                                                                |
| `console`                 | 不将日志消息写入日志文件，而是直接在控制台中打印。设置为 `1` 或 `true` 以启用。默认情况下，如果 Clickhouse 不在守护进程模式下运行，则为 `1`，否则为 `0`。                |
| `console_log_level`       | 控制台输出的日志级别。默认值为 `level`。                                                                                                                                                  |
| `formatting`              | 控制台输出的日志格式。目前仅支持 `json`。                                                                                                                                               |
| `use_syslog`              | 还将日志输出转发到 syslog。                                                                                                                                                             |
| `syslog_level`            | 记录到 syslog 的日志级别。                                                                                                                                                             |

**日志格式说明符**

`log` 和 `errorLog` 路径中的文件名支持以下格式说明符，用于生成文件名（目录部分不支持它们）。

“示例”列展示在 `2023-07-06 18:32:07` 时的输出。

| 说明符      | 描述                                                                                           | 示例                      |
|-------------|------------------------------------------------------------------------------------------------|---------------------------|
| `%%`        | 字面意义的 %                                                                                   | `%`                         |
| `%n`        | 换行符                                                                                        |                           |
| `%t`        | 横向制表符                                                                                    |                           |
| `%Y`        | 年份，十进制数字，例如 2017                                                                      | `2023`                     |
| `%y`        | 年的最后 2 位数字，十进制数字（范围 [00,99]）                                                   | `23`                       |
| `%C`        | 年的前 2 位数字，十进制数字（范围 [00,99]）                                                    | `20`                       |
| `%G`        | 四位数的 [ISO 8601 周历年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。通常仅在使用 `%V` 时有用 | `2023`                     |
| `%g`        | [ISO 8601 周历年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) 的最后 2 位数字，即包含指定周的年份。                                    | `23`                       |
| `%b`        | 缩写的月份名称，例如 Oct（依赖于区域设置）                                                     | `Jul`                     |
| `%h`        | %b 的同义词                                                                                  | `Jul`                     |
| `%B`        | 完整的月份名称，例如 October（依赖于区域设置）                                              | `July`                     |
| `%m`        | 月份，十进制数字（范围 [01,12]）                                                               | `07`                       |
| `%U`        | 一年中的周数，十进制数字（以星期日为一周的第一天）（范围 [00,53]）                                          | `27`                       |
| `%W`        | 一年中的周数，十进制数字（以星期一为一周的第一天）（范围 [00,53]）                                          | `27`                       |
| `%V`        | ISO 8601 周编号（范围 [01,53]）                                                                 | `27`                       |
| `%j`        | 一年中的第几天，十进制数字（范围 [001,366]）                                                    | `187`                      |
| `%d`        | 月份中的某天，零填充的十进制数字（范围 [01,31]）。单数前面加零。                                         | `06`                       |
| `%e`        | 月份中的某天，空格填充的十进制数字（范围 [1,31]）。单数前面加空格。                                 | `&nbsp; 6`                 |
| `%a`        | 缩写的星期几名称，例如 Fri（依赖于区域设置）                                                  | `Thu`                      |
| `%A`        | 完整的星期几名称，例如 Friday（依赖于区域设置）                                                | `Thursday`                 |
| `%w`        | 星期几，作为整数（星期日为 0）（范围 [0-6]）                                                  | `4`                        |
| `%u`        | 星期几的十进制数字，其中星期一为 1（ISO 8601 格式）（范围 [1-7]）                              | `4`                        |
| `%H`        | 小时，十进制数字，24 小时制（范围 [00-23]）                                                    | `18`                       |
| `%I`        | 小时，十进制数字，12 小时制（范围 [01,12]）                                                    | `06`                       |
| `%M`        | 分钟的十进制数字（范围 [00,59]）                                                                 | `32`                       |
| `%S`        | 秒，十进制数字（范围 [00,60]）                                                                  | `07`                       |
| `%c`        | 标准日期和时间字符串，例如 Sun Oct 17 04:41:13 2010（依赖于区域设置）                               | `Thu Jul  6 18:32:07 2023` |
| `%x`        | 本地化日期表示（依赖于区域设置）                                                                | `07/06/23`                 |
| `%X`        | 本地化时间表示，例如 18:40:20 或 6:40:20 PM（依赖于区域设置）                                     | `18:32:07`                 |
| `%D`        | 短 MM/DD/YY 日期，等同于 %m/%d/%y                                                                | `07/06/23`                 |
| `%F`        | 短 YYYY-MM-DD 日期，等同于 %Y-%m-%d                                                              | `2023-07-06`               |
| `%r`        | 本地化 12 小时制时间（依赖于区域设置）                                                          | `06:32:07 PM`              |
| `%R`        | 等价于 "%H:%M"                                                                                  | `18:32`                    |
| `%T`        | 等价于 "%H:%M:%S"（ISO 8601 时间格式）                                                           | `18:32:07`                 |
| `%p`        | 本地化的上午或下午标识（依赖于区域设置）                                                        | `PM`                       |
| `%z`        | UTC 偏移，ISO 8601 格式（例如 -0430），如果没有时区信息则不包含字符                               | `+0800`                    |
| `%Z`        | 依赖于区域设置的时区名称或缩写，若没有时区信息则不包含字符                                         | `Z AWST `                  |

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

仅在控制台中打印日志消息：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**每级覆盖**

可以覆盖单个日志名称的日志级别。例如，要静音所有 "Backup" 和 "RBAC" 的日志消息。

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

将日志消息额外写入 syslog：

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

| 键        | 描述                                                                                                                                                                                                                                                    |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | syslog 的地址，格式为 `host\[:port\]`。如果省略，则使用本地守护进程。                                                                                                                                                                          |
| `hostname` | 发送日志的主机名称（可选）。                                                                                                                                                                                                                            |
| `facility` | syslog [设施关键字](https://en.wikipedia.org/wiki/Syslog#Facility)。必须大写并以 "LOG_" 前缀指定，例如 `LOG_USER`， `LOG_DAEMON`， `LOG_LOCAL3` 等。如果指定了 `address`，则默认值为 `LOG_USER`，否则为 `LOG_DAEMON`。 |
| `format`   | 日志消息格式。可能的值： `bsd` 和 `syslog`。                                                                                                                                                                                                         |

**日志格式**

可以指定将在控制台日志中输出的日志格式。目前，仅支持 JSON。

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

要启用 JSON 日志记录支持，请使用以下代码段：

```xml
<logger>
    <formatting>
        <type>json</type>
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

**更改 JSON 日志的键名**

可以通过更改 `<names>` 标签内的标签值来修改键名。例如，要将 `DATE_TIME` 更改为 `MY_DATE_TIME`，可以使用 `<date_time>MY_DATE_TIME</date_time>`。

**省略 JSON 日志的键**

可以通过注释掉属性来省略日志属性。例如，如果您不希望日志打印 `query_id`，可以注释掉 `<query_id>` 标签。
## send_crash_reports {#send_crash_reports}

发送崩溃报告给 ClickHouse 核心开发团队的设置。

在预生产环境中启用此功能将受到高度赞赏。

键：

| 键                   | 描述                                                                                                                         |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | 布尔标志以启用该功能，默认值为 `true`。设置为 `false` 以避免发送崩溃报告。                                              |
| `send_logical_errors` | `LOGICAL_ERROR` 就像一个 `assert`，它是 ClickHouse 的一个错误。此布尔标志启用发送此异常（默认值：`true`）。      |
| `endpoint`            | 您可以覆盖发送崩溃报告的端点 URL。                                                                                         |

**推荐用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## ssh_server {#ssh_server}

主机密钥的公共部分将在首次连接时写入 SSH 客户端的 known_hosts 文件。

主机密钥配置默认情况下处于非活动状态。
取消注释主机密钥配置，并提供相应 ssh 密钥的路径以使其活动：

示例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## tcp_ssh_port {#tcp_ssh_port}

允许用户通过 PTY 使用内置客户端连接并以交互方式执行查询的 SSH 服务器的端口。

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
### 磁盘配置 {#configuration-of-disks}

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

上述子标签定义了 `disks` 的以下设置：

| 设置                   | 描述                                                                                     |
|-------------------------|-----------------------------------------------------------------------------------------|
| `<disk_name_N>`         | 磁盘的名称，必须是唯一的。                                                               |
| `path`                  | 将存储服务器数据的路径（`data` 和 `shadow` 目录）。路径应以 `/` 结尾。                 |
| `keep_free_space_bytes` | 磁盘上保留的自由空间的大小。                                                             |

:::note
磁盘的顺序不重要。
:::
### 策略配置 {#configuration-of-policies}

上述子标签定义了 `policies` 的以下设置：

| 设置                         | 描述                                                                                                                                                                                                                                                                                              |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | 策略名称。策略名称必须唯一。                                                                                                                                                                                                                                                                     |
| `volume_name_N`              | 体积名称。体积名称必须唯一。                                                                                                                                                                                                                                                                     |
| `disk`                       | 位于体积内的磁盘。                                                                                                                                                                                                                                                                                 |
| `max_data_part_size_bytes`   | 此体积中可在任何磁盘上存在的数据块的最大大小。如果合并结果预期会大于 max_data_part_size_bytes，则该块将写入下一个体积。基本上，此功能允许您将新的/小的数据块存储在热（SSD）体积上，并在它们达到大尺寸时将其移动到冷（HDD）体积。如果策略仅有一个体积，请不要使用此选项。                        |
| `move_factor`                | 该体积上可用自由空间的份额。如果空间减少，数据将开始转移到下一个体积（如果有）。对于转移，数据块按从大到小（降序）排序，选择总大小足以满足 `move_factor` 条件的数据块，如果所有数据块的总大小不足，则所有数据块都会被移动。                                                  |
| `perform_ttl_move_on_insert` | 禁用插入时移动过期 TTL 的数据。默认情况下（如果启用），如果我们插入一块根据生命周期规则已经过期的数据，它会立即移动到移动规则指定的体积/磁盘。如果目标体积/磁盘缓慢，这可能会显著减慢插入速度。如果禁用，则过期部分的数据将写入默认体积，然后立即移动到过期 TTL 规则指定的体积。 |
| `load_balancing`             | 磁盘均衡策略，`round_robin` 或 `least_used`。                                                                                                                                                                                                                                                         |
| `least_used_ttl_ms`          | 设置用于更新所有磁盘上可用空间的超时（以毫秒为单位）（`0` - 始终更新， `-1` - 从不更新，默认值为 `60000`）。注意，如果磁盘仅被 ClickHouse 使用且不会在运行时被文件系统调整大小，您可以使用 `-1` 值。在其他情况下，不建议这样做，因为这将最终导致空间分配不正确。                                                   |
| `prefer_not_to_merge`        | 禁用在此体积上合并数据部分。注意：这可能会有害并导致速度下降。当启用此设置时（请勿这样做），禁止在此体积上合并数据（这是不好的）。这允许控制 ClickHouse 如何与慢磁盘交互。我们建议完全不要使用此选项。                                                                                                                            |
| `volume_priority`            | 定义填充体积的优先级（顺序）。值越小，优先级越高。参数值必须是自然数，并覆盖从 1 到 N 的范围（N 为指定的最大参数值），且没有间隙。                                                                                                                |

对于 `volume_priority`：
- 如果所有体积都有此参数，则按指定顺序进行优先排序。
- 如果只有 _某些_ 体积具有该参数，则没有此参数的体积优先级最低。具有该参数的体积按标签值优先排列，其他体积的优先级由配置文件中相对于彼此的描述顺序来决定。
- 如果 _没有_ 体积赋予该参数，则它们的顺序由配置文件中的描述顺序决定。
- 体积的优先级可能不相同。
## macros {#macros}

为复制表进行的参数替换。

如果不使用复制表，可以省略。

有关更多信息，请参阅 [创建复制表](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) 部分。

**示例**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

数据库 Replicated 的副本组名称。

由 Replicated 数据库创建的集群将由同一组中的副本组成。
DDL 查询仅等待同一组中的副本。

默认值为空。

**示例**

```xml
<replica_group_name>backups</replica_group_name>
```
## remap_executable {#remap_executable}

设置使用大页面重新分配机器代码（“文本”的内存）。

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

最大会话超时，以秒为单位。

示例：

```xml
<max_session_timeout>3600</max_session_timeout>
```
## merge_tree {#merge_tree}

用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 中的表的微调。

有关更多信息，请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

默认情况下禁用。

**启用**

要手动开启指标历史记录收集 [`system.metric_log`](../../operations/system-tables/metric_log.md)，请创建 `/etc/clickhouse-server/config.d/metric_log.xml`，内容如下：

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

要禁用 `metric_log` 设置，您应创建以下文件 `/etc/clickhouse-server/config.d/disable_metric_log.xml`，其内容如下：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## latency_log {#latency_log}

默认情况下禁用。

**启用**

要手动开启延迟历史记录收集 [`system.latency_log`](../../operations/system-tables/latency_log.md)，请创建 `/etc/clickhouse-server/config.d/latency_log.xml`，内容如下：

```xml
<clickhouse>
    <latency_log>
        <database>system</database>
        <table>latency_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </latency_log>
</clickhouse>
```

**禁用**

要禁用 `latency_log` 设置，您应创建以下文件 `/etc/clickhouse-server/config.d/disable_latency_log.xml`，其内容如下：

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## replicated_merge_tree {#replicated_merge_tree}

用于 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 中表的微调。此设置具有更高的优先级。

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

支持 SSL 的功能由 `libpoco` 库提供。可用的配置选项在 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) 中解释。默认值可以在 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) 中找到。

服务器/客户端设置的密钥：

| 选项                          | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 默认值                                      |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| `privateKeyFile`              | 包含 PEM 证书的密钥文件的路径。文件可以同时包含密钥和证书。                                                                                                                                                                                                                                                                                                                                                                                                        |                                           |
| `certificateFile`             | 客户端/服务器证书文件的 PEM 格式路径。如果 `privateKeyFile` 已包含证书，则可以省略。                                                                                                                                                                                                                                                                                                                                                                             |                                           |
| `caConfig`                    | 包含受信任 CA 证书的文件或目录的路径。如果指向文件，则必须是 PEM 格式，并且可以包含多个 CA 证书。如果指向目录，则必须包含每个 CA 证书的一个 .pem 文件。文件名是通过 CA 主体名的哈希值查找的。详细信息可以在 [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) 的手册页中找到。                                                              |                                           |
| `verificationMode`            | 检查节点证书的方法。详细信息见 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的描述。可能的值：`none`，`relaxed`，`strict`，`once`。                                                                                                                                                                                                                                                               | `relaxed`                                 |
| `verificationDepth`           | 验证链的最大长度。如果证书链长度超过设置的值，则验证将失败。                                                                                                                                                                                                                                                                                                                                                                                                     | `9`                                       |
| `loadDefaultCAFile`           | 是否使用 OpenSSL 内置 CA 证书。ClickHouse 假定内置 CA 证书位于 `/etc/ssl/cert.pem`（或目录 `/etc/ssl/certs`）中，或在环境变量 `SSL_CERT_FILE`（或 `SSL_CERT_DIR`）指定的文件（或目录）中。                                                                                                                                                                                                                    | `true`                                    |
| `cipherList`                  | 支持的 OpenSSL 加密。                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | 启用或禁用缓存会话。必须与 `sessionIdContext` 一起使用。可接受的值：`true`，`false`。                                                                                                                                                                                                                                                                                                                                                                           | `false`                                   |
| `sessionIdContext`            | 服务器附加到每个生成标识符的唯一随机字符集。字符串长度不得超过 `SSL_MAX_SSL_SESSION_ID_LENGTH`。强烈建议使用此参数，因为它有助于避免问题，无论是服务器缓存会话还是客户端请求缓存。                                                                                                                                                                                                                      | `$\{application.name\}`                     |
| `sessionCacheSize`            | 服务器缓存的会话的最大数量。值为 `0` 表示无限制会话。                                                                                                                                                                                                                                                                                                                                                                                                          | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)           |
| `sessionTimeout`              | 服务器上缓存会话的时间（以小时为单位）。                                                                                                                                                                                                                                                                                                                                                                                                                              | `2`                                       |
| `extendedVerification`        | 如果启用，验证证书 CN 或 SAN 是否与对等主机名匹配。                                                                                                                                                                                                                                                                                                                                                                                                                  | `false`                                   |
| `requireTLSv1`                | 要求使用 TLSv1 连接。可接受的值：`true`，`false`。                                                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                   |
| `requireTLSv1_1`              | 要求使用 TLSv1.1 连接。可接受的值：`true`，`false`。                                                                                                                                                                                                                                                                                                                                                                                                              | `false`                                   |
| `requireTLSv1_2`              | 要求使用 TLSv1.2 连接。可接受的值：`true`，`false`。                                                                                                                                                                                                                                                                                                                                                                                                              | `false`                                   |
| `fips`                        | 激活 OpenSSL FIPS 模式。如果库的 OpenSSL 版本支持 FIPS，则支持此功能。                                                                                                                                                                                                                                                                                                                                                                                               | `false`                                   |
| `privateKeyPassphraseHandler` | 请求访问私钥的密码短语的类（PrivateKeyPassphraseHandler 子类）。例如：`<privateKeyPassphraseHandler>`，`<name>KeyFileHandler</name>`，`<options><password>test</password></options>`，`</privateKeyPassphraseHandler>`。                                                                                                                                                                                                   | `KeyConsoleHandler`                       |
| `invalidCertificateHandler`   | 用于验证无效证书的类（CertificateHandler 的子类）。例如：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`。                                                                                                                                                                                                                                                                                 | `RejectCertificateHandler`                |
| `disableProtocols`            | 不允许使用的协议。                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                           |
| `preferServerCiphers`         | 客户端优先的服务器密码。                                                                                                                                                                                                                                                                                                                                                                                                                                               | `false`                                   |

**设置的例子：**

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

记录与 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 相关的事件。例如，添加或合并数据。您可以使用日志模拟合并算法并比较它们的特征。您可以可视化合并过程。

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

包含数据的目录的路径。

:::note
尾部斜杠是强制性的。
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

暴露供 [Prometheus](https://prometheus.io) 抓取的指标数据。

设置：

- `endpoint` – Prometheus 服务器抓取指标的 HTTP 端点。从 '/' 开始。
- `port` – `endpoint` 的端口。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表中暴露指标。
- `events` – 从 [system.events](/operations/system-tables/events) 表中暴露指标。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中暴露当前指标值。
- `errors` - 暴露自上次服务器重启以来按错误代码发生的错误数量。此信息也可以从 [system.errors](/operations/system-tables/errors) 中获取。

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

检查（将 `127.0.0.1` 替换为 ClickHouse 服务器的 IP 地址或主机名）：
```bash
curl 127.0.0.1:9363/metrics
```
## query_log {#query_log}

用于记录通过 [log_queries=1](../../operations/settings/settings.md) 设置接收到的查询的设置。

查询记录在 [system.query_log](/operations/system-tables/query_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中更改表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将会创建它。如果在更新 ClickHouse 服务器时查询日志的结构发生更改，旧结构的表将被重命名，并自动创建新表。

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

要手动打开指标历史收集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/query_metric_log.xml`，其内容如下：

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

| 设置                       | 描述                                                                   | 默认值         |
|-----------------------------|------------------------------------------------------------------------|-----------------|
| `max_size_in_bytes`         | 缓存大小的最大值（以字节为单位）。`0` 表示查询缓存被禁用。                    | `1073741824`    |
| `max_entries`               | 存储在缓存中的 `SELECT` 查询结果的最大数量。                                 | `1024`          |
| `max_entry_size_in_bytes`   | 可以保存到缓存中的 `SELECT` 查询结果的最大字节大小。                          | `1048576`       |
| `max_entry_size_in_rows`    | 可以保存到缓存中的 `SELECT` 查询结果的最大行数。                            | `30000000`      |

:::note
- 更改的设置立即生效。
- 查询缓存的数据在 DRAM 中分配。如果内存紧张，请确保为 `max_size_in_bytes` 设置小值，或完全禁用查询缓存。
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

用于记录通过 [log_query_threads=1](/operations/settings/settings#log_query_threads) 设置接收到的查询线程的设置。

查询记录在 [system.query_thread_log](/operations/system-tables/query_thread_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中更改表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将会创建它。如果在更新 ClickHouse 服务器时查询线程日志的结构发生更改，带有旧结构的表将被重命名，并自动创建新表。

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

用于记录查询依赖的视图（实时视图、物化视图等），由 [log_query_views=1](/operations/settings/settings#log_query_views) 设置决定。

查询记录在 [system.query_views_log](/operations/system-tables/query_views_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中更改表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将会创建它。如果在更新 ClickHouse 服务器时查询视图日志的结构发生更改，带有旧结构的表将被重命名，并自动创建新表。

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

另外：

| 设置   | 描述                                                                                                                                                                                                 | 默认值          |
|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| `level` | 将存储在表中的最大消息级别（默认为 `Trace`）。                                                                                                                                                                  | `Trace`          |

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

用于操作 [trace_log](/operations/system-tables/trace_log) 系统表的设置。

<SystemLogParameters/>

默认服务器配置文件 `config.xml` 包含以下设置部分：

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

用于操作 [crash_log](../../operations/system-tables/crash-log.md) 系统表的设置。

<SystemLogParameters/>

默认服务器配置文件 `config.xml` 包含以下设置部分：

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

此设置指定自定义（从 SQL 创建）缓存磁盘的缓存路径。`custom_cached_disks_base_directory` 对自定义磁盘的优先级高于 `filesystem_caches_path`（在 `filesystem_caches_path.xml` 中找到），后者在前者缺失时使用。文件系统缓存设置路径必须位于该目录内，否则会抛出异常，阻止磁盘的创建。

:::note
这不会影响在旧版本上创建的磁盘，对于那些服务器已升级的磁盘。在这种情况下不会抛出异常，以允许服务器成功启动。
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
## blog_storage_log {#blog_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) 系统表的设置。

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

基于正则表达式的规则，将应用于查询以及所有日志消息，然后将其存储在服务器日志中，[`system.query_log`](/operations/system-tables/query_log)，[`system.text_log`](/operations/system-tables/text_log)，[`system.processes`](/operations/system-tables/processes) 表中，以及发送给客户端的日志中。这可以防止敏感数据从 SQL 查询泄露，例如姓名、电子邮件、个人识别码或信用卡号码到日志中。

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

| 设置     | 描述                                                                  |
|-----------|-----------------------------------------------------------------------|
| `name`    | 规则的名称（可选）                                                   |
| `regexp`  | 兼容 RE2 的正则表达式（强制）                                        |
| `replace` | 敏感数据的替换字符串（可选，默认 - 六个星号）                         |

掩码规则应用于整个查询（以防止从格式错误/不可解析的查询中泄露敏感数据）。

[`system.events`](/operations/system-tables/events) 表有计数器 `QueryMaskingRulesMatch`，记录查询掩码规则的匹配总数。

对于分布式查询，每个服务器必须单独配置，否则传递给其他节点的子查询将存储在未掩码的状态中。
## remote_servers {#remote_servers}

用于 [分布式](../../engines/table-engines/special/distributed.md) 表引擎和 `cluster` 表函数的集群配置。

**示例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

有关 `incl` 属性的值，参见 "[配置文件](/operations/configuration-files)" 部分。

**另见**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [集群发现](../../operations/cluster-discovery.md)
- [复制数据库引擎](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

允许在与 URL 相关的存储引擎和表函数中使用的主机列表。

当添加一个主机时，使用 `\<host\>` XML 标签：
- 应按照 URL 中的确切格式指定，因为名称在 DNS 解析之前会被检查。例如：`<host>clickhouse.com</host>`
- 如果在 URL 中明确指定了端口，则将按整体检查 host:port。例如：`<host>clickhouse.com:80</host>`
- 如果主机在没有端口的情况下指定，则允许该主机的任何端口。例如，如果指定 `<host>clickhouse.com</host>`，那么 `clickhouse.com:20`（FTP），`clickhouse.com:80`（HTTP），`clickhouse.com:443`（HTTPS）等都是允许的。
- 如果主机指定为 IP 地址，则将按 URL 中指定的方式进行检查。例如：[2a02:6b8:a::a]。
- 如果存在重定向并且启用了重定向支持，则会检查每个重定向（位置字段）。

例如：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## timezone {#timezone}

服务器的时区。

指定为 UTC 时区或地理位置的 IANA 标识符（例如，Africa/Abidjan）。

时区在将 DateTime 字段输出到文本格式（显示在屏幕上或文件中）以及从字符串中获取 DateTime 时用于字符串与 DateTime 格式之间的转换。此外，时区还用于处理时间和日期的函数，如果它们未在输入参数中接收到时区。

**示例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**另见**

- [session_timezone](../settings/settings.md#session_timezone)
## tcp_port {#tcp_port}

与客户端通过 TCP 协议通信的端口。

**示例**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

与客户端进行安全通信的 TCP 端口。使用与 [OpenSSL](#openssl) 设置。

**默认值**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## mysql_port {#mysql_port}

与客户端通过 MySQL 协议通信的端口。

:::note
- 正整数指定要侦听的端口号。
- 空值用于禁用与客户端通过 MySQL 协议的通信。
:::

**示例**

```xml
<mysql_port>9004</mysql_port>
```
## postgresql_port {#postgresql_port}

与客户端通过 PostgreSQL 协议通信的端口。

:::note
- 正整数指定要侦听的端口号。
- 空值用于禁用与客户端通过 MySQL 协议的通信。
:::

**示例**

```xml
<postgresql_port>9005</postgresql_port>
```
## tmp_path {#tmp_path}

本地文件系统上用于存储大查询的临时数据的路径。

:::note
- 只能使用一个选项来配置临时数据存储：`tmp_path`，`tmp_policy`，`temporary_data_in_cache`。
- 尾部斜杠是强制性的。
:::

**示例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

用于将缩短或符号 URL 前缀转换为完整 URL 的配置。

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

用户文件的目录。在表函数 [file()](../../sql-reference/table-functions/file.md)，[fileCluster()](../../sql-reference/table-functions/fileCluster.md) 中使用。

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

包含以下内容的文件路径：

- 用户配置。
- 访问权限。
- 设置配置文件。
- 配额设置。

**示例**

```xml
<users_config>users.xml</users_config>
```

## access_control_improvements {#access_control_improvements}

访问控制系统中可选改进的设置。

| 设置                                            | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 默认值  |
|-------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`      | 设置没有宽松行策略的用户是否仍然可以使用 `SELECT` 查询读取行。例如，如果有两个用户 A 和 B，并且只有 A 有行策略，那么如果此设置为真，则用户 B 将看到所有行。如果此设置为假，则用户 B 将看不到任何行。                                                                                                                                                                                                                                                  | `true`  |
| `on_cluster_queries_require_cluster_grant`      | 设置 `ON CLUSTER` 查询是否需要 `CLUSTER` 授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `true`  |
| `select_from_system_db_requires_grant`          | 设置 `SELECT * FROM system.<table>` 是否需要任何授权，并且可以由任何用户执行。如果设置为真，则此查询需要 `GRANT SELECT ON system.<table>`，与非系统表相同。例外情况：一些系统表（ `tables`, `columns`, `databases`，以及一些常量表如 `one`, `contributors`）仍然对所有人可访问；并且如果授予了 `SHOW` 权限（例如 `SHOW USERS`），则相应的系统表（即 `system.users`）将可以访问。 | `true`  |
| `select_from_information_schema_requires_grant` | 设置 `SELECT * FROM information_schema.<table>` 是否需要任何授权，并且可以由任何用户执行。如果设置为真，则此查询需要 `GRANT SELECT ON information_schema.<table>`，与普通表相同。                                                                                                                                                                                                                                                                                     | `true`  |
| `settings_constraints_replace_previous`         | 设置某个设置的设置配置文件中的约束是否将取消该设置的先前约束（在其他配置文件中定义）所做的操作，包括新约束未设置的字段。它还启用 `changeable_in_readonly` 约束类型。                                                                                                                                                                                                                                                               | `true`  |
| `table_engines_require_grant`                   | 设置创建具有特定表引擎的表是否需要授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `false` |
| `role_cache_expiration_time_seconds`            | 设置角色在角色缓存中存储的最后访问以来的秒数。                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `600`   |

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
## zookeeper {#zookeeper}

包含允许 ClickHouse 与 [ZooKeeper](http://zookeeper.apache.org/) 集群交互的设置。 ClickHouse 在使用复制表时使用 ZooKeeper 存储副本的元数据。如果不使用复制表，则可以省略此参数部分。

以下设置可以通过子标签进行配置：

| 设置                                       | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                     | ZooKeeper 端点。您可以设置多个端点。例如：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性指定尝试连接到 ZooKeeper 集群时的节点顺序。                                                                                                                                                                                                                                                                                               |
| `session_timeout_ms`                       | 客户端会话的最大超时时间（以毫秒为单位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `operation_timeout_ms`                     | 单个操作的最大超时时间（以毫秒为单位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `root`（可选）                             | 用作 ClickHouse 服务器使用的 znodes 的根的 znode。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min`（可选）   | 当主节点不可用时，备用节点的 ZooKeeper 会话的最小生存时间限制（负载均衡）。以秒为单位设置。默认值：3小时。                                                                                                                                                                                                                                                                                                                                                                                             |
| `fallback_session_lifetime.max`（可选）   | 当主节点不可用时，备用节点的 ZooKeeper 会话的最大生存时间限制（负载均衡）。以秒为单位设置。默认值：6小时。                                                                                                                                                                                                                                                                                                                                                                                             |
| `identity`（可选）                        | ZooKeeper 访问请求的 znodes 所需的用户和密码。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `use_compression`（可选）                 | 如果设置为真，则启用 Keeper 协议中的压缩。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

还有 `zookeeper_load_balancing` 设置（可选），它让您选择 ZooKeeper 节点选择的算法：

| 算法名称                   | 描述                                                                                                                             |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `random`                   | 随机选择一个 ZooKeeper 节点。                                                                                                     |
| `in_order`                 | 选择第一个 ZooKeeper 节点，如果不可用，则选择第二个，依此类推。                                                                   |
| `nearest_hostname`         | 选择一个与服务器主机名最相似的 ZooKeeper 节点，主机名与名称前缀进行比较。                                                         |
| `hostname_levenshtein_distance` | 与 nearest_hostname 类似，但以 levenshtein 距离方式比较主机名。                                                               |
| `first_or_random`          | 选择第一个 ZooKeeper 节点，如果不可用，则随机选择其余的一个 ZooKeeper 节点。                                                       |
| `round_robin`              | 选择第一个 ZooKeeper 节点，如果重新连接发生，则选择下一个。                                                                      |

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

**另见**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper Programmer's Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse 和 Zookeeper 之间的可选安全通信](/operations/ssl-zookeeper)
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeper 中数据部分头的存储方法。此设置仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family) 家族。可以指定：

**在 `config.xml` 文件的 [merge_tree](#merge_tree) 部分全局设置**

ClickHouse 对服务器上的所有表使用该设置。您可以随时更改该设置。当设置更改时，现有表的行为会发生变化。

**对于每个表**

创建表时，指定对应的 [engine setting](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。即使全局设置发生变化，带有此设置的现有表的行为也不变。

**可能的值**

- `0` — 功能已关闭。
- `1` — 功能已开启。

如果 [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)，则 [replicated](../../engines/table-engines/mergetree-family/replication.md) 表以紧凑方式使用单个 `znode` 存储数据部分的标题。如果表包含很多列，则该存储方法显著减少存储在 ZooKeeper 中的数据量。

:::note
应用 `use_minimalistic_part_header_in_zookeeper = 1` 后，您不能将 ClickHouse 服务器降级到不支持此设置的版本。在集群中的服务器上升级 ClickHouse 时要小心。不要一次性升级所有服务器。最好先在测试环境中测试 ClickHouse 的新版本，或者只在集群中的少数几台服务器上进行测试。

已经使用此设置存储的数据部分头无法恢复到其之前（非紧凑）表示。
:::
## distributed_ddl {#distributed_ddl}

管理在集群上执行的 [distributed ddl queries](../../sql-reference/distributed-ddl.md)（ `CREATE`， `DROP`， `ALTER`， `RENAME` ）。仅在启用了 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 时有效。

`<distributed_ddl>` 中可配置的设置包括：

| 设置                     | 描述                                                                                                                        | 默认值                             |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------|------------------------------------|
| `path`                   | DDL 查询的 `task_queue` 在 Keeper 中的路径                                                                                |                                    |
| `profile`                | 执行 DDL 查询时使用的配置档                                                                                            |                                    |
| `pool_size`              | 可以同时运行多少个 `ON CLUSTER` 查询                                                                                      |                                    |
| `max_tasks_in_queue`     | 队列中可以存在的最大任务数。                                                                                                            | `1,000`                            |
| `task_max_lifetime`      | 如果节点的年龄超过此值，则删除节点。                                                                                   | `7 * 24 * 60 * 60`（一周，单位：秒） |
| `cleanup_delay_period`   | 如果上一个清理未在 `cleanup_delay_period` 秒内完成，首次接收到新节点事件后开始清理。                                   | `60` 秒                          |

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

**另见**

- [访问控制和帐户管理](/operations/access-rights#access-control-usage)
## allow_plaintext_password {#allow_plaintext_password}

设置是否允许明文密码类型（不安全）。 

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_no_password {#allow_no_password}

设置是否允许不安全的无密码类型。

```xml
<allow_no_password>1</allow_no_password>
```
## allow_implicit_no_password {#allow_implicit_no_password}

禁止创建没有密码的用户，除非显式指定 'IDENTIFIED WITH no_password'。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## default_session_timeout {#default_session_timeout}

默认会话超时时间，单位为秒。

```xml
<default_session_timeout>60</default_session_timeout>
```
## default_password_type {#default_password_type}

设置在查询如 `CREATE USER u IDENTIFIED BY 'p'` 中自动设置的密码类型。

接受的值有：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## user_directories {#user_directories}

包含以下设置的配置文件部分：
- 预定义用户的配置文件路径。
- SQL 命令创建的用户存储的文件夹路径。
- SQL 命令创建并复制的用户的 ZooKeeper 节点路径（实验性）。

如果指定此部分，则将不使用来自 [users_config](/operations/server-configuration-parameters/settings#users_config) 和 [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) 的路径。

`user_directories` 部分可以包含任意数量的项目，项目的顺序表示其优先级（项目越高，优先级越高）。

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

用户，角色，行策略，配额和配置文件也可以存储在 ZooKeeper 中：

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

您还可以定义 `memory` 部分——表示仅在内存中存储信息，而不写入磁盘，和 `ldap` 部分——表示在 LDAP 服务器上存储信息。

要将 LDAP 服务器作为远程用户目录添加，以存储未在本地定义的用户，定义一个 `ldap` 部分，其中包含以下设置：

| 设置     | 描述                                                                                                                                                                                                                                                                                                                                                                     |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | 在 `ldap_servers` 配置部分中定义的 LDAP 服务器名称之一。此参数是必需的，不能为空。                                                                                                                                                                                                                                              |
| `roles`  | 包含从 LDAP 服务器检索的每个用户将被分配的本地定义角色的列表的部分。如果未指定任何角色，则用户在身份验证后将无法执行任何操作。如果在身份验证时未在本地定义列出的任何角色，则身份验证尝试将失败，仿佛提供的密码不正确。 |

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

定义自定义顶级域的列表以添加，每个条目的格式为 `<name>/path/to/file</name>`。

例如：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

另见：
- 函数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) 及其变体，
  它接受自定义 TLD 列表名称，返回包含顶级子域的域的一部分，直到第一个显著的子域。
## proxy {#proxy}

定义用于 HTTP 和 HTTPS 请求的代理服务器，当前 S3 存储，S3 表函数和 URL 函数支持。

有三种定义代理服务器的方法：
- 环境变量
- 代理列表
- 远程代理解析器。

支持针对特定主机绕过代理服务器，使用 `no_proxy`。

**环境变量**

`http_proxy` 和 `https_proxy` 环境变量允许您为给定协议指定代理服务器。如果在系统上设置，它应该无缝工作。

这是最简单的方法，如果给定协议仅有一个代理服务器，并且该代理服务器不更改。

**代理列表**

此方法允许您为协议指定一个或多个代理服务器。如果定义了多个代理服务器，ClickHouse 将以轮询方式使用不同的代理，平衡服务器之间的负载。如果某协议有多个代理服务器，并且代理服务器列表不会更改，这是最简单的方法。

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
选择下面选项卡中的父字段以查看它们的子项：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段     | 描述                             |
|----------|----------------------------------|
| `<http>` | 一个或多个 HTTP 代理的列表      |
| `<https>`| 一个或多个 HTTPS 代理的列表     |

  </TabItem>
  <TabItem value="http_https" label="<http> 和 <https>">


| 字段   | 描述                      |
|--------|---------------------------|
| `<uri>`| 代理的 URI               |

  </TabItem>
</Tabs>

**远程代理解析器**

代理服务器可能会动态更改。在这种情况下，您可以定义解析器的端点。ClickHouse 向该端点发送一个空的 GET 请求，远程解析器应该返回代理主机。 ClickHouse 将使用以下模板形成代理 URI：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

选择下面选项卡中的父字段以查看它们的子项：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段    | 描述                           |
|---------|--------------------------------|
| `<http>`| 一个或多个解析器的列表*        |
| `<https>`| 一个或多个解析器的列表*      |

  </TabItem>
  <TabItem value="http_https" label="<http> 和 <https>">

| 字段         | 描述                                   |
|--------------|----------------------------------------|
| `<resolver>` | 解析器的端点和其他详细信息           |

:::note
您可以拥有多个 `<resolver>` 元素，但仅使用给定协议的第一个 `<resolver>`。该协议的任何其他 `<resolver>` 元素都会被忽略。这意味着负载均衡（如有必要）应该由远程解析器实现。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| 字段               | 描述                                                                                                                                                                              |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | 代理解析器的 URI                                                                                                                                                              |
| `<proxy_scheme>`    | 最终代理 URI 的协议。可以是 `http` 或 `https`。                                                                                                                         |
| `<proxy_port>`      | 代理解析器的端口号                                                                                                                                                   |
| `<proxy_cache_time>` | ClickHouse 应缓存解析器值的时间（以秒为单位）。将此值设置为 `0` 会导致 ClickHouse 每次进行 HTTP 或 HTTPS 请求时都联系解析器。 |

  </TabItem>
</Tabs>

**优先级**

代理设置按以下顺序确定：

| 顺序 | 设置                  |
|------|------------------------|
| 1.   | 远程代理解析器        |
| 2.   | 代理列表              |
| 3.   | 环境变量              |

ClickHouse 将检查请求协议的最高优先级解析器类型。如果未定义，将检查下一个最高优先级的解析器类型，直到检查到环境解析器。这也允许混合使用解析器类型。
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

默认情况下，隧道（即 `HTTP CONNECT`）用于通过 `HTTP` 代理发出 `HTTPS` 请求。此设置可用于禁用该功能。

**no_proxy**

默认情况下，所有请求都将通过代理。为了对特定主机禁用代理，必须设置 `no_proxy` 变量。
它可以在列表和远程解析器的 `<proxy>` 子句中设置，也可以作为环境变量设置用于环境解析器。
它支持 IP 地址、域、子域以及 `'*'` 通配符以实现完全绕过。前导点将被删除，就像 curl 一样。

**示例**

以下配置绕过对 `clickhouse.cloud` 及其所有子域（例如 `auth.clickhouse.cloud`）的代理请求。
同样适用于 GitLab，即使它有一个前导点。`gitlab.com` 和 `about.gitlab.com` 都将绕过代理。

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

**另见**
- [工作负载层次结构](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的 ZooKeeper 节点路径。为了保持一致性，所有 SQL 定义都存储为该单个 znode 的值。默认情况下不使用 ZooKeeper，定义存储在 [disk](#workload_path)。

**示例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**另见**
- [工作负载层次结构](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
