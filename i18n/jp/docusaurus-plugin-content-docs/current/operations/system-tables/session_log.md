---
description: 'すべての成功・失敗したログインおよびログアウトイベントに関する情報を含む system テーブル。'
keywords: ['system table', 'session_log']
slug: /operations/system-tables/session_log
title: 'system.session_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.session&#95;log {#systemsession&#95;log}

<SystemTableCloud />

すべてのログインおよびログアウトイベント（成功・失敗）に関する情報を含みます。

Columns:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `type` ([Enum8](../../sql-reference/data-types/enum.md)) — ログイン／ログアウトの結果。取りうる値:
  * `LoginFailure` — ログインエラー。
  * `LoginSuccess` — ログイン成功。
  * `Logout` — システムからのログアウト。
* `auth_id` ([UUID](../../sql-reference/data-types/uuid.md)) — 認証 ID。ユーザーがログインするたびに自動生成される UUID。
* `session_id` ([String](../../sql-reference/data-types/string.md)) — クライアントから [HTTP](/interfaces/http) インターフェイス経由で渡されるセッション ID。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — ログイン／ログアウトの日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — ログイン／ログアウトの時刻。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度でのログイン／ログアウト開始時刻。
* `user` ([String](../../sql-reference/data-types/string.md)) — ユーザー名。
* `auth_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 認証タイプ。取りうる値:
  * `NO_PASSWORD`
  * `PLAINTEXT_PASSWORD`
  * `SHA256_PASSWORD`
  * `DOUBLE_SHA1_PASSWORD`
  * `LDAP`
  * `KERBEROS`
  * `SSL_CERTIFICATE`
* `profiles` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — すべてのロールおよび／またはユーザーに設定されたプロファイルの一覧。
* `roles` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — プロファイルが適用されるロールの一覧。
* `settings` ([Array](../../sql-reference/data-types/array.md)([Tuple](../../sql-reference/data-types/tuple.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md), [String](../../sql-reference/data-types/string.md)))) — クライアントがログイン／ログアウトした際に変更された設定。
* `client_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — ログイン／ログアウトに使用された IP アドレス。
* `client_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — ログイン／ログアウトに使用されたクライアントポート番号。
* `interface` ([Enum8](../../sql-reference/data-types/enum.md)) — ログインが開始されたインターフェイス。取りうる値:
  * `TCP`
  * `HTTP`
  * `gRPC`
  * `MySQL`
  * `PostgreSQL`
* `client_hostname` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) または他の TCP クライアントが実行されているクライアントマシンのホスト名。
* `client_name` ([String](../../sql-reference/data-types/string.md)) — `clickhouse-client` または他の TCP クライアントの名前。
* `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` または他の TCP クライアントのリビジョン。
* `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` または他の TCP クライアントのメジャーバージョン。
* `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` または他の TCP クライアントのマイナーバージョン。
* `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` または他の TCP クライアントのパッチバージョン番号。
* `failure_reason` ([String](../../sql-reference/data-types/string.md)) — ログイン／ログアウトの失敗理由を含む例外メッセージ。

**Example**

Query:

```sql
SELECT * FROM system.session_log LIMIT 1 FORMAT Vertical;
```

結果：

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
