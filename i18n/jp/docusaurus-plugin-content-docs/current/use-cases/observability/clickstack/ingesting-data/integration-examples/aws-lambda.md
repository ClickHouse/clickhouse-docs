---
slug: /use-cases/observability/clickstack/integrations/aws-lambda
title: 'Rotel を使用した ClickStack による AWS Lambda ログの監視'
sidebar_label: 'AWS Lambda ログ'
pagination_prev: null
pagination_next: null
description: 'Rotel を使用した ClickStack による AWS Lambda ログの監視'
doc_type: 'guide'
keywords: ['AWS', 'Lambda', 'OTEL', 'ClickStack', 'logs', 'CloudWatch']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import log_view from '@site/static/images/clickstack/lambda/lambda-log-view.png';
import log from '@site/static/images/clickstack/lambda/lambda-log.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Rotel を使用して ClickStack で AWS Lambda ログを監視する \{#lambda-clickstack\}

<CommunityMaintainedBadge/>

:::note[概要]
このガイドでは、Rotel Lambda Extension を使用して関数ログ、拡張機能のログ、および OpenTelemetry データを直接 ClickHouse に収集・転送し、ClickStack で AWS Lambda 関数を監視する方法を説明します。ここでは次の内容を扱います:

- Rotel Lambda Extension レイヤーを Lambda 関数にデプロイする
- 拡張機能を設定して、ログとトレースを ClickStack にエクスポートする
- 必要に応じて CloudWatch Logs を無効化してコストを削減する

このアプローチにより、CloudWatch Logs を完全に経由せずに Lambda のオブザーバビリティコストを大幅に削減できます。

所要時間: 5～10 分
:::

## 既存の Lambda 関数との統合 \{#existing-lambda\}

このセクションでは、Rotel Lambda Extension を使用して ClickStack にログとトレースを送信するように、既存の AWS Lambda 関数を設定する方法について説明します。

### 前提条件 \{#prerequisites\}

- 稼働中の ClickStack インスタンス
- 監視対象の AWS Lambda 関数
- 適切な権限が設定された AWS CLI
- レイヤーを追加する権限を持つ Lambda の実行ロール

