---
sidebar_label: 'Amazon Aurora Postgres'
description: 'ClickPipes 소스로 Amazon Aurora Postgres를 설정합니다'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Aurora Postgres 소스 설정 가이드'
doc_type: 'guide'
keywords: ['Amazon Aurora', 'PostgreSQL', 'ClickPipes', 'AWS 데이터베이스', '논리 복제 설정']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# Aurora Postgres 소스 설정 가이드 \{#aurora-postgres-source-setup-guide\}

## 지원되는 Postgres 버전 \{#supported-postgres-versions\}

ClickPipes는 Aurora PostgreSQL-Compatible Edition 버전 12 이상을 지원합니다.

## 논리 복제(logical replication) 활성화 \{#enable-logical-replication\}

Aurora 인스턴스에 이미 다음 설정이 되어 있다면 이 섹션은 건너뛰어도 됩니다.

* `rds.logical_replication = 1`
* `wal_sender_timeout = 0`

이러한 설정은 이전에 다른 데이터 복제(replication) 도구를 사용한 적이 있다면 일반적으로 사전에 구성되어 있습니다.

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

아직 구성하지 않았다면 다음 단계를 따르십시오.

1. Aurora PostgreSQL 버전에 대해 필요한 설정을 포함하는 새 파라미터 그룹을 생성합니다.
   * `rds.logical_replication`을 1로 설정합니다.
   * `wal_sender_timeout`을 0으로 설정합니다.

<Image img={parameter_group_in_blade} alt="Aurora에서 파라미터 그룹을 찾는 위치" size="lg" border />

<Image img={change_rds_logical_replication} alt="rds.logical_replication 변경" size="lg" border />

<Image img={change_wal_sender_timeout} alt="wal_sender_timeout 변경" size="lg" border />

2. 새 파라미터 그룹을 Aurora PostgreSQL 클러스터에 적용합니다.

<Image img={modify_parameter_group} alt="새 파라미터 그룹을 적용하도록 Aurora PostgreSQL 수정" size="lg" border />

3. 변경 사항을 적용하기 위해 Aurora 클러스터를 재부팅합니다.

<Image img={reboot_rds} alt="Aurora PostgreSQL 재부팅" size="lg" border />


## 데이터베이스 사용자 구성 \{#configure-database-user\}

관리자 사용자로 Aurora PostgreSQL writer 인스턴스에 접속한 후 다음 명령을 실행합니다:

1. ClickPipes 전용 사용자를 생성합니다:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 이전 단계에서 생성한 사용자에게 스키마 단위의 읽기 전용 권한을 부여합니다. 다음 예시는 `public` 스키마에 대한 권한을 보여 줍니다. 복제하려는 테이블이 포함된 각 스키마에 대해 이 명령을 반복합니다:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 사용자에게 복제(replication) 권한을 부여합니다:

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. 복제하려는 테이블을 포함하는 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)을 생성합니다. 성능 오버헤드를 피하기 위해 publication에는 필요한 테이블만 포함할 것을 강력히 권장합니다.

   :::warning
   publication에 포함되는 모든 테이블에는 **primary key**가 정의되어 있거나, **replica identity**가 `FULL`로 설정되어 있어야 합니다. 범위 설정에 대한 안내는 [Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)를 참고하십시오.
   :::

   - 특정 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 특정 스키마의 모든 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication에는 지정한 테이블에서 생성된 변경 이벤트 집합이 포함되며, 이후 복제 스트림을 수집하는 데 사용됩니다.

## 네트워크 액세스 설정 \{#configure-network-access\}

### IP 기반 액세스 제어 \{#ip-based-access-control\}

Aurora 클러스터로의 트래픽을 제한하려면 [문서에 명시된 고정 NAT IP](../../index.md#list-of-static-ips)를 Aurora 보안 그룹의 `Inbound rules`에 추가하십시오.

<Image img={security_group_in_rds_postgres} alt="Aurora PostgreSQL에서 보안 그룹을 확인하는 위치" size="lg" border/>

<Image img={edit_inbound_rules} alt="위 보안 그룹의 인바운드 규칙을 편집하는 화면" size="lg" border/>

### AWS PrivateLink을 통한 프라이빗 액세스 \{#private-access-via-aws-privatelink\}

프라이빗 네트워크를 통해 Aurora 클러스터에 연결하려면 AWS PrivateLink를 사용할 수 있습니다. 연결을 설정하려면 [ClickPipes용 AWS PrivateLink 설정 가이드](/knowledgebase/aws-privatelink-setup-for-clickpipes)를 따르십시오.

### Aurora 관련 고려 사항 \{#aurora-specific-considerations\}

Aurora PostgreSQL과 함께 ClickPipes를 설정할 때는 다음 사항을 유의하십시오:

1. **Connection Endpoint**: 논리적 복제에는 레플리케이션 슬롯을 생성하기 위한 쓰기 권한이 필요하며 기본(primary) 인스턴스에 연결해야 하므로, 항상 Aurora 클러스터의 writer 엔드포인트(endpoint)에 연결해야 합니다.

2. **Failover 처리**: 장애 조치(failover)가 발생하면 Aurora는 reader를 자동으로 승격하여 새 writer로 만듭니다. ClickPipes는 연결 끊김을 감지하고 writer 엔드포인트에 재연결을 시도하며, 이 엔드포인트는 이제 새로운 기본 인스턴스를 가리키게 됩니다.

3. **Global Database**: Aurora Global Database를 사용하는 경우, 리전 간 복제가 이미 리전 간 데이터 이동을 처리하므로 기본 리전의 writer 엔드포인트에 연결해야 합니다.

4. **스토리지 관련 고려 사항**: Aurora의 스토리지 계층은 클러스터 내 모든 인스턴스에서 공유되며, 이는 표준 RDS에 비해 논리적 복제(logical replication)에 더 나은 성능을 제공할 수 있습니다.

### 동적 클러스터 엔드포인트 처리 \{#dealing-with-dynamic-cluster-endpoints\}

Aurora는 자동으로 적절한 인스턴스로 라우팅하는 안정적인 엔드포인트를 제공하지만, 안정적인 연결을 보장하기 위한 추가적인 방법은 다음과 같습니다.

1. 고가용성 구성을 사용하는 경우, 애플리케이션이 현재 기본(primary) 인스턴스를 자동으로 가리키는 Aurora writer 엔드포인트를 사용하도록 설정하십시오.

2. 리전 간 복제를 사용하는 경우, 지연 시간을 줄이고 장애 허용을 향상시키기 위해 리전별로 별도의 ClickPipes를 설정하는 방안을 고려하십시오.

## 다음 단계 \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 Aurora PostgreSQL 클러스터에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다.
Aurora PostgreSQL 클러스터를 설정할 때 사용한 접속 정보를 반드시 기록해 두어야 하며, ClickPipe를 생성하는 과정에서 이 정보가 필요합니다.