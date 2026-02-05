---
slug: /use-cases/observability/clickstack/integrations/jvm-metrics
title: 'ClickStack を使用した JVM メトリクスの監視'
sidebar_label: 'JVM メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した JVM の監視'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/jvm/jvm-metrics-import.png';
import example_dashboard from '@site/static/images/clickstack/jvm/jvm-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack による JVM メトリクスの監視 \{#jvm-clickstack\}

:::note[TL;DR]
このガイドでは、OpenTelemetry Java agent を使用してメトリクスを収集し、ClickStack で JVM アプリケーションを監視する方法を説明します。次のことができるようになります:

- OpenTelemetry Java agent を JVM アプリケーションにアタッチする
- エージェントを構成し、OTLP 経由で ClickStack にメトリクスを送信する
- あらかじめ用意されたダッシュボードを使用して、ヒープメモリ、ガベージコレクション、スレッド、および CPU を可視化する

本番アプリケーションをインスツルメントする前に統合をテストしたい場合に備えて、サンプルメトリクスを含むデモデータセットも利用できます。

所要時間: 5〜10分
:::

## 既存の JVM アプリケーションとの統合 \{#existing-jvm\}

このセクションでは、既存の JVM アプリケーションを設定して、OpenTelemetry Java エージェントを使用して ClickStack にメトリクスを送信する方法について説明します。

