---
description: '包含所有成功和失败的登录和注销事件的信息的系统表。'
slug: /operations/system-tables/session_log
title: 'system.session_log'
keywords: ['system table', 'session_log']
---
import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含所有成功和失败的登录和注销事件的信息。

列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `type` ([Enum8](../../sql-reference/data-types/enum.md)) — 登录/注销结果。可能的值：
    - `LoginFailure` — 登录错误。
    - `LoginSuccess` — 成功登录。
    - `Logout` — 从系统注销。
- `auth_id` ([UUID](../../sql-reference/data-types/uuid.md)) — 认证ID，这是一个UUID，每次用户登录时会自动生成。
- `session_id` ([String](../../sql-reference/data-types/string.md)) — 客户端通过 [HTTP](../../interfaces/http.md) 接口传递的会话ID。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 登录/注销日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 登录/注销时间。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 登录/注销的起始时间，精确到微秒。
- `user` ([String](../../sql-reference/data-types/string.md)) — 用户名。
- `auth_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 认证类型。可能的值：
    - `NO_PASSWORD`
    - `PLAINTEXT_PASSWORD`
    - `SHA256_PASSWORD`
    - `DOUBLE_SHA1_PASSWORD`
    - `LDAP`
    - `KERBEROS`
    - `SSL_CERTIFICATE`
- `profiles` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 为所有角色和/或用户设置的配置文件列表。
- `roles` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 配置文件应用的角色列表。
- `settings` ([Array](../../sql-reference/data-types/array.md)([Tuple](../../sql-reference/data-types/tuple.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md), [String](../../sql-reference/data-types/string.md)))) — 客户端登录/注销时更改的设置。
- `client_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 用于登录/注销的IP地址。
- `client_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于登录/注销的客户端端口。
- `interface` ([Enum8](../../sql-reference/data-types/enum.md)) — 发起登录的接口。可能的值：
    - `TCP`
    - `HTTP`
    - `gRPC`
    - `MySQL`
    - `PostgreSQL`
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — 运行 [clickhouse-client](../../interfaces/cli.md) 或其他TCP客户端的客户端机器的主机名。
- `client_name` ([String](../../sql-reference/data-types/string.md)) — `clickhouse-client` 或其他TCP客户端的名称。
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 或其他TCP客户端的修订版。
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 或其他TCP客户端的主要版本。
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 或其他TCP客户端的次要版本。
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 或其他TCP客户端版本的补丁组件。
- `failure_reason` ([String](../../sql-reference/data-types/string.md)) — 包含登录/注销失败原因的异常信息。

**示例**

查询：

``` sql
SELECT * FROM system.session_log LIMIT 1 FORMAT Vertical;
```

结果：

``` text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
type:                    LoginSuccess
auth_id:                 45e6bd83-b4aa-4a23-85e6-bd83b4aa1a23
session_id:
event_date:              2021-10-14
event_time:              2021-10-14 20:33:52
event_time_microseconds: 2021-10-14 20:33:52.104247
user:                    default
auth_type:               PLAINTEXT_PASSWORD
profiles:                ['default']
roles:                   []
settings:                [('load_balancing','random'),('max_memory_usage','10000000000')]
client_address:          ::ffff:127.0.0.1
client_port:             38490
interface:               TCP
client_hostname:
client_name:             ClickHouse client
client_revision:         54449
client_version_major:    21
client_version_minor:    10
client_version_patch:    0
failure_reason:
```