<VerticalStepper headerLevel="h4">
  #### 適切なRotel Lambda拡張レイヤーを選択

  Lambda ランタイムアーキテクチャに一致する Lambda レイヤーを選択します。`{version}` フィールドは、デプロイ先の AWS リージョンによって異なります。お使いのリージョンに対応する最新のバージョン番号は、[releases](https://github.com/streamfold/rotel-lambda-extension/releases) ページで確認してください。

  | アーキテクチャ      | ARN                                                                          |
  | ------------ | ---------------------------------------------------------------------------- |
  | x86-64/amd64 | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-amd64:{version}` |
  | arm64        | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-arm64:{version}` |

  **利用可能なリージョン:**

  * us-east-{1, 2}, us-west-{1, 2}
  * eu-central-1, eu-north-1, eu-west-{1, 2, 3}
  * ca-central-1
  * ap-southeast-{1, 2}, ap-northeast-{1, 2}
  * ap-south-1
  * sa-east-1

  #### Lambda関数にRotelレイヤーを追加する

  *これらの例では、`{arch}`、`{region}`、および `{version}` を上記の適切な値に置き換えてください。*

  ##### オプション1：AWSコンソール

  1. AWS Lambda コンソールを開きます
  2. ご利用の Lambda 関数に移動します
  3. **Layers** セクションまでスクロールし、**Add a layer** をクリックします。
  4. **Specify an ARN** を選択します。
  5. Rotel レイヤーの ARN を入力してください:
     ```text
     arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version}
     ```
  6. **Add** をクリックします

  ##### オプション2：AWS CLI

  ```bash
  aws lambda update-function-configuration \
    --function-name my-function \
    --layers arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version}
  ```

  ##### オプション3：AWS SAM

  ```yaml
  Resources:
    MyFunction:
      Type: AWS::Serverless::Function
      Properties:
        # ... other configuration ...
        Layers:
          - arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version}
  ```

  #### ClickStackへエクスポートするための拡張機能を設定する

  Rotel Lambda拡張機能は環境変数を使用して設定されます。OTLPエクスポーターのエンドポイントをClickStackインスタンスに向けるように設定する必要があります。以下の例では、AWS Lambda関数がClickStackインスタンスに到達できることを前提としています。

  ##### 基本設定（環境変数）

  Lambda関数に次の環境変数を追加します：

  ```bash
  # Required: ClickStack OTLP endpoint
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317

  # Optional: Authentication headers
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=<YOUR_INGESTION_API_KEY>"

  # Optional: Service name (defaults to Lambda function name)
  ROTEL_OTEL_RESOURCE_ATTRIBUTES="service.name=my-lambda-api,service.version=1.0.0"
  ```

  ##### 高度な設定（.envファイルの使用）

  より複雑な設定を行う場合は、Lambda関数バンドル内に`rotel.env`ファイルを作成します:

  **rotel.env:**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=<YOUR_INGESTION_API_KEY>"
  ROTEL_OTEL_RESOURCE_ATTRIBUTES="service.name=my-lambda-api,deployment.environment=production"
  ```

  次に、このファイルを指すように環境変数を設定します:

  ```bash
  ROTEL_ENV_FILE=/var/task/rotel.env
  ```

  ##### AWS Secrets ManagerまたはParameter Storeを使用する

  本番環境へのデプロイメントでは、APIキーなどの機密情報をAWS Secrets ManagerまたはParameter Storeに保存してください：

  **AWS Secrets Manager の例:**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=${arn:aws:secretsmanager:us-east-1:123456789012:secret:clickstack-api-key-abc123}"
  ```

  **AWS Parameter Store の例:**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=${arn:aws:ssm:us-east-1:123456789012:parameter/clickstack-api-key}"
  ```

  **必要なIAM権限:**

  Lambda実行ロールに次の権限を追加します:

  Secrets Managerの場合:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue",
          "secretsmanager:BatchGetSecretValue"
        ],
        "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:clickstack-api-key-*"
      }
    ]
  }
  ```

  Parameter Store の場合:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ssm:GetParameters"
        ],
        "Resource": "arn:aws:ssm:us-east-1:123456789012:parameter/clickstack-api-key"
      }
    ]
  }
  ```

  :::note
  シークレット取得のためのAWS API呼び出しにより、コールドスタート時のレイテンシが100〜150ms増加します。シークレットはバッチ(最大10個)で取得され、初期化時のみ実行されるため、以降の呼び出しには影響しません。
  :::

  #### 統合をテストする

  Lambda関数を呼び出して、ログがClickStackに送信されていることを確認してください:

  ```bash
  aws lambda invoke \
    --function-name my-function \
    --payload '{"test": "data"}' \
    response.json
  ```

  Lambda ログでエラーを確認します:

  ```bash
  aws logs tail /aws/lambda/my-function --follow
  ```

  #### HyperDXでログを検証する

  設定完了後、HyperDX（ClickStackのUI）にログインし、ログが正常に送信されていることを確認します：

  <Image img={log_view} alt="Lambda ログビュー" />

  <Image img={log} alt="Lambda ログ詳細" />

  ログ内で以下の主要な属性を確認します:

  * `service.name`: お使いの Lambda 関数名
  * `faas.name`: AWS Lambda 関数名
  * `faas.invocation_id`: 一意の呼び出しID
  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;lambda&quot;
</VerticalStepper>

## CloudWatch Logs の無効化（コスト最適化） {#disable-cloudwatch}

デフォルトでは、AWS Lambda はすべてのログを CloudWatch Logs に送信しますが、大規模になると高コストになる可能性があります。ログが ClickStack へ正常に送信されていることを確認できたら、コスト削減のために CloudWatch へのログ送信を無効化できます。

<VerticalStepper headerLevel="h4">

#### 実行ロールから CloudWatch 権限を削除する \{#remove-permissions\}

1. AWS マネジメントコンソールを開き、**AWS Lambda** にアクセスします
2. 対象の Lambda 関数に移動します
3. **Configuration** → **Permissions** を選択します
4. 実行ロール名をクリックして IAM コンソールを開きます
5. ロールを編集し、`logs:*` アクションをすべて削除します:
   - カスタムポリシーを使用している場合は、`logs:CreateLogGroup`、`logs:CreateLogStream`、`logs:PutLogEvents` を削除するように編集します
   - AWS マネージドポリシー `AWSLambdaBasicExecutionRole` を使用している場合は、そのポリシーをロールから削除します
6. ロールを保存します

#### CloudWatch ログ出力が無効化されたことを確認する {#verify-disabled}

関数を再度実行し、次の点を確認します:
1. 新しい CloudWatch ログストリームが作成されていないこと
2. ClickStack/HyperDX にログが引き続き表示されていること

```bash
# ポリシー変更後に新しいログストリームが作成されていないことを確認する
aws logs describe-log-streams \
  --log-group-name /aws/lambda/my-function \
  --order-by LastEventTime \
  --descending \
  --max-items 5
