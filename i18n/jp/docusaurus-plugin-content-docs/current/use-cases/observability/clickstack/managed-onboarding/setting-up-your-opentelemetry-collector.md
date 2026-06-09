---
slug: /use-cases/observability/clickstack/setting-up-your-opentelemetry-collector
title: 'OpenTelemetry Collector のセットアップ'
description: 'Managed ClickStack 向け OpenTelemetry Collector のセットアップ'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'collector', 'managed', 'observability', 'gateway', 'otelgen']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GatherCredentials from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_gather_credentials.md';
import CreateIngestionUser from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_create_ingestion_user.md';
import ConfirmInUI from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_confirm_in_ui.md';

このガイドでは、既存の Managed ClickStack サービスに対して OpenTelemetry collector をデプロイするか、既存の collector を流用したうえで、データが実際にその collector を通って流れていることを確認する手順を説明します。

collector は **ゲートウェイ** として動作します。つまり、アプリケーション、SDK、エージェント collector が送信先とする単一の OTLP エンドポイントです。ゲートウェイはイベントをバッチ化し、設定した処理を適用して、[ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) を介して ClickHouse に書き込みます。この構成により、収集ロジックをアプリケーションコードから切り離し、データを生成するワークロードとは独立してインジェストをスケールできます。ゲートウェイ ロールとエージェント ロールの違いについては、[Collector roles](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) を参照してください。

:::note 既存の collector
既存の OpenTelemetry collector を使用している場合は、すでに **ゲートウェイ** ロールとして設定されていることを前提としています。**agent** ロールの collector を再設定するためにこの手順を使用することは推奨しません。
:::

自分の状況に合ったタブを選択してください。

