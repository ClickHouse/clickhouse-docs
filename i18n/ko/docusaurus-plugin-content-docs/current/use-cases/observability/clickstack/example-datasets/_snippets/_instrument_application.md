import Image from '@theme/IdealImage';
import hackernews_main from '@site/static/images/clickstack/getting-started/hackernews_main.png';
import instrument_app_clickstack_logs from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_logs.png';
import instrument_app_clickstack_traces from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_traces.png';
import instrument_app_clickstack_sessions from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_sessions.png';

<VerticalStepper headerLevel="h2">
  ## 애플리케이션 복제 및 실행 \{#clone-and-run-the-application\}

  리포지토리를 클론하고 의존성을 설치한 후 `.env` 파일을 생성하세요:

  ```bash
  git clone https://github.com/ClickHouse/hn-news-analyzer.git
  cd hn-news-analyzer
  npm install
  cp .env.example .env
  ```

  ClickHouse 데이터 소스는 기본적으로 공개 읽기 전용 데모 클러스터로 설정되어 있으므로 추가 구성 없이 앱을 실행할 수 있습니다. 다음과 같이 시작하십시오:

  ```bash
  ./run.sh
  ```

  [http://localhost:5001](http://localhost:5001)을 여십시오. 연도 선택기, 요약 통계, 활동 차트(chart), 상위 사용자 및 도메인 테이블(table), 검색창이 표시됩니다. 연도를 전환하거나 스토리를 자세히 살펴보십시오.

  <Image img={hackernews_main} alt="로컬에서 실행되는 HackerNews 분석기 애플리케이션" />

  현재 애플리케이션은 실행 중이지만 계측(instrumentation)이 적용되지 않은 상태입니다. ClickStack에 데이터가 표시되지 않으며, 텔레메트리(telemetry) 수신을 대기하고 있습니다. 이것이 &quot;적용 전&quot; 상태입니다.

  ## 연결 정보 가져오기 \{#get-connection-details\}

  애플리케이션이 collector에 연결하려면 다음 두 가지 값이 필요합니다:

  * `OTEL_EXPORTER_OTLP_ENDPOINT`: collector에서 노출하는 OTLP endpoint입니다(일반적으로 HTTP를 통한 OTLP에는 포트 `4318`을 사용합니다).
  * `OTEL_EXPORTER_OTLP_HEADERS`: 수집 토큰을 전달하는 authorization header이며, 형식은 `authorization=<token>`입니다.

  `.env`를 열고 다음 값을 설정하십시오:

  ```bash
  OTEL_SERVICE_NAME=hn-analyzer-api
  OTEL_EXPORTER_OTLP_ENDPOINT=https://<your-collector-endpoint>:4318
  OTEL_EXPORTER_OTLP_HEADERS=authorization=<your-ingestion-token>
  ```

  SDK는 `OTEL_EXPORTER_OTLP_HEADERS`를 사용하여 traces, 메트릭, logs 세 가지 신호 모두에 대한 인증 헤더를 설정합니다. collector가 로컬에서 실행 중이고 인증을 강제하지 않는 경우 값을 비워 둘 수 있습니다(`OTEL_EXPORTER_OTLP_HEADERS=authorization=`). 단, 해당 변수는 반드시 존재해야 합니다. 변수가 설정되지 않았거나 완전히 비어 있으면 SDK는 초기화를 건너뜁니다.

  ## 애플리케이션 계측 \{#instrument-the-application\}

  계측(Instrumentation)은 세 단계로 구성됩니다: SDKs 설치, 실행 명령 전환, 브라우저 SDK 활성화. 이 과정에서 애플리케이션의 비즈니스 로직은 변경되지 않습니다.

  ### SDK 설치 \{#install-sdks\}

  백엔드 및 브라우저용 OpenTelemetry SDK를 모두 설치하십시오:

  ```bash
  npm install @hyperdx/node-opentelemetry @hyperdx/browser
  ```

  ### opentelemetry-instrument CLI 사용 \{#use-open-telemetry-cli\}

  애플리케이션은 `run.sh`로 실행되며, 하단에 두 개의 `exec` 줄이 있습니다. 하나는 활성화되어 있고 나머지 하나는 주석 처리되어 있습니다. Node가 `opentelemetry-instrument`로 래핑되도록 활성화할 줄을 전환하십시오:

  ```diff
   # BEFORE: plain node, no instrumentation, collector stays silent:
  -exec node scripts/entrypoint.js
  +# exec node scripts/entrypoint.js

   # AFTER: same source, wrapped by opentelemetry-instrument CLI.
  -# exec npx opentelemetry-instrument scripts/entrypoint.js
  +exec npx opentelemetry-instrument scripts/entrypoint.js
  ```

  백엔드 변경 사항은 이것이 전부입니다. 자동 계측(auto-instrumentation)은 프로세스 시작 시 `opentelemetry-instrument`를 통해 로드됩니다.

  ### 브라우저 SDK 활성화 \{#enable-browser-sdk\}

  분산 추적(브라우저에서 백엔드까지)과 세션 리플레이를 수집하려면 `src/web/telemetry.ts`에서 브라우저 SDK를 활성화하십시오. import 구문과 `HyperDX.init({...})` 블록의 주석 처리를 해제하십시오:

  ```javascript
  import HyperDX from '@hyperdx/browser';

  export function initTelemetry(): void {
    HyperDX.init({
      url: __OTLP_ENDPOINT__,
      apiKey: __OTLP_AUTH_TOKEN__,
      service: 'hn-analyzer-web',
      tracePropagationTargets: [/localhost:5001/i, /\/api\//i],
      consoleCapture: true,
      advancedNetworkCapture: true,
    });
  }
  ```

  `.env` 파일을 추가로 수정할 필요가 없습니다. `__OTLP_ENDPOINT__`와 `__OTLP_AUTH_TOKEN__`은 `vite.config.ts`가 주입하는 컴파일 타임 상수입니다. 엔드포인트는 `OTEL_EXPORTER_OTLP_ENDPOINT`이며, 토큰은 `OTEL_EXPORTER_OTLP_HEADERS`에서 파싱한 값으로, 백엔드에서 사용하는 값과 동일합니다.

  :::warning
  수집 토큰은 공개 브라우저 번들에 포함되어 있으므로, 네트워크 탭을 확인하는 누구나 읽을 수 있습니다.
  :::

  ## 트래픽 생성 및 텔레메트리 확인 \{#generate-traffic-and-view-telemetry\}

  새 실행 명령과 새로 빌드된 브라우저 번들이 적용되도록 애플리케이션을 재시작하세요:

  ```bash
  # Ctrl-C the previous run, then:
  ./run.sh
  ```

  브라우저 탭을 새로 고침하여 Vite가 업데이트된 번들을 제공하도록 한 다음, 앱을 몇 번 새로 고침하고 연도를 전환하며 스토리를 클릭하여 트래픽을 생성하십시오.

  ClickStack UI를 여세요:

  1. **Search**로 이동한 다음 최근 5분으로 필터링하세요. `hn-analyzer-api`의 로그가 실시간으로 표시됩니다.

  <Image img={instrument_app_clickstack_logs} alt="ClickStack 로그" />

  2. 요청을 클릭한 다음 트레이스를 따라 상위 단계로 이동하세요. Express 핸들러 스팬, 실제 네트워크 소요 시간이 표시된 ClickHouse 클러스터를 가리키는 하위 HTTP 스팬, 그리고 동일한 트레이스에 연관된 `console.log` 레코드를 확인할 수 있습니다.

  <Image img={instrument_app_clickstack_traces} alt="ClickStack 트레이스" />

  3. trace 타임라인과 동기화된 브라우저 세션 비디오를 구간별로 탐색하며 재생하려면 **세션 리플레이**를 여세요.

  <Image img={instrument_app_clickstack_sessions} alt="ClickStack 세션" />

  로그, 메트릭, 트레이스, 세션 리플레이가 모두 동일한 UI에 통합되며, 동일한 쿼리 언어를 공유하고 자동으로 연관됩니다.
</VerticalStepper>