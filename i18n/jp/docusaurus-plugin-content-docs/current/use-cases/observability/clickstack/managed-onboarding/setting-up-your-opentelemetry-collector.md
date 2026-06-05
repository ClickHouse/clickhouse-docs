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

import Image from '@theme/IdealImage';
import clickhouse_cloud_connection from '@site/static/images/use-cases/observability/clickstack-cloud-connect.png';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-first-time.png';
import clickstack_start_ingestion from '@site/static/images/use-cases/observability/clickstack-start-ingestion.png';
import clickstack_start_exploring from '@site/static/images/use-cases/observability/clickstack-start-exploring.png';
import clickstack_search from '@site/static/images/use-cases/observability/clickstack-search.png';

このガイドでは、既存の Managed ClickStack サービスに対して OpenTelemetry (OTel) Collector をデプロイし、その後データが実際にその collector を通って流れていることを確認する手順を説明します。

collector は **ゲートウェイ** として動作します。つまり、アプリケーション、SDK、エージェント collector が送信先とする単一の OTLP エンドポイントです。ゲートウェイはイベントをバッチ化し、設定した処理を適用して、[ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) を介して ClickHouse に書き込みます。この構成により、収集ロジックをアプリケーションコードから切り離し、データを生成するワークロードとは独立してインジェストをスケールできます。ゲートウェイ ロールとエージェント ロールの違いについては、[Collector roles](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) を参照してください。

このガイドは、[Getting started with Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed) ガイドを完了しており、接続に必要な認証情報を手元に用意していることを前提としています。

<VerticalStepper headerLevel="h2">
  ## 認証情報を確認する \{#gather-credentials\}

  以下が必要です：

  * お使いの ClickHouse Cloud サービスの HTTPS エンドポイント (プロトコルとポートを含む) 。たとえば `https://abc123xyz.us-central1.gcp.clickhouse.cloud:8443`。
  * ClickHouseのインジェスト用ユーザー名とパスワード。

  これらの情報を控えていない場合は、[ClickHouse Cloud console](https://console.clickhouse.cloud) でサービスを開き、**Connect** を選択してください。表示されるダイアログからURLを控えておいてください。以降の手順で、インジェスト専用のユーザーを作成します。

  <Image img={clickhouse_cloud_connection} size="lg" alt="HTTPSエンドポイントとパスワードが表示されたサービス接続パネル" border />

  ## インジェストユーザーの作成 \{#create-ingestion-user\}

  `default` を再利用するのではなく、collector 専用のユーザーを作成することをお勧めします。SQL コンソールからサービスに接続し、次のコマンドを実行してください。

  ```sql
  CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
  GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
  ```

  :::tip
  上記のスニペット内のパスワードを強力なものに置き換えてください
  :::

  collectorは初回使用時に、`otel`データベース内にログ、トレース、メトリクスのスキーマを作成します。本番環境でのユーザー設定の詳細については、[本番環境への移行](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed)を参照してください。

  ## collectorのデプロイ \{#deploy-the-collector\}

  OpenTelemetryデータを送信するアプリケーションおよびインフラストラクチャからアクセスできる場所にcollectorをデプロイしてください。以下の例では、説明を簡単にするため、collectorをローカルで実行し、同じマシンからダミーのテレメトリーを生成します。

  :::note info
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

  [ClickHouse Cloud コンソール](https://console.clickhouse.cloud)でサービスを開き、左メニューから **ClickStack** を選択し、**Start Ingestion** をクリックします。

  <Image img={clickstack_cloud} size="lg" alt="ClickStackを起動する" border />

  collectorの設定はすでに完了しているため、次のステップはスキップできます。**Launch ClickStack** をクリックして続行してください。

  ClickStack が新しいタブで開き、自動的に **Getting Started** ページに遷移します。遷移しない場合は、左側のメニューから **Getting Started** を選択し、**Start Ingestion** をクリックした後、**Next** をクリックしてください。

  <Image img={clickstack_start_ingestion} size="lg" alt="ClickStack でインジェストを開始" border />

  ClickStack はテーブルとテレメトリーデータを自動的に検出し、次の手順に進むことができます。**Start Exploring** を選択して、トレースデータの探索を開始してください。

  <Image img={clickstack_start_exploring} size="lg" alt="ClickStack を使い始める" border />

  ログソースを `Logs` に切り替え、時間範囲を **Last 15 minutes** に設定してください。`otelgen` からの合成ログが数秒以内に表示されるはずです。

  <Image img={clickstack_search} size="lg" alt="ログが表示されているClickStackの検索ビュー" />

  何も表示されない場合：

  * `otelgen` に渡す `OTLP_AUTH_TOKEN` の値が、collector に設定したものと一致していることを確認してください。
  * `docker logs -f <container-id>` で collector のログを追い、エクスポートエラーがないか確認します。
  * `CLICKHOUSE_ENDPOINT` に、プロトコルとポート番号 (`https://...:8443`) の両方が含まれていることを確認してください。

  ## 参考資料 \{#further-reading\}

  このガイドでは、最もシンプルな形式の単一 collector インスタンスについて説明します。次のステップについては、[OpenTelemetry collector リファレンス](/use-cases/observability/clickstack/ingesting-data/otel-collector)をご覧ください。

  * [collector の保護](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) (OTLP エンドポイントで TLS を使用し、最小権限のインジェストユーザーを利用)
  * ゲートウェイでイベントを[処理、フィルタリング、エンリッチ](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)。
  * カスタム receiver、プロセッサ、パイプラインによる[collector 設定の拡張](/use-cases/observability/clickstack/ingesting-data/otel-collector#extending-collector-config)。
  * [リソースの見積もり](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources) で、想定スループットにおけるゲートウェイおよびエージェントのデプロイメントに必要なリソースを見積もります。
  * 本番環境へ移行する際の推奨事項については、[本番環境への移行](/use-cases/observability/clickstack/production)を参照してください。
</VerticalStepper>