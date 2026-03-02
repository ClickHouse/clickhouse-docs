---
sidebar_label: 'Amazon RDS MariaDB'
description: 'ClickPipes의 소스로 Amazon RDS MariaDB를 설정하는 단계별 가이드'
slug: /integrations/clickpipes/mysql/source/rds_maria
title: 'RDS MariaDB 소스 설정 가이드'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# RDS MariaDB 소스 설정 가이드 \{#rds-mariadb-source-setup-guide\}

이 문서는 MySQL ClickPipe를 통해 데이터를 복제하도록 RDS MariaDB 인스턴스를 구성하는 단계별 안내입니다.

<br/>

:::info
또한 MySQL FAQ 문서 [여기](/integrations/data-ingestion/clickpipes/mysql/faq.md)를 참고하기를 권장합니다. FAQ 페이지는 지속적으로 업데이트됩니다.
:::

## 바이너리 로그 보존 활성화 \{#enable-binlog-retention-rds\}

바이너리 로그는 MySQL 서버 인스턴스에서 수행된 데이터 변경 사항에 대한 정보가 포함된 로그 파일들의 모음입니다. 바이너리 로그 파일은 복제를 위해 필요합니다. 아래 두 단계를 모두 수행해야 합니다:

### 1. 자동 백업을 통해 바이너리 로그 활성화 \{#enable-binlog-logging-rds\}

자동 백업 기능은 MySQL에서 바이너리 로그가 활성화되어 있는지 여부를 결정합니다. AWS 콘솔에서 설정할 수 있습니다:

<Image img={rds_backups} alt="RDS에서 자동 백업을 활성화하는 화면" size="lg" border/>

복제 사용 사례에 따라 충분히 긴 기간으로 백업 보존 기간을 설정하는 것이 좋습니다.

### 2. Binlog 보존 시간 \{#binlog-retention-hours-rds\}

Amazon RDS for MariaDB에서는 변경 사항이 기록된 binlog 파일을 얼마나 오래 유지할지(보존 기간)를 설정하는 방식이 다릅니다. binlog 파일이 삭제되기 전에 해당 파일에 기록된 일부 변경 사항을 읽지 못하면 복제를 계속할 수 없습니다. binlog 보존 시간의 기본값은 NULL이며, 이는 binary log를 보존하지 않는다는 의미입니다.

DB 인스턴스에서 binary log를 보존할 시간을 시간 단위로 지정하려면, 복제가 이루어지기에 충분히 긴 binlog 보존 기간을 설정하여 `mysql.rds_set_configuration` FUNCTION을 사용합니다. `24 hours`를 최소 권장값으로 합니다.

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```


## 파라미터 그룹에서 binlog 설정 구성하기 \{#binlog-parameter-group-rds\}

RDS 콘솔에서 MariaDB 인스턴스를 클릭한 후 `Configurations` 탭으로 이동하면 파라미터 그룹을 확인할 수 있습니다.

<Image img={rds_config} alt="RDS에서 파라미터 그룹을 찾는 위치" size="lg" border/>

파라미터 그룹 링크를 클릭하면 파라미터 그룹 상세 페이지로 이동합니다. 오른쪽 상단에 Edit 버튼이 표시됩니다:

<Image img={edit_button} alt="파라미터 그룹 편집" size="lg" border/>

`binlog_format`, `binlog_row_metadata`, `binlog_row_image` 설정을 다음과 같이 구성해야 합니다.

1. `binlog_format`을 `ROW`로 설정합니다.

<Image img={binlog_format} alt="Binlog format을 ROW로 설정" size="lg" border/>

2. `binlog_row_metadata`를 `FULL`로 설정합니다.

<Image img={binlog_row_metadata} alt="Binlog row metadata를 FULL로 설정" size="lg" border/>

3. `binlog_row_image`를 `FULL`로 설정합니다.

<Image img={binlog_row_image} alt="Binlog row image를 FULL로 설정" size="lg" border/>

다음으로 오른쪽 상단의 `Save Changes`를 클릭합니다. 변경 사항을 적용하려면 인스턴스를 재부팅해야 할 수 있습니다. RDS 인스턴스의 `Configurations` 탭에서 파라미터 그룹 링크 옆에 `Pending reboot`가 표시되면, 인스턴스를 재부팅해야 한다는 좋은 신호입니다.

<br/>

:::tip
MariaDB 클러스터를 사용하는 경우, 위에서 언급한 파라미터는 DB 인스턴스 그룹이 아니라 [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 파라미터 그룹에서 찾을 수 있습니다.
:::

## GTID 모드 활성화 \{#gtid-mode-rds\}

Global Transaction Identifier(GTID)는 MySQL/MariaDB에서 커밋된 각 트랜잭션에 할당되는 고유 ID입니다. GTID는 binlog 복제를 단순화하고 문제 해결을 보다 직관적으로 만들어 줍니다. MariaDB에서는 기본적으로 GTID 모드가 활성화되어 있으므로, 이를 사용하기 위해 사용자가 별도로 조치할 사항은 없습니다.

## 데이터베이스 사용자 구성 \{#configure-database-user-rds\}

관리자 사용자로 RDS MariaDB 인스턴스에 연결한 후 다음 명령어를 실행합니다:

1. ClickPipes 전용 사용자를 생성합니다:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. 스키마 권한을 부여합니다. 다음 예시는 `mysql` 데이터베이스에 대한 권한을 보여 줍니다. 복제 대상인 각 데이터베이스와 호스트에 대해 해당 명령어를 반복합니다:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. 사용자에게 복제(replication) 권한을 부여합니다:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';


## 네트워크 액세스 설정 {#configure-network-access}

### IP 기반 액세스 제어 {#ip-based-access-control}

RDS 인스턴스로의 트래픽을 제한하려면 [문서화된 정적 NAT IP](../../index.md#list-of-static-ips)를 RDS 보안 그룹의 `Inbound rules`에 추가하십시오.

<Image img={security_group_in_rds_mysql} alt="RDS에서 보안 그룹을 찾는 위치" size="lg" border/>

<Image img={edit_inbound_rules} alt="위 보안 그룹의 인바운드 규칙(Inbound rules) 편집" size="lg" border/>

### AWS PrivateLink을 통한 프라이빗 액세스 {#private-access-via-aws-privatelink}

사설 네트워크를 통해 RDS 인스턴스에 연결하려면 AWS PrivateLink를 사용할 수 있습니다. 연결을 구성하려면 [ClickPipes용 AWS PrivateLink 설정 가이드](/knowledgebase/aws-privatelink-setup-for-clickpipes)를 따르십시오.