---
slug: /use-cases/observability/clickstack/sdks/python
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack용 Python - ClickHouse 관측성 스택'
title: 'Python'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack는 텔레메트리 데이터(로그와 트레이스)를 수집하기 위해 OpenTelemetry 표준을 사용합니다. 트레이스는 자동 계측을 통해 자동으로 생성되므로, 트레이싱을 활용하는 데 수동 계측은 필요하지 않습니다.

이 가이드에서는 다음을 통합합니다.

* **Logs**
* **Metrics**
* **Traces**


## 시작하기 \{#getting-started\}

### ClickStack OpenTelemetry 계측 패키지 설치 \{#install-clickstack-otel-instrumentation-package\}

다음 명령을 사용하여 [ClickStack OpenTelemetry 패키지](https://pypi.org/project/hyperdx-opentelemetry/)를 설치합니다.

```shell
pip install hyperdx-opentelemetry
```

Python 애플리케이션에서 사용하는 패키지에 대한 OpenTelemetry 자동 계측 라이브러리를 설치합니다. 애플리케이션 패키지를 스캔하고 사용 가능한 라이브러리 목록을 생성하기 위해 OpenTelemetry Python SDK에 포함된 `opentelemetry-bootstrap` 도구를 사용할 것을 권장합니다.

```shell
opentelemetry-bootstrap -a install
```


### 환경 변수 구성 \{#configure-environment-variables\}

이후 OpenTelemetry collector를 통해 ClickStack으로 텔레메트리 데이터를 수집하도록 셸에서 다음 환경 변수를 설정해야 합니다:

<Tabs groupId="service-type">
<TabItem value="clickstack-managed" label="관리형 ClickStack" default>

```shell
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

</TabItem>

<TabItem value="clickstack-oss" label="ClickStack 오픈 소스" >

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

</TabItem>
</Tabs>

_`OTEL_SERVICE_NAME` 환경 변수는 HyperDX 앱에서 서비스를 식별하는 데 사용되며, 원하는 임의의 이름을 사용할 수 있습니다._

### OpenTelemetry Python 에이전트로 애플리케이션 실행하기 \{#run-the-application-with-otel-python-agent\}

이제 OpenTelemetry Python 에이전트(`opentelemetry-instrument`)를 사용하여 애플리케이션을 실행할 수 있습니다.

```shell
opentelemetry-instrument python app.py
```


#### `Gunicorn`, `uWSGI` 또는 `uvicorn`을 사용하는 경우 \{#using-uvicorn-gunicorn-uwsgi\}

이 경우 OpenTelemetry Python 에이전트가 정상적으로 동작하려면 추가적인 변경이 필요합니다. 

pre-fork(프리 포크) 웹 서버 모드를 사용하는 애플리케이션 서버에서 OpenTelemetry를 구성하려면, post-fork(포크 이후) 훅 내부에서 `configure_opentelemetry` 메서드를 호출해야 합니다.

<Tabs groupId="python-alternative">
<TabItem value="gunicorn" label="Gunicorn" default>

```python
from hyperdx.opentelemetry import configure_opentelemetry

def post_fork(server, worker):
    configure_opentelemetry()
```
</TabItem>
<TabItem value="uwsgi" label="uWSGI" default>

```python
from hyperdx.opentelemetry import configure_opentelemetry
from uwsgidecorators import postfork

@postfork
def init_tracing():
    configure_opentelemetry()
```

</TabItem>

<TabItem value="uvicorn" label="uvicorn" default>

OpenTelemetry는 현재 [`--reload` 플래그 또는 멀티 워커(`--workers`)와 함께 실행되는 `uvicorn`에서는 동작하지 않습니다](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385). 테스트 시에는 해당 플래그를 비활성화하거나 Gunicorn을 사용하는 것을 권장합니다.

</TabItem>

</Tabs>

## 고급 설정 \{#advanced-configuration\}

#### 네트워크 캡처 \{#network-capture\}

네트워크 캡처 기능을 활성화하면 개발자는 HTTP 요청 헤더와 본문(payload)을 효과적으로 디버깅할 수 있습니다. 이 기능은 `HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` 플래그를 1로 설정하기만 하면 활성화됩니다.

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```


## 문제 해결 \{#troubleshooting\}

### 로그 레벨 때문에 로그가 나타나지 않는 경우 \{#logs-not-appearing-due-to-log-level\}

기본적으로 OpenTelemetry 로깅 핸들러는 `logging.NOTSET` 레벨을 사용하며,
이는 WARNING 레벨이 기본값입니다. 로거를 생성할 때 로깅 레벨을
지정할 수 있습니다:

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```


### 콘솔로 내보내기 \{#exporting-to-the-console\}

OpenTelemetry Python SDK는 보통 오류가 발생하면 콘솔에 오류를 표시합니다. 하지만 오류가 발생하지 않았는데도 HyperDX에 데이터가 예상대로 나타나지 않는 경우, 디버그 모드를 활성화할 수 있습니다. 디버그 모드를 활성화하면 모든 텔레메트리 데이터가 콘솔에 출력되므로, 애플리케이션이 예상된 데이터로 올바르게 계측되어 있는지 확인할 수 있습니다.

```shell
export DEBUG=true
```

Python OpenTelemetry 계측에 대해서는 다음 문서를 참고하십시오:
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
