---
'sidebar_label': 'Amazon RDS MySQL'
'description': 'Amazon RDS MySQL을 ClickPipes의 소스로 설정하는 방법에 대한 단계별 가이드'
'slug': '/integrations/clickpipes/mysql/source/rds'
'title': 'RDS MySQL 소스 설정 가이드'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mysql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';


# RDS MySQL 소스 설정 가이드

이 단계별 가이드는 Amazon RDS MySQL을 구성하여 [MySQL ClickPipe](../index.md)를 사용하여 ClickHouse Cloud에 데이터를 복제하는 방법을 보여줍니다. MySQL CDC에 대한 일반적인 질문은 [MySQL FAQ 페이지](/integrations/data-ingestion/clickpipes/mysql/faq.md)를 참조하세요.

## 바이너리 로그 보존 활성화 {#enable-binlog-retention-rds}

바이너리 로그는 MySQL 서버 인스턴스에 대해 수행된 데이터 수정 사항에 대한 정보를 포함하는 로그 파일 집합이며, 복제에 바이너리 로그 파일이 필요합니다. RDS MySQL에서 바이너리 로그 보존을 구성하려면 [바이너리 로깅을 활성화](#enable-binlog-logging)하고 [binlog 보존 기간을 증가](#binlog-retention-interval)시켜야 합니다.

### 1. 자동 백업을 통한 바이너리 로깅 활성화 {#enable-binlog-logging}

자동 백업 기능은 MySQL의 바이너리 로깅이 켜져 있는지 꺼져 있는지를 결정합니다. 자동 백업은 RDS 콘솔에서 **수정** > **추가 구성** > **백업**으로 이동하여 **자동 백업 활성화** 체크박스를 선택하여 인스턴스에 대해 구성할 수 있습니다(이미 선택된 경우 제외).

<Image img={rds_backups} alt="RDS에서 자동 백업 활성화" size="lg" border/>

복제 사용 사례에 따라 **백업 보존 기간**을 합리적으로 긴 값으로 설정하는 것이 좋습니다.

### 2. binlog 보존 기간 증가 {#binlog-retention-interval}

:::warning
ClickPipes가 복제를 재개하려고 시도할 때, 설정된 binlog 보존 값으로 인해 필요한 binlog 파일이 제거되었다면 ClickPipe는 오류 상태에 들어가며, 다시 동기화가 필요합니다.
:::

기본적으로 Amazon RDS는 가능한 한 빨리 바이너리 로그를 정리합니다(즉, _게으른 정리_). 실패 시나리오에서 복제를 위해 바이너리 로그 파일의 가용성을 보장하기 위해 binlog 보존 기간을 최소 **72시간**으로 늘리는 것이 좋습니다. 바이너리 로그 보존을 위한 간격을 설정하려면 ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)), [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) 프로시저를 사용하세요:

