---
date: 2023-06-07
title: "ClickHouse용 스키마 마이그레이션 도구"
description: "ClickHouse용 스키마 마이그레이션 도구와 시간 경과에 따라 변화하는 데이터베이스 스키마를 관리하는 방법을 알아봅니다."
tags: ['도구 및 유틸리티']
keywords: ['자동 스키마 마이그레이션']
---

{frontMatter.description}

{{/* 생략 */}}

# ClickHouse 스키마 마이그레이션 도구 \{#schema-migration-tools-for-clickhouse\}

## Schema Management란 무엇입니까? \{#what-is-schema-management\}

Schema management는 데이터베이스 스키마에 버전 관리 원칙을 적용하는 것을 말합니다. 이는 종종 테이블, 컬럼, 그리고 이들 간의 관계에 대한 변경 사항을 추적하고 자동화하여
스키마 업데이트가 환경 전반에서 반복 가능하고, 감사 가능하며, 일관되도록 만드는 작업을 포함합니다. Schema management는 데이터베이스의 데이터 구조를 새로운 사용 사례에 맞추거나
성능 최적화를 위해 수정해야 할 때 필요합니다.

### 왜 중요할까요? \{#why-is-it-important\}

스키마 관리 도구를 사용하면 애플리케이션 배포와 함께 스키마 변경을 자동화할 수 있습니다. 스키마 변경이 새로운 애플리케이션 버전을 배포하기 위한 선행 조건이 되는 경우가 흔합니다. 이러한 도구는 사용자가 한 버전의 데이터베이스에서 다른 버전으로 &quot;마이그레이션(migration)&quot;을 수행한다는 의미에서 「schema migration」 또는 「database migration」 도구라고도 불립니다.

스키마 관리 도구가 없으면 데이터베이스 변경은 수동으로 이루어지며, 오류가 발생하기 쉽고, 팀과 환경 간에 조율하기 어렵습니다. 항상 데이터베이스에 직접 DDL을 실행할 수는 있지만, 이러한 도구를 사용하면 버전 관리(변경 사항을 버전 관리되는 코드로 추적), 자동 배포(개발/스테이징/운영 환경 전반에 변경을 일관되게 적용), 롤백 지원(문제가 발생했을 때 변경 사항 되돌리기), 감사 추적(무엇이 언제 변경되었는지 기록)을 할 수 있습니다. 특히 특정 DDL 변경에 비용이 많이 들거나 되돌릴 수 없는 경우가 있는 ClickHouse에서는, 검토 단계를 포함한 체계적인 마이그레이션 프로세스를 갖추는 것이 매우 중요합니다.

### 스키마 관리 접근 방식의 유형 \{#types-of-schema-management-approaches\}

스키마 관리 도구는 일반적으로 크게 두 가지 유형으로 나눌 수 있습니다.

#### 명령형(Imperative) \{#imperative\}

이러한 도구는 상태 A에서 상태 B로 *어떻게* 이동할지를 기술한 버전이 관리되는 SQL 파일을 사용합니다. `CREATE TABLE`, `ALTER TABLE`, `DROP COLUMN`과 같은 DDL 문을 파일에 명시적으로 작성합니다. 그런 다음 도구가 파일을 순서대로 실행하고, 어떤 파일들이 적용되었는지 추적합니다. 이 범주에서는 실행할 정확한 SQL을 사용자가 지정합니다.
**예시**: *golang-migrate, Goose, Flyway*

#### 선언적(Declarative) \{#declarative\}

이 범주의 도구는 먼저 사용자가 「원하는 상태(desired state)」의 스키마 정의를 지정하는 것에서 시작합니다. 도구는 현재 데이터베이스와 원하는 상태 간의 차이를 감지한 후, 필요한 마이그레이션을 생성하고 적용합니다. 이 방식은 수동으로 마이그레이션을 작성하는 작업과 스키마 드리프트(schema drift)를 줄여 줍니다. 이 범주에서는 도구가 실행할 정확한 SQL을 결정합니다.
**예시**: *Atlas, Liquibase*

세 번째 유형의 도구는 데이터베이스 스키마 변경이나 구조 자체보다 데이터 자체를 변환하는 데 더 초점을 둡니다.
**예시**: *dbt*
이 문서에서는 데이터베이스 스키마 변경을 위한 도구에만 집중합니다.

