---
sidebar_label: 'Amazon RDS Postgres'
description: 'ClickPipes 소스로 Amazon RDS Postgres를 설정합니다'
slug: /integrations/clickpipes/postgres/source/rds
title: 'RDS Postgres 소스 설정 가이드'
doc_type: 'guide'
keywords: ['ClickPipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
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


# RDS Postgres 소스 구성 가이드 \{#rds-postgres-source-setup-guide\}

## 지원되는 Postgres 버전 \{#supported-postgres-versions\}

ClickPipes는 Postgres 버전 12 이상을 지원합니다.

## 논리 복제(logical replication) 활성화 \{#enable-logical-replication\}

RDS 인스턴스에 다음 설정이 이미 구성되어 있다면 이 섹션은 건너뛰어도 됩니다.

* `rds.logical_replication = 1`
* `wal_sender_timeout = 0`

이러한 설정은 이전에 다른 데이터 복제(replication) 도구를 사용했다면 보통 미리 설정되어 있습니다.

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

1. 필요한 설정으로 사용 중인 Postgres 버전에 맞는 새 파라미터 그룹을 생성합니다.
   * `rds.logical_replication`을 1로 설정합니다.
   * `wal_sender_timeout`을 0으로 설정합니다.

<Image img={parameter_group_in_blade} alt="RDS에서 파라미터 그룹을 찾는 위치" size="lg" border />

<Image img={change_rds_logical_replication} alt="rds.logical_replication 변경" size="lg" border />

<Image img={change_wal_sender_timeout} alt="wal_sender_timeout 변경" size="lg" border />

2. 새 파라미터 그룹을 RDS Postgres 데이터베이스에 적용합니다.

<Image img={modify_parameter_group} alt="새 파라미터 그룹으로 RDS Postgres 수정" size="lg" border />

3. 변경 내용을 적용하기 위해 RDS 인스턴스를 재부팅합니다.

<Image img={reboot_rds} alt="RDS Postgres 재부팅" size="lg" border />


## 데이터베이스 사용자 구성 \{#configure-database-user\}

관리자 사용자로 RDS Postgres 인스턴스에 접속한 후 다음 명령을 실행합니다:

1. ClickPipes용 전용 사용자를 생성합니다:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 이전 단계에서 생성한 사용자에게 스키마 단위의 읽기 전용 권한을 부여합니다. 다음 예시는 `public` 스키마에 대한 권한을 보여줍니다. 복제하려는 테이블이 포함된 각 스키마에 대해 이 명령들을 반복합니다:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 사용자에게 복제 권한을 부여합니다:

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. 복제하려는 테이블을 포함하는 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)을 생성합니다. 성능 오버헤드를 줄이기 위해 publication에는 필요한 테이블만 포함할 것을 강력히 권장합니다.

   :::warning
   publication에 포함되는 모든 테이블에는 **기본 키(primary key)**가 정의되어 있거나, **replica identity**가 `FULL`로 설정되어 있어야 합니다. 범위 지정에 대한 안내는 [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)를 참고하십시오.
   :::

   - 특정 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 특정 스키마의 모든 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication에는 지정된 테이블에서 생성되는 변경 이벤트 집합이 포함되며, 이후 복제 스트림을 수집하는 데 사용됩니다.

## 네트워크 액세스 구성 \{#configure-network-access\}

### IP 기반 액세스 제어 \{#ip-based-access-control\}

RDS 인스턴스로의 트래픽을 제한하려면 RDS 보안 그룹의 `Inbound rules`에 [문서에 명시된 고정 NAT IP](../../index.md#list-of-static-ips)를 추가하십시오.

<Image img={security_group_in_rds_postgres} alt="RDS Postgres에서 보안 그룹을 찾는 위치" size="lg" border/>

<Image img={edit_inbound_rules} alt="위 보안 그룹의 인바운드 규칙을 편집하는 화면" size="lg" border/>

### AWS PrivateLink를 통한 프라이빗 액세스 \{#private-access-via-aws-privatelink\}

사설 네트워크를 통해 RDS 인스턴스에 연결하려면 AWS PrivateLink를 사용할 수 있습니다. 연결을 설정하려면 [ClickPipes용 AWS PrivateLink 설정 가이드](/knowledgebase/aws-privatelink-setup-for-clickpipes)를 참고하십시오.

### RDS Proxy 우회 방법 \{#workarounds-for-rds-proxy\}

RDS Proxy는 논리 복제(logical replication) 연결을 지원하지 않습니다. RDS에서 동적 IP 주소를 사용하고 DNS 이름이나 Lambda 함수를 사용할 수 없는 경우에는 다음과 같은 대안이 있습니다.

1. cron 작업을 사용하여 RDS 엔드포인트의 IP를 주기적으로 확인하고, 변경된 경우 NLB를 업데이트합니다.
2. EventBridge/SNS와 함께 RDS Event Notifications 사용: AWS RDS 이벤트 알림을 사용하여 업데이트를 자동으로 트리거합니다.
3. Stable EC2: 폴링 서비스 또는 IP 기반 프록시 역할을 하는 EC2 인스턴스를 배포합니다.
4. Terraform 또는 CloudFormation과 같은 도구를 사용하여 IP 주소 관리를 자동화합니다.

## 다음 단계는? \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 Postgres 인스턴스의 데이터를 ClickHouse Cloud로 수집하기 시작할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 정보를 반드시 기록해 두시기 바랍니다. ClickPipe를 생성하는 과정에서 해당 정보가 필요합니다.