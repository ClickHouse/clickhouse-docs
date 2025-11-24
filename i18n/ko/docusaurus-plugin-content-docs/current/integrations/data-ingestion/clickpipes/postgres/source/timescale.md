---
'sidebar_label': 'Timescale'
'description': 'ClickPipes를 위한 소스로서 TimescaleDB 확장을 사용하여 Postgres 설정하기'
'slug': '/integrations/clickpipes/postgres/source/timescale'
'title': 'Postgres와 TimescaleDB 소스 설정 가이드'
'keywords':
- 'TimescaleDB'
'doc_type': 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';


# Postgres with TimescaleDB 소스 설정 가이드

<BetaBadge/>

## 배경 {#background}

[TimescaleDB](https://github.com/timescale/timescaledb)는 Postgres에서 벗어나지 않고도 분석 쿼리의 성능을 향상시키기 위해 Timescale Inc에서 개발한 오픈 소스 Postgres 확장입니다. 이는 "하이퍼테이블"을 생성하여 달성되며, 이들은 확장에 의해 관리되며 "청크"로 자동 파티셔닝을 지원합니다. 하이퍼테이블은 투명한 압축 및 하이브리드 행-컬럼 저장소(일명 "하이퍼코어")를 지원하지만, 이러한 기능은 독점 라이선스가 있는 확장의 버전이 필요합니다.

Timescale Inc는 TimescaleDB를 위한 두 가지 관리 서비스를 제공하기도 합니다:
- `Managed Service for Timescale`
- `Timescale Cloud`. 

타사 공급업체들이 TimescaleDB 확장을 사용할 수 있는 관리 서비스를 제공하지만, 라이선스 문제로 인해 이들 공급업체는 오픈 소스 버전의 확장만 지원합니다.

Timescale 하이퍼테이블은 여러 면에서 일반 Postgres 테이블과 다르게 작동합니다. 이는 복제 과정에 일부 복잡성을 초래하며, 따라서 Timescale 하이퍼테이블의 복제 가능성은 **최선의 노력**으로 고려되어야 합니다.

## 지원되는 Postgres 버전 {#supported-postgres-versions}

ClickPipes는 Postgres 버전 12 및 이후 버전을 지원합니다.

## 논리적 복제 활성화 {#enable-logical-replication}

TimescaleDB가 배포된 방식에 따라 따라야 할 단계가 다릅니다.

- 관리 서비스를 사용 중이고 공급자가 사이드바에 나열되어 있는 경우, 해당 공급자에 대한 가이드를 따르세요.
- TimescaleDB를 직접 배포하는 경우, 일반 가이드를 따르세요.

기타 관리 서비스의 경우, 이미 활성화되지 않은 경우 논리적 복제 활성화를 도와줄 수 있도록 공급자에게 지원 요청 티켓을 제출하세요.

:::info
Timescale Cloud는 CDC 모드에서 Postgres 파이프에 필요한 논리적 복제를 활성화하는 것을 지원하지 않습니다. 따라서 Timescale Cloud 사용자는 Postgres ClickPipe로 데이터의 일회성 로드(`Initial Load Only`)만 수행할 수 있습니다.
:::

## 구성 {#configuration}

Timescale 하이퍼테이블은 삽입된 데이터를 저장하지 않습니다. 대신, 데이터는 `_timescaledb_internal` 스키마의 여러 해당 "청크" 테이블에 저장됩니다. 하이퍼테이블에서 쿼리를 실행하는 데에는 문제가 없지만, 논리적 복제 중에는 하이퍼테이블이 아닌 청크 테이블에서 변경 사항을 감지합니다. Postgres ClickPipe는 청크 테이블에서 부모 하이퍼테이블로 변경 사항을 자동으로 다시 매핑하는 로직을 가지고 있지만, 추가적인 단계가 필요합니다.

:::info
데이터의 일회성 로드(`Initial Load Only`)만 수행하려는 경우, 2단계 이후를 건너뛰세요.
:::

1. 파이프에 사용할 Postgres 사용자를 만들고 복제할 테이블에 대한 `SELECT` 권한을 부여하세요.

```sql
CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- If desired, you can refine these GRANTs to individual tables alone, instead of the entire schema
-- But when adding new tables to the ClickPipe, you'll need to add them to the user as well.
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

:::note
`clickpipes_user`와 `clickpipes_password`를 원하는 사용자 이름과 비밀번호로 바꾸는 것을 잊지 마세요.
:::

2. Postgres 슈퍼유저/관리자로서 복제할 테이블과 하이퍼테이블이 있는 소스 인스턴스에 게시물을 생성하고 **전체 `_timescaledb_internal` 스키마를 포함해야 합니다**. ClickPipe를 생성할 때 이 게시물을 선택해야 합니다.

```sql
-- When adding new tables to the ClickPipe, you'll need to add them to the publication as well manually. 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
`FOR ALL TABLES` 게시물을 생성하는 것은 권장하지 않습니다. 이는 Postgres에서 ClickPipes로의 더 많은 트래픽(파이프에 없는 다른 테이블 변경사항 전송)을 초래하여 전체 효율성을 줄이기 때문입니다.

수동으로 생성된 게시물의 경우, 파이프에 추가하기 전에 게시물에 원하는 테이블을 추가하세요.
::: 

:::info
일부 관리 서비스는 전체 스키마에 대한 게시물을 생성할 수 있는 필수 권한을 관리자 사용자에게 부여하지 않습니다. 그렇다면 지원 요청 티켓을 공급자에게 제출하세요. 또는 이 단계를 건너뛰고 다음 단계를 건너뛰고 데이터의 일회성 로드를 수행할 수 있습니다.
:::

3. 앞서 생성한 사용자에게 복제 권한을 부여하세요.

```sql
-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;
```

이 단계 후에, [ClickPipe 생성](../index.md)으로 진행할 수 있어야 합니다.

## 네트워크 액세스 구성 {#configure-network-access}

Timescale 인스턴스에 대한 트래픽을 제한하려면 [문서화된 정적 NAT IP](../../index.md#list-of-static-ips)를 허용 목록에 추가하세요. 이를 수행하는 방법은 공급자마다 다를 수 있으며, 공급자가 나열되어 있는 경우 사이드바를 참조하거나 티켓을 제출하세요.
