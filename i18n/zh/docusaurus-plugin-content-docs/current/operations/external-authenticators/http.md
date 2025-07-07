---
'description': 'Http 的文档'
'slug': '/operations/external-authenticators/http'
'title': 'HTTP'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTP服务器可以用来验证ClickHouse用户。HTTP认证只能被用作对在 `users.xml` 或本地访问控制路径中定义的现有用户的外部认证器。目前，仅支持使用GET方法的[基本](https://datatracker.ietf.org/doc/html/rfc7617)认证方案。

## HTTP认证服务器定义 {#http-auth-server-definition}

要定义HTTP认证服务器，必须在 `config.xml` 中添加 `http_authentication_servers` 部分。

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

请注意，您可以在 `http_authentication_servers` 部分内定义多个HTTP服务器，使用不同的名称。

**参数**
- `uri` - 用于进行认证请求的URI

在与服务器通信所使用的套接字上的超时（以毫秒为单位）：
- `connection_timeout_ms` - 默认: 1000 ms。
- `receive_timeout_ms` - 默认: 1000 ms。
- `send_timeout_ms` - 默认: 1000 ms。

重试参数：
- `max_tries` - 进行认证请求的最大尝试次数。默认: 3
- `retry_initial_backoff_ms` - 重试的初始退避间隔。默认: 50 ms
- `retry_max_backoff_ms` - 最大退避间隔。默认: 1000 ms

转发头：

该部分定义了哪些头将从客户端请求头转发到外部HTTP认证器。

### 在 `users.xml` 中启用HTTP认证 {#enabling-http-auth-in-users-xml}

为了启用用户的HTTP认证，指定 `http_authentication` 部分，而不是用户定义中的 `password` 或类似部分。

参数：
- `server` - 在主 `config.xml` 文件中配置的HTTP认证服务器的名称，如前所述。
- `scheme` - HTTP认证方案。目前仅支持 `Basic`。默认: Basic

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
请注意，HTTP认证不能与任何其他认证机制一起使用。与 `http_authentication` 共同存在的任何其他部分，例如 `password`，将迫使ClickHouse关闭。
:::

### 使用SQL启用HTTP认证 {#enabling-http-auth-using-sql}

当ClickHouse中启用[SQL驱动的访问控制和账户管理](/operations/access-rights#access-control-usage)时，通过HTTP认证识别的用户也可以使用SQL语句创建。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...或者，不显式定义方案时，`Basic` 为默认值

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### 传递会话设置 {#passing-session-settings}

如果来自HTTP认证服务器的响应体具有JSON格式并包含 `settings` 子对象，ClickHouse将尝试将其键：值对解析为字符串值，并将其设置为已认证用户的当前会话的会话设置。如果解析失败，将忽略来自服务器的响应体。
