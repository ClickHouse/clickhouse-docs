---
{}
---



## asynchronous_metric_log {#asynchronous_metric_log}

在 ClickHouse Cloud 部署中默认启用。

如果您的环境中未默认启用此设置，具体取决于 ClickHouse 的安装方式，您可以按照以下说明启用或禁用它。

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

要禁用 `asynchronous_metric_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`，内容如下：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## auth_use_forwarded_address {#auth_use_forwarded_address}

为通过代理连接的客户端使用来源地址进行身份验证。

:::note
此设置应谨慎使用，因为转发地址容易被伪造 - 接受此类身份验证的服务器不应直接访问，而应仅通过受信任的代理进行访问。
:::
## backups {#backups}

备份设置，用于写入 `BACKUP TO File()`。

以下设置可以通过子标签进行配置：

| 设置                               | 描述                                                                                                                                                                     | 默认 |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                     | 使用 `File()` 时备份的路径。此设置必须设置以便使用 `File`。路径可以是相对于实例目录的相对路径，也可以是绝对路径。                                                     | `true`  |
| `remove_backup_files_after_failure` | 如果 `BACKUP` 命令失败，ClickHouse 会尝试删除在失败之前已复制到备份的文件，否则它将保留已复制的文件。                                                                  | `true`  |

此设置的默认配置为：

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## bcrypt_workfactor {#bcrypt_workfactor}