전반적으로, 사용자와 팀이 어떠한 방식으로 운영하고자 하는지에 맞는 도구를 선택할 것을 권장합니다. 명령형(Imperative) 도구는 어떤 DDL이 실행될지에 대해 완전한 가시성을 제공합니다. 그러나 차이를 비교하고 스키마 드리프트를 관리하기 위해 사용자의 상당한 주의와 노력이 필요합니다. 선언적(Declarative) 도구는 반복적인 유지 보수 작업을 자동화하고 스키마 드리프트를 방지하는 데 유용하지만, ClickHouse에 적용하기 전에 항상 생성된 계획을 검토하여 자동 생성된 계획 뒤에 예기치 않은 mutation이나 비용이 큰 재작성(rewrite) 작업이 숨겨져 있지 않은지 반드시 확인해야 합니다.

## 도구 선택 시 고려할 점 \{#what-to-consider-when-choosing-a-tool\}

### 팀에서 이미 사용 중인 도구는 무엇입니까? \{#what-does-your-team-already-use\}

일반적으로는 익숙한 생태계에 속한 도구를 선택하게 됩니다. 팀이 Go로 개발한다면 golang-migrate 또는 Goose가 자연스럽게 느껴질 수 있습니다. Java 생태계를 사용한다면 이미 Flyway나
Liquibase를 도입했을 수 있습니다. 인프라 팀이 Terraform과 인프라-애즈-코드 패턴을 사용한다면 Atlas의 선언적 모델이 자연스럽게 잘 맞을 수 있습니다. 팀이 이미 알고 있는 도구를 선택하는 것에는 의미 있는 장점이 있습니다. 궁극적으로 가장 좋은 도구는 실제로 도입되어 일관되게 사용되는 도구이기 때문입니다.

### 원하는 프로세스는 무엇입니까? \{#what-is-your-desired-process\}

스키마 변경이 조직 내에서 어떻게 진행되는지 생각해 보십시오. 다음과 같은 점이 필요한지 고려하십시오.

* 단순한 「SQL 작성, CI에서 실행, 완료」 워크플로우 (예: Goose, golang-migrate)
* 관리되는 승인 워크플로우, 감사 기록(audit trail), RBAC (예: Bytebase, Liquidbase)
* 스키마를 선언적으로 정의하고 도구가 diff를 자동으로 계산해 주는 방식 (예: Atlas)

요구 사항과 프로세스에 맞는 도구를 선택하십시오.

## 권장 도구 \{#recommended-tools\}

성숙도, ClickHouse와의 호환성, 커뮤니티 채택도, 운영 환경 적합성을 기준으로 ClickHouse 사용자에게 권장하는 도구들입니다.

### Atlas \{#atlas\}

