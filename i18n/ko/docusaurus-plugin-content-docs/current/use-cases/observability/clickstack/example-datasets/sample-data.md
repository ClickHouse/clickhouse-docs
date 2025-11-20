---
'slug': '/use-cases/observability/clickstack/getting-started/sample-data'
'title': '샘플 로그, 트레이스 및 메트릭'
'sidebar_position': 0
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack과 로그, 세션, 트레이스 및 메트릭이 포함된 샘플 데이터 세트로 시작하기'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'example data'
- 'sample dataset'
- 'logs'
- 'observability'
---

import Image from '@theme/IdealImage';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import hyperdx_3 from '@site/static/images/use-cases/observability/hyperdx-3.png';
import hyperdx_4 from '@site/static/images/use-cases/observability/hyperdx-4.png';
import hyperdx_5 from '@site/static/images/use-cases/observability/hyperdx-5.png';
import hyperdx_6 from '@site/static/images/use-cases/observability/hyperdx-6.png';
import hyperdx_7 from '@site/static/images/use-cases/observability/hyperdx-7.png';
import hyperdx_8 from '@site/static/images/use-cases/observability/hyperdx-8.png';
import hyperdx_9 from '@site/static/images/use-cases/observability/hyperdx-9.png';
import hyperdx_10 from '@site/static/images/use-cases/observability/hyperdx-10.png';
import hyperdx_11 from '@site/static/images/use-cases/observability/hyperdx-11.png';
import hyperdx_12 from '@site/static/images/use-cases/observability/hyperdx-12.png';
import hyperdx_13 from '@site/static/images/use-cases/observability/hyperdx-13.png';
import hyperdx_14 from '@site/static/images/use-cases/observability/hyperdx-14.png';
import hyperdx_15 from '@site/static/images/use-cases/observability/hyperdx-15.png';
import hyperdx_16 from '@site/static/images/use-cases/observability/hyperdx-16.png';
import hyperdx_17 from '@site/static/images/use-cases/observability/hyperdx-17.png';
import hyperdx_18 from '@site/static/images/use-cases/observability/hyperdx-18.png';
import hyperdx_19 from '@site/static/images/use-cases/observability/hyperdx-19.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';


# ClickStack - 샘플 로그, 추적 및 메트릭 {#clickstack-sample-dataset}