本番環境を設定する前に統合をテストしたい場合は、[デモデータセットセクション](#demo-dataset)で提供しているデモデータセットを使用してテストできます。

##### 前提条件 \{#prerequisites\}

- 起動中の ClickStack インスタンス
- 既存の Java アプリケーション（Java 8 以上）
- JVM の起動引数を変更するためのアクセス権

<VerticalStepper headerLevel="h4">

#### ClickStack API key の取得 \{#get-api-key\}

OpenTelemetry Java agent は ClickStack の OTLP エンドポイントにデータを送信します。このエンドポイントは認証を必要とします。

1. ClickStack の URL（例: http://localhost:8080）で HyperDX を開く
2. 必要に応じてアカウントを作成するかログインする
3. **Team Settings → API Keys** に移動する
4. **Ingestion API Key** をコピーする

<Image img={api_key} alt="ClickStack API Key"/>

#### OpenTelemetry Java agent のダウンロード \{#download-agent\}

OpenTelemetry Java agent の JAR ファイルをダウンロードします:

```bash
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.22.0/opentelemetry-javaagent.jar
```

これにより、現在のディレクトリに agent がダウンロードされます。デプロイ方法に応じて、任意の場所に配置できます（例: `/opt/opentelemetry/` やアプリケーション JAR と同じディレクトリなど）。

#### JVM の起動引数を設定する \{#configure-jvm\}

Java agent を JVM の起動コマンドに追加します。agent は JVM メトリクスを自動的に収集し、ClickStack に送信します。

##### オプション 1: コマンドラインフラグ \{#command-line-flags\}

```bash
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.service.name=my-java-app \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -Dotel.exporter.otlp.protocol=http/protobuf \
  -Dotel.exporter.otlp.headers="authorization=YOUR_API_KEY" \
  -Dotel.metrics.exporter=otlp \
  -Dotel.logs.exporter=none \
  -Dotel.traces.exporter=none \
  -jar my-application.jar
```

**次の値を置き換えてください:**
- `opentelemetry-javaagent.jar` → agent JAR へのフルパス（例: `/opt/opentelemetry/opentelemetry-javaagent.jar`）
- `my-java-app` → サービスのわかりやすい名前（例: `payment-service`, `user-api`）
- `YOUR_API_KEY` → 上記の手順で取得した ClickStack のインジェスト API key
- `my-application.jar` → アプリケーションの JAR ファイル名
- `http://localhost:4318` → ClickStack のエンドポイント（ClickStack が同一マシンで動作している場合は `localhost:4318`、それ以外の場合は `http://your-clickstack-host:4318` を使用）

##### オプション 2: 環境変数 \{#env-vars\}

代わりに、環境変数を使用することもできます:

```bash
export JAVA_TOOL_OPTIONS="-javaagent:opentelemetry-javaagent.jar"
export OTEL_SERVICE_NAME="my-java-app"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_HEADERS="authorization=YOUR_API_KEY"
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="none"
export OTEL_TRACES_EXPORTER="none"

java -jar my-application.jar
```

**次の値を置き換えてください:**
- `opentelemetry-javaagent.jar` → agent JAR へのフルパス
- `my-java-app` → サービス名
- `YOUR_API_KEY` → ClickStack のインジェスト API key
- `http://localhost:4318` → ClickStack のエンドポイント
- `my-application.jar` → アプリケーションの JAR ファイル名

:::tip
OpenTelemetry Java agent は以下の JVM メトリクスを自動的に収集します:

- **メモリ**: `jvm.memory.used`, `jvm.memory.limit`, `jvm.memory.committed`, `jvm.memory.used_after_last_gc`
- **ガベージコレクション**: `jvm.gc.duration`
- **スレッド**: `jvm.thread.count`
- **クラス**: `jvm.class.count`, `jvm.class.loaded`, `jvm.class.unloaded`
- **CPU**: `jvm.cpu.time`, `jvm.cpu.count`
:::

#### HyperDX でメトリクスを確認する \{#verifying-metrics\}

アプリケーションを agent 付きで起動したら、メトリクスが ClickStack に流れていることを確認します:

1. http://localhost:8080（または ClickStack の URL）で HyperDX を開く
2. **Chart Explorer** に移動する
3. `jvm.` で始まるメトリクスを検索する（例: `jvm.memory.used`, `jvm.gc.duration`, `jvm.thread.count`）

</VerticalStepper>

## デモデータセット \{#demo-dataset\}

アプリケーションを計測する前に JVM メトリクス連携をテストしたいユーザー向けに、事前生成されたメトリクスを含むサンプルデータセットを提供しています。これは、安定した中程度のトラフィックがある中規模マイクロサービスにおける現実的な JVM の挙動を再現したものです。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする \{#download-sample\}

```bash
# ゲージメトリクス（メモリ、スレッド、CPU、クラス）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-gauge.jsonl

# Sum メトリクス（GC イベント）をダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-sum.jsonl
```

このデータセットには、以下を示す 24 時間分の JVM メトリクスが含まれます:
- 定期的なガーベジコレクションイベントを伴うヒープメモリの増加
- スレッド数の変動
- 現実的な GC ポーズ時間
- クラスロードのアクティビティ
- CPU 利用率のパターン

#### ClickStack を起動する \{#start-clickstack\}

まだ ClickStack を起動していない場合:

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack が完全に起動するまで、しばらく待ちます。

#### デモデータセットをインポートする \{#import-demo-data\}

```bash
# ゲージメトリクス（メモリ、スレッド、CPU、クラス）をインポート
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_gauge FORMAT JSONEachRow
" < jvm-metrics-gauge.jsonl

# Sum メトリクス（GC イベント）をインポート
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_sum FORMAT JSONEachRow
" < jvm-metrics-sum.jsonl
```

これにより、メトリクスは ClickStack のメトリクステーブルに直接インポートされます。

#### デモデータを検証する \{#verify-demo-metrics\}

インポートが完了したら:

1. http://localhost:8080 で HyperDX を開き、ログインします（必要に応じてアカウントを作成）
2. Search ビューに移動し、source を **Metrics** に設定します
3. タイムレンジを **2025-12-06 14:00:00 - 2025-12-09 14:00:00** に設定します
4. `jvm.memory.used` または `jvm.gc.duration` を検索します

デモサービスのメトリクスが表示されるはずです。

:::note[Timezone Display]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)** の期間をカバーしています。ロケーションに関係なくデモメトリクスを確認できるよう、タイムレンジを **2025-12-06 14:00:00 - 2025-12-09 14:00:00** に設定してください。メトリクスが表示されてから、可視化を分かりやすくするために 24 時間の期間に絞り込むことができます。
:::

</VerticalStepper>

## ダッシュボードと可視化 \{#dashboards\}

ClickStack で JVM アプリケーションを監視できるようにするために、JVM メトリクス向けの主要な可視化を備えたあらかじめ用意されたダッシュボードを提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を <TrackedLink href={useBaseUrl('/examples/jvm-metrics-dashboard.json')} download="jvm-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">ダウンロード</TrackedLink> する \{#download\}

#### 用意されたダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、Dashboards セクションに移動します
2. 右上の三点リーダー（…）メニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `jvm-metrics-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポートの完了"/>

#### ダッシュボードを表示する \{#created-dashboard\}

ダッシュボードは、すべての可視化があらかじめ設定された状態で作成されます。

<Image img={example_dashboard} alt="Kafka Metrics ダッシュボード"/>

:::note
デモ用データセットでは、時間範囲を **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)** に設定してください。ローカルタイムゾーンに応じて調整してください。
:::

</VerticalStepper>

## トラブルシューティング \{#troubleshooting\}

### エージェントが起動しない \{#troubleshooting-not-loading\}

**エージェントの JAR ファイルが存在することを確認する:**

```bash
ls -lh /path/to/opentelemetry-javaagent.jar
```

**Java バージョンの互換性を確認する（Java 8 以降が必要）:**

```bash
java -version
```

**エージェント起動時のログメッセージを確認する：**
アプリケーションが起動すると、次のような出力が表示されているはずです：

```text
[otel.javaagent] OpenTelemetry Javaagent v2.22.0 started
```


### HyperDX にメトリクスが表示されない \{#no-metrics\}

**ClickStack が稼働しており、アクセス可能であることを確認してください:**

```bash
docker ps | grep clickstack
curl -v http://localhost:4318/v1/metrics
```

**メトリクスエクスポーターの設定を確認する：**

```bash
# If using environment variables, verify:
echo $OTEL_METRICS_EXPORTER
# Should output: otlp
```

**OpenTelemetry エラーについてアプリケーションログを確認する:**
アプリケーションログ内で、OpenTelemetry または OTLP エクスポートの失敗に関連するエラーメッセージを探してください。

**ネットワーク接続を確認する:**
ClickStack がリモートホスト上にある場合、アプリケーションサーバーからポート 4318 にアクセスできることを確認してください。

**エージェントバージョンを確認する:**
最新の安定版エージェントのバージョン (現在は 2.22.0) を使用していることを確認してください。新しいバージョンにはパフォーマンス改善が含まれている場合が多くあります。


## 次のステップ \{#next-steps\}

JVM メトリクスが ClickStack に送信されるようになったので、次の点を検討してください:

- 高いヒープ使用率、頻繁な GC 一時停止、スレッド枯渇といった重要なメトリクスに対する [アラート](/use-cases/observability/clickstack/alerts) を設定する
- オブザーバビリティ データを一元化するために、[その他の ClickStack 連携](/use-cases/observability/clickstack/integration-guides) を検討する

## 本番環境への移行 \{#going-to-production\}

このガイドでは、ローカルテスト向けの OpenTelemetry Java エージェントの設定方法を説明しました。本番環境にデプロイする場合は、エージェントの JAR をコンテナイメージに組み込み、管理を容易にするために環境変数で設定してください。多数の JVM インスタンスが存在する大規模環境では、各アプリケーションから ClickStack に直接送信するのではなく、一元的な OpenTelemetry Collector をデプロイし、複数アプリケーションからのメトリクスをバッチ処理して転送する構成にします。

本番環境向けのデプロイパターンおよび Collector の設定例については、[Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。