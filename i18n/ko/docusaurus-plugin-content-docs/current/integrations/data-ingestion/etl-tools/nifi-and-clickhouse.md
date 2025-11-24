---
'sidebar_label': 'NiFi'
'sidebar_position': 12
'keywords':
- 'clickhouse'
- 'NiFi'
- 'connect'
- 'integrate'
- 'etl'
- 'data integration'
'slug': '/integrations/nifi'
'description': 'NiFi 데이터 파이프라인을 사용하여 ClickHouse로 데이터 스트리밍하기'
'title': 'Apache NiFi를 ClickHouse에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'community'
- 'category': 'data_ingestion'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import nifi01 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_01.png';
import nifi02 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_02.png';
import nifi03 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_03.png';
import nifi04 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_04.png';
import nifi05 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_05.png';
import nifi06 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_06.png';
import nifi07 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_07.png';
import nifi08 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_08.png';
import nifi09 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_09.png';
import nifi10 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_10.png';
import nifi11 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_11.png';
import nifi12 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_12.png';
import nifi13 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_13.png';
import nifi14 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_14.png';
import nifi15 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_15.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Apache NiFi를 ClickHouse에 연결하기

<CommunityMaintainedBadge/>

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a>는 소프트웨어 시스템 간의 데이터 흐름을 자동화하기 위해 설계된 오픈 소스 워크플로 관리 소프트웨어입니다. ETL 데이터 파이프라인을 생성할 수 있으며, 300개 이상의 데이터 프로세서를 포함하여 제공됩니다. 이 단계별 튜토리얼은 Apache NiFi를 ClickHouse에 소스 및 대상 모두로 연결하고 샘플 데이터셋을 로드하는 방법을 보여줍니다.

<VerticalStepper headerLevel="h2">

## 연결 세부정보 수집 {#1-gather-your-connection-details}

<ConnectionDetails />

## Apache NiFi 다운로드 및 실행 {#2-download-and-run-apache-nifi}

새 설치를 위해 https://nifi.apache.org/download.html 에서 바이너리를 다운로드하고 `./bin/nifi.sh start`를 실행하여 시작합니다.

## ClickHouse JDBC 드라이버 다운로드 {#3-download-the-clickhouse-jdbc-driver}

1. GitHub에서 <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBC 드라이버 릴리스 페이지</a>를 방문하고 최신 JDBC 릴리스 버전을 찾습니다.
2. 릴리스 버전에서 "모든 xx 자산 표시"를 클릭하고 "shaded" 또는 "all"이라는 키워드가 포함된 JAR 파일을 찾습니다. 예를 들어, `clickhouse-jdbc-0.5.0-all.jar`.
3. JAR 파일을 Apache NiFi가 접근할 수 있는 폴더에 두고 절대 경로를 기록해 둡니다.

## `DBCPConnectionPool` 컨트롤러 서비스 추가 및 속성 구성 {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. Apache NiFi에서 컨트롤러 서비스를 구성하려면 "기어" 버튼을 클릭하여 NiFi 흐름 구성 페이지로 이동합니다.

    <Image img={nifi01} size="sm" border alt="NiFi Flow Configuration page with gear button highlighted" />

2. 컨트롤러 서비스 탭을 선택하고 오른쪽 상단의 `+` 버튼을 클릭하여 새 컨트롤러 서비스를 추가합니다.

    <Image img={nifi02} size="lg" border alt="Controller Services tab with add button highlighted" />

3. `DBCPConnectionPool`을 검색하고 "추가" 버튼을 클릭합니다.

    <Image img={nifi03} size="lg" border alt="Controller Service selection dialog with DBCPConnectionPool highlighted" />

4. 새로 추가된 `DBCPConnectionPool`은 기본적으로 유효하지 않은 상태입니다. "기어" 버튼을 클릭하여 구성을 시작합니다.

    <Image img={nifi04} size="lg" border alt="Controller Services list showing invalid DBCPConnectionPool with gear button highlighted" />

5. "속성" 섹션에서 다음 값을 입력합니다.

  | 속성                          | 값                                                               | 비고                                                   |
  |-------------------------------|------------------------------------------------------------------|------------------------------------------------------|
  | 데이터베이스 연결 URL        | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                   | 연결 URL에서 HOSTNAME을 적절히 변경합니다.          |
  | 데이터베이스 드라이버 클래스 이름 | com.clickhouse.jdbc.ClickHouseDriver                             ||
  | 데이터베이스 드라이버 위치    | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBC 드라이버 JAR 파일의 절대 경로입니다.  |
  | 데이터베이스 사용자          | default                                                          | ClickHouse 사용자 이름                               |
  | 비밀번호                     | password                                                         | ClickHouse 비밀번호                                   |

6. 설정 섹션에서 컨트롤러 서비스의 이름을 "ClickHouse JDBC"로 변경하여 쉽게 참조합니다.

    <Image img={nifi05} size="lg" border alt="DBCPConnectionPool configuration dialog showing properties filled in" />

7. "번개" 버튼을 클릭한 다음 "사용" 버튼을 클릭하여 `DBCPConnectionPool` 컨트롤러 서비스를 활성화합니다.

    <Image img={nifi06} size="lg" border alt="Controller Services list with lightning button highlighted" />

    <br/>

    <Image img={nifi07} size="lg" border alt="Enable Controller Service confirmation dialog" />

