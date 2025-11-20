---
'sidebar_label': 'Amazon RDS MariaDB'
'description': 'Amazon RDS MariaDB를 ClickPipes의 소스로 설정하는 방법에 대한 단계별 가이드'
'slug': '/integrations/clickpipes/mysql/source/rds_maria'
'title': 'RDS MariaDB 소스 설정 가이드'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mysql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
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


# RDS MariaDB 소스 설정 가이드

이것은 MySQL ClickPipe를 통해 데이터를 복제하기 위해 RDS MariaDB 인스턴스를 구성하는 단계별 안내서입니다.
<br/>
:::info
MySQL FAQ를 [여기](/integrations/data-ingestion/clickpipes/mysql/faq.md)에서 확인하는 것도 추천합니다. FAQ 페이지는 적극적으로 업데이트 되고 있습니다.
:::

## 바이너리 로그 보존 활성화 {#enable-binlog-retention-rds}
바이너리 로그는 MySQL 서버 인스턴스에 대한 데이터 수정 정보가 포함된 로그 파일 집합입니다. 바이너리 로그 파일은 복제에 필요합니다. 아래의 두 단계는 반드시 따라야 합니다:

### 1. 자동 백업을 통한 바이너리 로깅 활성화 {#enable-binlog-logging-rds}

자동 백업 기능은 MySQL에 대해 바이너리 로깅이 켜져 있는지 꺼져 있는지를 결정합니다. AWS 콘솔에서 설정할 수 있습니다:

<Image img={rds_backups} alt="RDS에서 자동 백업 활성화" size="lg" border/>

복제 사용 사례에 따라 백업 보존 기간을 적절히 긴 값으로 설정하는 것이 좋습니다.

### 2. 바이너리 로그 보존 시간 {#binlog-retention-hours-rds}
Amazon RDS for MariaDB는 바이너리 로그 보존 기간을 설정하는 방법이 다르며, 이는 변경사항이 포함된 바이너리 로그 파일이 보관되는 기간을 의미합니다. 바이너리 로그 파일이 제거되기 전에 일부 변경사항이 읽히지 않으면 복제를 계속할 수 없습니다. 바이너리 로그 보존 시간의 기본 값은 NULL이며, 이는 바이너리 로그가 보존되지 않음을 의미합니다.

DB 인스턴스에서 바이너리 로그를 보존할 시간을 지정하려면, mysql.rds_set_configuration 함수를 사용하여 복제가 발생하는 데 충분한 바이너리 로그 보존 기간을 설정하십시오. `24시간`이 권장되는 최소값입니다.

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## 파라미터 그룹에서 바이너리 로그 설정 구성 {#binlog-parameter-group-rds}

파라미터 그룹은 RDS 콘솔에서 MariaDB 인스턴스를 클릭한 후 `구성` 탭으로 이동하면 찾을 수 있습니다.

<Image img={rds_config} alt="RDS에서 파라미터 그룹을 찾는 위치" size="lg" border/>

파라미터 그룹 링크를 클릭하면 파라미터 그룹 링크 페이지로 이동하게 됩니다. 상단 오른쪽에 '편집' 버튼이 보입니다:

<Image img={edit_button} alt="파라미터 그룹 편집" size="lg" border/>

`binlog_format`, `binlog_row_metadata`, 및 `binlog_row_image` 설정은 다음과 같이 설정해야 합니다:

1. `binlog_format`을 `ROW`로 설정합니다.

<Image img={binlog_format} alt="Binlog format을 ROW로 설정" size="lg" border/>

2. `binlog_row_metadata`를 `FULL`로 설정합니다.

<Image img={binlog_row_metadata} alt="Binlog row metadata를 FULL로 설정" size="lg" border/>

3. `binlog_row_image`를 `FULL`로 설정합니다.

<Image img={binlog_row_image} alt="Binlog row image를 FULL로 설정" size="lg" border/>

다음으로, 상단 오른쪽의 `변경사항 저장`을 클릭하세요. 변경 사항을 적용하려면 인스턴스를 재부팅해야 할 수도 있습니다. RDS 인스턴스의 구성 탭에서 파라미터 그룹 링크 옆에 `보류 중인 재부팅`이 표시되면 인스턴스를 재부팅해야 한다는 좋은 징후입니다.

<br/>
:::tip
MariaDB 클러스터가 있는 경우, 위의 파라미터는 [DB 클러스터](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 파라미터 그룹에서 찾을 수 있으며, DB 인스턴스 그룹에서는 찾을 수 없습니다.
:::

## GTID 모드 활성화 {#gtid-mode-rds}
전역 트랜잭션 식별자(GTID)는 MySQL/MariaDB에서 각 커밋된 트랜잭션에 할당된 고유 ID입니다. 이는 바이너리 로그 복제를 간소화하고 문제 해결을 더 쉽게 만듭니다. MariaDB는 기본적으로 GTID 모드를 활성화하므로 사용하기 위해 사용자의 조치가 필요하지 않습니다.

## 데이터베이스 사용자 구성 {#configure-database-user-rds}

관리자 사용자로 RDS MariaDB 인스턴스에 연결하고 다음 명령을 실행합니다:

1. ClickPipes를 위한 전용 사용자를 생성합니다:

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 스키마 권한을 부여합니다. 다음 예제는 `mysql` 데이터베이스의 권한을 보여줍니다. 복제하려는 각 데이터베이스와 호스트에 대해 이러한 명령을 반복합니다:

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. 사용자에게 복제 권한을 부여합니다:
