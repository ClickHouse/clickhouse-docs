---
description: 'ClickHouse에서 LDAP 인증을 구성하기 위한 가이드'
slug: /operations/external-authenticators/ldap
title: 'LDAP'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

LDAP 서버는 ClickHouse 사용자를 인증하는 데 사용할 수 있습니다. 이를 위한 접근 방식은 두 가지입니다.

* `users.xml` 또는 로컬 액세스 제어 경로에 정의된 기존 사용자에 대해 LDAP를 외부 인증 수단으로 사용합니다.
* LDAP를 외부 사용자 디렉터리로 사용하여, LDAP 서버에 존재하는 경우 로컬에 정의되지 않은 사용자도 인증되도록 허용합니다.

이 두 가지 방식 모두에 대해 ClickHouse 설정에서 내부 이름을 가진 LDAP 서버를 정의해야 하며, 설정의 다른 부분에서 해당 서버를 참조할 수 있어야 합니다.

## LDAP 서버 정의 \{#ldap-server-definition\}

LDAP 서버를 정의하려면 `config.xml` 파일에 `ldap_servers` 섹션을 추가해야 합니다.

**예제**

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

참고로, `ldap_servers` 섹션에서는 서로 다른 이름을 사용하여 여러 LDAP 서버를 정의할 수 있습니다.

**매개변수**

* `host` — LDAP 서버 호스트 이름 또는 IP입니다. 이 매개변수는 필수이며 비워 둘 수 없습니다.
* `port` — LDAP 서버 포트입니다. `enable_tls`가 `true`로 설정된 경우 기본값은 `636`이고, 그렇지 않으면 `389`입니다.
* `bind_dn` — 바인딩할 DN을 구성하는 데 사용되는 Template입니다.
  * 최종 DN은 각 인증 시도 시 템플릿의 모든 `{user_name}` 부분 문자열을 실제 사용자 이름으로 대체하여 구성합니다.
* `user_dn_detection` — 바인딩된 사용자의 실제 사용자 DN을 탐지하기 위한 LDAP 검색 매개변수 섹션입니다.
  * 서버가 Active Directory일 때 이후 역할 매핑을 위한 검색 필터에서 주로 사용됩니다. 최종 사용자 DN은 `{user_dn}` 부분 문자열을 허용된 위치에서 대체할 때 사용됩니다. 기본적으로 사용자 DN은 bind DN과 동일하게 설정되지만, 검색이 수행되면 실제로 탐지된 사용자 DN 값으로 업데이트됩니다.
    * `base_dn` — LDAP 검색을 위한 기본 DN을 구성하는 데 사용되는 Template입니다.
      * 최종 DN은 LDAP 검색 중 템플릿의 모든 `{user_name}` 및 `{bind_dn}` 부분 문자열을 실제 사용자 이름과 bind DN으로 대체하여 구성됩니다.
    * `scope` — LDAP 검색 범위입니다.
      * 허용되는 값은 `base`, `one_level`, `children`, `subtree`(기본값)입니다.
    * `search_filter` — LDAP 검색을 위한 검색 필터를 구성하는 데 사용되는 Template입니다.
      * 최종 필터는 LDAP 검색 중 템플릿의 모든 `{user_name}`, `{bind_dn}`, `{base_dn}` 부분 문자열을 실제 사용자 이름, bind DN, base DN으로 대체하여 구성됩니다.
      * XML에서 특수 문자는 반드시 올바르게 이스케이프해야 합니다.
* `verification_cooldown` — 성공적인 바인딩 시도 이후, 지정된 시간(초) 동안 LDAP 서버에 다시 연결하지 않고도 이후 연속 요청에 대해 사용자가 성공적으로 인증된 것으로 간주되는 기간입니다.
  * 캐싱을 비활성화하고 각 인증 요청마다 LDAP 서버에 연결하도록 하려면 `0`(기본값)을 지정합니다.
