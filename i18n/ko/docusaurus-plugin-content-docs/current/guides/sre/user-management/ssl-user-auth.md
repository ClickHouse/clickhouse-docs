---
'sidebar_label': 'SSL 사용자 인증서 인증'
'sidebar_position': 3
'slug': '/guides/sre/ssl-user-auth'
'title': 'SSL 사용자 인증서 인증 구성하기'
'description': '이 가이드는 SSL 사용자 인증서를 통해 인증을 구성하기 위한 간단하고 최소한의 설정을 제공합니다.'
'doc_type': 'guide'
'keywords':
- 'ssl'
- 'authentication'
- 'security'
- 'certificates'
- 'user management'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# SSL 사용자 인증서 구성
<SelfManaged />

이 가이드는 SSL 사용자 인증서를 사용하여 인증을 구성하기 위한 간단하고 최소한의 설정을 제공합니다. 이 튜토리얼은 [SSL-TLS 구성 가이드](../configuring-ssl.md)를 기반으로 합니다.

:::note
SSL 사용자 인증은 `https`, `native`, `mysql`, 및 `postgresql` 인터페이스를 사용할 때 지원됩니다.

ClickHouse 노드는 보안 인증을 위해 `<verificationMode>strict</verificationMode>`로 설정해야 합니다 (테스트 목적으로는 `relaxed`도 작동할 수 있습니다).

MySQL 인터페이스와 함께 AWS NLB를 사용하는 경우 AWS 지원에 문의하여 문서화되지 않은 옵션을 활성화해야 합니다:

> NLB 프록시 프로토콜 v2를 아래와 같이 구성할 수 있기를 원합니다: `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`.
:::

## 1. SSL 사용자 인증서 생성하기 {#1-create-ssl-user-certificates}

:::note
이 예제는 자체 서명된 CA를 가진 자체 서명된 인증서를 사용합니다. 프로덕션 환경에서는 CSR을 생성하고 PKI 팀 또는 인증서 제공자에게 제출하여 적절한 인증서를 받아야 합니다.
:::

1. 인증서 서명 요청(CSR) 및 키를 생성합니다. 기본 형식은 다음과 같습니다:
```bash
openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
```
    이 예제에서는 샘플 환경에서 사용할 도메인 및 사용자로 이 값을 사용합니다:
```bash
openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
```
    :::note
    CN은 임의이며 인증서를 식별하기 위해 어떤 문자열이든 사용할 수 있습니다. 이후 단계에서 사용자를 생성할 때 사용됩니다.
    :::

2. 인증을 위해 사용할 새 사용자 인증서를 생성하고 서명합니다. 기본 형식은 다음과 같습니다:
```bash
openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
```
    이 예제에서는 샘플 환경에서 사용할 도메인 및 사용자로 이 값을 사용합니다:
```bash
openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
```

## 2. SQL 사용자 생성 및 권한 부여 {#2-create-a-sql-user-and-grant-permissions}

:::note
SQL 사용자 활성화 및 역할 설정 방법에 대한 세부정보는 [SQL 사용자 및 역할 정의](index.md) 사용자 가이드를 참조하십시오.
:::

1. 인증서 인증을 사용하도록 정의된 SQL 사용자를 생성합니다:
```sql
CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
```

2. 새 인증서 사용자에게 권한을 부여합니다:
```sql
GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
```
    :::note
    이 연습에서는 시연 목적으로 사용자가 전체 관리자 권한을 부여받습니다. 권한 설정에 대한 ClickHouse [RBAC 문서](/guides/sre/user-management/index.md)를 참조하십시오.
    :::

    :::note
    사용자 및 역할을 정의하기 위해 SQL을 사용하는 것을 권장합니다. 그러나 현재 구성 파일에서 사용자 및 역할을 정의하고 있는 경우 사용자는 다음과 같습니다:
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
        <!-- additional options-->
    </cert_user>
</users>
```
    :::

## 3. 테스트 {#3-testing}

1. 사용자 인증서, 사용자 키 및 CA 인증서를 원격 노드로 복사합니다.

2. ClickHouse [클라이언트 구성](/interfaces/cli.md#configuration_files) 에서 인증서 및 경로로 OpenSSL을 구성합니다.

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
    config에서 인증서가 지정된 경우 clickhouse-client에 전달된 비밀번호는 무시됩니다.
    :::

## 4. HTTP 테스트 {#4-testing-http}

1. 사용자 인증서, 사용자 키 및 CA 인증서를 원격 노드로 복사합니다.

2. `curl`을 사용하여 샘플 SQL 명령을 테스트합니다. 기본 형식은 다음과 같습니다:
```bash
echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
```
    예를 들어:
```bash
echo 'SHOW TABLES' | curl 'https://chnode1:8443' --cert chnode1_cert_user.crt --key chnode1_cert_user.key --cacert marsnet_ca.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: cert_user" --data-binary @-
```
    출력은 다음과 유사합니다:
```response
INFORMATION_SCHEMA
default
information_schema
system
```
    :::note
    비밀번호가 지정되지 않았다는 사실에 유의하세요. 인증서는 비밀번호 대신 사용되며 ClickHouse가 사용자를 인증하는 방식입니다.
    :::

## 요약 {#summary}

이 문서에서는 SSL 인증서 인증을 위한 사용자를 생성하고 구성하는 기본 사항을 보여 주었습니다. 이 방법은 `clickhouse-client` 또는 `https` 인터페이스를 지원하고 HTTP 헤더를 설정할 수 있는 모든 클라이언트에서 사용할 수 있습니다. 생성된 인증서와 키는 비공개로 유지하고 액세스를 제한해야 합니다. 인증서는 ClickHouse 데이터베이스에서 작업 수행을 위해 사용자를 인증하고 권한을 부여하는 데 사용되기 때문입니다. 인증서와 키는 비밀번호처럼 취급하십시오.
