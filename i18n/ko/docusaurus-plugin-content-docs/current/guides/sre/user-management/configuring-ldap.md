---
'sidebar_label': 'LDAP 구성하기'
'sidebar_position': 2
'slug': '/guides/sre/configuring-ldap'
'title': 'ClickHouse를 LDAP 인증 및 역할 매핑에 사용하도록 구성하기'
'description': 'ClickHouse를 LDAP 인증 및 역할 매핑에 사용하도록 구성하는 방법을 설명합니다.'
'keywords':
- 'LDAP configuration'
- 'LDAP authentication'
- 'role mapping'
- 'user management'
- 'SRE guide'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# ClickHouse를 LDAP 인증 및 역할 매핑에 사용하도록 구성하기

<SelfManaged />

ClickHouse는 LDAP를 사용하여 ClickHouse 데이터베이스 사용자 인증을 구성할 수 있습니다. 이 가이드는 공용 디렉토리에 인증하는 LDAP 시스템과 ClickHouse를 통합하는 간단한 예제를 제공합니다.

## 1. ClickHouse에서 LDAP 연결 설정 구성하기 {#1-configure-ldap-connection-settings-in-clickhouse}

1. 이 공용 LDAP 서버에 대한 연결을 테스트합니다:
```bash
$ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
```

    응답은 다음과 유사할 것입니다:
```response

# extended LDIF
#

# LDAPv3

# base <dc=example,dc=com> with scope subtree

# filter: (objectclass=*)

# requesting: ALL
#


# example.com
dn: dc=example,dc=com
objectClass: top
objectClass: dcObject
objectClass: organization
o: example.com
dc: example
...
```

2. `config.xml` 파일을 편집하고 아래를 추가하여 LDAP를 구성합니다:
```xml
<ldap_servers>
    <test_ldap_server>
    <host>ldap.forumsys.com</host>
    <port>389</port>
    <bind_dn>uid={user_name},dc=example,dc=com</bind_dn>
    <enable_tls>no</enable_tls>
    <tls_require_cert>never</tls_require_cert>
    </test_ldap_server>
</ldap_servers>
```

    :::note
    `<test_ldap_server>` 태그는 특정 LDAP 서버를 식별하기 위한 임의의 레이블입니다.
    :::

    위에서 사용된 기본 설정은 다음과 같습니다:

    |파라미터 |설명                       |예시                   |
    |---------|--------------------------|----------------------|
    |host     |LDAP 서버의 호스트 이름 또는 IP |ldap.forumsys.com     |
    |port     |LDAP 서버의 디렉토리 포트 |389                   |
    |bind_dn  |사용자에 대한 템플릿 경로 |`uid={user_name},dc=example,dc=com`|
    |enable_tls|보안 LDAP 사용 여부      |아니요                |
    |tls_require_cert |연결에 대한 인증서 요구 여부 |절대 아니다         |

    :::note
    이 예제에서는 공용 서버가 389를 사용하고 보안 포트를 사용하지 않으므로 데모 목적으로 TLS를 비활성화합니다.
    :::

    :::note
    LDAP 설정에 대한 자세한 내용은 [LDAP 문서 페이지](../../../operations/external-authenticators/ldap.md)를 참조하십시오.
    :::

3. `<user_directories>` 섹션에 `<ldap>` 섹션을 추가하여 사용자 역할 매핑을 구성합니다. 이 섹션은 사용자가 인증될 때와 사용자가 받을 역할을 정의합니다. 이 기본 예제에서는 LDAP에 인증하는 모든 사용자가 ClickHouse에서 나중에 정의될 `scientists_role`을 받게 됩니다. 섹션은 다음과 비슷해야 합니다:
```xml
<user_directories>
    <users_xml>
        <path>users.xml</path>
    </users_xml>
    <local_directory>
        <path>/var/lib/clickhouse/access/</path>
    </local_directory>
    <ldap>
          <server>test_ldap_server</server>
          <roles>
             <scientists_role />
          </roles>
          <role_mapping>
             <base_dn>dc=example,dc=com</base_dn>
             <search_filter>(&amp;(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))</search_filter>
             <attribute>cn</attribute>
          </role_mapping>
    </ldap>
</user_directories>
```

    위에서 사용된 기본 설정은 다음과 같습니다:

    |파라미터 |설명                       |예시                   |
    |---------|--------------------------|----------------------|
    |server   |이전 ldap_servers 섹션에서 정의된 레이블 |test_ldap_server     |
    |roles    |사용자가 매핑될 ClickHouse에 정의된 역할 이름 |scientists_role      |
    |base_dn  |사용자와 그룹 검색을 시작할 기본 경로 |dc=example,dc=com    |
    |search_filter|사용자 매핑을 위해 선택할 그룹을 식별하는 ldap 검색 필터 |`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute |어떤 속성 이름의 값을 반환해야 하는지 |cn                   |

4. 설정을 적용하기 위해 ClickHouse 서버를 재시작합니다.

## 2. ClickHouse 데이터베이스 역할 및 권한 구성하기 {#2-configure-clickhouse-database-roles-and-permissions}

:::note
이 섹션의 절차는 ClickHouse에서 SQL 접근 제어 및 계정 관리가 활성화되었다고 가정합니다. 활성화하려면 [SQL 사용자 및 역할 가이드](index.md)를 참조하십시오.
:::

1. `config.xml` 파일의 역할 매핑 섹션에서 사용된 것과 동일한 이름으로 ClickHouse에서 역할을 생성합니다.
```sql
CREATE ROLE scientists_role;
```

2. 역할에 필요한 권한을 부여합니다. 다음 문장은 LDAP를 통해 인증할 수 있는 사용자에게 관리자 권한을 부여합니다:
```sql
GRANT ALL ON *.* TO scientists_role;
```

## 3. LDAP 구성 테스트하기 {#3-test-the-ldap-configuration}

1. ClickHouse 클라이언트를 사용하여 로그인합니다.
```bash
$ clickhouse-client --user einstein --password password
ClickHouse client version 22.2.2.1.
Connecting to localhost:9000 as user einstein.
Connected to ClickHouse server version 22.2.2 revision 54455.

chnode1 :)
```

    :::note
    1단계에서 `ldapsearch` 명령을 사용하여 디렉토리에서 사용 가능한 모든 사용자와 모든 사용자의 비밀번호가 `password`임을 확인합니다.
    :::

2. 사용자가 올바르게 `scientists_role` 역할에 매핑되었고 관리자 권한이 있는지 테스트합니다.
```sql
SHOW DATABASES
```

```response
Query id: 93b785ff-1482-4eda-95b0-b2d68b2c5e0f

┌─name───────────────┐
│ INFORMATION_SCHEMA │
│ db1_mysql          │
│ db2                │
│ db3                │
│ db4_mysql          │
│ db5_merge          │
│ default            │
│ information_schema │
│ system             │
└────────────────────┘

9 rows in set. Elapsed: 0.004 sec.
```

## 요약 {#summary}
이 기사에서는 ClickHouse를 LDAP 서버에 인증하고 역할에 매핑하는 기본 사항을 설명했습니다. 또한 ClickHouse에서 개별 사용자를 구성하는 옵션도 있지만, 자동 역할 매핑을 구성하지 않고 LDAP로 인증하는 사용자만 두는 방법도 있습니다. LDAP 모듈은 Active Directory에 연결하는 데도 사용할 수 있습니다.
