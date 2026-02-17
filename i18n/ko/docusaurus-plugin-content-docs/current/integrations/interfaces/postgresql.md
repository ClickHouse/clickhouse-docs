---
description: 'ClickHouse에서 PostgreSQL 와이어 프로토콜 인터페이스에 대한 문서'
sidebar_label: 'PostgreSQL 인터페이스'
sidebar_position: 20
slug: /interfaces/postgresql
title: 'PostgreSQL 인터페이스'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# PostgreSQL 인터페이스 \{#postgresql-interface\}

<CloudNotSupportedBadge />

:::tip
NVMe 스토리지를 기반으로 하는 [Managed Postgres](/docs/cloud/managed-postgres) 서비스를 확인하십시오. 이 스토리지는 컴퓨트와 물리적으로 함께 배치되어 EBS와 같은 네트워크 연결 스토리지를 사용하는 대안에 비해 디스크에 병목이 있는 워크로드에서 최대 10배 빠른 성능을 제공하며, Postgres CDC 커넥터를 사용하는 ClickPipes를 통해 Postgres 데이터를 ClickHouse로 복제할 수 있도록 합니다.
:::

ClickHouse는 PostgreSQL 와이어 프로토콜을 지원하므로 Postgres 클라이언트를 사용하여 ClickHouse에 연결할 수 있습니다. 어떤 의미에서는 ClickHouse가 PostgreSQL 인스턴스로 동작할 수 있으므로, ClickHouse에서 아직 직접 지원하지 않는 PostgreSQL 클라이언트 애플리케이션(예: Amazon Redshift)을 ClickHouse에 연결할 수 있습니다.

PostgreSQL 와이어 프로토콜을 활성화하려면 서버의 구성 파일에 [postgresql&#95;port](/operations/server-configuration-parameters/settings#postgresql_port) 설정을 추가하십시오. 예를 들어 `config.d` 폴더의 새 XML 파일에서 포트를 정의할 수 있습니다:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

ClickHouse 서버를 기동한 다음, **Listening for PostgreSQL compatibility protocol**이라는 내용이 포함된 다음과 유사한 로그 메시지를 확인합니다:

```response
{} <Information> Application: Listening for PostgreSQL compatibility protocol: 127.0.0.1:9005
```

## psql을 ClickHouse에 연결하기 \{#connect-psql-to-clickhouse\}

다음 명령은 PostgreSQL 클라이언트 `psql`을 ClickHouse에 연결하는 방법을 보여줍니다:

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

예를 들어:

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
`psql` 클라이언트는 비밀번호 기반 로그인이 필요하므로, 비밀번호가 없는 `default` 사용자로는 접속할 수 없습니다. `default` 사용자에 비밀번호를 설정하거나 다른 사용자로 로그인하십시오.
:::

`psql` 클라이언트는 비밀번호 입력을 요청합니다.

```response
Password for user alice:
psql (14.2, server 22.3.1.1)
WARNING: psql major version 14, server major version 22.
         Some psql features might not work.
Type "help" for help.

default=>
```

이제 설정이 완료되었습니다! PostgreSQL 클라이언트가 ClickHouse에 연결되었으며, 모든 명령과 쿼리는 ClickHouse에서 실행됩니다.

:::note
PostgreSQL 프로토콜은 현재 평문(plain text) 암호만 지원합니다.
:::

## SSL 사용 \{#using-ssl\}

ClickHouse 인스턴스에 SSL/TLS가 설정되어 있는 경우, `postgresql_port`는 동일한 설정을 사용합니다(보안 연결과 비보안 연결 모두에 동일한 포트를 사용합니다).

각 클라이언트마다 SSL을 사용해 연결하는 방식이 다릅니다. 다음 명령은 인증서와 키를 전달하여 `psql`을 ClickHouse에 안전하게 연결하는 방법을 보여줍니다:

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

## SCRAM-SHA-256로 ClickHouse 사용자 인증 구성 \{#using-scram-sha256\}

ClickHouse에서 안전한 사용자 인증을 위해 SCRAM-SHA-256 프로토콜 사용을 권장합니다. `users.xml` 파일에서 `password_scram_sha256_hex` 요소를 지정하여 사용자를 구성합니다. 비밀번호 해시는 `num_iterations=4096`으로 생성해야 합니다.

연결 시 `psql` 클라이언트가 SCRAM-SHA-256을 지원하고 해당 방식으로 인증을 협상하도록 되어 있는지 확인합니다.

비밀번호 `abacaba`를 사용하는 사용자 `user_with_sha256`에 대한 예시 구성은 다음과 같습니다.

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

SSL 설정에 대한 자세한 내용은 [PostgreSQL 문서](https://jdbc.postgresql.org/documentation/head/ssl-client.html)를 참조하십시오.