<Tabs groupId="otel-collector-setup">
  <TabItem value="new-collector" label="collectorがありません" default>
    <VerticalStepper headerLevel="h2">
      ## 認証情報を確認する \{#gather-credentials\}

      <GatherCredentials />

      ## インジェストユーザーの作成 \{#create-ingestion-user\}

      <CreateIngestionUser />

      ## collectorのデプロイ \{#deploy-the-collector\}

      **OpenTelemetry collector の ClickStack ディストリビューション**をデプロイします。これは Managed ClickStack 向けに事前設定されています。以下の例では、説明を簡単にするため、collectorをローカルで実行し、同じマシンからダミーのテレメトリーを生成します。

      :::note
      本番環境では、通常、OpenTelemetry SDK、エージェント、およびその他のcollectorからアクセス可能なKubernetesクラスターまたは仮想マシン上にcollectorをデプロイします。これにより、環境全体のテレメトリーを一元的に収集してClickStackに転送できます。
      :::

      collectorにデータを送信するクライアントを認証するための共有シークレットを決め、接続情報および`hyperdx_ingest`ユーザー用のパスワードとともに環境変数としてエクスポートします。

      ```shell
      export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
      export CLICKHOUSE_USER=hyperdx_ingest
      export CLICKHOUSE_PASSWORD=ClickH0u3eRocks123!
      export OTLP_AUTH_TOKEN="a-strong-shared-secret"
      ```

      ClickStack OTel collectorを実行します：

      ```shell
      docker run -d \
        -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
        -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
        -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
        -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
        -e HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=otel \
        -p 4317:4317 \
        -p 4318:4318 \
        clickhouse/clickstack-otel-collector:latest
      ```

      collectorは、`4317`でOTLP gRPC、`4318`でOTLP HTTPを公開するようになりました。アプリケーション、SDK、およびagent collectorは、リクエストのheadersに`authorization: $OTLP_AUTH_TOKEN`を含め、これらのポートへ送信してください。

      :::note[本番環境へのデプロイメント]
      本番環境では、OTLPエンドポイントでTLSを有効にすることを推奨します。[collectorのセキュリティ保護](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)を参照してください。
      :::

      ## エンドポイントの確認 \{#verify-the-endpoint\}

      collectorに対して合成トラフィックを生成し、パイプライン全体が正常に動作することを確認します。ここでは、OTLPのlogs、traces、およびメトリクスを送信する小さなCLIツール[`otelgen`](https://github.com/krzko/otelgen)を使用します。

      Homebrewで`otelgen`をインストールします：

      ```shell
      brew install krzko/tap/otelgen
      ```

      またはGoの場合：

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      少量のログをまとめてcollectorに送信します：

      ```shell
       otelgen \
        --otel-exporter-otlp-endpoint localhost:4317 \
        --insecure \
        --protocol grpc \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --rate 5 \
        --duration 60 \
        logs multi
      ```

      同等のトレースおよびメトリクスコマンド、またその他の `otelgen` サブコマンドの使い方については、[otelgenを使った合成データ](/use-cases/observability/clickstack/getting-started/otelgen)を参照してください。

      ## ClickStack UIで確認する \{#confirm-in-ui\}

      <ConfirmInUI />
    </VerticalStepper>
  </TabItem>

  <TabItem value="existing-collector" label="collector をすでに用意しています">
    <VerticalStepper headerLevel="h2">
      ## 認証情報を確認する \{#gather-credentials-existing\}

      <GatherCredentials />

      ## インジェストユーザーの作成 \{#create-ingestion-user-existing\}

      <CreateIngestionUser />

      ## collector の設定を調整する \{#adapt-collector\}

      既存の collector の設定を拡張し、[ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) を使用して Managed ClickStack にデータを書き込みます。

      :::note ClickHouse エクスポーターが必要です
      独自のディストリビューションを使用している場合は、ClickHouse エクスポーターが含まれていることを確認してください。アップストリームの [contrib image](https://github.com/open-telemetry/opentelemetry-collector-contrib) にはすでに含まれています。
      :::

      以下は、ClickStack UI が必要とする receiver、プロセッサ、パイプラインとともに ClickHouse エクスポーターを使用したサンプル設定です。Session Replay (`rrweb`) のルーティングパスを含む、ClickStack ディストリビューションの動作に準拠しています。`<clickhouse_cloud_endpoint>` および `<your_password_here>` を、上記で作成した `hyperdx_ingest` ユーザーの認証情報に置き換えてください。

      ```yaml
      receivers:
        otlp/hyperdx:
          protocols:
            grpc:
              include_metadata: true
              endpoint: "0.0.0.0:4317"
            http:
              cors:
                allowed_origins: ["*"]
                allowed_headers: ["*"]
              include_metadata: true
              endpoint: "0.0.0.0:4318"

      processors:
        batch:
        memory_limiter:
          # 80% of maximum memory up to 2G, adjust for low memory environments
          limit_mib: 1500
          # 25% of limit up to 2G, adjust for low memory environments
          spike_limit_mib: 512
          check_interval: 5s

      connectors:
        routing/logs:
          default_pipelines: [logs/out-default]
          error_mode: ignore
          table:
            - context: log
              statement: route() where IsMatch(attributes["rr-web.event"], ".*")
              pipelines: [logs/out-rrweb]

      exporters:
        clickhouse:
          database: otel
          endpoint: <clickhouse_cloud_endpoint>
          username: hyperdx_ingest
          password: <your_password_here>
          ttl: 720h
          timeout: 5s
          retry_on_failure:
            enabled: true
            initial_interval: 5s
            max_interval: 30s
            max_elapsed_time: 300s
        clickhouse/rrweb:
          database: otel
          endpoint: <clickhouse_cloud_endpoint>
          username: hyperdx_ingest
          password: <your_password_here>
          ttl: 720h
          logs_table_name: hyperdx_sessions
          timeout: 5s
          retry_on_failure:
            enabled: true
            initial_interval: 5s
            max_interval: 30s
            max_elapsed_time: 300s

      service:
        pipelines:
          traces:
            receivers: [otlp/hyperdx]
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
          metrics:
            receivers: [otlp/hyperdx]
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
          logs/in:
            receivers: [otlp/hyperdx]
            exporters: [routing/logs]
          logs/out-default:
            receivers: [routing/logs]
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
          logs/out-rrweb:
            receivers: [routing/logs]
            processors: [memory_limiter, batch]
            exporters: [clickhouse/rrweb]
      ```

      注意事項：

      * `otlp/hyperdx` receiverは、gRPC (`4317`) と HTTP (`4318`) の両方のポートで待ち受けます。アプリケーションおよびエージェントは、collectorホスト上のこれらのポートを送信先として指定してください。
      * `clickhouse` exporter は、ClickStack UI が想定するレイアウトに合わせて、ログ、トレース、およびメトリクスを `otel` データベースに書き込みます。`clickhouse/rrweb` exporter は、`routing/logs` コネクタによって `otel.hyperdx_sessions` にルーティングされた Session Replay イベントを処理します。
      * OTLP receiver の認証は、既存の構成に委ねられます。インジェストトークンを必須にする場合は、collector の[拡張機能](https://opentelemetry.io/docs/collector/configuration/#extensions) (たとえば `bearertokenauth`) または TLS を前段に置くリバースプロキシで設定してください。

      新しい設定でcollectorをリロードしてください。アプリケーション、SDK、およびagent collectorは、お使いの環境で想定される認証headerを付与した上で、collectorが公開するOTLPエンドポイントへデータを送信してください。

      Managed ClickStack に対して OpenTelemetry Collector を設定する方法の詳細については、[OpenTelemetry を使ったデータの取り込み](/use-cases/observability/clickstack/ingesting-data/opentelemetry)を参照してください。

      ## エンドポイントの確認 \{#verify-the-endpoint-existing\}

      collectorに対して合成トラフィックを生成し、パイプライン全体が正常に動作することを確認します。ここでは、OTLPのlogs、traces、およびメトリクスを送信する小さなCLIツール[`otelgen`](https://github.com/krzko/otelgen)を使用します。

      Homebrewで`otelgen`をインストールします：

      ```shell
      brew install krzko/tap/otelgen
      ```

      またはGoの場合：

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      少量のログをまとめて collector に送信します。`<your-collector-host>` を collector がリッスンしているホストに置き換え、`authorization` header (または代替の認証方法) を collector が期待する値に設定してください：

      ```shell
       otelgen \
        --otel-exporter-otlp-endpoint <your-collector-host>:4317 \
        --insecure \
        --protocol grpc \
        --header "authorization=<your-auth-token>" \
        --rate 5 \
        --duration 60 \
        logs multi
      ```

      同等のトレースおよびメトリクスコマンド、またその他の `otelgen` サブコマンドの使い方については、[otelgenを使った合成データ](/use-cases/observability/clickstack/getting-started/otelgen)を参照してください。

      ## ClickStack UIで確認する \{#confirm-in-ui-existing\}

      <ConfirmInUI />
    </VerticalStepper>
  </TabItem>
</Tabs>

## 関連情報 \{#further-reading\}

このガイドでは、最もシンプルな構成として単一の collector インスタンスを扱っています。[OpenTelemetry collector リファレンス](/use-cases/observability/clickstack/ingesting-data/otel-collector) では、次に行うべき内容を紹介しています。

* OTLP エンドポイント での TLS の利用と、最小権限のインジェストユーザーによる [collector の保護](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)
* ゲートウェイでのイベントの[処理、フィルタリング、エンリッチ](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)
* カスタム receiver、プロセッサ、パイプラインによる [collector 設定の拡張](/use-cases/observability/clickstack/ingesting-data/otel-collector#extending-collector-config)
* 想定スループットに応じた、ゲートウェイおよび エージェント のデプロイメント向けの[リソース見積もり](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources)
* [本番環境への移行](/use-cases/observability/clickstack/production)