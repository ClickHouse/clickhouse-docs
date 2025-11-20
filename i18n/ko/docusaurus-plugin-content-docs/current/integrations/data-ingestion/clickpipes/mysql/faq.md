---
'sidebar_label': 'FAQ'
'description': 'MySQL에 대한 ClickPipes에 대한 자주 묻는 질문.'
'slug': '/integrations/clickpipes/mysql/faq'
'sidebar_position': 2
'title': 'ClickPipes for MySQL FAQ'
'doc_type': 'reference'
'keywords':
- 'MySQL ClickPipes FAQ'
- 'ClickPipes MySQL troubleshooting'
- 'MySQL ClickHouse replication'
- 'ClickPipes MySQL support'
- 'MySQL CDC ClickHouse'
---


# ClickPipes for MySQL FAQ

### MySQL ClickPipe는 MariaDB를 지원합니까? {#does-the-clickpipe-support-mariadb}
예, MySQL ClickPipe는 MariaDB 10.0 이상을 지원합니다. 그것의 구성은 MySQL과 매우 유사하며, 기본적으로 GTID 복제를 사용합니다.

### MySQL ClickPipe는 PlanetScale, Vitess, 또는 TiDB를 지원합니까? {#does-the-clickpipe-support-planetscale-vitess}
아니요, 이들은 MySQL의 binlog API를 지원하지 않습니다.

### 복제는 어떻게 관리됩니까? {#how-is-replication-managed}
우리는 `GTID` 및 `FilePos` 복제를 모두 지원합니다. Postgres와 달리 오프셋을 관리할 슬롯이 없습니다. 대신, MySQL 서버의 binlog 유지 기간이 충분하도록 구성해야 합니다. binlog에서 우리의 오프셋이 무효화되면 *(예: 미러가 너무 오랫동안 일시 중지되거나, `FilePos` 복제를 사용하는 동안 데이터베이스 장애 조치가 발생하는 경우)* 파이프를 다시 동기화해야 합니다. 비효율적인 쿼리는 수집 속도를 저하시켜 유지 기간을 초과할 수 있으므로, 목적지 테이블에 따라 물리화된 뷰를 최적화해야 합니다.

비활성 데이터베이스가 ClickPipes가 더 최신 오프셋으로 진행하는 것을 허용하지 않고 로그 파일을 회전시키는 것도 가능합니다. 정기적으로 업데이트되는 하트비트 테이블을 설정해야 할 수 있습니다.

초기 로드 시작 시, 시작할 binlog 오프셋을 기록합니다. 이 오프셋은 초기 로드가 완료될 때 여전히 유효해야 CDC가 진행됩니다. 많은 데이터를 수집할 경우 적절한 binlog 유지 기간을 구성해야 합니다. 테이블을 설정할 때, 고급 설정에서 큰 테이블에 대해 *초기 로드를 위한 사용자 지정 파티셔닝 키 사용*을 구성하여 한 테이블을 병렬로 로드할 수 있도록 하면 초기 로드를 가속화할 수 있습니다.

### MySQL에 연결할 때 TLS 인증서 검증 오류가 발생하는 이유는 무엇입니까? {#tls-certificate-validation-error}

MySQL에 연결할 때 `x509: certificate is not valid for any names` 또는 `x509: certificate signed by unknown authority`와 같은 인증서 오류가 발생할 수 있습니다. 이는 ClickPipes가 기본적으로 TLS 암호화를 활성화하기 때문입니다.

이 문제를 해결하기 위한 몇 가지 옵션이 있습니다:

1. **TLS 호스트 필드 설정** - 연결 시 호스트 이름이 인증서와 다를 경우 (AWS PrivateLink를 통해 Endpoint Service에서 일반적임) "TLS 호스트 (선택 사항)"를 인증서의 일반 이름(CN) 또는 주체 대체 이름(SAN)과 일치하도록 설정합니다.

2. **루트 CA 업로드** - 내부 인증 기관 또는 Google Cloud SQL의 기본 인스턴스별 CA 구성에서 사용하는 MySQL 서버의 경우. Google Cloud SQL 인증서에 접근하는 방법에 대한 자세한 내용은 [이 섹션](https://clickhouse.com/docs/integrations/clickpipes/mysql/source/gcp#download-root-ca-certificate-gcp-mysql)을 참조하세요.

3. **서버 인증서 구성** - 연결 호스트 이름을 모두 포함하도록 서버의 SSL 인증서를 업데이트하고 신뢰할 수 있는 인증 기관을 사용합니다.

4. **인증서 검증 생략** - 기본 구성에서 유효성을 검증할 수 없는 자체 서명된 인증서를 제공하는 자체 호스팅 MySQL 또는 MariaDB의 경우 ([MySQL](https://dev.mysql.com/doc/refman/8.4/en/creating-ssl-rsa-files-using-mysql.html#creating-ssl-rsa-files-using-mysql-automatic), [MariaDB](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-tls-for-mariadb-server)). 이 인증서에 의존하여 전송 중인 데이터를 암호화하지만 서버 가장의 위험이 있습니다. 프로덕션 환경에서는 올바르게 서명된 인증서를 권장하지만, 일회성 인스턴스에서 테스트하거나 레거시 인프라에 연결할 때 유용합니다.

### 스키마 변경을 지원합니까? {#do-you-support-schema-changes}

자세한 정보는 [ClickPipes for MySQL: 스키마 변경 전파 지원](./schema-changes) 페이지를 참조하세요.

### MySQL 외래 키 연쇄 삭제 `ON DELETE CASCADE`를 복제하는 것을 지원합니까? {#support-on-delete-cascade}

MySQL이 [연쇄 삭제를 처리하는 방법](https://dev.mysql.com/doc/refman/8.0/en/innodb-and-mysql-replication.html) 때문에, 이는 binlog에 기록되지 않습니다. 따라서 ClickPipes (또는 어떤 CDC 도구)도 이를 복제할 수 없습니다. 이는 일관되지 않은 데이터로 이어질 수 있습니다. 연쇄 삭제를 지원하기 위해 트리거를 사용하는 것이 좋습니다.

### 점이 포함된 내 테이블을 복제할 수 없는 이유는 무엇입니까? {#replicate-table-dot}
현재 PeerDB는 소스 테이블 식별자에 점이 있는 경우 - 즉, 스키마 이름 또는 테이블 이름 - 복제를 지원하지 않는 제한이 있습니다. 이는 PeerDB가 이 경우 스키마와 테이블을 구분할 수 없기 때문입니다. 이 제한을 우회하기 위해 스키마와 테이블을 별도로 입력할 수 있도록 지원하기 위한 노력이 진행되고 있습니다.
