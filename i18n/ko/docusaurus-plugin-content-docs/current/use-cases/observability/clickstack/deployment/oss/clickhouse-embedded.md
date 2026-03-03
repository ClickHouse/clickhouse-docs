---
slug: /use-cases/observability/clickstack/deployment/clickhouse-embedded
title: 'ClickHouse에 내장'
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'ClickHouse Server에 내장된 ClickStack 사용 - ClickHouse 관측성 스택'
doc_type: 'guide'
keywords: ['ClickStack 내장', 'ClickHouse 내장', 'ClickStack ClickHouse 서버', '기본 제공 관측성']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import authenticate from '@site/static/images/clickstack/deployment/embedded/authenticate.png';
import create_source from '@site/static/images/clickstack/deployment/embedded/create-source.png';

ClickStack는 ClickHouse 서버 바이너리에 직접 번들되어 있습니다. 따라서 추가 구성 요소를 별도로 배포할 필요 없이 ClickHouse 인스턴스에서 ClickStack UI(HyperDX)를 바로 사용할 수 있습니다. 이 배포 방식은 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)의 공개 데모와 유사하지만, 자체 ClickHouse 인스턴스와 데이터를 대상으로 실행됩니다.


### 적합한 경우 \{#suitable-for\}

* 최소한의 설정으로 ClickStack을 체험하려는 경우
* 관측성 UI에서 보유한 ClickHouse 데이터를 탐색하려는 경우
* 데모 및 평가용

### 제한 사항 \{#limitations\}

이 내장형 버전은 **운영 환경에서의 사용을 위해 설계되지 않았습니다**. 다음 기능은 [프로덕션 수준의 OSS 배포](/use-cases/observability/clickstack/deployment/oss)와 비교했을 때 제공되지 않습니다:

- [알림(Alerting)](/use-cases/observability/clickstack/alerts)
- [대시보드](/use-cases/observability/clickstack/dashboards) 및 [검색](/use-cases/observability/clickstack/search) 지속성 — 세션 간에 대시보드와 저장된 검색이 유지되지 않습니다.
- 쿼리 설정 사용자 정의
- [이벤트 패턴](/use-cases/observability/clickstack/event_patterns)

## 배포 단계 \{#deployment-steps\}

<VerticalStepper headerLevel="h3">

### ClickHouse 시작 \{#start-clickhouse\}

<Tabs groupId="install-method">
<TabItem value="docker" label="Docker" default>

비밀번호를 설정하여 ClickHouse 서버 이미지를 가져와 실행합니다:

```shell
docker run --rm -it -p 8123:8123 -e CLICKHOUSE_PASSWORD=password clickhouse/clickhouse-server:head-alpine
```

:::tip 비밀번호 없이 실행하기
비밀번호 없이 실행하려면 `default` 액세스 관리를 명시적으로 활성화해야 합니다:

```shell
docker run --rm -it -p 8123:8123 -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 clickhouse/clickhouse-server:head-alpine
```
:::

</TabItem>
<TabItem value="binary" label="Binary">

ClickHouse를 다운로드하고 시작합니다:

```shell
curl https://clickhouse.com/ | sh

./clickhouse server
```

바이너리로 실행하는 경우 `default` 사용자는 비밀번호가 없습니다.

</TabItem>
</Tabs>

### ClickStack UI로 이동 \{#navigate-to-clickstack-ui\}

브라우저에서 [http://localhost:8123](http://localhost:8123)를 열고 **ClickStack**을 클릭합니다.

자격 증명을 입력합니다. 위의 Docker 예제를 사용하는 경우 사용자 이름은 `default`, 비밀번호는 `password`입니다. 바이너리를 사용하는 경우 사용자 이름은 `default`이며 비밀번호는 없습니다.

<Image img={authenticate} alt="인증" size="lg"/>

### 소스 생성 \{#create-a-source\}

로그인 후 데이터 소스를 생성하라는 메시지가 표시됩니다. 기존 OpenTelemetry 테이블이 있는 경우 기본값을 유지하고 `Table` 필드를 해당 테이블 이름(예: `otel_logs`)으로 채웁니다. 다른 모든 설정은 자동으로 감지되므로 `Save New Source`를 클릭하면 됩니다.

아직 데이터가 없다면 ["데이터 수집"](/use-cases/observability/clickstack/ingesting-data) 또는 사용 가능한 옵션을 참고하십시오.

<Image img={create_source} alt="소스 생성" size="lg"/>

</VerticalStepper>

## 다음 단계 \{#next-steps\}

평가 단계를 넘어갈 준비가 되었다면 운영 환경에 적합한 배포를 고려하십시오:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one) — 영속성과 인증을 포함한 모든 구성 요소가 단일 컨테이너에 포함된 방식
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) — 더 세밀한 제어를 위한 개별 구성 요소 방식
- [Helm](/use-cases/observability/clickstack/deployment/helm) — 운영 환경 Kubernetes 배포에 권장되는 방식
- [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed) — ClickHouse Cloud에서 완전 관리형으로 제공되는 서비스