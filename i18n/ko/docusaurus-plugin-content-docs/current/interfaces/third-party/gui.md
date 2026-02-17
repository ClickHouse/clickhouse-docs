---
description: 'ClickHouse 작업을 위한 타사 GUI 도구 및 애플리케이션 목록'
sidebar_label: '시각적 인터페이스'
sidebar_position: 28
slug: /interfaces/third-party/gui
title: '타사 개발자가 제공하는 시각적 인터페이스'
doc_type: 'reference'
---

# 타사 개발자가 제공하는 시각화 인터페이스 \{#visual-interfaces-from-third-party-developers\}

## 오픈 소스 \{#open-source\}

### agx \{#agx\}

[agx](https://github.com/agnosticeng/agx)는 Tauri와 SvelteKit으로 제작된 데스크톱 애플리케이션으로, ClickHouse의 내장 데이터베이스 엔진(chdb)을 사용하여 데이터를 탐색하고 쿼리할 수 있는 현대적인 인터페이스를 제공합니다.

- 네이티브 애플리케이션을 실행할 때 chdb를 활용합니다.
- 웹 인스턴스를 실행할 때 ClickHouse 인스턴스에 연결할 수 있습니다.
- Monaco Editor를 사용하여 익숙한 편집 환경을 제공합니다.
- 다양한 데이터 시각화 기능을 제공하며 지속적으로 발전합니다.

### ch-ui \{#ch-ui\}

[ch-ui](https://github.com/caioricciuti/ch-ui)는 ClickHouse 데이터베이스용으로 설계된 간단한 React.js 기반 인터페이스로, 쿼리를 실행하고 데이터를 시각화하는 데 사용됩니다. React와 웹용 ClickHouse 클라이언트를 기반으로 구축되어 세련되고 사용하기 쉬운 UI를 제공하여 데이터베이스를 손쉽게 다룰 수 있습니다.

Features:

- ClickHouse 통합: 연결을 손쉽게 관리하고 쿼리를 실행할 수 있습니다.
- 반응형 탭 관리: 쿼리 탭과 테이블 탭과 같은 여러 탭을 동적으로 처리합니다.
- 성능 최적화: 효율적인 캐싱과 상태 관리를 위해 IndexedDB를 활용합니다.
- 로컬 데이터 저장: 모든 데이터는 브라우저에 로컬로 저장되며, 다른 곳으로 전송되지 않습니다.

### ChartDB \{#chartdb\}

[ChartDB](https://chartdb.io)는 ClickHouse를 포함한 데이터베이스 스키마를 단일 쿼리로 시각화하고 설계할 수 있는 무료 오픈 소스 도구입니다. React로 구현되어 매끄럽고 사용자 친화적인 사용 경험을 제공하며, 시작할 때 데이터베이스 인증 정보나 회원가입이 필요하지 않습니다.

기능:

- 스키마 시각화: materialized view와 일반 뷰를 포함하여 ER 다이어그램으로 ClickHouse 스키마를 즉시 가져오고 시각화하며, 테이블에 대한 참조를 보여 줍니다.
- AI 기반 DDL 내보내기: 스키마 관리와 문서화를 개선하기 위해 DDL 스크립트를 손쉽게 생성합니다.
- 다중 SQL 방언 지원: 다양한 SQL 방언과 호환되어 여러 데이터베이스 환경에서 활용할 수 있습니다.
- 회원가입 및 인증 정보 불필요: 모든 기능을 브라우저에서 바로 사용할 수 있어 불편함 없이 안전하게 사용할 수 있습니다.

[ChartDB 소스 코드](https://github.com/chartdb/chartdb).

### DataStoria \{#datastoria\}

[DataStoria](https://github.com/FrankChen021/datastoria)는 한 곳에서 여러 ClickHouse 클러스터를 관리할 수 있는 AI 기반 웹 콘솔 애플리케이션입니다.

주요 기능:

- **AI 기반 지능형 기능**: 자연어를 사용하여 데이터를 탐색하고, SQL 쿼리를 최적화 및 수정하며, 데이터를 시각화합니다.
- **공식 ClickHouse Agent Skills 통합**: [공식 모범 사례](https://github.com/ClickHouse/agent-skills)를 활용하여 데이터베이스 최적화 및 관련 제안을 AI에 요청할 수 있습니다.
- **스마트 오류 진단**: 구문 오류를 정확한 행과 컬럼을 강조 표시하여 즉시 찾아내고, 한 번의 클릭으로 AI 기반 수정 제안을 제공합니다.
- **시스템 테이블 검사**: 강력한 시각화 대시보드와 필터를 통해 `system.query_log`, `system.query_views_log`, `system.zookeeper`, `system.ddl_distributed_queue`, `system.part_log`, `system.processes`를 심층적으로 분석하여 클러스터 상태를 빠르게 파악합니다.
- **원클릭 Explain**: 시각적인 AST 및 파이프라인 뷰로 쿼리 실행 계획을 즉시 파악합니다.
- **의존성 그래프**: materialized view, 분산 테이블(Distributed table), 외부 시스템을 통해 테이블 간 관계를 시각화하고 데이터 흐름을 추적합니다.
- **클러스터 모니터링**: 실시간 메트릭, merge 작업, 복제 상태, 쿼리 성능 등을 포함해 모든 노드를 모니터링합니다.
- **프라이버시 및 보안**: 모든 SQL 쿼리는 브라우저에서 직접 ClickHouse 서버로 전송되어 실행되므로 완전한 프라이버시가 보장됩니다.

[DataStoria 문서](https://docs.datastoria.app).

### DataPup \{#datapup\}

[DataPup](https://github.com/DataPupOrg/DataPup)은 최신 AI 보조 기능을 갖춘 크로스 플랫폼 데이터베이스 클라이언트로, ClickHouse를 기본적으로 지원합니다.

기능:

- 지능형 제안을 제공하는 AI 기반 SQL 쿼리 보조 기능
- 보안 자격 증명 처리를 포함한 기본 ClickHouse 연결 지원
- 여러 테마(라이트, 다크, 다채로운 변형)를 제공하는 아름답고 접근성이 뛰어난 인터페이스
- 고급 쿼리 결과 필터링 및 탐색 기능
- 크로스 플랫폼 지원(macOS, Windows, Linux)
- 빠르고 반응성이 뛰어난 성능
- 오픈 소스이며 MIT 라이선스를 사용

### ClickHouse Schema Flow Visualizer \{#clickhouse-schemaflow-visualizer\}

[ClickHouse Schema Flow Visualizer](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)는 Mermaid.js 다이어그램을 사용하여 ClickHouse 테이블 간 관계를 시각화하는 강력한 오픈 소스 웹 애플리케이션입니다. 직관적인 인터페이스로 데이터베이스와 테이블을 탐색하고, 선택적으로 행 개수와 크기 정보를 포함한 테이블 메타데이터를 살펴보며, 대화형 스키마 다이어그램을 내보낼 수 있습니다.

기능:

- 직관적인 인터페이스로 ClickHouse 데이터베이스와 테이블 탐색
- Mermaid.js 다이어그램으로 테이블 간 관계 시각화
- 테이블 유형에 맞게 색상으로 구분된 아이콘을 통한 향상된 시각화
- 테이블 간 데이터 흐름 방향 확인
- 다이어그램을 독립 실행형 HTML 파일로 내보내기
- 메타데이터 표시 여부 전환(테이블 행 및 크기 정보)
- TLS 지원을 통한 ClickHouse에 대한 보안 연결
- 모든 기기에 대응하는 반응형 웹 인터페이스

[ClickHouse Schema Flow Visualizer - 소스 코드](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix \{#tabix\}

[Tabix](https://github.com/tabixio/tabix) 프로젝트에서 제공하는 ClickHouse용 웹 인터페이스입니다.

기능:

- 추가 소프트웨어를 설치할 필요 없이 브라우저에서 직접 ClickHouse를 사용할 수 있습니다.
- 구문 강조 표시 기능이 있는 쿼리 편집기.
- 명령 자동 완성 기능.
- 쿼리 실행을 시각적으로 분석할 수 있는 도구.
- 색상 테마 선택 옵션.

[Tabix 문서](https://tabix.io/doc/).

### HouseOps \{#houseops\}

[HouseOps](https://github.com/HouseOps/HouseOps)는 OSX, Linux, Windows용 UI/IDE입니다.

기능:

- 구문 하이라이팅 기능을 제공하는 쿼리 빌더. 응답을 테이블 또는 JSON 뷰로 확인할 수 있습니다.
- 쿼리 결과를 CSV 또는 JSON으로 내보낼 수 있습니다.
- 설명이 포함된 프로세스 목록과 쓰기 모드 제공. 프로세스를 중지(`KILL`)할 수 있습니다.
- 데이터베이스 그래프. 모든 테이블과 각 컬럼을 추가 정보와 함께 표시합니다.
- 컬럼 크기를 빠르게 확인할 수 있습니다.
- 서버 구성을 관리할 수 있습니다.

다음 기능들은 향후 개발이 예정되어 있습니다:

- 데이터베이스 관리.
- 사용자 관리.
- 실시간 데이터 분석.
- 클러스터 모니터링.
- 클러스터 관리.
- 복제된 테이블(Replicated Table)과 Kafka 테이블 모니터링.

### LightHouse \{#lighthouse\}

[LightHouse](https://github.com/VKCOM/lighthouse)는 ClickHouse를 위한 가벼운 웹 인터페이스입니다.

주요 기능:

- 필터링과 메타데이터 확인이 가능한 테이블 목록
- 필터링과 정렬이 가능한 테이블 미리보기
- 읽기 전용 쿼리 실행

### Redash \{#redash\}

[Redash](https://github.com/getredash/redash)는 데이터 시각화를 위한 플랫폼입니다.

Redash는 ClickHouse를 포함한 여러 데이터 소스를 지원하며, 서로 다른 데이터 소스의 쿼리 결과를 하나의 최종 데이터셋으로 결합할 수 있습니다.

기능:

- 강력한 쿼리 편집기.
- 데이터베이스 탐색기.
- 데이터를 다양한 형태로 표현할 수 있는 시각화 도구.

### Grafana \{#grafana\}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/)는 모니터링 및 시각화를 위한 플랫폼입니다.

「Grafana는 메트릭이 어디에 저장되어 있든 쿼리하고, 시각화하고, 알림을 설정하며, 메트릭을 이해할 수 있도록 해 줍니다. 팀과 함께 대시보드를 생성하고, 탐색하고, 공유하여 데이터 기반 문화를 조성할 수 있습니다. 커뮤니티가 신뢰하고 사랑하는 제품입니다」 &mdash; grafana.com.

ClickHouse 데이터 소스 플러그인은 ClickHouse를 백엔드 데이터베이스로 사용할 수 있도록 지원합니다.

### qryn \{#qryn\}

[qryn](https://metrico.in)은 ClickHouse용 고성능 폴리글롯(polyglot) 관측성 스택으로, 네이티브 Grafana 통합을 통해 Loki/LogQL, Prometheus/PromQL, OTLP/Tempo, Elastic, InfluxDB 등 다양한 에이전트를 통해 전송되는 로그, 메트릭, 텔레메트리 트레이스를 수집하고 분석할 수 있습니다 _(이전 명칭: cLoki)_.

기능:

- 데이터를 쿼리, 추출 및 시각화하기 위한 내장 Explore UI와 LogQL CLI
- 플러그인 없이 쿼리, 처리, 수집, 트레이싱 및 알림을 수행할 수 있는 네이티브 Grafana API 지원
- 로그, 이벤트, 트레이스 등에서 데이터를 동적으로 검색, 필터링 및 추출할 수 있는 강력한 파이프라인
- LogQL, PromQL, InfluxDB, Elastic 등과 투명하게 호환되는 수집 및 PUSH API
- Promtail, Grafana Agent, Vector, Logstash, Telegraf 등 다양한 에이전트와 즉시 사용 가능

### DBeaver \{#dbeaver\}

[DBeaver](https://dbeaver.io/) - ClickHouse를 지원하는 범용 데스크톱 데이터베이스 클라이언트입니다.

기능:

- 구문 강조 및 자동 완성 기능을 갖춘 쿼리 개발.
- 필터와 메타데이터 검색을 지원하는 테이블 목록.
- 테이블 데이터 미리 보기.
- 전문 검색(Full-text search).

기본적으로 DBeaver는 세션을 사용하여 연결하지 않습니다(예를 들어 CLI는 세션을 사용합니다). 세션 지원(예: 세션에 대한 설정을 지정해야 하는 경우)이 필요한 경우 드라이버 연결 속성을 편집하고 `session_id`를 임의의 문자열로 설정하십시오(내부적으로 HTTP 연결을 사용합니다). 그런 다음 쿼리 창에서 원하는 설정을 사용할 수 있습니다.

### clickhouse-cli \{#clickhouse-cli\}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli)는 Python 3로 작성된 ClickHouse용 대체 명령줄 클라이언트입니다.

기능:

- 자동완성.
- 쿼리와 데이터 출력에 대한 구문 하이라이트.
- 데이터 출력용 페이저(pager) 지원.
- PostgreSQL과 유사한 사용자 정의 명령.

### clickhouse-flamegraph \{#clickhouse-flamegraph\}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph)는 `system.trace_log`를 [flamegraph](http://www.brendangregg.com/flamegraphs.html)로 시각화하기 위해 특화된 도구입니다.

### clickhouse-plantuml \{#clickhouse-plantuml\}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/)은 테이블 스키마에 대한 [PlantUML](https://plantuml.com/) 다이어그램을 생성하는 스크립트입니다.

### ClickHouse table graph \{#clickhouse-table-graph\}

[ClickHouse table graph](https://github.com/mbaksheev/clickhouse-table-graph)는 ClickHouse 테이블 간 의존 관계를 시각화하는 간단한 CLI 도구입니다. 이 도구는 `system.tables` 테이블에서 테이블 간 관계 정보를 가져와 [mermaid](https://mermaid.js.org/syntax/flowchart.html) 형식의 의존성 순서도를 생성합니다. 이 도구를 사용하면 테이블 의존성을 쉽게 시각화하고 ClickHouse 데이터베이스 내 데이터 흐름을 파악할 수 있습니다. mermaid 덕분에 생성된 순서도는 가독성이 좋으며 markdown 문서에 손쉽게 포함할 수 있습니다.

### xeus-clickhouse \{#xeus-clickhouse\}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse)는 Jupyter에서 SQL을 사용하여 ClickHouse(CH) 데이터를 쿼리할 수 있도록 해주는 ClickHouse용 Jupyter 커널입니다.

### MindsDB Studio \{#mindsdb\}

[MindsDB](https://mindsdb.com/)는 ClickHouse를 포함한 데이터베이스용 오픈 소스 AI 레이어로, 최신 머신러닝 모델을 손쉽게 개발·학습·배포할 수 있도록 합니다. MindsDB Studio(GUI)를 사용하면 데이터베이스에서 새로운 모델을 학습시키고, 모델이 생성한 예측 결과를 해석하며, 잠재적인 데이터 편향을 식별하고, Explainable AI 기능을 활용하여 모델 정확도를 평가·시각화함으로써 머신러닝 모델을 더 빠르게 조정하고 최적화할 수 있습니다.

### DBM \{#dbm\}

[DBM](https://github.com/devlive-community/dbm) DBM은 ClickHouse를 위한 시각화 기반 관리 도구입니다!

기능:

- 쿼리 이력 기능 지원(페이지네이션, 전체 삭제 등)
- 선택한 SQL 절에 대한 쿼리 실행 지원
- 쿼리 중단 지원
- 테이블 관리 기능 지원(메타데이터, 삭제, 미리 보기)
- 데이터베이스 관리 기능 지원(삭제, 생성)
- 사용자 정의 쿼리 지원
- 다중 데이터 소스 관리 지원(연결 테스트, 모니터링)
- 모니터링 지원(프로세서, 연결, 쿼리)
- 데이터 마이그레이션 지원

### Bytebase \{#bytebase\}

[Bytebase](https://bytebase.com)는 팀을 위한 웹 기반 오픈 소스 스키마 변경 및 버전 관리 도구입니다. ClickHouse를 포함한 다양한 데이터베이스를 지원합니다.

기능:

- 개발자와 DBA 간 스키마 검토.
- Database-as-Code 방식으로 GitLab과 같은 VCS에서 스키마를 버전 관리하고, 코드 커밋 시 배포를 트리거합니다.
- 환경별 정책을 통한 배포 프로세스 단순화.
- 전체 마이그레이션 이력 관리.
- 스키마 드리프트 감지.
- 백업 및 복구.
- RBAC.

### Zeppelin-Interpreter-for-ClickHouse \{#zeppelin-interpreter-for-clickhouse\}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse)는 ClickHouse용 [Zeppelin](https://zeppelin.apache.org) 인터프리터입니다. JDBC 인터프리터와 비교해, 오래 실행되는 쿼리에 대해 더 나은 타임아웃 제어 기능을 제공합니다.

### ClickCat \{#clickcat\}

[ClickCat](https://github.com/clickcat-project/ClickCat)은(는) ClickHouse 데이터의 검색, 탐색 및 시각화를 지원하는 사용하기 쉬운 사용자 인터페이스입니다.

기능:

- 별도 설치 없이 온라인에서 SQL 코드를 실행할 수 있는 SQL 편집기
- 모든 프로세스와 뮤테이션을 모니터링할 수 있으며, 완료되지 않은 프로세스는 UI에서 종료할 수 있습니다.
- Metrics에는 클러스터 분석, 데이터 분석, 쿼리 분석 기능이 포함됩니다.

### ClickVisual \{#clickvisual\}

[ClickVisual](https://clickvisual.net/)는 경량 오픈 소스 로그 쿼리, 분석 및 알람 시각화 플랫폼입니다.

기능:

- 로그 분석용 라이브러리를 원클릭으로 생성 지원
- 로그 수집 설정 관리 지원
- 사용자 정의 인덱스 설정 지원
- 알람 설정 지원
- 라이브러리 및 테이블 단위의 세분화된 권한 구성 지원

### ClickHouse-Mate \{#clickmate\}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate)는 ClickHouse의 데이터를 검색하고 탐색하기 위한 Angular 기반 웹 클라이언트 및 사용자 인터페이스입니다.

기능:

- ClickHouse SQL 쿼리 자동 완성
- 빠른 데이터베이스 및 테이블 트리 탐색
- 고급 결과 필터링 및 정렬
- 인라인 ClickHouse SQL 문서
- 쿼리 프리셋 및 히스토리
- 100% 브라우저 기반, 별도 서버/백엔드 불필요

클라이언트는 GitHub Pages를 통해 즉시 사용하실 수 있습니다: https://metrico.github.io/clickhouse-mate/

### Uptrace \{#uptrace\}

[Uptrace](https://github.com/uptrace/uptrace)는 OpenTelemetry와 ClickHouse를 기반으로 분산 트레이싱과 메트릭을 제공하는 APM 도구입니다.

기능:

- [OpenTelemetry 트레이싱](https://uptrace.dev/opentelemetry/distributed-tracing.html), 메트릭, 로그.
- AlertManager를 사용한 이메일/Slack/PagerDuty 알림.
- 스팬을 집계하기 위한 SQL 유사 쿼리 언어.
- 메트릭을 조회하기 위한 PromQL 유사 언어.
- 미리 구성된 메트릭 대시보드.
- YAML 설정을 통한 여러 사용자 및 프로젝트 지원.

### clickhouse-monitoring \{#clickhouse-monitoring\}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring)은 `system.*` 테이블에 의존하여 ClickHouse 클러스터를 모니터링하고 전체적인 상태를 파악하는 데 도움이 되는 간단한 Next.js 대시보드입니다.

기능:

- 쿼리 모니터: 현재 쿼리, 쿼리 이력, 쿼리 리소스(메모리, 읽은 파트 수, file_open, ...), 가장 비용이 큰 쿼리, 가장 많이 사용된 테이블 또는 컬럼 등
- 클러스터 모니터: 전체 메모리/CPU 사용량, 분산 큐, 전역 설정, MergeTree 설정, 메트릭 등
- 테이블 및 파트 정보: 크기, 행 수, 압축, 파트 크기 등 컬럼 단위의 상세 정보
- 유용한 도구: Zookeeper 데이터 탐색, 쿼리 EXPLAIN, 쿼리 강제 종료(kill queries) 등
- 메트릭 시각화 차트: 쿼리 및 리소스 사용량, 머지/뮤테이션 횟수, 머지 성능, 쿼리 성능 등

### CKibana \{#ckibana\}

[CKibana](https://github.com/TongchengOpenSource/ckibana)은 기존 Kibana UI를 사용하여 ClickHouse 데이터를 손쉽게 검색, 탐색 및 시각화할 수 있게 해 주는 경량 서비스입니다.

기능:

- 기존 Kibana UI에서 생성된 차트 요청을 ClickHouse 쿼리 구문으로 변환합니다.
- 샘플링 및 캐싱과 같은 고급 기능을 지원하여 쿼리 성능을 향상합니다.
- ElasticSearch에서 ClickHouse로 마이그레이션한 후에도 사용자의 학습 부담을 최소화합니다.

### Telescope \{#telescope\}

[Telescope](https://iamtelescope.net/)는 ClickHouse에 저장된 로그를 탐색하기 위한 최신 웹 인터페이스입니다. 세밀한 접근 제어와 함께 로그 데이터를 쿼리하고, 시각화하고, 관리할 수 있는 사용자 친화적인 UI를 제공합니다.

기능:

- 강력한 필터와 사용자 정의 가능한 필드 선택 기능을 갖춘 깔끔한 반응형 UI를 제공합니다.
- 직관적이고 표현력이 뛰어난 로그 필터링을 위한 FlyQL 문법을 지원합니다.
- 중첩된 JSON, 맵(Map), Array 필드를 포함한 group-by를 지원하는 시간 기반 그래프를 제공합니다.
- 고급 필터링을 위한 선택적 원시 SQL `WHERE` 쿼리를 지원합니다(권한 검사 포함).
- Saved Views를 통해 쿼리와 레이아웃에 대한 사용자 정의 UI 구성을 저장하고 공유할 수 있습니다.
- 역할 기반 접근 제어(RBAC) 및 GitHub 인증 연동을 지원합니다.
- ClickHouse 측에 별도의 에이전트나 추가 컴포넌트가 필요하지 않습니다.

[Telescope Source Code](https://github.com/iamtelescope/telescope) · [Live Demo](https://demo.iamtelescope.net)

### ClickLens \{#clicklens\}

[ClickLens](https://ntk148v.github.io/clicklens/)는 ClickHouse 데이터베이스를 관리하고 모니터링하기 위한 모던하고 강력하며 사용자 친화적인 웹 인터페이스입니다. 개발자, 분석가, 관리자 등이 ClickHouse 클러스터와 효율적으로 상호작용할 수 있도록 포괄적인 도구 모음을 제공합니다. ClickHouse는 뛰어난 분석용 데이터베이스이지만, CLI나 기본 도구만으로 관리하기는 어려울 수 있습니다. ClickLens는 다음과 같은 기능을 제공하여 이러한 격차를 메워 줍니다:

- Discover - 어떤 테이블이든 유연하게 탐색할 수 있는 Kibana와 유사한 데이터 탐색 기능
- SQL Console - 구문 하이라이트와 스트리밍 방식 결과 표시로 쿼리를 작성, 실행 및 분석하는 콘솔
- Real-time Monitoring - 클러스터 상태, 쿼리 성능, 리소스 사용량을 실시간으로 모니터링하는 기능
- Schema Explorer - 데이터베이스, 테이블, 컬럼, 파트 등을 탐색하는 스키마 탐색기
- Access Control - UI에서 직접 사용자와 역할을 관리하는 액세스 제어 기능
- Native RBAC - UI 권한이 ClickHouse GRANT에서 직접 파생되는 네이티브 RBAC 지원

[ClickLens Source Code](https://github.com/ntk148v/clicklens)

## 상용 제품 \{#commercial\}

### DataGrip \{#datagrip\}

[DataGrip](https://www.jetbrains.com/datagrip/)은 JetBrains에서 제공하는 데이터베이스 IDE로, ClickHouse에 대한 전용 지원을 제공합니다. 또한 PyCharm, IntelliJ IDEA, GoLand, PhpStorm 등 다른 IntelliJ 기반 도구에도 포함되어 있습니다.

기능:

- 매우 빠른 코드 자동 완성.
- ClickHouse 구문 하이라이트.
- 중첩 컬럼, 테이블 엔진 등 ClickHouse에 특화된 기능 지원.
- 데이터 편집기(Data Editor).
- 리팩터링.
- 검색 및 탐색.

### Yandex DataLens \{#yandex-datalens\}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens)는 데이터 시각화 및 분석 서비스입니다.

주요 기능:

- 단순한 막대 차트부터 복잡한 대시보드까지 다양한 시각화를 제공합니다.
- 대시보드를 공개로 설정하여 외부에 제공할 수 있습니다.
- ClickHouse를 포함한 여러 데이터 소스를 지원합니다.
- ClickHouse 기반 구체화된 데이터(Materialized Data) 저장소를 제공합니다.

DataLens는 부하가 적은 프로젝트에 대해 [무료로 제공](https://cloud.yandex.com/docs/datalens/pricing)되며, 상업적 사용도 가능합니다.

- [DataLens 문서](https://cloud.yandex.com/docs/datalens/).
- ClickHouse 데이터베이스의 데이터를 시각화하는 [튜토리얼](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization).

### Holistics Software \{#holistics-software\}

[Holistics](https://www.holistics.io/)는 풀스택 데이터 플랫폼이자 비즈니스 인텔리전스 도구입니다.

기능:

- 보고서를 이메일, Slack 및 Google Sheet로 자동 예약·발송합니다.
- 시각화, 버전 관리, 자동 완성, 재사용 가능한 쿼리 컴포넌트 및 동적 필터를 지원하는 SQL 편집기를 제공합니다.
- iframe을 통해 보고서와 대시보드를 임베디드 분석으로 제공합니다.
- 데이터 준비 및 ETL 기능을 제공합니다.
- 데이터의 관계 매핑을 위한 SQL 데이터 모델링을 지원합니다.

### Looker \{#looker\}

[Looker](https://looker.com)는 ClickHouse를 포함하여 50개 이상의 데이터베이스 다이얼렉트를 지원하는 데이터 플랫폼이자 비즈니스 인텔리전스 도구입니다. Looker는 SaaS 플랫폼과 셀프 호스팅 방식으로 제공됩니다. 사용자는 브라우저를 통해 데이터를 탐색하고, 시각화와 대시보드를 생성하며, 보고서 예약을 설정하고, 인사이트를 동료와 공유할 수 있습니다. Looker는 이러한 기능을 다른 애플리케이션에 내장하기 위한 다양한 도구와, 다른 애플리케이션과 데이터를 통합하기 위한 API를 제공합니다.

기능:

- 리포트 작성자와 최종 사용자를 지원하는 선별된
    [Data Modeling](https://looker.com/platform/data-modeling)을 지원하는 언어인 LookML을 사용하여 쉽고 민첩하게 개발할 수 있습니다.
- Looker의 [Data Actions](https://looker.com/platform/actions)를 통한 강력한 워크플로 통합이 가능합니다.

[Looker에서 ClickHouse를 구성하는 방법.](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable \{#seektable\}

[SeekTable](https://www.seektable.com)은(는) 데이터 탐색과 운영 보고를 위한 셀프 서비스형 BI 도구입니다. 클라우드 서비스와 자체 호스팅 버전 모두로 제공됩니다. SeekTable에서 생성한 보고서는 어떤 웹 애플리케이션에도 내장하여 사용할 수 있습니다.

기능:

- 비즈니스 사용자가 사용하기 쉬운 보고서 빌더.
- SQL 필터링과 보고서별 쿼리 커스터마이징을 위한 강력한 보고서 매개변수.
- ClickHouse에 네이티브 TCP/IP 엔드포인트와 HTTP(S) 인터페이스(서로 다른 두 가지 드라이버)를 통해 모두 연결할 수 있습니다.
- 차원/측정 정의에서 ClickHouse SQL 방언의 모든 기능을 사용할 수 있습니다.
- 자동화된 보고서 생성을 위한 [Web API](https://www.seektable.com/help/web-api-integration).
- 계정 데이터 [백업/복원](https://www.seektable.com/help/self-hosted-backup-restore)을 활용한 보고서 개발 워크플로를 지원합니다. 데이터 모델(큐브)과 보고서 구성은 사람이 읽을 수 있는 XML 형식이며, 버전 관리 시스템에 저장할 수 있습니다.

SeekTable은 개인 또는 개인용 사용의 경우 [무료](https://www.seektable.com/help/cloud-pricing)입니다.

[SeekTable에서 ClickHouse 연결을 구성하는 방법.](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin \{#chadmin\}

[Chadmin](https://github.com/bun4uk/chadmin)은(는) ClickHouse 클러스터에서 현재 실행 중인 쿼리와 그에 대한 정보를 시각화하고, 필요한 경우 해당 쿼리를 종료할 수 있는 간단한 UI입니다.

### TABLUM.IO \{#tablum_io\}

[TABLUM.IO](https://tablum.io/) — ETL 및 시각화를 위한 온라인 쿼리 및 분석용 도구입니다. ClickHouse에 연결하고, 다양한 기능을 갖춘 SQL 콘솔을 통해 데이터를 쿼리할 수 있으며, 정적 파일 및 서드파티 서비스에서 데이터를 로드할 수 있습니다. TABLUM.IO는 쿼리 결과 데이터를 차트와 테이블로 시각화할 수 있습니다.

기능:

- ETL: 주요 데이터베이스, 로컬 및 원격 파일, API 호출을 통한 데이터 로딩.
- 구문 강조 기능과 시각적 쿼리 빌더가 포함된 다기능 SQL 콘솔.
- 차트 및 테이블 형식의 데이터 시각화.
- 데이터 구체화 및 서브쿼리.
- Slack, Telegram 또는 이메일로 데이터 리포팅.
- 독자적인 API를 통한 데이터 파이프라인 구성.
- JSON, CSV, SQL, HTML 형식으로 데이터 내보내기.
- 웹 기반 인터페이스.

TABLUM.IO는 자체 호스팅(docker 이미지 사용) 또는 클라우드 환경에서 실행할 수 있습니다.
라이선스: 3개월 무료 기간이 제공되는 [상용](https://tablum.io/pricing) 제품입니다.

[클라우드 환경](https://tablum.io/try)에서 무료로 사용해 보십시오.
제품에 대한 자세한 내용은 [TABLUM.IO](https://tablum.io/)에서 확인하십시오.

### CKMAN \{#ckman\}

[CKMAN](https://www.github.com/housepower/ckman)은 ClickHouse 클러스터를 관리하고 모니터링하기 위한 도구입니다.

주요 기능:

- 브라우저 인터페이스를 통한 클러스터의 빠르고 편리한 자동 배포
- 클러스터 확장 및 축소
- 클러스터 데이터 로드 밸런싱
- 클러스터 온라인 업그레이드
- 페이지에서 클러스터 설정 수정
- 클러스터 노드 모니터링 및 ZooKeeper 모니터링 제공
- 테이블과 파티션 상태 모니터링 및 느린 SQL 문 모니터링
- 사용하기 쉬운 SQL 실행 페이지 제공