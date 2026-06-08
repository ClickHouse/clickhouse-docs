import Image from '@theme/IdealImage';
import hackernews_main from '@site/static/images/clickstack/getting-started/hackernews_main.png';
import instrument_app_clickstack_logs from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_logs.png';
import instrument_app_clickstack_traces from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_traces.png';
import instrument_app_clickstack_sessions from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_sessions.png';

<VerticalStepper headerLevel="h2">
  ## 克隆并运行应用程序 \{#clone-and-run-the-application\}

  克隆代码仓库，安装依赖项，并创建 `.env` 文件：

  ```bash
  git clone https://github.com/ClickHouse/hn-news-analyzer.git
  cd hn-news-analyzer
  npm install
  cp .env.example .env
  ```

  ClickHouse 数据源默认连接公开的只读演示集群，无需任何额外配置即可直接运行应用。启动方式如下：

  ```bash
  ./run.sh
  ```

  打开 [http://localhost:5001](http://localhost:5001)。页面将显示年份选择器、汇总统计信息、活动图表、热门用户与域名表以及搜索框。可自由点击探索：切换年份，深入查看具体故事内容。

  <Image img={hackernews_main} alt="在本地运行的 HackerNews Analyzer 应用程序" />

  此时应用程序已在运行，但尚未完成插桩。ClickStack 未显示任何数据，正在等待遥测数据接入。这是&quot;插桩前&quot;的状态。

  ## 获取连接信息 \{#get-connection-details\}

  应用程序需要以下两个值才能连接到 collector：

  * `OTEL_EXPORTER_OTLP_ENDPOINT`：你的 collector 对外暴露的 OTLP 端点 (通过 HTTP 使用 OTLP 时通常使用端口 `4318`) 。
  * `OTEL_EXPORTER_OTLP_HEADERS`：携带摄取令牌的授权请求头，格式为 `authorization=<token>`。

  打开 `.env` 并设置以下内容：

  ```bash
  OTEL_SERVICE_NAME=hn-analyzer-api
  OTEL_EXPORTER_OTLP_ENDPOINT=https://<your-collector-endpoint>:4318
  OTEL_EXPORTER_OTLP_HEADERS=authorization=<your-ingestion-token>
  ```

  SDK 使用 `OTEL_EXPORTER_OTLP_HEADERS` 为链路追踪、指标和日志这三类信号设置授权请求头。如果您的 collector 在本地运行且无需强制身份验证，可以将该值留空 (`OTEL_EXPORTER_OTLP_HEADERS=authorization=`) ，但该变量本身必须存在——若未设置或完全为空，SDK 将跳过整个初始化过程。

  ## 为应用程序添加插桩 \{#instrument-the-application\}

  插桩分为三个部分：安装 SDKs、切换启动命令，以及启用浏览器 SDK。这些操作均不会改变应用程序的业务逻辑。

  ### 安装 SDKs \{#install-sdks\}

  同时安装后端和浏览器 OpenTelemetry SDKS：

  ```bash
  npm install @hyperdx/node-opentelemetry @hyperdx/browser
  ```

  ### 使用 opentelemetry-instrument CLI \{#use-open-telemetry-cli\}

  应用程序由 `run.sh` 启动，该文件底部有两行 `exec` 命令：一行处于启用状态，另一行已被注释掉。切换启用的行，使 Node 由 `opentelemetry-instrument` 包装：

  ```diff
   # BEFORE: plain node, no instrumentation, collector stays silent:
  -exec node scripts/entrypoint.js
  +# exec node scripts/entrypoint.js

   # AFTER: same source, wrapped by opentelemetry-instrument CLI.
  -# exec npx opentelemetry-instrument scripts/entrypoint.js
  +exec npx opentelemetry-instrument scripts/entrypoint.js
  ```

  以上就是全部的后端改动。自动插桩由 `opentelemetry-instrument` 在进程启动时加载。

  ### 启用浏览器 SDK \{#enable-browser-sdk\}

  要捕获分布式链路追踪 (从浏览器到后端) 和会话回放，请在 `src/web/telemetry.ts` 中启用浏览器 SDK。取消注释 import 语句和 `HyperDX.init({...})` 块：

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

  无需额外修改 `.env` 文件。`__OTLP_ENDPOINT__` 和 `__OTLP_AUTH_TOKEN__` 是由 `vite.config.ts` 注入的编译时常量：端点对应 `OTEL_EXPORTER_OTLP_ENDPOINT`，token 则从 `OTEL_EXPORTER_OTLP_HEADERS` 中解析，与后端使用的值相同。

  :::warning
  摄取标记已内嵌于公开的浏览器打包文件中，任何人只要检查 Network 标签页即可读取。
  :::

  ## 生成流量并查看遥测数据 \{#generate-traffic-and-view-telemetry\}

  重启应用程序，使新的启动命令和最新构建的浏览器包生效：

  ```bash
  # Ctrl-C the previous run, then:
  ./run.sh
  ```

  重新加载浏览器标签页，让 Vite 提供更新后的构建包，然后多次刷新应用、切换年份并点击进入文章，以产生流量数据。

  打开 ClickStack 界面：

  1. 前往 **搜索**，将时间范围筛选为最近 5 分钟。`hn-analyzer-api` 的日志会陆续显示出来。

  <Image img={instrument_app_clickstack_logs} alt="ClickStack 日志" />

  2. 点击进入某个请求，然后沿着 trace 逐级向上查看。你会看到 Express 处理程序 span、一个指向 ClickHouse 集群并显示真实网络耗时的 HTTP 子 span，以及同一 trace 上关联的 `console.log` 记录。

  <Image img={instrument_app_clickstack_traces} alt="ClickStack 链路追踪" />

  3. 打开 **Session Replay**，即可回放浏览器会话的视频，并可通过拖动进度条定位，且与 trace 时间线同步。

  <Image img={instrument_app_clickstack_sessions} alt="ClickStack 会话" />

  日志、指标、链路追踪和 session replay 均汇聚于同一 UI，共享相同的查询语言，并自动相互关联。
</VerticalStepper>