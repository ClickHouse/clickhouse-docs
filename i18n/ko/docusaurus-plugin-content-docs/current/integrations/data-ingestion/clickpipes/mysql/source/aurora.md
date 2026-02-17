---
sidebar_label: 'Amazon Aurora MySQL'
description: 'ClickPipes에서 Amazon Aurora MySQL을 소스로 설정하는 단계별 가이드'
slug: /integrations/clickpipes/mysql/source/aurora
title: 'Aurora MySQL 소스 설정 가이드'
doc_type: 'guide'
keywords: ['aurora mysql', 'clickpipes', 'binlog retention', 'gtid mode', 'aws']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import aurora_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/aurora_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';


# Aurora MySQL 소스 설정 가이드 \{#aurora-mysql-source-setup-guide\}

이 단계별 가이드는 Amazon Aurora MySQL을 구성하여 [MySQL ClickPipe](../index.md)를 사용해 데이터를 ClickHouse Cloud로 복제하는 방법을 안내합니다. MySQL CDC와 관련된 자주 묻는 질문은 [MySQL FAQ 페이지](/integrations/data-ingestion/clickpipes/mysql/faq.md)를 참고하십시오.

## 바이너리 로그 보존 활성화 \{#enable-binlog-retention-aurora\}

바이너리 로그는 MySQL 서버 인스턴스에서 수행된 데이터 변경에 대한 정보를 포함하는 일련의 로그 파일이며, 복제를 위해서는 바이너리 로그 파일이 필요합니다. Aurora MySQL에서 바이너리 로그 보존을 구성하려면 [바이너리 로깅을 활성화](#enable-binlog-logging)하고 [binlog 보존 기간을 늘려야](#binlog-retention-interval) 합니다.

### 1. 자동 백업을 통해 바이너리 로깅 활성화 \{#enable-binlog-logging\}

자동 백업 기능은 MySQL에서 바이너리 로깅이 켜져 있는지 여부를 결정합니다. 자동 백업은 RDS Console에서 **Modify** > **Additional configuration** > **Backup**으로 이동한 후 **Enable automated backups** 체크박스를 선택하여(이미 선택되어 있지 않은 경우) 인스턴스에 대해 구성할 수 있습니다.

<Image img={rds_backups} alt="Aurora에서 자동 백업 활성화" size="lg" border/>

복제 사용 사례에 따라 **Backup retention period**를 충분히 긴 값으로 설정할 것을 권장합니다.

### 2. binlog 보존 기간 늘리기 \{#binlog-retention-interval\}

:::warning
ClickPipes가 복제를 다시 시작하려고 할 때, 설정된 binlog 보존 값으로 인해 필요한 binlog 파일이 삭제된 상태라면 ClickPipe는 오류 상태가 되며, 다시 동기화(resync)가 필요합니다.
:::

기본적으로 Aurora MySQL은 가능한 한 빨리 바이너리 로그(binary log)를 삭제합니다(즉, *lazy purging* 방식). 장애 상황에서도 복제를 위한 바이너리 로그 파일을 확보할 수 있도록 binlog 보존 기간을 최소 **72시간**으로 늘릴 것을 권장합니다. 바이너리 로그 보존 기간([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours))을 설정하려면 [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) 프로시저를 사용하십시오:

[//]: # "참고: 대부분의 CDC 제공자는 Aurora RDS에 대해 최대 보존 기간(7일/168시간)을 권장합니다. 이는 디스크 사용량에 영향을 주므로, 여기에서는 보수적으로 최소 3일/72시간을 권장합니다."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

이 설정을 지정하지 않았거나 간격을 너무 짧게 설정하면 바이너리 로그에 누락 구간이 생겨 ClickPipes가 복제를 재개하지 못할 수 있습니다.


## binlog 설정 구성 \{#binlog-settings\}

파라미터 그룹은 RDS 콘솔에서 MySQL 인스턴스를 클릭한 후 **Configuration** 탭으로 이동하면 확인할 수 있습니다.

:::tip
MySQL 클러스터를 사용하는 경우, 아래 파라미터는 DB 인스턴스 그룹이 아니라 [DB 클러스터](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 파라미터 그룹에서 찾을 수 있습니다.
:::

<Image img={aurora_config} alt="Aurora에서 파라미터 그룹을 찾는 위치" size="lg" border/>

<br/>

파라미터 그룹 링크를 클릭하면 해당 전용 페이지로 이동합니다. 오른쪽 상단에 **Edit** 버튼이 표시됩니다.

<Image img={edit_button} alt="파라미터 그룹 편집" size="lg" border/>

<br/>

다음 파라미터를 아래와 같이 설정합니다.

1. `binlog_format`을 `ROW`로 설정합니다.

<Image img={binlog_format} alt="Binlog format을 ROW로 설정" size="lg" border/>

2. `binlog_row_metadata`를 `FULL`로 설정합니다.

<Image img={binlog_row_metadata} alt="Binlog row metadata" size="lg" border/>

3. `binlog_row_image`를 `FULL`로 설정합니다.

<Image img={binlog_row_image} alt="Binlog row image" size="lg" border/>

<br/>

그런 다음 오른쪽 상단의 **Save Changes**를 클릭합니다. 변경 사항이 적용되려면 인스턴스를 재부팅해야 할 수 있습니다. 이를 확인하는 방법은 Aurora 인스턴스의 **Configuration** 탭에서 파라미터 그룹 링크 옆에 `Pending reboot`가 표시되는지 여부를 확인하는 것입니다.

## GTID 모드 활성화 (권장) \{#gtid-mode\}

:::tip
MySQL ClickPipe는 GTID 모드 없이도 복제를 지원합니다. 그러나 더 나은 성능과 더 쉬운 문제 해결을 위해 GTID 모드를 활성화할 것을 권장합니다.
:::

[Global Transaction Identifiers (GTIDs)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html)는 MySQL에서 커밋된 각 트랜잭션에 할당되는 고유 ID입니다. 이는 binlog 복제를 단순화하고 문제 해결을 더 간단하게 만들어 줍니다. MySQL ClickPipe가 GTID 기반 복제를 사용할 수 있도록 GTID 모드를 활성화할 것을 **권장**합니다.

GTID 기반 복제는 Amazon Aurora MySQL v2(MySQL 5.7)와 v3(MySQL 8.0), 그리고 Aurora Serverless v2에서 지원됩니다. Aurora MySQL 인스턴스에서 GTID 모드를 활성화하려면 다음 단계를 따르십시오.

1. RDS 콘솔에서 MySQL 인스턴스를 클릭합니다.
2. **Configuration** 탭을 클릭합니다.
3. 파라미터 그룹 링크를 클릭합니다.
4. 오른쪽 상단의 **Edit** 버튼을 클릭합니다.
5. `enforce_gtid_consistency`를 `ON`으로 설정합니다.
6. `gtid-mode`를 `ON`으로 설정합니다.
7. 오른쪽 상단의 **Save Changes**를 클릭합니다.
8. 인스턴스를 재부팅하여 변경 사항을 적용합니다.

<Image img={enable_gtid} alt="GTID enabled" size="lg" border/>

## 데이터베이스 사용자 구성 \{#configure-database-user\}

관리자 계정으로 Aurora MySQL 인스턴스에 연결한 후 다음 명령을 실행합니다.

1. ClickPipes 전용 사용자를 생성합니다.

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. 스키마 권한을 부여합니다. 다음 예시는 `mysql` 데이터베이스에 대한 권한을 보여 줍니다. 복제하려는 각 데이터베이스와 호스트에 대해 다음 명령을 반복합니다.

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. 사용자에게 복제 권한을 부여합니다.

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## 네트워크 액세스 설정 \{#configure-network-access\}

### IP 기반 액세스 제어 \{#ip-based-access-control\}

Aurora MySQL 인스턴스로의 트래픽을 제한하려면 [문서에 명시된 정적 NAT IP](../../index.md#list-of-static-ips)를 Aurora 보안 그룹의 **Inbound rules**에 추가합니다.

<Image img={security_group_in_rds_mysql} alt="Aurora MySQL에서 보안 그룹을 찾는 위치" size="lg" border/>

<Image img={edit_inbound_rules} alt="위 보안 그룹의 인바운드 규칙을 편집하는 화면" size="lg" border/>

### AWS PrivateLink를 통한 프라이빗 액세스 \{#private-access-via-aws-privatelink\}

프라이빗 네트워크를 통해 Aurora MySQL 인스턴스에 연결하려면 AWS PrivateLink를 사용할 수 있습니다. 연결을 설정하려면 [ClickPipes용 AWS PrivateLink 설정 가이드](/knowledgebase/aws-privatelink-setup-for-clickpipes)를 따르십시오.

## 다음 단계는? \{#whats-next\}

Amazon Aurora MySQL 인스턴스가 binlog 복제 및 ClickHouse Cloud에 대한 보안 연결을 위해 구성되었으므로 이제 [첫 번째 MySQL ClickPipe를 생성](/integrations/clickpipes/mysql/#create-your-clickpipe)할 수 있습니다. MySQL CDC와 관련된 일반적인 질문은 [MySQL FAQ 페이지](/integrations/data-ingestion/clickpipes/mysql/faq.md)를 참고하십시오.