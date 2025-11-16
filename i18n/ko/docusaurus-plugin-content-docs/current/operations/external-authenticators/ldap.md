---
'description': 'ClickHouse에 대한 LDAP 인증 구성 가이드'
'slug': '/operations/external-authenticators/ldap'
'title': 'LDAP'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAP 서버는 ClickHouse 사용자 인증에 사용할 수 있습니다. 이를 수행하기 위한 두 가지 접근 방식이 있습니다:

- `users.xml` 또는 로컬 접근 제어 경로에 정의된 기존 사용자를 위해 LDAP를 외부 인증자로 사용합니다.
- LDAP를 외부 사용자 디렉토리로 사용하고, LDAP 서버에 존재하는 경우 로컬에서 정의되지 않은 사용자가 인증될 수 있도록 허용합니다.

이 두 가지 접근 방식 모두 ClickHouse 구성에 내부적으로 이름이 지정된 LDAP 서버가 정의되어야 하며, 이 서버는 다른 구성 부분에서 참조할 수 있습니다.

## LDAP 서버 정의 {#ldap-server-definition}

LDAP 서버를 정의하려면 `config.xml`에 `ldap_servers` 섹션을 추가해야 합니다.

**예시**

```xml
<clickhouse>
    <!- ... -->
    <ldap_servers>
        <!- Typical LDAP server. -->
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

        <!- Typical Active Directory with configured user DN detection for further role mapping. -->
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
    </ldap_servers>
</clickhouse>
```

`ldap_servers` 섹션 내에서 서로 다른 이름을 사용하여 여러 LDAP 서버를 정의할 수 있습니다.

**매개변수**

- `host` — LDAP 서버의 호스트 이름 또는 IP, 이 매개변수는 필수이며 비워둘 수 없습니다.
- `port` — LDAP 서버 포트, `enable_tls`가 `true`로 설정되면 기본값은 `636`, 그렇지 않으면 `389`입니다.
- `bind_dn` — 바인드할 때 사용할 DN을 생성하는 데 사용되는 템플릿입니다.
  - 결과 DN은 각 인증 시도 동안 템플릿의 모든 `{user_name}` 하위 문자열을 실제 사용자 이름으로 교체하여 구성됩니다.
- `user_dn_detection` — 바인드된 사용자의 실제 사용자 DN을 감지하기 위한 LDAP 검색 매개변수 섹션입니다.
  - 이는 서버가 Active Directory일 때 추가 역할 매핑을 위해 검색 필터에서 주로 사용됩니다. 결과 사용자 DN은 `{user_dn}` 하위 문자열이 허용되는 곳에서 교체하는 데 사용됩니다. 기본적으로 사용자 DN은 바인드 DN과 같도록 설정되지만, 검색이 수행되면 실제 감지된 사용자 DN 값으로 업데이트됩니다.
    - `base_dn` — LDAP 검색을 위한 기본 DN을 구성하는 데 사용되는 템플릿입니다.
      - 결과 DN은 LDAP 검색 중 실제 사용자 이름 및 바인드 DN으로 템플릿의 모든 `{user_name}` 및 `{bind_dn}` 하위 문자열을 대체하여 구성됩니다.
    - `scope` — LDAP 검색의 범위입니다.
      - 허용된 값은: `base`, `one_level`, `children`, `subtree` (기본값).
    - `search_filter` — LDAP 검색을 위한 검색 필터를 구성하는 데 사용되는 템플릿입니다.
      - 결과 필터는 LDAP 검색 중 실제 사용자 이름, 바인드 DN 및 기본 DN으로 템플릿의 모든 `{user_name}`, `{bind_dn}` 및 `{base_dn}` 하위 문자열을 교체하여 구성됩니다.
      - XML에서 특수 문자는 적절히 이스케이프되어야 합니다.
- `verification_cooldown` — 성공적인 바인드 시도 후, LDAP 서버에 연락하지 않고도 연속 요청에 대해 사용자가 성공적으로 인증된 것으로 간주되는 기간(초)입니다.
  - Caching을 비활성화하고 각 인증 요청에 대해 LDAP 서버에 연락하도록 강제하려면 `0`(기본값)을 지정합니다.
