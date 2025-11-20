---
'description': 'Http에 대한 문서'
'slug': '/operations/external-authenticators/http'
'title': 'HTTP'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTP 서버를 사용하여 ClickHouse 사용자를 인증할 수 있습니다. HTTP 인증은 `users.xml`에서 정의된 기존 사용자 또는 로컬 액세스 제어 경로에 대한 외부 인증자로만 사용할 수 있습니다. 현재 GET 방법을 사용하는 [기본](https://datatracker.ietf.org/doc/html/rfc7617) 인증 방식이 지원됩니다.

## HTTP 인증 서버 정의 {#http-auth-server-definition}

HTTP 인증 서버를 정의하려면 `config.xml`에 `http_authentication_servers` 섹션을 추가해야 합니다.

**예시**
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

여러 HTTP 서버를 `http_authentication_servers` 섹션 내에 고유한 이름을 사용하여 정의할 수 있습니다.

**매개변수**
- `uri` - 인증 요청을 위한 URI

서버와의 통신에 사용되는 소켓에서의 밀리초 단위 시간 초과:
- `connection_timeout_ms` - 기본값: 1000 ms.
- `receive_timeout_ms` - 기본값: 1000 ms.
- `send_timeout_ms` - 기본값: 1000 ms.

재시도 매개변수:
- `max_tries` - 인증 요청을 시도할 최대 횟수. 기본값: 3
- `retry_initial_backoff_ms` - 재시도 시 초기 대기 간격. 기본값: 50 ms
- `retry_max_backoff_ms` - 최대 대기 간격. 기본값: 1000 ms

전달 헤더:

이 부분은 클라이언트 요청 헤더에서 외부 HTTP 인증기로 전달될 헤더를 정의합니다. 헤더는 대소문자를 구분하지 않고 구성 파일과 일치하도록 매칭되지만, 변형되지 않고 그대로 전달됩니다.

### `users.xml`에서 HTTP 인증 활성화 {#enabling-http-auth-in-users-xml}

사용자에 대한 HTTP 인증을 활성화하려면 사용자 정의 내에서 `password` 또는 유사한 섹션 대신 `http_authentication` 섹션을 지정해야 합니다.

매개변수:
- `server` - 이전에 설명한 대로 메인 `config.xml` 파일에 구성된 HTTP 인증 서버의 이름.
- `scheme` - HTTP 인증 방식. 현재는 `Basic`만 지원됩니다. 기본값: Basic

예시 ( `users.xml`에 포함):
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
HTTP 인증은 다른 인증 메커니즘과 함께 사용할 수 없습니다. `http_authentication`과 함께 `password`와 같은 다른 섹션이 존재할 경우 ClickHouse는 종료됩니다.
:::

### SQL을 사용하여 HTTP 인증 활성화 {#enabling-http-auth-using-sql}

ClickHouse에서 [SQL 구동 액세스 제어 및 계정 관리](/operations/access-rights#access-control-usage)가 활성화된 경우, HTTP 인증으로 식별된 사용자도 SQL 문을 사용하여 생성할 수 있습니다.

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...또는, 명시적인 방식 정의 없이 `Basic`이 기본값입니다.

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### 세션 설정 전달 {#passing-session-settings}

HTTP 인증 서버에서의 응답 본문이 JSON 형식이고 `settings` 하위 객체를 포함하는 경우, ClickHouse는 해당 키: 값 쌍을 문자열 값으로 구문 분석하려고 시도하고 인증된 사용자의 현재 세션에 대한 세션 설정으로 설정합니다. 구문 분석에 실패하면 서버의 응답 본문은 무시됩니다.