8. 컨트롤러 서비스 탭에서 컨트롤러 서비스가 활성화되었는지 확인합니다.

    <Image img={nifi08} size="lg" border alt="Controller Services list showing enabled ClickHouse JDBC service" />

## `ExecuteSQL` 프로세서를 사용하여 테이블에서 읽기 {#5-read-from-a-table-using-the-executesql-processor}

1. 적절한 업스트림 및 다운스트림 프로세서와 함께 `ExecuteSQL` 프로세서를 추가합니다.

    <Image img={nifi09} size="md" border alt="NiFi canvas showing ExecuteSQL processor in a workflow" />

2. `ExecuteSQL` 프로세서의 "속성" 섹션에서 다음 값을 입력합니다.

    | 속성                            | 값                            | 비고                                                     |
    |-----------------------------------|--------------------------------|----------------------------------------------------------|
    | 데이터베이스 연결 풀 서비스     | ClickHouse JDBC               | ClickHouse에 구성된 컨트롤러 서비스 선택                 |
    | SQL 선택 쿼리                   | SELECT * FROM system.metrics    | 쿼리를 여기 입력합니다.                                   |

3. `ExecuteSQL` 프로세서를 시작합니다.

    <Image img={nifi10} size="lg" border alt="ExecuteSQL processor configuration with properties filled in" />

4. 쿼리가 성공적으로 처리되었는지 확인하기 위해 출력 큐의 `FlowFile` 중 하나를 검사합니다.

    <Image img={nifi11} size="lg" border alt="List queue dialog showing flowfiles ready for inspection" />

5. 결과를 보기 위해 "형식화"로 전환하여 출력 `FlowFile`의 결과를 확인합니다.

    <Image img={nifi12} size="lg" border alt="FlowFile content viewer showing query results in formatted view" />

## `MergeRecord` 및 `PutDatabaseRecord` 프로세서를 사용하여 테이블에 쓰기 {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. 단일 삽입에서 여러 행을 쓰기 위해, 여러 레코드를 단일 레코드로 병합해야 합니다. 이는 `MergeRecord` 프로세서를 사용하여 수행할 수 있습니다.

2. `MergeRecord` 프로세서의 "속성" 섹션에서 다음 값을 입력합니다.

    | 속성                       | 값                   | 비고                                                                                                         |
    |----------------------------|----------------------|--------------------------------------------------------------------------------------------------------------|
    | 레코드 리더                | `JSONTreeReader`       | 적절한 레코드 리더 선택                                                                                      |
    | 레코드 라이터              | `JSONReadSetWriter`    | 적절한 레코드 라이터 선택                                                                                   |
    | 최소 레코드 수             | 1000                  | 단일 레코드를 형성하기 위해 병합되는 최소 행 수를 높이기 위해 이 값을 높입니다. 기본값 1행                  |
    | 최대 레코드 수             | 10000                 | "최소 레코드 수"보다 높은 숫자로 변경합니다. 기본값 1,000행                                               |

3. 여러 레코드가 하나로 병합되었는지 확인하기 위해 `MergeRecord` 프로세서의 입력과 출력을 검사합니다. 출력은 여러 입력 레코드의 배열입니다.

    입력
    <Image img={nifi13} size="sm" border alt="MergeRecord processor input showing single records" />

    출력
    <Image img={nifi14} size="sm" border alt="MergeRecord processor output showing merged array of records" />

4. `PutDatabaseRecord` 프로세서의 "속성" 섹션에서 다음 값을 입력합니다.

    | 속성                            | 값             | 비고                                                                                                            |
    |----------------------------------|----------------|-----------------------------------------------------------------------------------------------------------------|
    | 레코드 리더                       | `JSONTreeReader` | 적절한 레코드 리더 선택                                                                                          |
    | 데이터베이스 유형                | Generic         | 기본값 유지                                                                                                     |
    | 문(statement) 유형                | INSERT          |                                                                                                                 |
    | 데이터베이스 연결 풀 서비스       | ClickHouse JDBC  | ClickHouse 컨트롤러 서비스 선택                                                                                  |
    | 테이블 이름                      | tbl              | 여기서 테이블 이름을 입력합니다.                                                                                |
    | 필드 이름 변환                  | false           | 필드 이름이 삽입된 컬럼 이름과 일치하도록 "false"로 설정합니다.                                             |
    | 최대 배치 크기                  | 1000           | 삽입당 최대 행 수. 이 값은 `MergeRecord` 프로세서에서 "최소 레코드 수"의 값보다 낮아서는 안 됩니다. |

5. 각 삽입이 여러 행을 포함하는지 확인하려면 테이블의 행 수가 `MergeRecord`에서 정의된 "최소 레코드 수"의 값만큼 증가하고 있는지 확인합니다.

    <Image img={nifi15} size="sm" border alt="Query results showing row count in the destination table" />

6. 축하합니다 - Apache NiFi를 사용하여 ClickHouse에 데이터를 성공적으로 로드했습니다!

</VerticalStepper>