- `enable_tls` — LDAP 서버에 대한 보안 연결을 사용하도록 트리거하는 플래그입니다.
  - 평문 `ldap://` 프로토콜을 위해 `no`를 지정합니다 (권장하지 않음).
  - SSL/TLS `ldaps://` 프로토콜을 위해 `yes`를 지정합니다 (권장, 기본값).
  - 레거시 StartTLS 프로토콜을 위해 `starttls`를 지정합니다 (평문 `ldap://` 프로토콜이 TLS로 업그레이드됨).
- `tls_minimum_protocol_version` — SSL/TLS의 최소 프로토콜 버전입니다.
  - 허용된 값은: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (기본값).
- `tls_require_cert` — SSL/TLS 피어 인증서 검증 동작입니다.
  - 허용된 값은: `never`, `allow`, `try`, `demand` (기본값).
- `tls_cert_file` — 인증서 파일 경로입니다.
- `tls_key_file` — 인증서 키 파일 경로입니다.
- `tls_ca_cert_file` — CA 인증서 파일 경로입니다.
- `tls_ca_cert_dir` — CA 인증서가 포함된 디렉토리 경로입니다.
- `tls_cipher_suite` — 허용된 암호 모음(OpenSSL 표기법).

## LDAP 외부 인증자 {#ldap-external-authenticator}

원격 LDAP 서버는 로컬에서 정의된 사용자(즉, `users.xml` 또는 로컬 접근 제어 경로에 정의된 사용자)에 대한 비밀번호를 검증하는 방법으로 사용할 수 있습니다. 이를 수행하려면 사용자 정의 섹션에서 `password` 또는 유사한 섹션 대신 이전에 정의된 LDAP 서버 이름을 지정합니다.

