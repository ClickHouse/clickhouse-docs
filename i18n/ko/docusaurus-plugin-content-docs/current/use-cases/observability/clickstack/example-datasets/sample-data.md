---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: '샘플 로그, 트레이스 및 메트릭'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'ClickStack과 로그, 세션, 트레이스, 메트릭이 포함된 샘플 데이터셋으로 시작합니다'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['clickstack', '예시 데이터', '샘플 데이터셋', '로그', '관측성']
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
import select_service from '@site/static/images/clickstack/select_service.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickStack - 로그, 트레이스, 메트릭 샘플 \{#clickstack-sample-dataset\}

이 가이드는 샘플 데이터 세트를 사용하여 ClickStack Open Source와 Managed ClickStack을 모두 소개합니다.

<Tabs groupId="sample-logs">
  <TabItem value="managed-clickstack" label="관리형 ClickStack" default>
    <VerticalStepper headerLevel="h3">
      다음 가이드는 [관리형 ClickStack 시작 가이드](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)를 완료하고 [연결 자격 증명을 기록](/use-cases/observability/clickstack/getting-started/managed#next-steps)한 것을 전제로 합니다.

      ### 서비스를 선택하세요

      ClickHouse Cloud 메인 랜딩 페이지에서 Managed ClickStack 서비스를 선택하세요.

      <Image img={select_service} alt="서비스 선택" size="lg" />

      ### ClickStack UI(HyperDX)로 이동하기

      왼쪽 메뉴에서 `ClickStack`을 선택하여 ClickStack UI로 이동하십시오. 자동으로 인증됩니다.

      <Image img={hyperdx} alt="ClickStack UI" size="lg" />

      ### 샘플 데이터 다운로드하기

      UI에 샘플 데이터를 표시하려면 다음 파일을 다운로드하세요:

      [샘플 데이터](https://storage.googleapis.com/hyperdx/sample.tar.gz)

      ```shell
      # curl
      curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
      # or
      # wget https://storage.googleapis.com/hyperdx/sample.tar.gz
      ```

      이 파일에는 공개 [OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo)의 예제 로그, 메트릭, 트레이스가 포함되어 있습니다. 이는 마이크로서비스로 구성된 간단한 전자상거래 스토어입니다. 원하는 디렉터리에 이 파일을 복사하세요.

      ### 샘플 데이터 로드하기

      이 데이터를 로드하려면 배포된 OpenTelemetry(OTel) 컬렉터의 HTTP 엔드포인트로 전송하십시오.

      다음 명령을 실행하여 데이터를 OTel collector로 전송하세요:

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

      이는 OTLP 로그, 트레이스 및 메트릭 소스가 OTel collector로 데이터를 전송하는 것을 시뮬레이션합니다. 프로덕션 환경에서 이러한 소스는 언어 클라이언트 또는 다른 OTel collector가 될 수 있습니다.

      `Search` 뷰로 돌아가면 데이터 로드가 시작된 것을 확인할 수 있습니다(데이터가 표시되지 않는 경우 시간 범위를 `Last 1 hour`로 조정하세요):

      <Image img={hyperdx_10} alt="HyperDX 검색" size="lg" />

      데이터 로딩에는 몇 분이 소요됩니다. 다음 단계로 진행하기 전에 로드가 완료될 때까지 기다리세요.

      ### 세션 탐색하기

      사용자가 상품 결제 시 문제를 겪고 있다는 보고를 받았다고 가정하겠습니다. HyperDX의 세션 재생(session replay) 기능을 사용하여 해당 사용자의 경험을 확인할 수 있습니다.

      왼쪽 메뉴에서 `Client Sessions`를 선택하세요.

      <Image img={hyperdx_11} alt="세션" size="lg" />

      이 뷰를 통해 전자상거래 스토어의 프론트엔드 세션을 확인할 수 있습니다. 세션은 사용자가 체크아웃하고 구매를 완료하려고 시도하기 전까지 익명으로 유지됩니다.

      이메일이 포함된 일부 세션에 오류가 연결되어 있으며, 이는 실패한 트랜잭션 보고를 확인할 수 있는 가능성을 보여줍니다.

      실패한 트레이스와 연결된 이메일을 선택하세요. 다음 화면에서 사용자의 세션을 재생하고 문제를 검토할 수 있습니다. 재생 버튼을 눌러 세션을 확인하세요.

      <Image img={hyperdx_12} alt="세션 리플레이" size="lg" />

      재생 화면에서는 사용자가 사이트를 탐색하고 장바구니에 항목을 추가하는 과정을 보여줍니다. 세션 후반부로 건너뛰어 결제 시도 부분을 확인하세요.

      :::tip
      모든 오류는 타임라인에 빨간색으로 표시됩니다.
      :::

      사용자가 주문을 완료할 수 없었으나 명확한 오류는 표시되지 않았습니다. 사용자의 브라우저에서 발생한 네트워크 및 콘솔 이벤트가 포함된 왼쪽 패널의 하단으로 스크롤하세요. `/api/checkout` 호출 시 500 오류가 발생한 것을 확인할 수 있습니다.

      <Image img={hyperdx_13} alt="세션에서 오류가 발생했습니다" size="lg" />

      이 `500` 오류를 선택하세요. `Overview`와 `Column Values` 모두 오류가 예상치 못한 것이며 `Internal Error`를 발생시킨다는 사실 외에는 문제의 원인을 표시하지 않습니다.

      ### 트레이스 탐색하기

      `Trace` 탭으로 이동하여 전체 분산 추적을 확인하세요.

      <Image img={hyperdx_14} alt="세션 트레이스" size="lg" />

      트레이스를 아래로 스크롤하여 오류의 원인인 `checkout` 서비스 스팬을 확인하세요. `Payment` 서비스 스팬을 선택하세요.

      <Image img={hyperdx_15} alt="스팬" size="lg" />

      `Column Values` 탭을 선택하고 아래로 스크롤하세요. 캐시가 가득 차서 발생한 문제임을 확인할 수 있습니다.

      <Image img={hyperdx_16} alt="컬럼 값" size="lg" />

      위로 스크롤하여 트레이스로 돌아가면, 이전 구성 덕분에 로그가 스팬과 연관되어 있는 것을 확인할 수 있습니다. 이는 추가적인 컨텍스트를 제공합니다.

      <Image img={hyperdx_17} alt="연관 로그" size="lg" />

      결제 서비스의 캐시가 가득 차서 결제 완료를 방해하고 있음을 확인했습니다.

      ### 로그 탐색하기

      자세한 내용을 확인하려면 `Search`로 돌아가세요:

      소스에서 `Logs`를 선택하고 `payment` 서비스에 필터를 적용하세요.

      <Image img={hyperdx_18} alt="로그" size="lg" />

      문제가 최근에 발생했음에도 불구하고 영향을 받은 결제 건수가 많은 것을 확인할 수 있습니다. 또한 Visa 결제와 관련된 캐시가 문제를 일으키는 것으로 보입니다.

      ### 차트 메트릭

      코드에 오류가 명확히 도입되었지만, 메트릭을 사용하여 캐시 크기를 확인할 수 있습니다. `Chart Explorer` 뷰로 이동하세요.

      데이터 소스로 `Metrics`를 선택하세요. 차트 빌더를 완성하여 `visa_validation_cache.size (Gauge)`의 `Maximum`을 플롯하고 재생 버튼을 누르세요. 캐시는 최대 크기에 도달하기 전까지 명확히 증가했으며, 그 이후 오류가 발생했습니다.

      <Image img={hyperdx_19} alt="메트릭" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack 오픈소스">
    다음 예제는 [올인원 이미지 지침](/use-cases/observability/clickstack/getting-started/oss)을 사용하여 오픈 소스 ClickStack을 시작하고 [로컬 ClickHouse 인스턴스](/use-cases/observability/clickstack/getting-started/oss#complete-connection-credentials)에 연결한 상태를 가정합니다.

    <VerticalStepper headerLevel="h3">
      ### ClickStack UI(HyperDX)로 이동하기

      [http://localhost:8080](http://localhost:8080)을 방문하여 ClickStack UI에 접근하십시오.

      <Image img={hyperdx} alt="ClickStack UI" size="lg" />

      ### 수집 API key 복사하기

      [`Team Settings`](http://localhost:8080/team)로 이동하여 `API Keys` 섹션에서 `Ingestion API Key`를 복사하십시오. 이 API key는 OpenTelemetry collector를 통한 데이터 수집을 안전하게 보장합니다.

      <Image img={copy_api_key} alt="API 키 복사" size="lg" />

      ### 샘플 데이터 다운로드하기

      UI에 샘플 데이터를 표시하려면 다음 파일을 다운로드하세요:

      [샘플 데이터](https://storage.googleapis.com/hyperdx/sample.tar.gz)

      ```shell
      # curl
      curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
      # or
      # wget https://storage.googleapis.com/hyperdx/sample.tar.gz
      ```

      이 파일에는 공개 [OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo)의 예제 로그, 메트릭, 트레이스가 포함되어 있습니다. 이는 마이크로서비스로 구성된 간단한 전자상거래 스토어입니다. 원하는 디렉터리에 이 파일을 복사하세요.

      ### 샘플 데이터 로드하기

      이 데이터를 로드하려면 배포된 OpenTelemetry(OTel) 컬렉터의 HTTP 엔드포인트로 전송하십시오.

      먼저, 위에서 복사한 API 키를 export하세요.

      ```shell
      # export API key
      export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
      ```

      다음 명령을 실행하여 데이터를 OTel collector로 전송하세요:

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

      이는 OTLP 로그, 트레이스 및 메트릭 소스가 OTel collector로 데이터를 전송하는 것을 시뮬레이션합니다. 프로덕션 환경에서 이러한 소스는 언어 클라이언트 또는 다른 OTel collector가 될 수 있습니다.

      `Search` 뷰로 돌아가면 데이터 로드가 시작된 것을 확인할 수 있습니다(데이터가 표시되지 않는 경우 시간 범위를 `Last 1 hour`로 조정하세요):

      <Image img={hyperdx_10} alt="HyperDX 검색" size="lg" />

      데이터 로딩에는 몇 분이 소요됩니다. 다음 단계로 진행하기 전에 로드가 완료될 때까지 기다리세요.

      ### 세션 탐색하기

      사용자가 상품 결제 시 문제를 겪고 있다는 보고를 받았다고 가정하겠습니다. HyperDX의 세션 재생(session replay) 기능을 사용하여 해당 사용자의 경험을 확인할 수 있습니다.

      왼쪽 메뉴에서 [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000\&to=1747312920000\&sessionSource=l1324572572)를 선택하세요.

      <Image img={hyperdx_11} alt="세션" size="lg" />

      이 뷰를 통해 전자상거래 스토어의 프론트엔드 세션을 확인할 수 있습니다. 세션은 사용자가 체크아웃하고 구매를 완료하려고 시도하기 전까지 익명으로 유지됩니다.

      이메일이 포함된 일부 세션에 오류가 연결되어 있으며, 이는 실패한 트랜잭션 보고를 확인할 수 있는 가능성을 보여줍니다.

      실패한 트레이스와 연결된 이메일을 선택하세요. 다음 화면에서 사용자의 세션을 재생하고 문제를 검토할 수 있습니다. 재생 버튼을 눌러 세션을 확인하세요.

      <Image img={hyperdx_12} alt="세션 리플레이" size="lg" />

      재생 화면에서는 사용자가 사이트를 탐색하고 장바구니에 항목을 추가하는 과정을 보여줍니다. 세션 후반부로 건너뛰어 결제 시도 부분을 확인하세요.

      :::tip
      모든 오류는 타임라인에 빨간색으로 표시됩니다.
      :::

      사용자가 주문을 완료할 수 없었으나 명확한 오류는 표시되지 않았습니다. 사용자의 브라우저에서 발생한 네트워크 및 콘솔 이벤트가 포함된 왼쪽 패널의 하단으로 스크롤하세요. `/api/checkout` 호출 시 500 오류가 발생한 것을 확인할 수 있습니다.

      <Image img={hyperdx_13} alt="세션 오류" size="lg" />

      이 `500` 오류를 선택하세요. `Overview`와 `Column Values` 모두 오류가 예상치 못한 것이며 `Internal Error`를 발생시킨다는 사실 외에는 문제의 원인을 표시하지 않습니다.

      ### 트레이스 탐색하기

      `Trace` 탭으로 이동하여 전체 분산 추적을 확인하세요.

      <Image img={hyperdx_14} alt="세션 트레이스" size="lg" />

      트레이스를 아래로 스크롤하여 오류의 원인인 `checkout` 서비스 스팬을 확인하세요. `Payment` 서비스 스팬을 선택하세요.

      <Image img={hyperdx_15} alt="스팬" size="lg" />

      `Column Values` 탭을 선택하고 아래로 스크롤하세요. 캐시가 가득 차서 발생한 문제임을 확인할 수 있습니다.

      <Image img={hyperdx_16} alt="컬럼 값" size="lg" />

      위로 스크롤하여 트레이스로 돌아가면 이전 구성 덕분에 로그가 스팬과 연관되어 있는 것을 확인할 수 있습니다. 이는 추가적인 컨텍스트를 제공합니다.

      <Image img={hyperdx_17} alt="연관 로그" size="lg" />

      결제 서비스의 캐시가 가득 차서 결제 완료를 방해하고 있음을 확인했습니다.

      ### 로그 탐색하기

      자세한 내용은 [`Search` 뷰](http://localhost:8080/search)로 돌아가서 확인할 수 있습니다:

      소스에서 `Logs`를 선택하고 `payment` 서비스에 필터를 적용하세요.

      <Image img={hyperdx_18} alt="로그" size="lg" />

      문제가 최근에 발생했음에도 불구하고 영향을 받은 결제 건수가 많은 것을 확인할 수 있습니다. 또한 Visa 결제와 관련된 캐시가 문제를 일으키고 있는 것으로 보입니다.

      ### 차트 메트릭

      코드에 오류가 명확히 도입되었지만, 메트릭을 사용하여 캐시 크기를 확인할 수 있습니다. `Chart Explorer` 뷰로 이동하세요.

      데이터 소스로 `Metrics`를 선택하세요. 차트 빌더를 완성하여 `visa_validation_cache.size (Gauge)`의 `Maximum`을 플롯하고 재생 버튼을 누르세요. 캐시는 최대 크기에 도달하기 전까지 명확히 증가했으며, 그 이후 오류가 발생했습니다.

      <Image img={hyperdx_19} alt="메트릭" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>