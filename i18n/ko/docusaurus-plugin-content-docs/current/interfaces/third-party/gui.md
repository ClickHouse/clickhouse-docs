---
'description': 'ClickHouse와 작업하기 위한 서드파티 GUI 도구 및 애플리케이션 목록'
'sidebar_label': 'Visual Interfaces'
'sidebar_position': 28
'slug': '/interfaces/third-party/gui'
'title': '서드파티 개발자의 시각적 인터페이스'
'doc_type': 'reference'
---


# 타사 개발자의 시각적 인터페이스

## 오픈 소스 {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx) 는 Tauri와 SvelteKit으로 구축된 데스크탑 애플리케이션으로, ClickHouse의 내장 데이터베이스 엔진(chdb)을 사용하여 데이터를 탐색하고 쿼리하는 현대적인 인터페이스를 제공합니다.

- 네이티브 응용 프로그램을 실행할 때 ch-db 활용.
- 웹 인스턴스를 실행할 때 ClickHouse 인스턴스에 연결할 수 있습니다.
- Monaco 에디터를 사용하여 익숙히 작업할 수 있습니다.
- 여러 개의 진화하는 데이터 시각화.

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) 는 ClickHouse 데이터베이스를 위한 간단한 React.js 애플리케이션 인터페이스로, 쿼리를 실행하고 데이터를 시각화하기 위해 설계되었습니다. React와 웹용 ClickHouse 클라이언트를 기반으로 하여, 데이터베이스 상호작용을 쉽게 할 수 있도록 우아하고 사용자 친화적인 UI를 제공합니다.

기능:

- ClickHouse 통합: 연결 관리 및 쿼리 실행을 쉽게 처리합니다.
- 반응형 탭 관리: 쿼리 및 테이블 탭과 같은 여러 탭을 동적으로 처리합니다.
- 성능 최적화: 효율적인 캐싱 및 상태 관리를 위해 Indexed DB를 활용합니다.
- 로컬 데이터 저장: 모든 데이터는 브라우저에 로컬로 저장되어 다른 곳으로 전송되지 않습니다.

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) 는 ClickHouse를 포함한 데이터베이스 스키마를 시각화하고 설계하기 위한 무료 오픈 소스 도구로, 단일 쿼리로 작동합니다. React로 구축되어 원활하고 사용자 친화적인 경험을 제공하며, 데이터베이스 자격 증명 또는 가입 없이 시작할 수 있습니다.

기능:

- 스키마 시각화: ClickHouse 스키마를 즉시 가져오고 시각화할 수 있으며, 물리화된 뷰와 표준 뷰를 포함한 ER 다이어그램을 보여줍니다.
- AI 기반 DDL 내보내기: 더 나은 스키마 관리와 문서를 위해 DDL 스크립트를 쉽게 생성할 수 있습니다.
- 다중 SQL 방언 지원: 다양한 데이터베이스 환경에서 사용하기 위해 여러 SQL 방언과 호환됩니다.
- 가입 또는 자격 증명이 필요 없음: 모든 기능은 브라우저에서 직접 접근할 수 있어 번거롭지 않고 안전합니다.

