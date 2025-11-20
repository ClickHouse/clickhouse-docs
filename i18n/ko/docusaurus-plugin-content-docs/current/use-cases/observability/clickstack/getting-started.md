---
'slug': '/use-cases/observability/clickstack/getting-started'
'title': 'ClickStack 시작하기'
'sidebar_label': '시작하기'
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/example-datasets/index'
'description': 'ClickStack 시작하기 - ClickHouse 가시성 스택'
'doc_type': 'guide'
'keywords':
- 'ClickStack'
- 'getting started'
- 'Docker deployment'
- 'HyperDX UI'
- 'ClickHouse Cloud'
- 'local deployment'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud-creds.png';
import add_connection from '@site/static/images/use-cases/observability/add_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import edit_cloud_connection from '@site/static/images/use-cases/observability/edit_cloud_connection.png';
import delete_source from '@site/static/images/use-cases/observability/delete_source.png';
import delete_connection from '@site/static/images/use-cases/observability/delete_connection.png';
import created_sources from '@site/static/images/use-cases/observability/created_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';

Getting started with **ClickStack**는 미리 구축된 Docker 이미지 덕분에 간단합니다. 이러한 이미지는 공식 ClickHouse Debian 패키지를 기반으로 하며 다양한 사용 사례에 맞춘 여러 배포판으로 제공됩니다.

## Local deployment {#local-deployment}

가장 간단한 옵션은 스택의 모든 핵심 구성 요소가 함께 Bundled된 **단일 이미지 배포**입니다:

- **HyperDX UI**
- **OpenTelemetry (OTel) 수집기**
- **ClickHouse**

이 올인원 이미지를 통해 한 명령어로 전체 스택을 실행할 수 있어 테스트, 실험 또는 빠른 로컬 배포에 이상적입니다.

<VerticalStepper headerLevel="h3">

### Deploy stack with docker {#deploy-stack-with-docker}

다음 명령어는 OpenTelemetry 수집기(포트 4317 및 4318)와 HyperDX UI(포트 8080)를 실행합니다.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note Persisting data and settings
컨테이너 재시작 간에 데이터와 설정을 지속적으로 유지하려면, 사용자가 위의 docker 명령을 수정하여 경로 `/data/db`, `/var/lib/clickhouse` 및 `/var/log/clickhouse-server`를 마운트할 수 있습니다. 

예를 들어:

