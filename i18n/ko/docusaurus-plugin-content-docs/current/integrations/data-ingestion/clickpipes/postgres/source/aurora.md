---
'sidebar_label': 'Amazon Aurora Postgres'
'description': 'ClickPipes의 소스로 Amazon Aurora Postgres 설정하기'
'slug': '/integrations/clickpipes/postgres/source/aurora'
'title': 'Aurora Postgres 소스 설정 가이드'
'doc_type': 'guide'
'keywords':
- 'Amazon Aurora'
- 'PostgreSQL'
- 'ClickPipes'
- 'AWS database'
- 'logical replication setup'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';



# Aurora Postgres 소스 설정 가이드

## 지원되는 Postgres 버전 {#supported-postgres-versions}

ClickPipes는 Aurora PostgreSQL-Compatible Edition 버전 12 이상을 지원합니다.

## 논리 복제 활성화 {#enable-logical-replication}

이미 다음 설정이 구성된 경우 이 섹션을 건너뛸 수 있습니다:
- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

이 설정은 일반적으로 이전에 다른 데이터 복제 도구를 사용한 경우 미리 구성되어 있습니다.

```text
postgres=> SHOW rds.logical_replication ;
 rds.logical_replication
-------------------------
 on
(1 row)

postgres=> SHOW wal_sender_timeout ;
 wal_sender_timeout
--------------------
 0
(1 row)
```

아직 구성되지 않은 경우 다음 단계를 따르십시오:

1. 필요한 설정으로 Aurora PostgreSQL 버전용 새로운 매개변수 그룹을 생성합니다:
    - `rds.logical_replication`를 1로 설정합니다.
    - `wal_sender_timeout`을 0으로 설정합니다.

<Image img={parameter_group_in_blade} alt="Parameter groups in Aurora를 찾는 곳" size="lg" border/>

<Image img={change_rds_logical_replication} alt="rds.logical_replication 변경하기" size="lg" border/>

<Image img={change_wal_sender_timeout} alt="wal_sender_timeout 변경하기" size="lg" border/>

2. 새로운 매개변수 그룹을 Aurora PostgreSQL 클러스터에 적용합니다.

<Image img={modify_parameter_group} alt="새 매개변수 그룹으로 Aurora PostgreSQL 수정하기" size="lg" border/>

3. 변경 사항을 적용하기 위해 Aurora 클러스터를 재부팅합니다.

<Image img={reboot_rds} alt="Aurora PostgreSQL 재부팅" size="lg" border/>

## 데이터베이스 사용자 구성 {#configure-database-user}

관리자 사용자로 Aurora PostgreSQL 작성자 인스턴스에 연결하고 다음 명령을 실행합니다:

1. ClickPipes 전용 사용자를 생성합니다:

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. 스키마 권한을 부여합니다. 다음 예시는 `public` 스키마에 대한 권한을 보여줍니다. 복제하려는 각 스키마에 대해 이 명령을 반복합니다:

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. 복제 권한을 부여합니다:

```sql
GRANT rds_replication TO clickpipes_user;
```

4. 복제를 위한 발행물을 생성합니다:

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

## 네트워크 액세스 구성 {#configure-network-access}

### IP 기반 액세스 제어 {#ip-based-access-control}

Aurora 클러스터에 대한 트래픽을 제한하려면 [문서화된 정적 NAT IP](../../index.md#list-of-static-ips)를 Aurora 보안 그룹의 `Inbound rules`에 추가해 주십시오.

<Image img={security_group_in_rds_postgres} alt="Aurora PostgreSQL에서 보안 그룹을 찾는 곳?" size="lg" border/>

<Image img={edit_inbound_rules} alt="위의 보안 그룹에 대한 인바운드 규칙 수정하기" size="lg" border/>

### AWS PrivateLink를 통한 프라이빗 액세스 {#private-access-via-aws-privatelink}

프라이빗 네트워크를 통해 Aurora 클러스터에 연결하려면 AWS PrivateLink를 사용할 수 있습니다. 연결 설정을 위해 [ClickPipes용 AWS PrivateLink 설정 가이드](/knowledgebase/aws-privatelink-setup-for-clickpipes)를 따르십시오.

### Aurora 특정 고려사항 {#aurora-specific-considerations}

ClickPipes와 Aurora PostgreSQL을 설정할 때 이 고려사항을 기억하세요:

1. **연결 끝점**: 항상 Aurora 클러스터의 작성자 끝점에 연결하십시오. 논리 복제는 복제 슬롯을 생성하기 위해 쓰기 액세스가 필요하며 기본 인스턴스에 연결해야 합니다.

2. **장애 조치 처리**: 장애 조치가 발생할 경우, Aurora는 자동으로 독자 중 하나를 새로운 작성자로 승격합니다. ClickPipes는 연결 끊김을 감지하고 작성자 끝점에 다시 연결을 시도하게 되며, 이제 새로운 기본 인스턴스를 가리키게 됩니다.

3. **글로벌 데이터베이스**: Aurora 글로벌 데이터베이스를 사용하는 경우, 기본 지역의 작성자 끝점에 연결해야 합니다. 지역 간 복제는 이미 지역 간 데이터 이동을 처리하고 있습니다.

4. **스토리지 고려사항**: Aurora의 스토리지 계층은 클러스터의 모든 인스턴스에서 공유되므로 표준 RDS에 비해 논리 복제에 더 나은 성능을 제공할 수 있습니다.

### 동적 클러스터 끝점 처리하기 {#dealing-with-dynamic-cluster-endpoints}

Aurora는 적절한 인스턴스로 자동 라우팅하는 안정적인 끝점을 제공하지만 일관된 연결성을 보장하기 위한 몇 가지 추가 접근 방법은 다음과 같습니다:

1. 고가용성 설정의 경우, 애플리케이션을 Aurora 작성자 끝점을 사용하도록 구성하십시오. 이는 현재 기본 인스턴스를 자동으로 가리킵니다.

2. 크로스 리전 복제를 사용하는 경우, 각 지역에 대해 별도의 ClickPipes를 설정하여 지연 시간을 줄이고 내결함성을 개선하는 것을 고려하십시오.

## 다음은 무엇인가요? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 Aurora PostgreSQL 클러스터에서 ClickHouse Cloud로 데이터를 수집하기 시작할 수 있습니다.
Aurora PostgreSQL 클러스터를 설정하는 동안 사용한 연결 세부정보를 메모해 두는 것에 유의하십시오. ClickPipe 생성 과정에서 필요합니다.
