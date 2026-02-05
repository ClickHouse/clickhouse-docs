---
slug: /use-cases/observability/clickstack/integrations/aws-cloudwatch-logs
title: 'ClickStack を使用した AWS CloudWatch Logs の監視'
sidebar_label: 'AWS CloudWatch Logs'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した AWS CloudWatch Logs の監視'
doc_type: 'guide'
keywords: ['AWS', 'CloudWatch', 'OTEL', 'ClickStack', 'logs']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudwatch/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudwatch/logs-dashboard.png';
import log_search_view from '@site/static/images/clickstack/cloudwatch/log-search-view.png';
import demo_search_view from '@site/static/images/clickstack/cloudwatch/demo-search-view.png';
import error_log_overview from '@site/static/images/clickstack/cloudwatch/error-log-overview.png';
import error_log_column_values from '@site/static/images/clickstack/cloudwatch/error-log-column-values.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Monitoring AWS CloudWatch Logs with ClickStack \{#cloudwatch-clickstack\}

:::note[TL;DR]
このガイドでは、OpenTelemetry Collector の AWS CloudWatch Receiver を使用して、AWS CloudWatch のログを ClickStack に転送する方法を説明します。次の内容を学びます:

- OpenTelemetry Collector を構成して CloudWatch からログを取得する方法
- AWS 認証情報と IAM 権限を設定する方法
- OTLP 経由で CloudWatch のログを ClickStack に送信する方法
- ロググループのフィルタリングと自動検出の方法
- あらかじめ用意されたダッシュボードを使って CloudWatch ログのパターンを可視化する方法

本番の AWS 環境を設定する前にこの連携をテストしたい場合は、サンプルログを含むデモデータセットを利用できます。

所要時間: 約 10〜15 分
:::

## 概要 \{#overview\}

AWS CloudWatch は、AWS リソースとアプリケーション向けのモニタリングサービスです。CloudWatch でもログの集約は可能ですが、ログを ClickStack に転送すると次のことができるようになります:

- メトリクスやトレースとあわせて、統合プラットフォーム上でログを分析できる
- ClickHouse の SQL インターフェイスを使ってログをクエリできる
- CloudWatch の保持期間を短くするか、アーカイブすることでコストを削減できる

このガイドでは、OpenTelemetry Collector を使用して CloudWatch のログを ClickStack に転送する方法を説明します。

## 既存の CloudWatch ロググループとの連携 \{#existing-cloudwatch\}

このセクションでは、既存の CloudWatch ロググループからログを取得し、ClickStack に転送するように OpenTelemetry Collector を設定する方法を説明します。

