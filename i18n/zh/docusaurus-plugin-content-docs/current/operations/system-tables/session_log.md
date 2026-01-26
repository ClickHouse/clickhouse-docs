---
description: '记录所有登录和登出成功与失败事件信息的系统表。'
keywords: ['system table', 'session_log']
slug: /operations/system-tables/session_log
title: 'system.session_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.session_log \{#systemsession_log\}

<SystemTableCloud />

包含所有成功和失败的登录和登出事件的信息。

列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `type` ([Enum8](../../sql-reference/data-types/enum.md)) — 登录/登出结果。可能的值：
  * `LoginFailure` — 登录错误。
  * `LoginSuccess` — 登录成功。
  * `Logout` — 从系统登出。
* `auth_id` ([UUID](../../sql-reference/data-types/uuid.md)) — 身份验证 ID，每次用户登录时都会自动生成的 UUID。
* `session_id` ([String](../../sql-reference/data-types/string.md)) — 由客户端通过 [HTTP](/interfaces/http) 接口传递的会话 ID。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 登录/登出日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 登录/登出时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 具有微秒精度的登录/登出起始时间。
* `user` ([String](../../sql-reference/data-types/string.md)) — 用户名。
* `auth_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 身份验证类型。可能的值：
  * `NO_PASSWORD`
  * `PLAINTEXT_PASSWORD`
  * `SHA256_PASSWORD`
  * `DOUBLE_SHA1_PASSWORD`
  * `LDAP`
  * `KERBEROS`
  * `SSL_CERTIFICATE`
* `profiles` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 为所有角色和/或用户设置的配置文件列表。
* `roles` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 应用了该配置文件的角色列表。
* `settings` ([Array](../../sql-reference/data-types/array.md)([Tuple](../../sql-reference/data-types/tuple.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md), [String](../../sql-reference/data-types/string.md)))) — 客户端登录/登出时更改的设置。
* `client_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 用于登录/登出的 IP 地址。
* `client_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于登录/登出的客户端端口。
* `interface` ([Enum8](../../sql-reference/data-types/enum.md)) — 发起登录的接口。可能的值：
  * `TCP`
  * `HTTP`
  * `gRPC`
  * `MySQL`
  * `PostgreSQL`
* `client_hostname` ([String](../../sql-reference/data-types/string.md)) — 运行 [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的客户端机器主机名。
* `client_name` ([String](../../sql-reference/data-types/string.md)) — `clickhouse-client` 或其他 TCP 客户端名称。
* `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 或其他 TCP 客户端的修订版本号。
* `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 或其他 TCP 客户端的主版本号。
* `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 或其他 TCP 客户端的次版本号。
* `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 或其他 TCP 客户端版本的补丁号。
* `failure_reason` ([String](../../sql-reference/data-types/string.md)) — 包含登录/登出失败原因的异常信息。

**示例**

查询：

```sql
SELECT * FROM system.session_log LIMIT 1 FORMAT Vertical;
```

结果：

```text
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