bcrypt_password 身份验证类型的工作因子，使用 [Bcrypt 算法](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```
## table_engines_require_grant {#table_engines_require_grant}

如果设置为 true，用户在创建特定引擎的表时需要授权，例如 `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
默认情况下，为向后兼容，使用特定表引擎创建表时忽略授权，但您可以通过将此设置为 true 来更改此行为。
:::
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

重新加载内置字典之前的时间间隔，以秒为单位。

ClickHouse 每 x 秒重新加载内置字典。这使得可以在不重新启动服务器的情况下"动态"编辑字典。

**示例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的数据压缩设置。

:::note
我们建议您在刚开始使用 ClickHouse 时不要随意更改此设置。
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

- `min_part_size` – 数据部分的最小大小。
- `min_part_size_ratio` – 数据部分大小与表大小的比率。
- `method` – 压缩方法。可接受值：`lz4`，`lz4hc`，`zstd`，`deflate_qpl`。
- `level` – 压缩级别。请参见 [Codecs](/sql-reference/statements/create/table#general-purpose-codecs)。

:::note
您可以配置多个 `<case>` 部分。
:::

**满足条件时的操作**:

- 如果数据部分匹配条件集，ClickHouse 使用指定的压缩方法。
- 如果数据部分匹配多个条件集，ClickHouse 使用第一个匹配的条件集。

:::note
如果数据部分没有满足任何条件，ClickHouse 使用 `lz4` 压缩。
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

配置一个命令以获取用于 [加密编解码器](/sql-reference/statements/create/table#encryption-codecs) 的密钥。密钥（或密钥）应写入环境变量或在配置文件中设置。

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
不推荐将密钥存储在配置文件中。这并不安全。您可以将密钥移动到安全磁盘上的单独配置文件中，并在 `config.d/` 文件夹中放置该配置文件的符号链接。
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

在这里，`current_key_id` 设置用于加密的当前密钥，所有指定的密钥都可用于解密。

这些方法都可以应用于多个密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

在这里，`current_key_id` 显示用于加密的当前密钥。

此外，用户可以添加 nonce，必须为 12 字节长（默认情况下，加密和解密过程使用由零字节组成的 nonce）：

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
上述所有内容均适用于 `aes_256_gcm_siv`（但密钥必须为 32 字节长）。
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

要禁用 `error_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_error_log.xml`，内容如下：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## custom_settings_prefixes {#custom_settings_prefixes}

[自定义设置](/operations/settings/query-level#custom_settings) 的前缀列表。前缀之间必须用逗号分隔。

**示例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**另请参见**

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

默认设置档案。设置档案位于 `user_config` 设置指定的文件中。

**示例**

```xml
<default_profile>default</default_profile>
```
## dictionaries_config {#dictionaries_config}

字典的配置文件的路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 \* 和 ?。

另请参见：
- "[字典](../../sql-reference/dictionaries/index.md)"。

**示例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

可执行用户自定义函数的配置文件路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 \* 和 ?。

另请参见：
- "[可执行用户自定义函数](/sql-reference/functions/udf#executable-user-defined-functions)。"

**示例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## format_schema_path {#format_schema_path}

包含输入数据模式的目录路径，例如 [CapnProto](../../interfaces/formats.md#capnproto) 格式的模式。

**示例**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## graphite {#graphite}

向 [Graphite](https://github.com/graphite-project) 发送数据。

设置：

- `host` – Graphite 服务器。
- `port` – Graphite 服务器上的端口。
- `interval` – 发送间隔，以秒为单位。
- `timeout` – 发送数据的超时时间，以秒为单位。
- `root_path` – 密钥前缀。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表发送数据。
- `events` – 从 [system.events](/operations/system-tables/events) 表发送在时间段内累积的数据。
- `events_cumulative` – 从 [system.events](/operations/system-tables/events) 表发送累积数据。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表发送数据。

您可以配置多个 `<graphite>` 子句。例如，您可以为不同数据在不同时间间隔内发送配置。

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

用于稀疏数据的 Graphite 设置。

更多细节，请参见 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)。

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

定义包含 Protobuf 类型的原语文件的目录。

示例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

允许使用自定义 HTTP 处理程序。
要添加新的 HTTP 处理程序，只需添加一个新的 `<rule>`。
处理规则按定义的顺序从上到下检查，
第一个匹配项将运行处理程序。

以下设置可以通过子标签进行配置：

| 子标签              | 定义                                                                                                                                                                                               |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | 要匹配请求 URL，您可以使用 'regex:' 前缀来使用正则表达式匹配（可选）                                                                                                                                 |
| `methods`          | 要匹配请求方法，您可以用逗号分隔多个方法匹配（可选）                                                                                                                                             |
| `headers`          | 要匹配请求头，逐一匹配每个子元素（子元素名称为头名称），您可以使用 'regex:' 前缀来使用正则表达式匹配（可选）                                                                                    |
| `handler`          | 请求处理程序                                                                                                                                                                                      |
| `empty_query_string` | 检查 URL 中是否没有查询字符串                                                                                                                                                                         |

`handler` 包含以下设置，可以通过子标签进行配置：

| 子标签                 | 定义                                                                                                                                                                             |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                 | 重定向位置                                                                                                                                                                       |
| `type`                | 支持的类型：static，dynamic_query_handler，predefined_query_handler，redirect                                                                                                   |
| `status`              | 与静态类型一起使用，响应状态码                                                                                                                                                      |
| `query_param_name`    | 与 dynamic_query_handler 类型一起使用，提取并执行与 HTTP 请求参数中的 `<query_param_name>` 值相对应的值                                                                                  |
| `query`               | 与 predefined_query_handler 类型一起使用，处理程序被调用时执行的查询                                                                                                             |
| `content_type`        | 与静态类型一起使用，响应内容类型                                                                                                                                                  |
| `response_content`    | 与静态类型一起使用，发送给客户端的响应内容，当使用前缀 'file://' 或 'config://' 时，从文件或配置中查找内容并发送给客户端                                                            |

在规则列表中，您可以指定 `<defaults/>`，以启用所有默认处理程序。

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

访问 `http://localhost: http_port` 时打开 `https://tabix.io/`。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

用于在 `OPTIONS` HTTP 请求中向响应添加头部。
`OPTIONS` 方法用于进行 CORS 预检请求。

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

HSTS 的过期时间，以秒为单位。

:::note
值为 `0` 表示 ClickHouse 禁用 HSTS。如果您设置一个正数，HSTS 将被启用，最大年龄为您设置的数字。
:::

**示例**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

启动后执行 `mlockall` 以降低首个查询的延迟，并防止 ClickHouse 可执行文件在高 IO 负载下被分页出去。

:::note
推荐启用此选项，但将导致启动时间增加到几秒。
请记住，此设置在没有 "CAP_IPC_LOCK" 能力的情况下将无法使用。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

替换项文件的路径。支持 XML 和 YAML 格式。

有关更多信息，请参见 "[配置文件](/operations/configuration-files)"。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

限制可以在 ClickHouse 服务器之间交换数据的主机。
如果使用 Keeper，则相同的限制将适用于不同 Keeper 实例之间的通信。

:::note
默认值与 [`listen_host`](#listen_host) 设置相等。
:::

**示例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

类型：

默认：
## interserver_http_port {#interserver_http_port}

用于 ClickHouse 服务器之间交换数据的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_http_host {#interserver_http_host}

其他服务器可以用来访问该服务器的主机名。

如果省略，则按 `hostname -f` 命令的相同方式定义。

对于脱离特定网络接口很有用。

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

类似于 [`interserver_http_host`](#interserver_http_host)，但此主机名可供其他服务器通过 `HTTPS` 访问此服务器。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

用于在 [复制](../../engines/table-engines/mergetree-family/replication.md) 期间连接其他服务器的用户名和密码。此外，服务器使用这些凭据对其他副本进行身份验证。
因此，`interserver_http_credentials` 必须在集群内的所有副本中相同。

:::note
- 默认情况下，如果省略 `interserver_http_credentials` 部分，则在复制过程中不使用身份验证。
- `interserver_http_credentials` 设置与 ClickHouse 客户端凭据的 [配置](../../interfaces/cli.md#configuration_files) 无关。
- 这些凭据适用于通过 `HTTP` 和 `HTTPS` 进行复制。
:::

以下设置可以通过子标签进行配置：

- `user` — 用户名。
- `password` — 密码。
- `allow_empty` — 如果为 `true`，则允许其他副本在设置凭据的情况下连接而无需身份验证。如果为 `false`，则拒绝未经身份验证的连接。默认值：`false`。
- `old` — 包含在凭据轮换过程中使用的旧 `user` 和 `password`。可以指定多个 `old` 部分。

**凭据轮换**

ClickHouse 支持动态 interserver 凭据轮换，而无需同时停止所有副本以更新其配置。凭据可以分几步更改。

要启用身份验证，将 `interserver_http_credentials.allow_empty` 设置为 `true` 并添加凭据。这允许使用身份验证和不使用身份验证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

在配置所有副本后，将 `allow_empty` 设置为 `false` 或删除此设置。这样会使新凭据的身份验证成为强制性。

要更改现有凭据，将用户名和密码移动到 `interserver_http_credentials.old` 部分，并使用新值更新 `user` 和 `password`。此时服务器使用新凭据连接其他副本，并接受使用新或旧凭据的连接。

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

当新凭据应用于所有副本后，可以移除旧凭据。
## ldap_servers {#ldap_servers}

在此列出 LDAP 服务器及其连接参数，以：
- 将其用作专用本地用户的身份验证者，这些用户在身份验证机制中指定 'ldap' 而不是 'password'
- 将其用作远程用户目录。

以下设置可以通过子标签进行配置：

| 设置                           | 描述                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP 服务器主机名或 IP，此参数是必需的，不能为空。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP 服务器端口，如果 `enable_tls` 设置为 true，则默认为 636，否则为 389。                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                      | 用于构造绑定的 DN 的模板。其结果 DN 将通过在每次身份验证尝试中用实际用户名替换模板中的所有 `\{user_name\}` 子串来构造。                                                                                                                                                                                                                                                                            |
| `user_dn_detection`            | 包含用于检测绑定用户的实际用户 DN 的 LDAP 搜索参数的部分。这主要用于在服务器为 Active Directory 时进行角色映射的搜索过滤器。替换 `\{user_dn\}` 子串的结果用户 DN 将在搜索执行后更新为实际检测到的用户 DN 值。默认情况下，用户 DN 设置为等于绑定 DN，但一旦执行搜索，它将更新为实际检测到的用户 DN 值。 |
| `verification_cooldown`        | 在成功绑定尝试后，一段时间（以秒为单位），在此期间，用户将被假定为成功通过所有后续请求的身份验证，而无需联系 LDAP 服务器。指定 `0`（默认）以禁用缓存，并强制在每次身份验证请求时联系 LDAP 服务器。                                                                                                                  |
| `enable_tls`                   | 触发与 LDAP 服务器建立安全连接的标志。指定 `no` 以使用明文协议 (`ldap://`)（不推荐）。指定 `yes` 以使用 SSL/TLS (`ldaps://`) 协议（推荐，默认）。指定 `starttls` 以使用旧的 StartTLS 协议（明文协议 (`ldap://`)，升级为 TLS）。                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLS 的最低协议版本。可接受的值：`ssl2`，`ssl3`，`tls1.0`，`tls1.1`，`tls1.2`（默认）。                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`             | SSL/TLS 对等证书验证行为。可接受的值：`never`，`allow`，`try`，`demand`（默认）。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 证书密钥文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | 包含 CA 证书的目录路径。                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 允许的密码套件（以 OpenSSL 表示法）。                                                                                                                                                                                                                                                                                                                                                                                              |

设置 `user_dn_detection` 可以使用子标签进行配置：

| 设置             | 描述                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | 用于构造 LDAP 搜索的基本 DN 的模板。结果 DN 将通过替换模板中的所有 `\{user_name\}` 和 '\{bind_dn\}' 子串来构造。                                                                                                                                                |
| `scope`         | LDAP 搜索的范围。可接受的值：`base`、`one_level`、`children`、`subtree`（默认）。                                                                                                                                                                                                                                       |
| `search_filter` | 用于构造 LDAP 搜索搜索过滤器的模板。搜索的结果将通过替换模板中的所有 `\{user_name\}`、`\{bind_dn\}` 和 `\{base_dn\}` 子串来构造。请注意，在 XML 中必须正确转义特殊字符。 |

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

示例（典型的 Active Directory，配置了用于进一步角色映射的用户 DN 检测）：

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

限制请求可以来自的主机。如果您希望服务器可以响应所有请求，请指定 `::`。

示例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

如果在尝试监听时 IPv6 或 IPv4 网络不可用，服务器不会退出。

**示例**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

允许多个服务器在同一地址:端口上进行监听。请求将随机路由到操作系统路由的一个服务器。启用此设置不推荐。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

类型：

默认：
## listen_backlog {#listen_backlog}

监听套接字的待处理连接的回溯（队列大小）。默认值 `4096` 与 linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)) 的值相同。

通常，该值不需要更改，因为：
- 默认值足够大，
- 服务器为接受客户端的连接分配了单独的线程。

因此，即使您有 `TcpExtListenOverflows`（来自 `nstat`）不为零，并且该计数器在 ClickHouse 服务器上增长，但这并不意味着此值需要增大，因为：
- 通常，如果 `4096` 不够，则说明存在某些内部的 ClickHouse 扩展问题，因此最好报告此问题。
- 这并不意味着服务器后来可以处理更多连接（即使可以，到那时客户端可能已经消失或断开连接）。

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

日志消息的位置和格式。

**键**:

| 键                        | 描述                                                                                                                                                                             |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | 日志级别。可接受的值: `none`（关闭日志），`fatal`，`critical`，`error`，`warning`，`notice`，`information`，`debug`，`trace`，`test`                                     |
| `log`                     | 日志文件的路径。                                                                                                                                                                   |
| `errorlog`                | 错误日志文件的路径。                                                                                                                                                               |
| `size`                    | 旋转策略：日志文件的最大大小（字节）。一旦日志文件大小超过此阈值，将被重命名并归档，并创建一个新的日志文件。                                                                |
| `count`                   | 旋转策略：Clickhouse至多保留多少个历史日志文件。                                                                                                                                 |
| `stream_compress`         | 使用 LZ4 压缩日志消息。设置为 `1` 或 `true` 以启用。                                                                                                                           |
| `console`                 | 不将日志消息写入日志文件，而是在控制台打印。设置为 `1` 或 `true` 以启用。如果 Clickhouse 未以守护模式运行，默认值为 `1`，否则为 `0`。                                |
| `console_log_level`       | 控制台输出的日志级别。默认为 `level`。                                                                                                                                              |
| `formatting`              | 控制台输出的日志格式。目前仅支持 `json`。                                                                                                                                          |
| `use_syslog`              | 还将日志输出转发到 syslog。                                                                                                                                                        |
| `syslog_level`            | 写入 syslog 的日志级别。                                                                                                                                                          |

**日志格式说明符**

在 `log` 和 `errorLog` 路径中的文件名支持以下格式说明符（目录部分不支持它们）。

列“示例”显示在 `2023-07-06 18:32:07` 的输出。

| 说明符      | 描述                                                                                                             | 示例                   |
|--------------|------------------------------------------------------------------------------------------------------------------|-----------------------|
| `%%`         | 字面 %                                                                                                         | `%`                    |
| `%n`         | 换行符                                                                                                         |                       |
| `%t`         | 横向制表符                                                                                                     |                       |
| `%Y`         | 年份（十进制数字），例如 2017                                                                                    | `2023`                |
| `%y`         | 年的最后两位数字（范围 [00,99]）                                                                               | `23`                  |
| `%C`         | 年份的前两位数字（范围 [00,99]）                                                                               | `20`                  |
| `%G`         | 四位数的 [ISO 8601 基于周的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份，通常仅在使用 `%V` 时有用 | `2023`                |
| `%g`         | [ISO 8601 基于周的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) 的最后两位数字，即包含指定周的年份                      | `23`                  |
| `%b`         | 缩写的月份名称，例如 Oct（依赖于语言环境）                                                                     | `Jul`                 |
| `%h`         | %b 的同义词                                                                                                    | `Jul`                 |
| `%B`         | 完整的月份名称，例如 October（依赖于语言环境）                                                                 | `July`                |
| `%m`         | 月份（十进制数字）（范围 [01,12]）                                                                             | `07`                  |
| `%U`         | 以十进制数字表示的一年中的周（星期天为一周的第一天）（范围 [00,53]）                                        | `27`                  |
| `%W`         | 以十进制数字表示的一年中的周（星期一为一周的第一天）（范围 [00,53]）                                        | `27`                  |
| `%V`         | ISO 8601 周号（范围 [01,53]）                                                                                   | `27`                  |
| `%j`         | 以十进制数字表示的年度中的天数（范围 [001,366]）                                                             | `187`                 |
| `%d`         | 以零填充的十进制数字表示一个月中的天数（范围 [01,31]）。单个数字会前面加零。                                | `06`                  |
| `%e`         | 以空格填充的十进制数字表示一个月中的天数（范围 [1,31]）。单个数字会前面加一个空格。                       | `&nbsp; 6`            |
| `%a`         | 缩写的星期几名称，例如 Fri（依赖于语言环境）                                                                   | `Thu`                 |
| `%A`         | 完整的星期几名称，例如 Friday（依赖于语言环境）                                                                 | `Thursday`            |
| `%w`         | 星期几以整数形式表示，星期天为 0（范围 [0-6]）                                                                     | `4`                   |
| `%u`         | 星期几以十进制数字表示，其中星期一为 1（ISO 8601 格式）（范围 [1-7]）                                          | `4`                   |
| `%H`         | 以十进制数字表示的小时，24 小时制（范围 [00-23]）                                                               | `18`                  |
| `%I`         | 以十进制数字表示的小时，12 小时制（范围 [01,12]）                                                               | `06`                  |
| `%M`         | 以十进制数字表示的分钟（范围 [00,59]）                                                                          | `32`                  |
| `%S`         | 以十进制数字表示的秒（范围 [00,60]）                                                                            | `07`                  |
| `%c`         | 标准日期和时间字符串，例如 Sun Oct 17 04:41:13 2010（依赖于语言环境）                                           | `Thu Jul  6 18:32:07 2023` |
| `%x`         | 本地化的日期表示（依赖于语言环境）                                                                              | `07/06/23`            |
| `%X`         | 本地化的时间表示，例如 18:40:20 或 6:40:20 PM （依赖于语言环境）                                                | `18:32:07`            |
| `%D`         | 短的 MM/DD/YY 日期，相当于 %m/%d/%y                                                                                | `07/06/23`            |
| `%F`         | 短的 YYYY-MM-DD 日期，相当于 %Y-%m-%d                                                                              | `2023-07-06`          |
| `%r`         | 本地化的 12 小时制时间（依赖于语言环境）                                                                          | `06:32:07 PM`        |
| `%R`         | 相当于 "%H:%M"                                                                                                   | `18:32`               |
| `%T`         | 相当于 "%H:%M:%S"（ISO 8601 时间格式）                                                                              | `18:32:07`            |
| `%p`         | 本地化的 a.m. 或 p.m. 指示（依赖于语言环境）                                                                      | `PM`                  |
| `%z`         | 以 ISO 8601 格式表示的 UTC 偏移（例如 -0430），如果没有时区信息则为无字符                                       | `+0800`               |
| `%Z`         | 依赖于语言环境的时区名称或缩写，如果没有时区信息则为无字符                                                      | `Z AWST`              |

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

要仅在控制台打印日志消息：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**每级别覆盖**

可以覆盖单个日志名称的日志级别。例如，要静音所有 "Backup" 和 "RBAC" 日志的消息。

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

要额外将日志消息写入 syslog：

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

| 键        | 描述                                                                                                                                                                                                                                                 |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | syslog 的地址，格式为 `host\[:port\]`。如果省略，将使用本地守护进程。                                                                                                                                                                                    |
| `hostname` | 发送日志的主机名称（可选）。                                                                                                                                                                                                                          |
| `facility` | syslog [设施关键字](https://en.wikipedia.org/wiki/Syslog#Facility)。必须使用带 "LOG_" 前缀的大写字母指定，例如 `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` 等。如果指定 `address`，默认值为 `LOG_USER`，否则为 `LOG_DAEMON`。 |
| `format`   | 日志消息格式。可能的值: `bsd` 和 `syslog`。                                                                                                                                                                                                          |

**日志格式**

您可以指定将在控制台日志中输出的日志格式。目前，仅支持 JSON。

**示例**

这是输出 JSON 日志的示例：

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

可以通过更改 `<names>` 标签内的标签值来修改键名。例如，要将 `DATE_TIME` 更改为 `MY_DATE_TIME`，可以使用 `<date_time>MY_DATE_TIME</date_time>`。

**省略 JSON 日志的键**

可以通过注释掉属性来省略日志属性。例如，如果您不希望日志打印 `query_id`，可以注释掉 `<query_id>` 标签。
## send_crash_reports {#send_crash_reports}

发送崩溃报告到 ClickHouse 核心开发团队的设置。

在预生产环境中启用它是非常受欢迎的。

键：

| 键                     | 描述                                                                                                                                            |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`               | 布尔标志以启用该功能，默认为 `true`。设置为 `false` 以避免发送崩溃报告。                                                                         |
| `send_logical_errors`   | `LOGICAL_ERROR` 类似于 `assert`，是 ClickHouse 中的一个错误。此布尔标志允许发送此异常（默认值：`true`）。                                     |
| `endpoint`              | 您可以覆盖用于发送崩溃报告的端点 URL。                                                                                                         |

**推荐用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## ssh_server {#ssh_server}

主机密钥的公用部分将在第一次连接时写入 SSH 客户端侧的 known_hosts 文件。

主机密钥配置默认情况下是非激活的。
取消注释主机密钥配置，并提供相应 SSH 密钥的路径以激活它们：

示例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## tcp_ssh_port {#tcp_ssh_port}

允许用户通过 PTY 使用嵌入式客户端以交互方式连接和执行查询的 SSH 服务器端口。

示例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## storage_configuration {#storage_configuration}

允许存储的多磁盘配置。

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

以上子标签定义了 `disks` 的以下设置：

| 设置                     | 描述                                                                                             |
|--------------------------|--------------------------------------------------------------------------------------------------|
| `<disk_name_N>`          | 磁盘的名称，必须是唯一的。                                                                       |
| `path`                   | 服务器数据将存储的路径（`data` 和 `shadow` 目录）。应以 `/` 结尾。                            |
| `keep_free_space_bytes`  | 磁盘上保留的空闲空间大小。                                                                       |

:::note
磁盘的顺序无关紧要。
:::
### 策略配置 {#configuration-of-policies}

以上子标签定义了 `policies` 的以下设置：

| 设置                      | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`           | 策略的名称。策略名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `volume_name_N`           | 卷名称。卷名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `disk`                    | 位于卷中的磁盘。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `max_data_part_size_bytes` | 可以驻留在此卷中的任何磁盘上的数据块的最大大小。如果合并的结果块的大小预计会大于 `max_data_part_size_bytes`，则该块将写入下一个卷。基本上，此功能允许您在热卷（SSD）上存储新 / 小块数据，并在它们达到较大大小时将它们移动到冷卷（HDD）。如果政策只有一个卷，请勿使用此选项。                                                                         |
| `move_factor`             | 卷中可用空闲空间的份额。如果空间变少，数据将开始转移到下一个卷（如果有的话）。在传输过程中，块按大小从大到小（降序）排序，并选择总大小足够满足 `move_factor` 条件的块，如果所有块的总大小不足，则将移动所有块。                                                                                                                                                                                                                |
| `perform_ttl_move_on_insert` | 禁用在插入时移动具有过期 TTL 的数据。默认情况下（如果启用），如果我们插入一段根据移动生存规则已过期的数据，它将立即移动到移动规则中指定的卷 / 磁盘上。如果目标卷 / 磁盘速度较慢（例如 S3），这可能会显著减慢插入。如果禁用，过期的数据部分将写入默认卷，然后立即移动到规则中指定的过期 TTL 磁盘。 |
| `load_balancing`          | 磁盘平衡策略，`round_robin` 或 `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `least_used_ttl_ms`       | 设置更新时间（以毫秒为单位）以更新所有磁盘上的可用空间（`0` - 始终更新，`-1` - 从不更新，默认值为 `60000`）。请注意，如果磁盘仅由 ClickHouse 使用，并且不会受到文件系统动态调整的影响，则可以使用 `-1` 值。在所有其他情况下，这不推荐使用，因为它最终会导致不正确的空间分配。                                                                                                   |
| `prefer_not_to_merge`     | 禁用在此卷上合并数据的部分。注意：这可能会有害，并导致速度减慢。当启用此设置（请勿这样做）时，禁止在此卷上合并数据（这是不好的）。这样可以控制 ClickHouse 与慢磁盘的交互方式。我们建议根本不使用此设置。                                                                                                                                                                                                                           |
| `volume_priority`         | 定义填充卷的优先级（顺序）。值越小，优先级越高。参数值必须是自然数，并覆盖从 1 到 N（N 是指定的最大参数值）的范围，没有缺口。                                                                                                                                                                                                                                                                                                              |

对于 `volume_priority`：
- 如果所有卷都有此参数，它们将按指定顺序进行优先排序。
- 如果仅有 _一些_ 卷具有此参数，则没有此参数的卷具有最低优先级。具有此参数的卷按标签值优先排序，其余卷的优先级由其在配置文件中的描述顺序决定。
- 如果 _没有_ 卷提供此参数，则其顺序由配置文件中的描述顺序决定。
- 卷的优先级可以不相同。
## macros {#macros}

用于复制表的参数替换。

如果不使用复制表，可以省略。

有关更多信息，请参见 [创建复制表](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) 部分。

**示例**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

数据库 Replicated 的副本组名称。

由 Replicated 数据库创建的集群将由同组中的副本组成。
DDL 查询将仅等待同组中的副本。

默认值为空。

**示例**

```xml
<replica_group_name>backups</replica_group_name>
```
## remap_executable {#remap_executable}

设置以使用大页重新分配机器代码的内存（“文本”）。

:::note
该功能高度实验性。
:::

示例：

```xml
<remap_executable>false</remap_executable>
```
## max_open_files {#max_open_files}

最大打开文件数。

:::note
我们建议在 macOS 上使用此选项，因为 `getrlimit()` 函数返回不正确的值。
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

用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 中表的微调。

有关更多信息，请参见 MergeTreeSettings.h 头文件。

**示例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

默认情况下禁用。

**启用**

要手动启用指标历史收集 [`system.metric_log`](../../operations/system-tables/metric_log.md)，请创建 `/etc/clickhouse-server/config.d/metric_log.xml`，并使用以下内容：

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

要禁用 `metric_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_metric_log.xml`，并使用以下内容：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## latency_log {#latency_log}

默认情况下禁用。

**启用**

要手动启用延迟历史收集 [`system.latency_log`](../../operations/system-tables/latency_log.md)，请创建 `/etc/clickhouse-server/config.d/latency_log.xml`，并使用以下内容：

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

要禁用 `latency_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_latency_log.xml`，并使用以下内容：

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## replicated_merge_tree {#replicated_merge_tree}

用于 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 中表的微调。此设置具有更高的优先级。

有关更多信息，请参见 MergeTreeSettings.h 头文件。

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

SSL 的支持是通过 `libpoco` 库提供的。可用的配置选项在 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) 中进行了说明。默认值可以在 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) 中找到。

服务器/客户端设置的密钥：

| 选项                            | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 默认值                                     |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `privateKeyFile`               | 包含 PEM 证书的秘密密钥的文件路径。该文件可以同时包含密钥和证书。                                                                                                                                                                                                                                                                                                                                                                                                 |                                          |
| `certificateFile`              | 客户端/服务器证书文件的 PEM 格式路径。如果 `privateKeyFile` 包含证书，则可以省略。                                                                                                                                                                                                                                                                                                                                                                          |                                          |
| `caConfig`                     | 包含受信任 CA 证书的文件或目录的路径。如果指向文件，它必须是 PEM 格式，可以包含多个 CA 证书。如果指向目录，则每个 CA 证书必须包含一个 .pem 文件。文件名通过 CA 主体名称的哈希值进行查找。详细信息可以在 [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) 的手册页中找到。                                                                                                  |                                          |
| `verificationMode`             | 检查节点证书的方法。详细信息在 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的描述中。可能的值：`none`，`relaxed`，`strict`，`once`。                                                                                                                                                                                                                                                                    | `relaxed`                               |
| `verificationDepth`            | 验证链的最大长度。如果证书链的长度超过设置的值，则验证将失败。                                                                                                                                                                                                                                                                                                                                                                                                  | `9`                                     |
| `loadDefaultCAFile`            | 是否使用内置的 OpenSSL CA 证书。ClickHouse 假设内置 CA 证书位于文件 `/etc/ssl/cert.pem`（或目录 `/etc/ssl/certs`）中，或在环境变量 `SSL_CERT_FILE`（或 `SSL_CERT_DIR`）指定的文件（或目录）中。                                                                                                                                                                                                                                             | `true`                                  |
| `cipherList`                   | 支持的 OpenSSL 加密。                                                                                                                                                                                                                                                                                                                                                                                                                                             | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH` |
| `cacheSessions`                | 启用或禁用会话缓存。必须与 `sessionIdContext` 结合使用。可接受的值：`true`，`false`。                                                                                                                                                                                                                                                                                                                                                                                  | `false`                                 |
| `sessionIdContext`             | 服务器附加到每个生成标识符的随机字符的唯一集合。字符串的长度不得超过 `SSL_MAX_SSL_SESSION_ID_LENGTH`。此参数总是推荐使用，因为它有助于避免问题，无论是服务器缓存会话还是客户端请求缓存。                                                                                                                                                                                                              | `$\{application.name\}`                  |
| `sessionCacheSize`             | 服务器缓存的会话的最大数量。值为 `0` 表示无限制会话。                                                                                                                                                                                                                                                                                                                                                                                                                     | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                           |
| `sessionTimeout`               | 服务器缓存会话的时间（以小时为单位）。                                                                                                                                                                                                                                                                                                                                                                                                                           | `2`                                     |
| `extendedVerification`         | 如果启用，验证证书的 CN 或 SAN 是否与对等主机名匹配。                                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                 |
| `requireTLSv1`                 | 要求使用 TLSv1 连接。可接受的值：`true`，`false`。                                                                                                                                                                                                                                                                                                                                                                                                                | `false`                                 |
| `requireTLSv1_1`               | 要求使用 TLSv1.1 连接。可接受的值：`true`，`false`。                                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                 |
| `requireTLSv1_2`               | 要求使用 TLSv1.2 连接。可接受的值：`true`，`false`。                                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                 |
| `fips`                         | 激活 OpenSSL FIPS 模式。如果库的 OpenSSL 版本支持 FIPS，则支持。                                                                                                                                                                                                                                                                                                                                                                                                  | `false`                                 |
| `privateKeyPassphraseHandler` | 请求访问私钥的密码的类（PrivateKeyPassphraseHandler 子类）。例如：`<privateKeyPassphraseHandler>`，`<name>KeyFileHandler</name>`，`<options><password>test</password></options>`，`</privateKeyPassphraseHandler>`。                                                                                                                                                                          | `KeyConsoleHandler`                     |
| `invalidCertificateHandler`    | 检查无效证书的类（CertificateHandler 的子类）。例如：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` 。                                                                                                                                                                                                                                                                                       | `RejectCertificateHandler`              |
| `disableProtocols`            | 不允许使用的协议。                                                                                                                                                                                                                                                                                                                                                                                                                                                |                                          |
| `preferServerCiphers`         | 客户端首选的服务器密码。                                                                                                                                                                                                                                                                                                                                                                                                                                            | `false`                                 |

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

记录与 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 相关的事件。例如，添加或合并数据。您可以使用日志来模拟合并算法并比较它们的特性。您可以可视化合并过程。

查询记录在 [system.part_log](/operations/system-tables/part_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中配置该表的名称（见下文）。

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
尾部斜杠是必需的。
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
- `errors` - 暴露自上次服务器重启以来按错误代码发生的错误数量。这些信息可以从 [system.errors](/operations/system-tables/errors) 获取。

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

通过 [log_queries=1](../../operations/settings/settings.md) 设置记录收到的查询。

查询记录在 [system.query_log](/operations/system-tables/query_log) 表中，而不是在单独的文件中。您可以更改 `table` 参数中的表名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在 ClickHouse 服务器更新时查询日志的结构发生变化，则旧结构的表将被重命名，并自动创建新表。

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

要手动开启 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md) 的指标历史收集，请创建 `/etc/clickhouse-server/config.d/query_metric_log.xml` 文件，并使用以下内容：

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

要禁用 `query_metric_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`，并使用以下内容：

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## query_cache {#query_cache}

[查询缓存](../query-cache.md) 配置。

可用的设置如下：

| 设置                      | 描述                                                                              | 默认值           |
|---------------------------|----------------------------------------------------------------------------------|-------------------|
| `max_size_in_bytes`       | 最大缓存大小（以字节为单位）。`0` 表示查询缓存被禁用。                           | `1073741824`      |
| `max_entries`             | 缓存中存储的 `SELECT` 查询结果的最大数量。                                       | `1024`            |
| `max_entry_size_in_bytes` | `SELECT` 查询结果保存到缓存中的最大大小（以字节为单位）。                       | `1048576`         |
| `max_entry_size_in_rows`  | `SELECT` 查询结果保存到缓存中的最大行数。                                       | `30000000`        |

:::note
- 更改的设置立即生效。
- 查询缓存的数据存储在 DRAM 中。如果内存紧张，请确保设置 `max_size_in_bytes` 的小值或完全禁用查询缓存。
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

通过 [log_query_threads=1](/operations/settings/settings#log_query_threads) 设置记录查询线程的设置。

查询记录在 [system.query_thread_log](/operations/system-tables/query_thread_log) 表中，而不是在单独的文件中。您可以更改 `table` 参数中的表名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在 ClickHouse 服务器更新时查询线程日志的结构发生变化，将自动重命名旧结构的表，并创建新表。

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

通过 [log_query_views=1](/operations/settings/settings#log_query_views) 设置记录视图（实时视图、物化视图等）所依赖的设置。

查询记录在 [system.query_views_log](/operations/system-tables/query_views_log) 表中，而不是在单独的文件中。您可以更改 `table` 参数中的表名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在 ClickHouse 服务器更新时查询视图日志的结构发生变化，将自动重命名旧结构的表，并创建新表。

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

| 设置   | 描述                                                                                                                                                                                         | 默认值              |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `level` | 最大消息级别（默认 `Trace`），将存储在表中。                                                                                                                                           | `Trace`             |

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

[trace_log](/operations/system-tables/trace_log) 系统表操作的设置。

<SystemLogParameters/>

默认的服务器配置文件 `config.xml` 包含以下设置部分：

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

用于记录 `BACKUP` 和 `RESTORE` 操作的 [crash_log](../../operations/system-tables/crash-log.md) 系统表的设置。

<SystemLogParameters/>

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

## custom_cached_disks_base_directory {#custom_cached_disks_base_directory}

此设置指定自定义（从 SQL 创建的）缓存磁盘的缓存路径。
`custom_cached_disks_base_directory` 对自定义磁盘的优先级高于 `filesystem_caches_path`（在 `filesystem_caches_path.xml` 中找到），如果前者缺失，则使用后者。
文件系统缓存设置路径必须位于该目录内，否则将引发异常，阻止磁盘创建。

:::note
这不会影响在升级的旧版本上创建的磁盘。
在这种情况下，不会引发异常，以允许服务器成功启动。
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

基于正则表达式的规则，将在将查询以及所有日志消息存储到服务器日志中之前应用，
[`system.query_log`](/operations/system-tables/query_log)，[`system.text_log`](/operations/system-tables/text_log)，[`system.processes`](/operations/system-tables/processes) 表和发送到客户端的日志中。这可以防止
SQL 查询中敏感数据（如姓名、电子邮件、个人标识符或信用卡号码）泄漏到日志中。

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

| 设置      | 描述                                                                     |
|-----------|--------------------------------------------------------------------------|
| `name`    | 规则的名称（可选）                                                      |
| `regexp`  | 兼容 RE2 的正则表达式（必填）                                           |
| `replace` | 敏感数据的替换字符串（可选，默认 - 六个星号）                         |

掩码规则应用于整个查询（以防止通过格式不正确或无法解析的查询泄露敏感数据）。

[`system.events`](/operations/system-tables/events) 表有计数器 `QueryMaskingRulesMatch`，它统计查询掩码规则匹配的总数。

对于分布式查询，每个服务器必须单独配置，否则，传递给其他节点的子查询将存储为未掩码内容。

## remote_servers {#remote_servers}

配置 [Distributed](../../engines/table-engines/special/distributed.md) 表引擎和 `cluster` 表函数使用的集群。

**示例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

有关 `incl` 属性的值，请参见 "[配置文件](/operations/configuration-files)" 部分。

**另见**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards) 
- [集群发现](../../operations/cluster-discovery.md) 
- [复制数据库引擎](../../engines/database-engines/replicated.md) 

## remote_url_allow_hosts {#remote_url_allow_hosts}

允许在与 URL 相关的存储引擎和表函数中使用的主机列表。

添加带有 `<host>` XML 标签的主机时：
- 必须如 URL 中所示完全指定，因为在 DNS 解析之前检查名称。例如： `<host>clickhouse.com</host>`
- 如果在 URL 中明确指定端口，则会整体检查 host:port。例如： `<host>clickhouse.com:80</host>`
- 如果主机没有指定端口，则允许主机的任何端口。例如：如果指定 `<host>clickhouse.com</host>`，则 `clickhouse.com:20`（FTP）、`clickhouse.com:80`（HTTP）、`clickhouse.com:443`（HTTPS）等都是允许的。
- 如果主机指定为 IP 地址，则按 URL 中指定的方式检查。例如：[2a02:6b8:a::a]。
- 如果有重定向，且启用对重定向的支持，则每个重定向（位置字段）都将被检查。

例如：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## timezone {#timezone}

服务器的时区。

指定为 UTC 时区或地理位置的 IANA 标识符（例如，Africa/Abidjan）。

时区对于在文本格式输出（在屏幕上或文件中打印）并从字符串获取 DateTime 时在 String 和 DateTime 格式之间转换是必要的。此外，时区在处理时间和日期的函数中也会使用，前提是它们在输入参数中没有接收到时区。

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

与客户端安全通信的 TCP 端口。与 [OpenSSL](#openssl) 设置一起使用。

**默认值**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## mysql_port {#mysql_port}

与客户端通过 MySQL 协议通信的端口。

:::note
- 正整数指定要监听的端口号
- 空值用于禁用通过 MySQL 协议与客户端的通信。
:::

**示例**

```xml
<mysql_port>9004</mysql_port>
```

## postgresql_port {#postgresql_port}

与客户端通过 PostgreSQL 协议通信的端口。

:::note
- 正整数指定要监听的端口号
- 空值用于禁用通过 PostgreSQL 协议与客户端的通信。
:::

**示例**

```xml
<postgresql_port>9005</postgresql_port>
```

## tmp_path {#tmp_path}

存储用于处理大查询的临时数据的本地文件系统路径。

:::note
- 只能使用一个选项配置临时数据存储：`tmp_path`，`tmp_policy`，`temporary_data_in_cache`。
- 尾部斜杠是必需的。
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

用户文件的目录。在表函数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) 中使用。

**示例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## user_scripts_path {#user_scripts_path}

用户脚本文件的目录。用于可执行用户定义函数 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)。

**示例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

类型：

默认：
## user_defined_path {#user_defined_path}

用户定义文件的目录。用于 SQL 用户定义函数 [SQL User Defined Functions](/sql-reference/functions/udf)。

**示例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## users_config {#users_config}

包含以下内容的文件路径：

- 用户配置。
- 访问权限。
- 设置配置文件。
- 限额设置。

**示例**

```xml
<users_config>users.xml</users_config>
```
## access_control_improvements {#access_control_improvements}

访问控制系统中可选改进的设置。

| 设置                                            | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 默认值  |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`      | 设置没有宽松行策略的用户是否仍然可以使用 `SELECT` 查询读取行。例如，如果有两个用户 A 和 B，并且仅为 A 定义了行策略，则如果此设置为 true，用户 B 将看到所有行。如果此设置为 false，用户 B 将看不到任何行。                                                                                                                                                                                                                                                                    | `true`  |
| `on_cluster_queries_require_cluster_grant`      | 设置 `ON CLUSTER` 查询是否需要 `CLUSTER` 授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`          | 设置 `SELECT * FROM system.<table>` 是否需要任何授权，并且可以由任何用户执行。如果设置为 true，则此查询需要 `GRANT SELECT ON system.<table>`，就像对于非系统表一样。例外情况：一些系统表（`tables`、`columns`、`databases` 和一些常量表，如 `one`、`contributors`）仍然对所有人开放；如果授予了 `SHOW` 权限（例如 `SHOW USERS`），则相应的系统表（即 `system.users`）将可访问。 | `true`  |
| `select_from_information_schema_requires_grant` | 设置 `SELECT * FROM information_schema.<table>` 是否需要任何授权，并且可以由任何用户执行。如果设置为 true，则此查询需要 `GRANT SELECT ON information_schema.<table>`，就像对普通表一样。                                                                                                                                                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | 设置某个设置的设置配置文件中的约束是否会取消在其他配置文件中为该设置定义的先前约束的操作，包括新约束未设置的字段。它还启用了 `changeable_in_readonly` 约束类型。                                                                                                                                                                                                                                                        | `true`  |
| `table_engines_require_grant`                   | 设置使用特定表引擎创建表是否需要授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `false` |
| `role_cache_expiration_time_seconds`            | 设置角色在角色缓存中存储的时间，单位为秒，自上次访问以来的时间。                                                                                                                                                                                                                                                                                                                                                                                                                               | `600`   |

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

包含允许 ClickHouse 与 [ZooKeeper](http://zookeeper.apache.org/) 集群交互的设置。ClickHouse 使用 ZooKeeper 在使用复制表时存储副本的元数据。如果不使用复制表，则可以省略此参数部分。

可以通过子标签配置以下设置：

| 设置                                       | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                     | ZooKeeper 端点。可以设置多个端点。例如：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性指定连接到 ZooKeeper 集群时的节点顺序。                                                                                                                                                                                                                                                                                                   |
| `session_timeout_ms`                       | 客户端会话的最大超时，单位为毫秒。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                     | 单个操作的最大超时，单位为毫秒。                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `root` (可选)                              | ClickHouse 服务器使用的 znodes 根目录。                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `fallback_session_lifetime.min` (可选)    | 当主节点不可用时，Zookeeper 会话的最小保留时间（负载均衡）。以秒为单位设置。默认值：3小时。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `fallback_session_lifetime.max` (可选)    | 当主节点不可用时，Zookeeper 会话的最大保留时间（负载均衡）。以秒为单位设置。默认值：6小时。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `identity` (可选)                          | ZooKeeper 访问所请求 znodes 所需的用户名和密码。                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression` (可选)                   | 如果设置为 true，则在 Keeper 协议中启用压缩。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

还有 `zookeeper_load_balancing` 设置（可选），可以选择 ZooKeeper 节点选择算法：

| 算法名称                                 | 描述                                                                                                                             |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `random`                                 | 随机选择一个 ZooKeeper 节点。                                                                                                   |
| `in_order`                               | 选择第一个可用的 ZooKeeper 节点，如果没有则选择第二个，以此类推。                                                              |
| `nearest_hostname`                       | 选择与服务器主机名最相似的 ZooKeeper 节点，主机名与名称前缀进行比较。                                                        |
| `hostname_levenshtein_distance`          | 与 nearest_hostname 类似，但以 Levenshtein 距离方式比较主机名。                                                               |
| `first_or_random`                        | 选择第一个 ZooKeeper 节点，如果不可用则随机选择剩余的 ZooKeeper 节点之一。                                                     |
| `round_robin`                            | 选择第一个 ZooKeeper 节点，如果发生重新连接，则选择下一个。                                                                 |

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

- [复制](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper 程序员指南](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse 与 ZooKeeper 之间的可选安全通信](/operations/ssl-zookeeper)
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeper 中数据分片头的存储方法。此设置仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family) 家族。可以指定：

**在 `config.xml` 文件的 [merge_tree](#merge_tree) 部分全局设置**

ClickHouse 为服务器上的所有表使用此设置。您可以随时更改此设置。现有表在设置更改时会改变其行为。

**对于每个表**

创建表时，指定相应的 [引擎设置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。即使全局设置已更改，具有此设置的现有表的行为不会改变。

**可能的值**

- `0` — 功能关闭。
- `1` — 功能开启。

如果 [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)，则 [复制](../../engines/table-engines/mergetree-family/replication.md) 表将使用单个 `znode` 紧凑地存储数据部分的头。如果表包含多个列，则此存储方法显著减少存储在 ZooKeeper 中的数据量。

:::note
应用 `use_minimalistic_part_header_in_zookeeper = 1` 后，您无法将 ClickHouse 服务器降级到不支持此设置的版本。在集群中的服务器上升级 ClickHouse 时要小心。请勿同时升级所有服务器。在测试环境或只有少数几台集群服务器上测试新版本的 ClickHouse 更为安全。

已经以此设置存储的数据部分头无法恢复到先前（非紧凑）的表示。
:::
## distributed_ddl {#distributed_ddl}

管理在集群上执行的 [分布式 DDL 查询](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）。仅在启用了 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 的情况下工作。

`<distributed_ddl>` 中的可配置设置包括：

| 设置                   | 描述                                                                                                                | 默认值                    |
|------------------------|---------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `path`                 | DDL 查询的 `task_queue` 在 Keeper 中的路径                                                                              |                             |
| `profile`              | 用于执行 DDL 查询的配置文件                                                                                          |                             |
| `pool_size`            | 可以同时运行的 `ON CLUSTER` 查询数量                                                                                   |                             |
| `max_tasks_in_queue`   | 队列中可以存在的最大任务数。                                                                                            | `1,000`                     |
| `task_max_lifetime`    | 如果节点的年龄超过此值则删除节点。                                                                                    | `7 * 24 * 60 * 60`（以秒为单位的一周） |
| `cleanup_delay_period` | 如果最后一次清理的时间不早于 `cleanup_delay_period` 秒，则在接收到新节点事件后开始清理。                         | `60` 秒                    |

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

禁止创建没有密码的用户，除非明确指定 'IDENTIFIED WITH no_password'。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## default_session_timeout {#default_session_timeout}

默认会话超时，单位：秒。

```xml
<default_session_timeout>60</default_session_timeout>
```
## default_password_type {#default_password_type}

设置在诸如 `CREATE USER u IDENTIFIED BY 'p'` 的查询中自动设置的密码类型。

接受的值为：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## user_directories {#user_directories}

配置文件的部分，其中包含以下设置：
- 包含预定义用户的配置文件路径。
- 存储由 SQL 命令创建的用户的文件夹路径。
- 存储和复制由 SQL 命令创建的用户的 ZooKeeper 节点路径（实验性）。

如果指定此部分，将不使用 [users_config](/operations/server-configuration-parameters/settings#users_config) 和 [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) 中的路径。

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

您还可以定义部分 `memory` — 表示仅在内存中存储信息，而不写入磁盘，和 `ldap` — 表示在 LDAP 服务器上存储信息。

要将 LDAP 服务器添加为不在本地定义的远程用户目录，定义一个单独的 `ldap` 部分，包含以下设置：

| 设置    | 描述                                                                                                                                                                                                                                                                                                                                                                     |
|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | 在 `ldap_servers` 配置部分中定义的 LDAP 服务器名称之一。此参数是强制性的，不能为空。                                                                                                                                                                                                                                                                                    |
| `roles`  | 包含会分配给从 LDAP 服务器检索到的每个用户的本地定义角色列表的部分。如果未指定角色，用户在身份验证后将无法执行任何操作。如果身份验证时列出的任何角色未在本地定义，则身份验证尝试将失败，仿佛提供的密码不正确。 |

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

定义一个自定义顶级域的列表，每个条目的格式为 `<name>/path/to/file</name>`。

例如：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

另见：
- 函数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) 及其变化，接受自定义 TLD 列表名称，返回包括顶级子域到第一个显著子域的域部分。
## proxy {#proxy}

为 HTTP 和 HTTPS 请求定义代理服务器，目前 S3 存储、S3 表函数和 URL 函数支持此功能。

有三种定义代理服务器的方法：
- 环境变量
- 代理列表
- 远程代理解析器。

也支持对特定主机绕过代理服务器，使用 `no_proxy`。

**环境变量**

`http_proxy` 和 `https_proxy` 环境变量允许您为给定协议指定代理服务器。如果在系统上设置，它应该无缝工作。

这是最简单的方法，如果给定协议只有一个代理服务器并且该代理服务器不更改。

**代理列表**

此方法允许您为协议指定一个或多个代理服务器。如果定义了多个代理服务器，ClickHouse 将以轮询方式使用不同的代理，平衡服务器之间的负载。如果针对某个协议有多个代理服务器，并且代理服务器列表不更改，这是最简单的方法。

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
请选择下面标签中的父字段以查看其子项：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段      | 描述                        |
|----------|-----------------------------|
| `<http>` | 一个或多个 HTTP 代理的列表  |
| `<https>`| 一个或多个 HTTPS 代理的列表 |

  </TabItem>
  <TabItem value="http_https" label="<http> 和 <https>">

| 字段    | 描述                   |
|--------|------------------------|
| `<uri>` | 代理的 URI          |

  </TabItem>
</Tabs>

**远程代理解析器**

代理服务器可能会动态变化。在这种情况下，您可以定义解析器的端点。ClickHouse 向该端点发送一个空的 GET 请求，远程解析器应返回代理主机。ClickHouse 将使用它生成代理 URI，格式为 `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

选择下面标签中的父字段以查看其子项：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段      | 描述                             |
|-----------|----------------------------------|
| `<http>`  | 一个或多个解析器的列表*         |
| `<https>` | 一个或多个解析器的列表*         |

  </TabItem>
  <TabItem value="http_https" label="<http> 和 <https>">

| 字段        | 描述                                  |
|-------------|---------------------------------------|
| `<resolver>` | 解析器的端点和其他详细信息            |

:::note
您可以有多个 `<resolver>` 元素，但仅使用给定协议的第一个 `<resolver>`。对此协议的任何其他 `<resolver>` 元素将被忽略。这意味着负载均衡（如果需要）应由远程解析器实现。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| 字段                | 描述                                                                                                                                                                                |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | 代理解析程序的 URI                                                                                                                                                                 |
| `<proxy_scheme>`    | 最终代理 URI 的协议。可以是 `http` 或 `https`。                                                                                                                                   |
| `<proxy_port>`      | 代理解析器的端口号                                                                                                                                                                 |
| `<proxy_cache_time>` | ClickHouse 应该缓存解析程序返回的值的时间（以秒为单位）。将此值设置为 `0` 会导致 ClickHouse 每个 HTTP 或 HTTPS 请求都联系解析器。 |

  </TabItem>
</Tabs>

**优先级**

代理设置的决定顺序如下：

| 顺序 | 设置                      |
|-------|--------------------------|
| 1.    | 远程代理解析器          |
| 2.    | 代理列表                |
| 3.    | 环境变量                |

ClickHouse 将检查请求协议的最高优先级解析器类型。如果未定义，则检查下一个优先级的解析器类型，直到达到环境解析器。这还允许使用解析器类型的混合。
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

默认情况下，使用隧道（即 `HTTP CONNECT`）通过 `HTTP` 代理进行 `HTTPS` 请求。可以使用此设置禁用它。

**no_proxy**

默认情况下，所有请求都将通过代理。为了禁用特定主机的代理，必须设置 `no_proxy` 变量。
可以在列表和远程解析器的 `<proxy>` 子句内设置，也可以作为环境变量为环境解析器设置。
它支持 IP 地址、域、子域和 `'*'` 通配符，以实现完全绕过。 剥去前导点，就像 curl 一样。

**示例**

以下配置绕过了对 `clickhouse.cloud` 及其所有子域（例如，`auth.clickhouse.cloud`）的代理请求。
对 GitLab 也是如此，即使它有一个前导点。`gitlab.com` 和 `about.gitlab.com` 都会绕过代理。

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

**另见**
- [工作负载层次](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的 ZooKeeper 节点路径。为了保持一致性，所有 SQL 定义都存储为此单个 znode 的值。默认情况下不使用 ZooKeeper，定义存储在 [disk](#workload_path) 上。

**示例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**另见**
- [工作负载层次](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
