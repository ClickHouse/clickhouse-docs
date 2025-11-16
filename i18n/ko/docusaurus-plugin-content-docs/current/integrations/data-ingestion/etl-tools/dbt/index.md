---
'sidebar_label': '개요'
'slug': '/integrations/dbt'
'sidebar_position': 1
'description': '사용자는 dbt를 사용하여 ClickHouse에서 데이터를 변환하고 모델링할 수 있습니다.'
'title': 'dbt와 ClickHouse 통합하기'
'keywords':
- 'dbt'
- 'data transformation'
- 'analytics engineering'
- 'SQL modeling'
- 'ELT pipeline'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_integration'
- 'website': 'https://github.com/ClickHouse/dbt-clickhouse'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# dbt와 ClickHouse 통합하기 {#integrate-dbt-clickhouse}

<ClickHouseSupportedBadge/>

## dbt-clickhouse 어댑터 {#dbt-clickhouse-adapter}
**dbt** (data build tool)는 분석 엔지니어가 단순히 SELECT 문을 작성하여 데이터 웨어하우스의 데이터를 변환할 수 있게 해줍니다. dbt는 이러한 SELECT 문을 데이터베이스의 테이블 및 뷰 형태의 객체로 물리화하는 작업을 수행하며, 이는 [추출, 로드, 변환(ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform)의 T를 수행하는 것입니다. 사용자는 SELECT 문으로 정의된 모델을 생성할 수 있습니다.

dbt 내에서 이러한 모델은 교차 참조되고 레이어링되어 더 높은 수준의 개념을 구성할 수 있게 해줍니다. 모델을 연결하기 위해 필요한 보일러플레이트 SQL은 자동으로 생성됩니다. 또한, dbt는 모델 간의 의존성을 식별하고 방향성 비순환 그래프(DAG)를 사용하여 적절한 순서로 생성되도록 보장합니다.

dbt는 [ClickHouse 지원 어댑터](https://github.com/ClickHouse/dbt-clickhouse)를 통해 ClickHouse와 호환됩니다.

<TOCInline toc={toc}  maxHeadingLevel={2} />

## 지원하는 기능 {#supported-features}

지원되는 기능 목록:
- [x] 테이블 물리화
- [x] 뷰 물리화
- [x] 점진적 물리화
- [x] 마이크로배치 점진적 물리화
- [x] 물리화된 뷰 물리화 (MATERIALIZED VIEW의 `TO` 형식 사용, 실험적)
- [x] 시드
- [x] 소스
- [x] 문서 생성
- [x] 테스트
- [x] 스냅샷
- [x] 대부분의 dbt-utils 매크로 (현재 dbt-core에 포함됨)
- [x] 일시적인 물리화
- [x] 분산 테이블 물리화 (실험적)
- [x] 분산 점진적 물리화 (실험적)
- [x] 계약
- [x] ClickHouse 전용 컬럼 구성 (Codec, TTL...)
- [x] ClickHouse 전용 테이블 설정 (인덱스, 프로젝션...)

dbt-core 1.9까지의 모든 기능이 지원됩니다. 곧 dbt-core 1.10에서 추가된 기능도 추가할 예정입니다.

이 어댑터는 아직 [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview) 내에서 사용할 수 없지만, 곧 사용 가능할 것으로 기대하고 있습니다. 이에 대한 추가 정보를 얻으려면 지원팀에 문의하시기 바랍니다.

## 개념 {#concepts}

dbt는 모델이라는 개념을 도입합니다. 이는 여러 테이블을 조인할 수 있는 SQL 문으로 정의됩니다. 모델은 여러 가지 방법으로 "물리화"될 수 있습니다. 물리화는 모델의 SELECT 쿼리에 대한 빌드 전략을 나타냅니다. 물리화 뒤에 있는 코드는 SELECT 쿼리를 새로운 관계를 생성하거나 기존 관계를 업데이트하기 위한 문장으로 감싸는 보일러플레이트 SQL입니다.

dbt는 4가지 유형의 물리화를 제공합니다:

* **view** (기본값): 모델이 데이터베이스 내의 뷰로 작성됩니다.
* **table**: 모델이 데이터베이스 내의 테이블로 작성됩니다.
* **ephemeral**: 모델이 데이터베이스에 직접 작성되지 않고 의존 모델에서 공통 테이블 표현식으로 끌어옵니다.
* **incremental**: 모델이 처음에는 테이블로 물리화되고, 이후 실행에서는 dbt가 새로운 행을 삽입하고 변경된 행을 업데이트합니다.

추가적인 구문 및 절은 기본 데이터가 변경될 경우 모델이 어떻게 업데이트되어야 하는지를 정의합니다. dbt는 일반적으로 성능이 문제가 되기 전까지 뷰 물리화로 시작하는 것을 권장합니다. 테이블 물리화는 모델 쿼리의 결과를 테이블로 캡처하여 저장소가 증가하는 대가로 쿼리 시간 성능을 향상시킵니다. 점진적 접근 방식은 기본 데이터의 이후 업데이트를 대상 테이블에서 캡처할 수 있도록 이를 더욱 발전시켜줍니다.

[현재 어댑터](https://github.com/silentsokolov/dbt-clickhouse)는 **물리화된 뷰**, **딕셔너리**, **분산 테이블** 및 **분산 점진적** 물리화도 지원합니다. 이 어댑터는 또한 dbt [스냅샷](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) 및 [시드](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)를 지원합니다.

### 지원되는 물리화에 대한 세부정보 {#details-about-supported-materializations}

| 유형                          | 지원 여부 | 세부 사항                                                                                                                           |
|-------------------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------|
| 뷰 물리화                   | YES        | [뷰](https://clickhouse.com/docs/en/sql-reference/table-functions/view/) 생성합니다.                                               |
| 테이블 물리화                | YES        | [테이블](https://clickhouse.com/docs/en/operations/system-tables/tables/) 생성합니다. 지원되는 엔진 목록은 아래를 참조하십시오. |
| 점진적 물리화               | YES        | 존재하지 않으면 테이블을 생성하고, 업데이트만 기록합니다.                                                                         |
| 일시적 물리화              | YES        | 일시적/CTE 물리화를 생성합니다. 이 모델은 dbt의 내부이며 데이터베이스 객체를 생성하지 않습니다.                                |

다음은 ClickHouse의 [실험적 기능](https://clickhouse.com/docs/en/beta-and-experimental-features)입니다:

| 유형                                    | 지원 여부        | 세부 사항                                                                                                                                                                                                                                         |
|-----------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 물리화된 뷰 물리화                     | YES, Experimental | [물리화된 뷰](https://clickhouse.com/docs/en/materialized-view) 생성합니다.                                                                                                                                                                     |
| 분산 테이블 물리화                     | YES, Experimental | [분산 테이블](https://clickhouse.com/docs/en/engines/table-engines/special/distributed) 생성합니다.                                                                                                                                          |
| 분산 점진적 물리화                     | YES, Experimental | 분산 테이블의 동일한 아이디어를 기반으로 하는 점진적 모델입니다. 모든 전략이 지원되는 것은 아니므로 [이곳](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization)에서 더 많은 정보를 확인하세요. |
| 딕셔너리 물리화                        | YES, Experimental | [딕셔너리](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary) 생성합니다.                                                                                                                                                     |

## dbt와 ClickHouse 어댑터 설정 {#setup-of-dbt-and-the-clickhouse-adapter}

### dbt-core 및 dbt-clickhouse 설치 {#install-dbt-core-and-dbt-clickhouse}

dbt는 명령줄 인터페이스(CLI) 설치를 위한 여러 옵션을 제공합니다. 자세한 내용은 [여기](https://docs.getdbt.com/dbt-cli/install/overview)를 참조하십시오. 우리는 `pip`를 사용하여 dbt와 dbt-clickhouse를 모두 설치할 것을 권장합니다.

```sh
pip install dbt-core dbt-clickhouse
```

### dbt에 ClickHouse 인스턴스에 대한 연결 세부정보 제공 {#provide-dbt-with-the-connection-details-for-our-clickhouse-instance}
`~/.dbt/profiles.yml` 파일에서 `clickhouse-service` 프로필을 구성하고 스키마, 호스트, 포트, 사용자 및 암호 속성을 제공하십시오. 전체 연결 구성 옵션 목록은 [기능 및 구성](/integrations/dbt/features-and-configurations) 페이지에서 확인할 수 있습니다:
```yaml
clickhouse-service:
  target: dev
  outputs:
    dev:
      type: clickhouse
      schema: [ default ] # ClickHouse database for dbt models

      # Optional
      host: [ localhost ]
      port: [ 8123 ]  # Defaults to 8123, 8443, 9000, 9440 depending on the secure and driver settings 
      user: [ default ] # User for all database operations
      password: [ <empty string> ] # Password for the user
      secure: True  # Use TLS (native protocol) or HTTPS (http protocol)
```

### dbt 프로젝트 생성 {#create-a-dbt-project}
이제 이 프로필을 기존 프로젝트 중 하나에서 사용하거나 다음을 사용하여 새 프로젝트를 만들 수 있습니다:

```sh
dbt init project_name
```

`project_name` 디렉토리 내에서 ClickHouse 서버에 연결할 프로필 이름을 지정하기 위해 `dbt_project.yml` 파일을 업데이트하십시오.

```yaml
profile: 'clickhouse-service'
```

### 연결 테스트 {#test-connection}
CLI 도구를 사용하여 `dbt debug` 명령을 실행하여 dbt가 ClickHouse에 연결할 수 있는지 확인하십시오. 응답에 `Connection test: [OK connection ok]`가 포함되어 성공적으로 연결되었음을 나타내는지 확인하십시오.

ClickHouse와 함께 dbt를 사용하는 방법에 대한 더 많은 정보를 보려면 [가이드 페이지](/integrations/dbt/guides)로 이동하십시오.

### 모델 테스트 및 배포 (CI/CD) {#testing-and-deploying-your-models-ci-cd}

dbt 프로젝트를 테스트하고 배포하는 방법은 여러 가지가 있습니다. dbt는 [최고의 실습 워크플로우](https://docs.getdbt.com/best-practices/best-practice-workflows#pro-tips-for-workflows) 및 [CI 작업](https://docs.getdbt.com/docs/deploy/ci-jobs)에 대한 몇 가지 제안을 제공합니다. 우리는 여러 전략을 논의할 것이지만, 이러한 전략은 특정 사용 사례에 맞게 깊이 조정해야 할 수 있음을 명심하세요.

#### 간단한 데이터 테스트 및 단위 테스트를 통한 CI/CD {#ci-with-simple-data-tests-and-unit-tests}

CI 파이프라인을 시작하는 간단한 방법 중 하나는 작업 내에서 ClickHouse 클러스터를 실행한 다음 모델을 해당 클러스터에 대해 실행하는 것입니다. 모델을 실행하기 전에 이 클러스터에 데모 데이터를 삽입할 수 있습니다. [시드](https://docs.getdbt.com/reference/commands/seed)를 사용하여 프로덕션 데이터의 일부로 스테이징 환경을 채울 수 있습니다.

데이터가 삽입된 후 [데이터 테스트](https://docs.getdbt.com/docs/build/data-tests) 및 [단위 테스트](https://docs.getdbt.com/docs/build/unit-tests)를 실행할 수 있습니다.

CD 단계는 프로덕션 ClickHouse 클러스터에 대해 `dbt build`를 실행하는 것만큼 간단할 수 있습니다.

#### 보다 완전한 CI/CD 단계: 최신 데이터 사용, 영향받은 모델만 테스트 {#more-complete-ci-stage}

일반적인 전략 중 하나는 [Slim CI](https://docs.getdbt.com/best-practices/best-practice-workflows#run-only-modified-models-to-test-changes-slim-ci) 작업을 사용하는 것입니다. 여기서 수정된 모델(및 그 상하위 의존성)만 재배포됩니다. 이 접근 방식은 프로덕션 실행에서 생성된 아티팩트를 사용하여(즉, [dbt 매니페스트](https://docs.getdbt.com/reference/artifacts/manifest-json)) 프로젝트의 실행 시간을 단축하고 환경 간의 스키마 드리프트가 없음을 보장합니다.

개발 환경을 동기화하고 구식 배포에 대해 모델을 실행하지 않도록 하려면 [클론](https://docs.getdbt.com/reference/commands/clone) 또는 [지연](https://docs.getdbt.com/reference/node-selection/defer)을 사용할 수 있습니다.

테스트 환경을 위해 전용 ClickHouse 클러스터나 서비스를 사용하는 것이 좋습니다(즉, 스테이징 환경) 프로덕션 환경의 작업에 영향을 미치지 않도록 하십시오. 테스트 환경이 대표성이 있도록 보장하려면 프로덕션 데이터의 하위 집합을 사용하고 환경 간의 스키마 드리프트를 방지하는 방식으로 dbt를 실행하는 것이 중요합니다.

- 테스트할 Fresh Data가 필요하지 않은 경우, 스테이징 환경에 프로덕션 데이터의 백업을 복원할 수 있습니다.
- Fresh Data가 필요하다면 [`remoteSecure()` 테이블 함수](/sql-reference/table-functions/remote)와 새로 고칠 수 있는 물리화된 뷰를 조합하여 원하는 빈도로 삽입할 수 있습니다. 또 다른 옵션은 객체 저장소를 중개 역할을 하여 주기적으로 프로덕션 서비스에서 데이터를 기록한 후 해당 데이터를 스테이징 환경으로 가져오는 것입니다. 이때 객체 저장소 테이블 함수나 ClickPipes(연속적 인제스트)를 사용할 수 있습니다.

CI 테스트를 위한 전용 환경을 사용하는 것은 프로덕션 환경에 영향을 주지 않고 수동 테스트를 수행할 수 있는 가능성도 제공합니다. 예를 들어, BI 도구를 이 환경에 포인팅하여 테스트할 수 있습니다.

배포(즉, CD 단계)의 경우, 우리는 프로덕션 배포에서 아티팩트를 사용하여 변경된 모델만 업데이트하는 것을 권장합니다. 이를 위해 dbt 아티팩트를 위한 객체 저장소(예: S3)를 중개 저장소로 설정해야 합니다. 설정이 완료되면 `dbt build --select state:modified+ --state path/to/last/deploy/state.json` 명령을 실행하여 마지막 프로덕션 실행 이후 변경된 내용을 기반으로 필요한 최소한의 모델만 선택적으로 재구성할 수 있습니다.

## 일반적인 문제 해결 {#troubleshooting-common-issues}

### 연결 문제 {#troubleshooting-connections}

dbt에서 ClickHouse에 연결하는 데 문제가 발생하면 다음 기준이 충족되는지 확인하십시오:

- 엔진은 [지원되는 엔진 목록](/integrations/dbt/features-and-configurations#supported-table-engines) 중 하나여야 합니다.
- 데이터베이스에 접근할 수 있는 적절한 권한이 있어야 합니다.
- 데이터베이스에 대한 기본 테이블 엔진을 사용하지 않는 경우, 모델 구성에서 테이블 엔진을 지정해야 합니다.

### 장기 실행 작업 이해하기 {#understanding-long-running-operations}

특정 ClickHouse 쿼리로 인해 일부 작업이 예상보다 오래 걸릴 수 있습니다. 어떤 쿼리가 더 오래 걸리는지에 대한 통찰력을 얻으려면 [로그 수준](https://docs.getdbt.com/reference/global-configs/logs#log-level)을 `debug`로 증가시키십시오. 이렇게 하면 각 쿼리에 사용된 시간이 출력됩니다. 예를 들어, dbt 명령에 `--log-level debug`를 추가하면 됩니다.

## 제한 사항 {#limitations}

현재 dbt를 위한 ClickHouse 어댑터에는 사용자가 알고 있어야 할 여러 제한 사항이 있습니다:

- 플러그인은 ClickHouse 버전 25.3 이상이 필요하다는 구문을 사용합니다. 우리는 이전 버전의 ClickHouse를 테스트하지 않습니다. 복제된 테이블에 대해서도 현재 테스트하지 않습니다.
- `dbt-adapter`의 서로 다른 실행이 동시에 실행되면 충돌할 수 있습니다. 이는 내부적으로 동일한 작업에 대해 같은 테이블 이름을 사용할 수 있기 때문입니다. 이에 대한 자세한 내용은 [이슈 #420](https://github.com/ClickHouse/dbt-clickhouse/issues/420)를 확인하십시오.
- 어댑터는 현재 모델을 테이블로 물리화하며 [INSERT INTO SELECT](https://clickhouse.com/docs/sql-reference/statements/insert-into#inserting-the-results-of-select)를 사용합니다. 이는 실행이 다시 수행될 경우 데이터 중복을 의미합니다. 매우 큰 데이터 세트(PB)는 실행 시간이 매우 길어져서 일부 모델이 비현실적일 수 있습니다. 성능을 개선하려면 ClickHouse 물리화된 뷰를 사용하고 `materialized: materialization_view`로 뷰를 구현하세요. 또한, 가능한 경우 `GROUP BY`를 활용하여 쿼리에서 반환되는 행 수를 최소화해야 합니다. 원본의 행 수를 유지하면서 단순히 변환하는 대신 데이터를 요약하는 모델을 선호해야 합니다.
- 분산 테이블을 모델로 표현하려면 사용자가 각 노드에 기본 복제 테이블을 수동으로 생성해야 합니다. 그런 다음 이 위에 분산 테이블을 생성할 수 있습니다. 어댑터는 클러스터 생성을 관리하지 않습니다.
- dbt가 데이터베이스에 관계(테이블/뷰)를 생성할 때 그것을 일반적으로 `{{ database }}.{{ schema }}.{{ table/view id }}`로 생성합니다. ClickHouse는 스키마 개념이 없습니다. 따라서 어댑터는 `{{schema}}.{{ table/view id }}`를 사용하며, 여기서 `schema`는 ClickHouse 데이터베이스입니다.
- Ephemeral 모델/CTE는 ClickHouse INSERT 문에서 `INSERT INTO` 이전에 배치할 경우 작동하지 않습니다. 이는 대부분의 모델에는 영향을 미치지 않지만, ephemeral 모델이 모델 정의 및 다른 SQL 문에서 어떤 위치에 있는지 주의해야 합니다. <!-- TODO 이 제한 사항 검토, 이슈는 이미 닫힌 것 같고 24.10에서 수정이 도입된 것으로 보입니다. -->

## Fivetran {#fivetran}

`dbt-clickhouse` 커넥터는 [Fivetran 변환](https://fivetran.com/docs/transformations/dbt)에서도 사용할 수 있으며, `dbt`를 사용하여 Fivetran 플랫폼 내에서 직접 통합 및 변환 기능을 제공합니다.