* `enable_tls` — LDAP 서버에 대한 보안 연결 사용을 설정하는 플래그입니다.
  * 일반 텍스트 `ldap://` 프로토콜을 사용하려면 `no`를 지정합니다(권장하지 않음).
  * SSL/TLS 상의 LDAP `ldaps://` 프로토콜을 사용하려면 `yes`를 지정합니다(권장, 기본값).
  * 레거시 StartTLS 프로토콜(일반 텍스트 `ldap://` 프로토콜을 TLS로 업그레이드)에 대해서는 `starttls`를 지정합니다.
* `tls_minimum_protocol_version` — SSL/TLS의 최소 프로토콜 버전입니다.
  * 허용되는 값은 `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`(기본값)입니다.
* `tls_require_cert` — SSL/TLS 피어 인증서 검증 방식입니다.
  * 허용되는 값은 `never`, `allow`, `try`, `demand`(기본값)입니다.
* `tls_cert_file` — 인증서 파일 경로입니다.
* `tls_key_file` — 인증서 키 파일 경로입니다.
* `tls_ca_cert_file` — CA 인증서 파일 경로입니다.
* `tls_ca_cert_dir` — CA 인증서가 포함된 디렉터리 경로입니다.
* `tls_cipher_suite` — 허용되는 암호 스위트입니다(OpenSSL 표기법).

## LDAP 외부 인증자 \{#ldap-external-authenticator\}

원격 LDAP 서버는 로컬에 정의된 사용자(`users.xml` 또는 로컬 액세스 제어 경로에 정의된 사용자)의 비밀번호를 검증하는 방법으로 사용할 수 있습니다. 이를 위해 사용자 정의에서 `password` 또는 이와 유사한 섹션 대신 미리 정의된 LDAP 서버 이름을 지정합니다.

