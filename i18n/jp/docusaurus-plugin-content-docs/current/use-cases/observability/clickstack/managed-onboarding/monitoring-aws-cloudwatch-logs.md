---
slug: /use-cases/observability/clickstack/monitoring-aws-cloudwatch-logs
title: 'AWS CloudWatch ログの監視'
description: 'OpenTelemetry CloudWatch receiver を使用して AWS CloudWatch ログを Managed ClickStack に転送する'
doc_type: 'guide'
keywords: ['clickstack', 'aws', 'cloudwatch', 'ログ', 'managed', 'オブザーバビリティ', 'otel']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-v2.png';
import log_search_view from '@site/static/images/clickstack/cloudwatch/log-search-view-clickstack.png';
import log_search_attributes_view from '@site/static/images/clickstack/cloudwatch/log-search-attributes-clickstack.png';
import error_log_column_values from '@site/static/images/clickstack/cloudwatch/error-log-column-values-clickstack.png';
import import_dashboard from '@site/static/images/clickstack/clickstack-import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudwatch/finish-clickstack-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudwatch/logs-dashboard.png';

このガイドでは、OpenTelemetry [`awscloudwatch` receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver) を使用して AWS CloudWatch ログを Managed ClickStack に転送し、その後 ClickStack UI で表示する手順を説明します。

CloudWatch を AWS API 経由でポーリングし、イベントを OTLP 経由で ClickStack collector に転送する、別の collector を実行します。API のレイテンシーとコストを最小限に抑えるため、この collector はロググループと同じ AWS アカウントおよびリージョンに配置してください。

このガイドは、[Setting up your OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) を完了し、ClickStack collector が稼働していることを前提としています。

ClickStack collector は、**Docker コンテナー**としてデプロイすることも ([Setting up your OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) を参照) 、Kubernetes で upstream の OpenTelemetry Helm チャートを使用して、ClickStack collector イメージによる **Helm リリース**としてデプロイすることもできます ([Deploying the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector) を参照) 。デプロイ時に設定した **OTLP エンドポイント** と `OTLP_AUTH_TOKEN` は、必ず控えておいてください。

