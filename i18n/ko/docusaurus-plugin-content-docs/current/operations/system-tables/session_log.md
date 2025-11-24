---
'description': '시스템 테이블로, 모든 성공적 및 실패한 로그인 및 로그아웃 이벤트에 대한 정보를 포함합니다.'
'keywords':
- 'system table'
- 'session_log'
'slug': '/operations/system-tables/session_log'
'title': 'system.session_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.session_log

<SystemTableCloud/>

성공적인 로그인 및 로그아웃 이벤트와 실패한 이벤트에 대한 정보를 포함합니다.

컬럼:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
- `type` ([Enum8](../../sql-reference/data-types/enum.md)) — 로그인/로그아웃 결과. 가능 값:
  - `LoginFailure` — 로그인 오류.
  - `LoginSuccess` — 성공적인 로그인.
  - `Logout` — 시스템에서 로그아웃.
- `auth_id` ([UUID](../../sql-reference/data-types/uuid.md)) — 인증 ID로, 사용자가 로그인할 때마다 자동으로 생성되는 UUID.
- `session_id` ([String](../../sql-reference/data-types/string.md)) — 클라이언트가 [HTTP](../../interfaces/http.md) 인터페이스를 통해 전달하는 세션 ID.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 로그인/로그아웃 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 로그인/로그아웃 시간.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도를 가진 로그인/로그아웃 시작 시간.
- `user` ([String](../../sql-reference/data-types/string.md)) — 사용자 이름.
- `auth_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 인증 유형. 가능 값:
  - `NO_PASSWORD`
  - `PLAINTEXT_PASSWORD`
  - `SHA256_PASSWORD`
  - `DOUBLE_SHA1_PASSWORD`
  - `LDAP`
  - `KERBEROS`
  - `SSL_CERTIFICATE`
- `profiles` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 모든 역할 및/또는 사용자에 대해 설정된 프로필 목록.
- `roles` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 프로필이 적용되는 역할 목록.
- `settings` ([Array](../../sql-reference/data-types/array.md)([Tuple](../../sql-reference/data-types/tuple.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md), [String](../../sql-reference/data-types/string.md)))) — 클라이언트가 로그인/로그아웃할 때 변경된 설정.
- `client_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 로그인/로그아웃에 사용된 IP 주소.
- `client_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 로그인/로그아웃에 사용된 클라이언트 포트.
- `interface` ([Enum8](../../sql-reference/data-types/enum.md)) — 로그인이 시작된 인터페이스. 가능 값:
  - `TCP`
  - `HTTP`
  - `gRPC`
  - `MySQL`
  - `PostgreSQL`
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트가 실행되는 클라이언트 머신의 호스트 이름.
- `client_name` ([String](../../sql-reference/data-types/string.md)) — `clickhouse-client` 또는 다른 TCP 클라이언트 이름.
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 또는 다른 TCP 클라이언트의 리비전.
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 또는 다른 TCP 클라이언트의 주요 버전.
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 또는 다른 TCP 클라이언트의 부 버전.
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — `clickhouse-client` 또는 다른 TCP 클라이언트 버전의 패치 구성 요소.
- `failure_reason` ([String](../../sql-reference/data-types/string.md)) — 로그인/로그아웃 실패의 원인을 포함하는 예외 메시지.

**예제**

쿼리:

```sql
SELECT * FROM system.session_log LIMIT 1 FORMAT Vertical;
```

결과:

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