```shell

# modify command to mount paths
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
:::

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)에 방문하여 HyperDX UI에 접근합니다.

사용자를 생성하고, 복잡성 요구 사항을 충족하는 사용자 이름과 비밀번호를 제공하십시오.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX는 자동으로 로컬 클러스터에 연결하여 로그, 추적, 메트릭 및 세션에 대한 데이터 소스를 생성하므로 즉시 제품을 탐색할 수 있습니다.

### Explore the product {#explore-the-product}

스택이 배포된 후, 동일한 데이터 세트 중 하나를 시도해 보세요.

로컬 클러스터를 계속 사용하려면:

- [예제 데이터 세트](/use-cases/observability/clickstack/getting-started/sample-data) - 공개 데모에서 예제 데이터 세트를 로드합니다. 간단한 문제를 진단합니다.
- [로컬 파일 및 메트릭](/use-cases/observability/clickstack/getting-started/local-data) - 로컬 OTel 수집기를 사용하여 OSX 또는 Linux에서 시스템을 모니터링하고 로컬 파일을 로드합니다.

<br/>
또는 데모 클러스터에 연결하여 더 큰 데이터 세트를 탐색할 수도 있습니다:

- [원격 데모 데이터 세트](/use-cases/observability/clickstack/getting-started/remote-demo-data) - 우리 데모 ClickHouse 서비스에서 데모 데이터 세트를 탐색합니다.

</VerticalStepper>

## Deploy with ClickHouse Cloud {#deploy-with-clickhouse-cloud}

사용자는 ClickHouse Cloud에 대해 ClickStack을 배포하여 완전히 관리되고 안전한 백엔드의 이점을 누리면서 데이터 수집, 스키마 및 가시성 워크플로에 대한 완전한 제어를 유지할 수 있습니다.

<VerticalStepper headerLevel="h3">

### Create a ClickHouse Cloud service {#create-a-service}

[ClickHouse Cloud 시작 가이드](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)를 따라 서비스를 생성합니다.

### Copy connection details {#copy-cloud-connection-details}

HyperDX의 연결 세부 정보를 찾으려면 ClickHouse Cloud 콘솔로 이동하여 사이드바에서 <b>Connect</b> 버튼을 클릭하세요. 

HTTP 연결 세부 사항, 특히 HTTPS 엔드포인트(`endpoint`) 및 비밀번호를 복사합니다.

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note Deploying to production
HyperDX에 연결하기 위해 `default` 사용자를 사용할 것이지만, [생산 환경으로 전환할 때](/use-cases/observability/clickstack/production#create-a-user) 별도의 사용자 생성이 권장됩니다.
:::

### Deploy with docker {#deploy-with-docker}

터미널을 열고 위에서 복사한 자격 증명을 내보냅니다:

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

다음 docker 명령을 실행합니다:

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

이 명령은 OpenTelemetry 수집기(포트 4317 및 4318)와 HyperDX UI(포트 8080)를 노출합니다.

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui-cloud}

[http://localhost:8080](http://localhost:8080)에 방문하여 HyperDX UI에 접근합니다.

사용자를 생성하고, 복잡성 요구 사항을 충족하는 사용자 이름과 비밀번호를 제공합니다. 

<Image img={hyperdx_login} alt="HyperDX Login" size="lg"/>

### Create a ClickHouse Cloud connection {#create-a-cloud-connection}

`Team Settings`로 이동하여 `Local Connection`의 `Edit`를 클릭합니다:

<Image img={edit_connection} alt="Edit Connection" size="lg"/>

연결 이름을 `Cloud`로 변경하고 이후 양식을 ClickHouse Cloud 서비스 자격 증명으로 작성한 후 `Save`를 클릭합니다:

<Image img={edit_cloud_connection} alt="Create Cloud connection" size="lg"/>

### Explore the product {#explore-the-product-cloud}

스택이 배포된 후, 동일한 데이터 세트 중 하나를 시도해 보세요.

- [예제 데이터 세트](/use-cases/observability/clickstack/getting-started/sample-data) - 공개 데모에서 예제 데이터 세트를 로드합니다. 간단한 문제를 진단합니다.
- [로컬 파일 및 메트릭](/use-cases/observability/clickstack/getting-started/local-data) - 로컬 OTel 수집기를 사용하여 OSX 또는 Linux에서 시스템을 모니터링하고 로컬 파일을 로드합니다.

</VerticalStepper>

## Local mode {#local-mode}

로컬 모드는 인증 없이 HyperDX를 배포할 수 있는 방법입니다. 

인증은 지원되지 않습니다. 

이 모드는 인증과 설정 지속성이 필요하지 않은 빠른 테스트, 개발, 데모 및 디버깅 사용 사례에 사용하기 위해 설계되었습니다.

### Hosted version {#hosted-version}

[play.hyperdx.io](https://play.hyperdx.io)에서 로컬 모드에서 사용할 수 있는 호스팅된 HyperDX 버전을 사용할 수 있습니다.

### Self-hosted version {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Run with docker {#run-local-with-docker}

자체 호스팅되는 로컬 모드 이미지는 OpenTelemetry 수집기와 ClickHouse 서버가 미리 구성되어 있습니다. 이렇게 하면 애플리케이션에서 수집한 텔레메트리 데이터를 HyperDX에서 최소한의 외부 설정으로 시각화할 수 있습니다. 자체 호스팅 버드를 시작하려면 적절한 포트가 포워딩된 상태로 Docker 컨테이너를 실행하면 됩니다:

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

사용자 생성을 위해 프롬프트가 표시되지 않으며, 로컬 모드는 인증을 포함하지 않기 때문입니다.

### Complete connection credentials {#complete-connection-credentials}

자신의 **외부 ClickHouse 클러스터**에 연결하려면 연결 자격 증명을 수동으로 입력할 수 있습니다.

또는 제품을 신속하게 탐색하려면 **Connect to Demo Server**를 클릭하여 미리 로드된 데이터 세트에 접근하고 기본 설정 없이 ClickStack을 시도할 수 있습니다.

<Image img={hyperdx_2} alt="Credentials" size="md"/>

데모 서버에 연결하는 경우, 사용자는 [데모 데이터 세트 지침](/use-cases/observability/clickstack/getting-started/remote-demo-data)을 통해 데이터 세트를 탐색할 수 있습니다.

</VerticalStepper>
