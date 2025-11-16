---
'description': 'ClickHouse 위에 타입-안전 스키마와 로컬 개발을 통해 코드 우선 접근 방식인 Moose Stack으로 시작하세요.'
'sidebar_label': 'Moose OLAP (TypeScript / Python)'
'sidebar_position': 25
'slug': '/interfaces/third-party/moose-olap'
'title': 'ClickHouse에서 Moose OLAP로 개발하기'
'keywords':
- 'Moose'
'doc_type': 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouse에서 Moose OLAP으로 개발하기

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap)는 [Moose Stack](https://docs.fiveonefour.com/moose)의 핵심 모듈로, Typescript와 Python으로 실시간 분석 백엔드를 구축하기 위한 오픈 소스 개발자 툴킷입니다.

Moose OLAP는 ClickHouse를 위해 본격적으로 구축된 개발자 친화적인 추상화 및 ORM과 유사한 기능을 제공합니다.

## Moose OLAP의 주요 기능 {#key-features}

- **코드로서의 스키마**: 타입 안전성과 IDE 자동 완성 기능을 갖춘 TypeScript 또는 Python으로 ClickHouse 테이블 정의
- **타입 안전 쿼리**: 타입 검사 및 자동 완성 지원으로 SQL 쿼리 작성
- **로컬 개발**: 프로덕션에 영향을 미치지 않고 로컬 ClickHouse 인스턴스에서 개발 및 테스트
- **마이그레이션 관리**: 코드로 스키마 변경 사항에 대한 버전 관리를 수행하고 마이그레이션 관리
- **실시간 스트리밍**: ClickHouse와 Kafka 또는 Redpanda를 페어링하여 스트리밍 수집을 위한 내장 지원
- **REST API**: ClickHouse 테이블 및 뷰 위에 완전히 문서화된 REST API를 쉽게 생성

## 5분 이내 시작하기 {#getting-started}

최신 및 최고의 설치 및 시작 가이드는 [Moose Stack 문서](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse)를 참조하세요.

또는 이 가이드를 따라 ClickHouse 또는 ClickHouse Cloud 배포에서 5분 이내에 Moose OLAP을 설정하고 실행하세요.

### 필수 조건 {#prerequisites}

- **Node.js 20+** 또는 **Python 3.12+** - TypeScript 또는 Python 개발에 필요
- **Docker Desktop** - 로컬 개발 환경
- **macOS/Linux** - Windows는 WSL2를 통해 작동

<VerticalStepper headerLevel="h3">

### Moose 설치 {#step-1-install-moose}

Moose CLI를 시스템에 전역으로 설치합니다:

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### 프로젝트 설정 {#step-2-set-up-project}

#### 옵션 A: 기존 ClickHouse 배포 사용 {#option-a-use-own-clickhouse}

**중요**: 귀하의 프로덕션 ClickHouse는 변경되지 않습니다. 이것은 귀하의 ClickHouse 테이블에서 파생된 데이터 모델로 새로운 Moose OLAP 프로젝트를 초기화합니다.

```bash

# TypeScript
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript


# Python
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python
```

귀하의 ClickHouse 연결 문자열은 이 형식이어야 합니다:

```bash
https://username:password@host:port/?database=database_name
```

#### 옵션 B: ClickHouse 놀이터 사용 {#option-b-use-clickhouse-playground}

아직 ClickHouse가 작동하고 있지 않나요? ClickHouse 놀이터를 사용하여 Moose OLAP을 시도해 보세요!

```bash

# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript


# Python
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language python
```

### 의존성 설치 {#step-3-install-dependencies}

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

다음 메시지가 표시되어야 합니다: `Successfully generated X models from ClickHouse tables`

### 생성된 모델 탐색 {#step-4-explore-models}

Moose CLI는 기존 ClickHouse 테이블에서 자동으로 TypeScript 인터페이스 또는 Python Pydantic 모델을 생성합니다.

`app/index.ts` 파일에서 새로운 데이터 모델을 확인하세요.

### 개발 시작 {#step-5-start-development}

모든 프로덕션 테이블이 코드 정의에서 자동으로 재생성된 로컬 ClickHouse 인스턴스를 시작할 dev 서버를 시작합니다:

```bash
moose dev
```

**중요**: 귀하의 프로덕션 ClickHouse는 변경되지 않습니다. 이것은 로컬 개발 환경을 생성합니다.

### 로컬 데이터베이스 초기화 {#step-6-seed-database}

로컬 ClickHouse 인스턴스에 데이터를 초기화합니다:

#### 자신의 ClickHouse에서 {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### ClickHouse 놀이터에서 {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### Moose OLAP으로 구축하기 {#step-7-building-with-moose-olap}

이제 코딩으로 테이블을 정의했으므로, 웹 앱에서 ORM 데이터 모델의 동일한 이점을 얻을 수 있습니다 - 분석 데이터를 기반으로 하는 API 및 물리화된 뷰를 구축할 때 타이프 안전성과 자동 완성 기능이 제공됩니다. 다음 단계로:
* [Moose API](https://docs.fiveonefour.com/moose/apis)로 REST API 구축
* [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) 또는 [Moose Streaming](https://docs.fiveonefour.com/moose/workflows)로 데이터 수집 또는 변환
* [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) 및 [Moose Migrate](https://docs.fiveonefour.com/moose/migrate)를 통해 프로덕션으로 진행하기 탐색

</VerticalStepper>

## 도움을 요청하고 연결 유지하기 {#get-help-stay-connected}
- **참조 애플리케이션**: 오픈 소스 참조 애플리케이션인 [Area Code](https://github.com/514-labs/area-code)를 확인하세요: 특수화된 인프라가 필요한 기능이 풍부하고 기업 준비가 완료 된 애플리케이션을 위한 스타터 레포입니다. 두 개의 샘플 애플리케이션이 있습니다: 사용자 분석 및 운영 데이터 웨어하우스.
- **Slack 커뮤니티**: 지원 및 피드백을 위해 Moose Stack 유지 관리자를 [Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg)에서 연결하세요.
- **튜토리얼 보기**: Moose Stack 기능에 대한 비디오 튜토리얼, 데모 및 심층 탐색 [YouTube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw)에서 확인하세요.
- **기여**: 코드를 확인하고, Moose Stack에 기여하며, [GitHub](https://github.com/514-labs/moose)에서 문제를 보고하세요.