각 로그인 시도 시 ClickHouse는 [LDAP 서버 정의](#ldap-server-definition)에서 `bind_dn` 매개변수로 정의된 DN에 대해 제공된 자격 증명을 사용하여 해당 DN에 「bind」를 시도하며, 이 작업이 성공하면 사용자가 인증된 것으로 간주합니다. 이는 흔히 「simple bind」 방법이라고 합니다.

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

`my_user` 사용자는 `my_ldap_server`를 참조합니다. 이 LDAP 서버는 앞에서 설명한 대로 기본 `config.xml` 파일에서 설정되어야 합니다.

SQL 기반 [Access Control and Account Management](/operations/access-rights#access-control-usage)가 활성화된 경우, LDAP 서버를 통해 인증된 사용자도 [CREATE USER](/sql-reference/statements/create/user) SQL 문을 사용하여 생성할 수 있습니다.

쿼리:

```sql
CREATE USER my_user IDENTIFIED WITH ldap SERVER 'my_ldap_server';
```

## LDAP 외부 사용자 디렉터리 \{#ldap-external-user-directory\}

로컬에 정의된 사용자 외에도, 원격 LDAP 서버를 사용자 정의 정보의 소스로 사용할 수 있습니다. 이를 위해 `config.xml` 파일의 `users_directories` 섹션 안에 있는 `ldap` 섹션에, 이전에 정의한 LDAP 서버 이름([LDAP 서버 정의](#ldap-server-definition) 참고)을 지정합니다.

로그인 시도가 있을 때마다 ClickHouse는 우선 로컬에서 사용자 정의를 찾고, 일반적인 방식으로 인증을 수행합니다. 사용자가 로컬에 정의되어 있지 않으면, ClickHouse는 외부 LDAP 디렉터리에 해당 정의가 있다고 가정하고, 제공된 자격 증명을 사용해 LDAP 서버에서 지정된 DN에 「bind」를 시도합니다. 이 작업이 성공하면, 사용자가 존재하며 인증된 것으로 간주됩니다. 사용자에게는 `roles` 섹션에 지정된 목록에서 역할이 부여됩니다. 추가로, LDAP 「search」를 수행하여 그 결과를 변환해 역할 이름으로 취급한 뒤, `role_mapping` 섹션이 구성되어 있다면 해당 역할을 사용자에게 할당할 수 있습니다. 이러한 동작은 SQL 기반 [액세스 제어 및 계정 관리](/operations/access-rights#access-control-usage)가 활성화되어 있고, [CREATE ROLE](/sql-reference/statements/create/role) SQL 문을 사용해 역할이 생성되어 있음을 전제로 합니다.

**예시**

`config.xml`에 작성합니다.

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

`user_directories` 섹션 내부의 `ldap` 섹션에서 참조되는 `my_ldap_server`는 [LDAP 서버 정의](#ldap-server-definition)에 설명된 대로 `config.xml`에 미리 정의하고 구성한 LDAP 서버여야 합니다.

**매개변수**

* `server` — 위의 `ldap_servers` 설정 섹션에 정의된 LDAP 서버 이름 중 하나입니다. 이 매개변수는 반드시 설정해야 하며 비워 둘 수 없습니다.
* `roles` — LDAP 서버에서 가져온 각 사용자에게 할당될, 로컬에 정의된 역할 목록을 포함하는 섹션입니다.
  * 여기에서 역할을 지정하지 않거나 아래의 역할 매핑 과정에서 역할이 할당되지 않으면, 사용자는 인증 이후 어떠한 작업도 수행할 수 없습니다.
* `role_mapping` — LDAP 검색 매개변수 및 매핑 규칙을 정의하는 섹션입니다.
  * 사용자가 인증할 때, LDAP에 여전히 바인딩된 상태에서 `search_filter`와 로그인한 사용자 이름을 사용하여 LDAP 검색이 수행됩니다. 해당 검색에서 발견된 각 엔트리에 대해 지정된 속성(attribute)의 값이 추출됩니다. 지정된 접두사(prefix)를 가진 각 속성 값에 대해서는 접두사를 제거하고, 나머지 값은 ClickHouse에 로컬 역할 이름이 되며, 이 역할은 [CREATE ROLE](/sql-reference/statements/create/role) SQL 문으로 사전에 생성되어 있어야 합니다.
  * 동일한 `ldap` 섹션 안에 여러 개의 `role_mapping` 섹션을 정의할 수 있습니다. 이들 모두가 적용됩니다.
    * `base_dn` — LDAP 검색에 사용할 base DN을 구성하기 위한 Template입니다.
      * 최종 DN은 Template의 모든 `{user_name}`, `{bind_dn}`, `{user_dn}` 부분 문자열을 실제 사용자 이름, bind DN, user DN으로 치환하여, 각 LDAP 검색 시 구성됩니다.
    * `scope` — LDAP 검색 범위입니다.
      * 허용되는 값은 `base`, `one_level`, `children`, `subtree`(기본값)입니다.
    * `search_filter` — LDAP 검색에 사용할 검색 필터를 구성하기 위한 Template입니다.
      * 최종 필터는 Template의 모든 `{user_name}`, `{bind_dn}`, `{user_dn}`, `{base_dn}` 부분 문자열을 실제 사용자 이름, bind DN, user DN, base DN으로 치환하여, 각 LDAP 검색 시 구성됩니다.
      * 특수 문자는 XML에서 올바르게 이스케이프되어야 합니다.
    * `attribute` — LDAP 검색에 의해 반환될 값들을 가진 속성 이름입니다. 기본값은 `cn`입니다.
    * `prefix` — LDAP 검색으로 반환된 원래 문자열 목록의 각 문자열 앞에 존재할 것으로 예상되는 접두사입니다. 이 접두사는 원래 문자열에서 제거되며, 남은 문자열은 로컬 역할 이름으로 처리됩니다. 기본값은 비어 있습니다.
