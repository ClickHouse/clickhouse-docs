---
slug: /use-cases/observability/clickstack/integrations/jvm-metrics
title: 'ClickStack による JVM メトリクスの監視'
sidebar_label: 'JVM メトリクス'
pagination_prev: null
pagination_next: null
description: 'ClickStack による JVM の監視'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/jvm/jvm-metrics-import.png';
import example_dashboard from '@site/static/images/clickstack/jvm/jvm-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack を使用した JVM メトリクスの監視 {#jvm-clickstack}

:::note[要約]
このガイドでは、OpenTelemetry Java エージェントを使用してメトリクスを収集し、ClickStack で JVM アプリケーションを監視する方法を説明します。次の内容を学びます:

- OpenTelemetry Java エージェントを JVM アプリケーションにアタッチする
- エージェントを設定し、OTLP 経由で ClickStack にメトリクスを送信する
- あらかじめ用意されたダッシュボードを使用して、ヒープメモリ、ガーベジコレクション、スレッド、CPU を可視化する

本番アプリケーションにインストルメンテーションを行う前に統合をテストしたい場合は、サンプルメトリクスを含むデモデータセットを利用できます。

所要時間: 5〜10 分
:::

## 既存の JVM アプリケーションとの統合 {#existing-jvm}

このセクションでは、既存の JVM アプリケーションを設定し、OpenTelemetry Java エージェントを使用して ClickStack にメトリクスを送信する方法について説明します。