```

</VerticalStepper>

## OpenTelemetry の自動計測を追加する {#auto-instrumentation}

Rotel Lambda Extension は OpenTelemetry の自動計測レイヤーとシームレスに連携し、ログに加えて分散トレースとメトリクスも収集します。

<VerticalStepper headerLevel="h4">

#### 使用言語のインストルメンテーションレイヤーを選択する {#choose-instrumentation}

AWS は複数の言語向けに OpenTelemetry の自動計測レイヤーを提供しています。

| Language | Layer ARN Pattern |
|----------|-------------------|
| Node.js  | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-{version}` |
| Python   | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-python-{arch}-ver-{version}` |
| Java     | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-java-agent-{arch}-ver-{version}` |

最新版は [AWS OpenTelemetry Lambda リポジトリ](https://github.com/aws-observability/aws-otel-lambda)で確認してください。

#### 両方のレイヤーを関数に追加する \{#add-both-layers\}

Rotel Extension レイヤーとインストルメンテーションレイヤーの **両方** を追加します。

```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --layers \
    arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version} \
    arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-1-30-2:1
```

#### 自動計測を設定する {#configure-instrumentation}

自動計測を有効化するために、環境変数 `AWS_LAMBDA_EXEC_WRAPPER` を設定します。

**Node.js の場合:**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

**Python の場合:**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-instrument
```

**Java の場合:**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

#### HyperDX でトレースを検証する {#verify-traces}

関数を呼び出した後、次を実施します。

1. HyperDX の **Traces** ビューに移動します
2. Lambda 関数からのスパンを含むトレースが表示されていることを確認します
3. トレースは `trace_id` と `span_id` 属性を介してログと相関付けられます

</VerticalStepper>

## サンプルアプリケーション {#examples}

Rotel Lambda Extension を利用したサンプルの Python アプリケーションをご覧ください:

- **[Python + ClickHouse](https://github.com/streamfold/python-aws-lambda-clickhouse-example)**: 手動で OpenTelemetry 計装を行い、トレースとログを直接 ClickHouse に送信する Python アプリケーション

## Rotel コミュニティに参加する {#join-rotel-community}

Rotel について質問がある場合は、[Rotel Discord サーバー](https://rotel.dev)に参加して、フィードバックや質問を投稿してください。改善に貢献したい場合は、[Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension)もご覧ください。

## 追加の参考資料 {#resources}

- **[Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension)**: ソースコードと詳細なドキュメント
- **[Rotel Core](https://github.com/streamfold/rotel)**: この拡張機能の基盤となる軽量な OTel データプレーン