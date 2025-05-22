import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTP 服务器可以用于认证 ClickHouse 用户。HTTP 认证只能用作现有用户的外部认证器，现有用户在 `users.xml` 中定义或在本地访问控制路径中定义。目前，支持使用 GET 方法的 [Basic](https://datatracker.ietf.org/doc/html/rfc7617) 认证方案。

## HTTP 认证服务器定义 {#http-auth-server-definition}

要定义 HTTP 认证服务器，您必须在 `config.xml` 中添加 `http_authentication_servers` 部分。

**示例**
```xml
<clickhouse>
    <!- ... -->
    <http_authentication_servers>
        <basic_auth_server>
          <uri>http://localhost:8000/auth</uri>
          <connection_timeout_ms>1000</connection_timeout_ms>
          <receive_timeout_ms>1000</receive_timeout_ms>
          <send_timeout_ms>1000</send_timeout_ms>
          <max_tries>3</max_tries>
          <retry_initial_backoff_ms>50</retry_initial_backoff_ms>
          <retry_max_backoff_ms>1000</retry_max_backoff_ms>
          <forward_headers>
            <name>Custom-Auth-Header-1</name>
            <name>Custom-Auth-Header-2</name>
          </forward_headers>

        </basic_auth_server>
    </http_authentication_servers>
</clickhouse>

```

请注意，您可以在 `http_authentication_servers` 部分中使用不同的名称定义多个 HTTP 服务器。

**参数**
- `uri` - 用于进行认证请求的 URI

在用于与服务器通信的套接字上的超时（以毫秒为单位）：
- `connection_timeout_ms` - 默认值：1000 毫秒。
- `receive_timeout_ms` - 默认值：1000 毫秒。
- `send_timeout_ms` - 默认值：1000 毫秒。

重试参数：
- `max_tries` - 进行认证请求的最大尝试次数。默认值：3
- `retry_initial_backoff_ms` - 重试时的初始退避间隔。默认值：50 毫秒
- `retry_max_backoff_ms` - 最大退避间隔。默认值：1000 毫秒

转发头：

该部分定义了哪些头信息将从客户端请求头转发到外部 HTTP 认证器。

### 在 `users.xml` 中启用 HTTP 认证 {#enabling-http-auth-in-users-xml}

要启用用户的 HTTP 认证，请在用户定义中指定 `http_authentication` 部分，而不是 `password` 或类似部分。

参数：
- `server` - 在主 `config.xml` 文件中配置的 HTTP 认证服务器的名称，如前所述。
- `scheme` - HTTP 认证方案。目前仅支持 `Basic`。默认值：Basic

示例（放入 `users.xml` 中）：
```xml
<clickhouse>
    <!- ... -->
    <my_user>
        <!- ... -->
        <http_authentication>
            <server>basic_server</server>
            <scheme>basic</scheme>
        </http_authentication>
    </test_user_2>
</clickhouse>
```

:::note
请注意，HTTP 认证不能与任何其他认证机制同时使用。`http_authentication` 旁边存在任何其他部分，例如 `password` 将强制 ClickHouse 关闭。
:::

### 使用 SQL 启用 HTTP 认证 {#enabling-http-auth-using-sql}

当在 ClickHouse 中启用 [基于 SQL 的访问控制和帐户管理](/operations/access-rights#access-control-usage) 时，可以使用 SQL 语句创建通过 HTTP 认证识别的用户。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...或者，`Basic` 是默认值，无需显式定义方案

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### 传递会话设置 {#passing-session-settings}

如果 HTTP 认证服务器的响应主体为 JSON 格式并包含 `settings` 子对象，ClickHouse 将尝试解析其键：值对作为字符串值，并将其设置为已认证用户的当前会话的会话设置。如果解析失败，则将忽略来自服务器的响应主体。
