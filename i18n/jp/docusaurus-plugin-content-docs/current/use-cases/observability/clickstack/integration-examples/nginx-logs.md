---
slug: /use-cases/observability/clickstack/integrations/nginx
title: 'ClickStack を使用した Nginx ログの監視'
sidebar_label: 'Nginx ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した Nginx の監視'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-logs-import.png';
import example_dashboard from '@site/static/images/clickstack/nginx-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/log-view.png';
import search_view from '@site/static/images/clickstack/nginx-logs-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack による Nginx ログの監視 {#nginx-clickstack}

:::note[TL;DR]
このガイドでは、OpenTelemetry collector を設定して Nginx のアクセスログを取り込むことで、ClickStack を使って Nginx を監視する方法を解説します。ここでは次の内容を学びます。

- Nginx を設定して JSON 形式のログを出力する
- ログのインジェスト用にカスタム OTel collector 構成を作成する
- カスタム構成を使って ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使って Nginx のメトリクスを可視化する

本番環境の Nginx を設定する前に連携をテストしたい場合のために、サンプルログを含むデモデータセットを利用できます。

所要時間: 5～10 分
:::



## 既存のNginxとの統合 {#existing-nginx}

このセクションでは、ClickStack OTel collectorの設定を変更して、既存のNginxインストールからClickStackにログを送信する方法について説明します。
独自の既存セットアップを設定する前に統合をテストしたい場合は、[次のセクション](/use-cases/observability/clickstack/integrations/nginx#demo-dataset)で事前設定されたセットアップとサンプルデータを使用してテストできます。

##### 前提条件 {#prerequisites}

- ClickStackインスタンスが稼働していること
- 既存のNginxがインストールされていること
- Nginx設定ファイルを変更するアクセス権があること

<VerticalStepper headerLevel="h4">

#### Nginxログフォーマットの設定 {#configure-nginx}

まず、解析を容易にするために、NginxがJSON形式でログを出力するように設定します。nginx.confに次のログフォーマット定義を追加します：

`nginx.conf`ファイルは通常、以下の場所にあります：

- **Linux (apt/yum)**: `/etc/nginx/nginx.conf`
- **macOS (Homebrew)**: `/usr/local/etc/nginx/nginx.conf` または `/opt/homebrew/etc/nginx/nginx.conf`
- **Docker**: 設定は通常ボリュームとしてマウントされます

`http`ブロックに次のログフォーマット定義を追加します：

```nginx
http {
    log_format json_combined escape=json
    '{'
      '"time_local":"$time_local",'
      '"remote_addr":"$remote_addr",'
      '"request_method":"$request_method",'
      '"request_uri":"$request_uri",'
      '"status":$status,'
      '"body_bytes_sent":$body_bytes_sent,'
      '"request_time":$request_time,'
      '"upstream_response_time":"$upstream_response_time",'
      '"http_referer":"$http_referer",'
      '"http_user_agent":"$http_user_agent"'
    '}';

    access_log /var/log/nginx/access.log json_combined;
    error_log /var/log/nginx/error.log warn;
}
```

この変更を行った後、Nginxをリロードします。

#### カスタムOTel collector設定の作成 {#custom-otel}

ClickStackでは、カスタム設定ファイルをマウントし、環境変数を設定することで、基本のOpenTelemetry Collector設定を拡張できます。カスタム設定は、OpAMP経由でHyperDXが管理する基本設定とマージされます。

次の設定でnginx-monitoring.yamlという名前のファイルを作成します：

```yaml
receivers:
  filelog:
    include:
      - /var/log/nginx/access.log
      - /var/log/nginx/error.log
    start_at: end
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
      - type: time_parser
        parse_from: attributes.time_local
        layout: "%d/%b/%Y:%H:%M:%S %z"
      - type: add
        field: attributes.source
        value: "nginx"

service:
  pipelines:
    logs/nginx:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

この設定は以下を行います：

- 標準的な場所からNginxログを読み取ります
- JSONログエントリを解析します
- 元のログタイムスタンプを抽出して保持します
- HyperDXでのフィルタリング用にsource: Nginx属性を追加します
- 専用パイプラインを介してClickHouseエクスポーターにログをルーティングします

:::note

- カスタム設定では新しいレシーバーとパイプラインのみを定義します
- プロセッサー（memory_limiter、transform、batch）とエクスポーター（clickhouse）は、基本のClickStack設定ですでに定義されているため、名前で参照するだけです
- time_parserオペレーターは、元のログタイミングを保持するためにNginxのtime_localフィールドからタイムスタンプを抽出します
- パイプラインは、既存のプロセッサーを介してレシーバーからClickHouseエクスポーターにデータをルーティングします
  :::

#### カスタム設定を読み込むようにClickStackを設定 {#load-custom}

既存のClickStackデプロイメントでカスタムcollector設定を有効にするには、以下を行う必要があります：

1. カスタム設定ファイルを/etc/otelcol-contrib/custom.config.yamlにマウントします
2. 環境変数CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yamlを設定します
3. collectorがログを読み取れるようにNginxログディレクトリをマウントします

##### オプション1: Docker Compose {#docker-compose}

ClickStackデプロイメント設定を更新します：

```yaml
services:
  clickstack:
    # ... 既存の設定 ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... その他の環境変数 ...
    volumes:
      - ./nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/nginx:/var/log/nginx:ro
      # ... その他のボリューム ...
```


##### オプション2: Docker Run（オールインワンイメージ） {#all-in-one}

docker runでオールインワンイメージを使用する場合：

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/nginx:/var/log/nginx:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
ClickStackコレクターがnginxログファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では、読み取り専用マウント（:ro）を使用し、最小権限の原則に従ってください。
:::

#### HyperDXでのログの検証 {#verifying-logs}

設定が完了したら、HyperDXにログインしてログが流れていることを確認します：

1. 検索ビューに移動します
2. ソースをLogsに設定し、request、request_time、upstream_response_timeなどのフィールドを持つログエントリが表示されることを確認します

以下は表示される内容の例です：

<Image img={search_view} alt='ログビュー' />

<Image img={log_view} alt='ログビュー' />

</VerticalStepper>


## デモデータセット {#demo-dataset}

本番環境を構成する前にnginx統合をテストしたいユーザー向けに、現実的なトラフィックパターンを含む事前生成済みのnginxアクセスログのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする {#download-sample}


```bash
# ログをダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

データセットには以下が含まれます：

- 実際のトラフィックパターンを持つログエントリ
- 各種エンドポイントとHTTPメソッド
- 成功したリクエストとエラーの混在
- 実際のレスポンス時間とバイト数

#### テストコレクター設定を作成 {#test-config}

以下の設定で`nginx-demo.yaml`という名前のファイルを作成します：

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # デモデータのため先頭から読み込み
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
      - type: time_parser
        parse_from: attributes.time_local
        layout: '%d/%b/%Y:%H:%M:%S %z'
      - type: add
        field: attributes.source
        value: "nginx-demo"

service:
  pipelines:
    logs/nginx-demo:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### デモ設定でClickStackを実行 {#run-demo}

デモログと設定でClickStackを実行します：

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/access.log:/tmp/nginx-demo/access.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### HyperDXでログを確認 {#verify-demo-logs}

ClickStackが実行されたら：

1. [HyperDX](http://localhost:8080/)を開き、アカウントにログインします（最初にアカウントを作成する必要がある場合があります）
2. 検索ビューに移動し、ソースを`Logs`に設定します
3. 時間範囲を**2025-10-19 11:00:00 - 2025-10-22 11:00:00**に設定します

検索ビューには以下のように表示されます：

:::note[タイムゾーン表示]
HyperDXはブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータは2025-10-20 11:00:00 - 2025-10-21 11:00:00 UTCの範囲です。広い時間範囲により、場所に関係なくデモログが表示されます。ログが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
:::

<Image img={search_view} alt='ログビュー' />

<Image img={log_view} alt='ログビュー' />

</VerticalStepper>


## ダッシュボードと可視化 {#dashboards}

ClickStack で nginx の監視を開始するにあたり、Nginx Logs 向けの基本的な可視化を提供します。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">ダッシュボード設定をダウンロード</TrackedLink> {#download}

#### あらかじめ用意されたダッシュボードをインポートする {#import-dashboard}
1. HyperDX を開き、Dashboards セクションに移動します。
2. 右上の省略記号（…）メニュー内の "Import Dashboard" をクリックします。

<Image img={import_dashboard} alt="ダッシュボードのインポート"/>

3. nginx-logs-dashboard.json ファイルをアップロードし、"Finish import" をクリックします。

<Image img={finish_import} alt="インポートの完了"/>

#### すべての可視化が事前設定された状態でダッシュボードが作成されます {#created-dashboard}

:::note
デモ用データセットでは、時間範囲を **2025-10-20 11:00:00 - 2025-10-21 11:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

<Image img={example_dashboard} alt="サンプルダッシュボード"/>

</VerticalStepper>



## トラブルシューティング

### カスタム構成が読み込まれない

* 環境変数 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE が正しく設定されていることを確認してください

```bash
docker exec <コンテナ名> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

* カスタム設定ファイルが /etc/otelcol-contrib/custom.config.yaml にマウントされていることを確認します

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

* カスタム設定の内容を表示し、正しく読み取れることを確認する

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDX にログが表示されない

* nginx が JSON 形式でログを出力していることを確認する

```bash
tail -f /var/log/nginx/access.log
```

* コレクターがログを読み取れることを確認します

```bash
docker exec `<container>` cat /var/log/nginx/access.log
```

* 有効な構成に `filelog` レシーバーが含まれていることを確認する

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

* コレクターのログにエラーがないか確認する

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```


## 次のステップ {#next-steps}
さらに活用したい場合は、ダッシュボードで次のようなことを試してみてください。

- 重要なメトリクス（エラー率、レイテンシーのしきい値）に対してアラートを設定する
- 特定のユースケース（API モニタリング、セキュリティイベント）向けの追加ダッシュボードを作成する
