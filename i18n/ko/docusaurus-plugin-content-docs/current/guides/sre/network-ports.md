---
'slug': '/guides/sre/network-ports'
'sidebar_label': '네트워크 포트'
'title': '네트워크 포트'
'description': '사용 가능한 네트워크 포트에 대한 설명과 그 용도'
'doc_type': 'reference'
'keywords':
- 'network'
- 'ports'
- 'configuration'
- 'security'
- 'firewall'
---


# 네트워크 포트

:::note
**기본**으로 설명된 포트는 포트 번호가 `/etc/clickhouse-server/config.xml`에 구성되어 있음을 의미합니다. 설정을 사용자 지정하려면 `/etc/clickhouse-server/config.d/`에 파일을 추가하십시오. [구성 파일](/operations/configuration-files) 문서를 참조하십시오.
:::

|포트|설명|클라우드|OSS|
|----|-----------|-----|---|
|2181|ZooKeeper 기본 서비스 포트. **참고: ClickHouse Keeper의 경우 `9181`을 참조하십시오**||✓|
|8123|HTTP 기본 포트||✓|
|8443|HTTP SSL/TLS 기본 포트|✓|✓|
|9000|네이티브 프로토콜 포트 (ClickHouse TCP 프로토콜이라고도 함). `clickhouse-server`, `clickhouse-client`, 및 네이티브 ClickHouse 도구와 같은 ClickHouse 애플리케이션 및 프로세스에서 사용됩니다. 분산 쿼리의 서버 간 통신에 사용됩니다.||✓|
|9004|MySQL 에뮬레이션 포트||✓|
|9005|PostgreSQL 에뮬레이션 포트 (ClickHouse에 SSL이 활성화된 경우 보안 통신에도 사용됨).||✓|
|9009|저수준 데이터 액세스를 위한 서버 간 통신 포트. 데이터 교환, 복제 및 서버 간 통신에 사용됩니다.||✓|
|9010|서버 간 통신을 위한 SSL/TLS||✓|
|9011|네이티브 프로토콜 PROXYv1 프로토콜 포트||✓|
|9019|JDBC 브리지||✓|
|9100|gRPC 포트||✓|
|9181|권장 ClickHouse Keeper 포트||✓|
|9234|권장 ClickHouse Keeper Raft 포트 (또한 `<secure>1</secure>`가 활성화된 경우 보안 통신에 사용됨)||✓|
|9363|Prometheus 기본 메트릭 포트||✓|
|9281|권장 보안 SSL ClickHouse Keeper 포트||✓|
|9440|네이티브 프로토콜 SSL/TLS 포트|✓|✓|
|42000|Graphite 기본 포트||✓|
