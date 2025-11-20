---
'sidebar_label': 'Amazon RDS Postgres'
'description': 'ClickPipes의 소스로 Amazon RDS Postgres 설정하기'
'slug': '/integrations/clickpipes/postgres/source/rds'
'title': 'RDS Postgres 소스 설정 가이드'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# RDS Postgres 소스 설정 가이드

## 지원되는 Postgres 버전 {#supported-postgres-versions}

ClickPipes는 Postgres 버전 12 이상을 지원합니다.

## 논리 복제 활성화 {#enable-logical-replication}

RDS 인스턴스에 이미 다음 설정이 구성되어 있는 경우 이 섹션을 건너뛸 수 있습니다:
- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

이 설정은 일반적으로 이전에 다른 데이터 복제 도구를 사용할 경우 미리 구성됩니다.

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

1. 필수 설정으로 Postgres 버전용 새 파라미터 그룹을 만듭니다:
    - `rds.logical_replication`을 1로 설정
    - `wal_sender_timeout`을 0으로 설정

<Image img={parameter_group_in_blade} alt="RDS에서 파라미터 그룹 찾는 법" size="lg" border/>

<Image img={change_rds_logical_replication} alt="rds.logical_replication 변경하기" size="lg" border/>

<Image img={change_wal_sender_timeout} alt="wal_sender_timeout 변경하기" size="lg" border/>

2. 새 파라미터 그룹을 RDS Postgres 데이터베이스에 적용합니다.

<Image img={modify_parameter_group} alt="새 파라미터 그룹으로 RDS Postgres 수정하기" size="lg" border/>

3. 변경 사항을 적용하기 위해 RDS 인스턴스를 재부팅합니다.

<Image img={reboot_rds} alt="RDS Postgres 재부팅하기" size="lg" border/>

## 데이터베이스 사용자 구성 {#configure-database-user}

관리자 사용자로 RDS Postgres 인스턴스에 연결하고 다음 명령을 실행합니다:

1. ClickPipes 전용 사용자를 만듭니다:

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

4. 복제를 위한 출판물을 만듭니다:

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

## 네트워크 액세스 구성 {#configure-network-access}

### IP 기반 액세스 제어 {#ip-based-access-control}

RDS 인스턴스로의 트래픽을 제한하려면 [문서화된 정적 NAT IPs](../../index.md#list-of-static-ips)를 RDS 보안 그룹의 `Inbound rules`에 추가하십시오.

<Image img={security_group_in_rds_postgres} alt="RDS Postgres에서 보안 그룹 찾는 법" size="lg" border/>

<Image img={edit_inbound_rules} alt="위의 보안 그룹에 대한 인바운드 규칙 편집하기" size="lg" border/>

### AWS PrivateLink를 통한 프라이빗 액세스 {#private-access-via-aws-privatelink}

프라이빗 네트워크를 통해 RDS 인스턴스에 연결하려면 AWS PrivateLink를 사용할 수 있습니다. 연결을 설정하려면 [ClickPipes 용 AWS PrivateLink 설정 가이드](/knowledgebase/aws-privatelink-setup-for-clickpipes)를 따르세요.

### RDS Proxy를 위한 우회 방법 {#workarounds-for-rds-proxy}
RDS Proxy는 논리 복제 연결을 지원하지 않습니다. RDS에서 동적 IP 주소가 있고 DNS 이름이나 람다를 사용할 수 없는 경우 몇 가지 대안은 다음과 같습니다:

1. 크론 작업을 사용하여 RDS 엔드포인트의 IP를 정기적으로 확인하고 NLB를 변경된 경우 업데이트합니다.
2. EventBridge/SNS와 함께 RDS 이벤트 알림 사용: AWS RDS 이벤트 알림을 사용하여 자동으로 업데이트를 트리거합니다.
3. 안정적인 EC2: 폴링 서비스 또는 IP 기반 프록시 역할을 하는 EC2 인스턴스를 배포합니다.
4. Terraform 또는 CloudFormation과 같은 도구를 사용하여 IP 주소 관리 자동화.

## 다음 단계는 무엇인가요? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 Postgres 인스턴스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 세부정보를 기록해 두는 것을 잊지 마세요. ClickPipe 생성 과정에서 필요할 것입니다.
