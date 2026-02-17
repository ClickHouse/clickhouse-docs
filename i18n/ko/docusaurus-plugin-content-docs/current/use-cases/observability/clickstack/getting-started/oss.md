---
slug: /use-cases/observability/clickstack/getting-started/oss
title: '오픈 소스 ClickStack 시작하기'
sidebar_label: '오픈 소스'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: '오픈 소스 ClickStack 시작하기'
doc_type: 'guide'
keywords: ['ClickStack 오픈 소스', '시작하기', 'Docker 배포', 'HyperDX UI', '로컬 배포']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import add_connection from '@site/static/images/use-cases/observability/add_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import edit_cloud_connection from '@site/static/images/use-cases/observability/edit_cloud_connection.png';
import delete_source from '@site/static/images/use-cases/observability/delete_source.png';
import delete_connection from '@site/static/images/use-cases/observability/delete_connection.png';
import created_sources from '@site/static/images/use-cases/observability/created_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**ClickStack Open Source**를 배포하여 ClickHouse와 ClickStack UI를 직접 실행하고 관리하려는 경우, UI, OpenTelemetry collector, ClickHouse를 하나의 컨테이너로 번들링한 미리 빌드된 Docker 이미지를 제공합니다. 이를 통해 로컬 개발, 테스트, 자가 관리형 배포를 손쉽게 시작할 수 있습니다.

이 이미지는 공식 ClickHouse Debian 패키지를 기반으로 하며, 다양한 사용 사례에 맞게 여러 가지 배포 형태로 제공됩니다.

가장 간단한 옵션은 스택의 모든 핵심 구성 요소가 함께 번들된 **단일 이미지 배포본**입니다.

* **HyperDX UI**
* **OpenTelemetry (OTel) collector**
* **ClickHouse**

이 올인원 이미지를 사용하면 단일 명령으로 전체 스택을 실행할 수 있으므로, 테스트, 실험 또는 빠른 로컬 배포에 이상적입니다.


<VerticalStepper headerLevel="h2">

## docker로 스택 배포하기 \{#deploy-stack-with-docker\}

다음 명령은 OpenTelemetry collector(포트 4317 및 4318), HyperDX UI(포트 8080), 그리고 ClickHouse(포트 8123)를 실행합니다.

```shell
docker run --name clickstack -p 8123:8123 -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest clickstack
```

:::note 이미지 이름 업데이트
ClickStack 이미지는 이제 `clickhouse/clickstack-*` 형식으로 게시됩니다(이전에 사용되던 `docker.hyperdx.io/hyperdx/*`에서 변경되었습니다).
:::

:::tip 데이터와 설정 유지하기
컨테이너 재시작 시에도 데이터와 설정을 유지하려면, 위의 docker 명령을 수정하여 `/data/db`, `/var/lib/clickhouse`, `/var/log/clickhouse-server` 경로를 마운트하면 됩니다. 

예를 들면 다음과 같습니다.

```shell
# 경로를 마운트하도록 명령 수정
docker run \
  --name clickstack \
  -p 8123:8123 \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  clickhouse/clickstack-all-in-one:latest
```
:::

## ClickStack UI로 이동하기 \{#navigate-to-hyperdx-ui\}

[http://localhost:8080](http://localhost:8080)에 접속하여 ClickStack UI(HyperDX)를 이용합니다.

사용자를 생성한 후, 복잡도 요구 사항을 충족하는 사용자 이름과 비밀번호를 설정합니다. 

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX는 로컬 클러스터에 자동으로 연결하고 로그, 트레이스, 메트릭, 세션에 대한 데이터 소스를 생성하여, 즉시 제품을 탐색할 수 있도록 합니다.

## 제품 탐색하기 \{#explore-the-product\}

스택이 배포된 상태에서, 제공되는 예제 데이터셋 중 하나를 사용해 볼 수 있습니다.

로컬 클러스터를 계속 사용하려면:

- [예제 데이터셋](/use-cases/observability/clickstack/getting-started/sample-data) - 공개 데모에서 예제 데이터셋을 로드하여 간단한 문제를 진단합니다.
- [로컬 파일 및 메트릭](/use-cases/observability/clickstack/getting-started/local-data) - 로컬 OTel collector를 사용하여 OSX 또는 Linux에서 로컬 파일을 로드하고 시스템을 모니터링합니다.

<br/>
또는, 더 큰 데이터셋을 탐색할 수 있는 데모 클러스터에 연결할 수도 있습니다. 

- [원격 데모 데이터셋](/use-cases/observability/clickstack/getting-started/remote-demo-data) - 데모 ClickHouse 서비스에서 데모 데이터셋을 탐색합니다.

</VerticalStepper>

## 대안 배포 모델 \{#alternative-deployment-models\}

### 로컬 모드 \{#local-mode\}

로컬 모드는 인증 없이 HyperDX를 배포할 수 있는 방식입니다. 

**인증은 지원되지 않습니다.** 

이 모드는 인증과 설정의 영속성이 필요하지 않은 빠른 테스트, 개발, 데모 및 디버깅 사용 사례를 위해 사용하도록 설계되었습니다.

이 배포 모델에 대한 자세한 내용은 [「로컬 모드 전용」](/use-cases/observability/clickstack/deployment/local-mode-only) 을 참조하십시오.

### 호스티드 버전 \{#hosted-version\}

[play-clickstack.clickhouse.com](https://play-clickstack.clickstack.com)에서 로컬 모드로 제공되는 ClickStack의 호스티드 버전을 사용할 수 있습니다.

### 셀프 호스팅 버전 \{#self-hosted-version\}

<VerticalStepper headerLevel="h3">

### Docker로 실행 \{#run-local-with-docker\}

셀프 호스팅 로컬 모드 이미지는 OpenTelemetry collector, ClickStack UI, ClickHouse 서버가 미리 구성된 상태로 포함되어 있습니다. 이를 통해 최소한의 외부 설정만으로 애플리케이션에서 텔레메트리 데이터(telemetry data)를 수집하고 시각화할 수 있습니다. 셀프 호스팅 버전을 사용하려면, 적절한 포트를 포워딩하여 Docker 컨테이너를 실행하면 됩니다:

```shell
docker run -p 8080:8080 clickhouse/clickstack-local:latest
```

"All in one" 이미지와는 달리, **로컬 모드에는 인증이 포함되어 있지 않기 때문에** 사용자 생성을 위한 프롬프트가 표시되지 않습니다.

### 연결 자격 증명 입력 \{#complete-connection-credentials\}

보유한 **외부 ClickHouse 클러스터**에 연결하려면, 연결 자격 증명을 수동으로 입력할 수 있습니다.

또는, 제품을 빠르게 살펴보고 싶다면 **Connect to Demo Server**를 클릭하여 미리 로드된 데이터 세트에 접속하고, 추가 설정 없이 ClickStack을 바로 사용해 볼 수 있습니다.

<Image img={hyperdx_2} alt="자격 증명" size="md"/>

데모 서버에 연결하는 경우, [데모 데이터 세트 사용 방법](/use-cases/observability/clickstack/getting-started/remote-demo-data)을 참고하여 데이터 세트를 탐색할 수 있습니다.

</VerticalStepper>