[ChartDB 소스 코드](https://github.com/chartdb/chartdb).

### DataPup {#datapup}

[DataPup](https://github.com/DataPupOrg/DataPup) 는 네이티브 ClickHouse 지원을 갖춘 현대적이고 AI 지원의 교차 플랫폼 데이터베이스 클라이언트입니다.

기능:

- 지능적 제안이 포함된 AI 기반 SQL 쿼리 지원
- 안전한 자격 증명 처리를 통한 네이티브 ClickHouse 연결 지원
- 여러 테마(밝은, 어두운 및 다채로운 변형)를 가진 아름답고 접근 가능한 인터페이스
- 고급 쿼리 결과 필터링 및 탐색
- 교차 플랫폼 지원(맥OS, 윈도우, 리눅스)
- 빠르고 반응성이 뛰어난 성능
- 오픈 소스 및 MIT 라이센스

### ClickHouse 스키마 흐름 시각화 도구 {#clickhouse-schemaflow-visualizer}

[ClickHouse 스키마 흐름 시각화 도구](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer) 는 Mermaid.js 다이어그램을 사용하여 ClickHouse 테이블 관계를 시각화하기 위한 강력한 오픈 소스 웹 애플리케이션입니다. 직관적인 인터페이스로 데이터베이스와 테이블을 탐색하고, 선택적 행 수 및 크기 정보를 포함한 테이블 메타데이터를 탐색하며, 대화형 스키마 다이어그램을 내보낼 수 있습니다.

기능:

- 직관적인 인터페이스로 ClickHouse 데이터베이스 및 테이블 탐색
- Mermaid.js 다이어그램을 이용한 테이블 관계 시각화
- 더 나은 시각화를 위한 테이블 유형에 맞는 색상 코드 아이콘
- 테이블 간 데이터 흐름 방향 보기
- 독립형 HTML 파일로 다이어그램 내보내기
- 메타데이터 가시성 전환(테이블 행 및 크기 정보)
- TLS 지원으로 ClickHouse에 대한 안전한 연결
- 모든 장치에서 반응형 웹 인터페이스 제공

[ClickHouse 스키마 흐름 시각화 도구 - 소스 코드](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

[Tabix](https://github.com/tabixio/tabix) 프로젝트의 ClickHouse 웹 인터페이스입니다.

기능:

- 추가 소프트웨어를 설치할 필요 없이 브라우저에서 ClickHouse와 직접 작동합니다.
- 구문 강조가 포함된 쿼리 에디터.
- 명령의 자동 완성.
- 쿼리 실행에 대한 그래픽 분석 도구.
- 색상 구성 옵션.

[Tabix 문서](https://tabix.io/doc/).

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps)는 OSX, 리눅스 및 윈도우를 위한 UI/IDE입니다.

기능:

- 구문 강조가 포함된 쿼리 빌더. 테이블 또는 JSON 보기에서 응답을 확인합니다.
- 쿼리 결과를 CSV 또는 JSON 형식으로 내보내기.
- 설명이 포함된 프로세스 목록. 작성 모드. 프로세스를 중지(`KILL`)할 수 있는 기능.
- 모든 테이블과 그 컬럼을 추가 정보와 함께 보여주는 데이터베이스 그래프.
- 컬럼 크기에 대한 빠른 보기.
- 서버 구성.

다음 기능이 개발 예정입니다:

- 데이터베이스 관리.
- 사용자 관리.
- 실시간 데이터 분석.
- 클러스터 모니터링.
- 클러스터 관리.
- 복제된 테이블 및 Kafka 테이블 모니터링.

### LightHouse {#lighthouse}

[LightHouse](https://github.com/VKCOM/lighthouse)는 ClickHouse를 위한 경량 웹 인터페이스입니다.

기능:

- 필터링 및 메타데이터와 함께 테이블 목록.
- 필터링 및 정렬이 가능한 테이블 미리보기.
- 읽기 전용 쿼리 실행.

### Redash {#redash}

[Redash](https://github.com/getredash/redash)는 데이터 시각화 플랫폼입니다.

ClickHouse를 포함한 여러 데이터 소스를 지원하며, Redash는 서로 다른 데이터 소스의 쿼리 결과를 하나의 최종 데이터 세트로 결합할 수 있습니다.

기능:

- 강력한 쿼리 편집기.
- 데이터베이스 탐색기.
- 데이터를 다양한 형태로 표현할 수 있는 시각화 도구입니다.

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/)는 모니터링 및 시각화를 위한 플랫폼입니다.

"Grafana는 메트릭이 저장된 위치에 관계없이 쿼리하고, 시각화하고, 알림을 보내고, 메트릭을 이해할 수 있도록 해줍니다. 팀과 함께 대시보드를 작성, 탐색 및 공유하여 데이터 기반 문화를 촉진하세요. 커뮤니티로부터 신뢰받고 사랑받고 있습니다." &mdash; grafana.com.

ClickHouse 데이터 소스 플러그인은 ClickHouse를 백엔드 데이터베이스로 지원합니다.

### qryn {#qryn}

[qryn](https://metrico.in)은 ClickHouse를 위한 다국어 고성능 관측 스택으로 _(구 cLoki)_ , Grafana와의 네이티브 통합을 제공하여 사용자가 Loki/LogQL, Prometheus/PromQL, OTLP/Tempo, Elastic, InfluxDB 및 기타 여러 에이전트에서 로그, 메트릭 및 텔레메트리 추적을 수집하고 분석할 수 있도록 합니다.

기능:

- 데이터를 쿼리, 추출 및 시각화하기 위한 내장 탐색 UI 및 LogQL CLI
- 플러그인 없이 쿼리, 처리, 수집, 추적 및 알림을 위한 네이티브 Grafana API 지원
- 로그, 이벤트, 추적 및 그 이상에서 데이터를 동적으로 검색, 필터링 및 추출할 수 있는 강력한 파이프라인
- LogQL, PromQL, InfluxDB, Elastic 등과 투명하게 호환되는 수집 및 PUSH API
- Promtail, Grafana-Agent, Vector, Logstash, Telegraf 등과 같은 에이전트와 함께 즉시 사용할 준비가 되어 있습니다.

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) - ClickHouse 지원을 갖춘 범용 데스크탑 데이터베이스 클라이언트.

기능:

- 구문 강조 및 자동 완성이 포함된 쿼리 개발.
- 필터 및 메타데이터 검색이 가능한 테이블 목록.
- 테이블 데이터 미리보기.
- 전체 텍스트 검색.

기본적으로 DBeaver는 세션을 사용하여 연결하지 않습니다(예: CLI). 세션 지원이 필요한 경우(예: 세션에 대한 설정을 설정하려면), 드라이버 연결 속성을 편집하고 `session_id`를 임의의 문자열로 설정합니다(내부적으로 http 연결을 사용합니다). 그러면 쿼리 창에서 설정을 사용할 수 있습니다.

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli)는 Python 3으로 작성된 ClickHouse의 대체 명령줄 클라이언트입니다.

기능:

- 자동 완성.
- 쿼리 및 데이터 출력을 위한 구문 강조.
- 데이터 출력에 대한 페이저 지원.
- PostgreSQL과 유사한 커스텀 명령.

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph)은 `system.trace_log`를 [flamegraph](http://www.brendangregg.com/flamegraphs.html)로 시각화하는 전문 도구입니다.

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) 는 테이블의 스키마에 대한 [PlantUML](https://plantuml.com/) 다이어그램을 생성하는 스크립트입니다.

### ClickHouse 테이블 그래프 {#clickhouse-table-graph}

[ClickHouse 테이블 그래프](https://github.com/mbaksheev/clickhouse-table-graph)는 ClickHouse 테이블 간의 의존성을 시각화하기 위한 간단한 CLI 도구입니다. 이 도구는 `system.tables` 테이블에서 테이블 간의 연결을 검색하고 의존성 흐름도를 [mermaid](https://mermaid.js.org/syntax/flowchart.html) 형식으로 작성합니다. 이 도구를 사용하면 테이블 의존성을 쉽게 시각화하고 ClickHouse 데이터베이스 내 데이터 흐름을 이해할 수 있습니다. mermaid 덕분에 결과 흐름도는 매력적이며 마크다운 문서에 쉽게 추가할 수 있습니다.

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse)는 Jupyter에서 SQL을 사용하여 ClickHouse 데이터를 쿼리할 수 있는 Jupyter 커널입니다.

### MindsDB 스튜디오 {#mindsdb}

[MindsDB](https://mindsdb.com/)는 ClickHouse를 포함한 데이터베이스를 위한 오픈 소스 AI 계층으로, 최신 기계 학습 모델을 쉽게 개발하고 훈련하며 배포할 수 있게 해줍니다. MindsDB Studio(GUI)는 데이터베이스에서 새로운 모델을 훈련하고, 모델이 만든 예측을 해석하고, 잠재적인 데이터 바이어스를 식별하며, 설명 가능한 AI 기능을 사용하여 모델의 정확도를 평가하고 시각화하여 기계 학습 모델을 더 빠르게 적응시키고 조정할 수 있도록 합니다.

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) DBM은 ClickHouse를 위한 시각적 관리 도구입니다!

기능:

- 쿼리 이력 지원(페이지 매김, 모두 지우기 등)
- 선택된 SQL 절 쿼리 지원
- 쿼리 종료 지원
- 테이블 관리 지원(메타데이터, 삭제, 미리 보기)
- 데이터베이스 관리 지원(삭제, 생성)
- 사용자 정의 쿼리 지원
- 다중 데이터 소스 관리 지원(연결 테스트, 모니터링)
- 모니터링 지원(프로세서, 연결, 쿼리)
- 데이터 마이그레이션 지원

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com)은 팀을 위한 웹 기반 오픈 소스 스키마 변경 및 버전 관리 도구입니다. ClickHouse를 포함한 다양한 데이터베이스를 지원합니다.

기능:

- 개발자와 DBA 간의 스키마 검토.
- 데이터베이스-코드, VCS 내에서 스키마 버전 관리 및 코드 커밋 시 배포 트리거.
- 환경별 정책에 따른 간소화된 배포.
- 전체 마이그레이션 이력.
- 스키마 드리프트 감지.
- 백업 및 복원.
- RBAC.

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse)는 ClickHouse를 위한 [Zeppelin](https://zeppelin.apache.org) 인터프리터입니다. JDBC 인터프리터와 비교할 때, 긴 쿼리에 대한 타임아웃 제어를 더 잘 지원할 수 있습니다.

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat)는 ClickHouse 데이터를 검색하고 탐색하며 시각화할 수 있는 친숙한 사용자 인터페이스입니다.

기능:

- SQL 코드를 설치 없이 실행할 수 있는 온라인 SQL 에디터.
- 모든 프로세스 및 변화를 관찰할 수 있습니다. 미완료된 프로세스의 경우, UI에서 이를 종료할 수 있습니다.
- 메트릭에는 클러스터 분석, 데이터 분석 및 쿼리 분석이 포함됩니다.

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisual은 경량 오픈 소스 로그 쿼리, 분석 및 알람 시각화 플랫폼입니다.

기능:

- 분석 로그 라이브러리를 원클릭으로 생성 지원
- 로그 수집 구성 관리 지원
- 사용자 정의 인덱스 구성 지원
- 알람 구성 지원
- 라이브러리와 테이블에 대한 권한 구성 지원

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate)는 ClickHouse에서 데이터를 검색하고 탐색할 수 있는 앵귤러 웹 클라이언트 + 사용자 인터페이스입니다.

기능:

- ClickHouse SQL 쿼리 자동 완성
- 빠른 데이터베이스 및 테이블 트리 탐색
- 고급 결과 필터링 및 정렬
- ClickHouse SQL 문서와 인라인 지원
- 쿼리 프리셋 및 이력
- 100% 브라우저 기반, 서버/백엔드 없음

클라이언트는 GitHub 페이지를 통해 즉시 사용 가능합니다: https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace)는 OpenTelemetry 및 ClickHouse에 의해 지원되는 분산 추적 및 메트릭을 제공하는 APM 도구입니다.

