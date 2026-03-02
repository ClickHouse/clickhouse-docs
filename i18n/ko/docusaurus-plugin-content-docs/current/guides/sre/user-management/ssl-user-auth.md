---
sidebar_label: 'SSL 사용자 인증서 기반 인증'
sidebar_position: 3
slug: /guides/sre/ssl-user-auth
title: 'SSL 사용자 인증서를 사용한 인증 구성'
description: '이 가이드는 SSL 사용자 인증서를 사용한 인증 구성을 위해 필요한 최소한의 간단한 설정 방법을 제공합니다.'
doc_type: 'guide'
keywords: ['ssl', 'authentication', 'security', 'certificates', 'user management']
---

# 인증용 SSL 사용자 인증서 구성 \{#configuring-ssl-user-certificate-for-authentication\}

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

이 가이드는 SSL 사용자 인증을 구성하기 위한 간단하고 최소한의 설정을 제공합니다. 이 튜토리얼은 [Configuring TLS user guide](../tls/configuring-tls.md)를 기반으로 합니다.

:::note
SSL 사용자 인증은 `https`, `native`, `mysql`, `postgresql` 인터페이스를 사용할 때 지원됩니다.

보안 인증을 위해서는 ClickHouse 노드에 `<verificationMode>strict</verificationMode>`를 설정해야 합니다 (`relaxed`는 테스트 목적이라면 동작합니다).

MySQL 인터페이스와 함께 AWS NLB를 사용하는 경우, 아래와 같은 문서화되지 않은 옵션을 활성화해 달라고 AWS 지원팀에 요청해야 합니다.

> `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`와 같이 NLB proxy protocol v2를 구성할 수 있도록 해 주십시오.
> :::


## 1. SSL 사용자 인증서를 생성합니다 \{#1-create-ssl-user-certificates\}

:::note
이 예제에서는 자체 서명 CA로 발급한 자체 서명 인증서를 사용합니다. 프로덕션 환경에서는 CSR을 생성한 후 PKI 팀 또는 인증서 공급자에게 제출하여 정식 인증서를 발급받으십시오.
:::

1. Certificate Signing Request(CSR)와 키를 생성합니다. 기본 형식은 다음과 같습니다.
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
    ```
    이 예제에서는 샘플 환경에서 사용할 도메인과 사용자에 대해 다음과 같이 생성합니다.
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
    ```
    :::note
    CN 값은 임의이며, 인증서 식별자용으로 아무 문자열이나 사용할 수 있습니다. 이후 단계에서 사용자를 생성할 때 이 값을 사용합니다.
    :::

2.  인증용으로 사용할 새 사용자 인증서를 생성하고 서명합니다. 기본 형식은 다음과 같습니다.
    ```bash
    openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
    ```
    이 예제에서는 샘플 환경에서 사용할 도메인과 사용자에 대해 다음과 같이 생성합니다.
    ```bash
    openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
    ```

## 2. SQL 사용자를 생성하고 권한을 부여합니다 \{#2-create-a-sql-user-and-grant-permissions\}

:::note
SQL 사용자를 활성화하고 역할을 설정하는 방법에 대한 자세한 내용은 [Defining SQL Users and Roles](index.md) 사용자 가이드를 참조하십시오.
:::

1. 인증서 기반 인증을 사용하는 SQL 사용자를 생성합니다:
    ```sql
    CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
    ```

2. 새 인증서 사용자에게 권한을 부여합니다:
    ```sql
    GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
    ```
    :::note
    이 예제에서는 시연 목적을 위해 사용자에게 전체 관리자 권한을 부여합니다. 권한 설정에 대해서는 ClickHouse [RBAC 문서](/guides/sre/user-management/index.md)를 참조하십시오.
    :::

    :::note
    사용자와 역할 정의에는 SQL 사용을 권장합니다. 그러나 현재 설정 파일에서 사용자와 역할을 정의하는 경우, 사용자는 다음과 같이 설정됩니다:
    ```xml
    <users>
        <cert_user>
            <ssl_certificates>
                <common_name>chnode1.marsnet.local:cert_user</common_name>
            </ssl_certificates>
            <networks>
                <ip>::/0</ip>
            </networks>
            <profile>default</profile>
            <access_management>1</access_management>
            <!-- 추가 옵션-->
        </cert_user>
    </users>
    ```
    :::

## 3. 테스트 \{#3-testing\}

1. 사용자 인증서, 사용자 키 및 CA 인증서를 원격 노드로 복사합니다.

2. ClickHouse [클라이언트 설정](/interfaces/cli.md#configuration_files)에서 인증서와 경로를 지정하여 OpenSSL을 구성합니다.

    ```xml
    <openSSL>
        <client>
            <certificateFile>my_cert_name.crt</certificateFile>
            <privateKeyFile>my_cert_name.key</privateKeyFile>
            <caConfig>my_ca_cert.crt</caConfig>
        </client>
    </openSSL>
    ```

3. `clickhouse-client`를 실행합니다.
    ```bash
    clickhouse-client --user <my_user> --query 'SHOW TABLES'
    ```
    :::note
    설정에 인증서가 지정되어 있는 경우, clickhouse-client에 인자로 전달한 비밀번호는 무시됩니다.
    :::

## 4. HTTP 테스트 \{#4-testing-http\}

1. 사용자 인증서, 사용자 키 및 CA 인증서를 원격 노드로 복사합니다.

2. `curl`을 사용하여 샘플 SQL 명령을 테스트합니다. 기본 형식은 다음과 같습니다:
    ```bash
    echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
    ```
    예를 들어:
    ```bash
    echo 'SHOW TABLES' | curl 'https://chnode1:8443' --cert chnode1_cert_user.crt --key chnode1_cert_user.key --cacert marsnet_ca.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: cert_user" --data-binary @-
    ```
    출력은 다음과 비슷합니다:
    ```response
    INFORMATION_SCHEMA
    default
    information_schema
    system
    ```
    :::note
    비밀번호는 지정하지 않았으며, 인증서가 비밀번호를 대신하여 사용되고 ClickHouse는 이를 통해 사용자를 인증한다는 점에 유의하십시오.
    :::

## 요약 \{#summary\}

이 문서에서는 SSL 인증서 기반 인증을 위한 사용자 생성 및 설정의 기본 절차를 설명했습니다. 이 방법은 `clickhouse-client` 또는 `https` 인터페이스를 지원하고 HTTP 헤더를 설정할 수 있는 모든 클라이언트에서 사용할 수 있습니다. 생성된 인증서와 키는 인증서가 ClickHouse 데이터베이스에서 작업을 수행할 사용자를 인증하고 권한을 부여하는 데 사용되므로 비공개로 유지하고 접근을 제한해야 합니다. 인증서와 키는 비밀번호를 다루듯이 취급하십시오.