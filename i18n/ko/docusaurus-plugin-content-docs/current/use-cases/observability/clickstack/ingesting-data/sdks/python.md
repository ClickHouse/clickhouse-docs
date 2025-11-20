---
'slug': '/use-cases/observability/clickstack/sdks/python'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 7
'description': 'Python for ClickStack - ClickHouse 감시 스택'
'title': 'Python'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'sdk'
- 'logging'
- 'integration'
- 'application monitoring'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack은 텔레메트리 데이터(로그 및 추적)를 수집하기 위해 OpenTelemetry 표준을 사용합니다. 추적은 자동 계측으로 자동 생성되므로 추적에서 가치를 얻기 위해 수동 계측이 필요하지 않습니다.

이 가이드는 다음을 통합합니다:

- **로그**
- **메트릭**
- **추적**

## 시작하기 {#getting-started}

### ClickStack OpenTelemetry 계측 패키지 설치 {#install-clickstack-otel-instrumentation-package}

다음 명령을 사용하여 [ClickStack OpenTelemetry 패키지](https://pypi.org/project/hyperdx-opentelemetry/)를 설치합니다.

```shell
pip install hyperdx-opentelemetry
```

Python 애플리케이션에서 사용하는 패키지를 위한 OpenTelemetry 자동 계측 라이브러리를 설치합니다. 애플리케이션 패키지를 스캔하고 사용 가능한 라이브러리 목록을 생성하기 위해 OpenTelemetry Python SDK와 함께 제공되는 `opentelemetry-bootstrap` 도구를 사용하는 것을 권장합니다.

```shell
opentelemetry-bootstrap -a install
```

### 환경 변수 구성 {#configure-environment-variables}

그 다음, ClickStack에 텔레메트리를 전송하기 위해 셸에서 다음 환경 변수를 구성해야 합니다:

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

_`OTEL_SERVICE_NAME` 환경 변수는 HyperDX 앱에서 서비스를 식별하는 데 사용되며, 원하는 이름으로 설정할 수 있습니다._

### OpenTelemetry Python 에이전트와 함께 애플리케이션 실행 {#run-the-application-with-otel-python-agent}

이제 OpenTelemetry Python 에이전트(`opentelemetry-instrument`)와 함께 애플리케이션을 실행할 수 있습니다.

```shell
opentelemetry-instrument python app.py
```

#### `Gunicorn`, `uWSGI` 또는 `uvicorn`을 사용하는 경우 {#using-uvicorn-gunicorn-uwsgi}

이 경우, OpenTelemetry Python 에이전트가 작동하기 위해 추가적인 변경이 필요합니다.

사전 포크 웹 서버 모드를 사용하는 애플리케이션 서버에 대해 OpenTelemetry를 구성하려면, 포스트-포크 훅 내에서 `configure_opentelemetry` 메서드를 호출해야 합니다.

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

OpenTelemetry는 `--reload` 플래그를 사용하여 실행되는 `uvicorn`이나 다중 워커(`--workers`)와 함께 [현재 작동하지 않습니다](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385). 테스트 중에는 이러한 플래그를 비활성화하거나 Gunicorn을 사용하는 것을 권장합니다.

</TabItem>

</Tabs>

## 고급 구성 {#advanced-configuration}

#### 네트워크 캡처 {#network-capture}

네트워크 캡처 기능을 활성화하면 개발자는 HTTP 요청 헤더와 본문 페이로드를 효과적으로 디버깅할 수 있는 능력을 갖추게 됩니다. 이는 `HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` 플래그를 1로 설정하여 간단히 수행할 수 있습니다.

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```

## 문제 해결 {#troubleshooting}

### 로그 수준으로 인해 로그가 나타나지 않는 경우 {#logs-not-appearing-due-to-log-level}

기본적으로 OpenTelemetry 로깅 핸들러는 `logging.NOTSET` 수준을 사용하며, 이는 WARNING 수준으로 기본 설정됩니다. 로거를 생성할 때 로깅 수준을 지정할 수 있습니다:

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### 콘솔로 내보내기 {#exporting-to-the-console}

OpenTelemetry Python SDK는 일반적으로 오류가 발생할 때 콘솔에 오류를 표시합니다. 그러나 오류가 발생하지 않지만 예상대로 HyperDX에 데이터가 나타나지 않는 경우, 디버그 모드를 활성화할 수 있는 옵션이 있습니다. 디버그 모드가 활성화되면 모든 텔레메트리가 콘솔에 출력되어 애플리케이션이 예상 데이터로 제대로 계측되었는지 확인할 수 있습니다.

```shell
export DEBUG=true
```

Python OpenTelemetry 계측에 대해 더 읽어보려면 이곳을 방문하세요:
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