각 로그인 시도 시, ClickHouse는 제공된 자격 증명을 사용하여 [LDAP 서버 정의](#ldap-server-definition)에서 정의된 `bind_dn` 매개변수에 의해 지정된 DN에 "바인드"하려고 시도하며, 성공하면 사용자가 인증된 것으로 간주됩니다. 이를 종종 "간단한 바인드" 방법이라고 합니다.

**예시**

```xml
<clickhouse>
    <!- ... -->
    <users>
        <!- ... -->
        <my_user>
            <!- ... -->
            <ldap>
                <server>my_ldap_server</server>
            </ldap>
        </my_user>
    </users>
</clickhouse>
```

사용자 `my_user`가 `my_ldap_server`를 참조합니다. 이 LDAP 서버는 이전에 설명한 대로 `config.xml`의 주 구성 파일에 구성되어 있어야 합니다.

SQL 기반 [Access Control and Account Management](/operations/access-rights#access-control-usage)가 활성화되면, LDAP 서버로 인증된 사용자도 [CREATE USER](/sql-reference/statements/create/user) 문을 사용하여 생성할 수 있습니다.

쿼리:

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP 외부 사용자 디렉토리 {#ldap-external-user-directory}

로컬에서 정의된 사용자 외에도 원격 LDAP 서버를 사용자 정의의 소스로 사용할 수 있습니다. 이를 위해 `config.xml`의 `users_directories` 섹션 내부의 `ldap` 섹션에 이전에 정의된 LDAP 서버 이름(참조: [LDAP 서버 정의](#ldap-server-definition))을 지정합니다.

각 로그인 시도 시, ClickHouse는 사용자의 정의를 로컬에서 찾고 일반적으로 인증을 시도합니다. 사용자가 정의되지 않은 경우, ClickHouse는 정의가 외부 LDAP 디렉토리에 존재한다고 가정하고 제공된 자격 증명을 사용하여 LDAP 서버의 지정된 DN에 "바인드"하려고 시도합니다. 성공하면 사용자는 존재하는 것으로 간주되고 인증됩니다. 사용자는 `roles` 섹션에 지정된 목록에서 역할을 할당받습니다. 추가적으로, LDAP "검색"을 수행할 수 있으며, 결과는 역할 이름으로 변환되고 처리된 후 사용자에게 할당될 수 있습니다. 이 모든 것은 SQL 기반 [Access Control and Account Management](/operations/access-rights#access-control-usage)가 활성화되고 역할이 [CREATE ROLE](/sql-reference/statements/create/role) 문을 사용하여 생성되었다는 것을 의미합니다.

**예시**

`config.xml`에 들어갑니다.

```xml
<clickhouse>
    <!- ... -->
    <user_directories>
        <!- Typical LDAP server. -->
        <ldap>
            <server>my_ldap_server</server>
            <roles>
                <my_local_role1 />
                <my_local_role2 />
            </roles>
            <role_mapping>
                <base_dn>ou=groups,dc=example,dc=com</base_dn>
                <scope>subtree</scope>
                <search_filter>(&amp;(objectClass=groupOfNames)(member={bind_dn}))</search_filter>
                <attribute>cn</attribute>
                <prefix>clickhouse_</prefix>
            </role_mapping>
        </ldap>

        <!- Typical Active Directory with role mapping that relies on the detected user DN. -->
        <ldap>
            <server>my_ad_server</server>
            <role_mapping>
                <base_dn>CN=Users,DC=example,DC=com</base_dn>
                <attribute>CN</attribute>
                <scope>subtree</scope>
                <search_filter>(&amp;(objectClass=group)(member={user_dn}))</search_filter>
                <prefix>clickhouse_</prefix>
            </role_mapping>
        </ldap>
    </user_directories>
</clickhouse>
```

`user_directories` 섹션 내부의 `ldap` 섹션에서 참조된 `my_ldap_server`는 `config.xml`에 구성된 이전에 정의된 LDAP 서버여야 합니다(참조: [LDAP 서버 정의](#ldap-server-definition)).

**매개변수**

- `server` — 위의 `ldap_servers` 구성 섹션에 정의된 LDAP 서버 이름 중 하나입니다. 이 매개변수는 필수이며 비워둘 수 없습니다.
- `roles` — LDAP 서버에서 검색된 각 사용자에게 할당될 로컬에서 정의된 역할 목록이 포함된 섹션입니다.
  - 여기에서 역할이 지정되지 않거나 역할 매핑 중(아래) 할당되지 않으면, 사용자는 인증 후 어떤 작업도 수행할 수 없습니다.
- `role_mapping` — LDAP 검색 매개변수 및 매핑 규칙이 포함된 섹션입니다.
  - 사용자가 LDAP에 바인드된 상태에서 인증할 때, `search_filter`와 로그인한 사용자의 이름을 사용하여 LDAP 검색이 수행됩니다. 해당 검색 동안 발견된 각 항목에 대해 지정된 속성의 값이 추출됩니다. 지정된 접두사를 가지는 각 속성 값에 대해 접두사가 제거되고 나머지 값은 ClickHouse에서 미리 생성된 로컬 역할 이름으로 간주됩니다 (이는 [CREATE ROLE](/sql-reference/statements/create/role) 문을 사용하여 미리 생성될 것으로 예상됨).
  - 동일한 `ldap` 섹션 내부에 여러 `role_mapping` 섹션을 정의할 수 있습니다. 그 모든 것이 적용됩니다.
    - `base_dn` — LDAP 검색을 위한 기본 DN을 구성하는 데 사용되는 템플릿입니다.
      - LDAP 검색 중 각 LDAP 검색 시 실제 사용자 이름, 바인드 DN 및 사용자 DN으로 템플릿의 모든 `{user_name}`, `{bind_dn}`, 및 `{user_dn}` 하위 문자열을 교체하여 구성됩니다.
    - `scope` — LDAP 검색의 범위입니다.
      - 허용된 값은: `base`, `one_level`, `children`, `subtree` (기본값).
    - `search_filter` — LDAP 검색을 위한 검색 필터를 구성하는 데 사용되는 템플릿입니다.
      - LDAP 검색 중 실제 사용자 이름, 바인드 DN, 사용자 DN 및 기본 DN으로 템플릿의 모든 `{user_name}`, `{bind_dn}`, `{user_dn}`, 및 `{base_dn}` 하위 문자열을 교체하여 구성됩니다.
      - XML에서 특수 문자는 적절히 이스케이프되어야 합니다.
    - `attribute` — LDAP 검색이 반환할 값의 속성 이름입니다. 기본값은 `cn`입니다.
    - `prefix` — LDAP 검색이 반환한 원래 문자열 목록의 각 문자열 앞에 있어야 할 접두사입니다. 접두사는 원래 문자열에서 제거되고, 결과 문자열은 로컬 역할 이름으로 취급됩니다. 기본값은 비어 있습니다.