<VerticalStepper headerLevel="h2">
  ## 前提条件を確認する \{#gather-prerequisites\}

  以下が必要です：

  * 1 つ以上の CloudWatch ロググループと、以下の IAM 権限を持つ認証情報を備えた **AWS アカウント**。
  * **Docker** がインストールされており、AWS API にアクセスでき、使用する ClickStack collector へのアウトバウンドネットワークアクセスがあるホスト。通常、これはロググループと同じ AWS アカウントおよびリージョン内の EC2 インスタンスです。
  * このホストから到達できる ClickStack collector の**OTLP エンドポイント**。同じマシン上の Docker で実行している場合は、`http://host.docker.internal:4318` を使用します ([CloudWatch receiver を設定する](#configure-receiver) のコールアウトを参照) 。リモートの collector の場合は、その完全な URL を使用します。たとえば `https://otel.example.com:4318` です。
  * ClickStack collector に設定した `OTLP_AUTH_TOKEN` の値です。保護していない場合は、以下の設定から `authorization` ヘッダーを省略できます。

  ## AWS認証情報の設定 \{#configure-aws\}

  receiverは標準の環境変数からAWSの認証情報を読み取ります。collectorを実行するホスト上でこれらの環境変数をエクスポートしてください。

  **AWS SSOユーザーの場合：**

  ```shell
  aws sso login --profile YOUR_PROFILE_NAME
  eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)
  aws sts get-caller-identity
  ```

  **長期認証情報を使用するIAMユーザーの場合：**

  ```shell
  export AWS_ACCESS_KEY_ID="your-access-key-id"
  export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
  export AWS_REGION="us-east-1"
  aws sts get-caller-identity
  ```

  CloudWatchのログを読み取るには、認証情報に以下のIAMポリシーが必要です：

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "CloudWatchLogsRead",
        "Effect": "Allow",
        "Action": [
          "logs:DescribeLogGroups",
          "logs:FilterLogEvents"
        ],
        "Resource": "arn:aws:logs:*:YOUR_ACCOUNT_ID:log-group:*"
      }
    ]
  }
  ```

  `YOUR_ACCOUNT_ID` をAWSアカウントIDに置き換えてください。

  :::note 本番環境の認証情報
  本番環境では、長期キーよりもインスタンスにアタッチされた認証情報を優先してください。EC2 上の IAM role、EKS 上の IRSA、または ECS 上のタスクロールが該当します。receiver がインスタンスメタデータサービスから認証情報を解決できる場合、以下の collector 設定は認証情報の環境変数なしで動作します。
  :::

  ## CloudWatch receiverの設定 \{#configure-receiver\}

  ClickStack collector の endpoint と認証トークンをエクスポートして、`otel-collector-config.yaml` を作成します。

  :::note 同一ホスト構成
  以下の例では、ClickStack の collector と CloudWatch の collector が同一ホスト上で動作することを前提としており、receiver は `host.docker.internal` (コンテナー内部から見た Docker ホストのアドレス) を介して接続します。ClickStack の collector が別の場所 (クラスター内サービス、パブリック URL、プライベート IP など) にある場合は、以下の `OTEL_COLLECTOR_ENDPOINT` にそのアドレスを指定してください。
  :::

  ```shell
  export OTEL_COLLECTOR_ENDPOINT="http://host.docker.internal:4318"
  export OTLP_AUTH_TOKEN="a-strong-shared-secret"
  ```

  <details>
    <summary>アカウントで利用可能なロググループを確認する</summary>

    設定を編集する前に、実際の名前を選択し、リージョンが正しいことを確認できるよう、そのリージョンに存在するロググループを一覧表示します。

    ```shell
    aws logs describe-log-groups --region eu-central-1 \
      --query 'logGroups[].logGroupName' --output table
    ```

    出力例:

    ```text
    -------------------------------
    |      DescribeLogGroups      |
    +-----------------------------+
    |  /aws-glue/jobs/error       |
    |  /aws-glue/jobs/logs-v2     |
    |  /aws-glue/jobs/output      |
    |  /aws-glue/sessions/error   |
    |  /aws-glue/sessions/output  |
    +-----------------------------+
    ```

    このリストの名前を、以下の例1の `groups.named` ブロックにそのまま使用してください。上記のアカウントの場合、named-groups セクションは次のようになります。

    ```yaml
    groups:
      named:
        /aws-glue/jobs/error:
        /aws-glue/jobs/logs-v2:
        /aws-glue/jobs/output:
        /aws-glue/sessions/error:
        /aws-glue/sessions/output:
    ```

    また、対象のグループが共通のプレフィックス (ここでは `/aws-glue/`) を持つ場合は、個別に列挙する代わりに、`prefix: /aws-glue/` を指定した例2を使用します。
  </details>

  **例1: 名前付きロググループ (推奨)&#x20;**

  ```shell
  cat > otel-collector-config.yaml <<'EOF'
  receivers:
    awscloudwatch:
      region: eu-central-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          named:
            /aws-glue/jobs/error:
            /aws-glue/jobs/output:
            /aws-glue/sessions/error:

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: ${OTEL_COLLECTOR_ENDPOINT}
      headers:
        authorization: ${OTLP_AUTH_TOKEN}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  EOF
  ```

  **例2: プレフィックスによるロググループの自動検出**

  ```shell
  cat > otel-collector-config.yaml <<'EOF'
  receivers:
    awscloudwatch:
      region: eu-central-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          autodiscover:
            limit: 100
            prefix: /aws-glue/

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: ${OTEL_COLLECTOR_ENDPOINT}
      headers:
        authorization: ${OTLP_AUTH_TOKEN}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  EOF
  ```

  調整すべき主な設定：

  * `region` を、ロググループが配置されているリージョンに合わせます。
  * `poll_interval` (デフォルトは `1m`) 。値を小さくすると、AWS API 呼び出しが増える代わりに、ほぼリアルタイムでログを取得できます。
  * `groups.named` は明示的なリストを指定する場合、`groups.autodiscover.prefix` はプレフィックスに一致するすべてのグループを取得する場合に使用します。

  すべてのオプションについては、[CloudWatch receiverのドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver)を参照してください。

  :::note 最新のログのみ
  初回実行時、receiverは現在時刻でチェックポイントを設定し、それ以降のログのみを取得します。過去のログは遡って取り込まれません。
  :::

  ## receiver collectorを起動する \{#start-collector\}

  `otel-collector-config.yaml` と同じ場所に `docker-compose.yaml` を作成します。`extra_hosts` エントリを設定することで、コンテナーは `host.docker.internal` を介して同一ホスト上で動作している ClickStack collector に接続できます。また、長形式のバインドマウントは、設定ファイルが存在しない場合に空のディレクトリを暗黙的に作成するのではなく、明示的にエラーを出力します。

  ```shell
  cat > docker-compose.yaml <<'EOF'
  services:
    otel-collector:
      image: otel/opentelemetry-collector-contrib:latest
      command: ["--config=/etc/otel-config.yaml"]
      volumes:
        - type: bind
          source: ./otel-collector-config.yaml
          target: /etc/otel-config.yaml
          read_only: true
      environment:
        - AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY
        - AWS_SESSION_TOKEN
        - AWS_REGION
        - OTEL_COLLECTOR_ENDPOINT
        - OTLP_AUTH_TOKEN
      extra_hosts:
        - "host.docker.internal:host-gateway"
      restart: unless-stopped
  EOF
  ```

  collectorを起動します：

  ```shell
  docker compose up -d
  ```

  logsをtailして、CloudWatchをポーリングし、ClickStack collectorにエクスポートしていることを確認します：

  ```shell
  docker compose logs -f otel-collector
  ```

  ## ClickStack UIで確認する \{#confirm-in-ui\}

  [ClickHouse Cloud console](https://console.clickhouse.cloud) でサービスを開き、左側のメニューから **ClickStack** を選択します。

  <Image img={clickstack_cloud} size="lg" alt="ClickStackを起動" border />

  **Search** ビューで、ログソースを `Logs` に切り替え、時間範囲を **Last 15 minutes** に設定します。CloudWatch のイベントは、数回のポーリング間隔以内に表示されるはずです。

  <Image img={log_search_view} size="lg" alt="CloudWatch logs を表示した ClickStack の検索ビュー" />

  各イベントは、ソースグループとストリームをリソース属性として含みます：

  * `ResourceAttributes['aws.region']`: AWSリージョン (例: `eu-central-1`)
  * `ResourceAttributes['cloudwatch.log.group.name']`: 元のロググループ
  * `ResourceAttributes['cloudwatch.log.stream']`: 送信元のログストリーム
  * `Body`: 元のログ行

  以下の属性を含めるために、検索を `Timestamp, SeverityText as level, ResourceAttributes['aws.region'], ResourceAttributes['cloudwatch.log.group.name'], ResourceAttributes['cloudwatch.log.stream'], Body` に変更します：

  <Image img={log_search_attributes_view} size="lg" alt="CloudWatch のログと属性を表示する ClickStack Search view" />

  ログエントリを選択してメタデータを確認します：

  <Image img={error_log_column_values} size="lg" alt="ログ詳細ビュー内のCloudWatch属性" />

  何も表示されない場合：

  * collector ホスト上で `aws sts get-caller-identity` を実行し、認証情報が有効であることを確認します。
  * `docker compose logs -f otel-collector` で collector のログを追跡し、`AccessDeniedException` (IAM) 、`security token` エラー (SSO credentials の有効期限切れ) 、`ResourceNotFoundException` (ロググループ名のタイプミスまたは誤った Region) 、または `connection refused` (コンテナー内から ClickStack collector endpoint に到達できない場合。`host.docker.internal` については [CloudWatch receiver を設定する](#configure-receiver) の注記を参照) を確認してください。
  * コンテナ内から `OTEL_COLLECTOR_ENDPOINT` に到達できることを確認します: `docker compose exec otel-collector wget -qO- ${OTEL_COLLECTOR_ENDPOINT}/v1/logs -S 2>&1 | head -5`.
  * `OTLP_AUTH_TOKEN` が ClickStack collector に設定した値と一致していることを確認してください。

  ## CloudWatch ダッシュボードのインポート (オプション) \{#import-dashboard\}

  ログ量、重大度の内訳、エラー分布を含むあらかじめ用意されたダッシュボードをダウンロードできます。

  <TrackedLink href={useBaseUrl('/examples/cloudwatch-logs-dashboard.json')} download="cloudwatch-logs-dashboard.json" eventName="docs.cloudwatch_logs_monitoring.dashboard_download">`cloudwatch-logs-dashboard.json`をダウンロード</TrackedLink>し、ClickStack UIで**Dashboards**に移動して**Import**をクリックします。

  <Image img={import_dashboard} size="lg" alt="ダッシュボードのインポートボタン" />

  JSONファイルをアップロードし、**インポートを完了**をクリックします。

  <Image img={finish_import} size="lg" alt="インポート ダイアログを終了" />

  ## 参考資料 \{#further-reading\}

  * [AWS CloudWatch Logs インテグレーションリファレンス](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs) で、デモデータセット、詳細なトラブルシューティング、チューニングオプションを参照してください。
  * [collector の保護](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) — OTLP endpoint で TLS を使用し、最小権限のインジェストユーザーを利用する。
  * collector でイベントの[処理、フィルタリング、エンリッチ](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)を行います。
  * 本番運用に移行する際の推奨事項については、[本番環境への移行](/use-cases/observability/clickstack/production)を参照してください。
</VerticalStepper>