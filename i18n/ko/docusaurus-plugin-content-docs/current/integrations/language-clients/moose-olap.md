---
description: 'Moose Stack 시작하기 - 타입 안전한 스키마와 로컬 개발 환경을 활용해 ClickHouse 위에 구축하기 위한 코드 중심 접근 방식'
sidebar_label: 'Moose OLAP (TypeScript / Python)'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: 'Moose OLAP을 사용한 ClickHouse 개발'
keywords: ['Moose']
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Moose OLAP을 사용한 ClickHouse 개발 \{#developing-on-clickhouse-with-moose-olap\}

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap)는 [Moose Stack](https://docs.fiveonefour.com/moose)의 핵심 모듈입니다. Moose Stack은 Typescript와 Python으로 실시간 분석 백엔드를 구축하기 위한 오픈 소스 개발자 도구 모음입니다. 

Moose OLAP은 ClickHouse에 최적화된 네이티브 설계를 기반으로, 개발자 친화적인 추상화와 ORM과 유사한 기능을 제공합니다.

## Moose OLAP의 주요 기능 \{#key-features\}

- **코드로 정의하는 스키마**: 타입 안전성과 IDE 자동 완성 기능을 활용하여 ClickHouse 테이블을 TypeScript 또는 Python으로 정의합니다.
- **타입 안전한 쿼리**: 타입 검사 및 자동 완성 지원과 함께 SQL 쿼리를 작성합니다.
- **로컬 개발**: 운영 환경에 영향을 주지 않고 로컬 ClickHouse 인스턴스를 대상으로 개발 및 테스트를 수행합니다.
- **마이그레이션 관리**: 스키마 변경 사항을 버전 관리하고 코드를 통해 마이그레이션을 관리합니다.
- **실시간 스트리밍**: 스트리밍 수집을 위해 ClickHouse를 Kafka 또는 Redpanda와 연동하는 기능을 기본으로 지원합니다.
- **REST API**: ClickHouse 테이블과 뷰(View)를 기반으로 완전히 문서화된 REST API를 손쉽게 생성합니다.

## 5분 이내에 시작하기 \{#getting-started\}

최신 설치 및 시작 안내는 [Moose Stack 문서](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse)를 참조하십시오.

또는 이 가이드를 따르면 기존 ClickHouse 또는 ClickHouse Cloud 배포 환경에서 5분 이내에 Moose OLAP을 설치하고 실행할 수 있습니다.

### 사전 준비 사항 \{#prerequisites\}

- **Node.js 20+** 또는 **Python 3.12+** - TypeScript 또는 Python 개발에 필요합니다.
- **Docker Desktop** - 로컬 개발 환경에 필요합니다.
- **macOS/Linux** - Windows는 WSL2를 통해 사용할 수 있습니다.

<VerticalStepper headerLevel="h3">

### Moose 설치 \{#step-1-install-moose\}

시스템에 Moose CLI를 전역으로 설치합니다:

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### 프로젝트 설정 \{#step-2-set-up-project\}

#### 옵션 A: 기존 ClickHouse 배포 환경 사용 \{#option-a-use-own-clickhouse\}

**중요**: 운영 환경의 ClickHouse에는 어떤 영향도 주지 않습니다. 이 과정은 ClickHouse 테이블에서 유도된 데이터 모델을 기반으로 새로운 Moose OLAP 프로젝트를 초기화하기만 합니다.

```bash
# TypeScript
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript

# Python
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python
```

ClickHouse 연결 문자열은 다음 형식이어야 합니다:

```bash
https://username:password@host:port/?database=database_name
```

#### 옵션 B: ClickHouse Playground 사용 \{#option-b-use-clickhouse-playground\}

아직 ClickHouse를 준비하지 않았다면, ClickHouse Playground를 사용하여 Moose OLAP을 시험해 볼 수 있습니다.

```bash
# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript

# Python
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language python
```

### 의존성 설치 \{#step-3-install-dependencies\}

```bash
# TypeScript
cd my-project
npm install

# Python
cd my-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

다음과 같은 메시지가 표시되어야 합니다: `Successfully generated X models from ClickHouse tables`

### 생성된 모델 살펴보기 \{#step-4-explore-models\}

Moose CLI는 기존 ClickHouse 테이블로부터 자동으로 TypeScript 인터페이스 또는 Python Pydantic 모델을 생성합니다.

`app/index.ts` 파일에서 새 데이터 모델을 확인하십시오.

### 개발 시작 \{#step-5-start-development\}

개발 서버를 시작하여 로컬 ClickHouse 인스턴스를 실행합니다. 코드 정의를 기준으로 운영 환경의 모든 테이블이 자동으로 재생성됩니다:

```bash
moose dev
```

**중요**: 운영 환경의 ClickHouse에는 어떤 영향도 주지 않습니다. 이 명령은 로컬 개발 환경을 생성합니다.

### 로컬 데이터베이스 시드(seed) \{#step-6-seed-database\}

로컬 ClickHouse 인스턴스에 데이터를 시드(seed)합니다:

#### 자체 ClickHouse에서 시드 \{#from-own-clickhouse\}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### ClickHouse Playground에서 시드 \{#from-clickhouse-playground\}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### Moose OLAP로 빌드하기 \{#step-7-building-with-moose-olap\}

이제 코드에서 테이블을 정의했으므로, 웹 애플리케이션의 ORM 데이터 모델과 같은 이점을 누릴 수 있습니다. 분석 데이터 위에 API와 materialized view를 구축할 때 타입 안정성과 자동 완성 기능을 제공합니다. 다음 단계로는 다음과 같은 작업을 시도할 수 있습니다:
* [Moose API](https://docs.fiveonefour.com/moose/apis)를 사용하여 REST API를 구축합니다.
* [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) 또는 [Moose Streaming](https://docs.fiveonefour.com/moose/workflows)을 사용하여 데이터를 수집하거나 변환합니다.
* [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) 및 [Moose Migrate](https://docs.fiveonefour.com/moose/migrate)를 사용하여 운영 환경으로 전환하는 방안을 검토합니다.

</VerticalStepper>

## 도움을 받고 커뮤니티와 소통하기 \{#get-help-stay-connected\}

- **Reference Application**: 오픈 소스 레퍼런스 애플리케이션인 [Area Code](https://github.com/514-labs/area-code)를 살펴보십시오. 특수한 인프라가 필요한 기능이 풍부한 엔터프라이즈급 애플리케이션을 위한 필수 구성 요소가 모두 포함된 시작용 리포지토리입니다. 두 가지 샘플 애플리케이션(User Facing Analytics, Operational Data Warehouse)이 포함되어 있습니다.
- **Slack Community**: 지원 및 피드백을 위해 [Slack에서](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg) Moose Stack 메인테이너와 소통하십시오.
- **Watch Tutorials**: Moose Stack 기능에 대한 동영상 튜토리얼, 데모, 심층 분석을 [YouTube에서](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw) 확인하십시오.
- **Contribute**: 코드를 확인하고 Moose Stack에 기여하거나, [GitHub에서](https://github.com/514-labs/moose) 이슈를 등록하십시오.