---
slug: /use-cases/observability/clickstack/integrations/aws-lambda
title: 'Rotel を使用して ClickStack で AWS Lambda ログを監視する'
sidebar_label: 'AWS Lambda ログ'
pagination_prev: null
pagination_next: null
description: 'Rotel を使用して ClickStack で AWS Lambda ログを監視する'
doc_type: 'guide'
keywords: ['AWS', 'Lambda', 'OTEL', 'ClickStack', 'ログ', 'CloudWatch']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import log_view from '@site/static/images/clickstack/lambda/lambda-log-view.png';
import log from '@site/static/images/clickstack/lambda/lambda-log.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Rotel を使って ClickStack で AWS Lambda のログを監視する \{#lambda-clickstack\}

<CommunityMaintainedBadge/>

:::note[TL;DR]
このガイドでは、Rotel Lambda Extension を使用して関数ログ、拡張機能ログ、OpenTelemetry データを収集し、ClickHouse に直接転送することで、ClickStack を使って AWS Lambda 関数を監視する方法を説明します。次のことを行います:

- Rotel Lambda Extension レイヤーを Lambda 関数にデプロイする
- 拡張機能を構成して、ログとトレースを ClickStack にエクスポートする
- コスト削減のために、必要に応じて CloudWatch Logs を無効にする

このアプローチにより、CloudWatch Logs を完全にバイパスすることで、Lambda のオブザーバビリティコストを大幅に削減できます。

所要時間: 約 5〜10 分
:::

## 既存の Lambda 関数との統合 \{#existing-lambda\}

このセクションでは、既存の AWS Lambda 関数を設定し、Rotel Lambda Extension を使用してログとトレースを ClickStack に送信する方法について説明します。

### 前提条件 \{#prerequisites\}

- ClickStack インスタンスが稼働していること
- 監視対象となる AWS Lambda 関数が存在すること
- 適切な権限で設定された AWS CLI があること
- レイヤーを追加する権限を持つ Lambda 実行ロールがあること

