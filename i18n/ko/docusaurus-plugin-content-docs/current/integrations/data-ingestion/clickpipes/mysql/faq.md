---
sidebar_label: 'FAQ'
description: 'ClickPipes for MySQL에 대한 자주 묻는 질문.'
slug: /integrations/clickpipes/mysql/faq
sidebar_position: 2
title: 'ClickPipes for MySQL 자주 묻는 질문'
doc_type: 'reference'
keywords: ['MySQL ClickPipes 자주 묻는 질문', 'ClickPipes MySQL 문제 해결', 'MySQL ClickHouse 복제', 'ClickPipes MySQL 지원', 'MySQL CDC ClickHouse']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MySQL용 ClickPipes 자주 묻는 질문 \{#clickpipes-for-mysql-faq\}

### MySQL ClickPipe는 MariaDB를 지원합니까? \{#does-the-clickpipe-support-mariadb\}

예, MySQL ClickPipe는 MariaDB 10.0 이상 버전을 지원합니다. 구성은 MySQL과 매우 유사하며, 기본적으로 GTID 복제를 사용합니다.

### MySQL ClickPipe는 PlanetScale, Vitess 또는 TiDB를 지원합니까? \{#does-the-clickpipe-support-planetscale-vitess\}

아니요. 이들 시스템은 MySQL binlog API를 지원하지 않습니다.

### 복제는 어떻게 관리되나요? \{#how-is-replication-managed\}

`GTID`와 `FilePos` 복제를 모두 지원합니다. Postgres와 달리 오프셋을 관리하는 슬롯이 없습니다. 대신 MySQL 서버에서 충분한 binlog 보존 기간을 설정해야 합니다. binlog에 대한 오프셋이 *(예: 미러가 너무 오래 중지되었거나, `FilePos` 복제를 사용하는 동안 데이터베이스 장애 조치가 발생한 경우)* 더 이상 유효하지 않게 되면 파이프를 다시 동기화해야 합니다. 대상 테이블에 따라 materialized view를 최적화해야 하며, 비효율적인 쿼리는 수집 속도를 저하시켜 보존 기간을 따라가지 못하게 만들 수 있습니다.

데이터베이스에 트래픽이 거의 없어 ClickPipes가 더 최신 오프셋으로 진행하지 못하는 상황에서도 로그 파일이 로테이션될 수 있습니다. 이 경우 정기적으로 업데이트되는 하트비트 테이블을 설정해야 할 수 있습니다.

초기 로드 시작 시 시작 지점으로 사용할 binlog 오프셋을 기록합니다. CDC가 진행되려면 이 오프셋이 초기 로드가 완료될 때까지 여전히 유효해야 합니다. 대량의 데이터를 수집하는 경우 적절한 binlog 보존 기간을 반드시 설정해야 합니다. 테이블을 설정하는 동안, 고급 설정에서 대용량 테이블에 대해 *Use a custom partitioning key for initial load* 옵션을 구성하여 단일 테이블을 병렬로 로드할 수 있도록 하면 초기 로드를 가속화할 수 있습니다.

### MySQL에 연결할 때 TLS 인증서 검증 오류가 발생하는 이유는 무엇입니까? \{#tls-certificate-validation-error\}

MySQL에 연결할 때 `x509: certificate is not valid for any names` 또는 `x509: certificate signed by unknown authority`와 같은 인증서 오류가 발생할 수 있습니다. 이는 ClickPipes에서 기본적으로 TLS 암호화를 활성화하기 때문에 발생합니다.

이 문제를 해결하는 방법은 다음과 같습니다.

1. **TLS Host 필드 설정** - 연결에 사용한 호스트 이름이 인증서에 있는 이름과 다를 때 사용합니다(AWS PrivateLink를 Endpoint Service와 함께 사용할 때 흔히 발생). 인증서의 Common Name(CN) 또는 Subject Alternative Name(SAN)과 일치하도록 "TLS Host (optional)" 값을 설정하십시오.

2. **Root CA 업로드** - 내부 Certificate Authority를 사용하거나, 인스턴스별 기본 CA 구성이 설정된 Google Cloud SQL의 MySQL 서버에 해당합니다. Google Cloud SQL 인증서에 접근하는 방법에 대한 자세한 내용은 [이 섹션](https://clickhouse.com/docs/integrations/clickpipes/mysql/source/gcp#download-root-ca-certificate-gcp-mysql)을 참조하십시오.

3. **서버 인증서 구성** - 서버의 SSL 인증서를 업데이트하여 모든 연결 호스트 이름을 포함하도록 하고, 신뢰할 수 있는 Certificate Authority를 사용하도록 구성하십시오.

4. **인증서 검증 건너뛰기** - 기본 설정에서 검증할 수 없는 self-signed 인증서를 프로비저닝하는 self-hosted MySQL 또는 MariaDB에 해당합니다([MySQL](https://dev.mysql.com/doc/refman/8.4/en/creating-ssl-rsa-files-using-mysql.html#creating-ssl-rsa-files-using-mysql-automatic), [MariaDB](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-tls-for-mariadb-server)). 이 인증서에 의존하면 전송 중인 데이터는 암호화되지만 서버가 위장될 위험이 있습니다. 운영 환경에서는 적절하게 서명된 인증서를 사용할 것을 권장하며, 이 옵션은 단발성 인스턴스에서 테스트하거나 레거시 인프라에 연결할 때 유용합니다.

### 스키마 변경을 지원하나요? \{#do-you-support-schema-changes\}

자세한 내용은 [ClickPipes for MySQL: Schema Changes Propagation Support](./schema-changes) 페이지에서 확인하십시오.

### MySQL 외래 키의 연쇄 삭제(`ON DELETE CASCADE`) 복제를 지원하나요? \{#support-on-delete-cascade\}

MySQL이 [연쇄 삭제를 처리하는 방식](https://dev.mysql.com/doc/refman/8.0/en/innodb-and-mysql-replication.html) 때문에 해당 작업은 binlog에 기록되지 않습니다. 따라서 ClickPipes(또는 어떤 CDC 도구도) 이 동작을 복제할 수 없습니다. 이로 인해 데이터 불일치가 발생할 수 있습니다. 연쇄 삭제를 지원해야 하는 경우, 대신 트리거를 사용하는 것이 좋습니다.

### 테이블 이름에 점(.)이 있으면 왜 복제할 수 없습니까? \{#replicate-table-dot\}

현재 PeerDB에는 소스 테이블 식별자(스키마 이름 또는 테이블 이름)에 점(.)이 포함된 경우 복제를 지원하지 않는 제한이 있습니다. PeerDB는 점을 기준으로 분리해 스키마와 테이블을 구분하는데, 이런 경우 어느 부분이 스키마이고 어느 부분이 테이블인지 판별할 수 없습니다.
이 제한을 해결하기 위해 스키마와 테이블을 별도로 입력할 수 있도록 지원하는 작업이 진행 중입니다.

### 초기에 복제에서 제외했던 컬럼을 나중에 포함할 수 있습니까? \{#include-excluded-columns\}

아직 지원되지 않습니다. 대신 포함하려는 컬럼이 있는 테이블을 [다시 동기화](./table_resync.md)하십시오.