기능:

- [OpenTelemetry 추적](https://uptrace.dev/opentelemetry/distributed-tracing.html), 메트릭, 및 로그.
- AlertManager를 이용한 이메일/슬랙/PagerDuty 알림.
- 스팬 집계를 위한 SQL 유사 쿼리 언어.
- 메트릭을 쿼리하기 위한 Promql 유사 언어.
- 미리 만들어진 메트릭 대시보드.
- YAML 구성으로 여러 사용자/프로젝트 지원.

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring)은 `system.*` 테이블을 기반으로 ClickHouse 클러스터를 모니터링하고 개요를 제공하기 위한 간단한 Next.js 대시보드입니다.

기능:

- 쿼리 모니터: 현재 쿼리, 쿼리 이력, 쿼리 리소스(메모리, 읽은 파트, 파일 개방 등), 가장 비싼 쿼리, 가장 많이 사용된 테이블 또는 컬럼 등.
- 클러스터 모니터: 전체 메모리/CPU 사용량, 분산 큐, 글로벌 설정, MergeTree 설정, 메트릭 등.
- 테이블 및 파트 정보: 크기, 행 수, 압축, 파트 크기 등, 컬럼 수준 세부정보.
- 유용한 도구: Zookeeper 데이터 탐색, 쿼리 EXPLAIN, 쿼리 종료 등이 포함됩니다.
- 시각화 메트릭 차트: 쿼리 및 리소스 사용량, 병합/변경 수, 병합 성능, 쿼리 성능 등.