本番環境を設定する前に統合をテストしたい場合は、[「デモデータセット」セクション](#demo-dataset)で提供しているデモデータセットを使用してテストできます。

##### 前提条件 {#prerequisites}

- 稼働中の ClickStack インスタンス
- 既存の Java アプリケーション（Java 8 以上）
- JVM 起動引数を変更するためのアクセス権

<VerticalStepper headerLevel="h4">

#### ClickStack API key を取得する {#get-api-key}

OpenTelemetry Java agent は ClickStack の OTLP エンドポイントにデータを送信します。このエンドポイントには認証が必要です。

1. ClickStack の URL（例: http://localhost:8080）で HyperDX を開きます
2. 必要に応じてアカウントを作成するかログインします
3. **Team Settings → API Keys** に移動します
4. **Ingestion API Key** をコピーします

<Image img={api_key} alt="ClickStack API Key"/>

#### OpenTelemetry Java agent をダウンロードする {#download-agent}

OpenTelemetry Java agent の JAR ファイルをダウンロードします:

```bash
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.22.0/opentelemetry-javaagent.jar
```

これにより、エージェントが現在のディレクトリにダウンロードされます。デプロイ環境に応じて、任意の場所（例: `/opt/opentelemetry/` やアプリケーション JAR と同じ場所）に配置できます。

#### JVM 起動引数を設定する {#configure-jvm}

JVM の起動コマンドに Java agent を追加します。エージェントは JVM メトリクスを自動的に収集し、ClickStack に送信します。

##### オプション 1: コマンドラインフラグ {#command-line-flags}

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
- `opentelemetry-javaagent.jar` → エージェント JAR へのフルパス（例: `/opt/opentelemetry/opentelemetry-javaagent.jar`）
- `my-java-app` → サービスを識別しやすい名前（例: `payment-service`, `user-api`）
- `YOUR_API_KEY` → 上記の手順で取得した ClickStack の API key
- `my-application.jar` → アプリケーションの JAR ファイル名
- `http://localhost:4318` → ClickStack のエンドポイント（ClickStack が同一マシン上で動作している場合は `localhost:4318` を使用し、それ以外の場合は `http://your-clickstack-host:4318` を使用）

##### オプション 2: 環境変数 {#env-vars}

別の方法としては、環境変数を使用します:

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
- `opentelemetry-javaagent.jar` → エージェント JAR へのフルパス
- `my-java-app` → サービス名
- `YOUR_API_KEY` → ClickStack の API key
- `http://localhost:4318` → ClickStack のエンドポイント
- `my-application.jar` → アプリケーションの JAR ファイル名

:::tip
OpenTelemetry Java agent は次の JVM メトリクスを自動的に収集します:
- **メモリ**: `jvm.memory.used`, `jvm.memory.limit`, `jvm.memory.committed`, `jvm.memory.used_after_last_gc`
- **ガーベジコレクション**: `jvm.gc.duration`
- **スレッド**: `jvm.thread.count`
- **クラス**: `jvm.class.count`, `jvm.class.loaded`, `jvm.class.unloaded`
- **CPU**: `jvm.cpu.time`, `jvm.cpu.count`
:::

#### HyperDX でメトリクスを確認する {#verifying-metrics}

アプリケーションをエージェント付きで起動したら、メトリクスが ClickStack に送信されていることを確認します。

1. http://localhost:8080（または ClickStack の URL）で HyperDX を開きます
2. **Chart Explorer** に移動します
3. `jvm.` で始まるメトリクスを検索します（例: `jvm.memory.used`, `jvm.gc.duration`, `jvm.thread.count`）

</VerticalStepper>

## デモ用データセット {#demo-dataset}

アプリケーションを計測する前に JVM メトリクス統合を試したいユーザー向けに、現実的な JVM の挙動を示す、あらかじめ生成したメトリクスを含むサンプルデータセットを提供します。このデータセットは、適度な一定トラフィックを持つ中規模マイクロサービスを想定しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする {#download-sample}

```bash
# ゲージ系メトリクスをダウンロード（メモリ、スレッド、CPU、クラス）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-gauge.jsonl

# 合計値メトリクスをダウンロード（GC イベント）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-sum.jsonl
```

このデータセットには、以下を示す 24 時間分の JVM メトリクスが含まれます:
- 定期的なガーベジコレクションイベントを伴うヒープメモリの増加
- スレッド数の変動
- 現実的な GC ポーズ時間
- クラスロードのアクティビティ
- CPU 使用率パターン

#### ClickStack を起動する {#start-clickstack}

まだ ClickStack を起動していない場合:

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack が完全に起動するまで、しばらく待機します。

#### デモ用データセットをインポートする {#import-demo-data}

```bash
# ゲージ系メトリクスをインポート（メモリ、スレッド、CPU、クラス）
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_gauge FORMAT JSONEachRow
" < jvm-metrics-gauge.jsonl

# 合計値メトリクスをインポート（GC イベント）
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_sum FORMAT JSONEachRow
" < jvm-metrics-sum.jsonl
```

これにより、メトリクスが ClickStack のメトリクステーブルに直接インポートされます。

#### デモデータを検証する {#verify-demo-metrics}

インポートが完了したら:

1. http://localhost:8080 で HyperDX を開き、ログインします（必要に応じてアカウントを作成）
2. Search ビューに移動し、source を **Metrics** に設定します
3. タイムレンジを **2025-12-06 14:00:00 - 2025-12-09 14:00:00** に設定します
4. `jvm.memory.used` または `jvm.gc.duration` を検索します

デモサービスのメトリクスが表示されるはずです。

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)** の期間をカバーしています。場所に関係なくデモメトリクスを確認できるよう、タイムレンジを **2025-12-06 14:00:00 - 2025-12-09 14:00:00** に設定してください。メトリクスが表示されることを確認したら、可視化を見やすくするためにタイムレンジを 24 時間に絞り込むことができます。
:::

</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack で JVM アプリケーションを監視しやすくするために、JVM メトリクス向けの主要な可視化を備えたあらかじめ用意されたダッシュボードを提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード構成を <TrackedLink href={useBaseUrl('/examples/jvm-metrics-dashboard.json')} download="jvm-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">ダウンロード</TrackedLink> する {#download}

#### あらかじめ用意されたダッシュボードをインポートする {#import-dashboard}

1. HyperDX を開き、［Dashboards］セクションに移動します
2. 右上の省略記号アイコン（⋯）の下にある **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードをインポートするボタン"/>

3. `jvm-metrics-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポート完了画面"/>

#### ダッシュボードを表示する {#created-dashboard}

ダッシュボードは、すべての可視化があらかじめ構成された状態で作成されます。

<Image img={example_dashboard} alt="Kafka Metrics ダッシュボード"/>

:::note
デモデータセットを使用する場合、時間範囲を **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)** に設定してください。ローカルタイムゾーンに応じて調整してください。
:::

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### エージェントが起動しない {#troubleshooting-not-loading}

**エージェントの JAR ファイルが存在することを確認する:**

```bash
ls -lh /path/to/opentelemetry-javaagent.jar
```

**Java バージョンの互換性を確認（Java 8 以上が必要です）：**

```bash
java -version
```

**エージェント起動ログメッセージを確認する：**
アプリケーションの起動時に、次のようなメッセージが出力されていることを確認してください。

```text
[otel.javaagent] OpenTelemetry Javaagent v2.22.0 started
```


### HyperDX にメトリクスが表示されない {#no-metrics}

**ClickStack が稼働しており、アクセス可能であることを確認してください:**

```bash
docker ps | grep clickstack
curl -v http://localhost:4318/v1/metrics
```

**メトリクスエクスポーターの設定を確認する:**

```bash
# If using environment variables, verify:
echo $OTEL_METRICS_EXPORTER
# Should output: otlp
```

**OpenTelemetry に関するエラーについてアプリケーションログを確認する:**
アプリケーションログ内で、OpenTelemetry や OTLP エクスポートの失敗に関連するエラーメッセージが出力されていないか確認します。

**ネットワーク接続を確認する:**
ClickStack がリモートホスト上にある場合、ポート 4318 にアプリケーションサーバーからアクセスできることを確認します。

**エージェントのバージョンを確認する:**
最新の安定版エージェントバージョン（現在は 2.22.0）を使用していることを確認します。新しいバージョンにはパフォーマンス改善が含まれていることが多いためです。


## 次のステップ {#next-steps}

JVM メトリクスが ClickStack に取り込まれるようになったので、次のことを検討してください：

- ヒープ使用率の増加、GC 一時停止の頻発、スレッド枯渇などの重要なメトリクスに対して [アラート](/use-cases/observability/clickstack/alerts) を設定する
- オブザーバビリティデータを統合するために、[他の ClickStack 連携機能](/use-cases/observability/clickstack/integration-guides) を活用する

## 本番環境への移行 {#going-to-production}

このガイドでは、ローカルテスト向けの OpenTelemetry Java エージェントの設定方法を説明しました。本番デプロイメントでは、エージェント JAR をコンテナイメージに含め、環境変数で設定することで管理を容易にしてください。多数の JVM インスタンスが存在する大規模な環境では、各アプリケーションから ClickStack に直接送信するのではなく、集中型の OpenTelemetry Collector をデプロイし、複数アプリケーションからのメトリクスをバッチ処理して転送するようにします。

本番デプロイメントパターンや Collector の設定例については、[OpenTelemetry を使用した取り込み](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。