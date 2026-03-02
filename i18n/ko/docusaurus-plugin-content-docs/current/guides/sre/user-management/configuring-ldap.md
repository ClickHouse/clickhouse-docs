---
sidebar_label: 'LDAP 구성'
sidebar_position: 2
slug: /guides/sre/configuring-ldap
title: '인증 및 역할 매핑에 LDAP를 사용하도록 ClickHouse 구성하기'
description: '인증 및 역할 매핑에 LDAP를 사용하도록 ClickHouse를 구성하는 방법을 설명합니다'
keywords: ['LDAP 구성', 'LDAP 인증', '역할 매핑', '사용자 관리', 'SRE 가이드']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# 인증 및 역할 매핑을 위해 ClickHouse에서 LDAP 구성하기 \{#configuring-clickhouse-to-use-ldap-for-authentication-and-role-mapping\}

<SelfManaged />

ClickHouse는 LDAP를 사용하여 ClickHouse 데이터베이스 사용자를 인증하도록 구성할 수 있습니다. 이 가이드는 공개적으로 사용 가능한 디렉터리에 대해 인증을 수행하는 LDAP 시스템과 ClickHouse를 통합하는 간단한 예시를 제공합니다.

## 1. ClickHouse에서 LDAP 연결 설정 구성 \{#1-configure-ldap-connection-settings-in-clickhouse\}

1. 다음 공개 LDAP 서버에 대한 연결을 테스트합니다:
    ```bash
    $ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
    ```

    반환되는 응답은 다음과 비슷합니다:
    ```response
    # 확장 LDIF
    #
    # LDAPv3
    # 기준(base) <dc=example,dc=com>, 범위(scope) subtree
    # 필터: (objectclass=*)
    # 요청: ALL
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

2. `config.xml` 파일을 편집하고, 다음 내용을 추가하여 LDAP를 구성합니다:
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

    위에서 사용한 기본 설정은 다음과 같습니다:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |host      |LDAP 서버의 호스트명 또는 IP  |ldap.forumsys.com    |
    |port      |LDAP 서버의 디렉터리 포트     |389                  |
    |bind_dn   |사용자에 대한 템플릿 경로     |`uid={user_name},dc=example,dc=com`|
    |enable_tls|보안 LDAP를 사용할지 여부      |no     |
    |tls_require_cert |연결 시 인증서를 요구할지 여부|never|

    :::note
    이 예제에서는 공개 서버가 389 포트를 사용하고 보안 포트를 사용하지 않으므로, 시연 목적을 위해 TLS를 비활성화합니다.
    :::

    :::note
    LDAP 설정에 대한 자세한 내용은 [LDAP 문서 페이지](../../../operations/external-authenticators/ldap.md)를 참조하십시오.
    :::

3. 사용자 역할 매핑을 구성하기 위해 `<user_directories>` 섹션에 `<ldap>` 섹션을 추가합니다. 이 섹션은 사용자가 언제 인증되고 어떤 역할을 부여받는지를 정의합니다. 이 기본 예제에서는 LDAP에 인증하는 모든 사용자가 이후 단계에서 ClickHouse에 정의할 `scientists_role`을 부여받습니다. 섹션은 다음과 유사해야 합니다:
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

    위에서 사용한 기본 설정은 다음과 같습니다:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |server    |이전에 `ldap_servers` 섹션에서 정의한 레이블|test_ldap_server|
    |roles      |사용자가 매핑될 ClickHouse 내 역할 이름|scientists_role|
    |base_dn   |사용자가 포함된 그룹 검색을 시작할 기준 경로|dc=example,dc=com|
    |search_filter|사용자 매핑에 사용할 그룹을 식별하기 위한 LDAP 검색 필터|`(&(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))`|
    |attribute |값을 반환할 특성 이름         |cn|

4. 설정을 적용하기 위해 ClickHouse 서버를 재시작합니다.

## 2. ClickHouse 데이터베이스 역할과 권한 구성 \{#2-configure-clickhouse-database-roles-and-permissions\}

:::note
이 섹션의 절차는 ClickHouse에서 SQL Access Control과 Account Management가 활성화되어 있다고 가정합니다. 활성화 방법은 [SQL Users and Roles guide](index.md)를 참조하십시오.
:::

1. `config.xml` 파일의 역할 매핑 섹션에서 사용한 것과 동일한 이름으로 ClickHouse에 역할(role)을 생성합니다.
    ```sql
    CREATE ROLE scientists_role;
    ```

2. 역할에 필요한 권한을 부여합니다. 다음 문은 LDAP를 통해 인증할 수 있는 모든 USER에게 관리자 권한을 부여합니다.
    ```sql
    GRANT ALL ON *.* TO scientists_role;
    ```

## 3. LDAP 구성 테스트 \{#3-test-the-ldap-configuration\}

1. ClickHouse 클라이언트를 사용하여 로그인합니다.
    ```bash
    $ clickhouse-client --user einstein --password password
    ClickHouse client version 22.2.2.1.
    Connecting to localhost:9000 as user einstein.
    Connected to ClickHouse server version 22.2.2 revision 54455.

    chnode1 :)
    ```

    :::note
    1단계에서 `ldapsearch` 명령을 사용하면 디렉터리에 있는 모든 사용자를 확인할 수 있으며, 모든 사용자의 비밀번호는 `password`입니다.
    :::

2.  사용자가 `scientists_role` 역할에 올바르게 매핑되었고 관리자 권한을 가지고 있는지 테스트합니다.
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

## 요약 \{#summary\}

이 문서에서는 ClickHouse가 LDAP 서버에 대해 인증을 수행하고 역할에 매핑되도록 구성하는 기본 사항을 다뤘습니다. 또한 ClickHouse에서 개별 사용자 계정을 정의하되, 자동 역할 매핑은 구성하지 않고 LDAP을 통해 인증만 수행하도록 설정하는 방법도 있습니다. LDAP 모듈은 Active Directory에 연결하는 데에도 사용할 수 있습니다.