<VerticalStepper headerLevel="h4">
  #### 適切なOTel Lambda Extensionレイヤーを選択する

  [Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension)は、ビルド済みのAWS Lambdaレイヤーとして提供されています。Lambda関数のアーキテクチャに対応するレイヤーARNを選択してください:

  | アーキテクチャ      | ARN パターン                                                                           | 最新版                                                                                                                                                                         |
  | ------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | x86-64/amd64 | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-amd64-alpha:{version}` | ![最新バージョン](https://img.shields.io/github/v/release/streamfold/rotel-lambda-extension?filter=*alpha\&label=version\&labelColor=%2338BDF8\&color=%23312E81\&cacheSeconds=600) |
  | arm64        | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-arm64-alpha:{version}` | ![バージョン](https://img.shields.io/github/v/release/streamfold/rotel-lambda-extension?filter=*alpha\&label=version\&labelColor=%2338BDF8\&color=%23312E81\&cacheSeconds=600)   |

  **利用可能なリージョン:**

  * us-east-{1, 2}, us-west-{1, 2}
  * eu-central-1, eu-north-1, eu-west-{1, 2, 3}
  * ca-central-1
  * ap-southeast-{1, 2}, ap-northeast-{1, 2}
  * ap-south-1
  * sa-east-1

  #### Lambda関数にRotelレイヤーを追加する

  *これらの例では、`{arch}`、`{region}`、`{version}` を上記の適切な値で置き換えてください。*

  ##### オプション1：AWSコンソール

  1. AWS Lambda コンソールを開きます
  2. 対象の Lambda 関数に移動します
  3. **Layers** セクションまでスクロールし、**Add a layer** をクリックします。
  4. ［**ARN を指定**］を選択します
  5. Rotel レイヤーの ARN を入力してください:
     ```text
     arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}-alpha:{version}
     ```
  6. **Add** をクリックします。

  ##### オプション2：AWS CLI

  ```bash
  aws lambda update-function-configuration \
    --function-name my-function \
    --layers arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}-alpha:{version}
  ```

  ##### オプション3：AWS SAM

  ```yaml
  Resources:
    MyFunction:
      Type: AWS::Serverless::Function
      Properties:
        # ... other configuration ...
        Layers:
          - arn:aws:lambda:{version}:418653438961:layer:rotel-extension-{arch}-alpha:{version}
  ```

  #### ClickStackへエクスポートするための拡張機能を設定する

  Rotel Lambda Extensionは環境変数を使用して設定します。OTLPエクスポーターのエンドポイントをClickStackインスタンスに向けるように設定する必要があります。以下の例では、AWS Lambda関数がClickStackインスタンスに到達できることを前提としています。

  ##### 基本設定（環境変数）

  Lambda関数に以下の環境変数を追加します：

  ```bash
  # Required: ClickStack OTLP endpoint
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317

  # Optional: Authentication headers
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=<YOUR_INGESTION_API_KEY>"

  # Optional: Service name (defaults to Lambda function name)
  ROTEL_OTEL_RESOURCE_ATTRIBUTES="service.name=my-lambda-api,service.version=1.0.0"
  ```

  ##### 高度な設定（.envファイルの使用）

  より複雑な設定を行う場合は、Lambda関数バンドル内に`rotel.env`ファイルを作成します：

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

  本番環境へのデプロイメントでは、APIキーなどの機密情報をAWS Secrets ManagerまたはParameter Storeに保存してください:

  **AWS Secrets Managerの例：**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=${arn:aws:secretsmanager:us-east-1:123456789012:secret:clickstack-api-key-abc123}"
  ```

  **AWS Parameter Store の例:**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=${arn:aws:ssm:us-east-1:123456789012:parameter/clickstack-api-key}"
  ```

  **必要なIAM権限：**

  Lambda実行ロールに以下の権限を追加します：

  Secrets Manager の場合:

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

  Parameter Storeの場合:

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
  シークレット取得のためのAWS API呼び出しにより、コールドスタート時のレイテンシが100〜150ミリ秒増加します。シークレットはバッチ処理（最大10個）で取得され、初期化時のみ実行されるため、以降の呼び出しには影響しません。
  :::

  #### 統合をテストする

  Lambda関数を呼び出して、ログがClickStackに送信されていることを確認してください:

  ```bash
  aws lambda invoke \
    --function-name my-function \
    --payload '{"test": "data"}' \
    response.json
  ```

  Lambda ログでエラーを確認してください:

  ```bash
  aws logs tail /aws/lambda/my-function --follow
  ```

  #### HyperDXでログを検証する

  設定完了後、HyperDX（ClickStackのUI）にログインし、ログが正常に取り込まれていることを確認します：

  <Image img={log_view} alt="Lambda ログビュー" />

  <Image img={log} alt="Lambda ログ詳細" />

  ログ内で以下の主要な属性を探してください:

  * `service.name`: 対象の Lambda 関数名
  * `faas.name`: AWS Lambda 関数名
  * `faas.invocation_id`: 一意の呼び出しID
  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;lambda&quot;
</VerticalStepper>

## CloudWatch Logs を無効化する（コスト最適化） {#disable-cloudwatch}

デフォルトでは、AWS Lambda はすべてのログを CloudWatch Logs に送信しますが、大規模環境では高コストになる場合があります。ログが ClickStack に流れていることを確認できたら、コスト削減のために CloudWatch Logs へのログ送信を無効化してかまいません。

<VerticalStepper headerLevel="h4">

#### 実行ロールから CloudWatch 権限を削除する \{#remove-permissions\}

1. AWS マネジメントコンソールを開き、**AWS Lambda** に移動します
2. 対象の Lambda 関数に移動します
3. **Configuration** → **Permissions** を選択します
4. 実行ロール名をクリックして IAM コンソールを開きます
5. ロールを編集し、`logs:*` アクションをすべて削除します:
   - カスタムポリシーを使用している場合は、`logs:CreateLogGroup`、`logs:CreateLogStream`、`logs:PutLogEvents` を削除します
   - AWS 管理ポリシー `AWSLambdaBasicExecutionRole` を使用している場合は、そのポリシーをロールから削除します
6. ロールを保存します

#### CloudWatch へのログ出力が無効化されたことを確認する {#verify-disabled}

関数を再度呼び出し、次の点を確認します:
1. 新しい CloudWatch のログストリームが作成されていないこと
2. ClickStack/HyperDX にログが引き続き表示されていること

```bash
# ポリシー変更後に新しいログストリームがないことを確認します
aws logs describe-log-streams \
  --log-group-name /aws/lambda/my-function \
  --order-by LastEventTime \
  --descending \
  --max-items 5
```

</VerticalStepper>

## OpenTelemetry の自動計装を追加する {#auto-instrumentation}

Rotel Lambda Extension は OpenTelemetry の自動計装レイヤーとシームレスに連携し、ログに加えて分散トレースとメトリクスも収集します。

<VerticalStepper headerLevel="h4">

#### 言語ごとの計装レイヤーを選択する {#choose-instrumentation}

AWS は複数の言語向けに OpenTelemetry の自動計装レイヤーを提供しています：

| Language | Layer ARN Pattern |
|----------|-------------------|
| Node.js  | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-{version}` |
| Python   | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-python-{arch}-ver-{version}` |
| Java     | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-java-agent-{arch}-ver-{version}` |

最新バージョンは [AWS OpenTelemetry Lambda リポジトリ](https://github.com/aws-observability/aws-otel-lambda)で確認してください。

#### 両方のレイヤーを関数に追加する \{#add-both-layers\}

Rotel Extension レイヤーと計装レイヤーの **両方** を追加します：

```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --layers \
    arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}-alpha:{version} \
    arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-1-30-2:1
```

#### 自動計装を設定する {#configure-instrumentation}

自動計装を有効にするために、環境変数 `AWS_LAMBDA_EXEC_WRAPPER` を設定します：

**Node.js の場合：**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

**Python の場合：**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-instrument
```

**Java の場合：**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

#### HyperDX でトレースを確認する {#verify-traces}

関数を呼び出した後、次を確認します：

1. HyperDX の **Traces** ビューに移動します
2. Lambda 関数からの span を含むトレースが表示されていることを確認します
3. トレースは `trace_id` と `span_id` 属性を介してログと相関付けられます

</VerticalStepper>

## サンプルアプリケーション {#examples}

Rotel Lambda Extension を利用した Python アプリのサンプルを参照してください：

- **[Python + ClickHouse](https://github.com/streamfold/python-aws-lambda-clickhouse-example)**：OpenTelemetry を手動で計装し、トレースとログを直接 ClickHouse に送信する Python アプリケーション

## Rotel コミュニティに参加する {#join-rotel-community}

Rotel についてご質問がある場合は、[Rotel の Discord サーバー](https://rotel.dev) に参加し、フィードバックやご質問をお寄せください。改善に貢献したい場合は、[Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension) をチェックしてみてください。

## 追加リソース {#resources}

- **[Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension)**: ソースコードと詳細なドキュメント
- **[Rotel Core](https://github.com/streamfold/rotel)**: この拡張機能の基盤となる軽量な OTel データプレーン