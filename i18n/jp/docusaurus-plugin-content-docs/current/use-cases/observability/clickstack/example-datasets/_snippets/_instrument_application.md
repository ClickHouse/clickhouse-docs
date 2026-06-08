import Image from '@theme/IdealImage';
import hackernews_main from '@site/static/images/clickstack/getting-started/hackernews_main.png';
import instrument_app_clickstack_logs from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_logs.png';
import instrument_app_clickstack_traces from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_traces.png';
import instrument_app_clickstack_sessions from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_sessions.png';

<VerticalStepper headerLevel="h2">
  ## アプリケーションのクローンと実行 \{#clone-and-run-the-application\}

  リポジトリをクローンし、依存関係をインストールして、`.env` ファイルを作成します。

  ```bash
  git clone https://github.com/ClickHouse/hn-news-analyzer.git
  cd hn-news-analyzer
  npm install
  cp .env.example .env
  ```

  ClickHouseのデータソースはデフォルトで公開の読み取り専用デモクラスターに設定されているため、追加設定なしでアプリを起動できます。起動するには以下を実行します。

  ```bash
  ./run.sh
  ```

  [http://localhost:5001](http://localhost:5001) を開いてください。年セレクター、サマリー統計、アクティビティチャート、上位ユーザーおよびドメインのテーブル、検索ボックスが表示されます。年を切り替えたり、ストーリーを掘り下げたりして、自由に操作してみてください。

  <Image img={hackernews_main} alt="ローカルで実行されているHackerNews Analyzerアプリケーション" />

  この時点では、アプリケーションは動作していますが、まだ計装されていません。ClickStack にはデータが表示されておらず、テレメトリーの受信を待機している状態です。これが「計装前」の状態です。

  ## 接続情報を取得する \{#get-connection-details\}

  アプリケーションがcollectorに接続するには、次の2つの値が必要です：

  * `OTEL_EXPORTER_OTLP_ENDPOINT`: collector が公開している OTLP エンドポイント (通常、HTTP 経由の OTLP ではポート `4318`) 。
  * `OTEL_EXPORTER_OTLP_HEADERS`: `authorization=<token>` の形式で指定する、インジェスト用トークンを含む認可ヘッダー。

  `.env` を開いて以下を設定します：

  ```bash
  OTEL_SERVICE_NAME=hn-analyzer-api
  OTEL_EXPORTER_OTLP_ENDPOINT=https://<your-collector-endpoint>:4318
  OTEL_EXPORTER_OTLP_HEADERS=authorization=<your-ingestion-token>
  ```

  SDKは`OTEL_EXPORTER_OTLP_HEADERS`を使用して、traces、メトリクス、logsの3つのシグナルすべての認証ヘッダーを設定します。collectorがローカルで動作しており認証を強制しない場合は、値を空 (`OTEL_EXPORTER_OTLP_HEADERS=authorization=`) のままにすることができますが、変数自体は必ず存在している必要があります。未設定または完全に空の場合、SDKは初期化を完全にスキップします。

  ## アプリケーションのインストルメンテーション \{#instrument-the-application\}

  インストルメンテーションは3つのステップで構成されます。SDKsのインストール、起動コマンドの切り替え、ブラウザSDKの有効化です。いずれもアプリケーションのビジネスロジックには影響しません。

  ### SDKsのインストール \{#install-sdks\}

  バックエンドとブラウザ両方のOpenTelemetry SDKをインストールします：

  ```bash
  npm install @hyperdx/node-opentelemetry @hyperdx/browser
  ```

  ### opentelemetry-instrument CLIを使用する \{#use-open-telemetry-cli\}

  アプリケーションは `run.sh` によって起動されます。このファイルの末尾には2つの `exec` 行があります。一方が有効で、もう一方はコメントアウトされています。Node が `opentelemetry-instrument` でラップされるよう、有効にする行を切り替えてください：

  ```diff
   # BEFORE: plain node, no instrumentation, collector stays silent:
  -exec node scripts/entrypoint.js
  +# exec node scripts/entrypoint.js

   # AFTER: same source, wrapped by opentelemetry-instrument CLI.
  -# exec npx opentelemetry-instrument scripts/entrypoint.js
  +exec npx opentelemetry-instrument scripts/entrypoint.js
  ```

  バックエンドの変更はこれで以上です。自動インストルメンテーションは、プロセス起動時に`opentelemetry-instrument`によって読み込まれます。

  ### ブラウザSDKを有効にする \{#enable-browser-sdk\}

  分散トレース (ブラウザからバックエンドまで) とセッションリプレイをキャプチャするには、`src/web/telemetry.ts` でブラウザSDKを有効にします。importと`HyperDX.init({...})`ブロックのコメントを解除してください：

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

  `.env` への追加編集は不要です。`__OTLP_ENDPOINT__` と `__OTLP_AUTH_TOKEN__` は `vite.config.ts` によってコンパイル時に注入される定数で、エンドポイントは `OTEL_EXPORTER_OTLP_ENDPOINT`、トークンは `OTEL_EXPORTER_OTLP_HEADERS` から解析されます。これらはバックエンドが使用する値と同じです。

  :::warning
  インジェストトークンはパブリックなブラウザバンドルに組み込まれているため、ネットワークタブを確認すれば誰でも読み取ることができます。
  :::

  ## トラフィックを生成してテレメトリーを確認する \{#generate-traffic-and-view-telemetry\}

  新しい起動コマンドと新たにビルドされたブラウザバンドルを反映させるために、アプリケーションを再起動してください：

  ```bash
  # Ctrl-C the previous run, then:
  ./run.sh
  ```

  ブラウザのタブをリロードしてViteが更新済みバンドルを配信できるようにしたら、アプリを数回更新し、年を切り替えてストーリーをクリックし、トラフィックを発生させます。

  ClickStack UIを開きます：

  1. **Search** に移動し、期間を直近 5 分に絞り込みます。`hn-analyzer-api` のログが流れてきます。

  <Image img={instrument_app_clickstack_logs} alt="ClickStack ログ" />

  2. リクエストをクリックしてトレースをさかのぼると、Express ハンドラーのスパン、実際のネットワーク所要時間を示しつつ ClickHouse クラスターを指す子 HTTP スパン、さらに同じトレースに相関付けられた `console.log` レコードが表示されます。

  <Image img={instrument_app_clickstack_traces} alt="ClickStack トレース" />

  3. トレースのタイムラインに同期した、ブラウザーセッションの再生位置を自由に移動できる動画を再生するには、**Session Replay** を開きます。

  <Image img={instrument_app_clickstack_sessions} alt="ClickStack セッション" />

  ログ、メトリクス、トレース、セッションリプレイはすべて同一のUIに集約され、同じクエリ言語を共有し、自動的に相関付けられます。
</VerticalStepper>