[//]: # "NOTE 대부분의 CDC 제공자는 RDS에 대한 최대 보존 기간(7일/168시간)을 권장합니다. 이는 디스크 사용량에 영향을 미치므로 최소 3일/72시간을 권장합니다."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

이 구성이 설정되지 않았거나 낮은 간격으로 설정된 경우 바이너리 로그에 간격이 발생할 수 있으며, 이는 ClickPipes의 복제 재개 능력을 손상시킬 수 있습니다. 

## binlog 설정 구성 {#binlog-settings}

RDS 콘솔에서 MySQL 인스턴스를 클릭하면 매개변수 그룹을 찾을 수 있으며, **구성** 탭으로 이동합니다.

:::tip
MySQL 클러스터가 있는 경우 아래 매개변수는 DB 인스턴스 그룹 대신 [DB 클러스터](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 매개변수 그룹에서 찾을 수 있습니다.
:::

<Image img={rds_config} alt="RDS에서 매개변수 그룹 찾는 방법" size="lg" border/>

<br/>
매개변수 그룹 링크를 클릭하면 전용 페이지로 이동합니다. 오른쪽 상단에서 **편집** 버튼을 찾아야 합니다.

<Image img={edit_button} alt="매개변수 그룹 편집" size="lg" border/>

다음 매개변수를 다음과 같이 설정해야 합니다:

1. `binlog_format`을 `ROW`로 설정합니다.

<Image img={binlog_format} alt="Binlog 형식을 ROW로 설정" size="lg" border/>

2. `binlog_row_metadata`를 `FULL`로 설정합니다.

<Image img={binlog_row_metadata} alt="Binlog 행 메타데이터를 FULL로 설정" size="lg" border/>

3. `binlog_row_image`를 `FULL`로 설정합니다.

<Image img={binlog_row_image} alt="Binlog 행 이미지를 FULL로 설정" size="lg" border/>

<br/>
그런 다음 오른쪽 상단의 **변경 사항 저장**을 클릭합니다. 변경 사항이 적용되도록 인스턴스를 재부팅해야 할 수 있으며, 이 경우 RDS 인스턴스의 **구성** 탭의 매개변수 그룹 링크 옆에 `Pending reboot`가 표시됩니다.

## GTID 모드 활성화 {#gtid-mode}

:::tip
MySQL ClickPipe는 GTID 모드 없이도 복제를 지원합니다. 그러나 GTID 모드를 활성화하는 것이 성능 향상과 문제 해결을 쉽게 하기 위해 권장됩니다.
:::

[전역 트랜잭션 식별자(GTIDs)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html)는 MySQL에서 각 커밋된 트랜잭션에 할당되는 고유 ID입니다. 이들은 바이너리 로그 복제를 간소화하고 문제 해결을 더 쉽게 만듭니다. 우리는 **GTID 모드를 활성화할 것을 권장**합니다. 이를 통해 MySQL ClickPipe가 GTID 기반 복제를 사용할 수 있습니다.

GTID 기반 복제는 Amazon RDS의 MySQL 5.7, 8.0 및 8.4 버전을 지원합니다. Aurora MySQL 인스턴스에서 GTID 모드를 활성화하려면 다음 단계를 따르세요:

1. RDS 콘솔에서 MySQL 인스턴스를 클릭합니다.
2. **구성** 탭을 클릭합니다.
3. 매개변수 그룹 링크를 클릭합니다.
4. 오른쪽 상단에 있는 **편집** 버튼을 클릭합니다.
5. `enforce_gtid_consistency`를 `ON`으로 설정합니다.
6. `gtid-mode`를 `ON`으로 설정합니다.
7. 오른쪽 상단의 **변경 사항 저장**을 클릭합니다.
8. 변경 사항을 적용하려면 인스턴스를 재부팅합니다.

<Image img={enable_gtid} alt="GTID 활성화됨" size="lg" border/>

<br/>
:::tip
MySQL ClickPipe는 GTID 모드 없이도 복제를 지원합니다. 그러나 GTID 모드를 활성화하는 것이 성능 향상과 문제 해결을 쉽게 하기 위해 권장됩니다.
:::

## 데이터베이스 사용자 구성 {#configure-database-user}

관리자 사용자로 RDS MySQL 인스턴스에 연결하고 다음 명령을 실행합니다:

1. ClickPipes를 위한 전용 사용자 생성:

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 스키마 권한 부여. 다음 예시는 `mysql` 데이터베이스에 대한 권한을 보여줍니다. 복제하려는 각 데이터베이스와 호스트에 대해 이 명령을 반복하세요:

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. 사용자에게 복제 권한 부여:

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

## 네트워크 액세스 구성 {#configure-network-access}

### IP 기반 접근 제어 {#ip-based-access-control}

Aurora MySQL 인스턴스에 대한 트래픽을 제한하려면 [문서화된 정적 NAT IP](../../index.md#list-of-static-ips)를 RDS 보안 그룹의 **수신 규칙**에 추가합니다.

<Image img={security_group_in_rds_mysql} alt="RDS MySQL에서 보안 그룹 찾는 방법" size="lg" border/>

<Image img={edit_inbound_rules} alt="위 보안 그룹에 대한 수신 규칙 편집" size="lg" border/>

### AWS PrivateLink를 통한 개인 접근 {#private-access-via-aws-privatelink}

프라이빗 네트워크를 통해 RDS 인스턴스에 연결하려면 AWS PrivateLink를 사용할 수 있습니다. 연결을 설정하려면 [ClickPipes용 AWS PrivateLink 설정 가이드](/knowledgebase/aws-privatelink-setup-for-clickpipes)를 따르세요.

## 다음 단계 {#next-steps}

이제 Amazon RDS MySQL 인스턴스가 binlog 복제를 위해 구성되고 ClickHouse Cloud에 안전하게 연결되었습니다. [첫 번째 MySQL ClickPipe 만들기](/integrations/clickpipes/mysql/#create-your-clickpipe)를 진행할 수 있습니다. MySQL CDC에 대한 일반적인 질문은 [MySQL FAQ 페이지](/integrations/data-ingestion/clickpipes/mysql/faq.md)를 참조하세요.