[Atlas](https://atlasgo.io/guides/clickhouse)는 선언적 접근 방식을 사용하는 schema-as-code 도구입니다. HCL 또는 SQL로 원하는 스키마 상태를 정의하면 Atlas가 현재 데이터베이스를 검사하고 차이점을 계산한 뒤 마이그레이션 플랜을 생성하고 적용합니다. 이때 적용 전에 사용자가 검토하도록 선택할 수도 있습니다.

**ClickHouse에 적합한 이유:** Atlas는 테이블, 뷰(views), materialized views, 프로젝션(projections), 파티션(partitions), UDF 등을 포함해 ClickHouse를 최우선으로 지원합니다. v0.37(2025년 9월)에 클러스터 지원이 추가되었습니다. HCL과 일반 SQL 스키마 정의를 모두 지원합니다.

**주의할 점:** Atlas는 마이그레이션 플랜을 생성하지만, 해당 플랜의 *비용*은 이해하지 못합니다. 예를 들어 컬럼 타입 변경처럼 diff가 단순해 보이더라도, 수십 테라바이트 테이블에서 비용이 많이 드는 변경 작업을 유발할 수 있습니다. 항상 생성된 플랜을 적용하기 전에 검토해야 합니다.

**적합한 경우:** 인프라를 코드로 관리하는 워크플로와 자동 드리프트 감지를 원하는 팀에 적합합니다.

* **유형:** 선언적
* **언어:** Go (단일 바이너리)
* **라이선스:** Open Core (Apache 2.0 커뮤니티; 고급 기능을 위한 유료 티어)
* **클러스터 지원:** 예

### golang-migrate \{#golang-migrate\}

[golang-migrate](https://github.com/golang-migrate/migrate)는 단순하고 널리 사용되는 마이그레이션 실행 도구입니다. up/down 단계가 있는 버전 관리 SQL 파일을 작성하면, 이 도구가 순서대로 적용하고 ClickHouse 데이터베이스의 `schema_migrations` 테이블에 상태를 기록합니다.

**ClickHouse에 적합한 이유:** 단순하면서도 유연합니다. 실행하려는 ClickHouse DDL을 그대로 작성하면 됩니다. 런타임 의존성이 없는 단일 Go 바이너리이므로 CI/CD 파이프라인이나 Docker 컨테이너에 쉽게 통합할 수 있습니다.

**주의할 점:** 하나의 마이그레이션 파일에 여러 SQL 문이 포함되어 있고 그중 하나가 중간에 실패하면, 수동 개입이 필요한 부분적으로 잘못된 상태의 데이터베이스가 될 수 있습니다. 파일당 SQL 문을 하나만 두는 원칙을 따르면 관리 가능합니다.

**적합한 경우:** 단순성을 원하고, ClickHouse 인스턴스에서 정확히 어떤 SQL이 실행되는지에 대해 완전한 제어를 원하는 팀에 적합합니다.

* **유형(Type):** 명령형
* **언어(Language):** Go
* **라이선스(License):** 오픈 소스(MIT, 무료)
* **클러스터 지원(Cluster support):** 예

### Goose \{#goose\}

[Goose](https://github.com/pressly/goose)는 golang-migrate와 유사한 철학을 가진 또 다른 Go 기반 마이그레이션 도구입니다. 버전이 지정된 SQL 파일(또는 복잡한 로직을 위한 Go 함수)을 작성하면 Goose가 이를 순차적으로 적용하고, ClickHouse의 버전 테이블에 상태를 기록합니다.

**ClickHouse에 잘 맞는 이유:** golang-migrate와 동일한 근본적인 강점을 제공합니다 — SQL 우선 접근, 최소한의 설정, 사용하기 쉬운 CLI, 직관적인 CI/CD 통합. Goose는 마이그레이션을 Go 함수로 작성하는 것도 지원하므로, 순수 SQL만으로는 표현하기 어려운 복잡한 로직을 더 유연하게 처리할 수 있습니다.

**주의할 점:** 스키마 차이 비교(schema diffing)나 자동 생성(autogeneration) 기능이 없습니다.

**적합한 경우:** 이미 Goose를 사용 중이거나, golang-migrate보다 Goose의 마이그레이션 파일 규약을 선호하는 팀.

* **유형(Type):** 명령형(Imperative)
* **언어(Language):** Go (단일 바이너리)
* **라이선스(License):** 오픈 소스(MIT, 무료)
* **클러스터 지원:** 없음

## 에코시스템 내 다른 도구 \{#other-tools-in-the-ecosystem\}

다음 도구들도 ClickHouse와 함께 사용할 수 있습니다. 사용하는 스택과 워크플로우에 따라 더 적합할 수 있습니다. 다만 일반적으로는 위에서 소개한 도구들을 우선적으로 권장합니다.

| Tool                                                                         | License     | 다음과 같은 경우에 적합                                                               |
| :--------------------------------------------------------------------------- | :---------- | :-------------------------------------------------------------------------- |
| [Bytebase](https://www.bytebase.com/)                                        | Open Core   | 여러 환경에 대해 거버넌스, 승인 워크플로우, 감사 추적이 필요한 대규모 조직                                 |
| [Flyway](https://flywaydb.org/)                                              | Open Source | 이미 Flyway 또는 JVM 기반 인프라로 표준화된 팀                                             |
| [Liquibase](https://www.liquibase.org/)                                      | Open Core   | 여러 데이터베이스에 Liquibase를 사용하면서 일관성을 원하는 팀                                      |
| [clickhouse-migrations](https://www.npmjs.com/package/clickhouse-migrations) | Open Source | 간단하며 ClickHouse에 초점을 맞춘 실행 도구가 필요한 Node/TypeScript 팀                        |
| [Houseplant](https://github.com/junehq/houseplant)                           | Open Source | 환경별 설정을 인지하는 ClickHouse 전용 도구를 원하는 Python 팀                                 |
| [Sqitch](https://sqitch.org/)                                                | Open Source | ClickHouse Client를 직접 사용하는 배포 스크립트를 선호하거나, 복잡한 배포 전반에 걸친 명시적인 의존성 관리가 필요한 팀 |
| [Alembic](https://alembic.sqlalchemy.org/) (SQLAlchemy)                      | Open Source | 데이터베이스 접근에 이미 SQLAlchemy를 사용 중인 Python 팀                                    |