本番環境の設定を行う前に連携を試したい場合は、[デモデータセットのセクション](#demo-dataset)にあるデモデータセットを使ってテストできます。

### 前提条件 \{#prerequisites\}

- ClickStack インスタンスが稼働していること
- CloudWatch ロググループを持つ AWS アカウント
- 適切な IAM 権限を持つ AWS 資格情報

:::note
ファイルベースのログ連携（nginx、Redis）とは異なり、CloudWatch では CloudWatch API をポーリングする専用の OpenTelemetry Collector を実行する必要があります。この Collector は AWS の資格情報と API へのアクセスが必要なため、ClickStack の all-in-one イメージ内で実行することはできません。
:::

<VerticalStepper headerLevel="h4">
  #### ClickStack API キーを取得する

  OpenTelemetry CollectorはClickStackのOTLPエンドポイントにデータを送信します。このエンドポイントには認証が必要です。

  1. ClickStack の URL で HyperDX を開きます（例: http://localhost:8080）
  2. 必要に応じてアカウントを作成するか、ログインしてください
  3. **Team Settings → API Keys** に移動してください
  4. **インジェスト API key** をコピーしてください

  <Image img={api_key} alt="ClickStack API キー" />

  これを環境変数として保存してください:

  ```bash
  export CLICKSTACK_API_KEY="your-api-key-here"
  ```

  #### AWS認証情報の設定

  AWS認証情報を環境変数としてエクスポートしてください。方法は認証タイプによって異なります：

  **AWS SSOユーザーの場合（ほとんどの組織で推奨）：**

  ```bash
  # Login to SSO
  aws sso login --profile YOUR_PROFILE_NAME

  # Export credentials to environment variables
  eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)

  # Verify credentials work
  aws sts get-caller-identity
  ```

  `YOUR_PROFILE_NAME` を AWS SSO プロファイル名で置き換えます（例：`AccountAdministrators-123456789`）。

  **長期的な認証情報を持つIAMユーザーの場合:**

  ```bash
  export AWS_ACCESS_KEY_ID="your-access-key-id"
  export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
  export AWS_REGION="us-east-1"

  # Verify credentials work
  aws sts get-caller-identity
  ```

  **必要なIAM権限:**

  これらの認証情報に関連付けられたAWSアカウントには、CloudWatch logsを読み取るための以下のIAMポリシーが必要です:

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

  `YOUR_ACCOUNT_ID` をご自身の AWS アカウント ID に置き換えてください。

  #### CloudWatch receiverを設定する

  CloudWatchレシーバー設定を含む`otel-collector-config.yaml`ファイルを作成してください。

  **例1: 名前付きログ グループ（推奨）**

  この設定は、特定の名前付きログ グループからログを収集します:

  ```yaml
  receivers:
    awscloudwatch:
      region: us-east-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          named:
            /aws/lambda/my-function:
            /aws/ecs/my-service:
            /aws/eks/my-cluster/cluster:

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: http://localhost:4318
      headers:
        authorization: ${CLICKSTACK_API_KEY}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  ```

  **例2: プレフィックスによるログループの自動検出**

  この設定により、プレフィックス `/aws/lambda` で始まる最大100個のロググループを自動検出し、ログを収集します:

  ```yaml
  receivers:
    awscloudwatch:
      region: us-east-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          autodiscover:
            limit: 100
            prefix: /aws/lambda

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: http://localhost:4318
      headers:
        authorization: ${CLICKSTACK_API_KEY}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  ```

  **設定パラメーター:**

  * `region`: ロググループが配置されている AWS リージョン
  * `poll_interval`: 新しいログがないか確認する間隔（例: `1m`, `5m`）
  * `max_events_per_request`: 1 回のリクエストあたりに取得するログイベント数の上限
  * `groups.autodiscover.limit`: 自動検出するロググループ数の上限
  * `groups.autodiscover.prefix`: プレフィックスでロググループをフィルタリング
  * `groups.named`: 収集するロググループ名を明示的に列挙します

  その他の設定オプションについては、[CloudWatch receiverのドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver)を参照してください。

  **以下を置き換えます:**

  * `${CLICKSTACK_API_KEY}` → 先ほど設定した環境変数の値を使用します
  * `http://localhost:4318` → ご利用の ClickStack エンドポイント（リモートで稼働している場合は、その ClickStack ホストを指定）
  * `us-east-1` → お使いの AWS リージョン
  * ロググループ名/プレフィックス → 実際に使用している CloudWatch ロググループ

  :::note
  CloudWatchレシーバーは、最近の時間枠のログのみを取得します(`poll_interval`に基づく)。初回起動時は現在時刻から開始します。デフォルトでは過去のログは取得されません。
  :::

  #### コレクターを起動する

  `docker-compose.yaml` ファイルを作成します:

  ```yaml
  services:
    otel-collector:
      image: otel/opentelemetry-collector-contrib:latest
      command: ["--config=/etc/otel-config.yaml"]
      volumes:
        - ./otel-collector-config.yaml:/etc/otel-config.yaml
      environment:
        - AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY
        - AWS_SESSION_TOKEN
        - AWS_REGION
        - CLICKSTACK_API_KEY
      restart: unless-stopped
      extra_hosts:
        - "host.docker.internal:host-gateway"
  ```

  次にコレクターを起動します:

  ```bash
  docker compose up -d
  ```

  コレクターのログを表示:

  ```bash
  docker compose logs -f otel-collector
  ```

  #### HyperDXでログを検証する

  コレクターが起動したら:

  1. http://localhost:8080（またはご利用の ClickStack の URL）で HyperDX にアクセスします
  2. **Logs** ビューに移動してください
  3. ログが表示され始めるまで 1～2 分待ちます（ポーリング間隔に応じて変動します）
  4. CloudWatch のロググループ内のログを検索する

  <Image img={log_search_view} alt="ログ検索ビュー" />

  ログ内で以下の主要な属性を確認します:

  * `ResourceAttributes['aws.region']`: AWS のリージョン（例: &quot;us-east-1&quot;）
  * `ResourceAttributes['cloudwatch.log.group.name']`: CloudWatch のロググループの名前
  * `ResourceAttributes['cloudwatch.log.stream']`: ログストリームの名前
  * `Body`: ログメッセージ本体

  <Image img={error_log_column_values} alt="エラーログのカラム値" />
</VerticalStepper>

## デモデータセット {#demo-dataset}

本番の AWS 環境を設定する前に CloudWatch Logs 連携をテストしたいユーザー向けに、複数の AWS サービスからの現実的なパターンを示す、あらかじめ生成済みのログを含むサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする \{#download-sample\}

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/aws/cloudwatch/cloudwatch-logs.jsonl
```

このデータセットには、複数のサービスからの 24 時間分の CloudWatch Logs が含まれます:
- **Lambda functions**: 支払い処理、注文管理、認証
- **ECS services**: レート制限とタイムアウト付きの API ゲートウェイ
- **Background jobs**: リトライパターンを伴うバッチ処理

#### ClickStack を起動する \{#start-clickstack\}

まだ ClickStack を実行していない場合:

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack が完全に起動するまで、しばらく待ちます。

#### デモデータセットをインポートする \{#import-demo-data\}

```bash
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_logs FORMAT JSONEachRow
" < cloudwatch-logs.jsonl
```

これにより、ログが ClickStack のログ用テーブルに直接インポートされます。

#### デモデータを検証する \{#verify-demo-logs\}

インポートが完了したら:

1. http://localhost:8080 で HyperDX を開き、ログインします（必要に応じてアカウントを作成）
2. **Logs** ビューに移動します
3. タイムレンジを **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)** に設定します
4. `cloudwatch-demo` を検索するか、`LogAttributes['source'] = 'cloudwatch-demo'` でフィルタリングします

複数の CloudWatch ロググループからのログが表示されるはずです。

<Image img={demo_search_view} alt="デモ検索ビュー"/>

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)** の期間をカバーしています。場所に関係なくデモログを必ず表示できるようにするため、タイムレンジを **2025-12-06 00:00:00 - 2025-12-09 00:00:00** に設定してください。ログが表示されることを確認したら、可視化を分かりやすくするためにレンジを 24 時間に絞り込むことができます。
:::

</VerticalStepper>

## ダッシュボードと可視化 \{#dashboards\}

ClickStack で CloudWatch ログを監視しやすくするために、主要な可視化を含むあらかじめ用意されたダッシュボードを提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/cloudwatch-logs-dashboard.json')} download="cloudwatch-logs-dashboard.json" eventName="docs.cloudwatch_logs_monitoring.dashboard_download">ダウンロード</TrackedLink> ダッシュボード構成ファイル \{#download\}

#### ダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、Dashboards セクションに移動します
2. 画面右上の省略記号メニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `cloudwatch-logs-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポート完了ダイアログ"/>

#### ダッシュボードを表示する \{#created-dashboard\}

すべての可視化があらかじめ設定された状態でダッシュボードが作成されます:

<Image img={example_dashboard} alt="CloudWatch Logs ダッシュボード"/>

:::note
デモデータセットの場合、タイムレンジを **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトではタイムレンジが指定されていません。
:::

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### HyperDX にログが表示されない

**AWS の認証情報が設定されていることを確認してください:**

```bash
aws sts get-caller-identity
```

これが失敗する場合は、クレデンシャルが無効になっているか、有効期限が切れています。

**IAM の権限を確認します:**
AWS のクレデンシャルに、必要な `logs:DescribeLogGroups` および `logs:FilterLogEvents` 権限が付与されていることを確認します。

**コレクターのログでエラーを確認します:**

```bash
# If using Docker directly, logs appear in stdout
# If using Docker Compose:
docker compose logs otel-collector
```

よくあるエラー:

* `The security token included in the request is invalid`: 認証情報が無効、または期限切れです。一時的な認証情報 (SSO) の場合は、`AWS_SESSION_TOKEN` が設定されていることを確認してください。
* `operation error CloudWatch Logs: FilterLogEvents, AccessDeniedException`: IAM 権限が不十分です
* `failed to refresh cached credentials, no EC2 IMDS role found`: AWS 認証情報の環境変数が設定されていません
* `connection refused`: ClickStack のエンドポイントに到達できません

**CloudWatch のロググループが存在し、最近のログが出力されていることを確認してください:**

```bash
# List your log groups
aws logs describe-log-groups --region us-east-1

# Check if a specific log group has recent logs (last hour)
aws logs filter-log-events \
  --log-group-name /aws/lambda/my-function \
  --region us-east-1 \
  --start-time $(date -u -v-1H +%s)000 \
  --max-items 5
```


### 古いログしか表示されない、または最新のログが欠けている

**CloudWatch receiver はデフォルトで「現在時刻」から開始されます:**

collector が最初に起動すると、現在時刻でチェックポイントを作成し、その時点以降のログのみを取得します。過去のログは取得されません。

**直近の履歴ログを収集するには:**

collector を停止し、そのチェックポイントを削除してから再起動します:

```bash
# Stop the collector
docker stop <container-id>

# Restart fresh (checkpoints are stored in container, so removing it resets)
docker run --rm ...
```

レシーバーは新しいチェックポイントを作成し、現在時刻以降のログを取得します。


### 無効なセキュリティトークン / 認証情報の期限切れ

一時的な認証情報（AWS SSO や AssumeRole などで取得したもの）を使用している場合、一定時間が経過すると期限切れになります。

**新しい認証情報を再度エクスポートする:**

```bash
# For SSO users:
aws sso login --profile YOUR_PROFILE_NAME
eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)

# For IAM users:
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"

# Restart the collector
docker restart <container-id>
```


### レイテンシが高い、または直近のログが取得できない

**ポーリング間隔を短くする:**
デフォルトの `poll_interval` は 1 分です。ほぼリアルタイムでログを取得したい場合は、この値を短くしてください:

```yaml
logs:
  poll_interval: 30s  # Poll every 30 seconds
```

**注意:** ポーリング間隔を短く設定すると AWS API 呼び出しが増え、CloudWatch API のコストが高くなる可能性があります。


### コレクターのメモリ使用量が多すぎる

**バッチサイズを小さくするか、タイムアウト値を長めに設定する：**

```yaml
processors:
  batch:
    timeout: 5s
    send_batch_size: 100
```

**自動検出の制限：**

```yaml
groups:
  autodiscover:
    limit: 50  # Reduce from 100 to 50
```


## 次のステップ {#next-steps}

CloudWatch のログが ClickStack に取り込まれるようになったので、次のことを実施します:

- 重大なイベント（接続失敗、エラー急増）向けに [アラート](/use-cases/observability/clickstack/alerts) を設定する
- ログが ClickStack にあるので、保持期間の調整や S3 へのアーカイブにより CloudWatch のコストを削減する
- コレクター設定から除外することで、ノイズの多いロググループをフィルタリングし、インジェスト量を削減する

## 本番運用への移行 {#going-to-production}

このガイドでは、テスト目的で Docker Compose を使用して OpenTelemetry Collector をローカルで実行する方法を説明します。本番運用でのデプロイでは、アクセスキーを管理する必要をなくすために、AWS にアクセス可能なインフラストラクチャ（IAM ロール付きの EC2、IRSA を利用する EKS、タスクロール付きの ECS など）上で collector を実行してください。レイテンシーとコストを削減するため、CloudWatch のロググループと同じ AWS リージョンに collector をデプロイします。

本番環境でのデプロイパターンと collector の設定例については、[OpenTelemetry を用いたデータ取り込み](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。