다음 예는 [올인원 이미지에 대한 설명서](/use-cases/observability/clickstack/getting-started)를 사용하여 ClickStack을 시작하고 [로컬 ClickHouse 인스턴스](/use-cases/observability/clickstack/getting-started#complete-connection-credentials) 또는 [ClickHouse Cloud 인스턴스](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)에 연결했다고 가정합니다. 

:::note ClickHouse Cloud의 HyperDX
이 샘플 데이터 세트는 HyperDX를 ClickHouse Cloud에서 사용할 수도 있으며, 흐름에 대한 약간의 조정이 필요합니다. ClickHouse Cloud에서 HyperDX를 사용하는 경우, 사용자는 [이 배포 모델에 대한 시작하기 가이드](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)에 설명된 대로 로컬에서 Open Telemetry 수집기가 실행 중이어야 합니다.
:::

<VerticalStepper>

## HyperDX UI로 이동 {#navigate-to-the-hyperdx-ui}

로컬로 배포하는 경우 [http://localhost:8080](http://localhost:8080)에 방문하여 HyperDX UI에 접근합니다. ClickHouse Cloud에서 HyperDX를 사용하는 경우, 왼쪽 메뉴에서 서비스를 선택하고 `HyperDX`를 선택합니다.

<Image img={hyperdx} alt="HyperDX UI" size="lg"/>

## 데이터 수집 API 키 복사 {#copy-ingestion-api-key}

:::note ClickHouse Cloud의 HyperDX
ClickHouse Cloud에서 HyperDX를 사용하는 경우 이 단계는 필요하지 않으며, 데이터 수집 키 지원은 현재 지원되지 않습니다.
:::

[`팀 설정`](http://localhost:8080/team)으로 이동하여 `API Keys` 섹션에서 `Ingestion API Key`를 복사합니다. 이 API 키는 OpenTelemetry 수집기를 통해 데이터 수집이 안전하게 이루어지도록 보장합니다.

<Image img={copy_api_key} alt="Copy API key" size="lg"/>

## 샘플 데이터 다운로드 {#download-sample-data}

UI에 샘플 데이터를 채우려면 다음 파일을 다운로드합니다:

[샘플 데이터](https://storage.googleapis.com/hyperdx/sample.tar.gz)

```shell

# curl
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz

# or

# wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

이 파일에는 공개 [OpenTelemetry 데모](https://github.com/ClickHouse/opentelemetry-demo)에서 가져온 예제 로그, 메트릭 및 추적이 포함되어 있습니다 - 마이크로서비스를 사용하는 간단한 전자 상거래 상점입니다. 이 파일을 원하는 디렉토리에 복사합니다.

## 샘플 데이터 로드 {#load-sample-data}

이 데이터를 로드하기 위해, 배포된 OpenTelemetry (OTel) 수집기의 HTTP 엔드포인트로 간단히 보냅니다. 

먼저, 위에서 복사한 API 키를 내보냅니다.

:::note ClickHouse Cloud의 HyperDX
ClickHouse Cloud에서 HyperDX를 사용하는 경우 이 단계는 필요하지 않으며, 데이터 수집 키 지원은 현재 지원되지 않습니다.
:::

```shell

# export API key
export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
```

다음 명령을 실행하여 데이터를 OTel 수집기로 보냅니다:

```shell
for filename in $(tar -tf sample.tar.gz); do
  endpoint="http://localhost:4318/v1/${filename%.json}"
  echo "loading ${filename%.json}"
  tar -xOf sample.tar.gz "$filename" | while read -r line; do
    printf '%s\n' "$line" | curl -s -o /dev/null -X POST "$endpoint" \
    -H "Content-Type: application/json" \
    -H "authorization: ${CLICKSTACK_API_KEY}" \
    --data-binary @-
  done
done
```

이것은 OTLP 로그, 추적 및 메트릭 소스가 OTel 수집기로 데이터를 보내는 것을 시뮬레이션합니다. 프로덕션에서는 이러한 소스가 언어 클라이언트 또는 다른 OTel 수집기일 수 있습니다.

`검색` 보기로 돌아가면 데이터가 로드되기 시작했음을 볼 수 있습니다 (데이터가 표시되지 않는 경우 시간 범위를 `지난 1시간`으로 조정하세요):

<Image img={hyperdx_10} alt="HyperDX search" size="lg"/>

데이터 로드는 몇 분 정도 소요됩니다. 다음 단계로 진행하기 전에 로드가 완료될 때까지 기다리십시오.

## 세션 탐색 {#explore-sessions}

사용자가 상품 결제에 문제가 있다는 보고가 있다고 가정해 보겠습니다. 우리는 HyperDX의 세션 리플레이 기능을 사용하여 그들의 경험을 볼 수 있습니다. 

왼쪽 메뉴에서 [`클라이언트 세션`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572)을 선택합니다.

<Image img={hyperdx_11} alt="Sessions" size="lg"/>

이 뷰를 통해 전자 상거래 상점의 프론트 엔드 세션을 볼 수 있습니다. 사용자가 체크아웃을 하고 구매를 완료하려고 시도할 때까지 세션은 익명으로 유지됩니다.

일부 이메일이 포함된 세션에서 오류가 발생했음을 언급해 두어, 이는 실패한 거래 보고를 확인하는 데 도움이 될 수 있습니다.

실패와 관련된 이메일이 있는 추적을 선택합니다. 이후 뷰에서는 사용자의 세션을 리플레이하고 문제를 검토할 수 있습니다. 재생 버튼을 눌러 세션을 시청하세요.

<Image img={hyperdx_12} alt="Session replay" size="lg"/>

리플레이는 사용자가 사이트를 탐색하고 장바구니에 항목을 추가하는 모습을 보여줍니다. 결제를 완료하려고 시도하는 세션 후반으로 건너뛰어도 좋습니다.

:::tip
모든 오류는 타임라인에 빨간색으로 주석이 달려 있습니다. 
:::

사용자는 명백한 오류 없이 주문을 할 수 없었습니다. 사용자의 브라우저에서 네트워크 및 콘솔 이벤트를 포함하는 왼쪽 패널의 하단으로 스크롤하세요. `/api/checkout` 호출 시 500 오류가 발생했음을 알 수 있습니다.

<Image img={hyperdx_13} alt="Error in session" size="lg"/>

이 `500` 오류를 선택합니다. `개요`나 `컬럼 값` 모두 문제의 출처를 나타내지 않으며, 오류는 예상치 못한 것으로, `내부 오류`를 일으킵니다.

## 추적 탐색 {#explore-traces}

`추적` 탭으로 이동하여 전체 분산 추적을 확인합니다.

<Image img={hyperdx_14} alt="Session trace" size="lg"/>

추적을 아래로 스크롤하여 오류의 원본인 `checkout` 서비스 스팬을 확인합니다. `Payment` 서비스 스팬을 선택합니다.

<Image img={hyperdx_15} alt="Span" size="lg"/>

`컬럼 값` 탭을 선택하고 아래로 스크롤합니다. 우리는 문제가 캐시가 가득 차 있는 것과 관련이 있음을 알 수 있습니다.

<Image img={hyperdx_16} alt="Column values" size="lg"/>

위로 스크롤하여 추적으로 돌아가면, 이전 구성 덕분에 스팬과 관련된 로그가 있음을 확인할 수 있습니다. 이들은 추가적인 컨텍스트를 제공합니다.

<Image img={hyperdx_17} alt="Correlated log" size="lg"/>

결론적으로, 결제 서비스에서 캐시가 가득 차 결제를 완료하지 못하고 있음을 확인했습니다.

## 로그 탐색 {#explore-logs}

자세한 내용을 위해 다시 [`검색`](http://localhost:8080/search) 보기로 돌아갑니다:

`로그`를 소스로 선택하고 `payment` 서비스에 필터를 적용합니다.

<Image img={hyperdx_18} alt="Logs" size="lg"/>

문제가 최근의 것이지만 영향을 받은 결제 수가 많음을 확인할 수 있습니다. 또한 비자 결제와 관련된 캐시가 문제를 일으키고 있는 것으로 보입니다.

## 메트릭 차트 {#chart-metrics}

코드에 명확한 오류가 발생했지만, 메트릭을 사용하여 캐시 크기를 확인할 수 있습니다. `차트 탐색기` 뷰로 이동합니다.

데이터 소스로 `메트릭`을 선택합니다. `visa_validation_cache.size (Gauge)`의 `최대값`을 플로팅하기 위해 차트 빌더를 작성하고 재생 버튼을 누릅니다. 캐시는 최대 크기에 도달한 후 오류가 발생하기 전까지 명백히 증가했습니다.

<Image img={hyperdx_19} alt="Metrics" size="lg"/>

</VerticalStepper>
