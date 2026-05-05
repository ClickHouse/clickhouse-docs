---
slug: /use-cases/observability/clickstack/text-to-chart
title: 'Text-to-Chart'
sidebar_label: 'Text-to-Chart'
pagination_prev: null
pagination_next: null
description: 'AI 搭載の Text-to-Chart 機能を使用して、ClickStack で自然言語プロンプトからチャートを生成します。'
doc_type: 'guide'
keywords: ['clickstack', 'text-to-chart', 'AI', '可視化', 'Chart Explorer', '自然言語', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import text_to_chart from '@site/static/images/clickstack/text-to-chart/text-to-chart.png';
import chart_explorer from '@site/static/images/clickstack/text-to-chart/chart-explorer.png';
import create_connection from '@site/static/images/clickstack/text-to-chart/create-connection.png';

ClickStackのText-to-Chart機能を使用すると、表示したい内容を自然文で記述するだけで可視化を作成できます。メトリクス、フィルター、グループ化フィールドを手動で選択する代わりに、&quot;過去24時間のサービス別エラー率&quot; のようなプロンプトを入力すると、ClickStackが対応するチャートを自動的に生成します。

この機能は大規模言語モデル (LLM) を使用してテキストプロンプトをクエリに変換し、[Chart Explorer](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer) で可視化を作成します。設定済みの任意のデータソースで動作します。


## 前提条件 \{#prerequisites\}

Text-to-Chart を使用するには、[Anthropic API キー](https://console.anthropic.com/)が必要です。ClickStack の起動時に、`ANTHROPIC_API_KEY` 環境変数を設定してください。

オープンソース環境にデプロイする場合は、キーを環境変数として渡します。設定方法はデプロイタイプによって異なります。

<Tabs groupId="deployMethod">
  <TabItem value="docker-aio" label="Docker (All-in-One またはローカルモード)" default>
    ```bash
    docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
    ```
  </TabItem>

  <TabItem value="docker-hyperdx" label="Docker (HyperDX のみ)">
    ```bash
    docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
    ```
  </TabItem>

  <TabItem value="docker-compose" label="Docker Compose">
    変数を `.env` ファイルに追加するか、`docker-compose.yaml` で直接設定してください。

    ```yaml
    services:
      app:
        environment:
          ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    ```
  </TabItem>

  <TabItem value="helm" label="Helm">
    `--set` を使用してキーを渡します。

    ```bash
    helm install my-hyperdx hyperdx/hdx-oss-v2 \
      --set env[0].name=ANTHROPIC_API_KEY \
      --set env[0].value=<YOUR_KEY>
    ```
  </TabItem>
</Tabs>

## Text-to-Chart を使う \{#using-text-to-chart\}

<VerticalStepper headerLevel="h3">

### Chart Explorer に移動する \{#navigate-chart-explorer\}

HyperDX の左側メニューで **Chart Explorer** を選択します。

### データソースを選択する \{#select-data-source\}

可視化するデータソースを選択します。たとえば、**Logs**、**Traces**、**Metrics** などです。

<Image img={chart_explorer} alt="Chart explorer" />

### テキストプロンプトを入力する \{#enter-text-prompt\}

Chart Explorer の上部にある **AI Assistant** の入力欄を見つけます。作成したいチャートの内容を自然言語で入力します。たとえば、次のように入力します。

- `Show error rates by service over the last 24 hours`
- `Latency breakdown by endpoint`
- `Count of events over time grouped by severity`

ClickStack はプロンプトをクエリに変換し、自動的に可視化を表示します。

<Image img={text_to_chart} alt="Text to chart" />

</VerticalStepper>

## デモデータで試す \{#demo-data\}

Text-to-Chart を最も手軽に試すには、[Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only) の Docker イメージと、[リモートのデモデータセット](/use-cases/observability/clickstack/getting-started/remote-demo-data) を使用します。

```bash
docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 clickhouse/clickstack-local:latest
```

`localhost:8080` にアクセスします。デモデータに接続するには、**Team Settings** に移動し、以下の内容で新しい接続を作成します。

* **Connection Name**: `Demo`
* **Host**: `https://sql-clickhouse.clickhouse.com`
* **Username**: `otel_demo`
* **Password**: 空欄のままにします

<Image img={create_connection} alt="接続を作成" />

次に、各ソース — **Logs**、**Traces**、**Metrics**、**Sessions** — が `otel_v2` データベースを使用するように設定します。ソースの設定方法の詳細については、[リモートデモデータセットガイド](/use-cases/observability/clickstack/getting-started/remote-demo-data)を参照してください。

接続したら、**Chart Explorer** を開き、利用可能なログ、トレース、メトリクスに対してプロンプトを試してください。


## 例のプロンプト \{#example-prompts\}

以下のプロンプトは、オブザーバビリティデータを扱う際の一般的なユースケースを示しています。

| Prompt | Data source | Description |
|--------|-------------|-------------|
| `Error count by service over time` | Logs | サービス間でのエラー発生頻度をチャート化します |
| `Average request duration grouped by endpoint` | Traces | エンドポイントごとのレイテンシパターンを示します |
| `P99 latency by service` | Traces | サービス全体のテールレイテンシを特定します |
| `Count of 5xx status codes over the last 6 hours` | Logs | サーバーエラーの傾向を追跡します |

プロンプトでは、構成済みのデータソースで使用可能な任意のカラムまたは属性を参照できます。プロンプトが具体的であるほど、生成されるチャートはより正確になります。

## 制限事項 \{#limitations\}

- Text-to-Chart は現在、LLM プロバイダーとして Anthropic のみをサポートしています。OpenAI を含む追加プロバイダーのサポートは、今後のリリースで予定されています。
- データソースとしてサポートされるのは、ログとトレースのみです。Prometheus メトリクスはまだサポートされていません。
- チャートの精度は、プロンプトの明確さと元となるデータの構造に依存します。生成されたチャートが期待どおりでない場合は、プロンプトを言い換えるか、カラム名を明示的に指定してください。

## 関連情報 \{#further-reading\}

* [テキストからチャートへ: ClickStack でよりすばやく可視化する方法](https://clickhouse.com/blog/text-to-charts-faster-way-to-visualize-clickstack) — この機能を紹介するブログ記事
* [ダッシュボードと可視化](/use-cases/observability/clickstack/dashboards) — Chart Explorer を使用した手動でのチャート作成
* [検索](/use-cases/observability/clickstack/search) — 全文検索およびプロパティ検索の構文
* [設定](/use-cases/observability/clickstack/config) — ClickStack のすべての環境変数