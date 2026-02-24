---
slug: /cloud/managed-postgres/connection
sidebar_label: '연결'
title: 'Managed Postgres에 연결하기'
description: 'ClickHouse Managed Postgres용 연결 문자열, PgBouncer 연결 풀링 및 TLS 구성'
keywords: ['postgres 연결', '연결 문자열', 'pgbouncer', 'tls', 'ssl']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import connectButton from '@site/static/images/managed-postgres/connect-button.png';
import connectModal from '@site/static/images/managed-postgres/connect-modal.png';
import tlsCaBundle from '@site/static/images/managed-postgres/tls-ca-bundle.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="connection" />


## 연결 정보 확인 \{#accessing-connection-details\}

애플리케이션을 Managed Postgres에 연결하려면 인스턴스의 왼쪽 사이드바에서 **Connect** 뷰로 이동합니다.

<Image img={connectButton} alt="왼쪽 사이드바에서 Connect를 클릭하여 연결 정보를 확인" size="md" border/>

**Connect**를 클릭하면 모달이 열리며, 연결 인증 정보와 여러 형식의 연결 문자열이 표시됩니다.

<Image img={connectModal} alt="인증 정보와 연결 문자열 형식을 보여주는 연결 모달" size="md" border/>

연결 모달에는 다음 정보가 표시됩니다.

- **Username**: 데이터베이스 사용자 이름 (기본값: `postgres`)
- **Password**: 데이터베이스 비밀번호 (기본적으로 마스킹됨, 눈 아이콘을 클릭하여 표시)
- **Server**: Managed Postgres 인스턴스의 호스트 이름
- **Port**: PostgreSQL 포트 (기본값: `5432`)

Managed Postgres는 데이터베이스에 대한 superuser 액세스를 제공합니다. 이 자격 증명을 사용하여 superuser로 연결하면 추가 사용자를 생성하고 데이터베이스 객체를 관리할 수 있습니다.

## 연결 문자열 형식 \{#connection-string\}

**Connect via** 탭은 애플리케이션 요구 사항에 맞게 사용할 수 있는 여러 형식의 연결 문자열을 제공합니다:

| Format | Description |
|--------|-------------|
| **url** | `postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>` 형식의 표준 연결 URL |
| **psql** | psql 명령줄 도구를 통해 연결하기 위한 즉시 실행 가능한 명령 |
| **env** | libpq 기반 클라이언트를 위한 환경 변수 |
| **yaml** | YAML 형식의 구성 |
| **jdbc** | Java 애플리케이션을 위한 JDBC 연결 문자열 |

보안상의 이유로 연결 문자열에 포함된 비밀번호는 기본적으로 마스킹되어 표시됩니다. 각 필드나 연결 문자열 옆의 복사 아이콘을 클릭하여 클립보드로 바로 복사할 수 있습니다.

## PgBouncer 연결 풀링 \{#pgbouncer\}

Managed Postgres에는 서버 측 연결 풀링을 위한 [PgBouncer](https://www.pgbouncer.org/) 인스턴스가 기본 포함됩니다. PgBouncer는 특히 다음과 같은 애플리케이션에서 연결 관리, 성능 및 리소스 활용을 개선하는 데 도움이 됩니다.

- 동시에 많은 연결을 여는 애플리케이션
- 연결을 자주 생성하고 종료하는 애플리케이션
- 서버리스 또는 일시적인 컴퓨팅 환경을 사용하는 애플리케이션

연결 풀링을 사용하려면 연결 모달 상단에서 **via PgBouncer** 토글을 클릭하십시오. 그러면 연결 정보가 업데이트되어 PostgreSQL에 직접 연결하는 대신 연결 풀러를 통해 연결되도록 라우팅됩니다.

:::tip PgBouncer를 사용해야 할 때
애플리케이션이 짧은 시간 동안 유지되는 연결을 많이 여는 경우 PgBouncer를 사용하십시오. 장기간 유지되는 연결이 필요하거나, 트랜잭션 간 prepared statement와 같이 연결 풀링과 호환되지 않는 PostgreSQL 기능을 사용하는 애플리케이션은 PostgreSQL에 직접 연결하십시오.

PgBouncer를 통해 ClickPipes를 사용하여 데이터를 ClickHouse로 이동하는 작업은 지원되지 않습니다. 
:::

## TLS 구성 \{#tls\}

모든 Managed Postgres 인스턴스는 TLS로 보호됩니다. 최소 지원 버전은 **TLS 1.3**입니다.

### 간편 연결(TLS 암호화) \{#quick-connection\}

기본적으로 연결은 인증서 검증 없이 TLS 암호화를 사용합니다.

```bash
psql 'postgresql://postgres:PASSWORD@your-instance.pg.clickhouse.cloud:5432/postgres'
```


### 검증된 TLS 연결 (프로덕션 환경 권장) \{#verified-tls\}

프로덕션 워크로드에서는 올바른 서버와 통신하고 있는지 보장하기 위해 검증된 TLS를 사용하여 연결할 것을 권장합니다. 이를 위해 **Settings** 탭에서 CA 인증서 번들을 다운로드한 후 데이터베이스 클라이언트의 신뢰할 수 있는 인증서 목록에 추가합니다.

<Image img={tlsCaBundle} alt="Settings 탭에서 CA 인증서 다운로드" size="md" border />

CA 인증서는 사용 중인 Managed Postgres 인스턴스에만 고유하며, 다른 인스턴스에서는 사용할 수 없습니다.

검증된 TLS 연결을 사용해 접속하려면 `sslmode=verify-full`과 다운로드한 인증서 경로를 연결 설정에 추가합니다:

```bash
psql 'postgresql://postgres:PASSWORD@your-instance.pg.clickhouse.cloud:5432/postgres?sslmode=verify-full&sslrootcert=/path/to/ca-certificate.pem'
```