### CKibana {#ckibana}

[CKibana](https://github.com/TongchengOpenSource/ckibana)는 ClickHouse 데이터를 검색, 탐색, 시각화하는 것을 쉽게 할 수 있는 경량 서비스입니다.

기능:

- 기본 Kibana UI에서의 차트 요청을 ClickHouse 쿼리 구문으로 변환합니다.
- 쿼리 성능을 향상시키기 위한 샘플링 및 캐싱과 같은 고급 기능을 지원합니다.
- ElasticSearch에서 ClickHouse로 마이그레이션 후 사용자에게 학습 비용을 최소화합니다.

### Telescope {#telescope}

[Telescope](https://iamtelescope.net/)는 ClickHouse에 저장된 로그를 탐색하는 현대적인 웹 인터페이스입니다. 쿼리, 시각화 및 로그 데이터를 관리할 수 있는 사용자 친화적인 UI를 제공하며 세부적인 접근 제어가 가능합니다.

기능:

- 강력한 필터와 사용자 정의 필드 선택 기능을 갖춘 깔끔하고 반응적인 UI.
- 직관적이고 표현력이 풍부한 로그 필터링을 위한 FlyQL 구문.
- 중첩 JSON, Map 및 Array 필드를 포함한 그룹화 지원 시간 기반 그래프.
- 고급 필터링을 위한 선택적 원시 SQL `WHERE` 쿼리 지원(권한 확인 포함).
- 저장된 보기: 쿼리 및 레이아웃에 대한 사용자 정의 UI 구성을 유지하고 공유합니다.
- 역할 기반 접근 제어(RBAC) 및 GitHub 인증 통합.
- ClickHouse 측에 추가 에이전트나 구성 요소가 필요 없습니다.

[Telescope 소스 코드](https://github.com/iamtelescope/telescope) · [실시간 데모](https://demo.iamtelescope.net)

## 상용 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/)는 ClickHouse에 대한 전용 지원을 갖춘 JetBrains의 데이터베이스 IDE입니다. 또한 PyCharm, IntelliJ IDEA, GoLand, PhpStorm 등 다른 IntelliJ 기반 도구에 내장되어 있습니다.

기능:

- 매우 빠른 코드 완성.
- ClickHouse 구문 강조.
- 중첩 컬럼, 테이블 엔진 등 ClickHouse에 특화된 기능 지원.
- 데이터 편집기.
- 리팩토링.
- 검색 및 탐색.

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens)는 데이터 시각화 및 분석 서비스입니다.

기능:

- 단순한 막대 그래프에서 복잡한 대시보드에 이르는 다양한 가용 시각화.
- 대시보드를 공개적으로 제공할 수 있습니다.
- ClickHouse를 포함한 여러 데이터 소스 지원.
- ClickHouse에 기반한 물리화된 데이터 저장소.

DataLens는 낮은 부하 프로젝트에 대해 [무료로 제공](https://cloud.yandex.com/docs/datalens/pricing)되며, 상업적 사용도 가능합니다.

- [DataLens 문서](https://cloud.yandex.com/docs/datalens/).
- ClickHouse 데이터에서 시각화하는 방법에 대한 [튜토리얼](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization).

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/)는 풀스택 데이터 플랫폼이자 비즈니스 인텔리전스 도구입니다.

기능:

- 자동화된 이메일, Slack 및 Google Sheet 보고서 일정을 제공합니다.
- 시각화, 버전 관리, 자동 완성, 재사용 가능한 쿼리 구성 요소 및 동적 필터가 있는 SQL 편집기입니다.
- iframe을 통한 보고서 및 대시보드의 임베디드 분석.
- 데이터 준비 및 ETL 기능.
- 데이터의 관계형 매핑을 위한 SQL 데이터 모델링 지원.

### Looker {#looker}

[Looker](https://looker.com)는 ClickHouse를 포함한 50개 이상의 데이터베이스 방언을 지원하는 데이터 플랫폼 및 비즈니스 인텔리전스 도구입니다. Looker는 SaaS 플랫폼으로 제공되며, 자가 호스팅도 가능합니다. 사용자는 브라우저를 통해 Looker를 사용하여 데이터를 탐색하고, 시각화와 대시보드를 만들고, 보고서를 예약하며, 동료들과 인사이트를 공유할 수 있습니다. Looker는 이러한 기능을 다른 애플리케이션에 임베드할 수 있도록 다양한 도구와 API를 제공합니다.

기능:

- 보고서 작성을 지원하는 맞춤형 [데이터 모델링](https://looker.com/platform/data-modeling)을 지원하는 LookML이라는 언어를 사용하여 쉽게 개발할 수 있습니다.
- Looker의 [데이터 작업](https://looker.com/platform/actions) 기능을 통해 강력한 워크플로 통합이 가능합니다.

[Looker에서 ClickHouse를 구성하는 방법.](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com)는 데이터 탐색 및 운영 보고를 위한 셀프 서비스 BI 도구입니다. 클라우드 서비스 및 자가 호스팅 버전으로 제공됩니다. SeekTable의 보고서는 모든 웹 앱에 삽입할 수 있습니다.

기능:

- 비즈니스 사용자가 친숙한 보고서 작성기.
- SQL 필터링 및 보고서 전용 쿼리 사용자 지정을 위한 강력한 보고서 매개변수.
- 네이티브 TCP/IP 엔드포인트 및 HTTP(S) 인터페이스(2개의 다른 드라이버)로 ClickHouse에 연결할 수 있습니다.
- 차원/측정 정의에서 ClickHouse SQL 방언의 모든 기능을 사용할 수 있습니다.
- [웹 API](https://www.seektable.com/help/web-api-integration)를 통해 자동화된 보고서 생성을 지원합니다.
- 보고서 개발 흐름을 위한 계정 데이터 [백업/복원](https://www.seektable.com/help/self-hosted-backup-restore) 지원; 데이터 모델(큐브)/보고서 구성은 사람이 읽을 수 있는 XML이며 버전 관리 시스템에 저장할 수 있습니다.

SeekTable은 개인/개별 사용에 [무료](https://www.seektable.com/help/cloud-pricing)로 제공됩니다.

[SeekTable에서 ClickHouse 연결을 구성하는 방법.](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin)은 ClickHouse 클러스터에서 현재 실행 중인 쿼리 및 그에 대한 정보를 시각화하고 원하는 경우 이를 종료할 수 있는 간단한 UI입니다.

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) — ETL 및 시각화를 위한 온라인 쿼리 및 분석 도구입니다. ClickHouse에 연결하여 다목적 SQL 콘솔을 통해 데이터를 쿼리하거나 정적 파일 및 타사 서비스에서 데이터를 로드할 수 있습니다. TABLUM.IO는 데이터 결과를 차트 및 테이블로 시각화할 수 있습니다.

기능:
- ETL: 인기 있는 데이터베이스, 로컬 및 원격 파일, API 호출에서 데이터 로딩.
- 구문 강조 및 시각적 쿼리 빌더가 있는 다목적 SQL 콘솔.
- 차트 및 테이블로서의 데이터 시각화.
- 데이터 물리화 및 서브 쿼리.
- Slack, Telegram 또는 이메일로 데이터 보고.
- 독점 API를 통한 데이터 파이프라인.
- JSON, CSV, SQL, HTML 형식으로 데이터 내보내기.
- 웹 기반 인터페이스.

TABLUM.IO는 자가 호스팅 솔루션(도커 이미지) 또는 클라우드에서 실행할 수 있습니다. 라이센스: [상업적](https://tablum.io/pricing) 제품으로 3개월 무료 기간이 있습니다.

클라우드에서 [무료로 사용해보세요](https://tablum.io/try).
제품에 대한 자세한 내용은 [TABLUM.IO](https://tablum.io/)에서 확인하세요.

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman)은 ClickHouse 클러스터를 관리하고 모니터링하기 위한 도구입니다!

기능:

- 브라우저 인터페이스를 통한 클러스터의 신속하고 편리한 자동 배포
- 클러스터를 확장하거나 축소할 수 있습니다.
- 클러스터의 데이터 로드 밸런싱
- 클러스터 온라인 업그레이드
- 페이지에서 클러스터 구성 수정
- 클러스터 노드 모니터링 및 Zookeeper 모니터링 제공
- 테이블 및 파티션 상태 모니터링, 느린 SQL 문 모니터링 제공
- 사용하기 쉬운 SQL 실행 페이지 제공
