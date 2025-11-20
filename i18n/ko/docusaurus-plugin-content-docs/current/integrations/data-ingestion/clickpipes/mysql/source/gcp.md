---
'sidebar_label': 'Cloud SQL For MySQL'
'description': 'ClickPipes의 소스로서 Cloud SQL for MySQL을 설정하는 방법에 대한 단계별 가이드'
'slug': '/integrations/clickpipes/mysql/source/gcp'
'title': 'Cloud SQL for MySQL 소스 설정 가이드'
'keywords':
- 'google cloud sql'
- 'mysql'
- 'clickpipes'
- 'pitr'
- 'root ca certificate'
'doc_type': 'guide'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';


# Cloud SQL for MySQL 소스 설정 가이드

이 문서는 MySQL ClickPipe를 통해 데이터를 복제하기 위해 Cloud SQL for MySQL 인스턴스를 구성하는 방법에 대한 단계별 가이드입니다.

## 바이너리 로그 보존 활성화 {#enable-binlog-retention-gcp}
바이너리 로그는 MySQL 서버 인스턴스에서 수행된 데이터 수정에 대한 정보를 포함한 로그 파일 집합이며, 복제를 위해서는 바이너리 로그 파일이 필요합니다.

### PITR을 통한 바이너리 로깅 활성화 {#enable-binlog-logging-gcp}
PITR 기능은 Google Cloud에서 MySQL의 바이너리 로깅이 켜져 있는지 꺼져 있는지를 결정합니다. Cloud 콘솔에서 Cloud SQL 인스턴스를 편집하고 아래 섹션으로 스크롤하여 설정할 수 있습니다.

<Image img={gcp_pitr} alt="Cloud SQL에서 PITR 활성화" size="lg" border/>

복제 사용 사례에 따라 적절히 긴 값으로 설정하는 것이 좋습니다.

아직 구성하지 않았다면 Cloud SQL을 편집하여 데이터베이스 플래그 섹션에 다음을 설정해야 합니다:
1. `binlog_expire_logs_seconds`를 `86400` (1일) 이상의 값으로 설정합니다.
2. `binlog_row_metadata`를 `FULL`로 설정합니다.
3. `binlog_row_image`를 `FULL`로 설정합니다.

이를 수행하려면 인스턴스 개요 페이지의 오른쪽 상단 모서리에서 `Edit` 버튼을 클릭합니다.
<Image img={gcp_mysql_edit_button} alt="GCP MySQL의 편집 버튼" size="lg" border/>

그런 다음 `Flags` 섹션으로 스크롤하여 위의 플래그를 추가합니다.

<Image img={gcp_mysql_flags} alt="GCP에서 binlog 플래그 설정" size="lg" border/>

## 데이터베이스 사용자 구성 {#configure-database-user-gcp}

Cloud SQL MySQL 인스턴스에 root 사용자로 연결하고 다음 명령을 실행합니다:

1. ClickPipes를 위한 전용 사용자 생성:

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 스키마 권한 부여. 다음 예시는 `clickpipes` 데이터베이스에 대한 권한을 보여줍니다. 복제하려는 각 데이터베이스와 호스트에 대해 이 명령을 반복합니다:

```sql
GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
```

3. 사용자에게 복제 권한 부여:

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

## 네트워크 액세스 구성 {#configure-network-access-gcp-mysql}

Cloud SQL 인스턴스로의 트래픽을 제한하고 싶다면 [문서화된 정적 NAT IPs](../../index.md#list-of-static-ips)를 Cloud SQL MySQL 인스턴스의 허용된 IPs에 추가해 주세요.
이 작업은 인스턴스를 편집하거나 Cloud 콘솔의 사이드바에서 `Connections` 탭으로 이동하여 수행할 수 있습니다.

<Image img={gcp_mysql_ip} alt="GCP MySQL의 IP 허용 목록" size="lg" border/>

## 루트 CA 인증서 다운로드 및 사용 {#download-root-ca-certificate-gcp-mysql}
Cloud SQL 인스턴스에 연결하려면 루트 CA 인증서를 다운로드해야 합니다.

1. Cloud 콘솔에서 Cloud SQL 인스턴스에 접속합니다.
2. 사이드바에서 `Connections`를 클릭합니다.
3. `Security` 탭을 클릭합니다.
4. `Manage server CA certificates` 섹션에서 하단의 `DOWNLOAD CERTIFICATES` 버튼을 클릭합니다.

<Image img={gcp_mysql_cert} alt="GCP MySQL 인증서 다운로드" size="lg" border/>

5. ClickPipes UI에서 새 MySQL ClickPipe를 생성할 때 다운로드한 인증서를 업로드합니다.

<Image img={rootca} alt="GCP MySQL 인증서 사용" size="lg" border/>
