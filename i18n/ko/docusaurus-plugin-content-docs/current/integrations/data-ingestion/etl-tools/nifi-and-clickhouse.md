---
sidebar_label: 'NiFi'
sidebar_position: 12
keywords: ['clickhouse', 'NiFi', 'connect', 'integrate', 'etl', 'data integration']
slug: /integrations/nifi
description: 'NiFi 데이터 파이프라인을 사용하여 ClickHouse로 데이터를 스트리밍합니다'
title: 'Apache NiFi를 ClickHouse에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
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

# Apache NiFi를 ClickHouse에 연결하기 \{#connect-apache-nifi-to-clickhouse\}

<CommunityMaintainedBadge />

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a>는 소프트웨어 시스템 간 데이터 흐름을 자동화하도록 설계된 오픈 소스 워크플로 관리 소프트웨어입니다. ETL 데이터 파이프라인을 생성할 수 있으며, 300개가 넘는 데이터 프로세서를 기본으로 제공합니다. 이 단계별 튜토리얼에서는 Apache NiFi를 ClickHouse의 데이터 소스와 목적지(destination)로 구성하고 샘플 데이터 세트를 로드하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">
  ## 연결 정보 수집하기 \{#1-gather-your-connection-details\}

  <ConnectionDetails />

  ## Apache NiFi 다운로드 및 실행 \{#2-download-and-run-apache-nifi\}

  새로운 설정을 위해 https://nifi.apache.org/download.html 에서 바이너리를 다운로드하고 `./bin/nifi.sh start`를 실행하여 시작하세요

  ## ClickHouse JDBC 드라이버 다운로드하기 \{#3-download-the-clickhouse-jdbc-driver\}

  1. GitHub에서 <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBC 드라이버 릴리스 페이지</a>를 방문하여 최신 JDBC 릴리스 버전을 확인하십시오
  2. 릴리스 버전에서 &quot;Show all xx assets&quot;를 클릭한 다음 &quot;shaded&quot; 또는 &quot;all&quot; 키워드를 포함한 JAR 파일을 찾습니다. 예를 들어 `clickhouse-jdbc-0.5.0-all.jar`입니다.
  3. JAR 파일을 Apache NiFi에서 액세스할 수 있는 폴더에 배치하고, 해당 절대 경로를 메모해 둡니다

  ## `DBCPConnectionPool` Controller Service 추가 및 속성 구성 \{#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties\}

  1. Apache NiFi에서 Controller Service를 구성하려면 「톱니바퀴」 버튼을 클릭하여 NiFi Flow Configuration 페이지로 이동합니다.

     <Image img={nifi01} size="sm" border alt="톱니바퀴 아이콘이 강조 표시된 NiFi Flow Configuration 페이지" />

  2. Controller Services 탭을 선택한 다음 오른쪽 상단의 `+` 버튼을 클릭하여 새 Controller Service를 추가합니다.

     <Image img={nifi02} size="lg" border alt="Controller Services 탭에서 추가 버튼이 강조된 화면" />

  3. `DBCPConnectionPool`을(를) 검색하고 &quot;Add&quot; 버튼을 클릭합니다

     <Image img={nifi03} size="lg" border alt="DBCPConnectionPool이 강조 표시된 컨트롤러 서비스 선택 대화 상자" />

  4. 새로 추가된 `DBCPConnectionPool`은 기본적으로 Invalid 상태로 생성됩니다. 설정을 시작하려면 &quot;gear&quot; 버튼을 클릭하십시오

     <Image img={nifi04} size="lg" border alt="Controller Services 목록에서 기어 버튼이 강조된 유효하지 않은 DBCPConnectionPool" />

  5. 「Properties」 섹션에서 다음 값을 입력합니다.

  | 속성                 | 값                                                                  | 비고                                 |
  | ------------------ | ------------------------------------------------------------------ | ---------------------------------- |
  | 데이터베이스 연결 URL      | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | 연결 URL의 HOSTNAME을 환경에 맞는 값으로 교체합니다 |
  | 데이터베이스 드라이버 클래스 이름 | com.clickhouse.jdbc.ClickHouseDriver                               |                                    |
  | 데이터베이스 드라이버 경로     | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBC 드라이버 JAR 파일의 절대 경로 |
  | 데이터베이스 사용자 이름      | default                                                            | ClickHouse 사용자 이름                  |
  | 비밀번호               | password                                                           | ClickHouse 비밀번호                    |

  6. Settings 섹션에서 Controller Service의 이름을 추후 쉽게 식별할 수 있도록 &quot;ClickHouse JDBC&quot;로 변경합니다.

     <Image img={nifi05} size="lg" border alt="속성이 입력된 DBCPConnectionPool 구성 대화 상자" />

  7. &quot;번개&quot; 모양 아이콘을 클릭한 다음 &quot;Enable&quot; 버튼을 클릭하여 `DBCPConnectionPool` Controller Service를 활성화합니다

     <Image img={nifi06} size="lg" border alt="번개 아이콘 버튼이 강조된 Controller Services 목록" />

     <br />

     <Image img={nifi07} size="lg" border alt="컨트롤러 서비스 활성화 확인 대화상자" />

  8. Controller Services 탭을 열어 Controller Service가 활성화되어 있는지 확인합니다

     <Image img={nifi08} size="lg" border alt="Controller Services 목록에서 활성화된 ClickHouse JDBC 서비스를 보여주는 화면" />

  ## `ExecuteSQL` 프로세서를 사용하여 테이블에서 데이터 읽기 \{#5-read-from-a-table-using-the-executesql-processor\}

  1. 적절한 업스트림 및 다운스트림 프로세서와 함께 `ExecuteSQL` 프로세서를 추가합니다

     <Image img={nifi09} size="md" border alt="워크플로 내 ExecuteSQL 프로세서가 표시된 NiFi 캔버스" />

  2. `ExecuteSQL` 프로세서의 「Properties」 섹션에서 다음 값을 입력합니다.

     | Property                            | Value                        | Remark                                       |
     | ----------------------------------- | ---------------------------- | -------------------------------------------- |
     | Database Connection Pooling Service | ClickHouse JDBC              | ClickHouse용으로 구성된 Controller Service를 선택하십시오 |
     | SQL select query                    | SELECT * FROM system.metrics | 여기에 쿼리를 입력하십시오                               |

  3. `ExecuteSQL` 프로세서를 시작하십시오

     <Image img={nifi10} size="lg" border alt="속성이 설정된 ExecuteSQL 프로세서 구성" />

  4. 쿼리가 성공적으로 처리되었는지 확인하려면 출력 큐에 있는 `FlowFile` 중 하나를 확인하십시오.

     <Image img={nifi11} size="lg" border alt="검사를 위해 준비된 FlowFile들이 표시된 큐 목록 대화 상자" />

  5. 보기 모드를 &quot;formatted&quot;로 전환하여 출력된 `FlowFile`의 결과를 확인합니다

     <Image img={nifi12} size="lg" border alt="서식 있는 뷰에서 쿼리 결과를 표시하는 FlowFile 콘텐츠 뷰어" />

  ## `MergeRecord` 및 `PutDatabaseRecord` 프로세서를 사용하여 테이블에 쓰기 \{#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor\}

  1. 단일 INSERT 문으로 여러 행을 삽입하려면, 먼저 여러 레코드를 하나의 레코드로 병합해야 합니다. 이는 `MergeRecord` 프로세서를 사용하여 수행할 수 있습니다.

  2. `MergeRecord` 프로세서의 「Properties」 섹션에서 다음 값을 입력합니다.

     | Property                  | Value               | Remark                                                                |
     | ------------------------- | ------------------- | --------------------------------------------------------------------- |
     | Record Reader             | `JSONTreeReader`    | 사용할 레코드 리더를 선택합니다                                                     |
     | Record Writer             | `JSONReadSetWriter` | 사용할 레코드 라이터를 선택합니다                                                    |
     | Minimum Number of Records | 1000                | 최소 행 수가 병합되어 하나의 레코드를 이루도록 더 큰 값으로 변경합니다. 기본값은 1행입니다                  |
     | Maximum Number of Records | 10000               | &quot;Minimum Number of Records&quot;보다 더 큰 값으로 변경합니다. 기본값은 1,000행입니다 |

  3. 여러 레코드가 하나로 병합되었는지 확인하려면 `MergeRecord` 프로세서의 입력과 출력을 확인하십시오. 출력은 여러 입력 레코드를 요소로 갖는 배열이라는 점에 유의하십시오.

     입력

     <Image img={nifi13} size="sm" border alt="단일 레코드가 표시된 MergeRecord 프로세서 입력" />

     출력

     <Image img={nifi14} size="sm" border alt="병합된 레코드 배열을 보여 주는 MergeRecord 프로세서의 출력" />

  4. `PutDatabaseRecord` 프로세서의 「Properties」 섹션에서 다음 값을 입력하십시오

     | 속성                                  | 값                | 비고                                                                                           |
     | ----------------------------------- | ---------------- | -------------------------------------------------------------------------------------------- |
     | Record Reader                       | `JSONTreeReader` | 적절한 record reader를 선택합니다                                                                     |
     | Database Type                       | Generic          | 기본값으로 둡니다                                                                                    |
     | Statement Type                      | INSERT           |                                                                                              |
     | Database Connection Pooling Service | ClickHouse JDBC  | ClickHouse controller service를 선택합니다                                                         |
     | Table Name                          | tbl              | 여기에서 테이블 이름을 입력합니다                                                                           |
     | Translate Field Names               | false            | 삽입되는 필드 이름이 컬럼 이름과 반드시 일치하도록 값은 &quot;false&quot;로 설정합니다                                     |
     | Maximum Batch Size                  | 1000             | 삽입당 최대 행 수입니다. 이 값은 `MergeRecord` 프로세서의 &quot;Minimum Number of Records&quot; 값보다 작지 않아야 합니다 |

  5. 각 insert 작업에 여러 행이 포함되는지 확인하려면, 테이블의 행 수가 `MergeRecord`에 정의된 「Minimum Number of Records」 값 이상씩 증가하는지 확인합니다.

     <Image img={nifi15} size="sm" border alt="대상 테이블의 행 수를 보여주는 쿼리 결과" />

  6. 축하합니다! Apache NiFi를 사용하여 ClickHouse에 데이터를 성공적으로 로드했습니다!
</VerticalStepper>