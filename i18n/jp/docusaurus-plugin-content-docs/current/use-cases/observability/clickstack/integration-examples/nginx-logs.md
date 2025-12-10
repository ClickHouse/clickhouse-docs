---
slug: /use-cases/observability/clickstack/integrations/nginx
title: 'ClickStack による Nginx ログ監視'
sidebar_label: 'Nginx ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack による Nginx の監視'
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


# ClickStack による Nginx ログのモニタリング {#nginx-clickstack}

:::note[要約]
このガイドでは、OpenTelemetry collector を構成して Nginx のアクセスログをインジェストし、ClickStack で Nginx をモニタリングする方法を説明します。以下のことを行います:

- Nginx を JSON 形式のログを出力するように設定する
- ログのインジェスト用にカスタム OTel collector 設定を作成する
- カスタム設定を使用して ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使って Nginx のメトリクスを可視化する

本番環境の Nginx を設定する前に連携をテストしたい場合は、サンプルログを含むデモ データセットを利用できます。

所要時間: 5〜10 分
:::

## 既存の Nginx との統合 {#existing-nginx}

このセクションでは、ClickStack の OTel collector の設定を変更し、既存の Nginx 環境から ClickStack にログを送信するように構成する方法について説明します。
既存環境を設定する前に統合の動作を試してみたい場合は、[次のセクション](/use-cases/observability/clickstack/integrations/nginx#demo-dataset)にある事前構成済みの環境とサンプルデータを使用してテストできます。

##### 前提条件 {#prerequisites}

- 稼働中の ClickStack インスタンス
- 既存の Nginx 環境
- Nginx 設定ファイルを編集可能な権限

<VerticalStepper headerLevel="h4">
  #### Nginxログフォーマットの設定

  まず、解析を容易にするために、NginxがJSON形式でログを出力するよう設定します。nginx.confに次のログフォーマット定義を追加してください:

  `nginx.conf` ファイルは通常、以下の場所に配置されています:

  * **Linux (apt/yum)**: `/etc/nginx/nginx.conf`
  * **macOS（Homebrew）**: `/usr/local/etc/nginx/nginx.conf` または `/opt/homebrew/etc/nginx/nginx.conf`
  * **Docker**: 構成は通常ボリュームとしてマウントされます

  このログフォーマット定義を `http` ブロックに追加します：

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

  この変更を行った後、Nginxをリロードしてください。

  #### カスタムOTel collector設定を作成する

  ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースのOpenTelemetry Collector設定を拡張できます。カスタム設定は、HyperDXがOpAMP経由で管理するベース設定にマージされます。

  以下の設定で nginx-monitoring.yaml という名前のファイルを作成します：

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
          layout: '%d/%b/%Y:%H:%M:%S %z'
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

  この設定では:

  * Nginx ログを標準の保存場所から読み取ります
  * JSON ログエントリを解析します
  * 元のログのタイムスタンプを抽出して保持します
  * HyperDX でのフィルタリングに使用する source: Nginx 属性を追加します
  * 専用パイプラインを通じてログを ClickHouse エクスポーターに転送する

  :::note

  * カスタム構成では、新しい receiver と pipeline だけを定義します
  * `memory_limiter`、`transform`、`batch` の各 processor と `clickhouse` exporter は、ベースとなる ClickStack の設定ですでに定義されているため、名前を指定するだけで参照できます
  * time&#95;parser オペレーターは、元のログの時刻情報を保持するために、Nginx の time&#95;local フィールドからタイムスタンプを抽出します
  * パイプラインは、既存のprocessorを経由して、receiverからのデータをClickHouse exporterにルーティングします

  #### ClickStackにカスタム設定を読み込むよう構成する

  既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、次の手順を実行してください:

  1. カスタム設定ファイルを /etc/otelcol-contrib/custom.config.yaml にマウントします
  2. 環境変数 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE に /etc/otelcol-contrib/custom.config.yaml を設定します
  3. コレクターがログを読み取れるように、Nginx のログディレクトリをマウントする

  ##### オプション1: Docker Compose

  ClickStackのデプロイメント設定を更新します：

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... other environment variables ...
      volumes:
        - ./nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log/nginx:/var/log/nginx:ro
        # ... other volumes ...
  ```

  ##### オプション2：Docker Run（オールインワンイメージ）

  docker runでオールインワンイメージを使用する場合：

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log/nginx:/var/log/nginx:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  ClickStackコレクターがnginxログファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では、読み取り専用マウント（:ro）を使用し、最小権限の原則に従ってください。
  :::

  #### HyperDXでのログの確認

  設定完了後、HyperDXにログインし、ログが正常に送信されていることを確認してください：

  1. 検索ビューに移動します
  2. ソースを Logs に設定し、request、request&#95;time、upstream&#95;response&#95;time などのフィールドを含むログエントリが表示されていることを確認します。

  以下のような表示が確認できます：

  <Image img={search_view} alt="ログビュー" />

  <Image img={log_view} alt="ログビュー" />
</VerticalStepper>

## デモ用データセット {#demo-dataset}

本番環境を構成する前に nginx 連携をテストしたいユーザー向けに、現実的なトラフィックパターンを持つ、あらかじめ生成された nginx アクセスログのサンプルデータセットを提供します。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットのダウンロード {#download-sample}

```bash
# ログをダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

このデータセットには次の内容が含まれます：
- 現実的なトラフィックパターンを持つログエントリ
- さまざまなエンドポイントと HTTP メソッド
- 成功したリクエストとエラーの混在
- 現実的なレスポンスタイムとバイト数

#### テスト用 Collector 設定の作成 {#test-config}

次の設定を含む `nginx-demo.yaml` という名前のファイルを作成します：

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # デモデータでは先頭から読み取る
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

#### デモ設定で ClickStack を実行する {#run-demo}

デモ用ログと設定で ClickStack を実行します：

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/access.log:/tmp/nginx-demo/access.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

#### HyperDX でログを確認する {#verify-demo-logs}

ClickStack が起動したら、次を実行します：

1. [HyperDX](http://localhost:8080/) を開き、自分のアカウントでログインします（まだアカウントがない場合は、まずアカウントを作成してください）
2. Search ビューに移動し、`source` を `Logs` に設定します
3. タイムレンジを **2025-10-19 11:00:00 - 2025-10-22 11:00:00** に設定します

Search ビューでは次のような表示になるはずです：

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは 2025-10-20 11:00:00 - 2025-10-21 11:00:00 UTC の期間をカバーしています。広めのタイムレンジを指定することで、どの地域からでもデモ用ログが表示されるようにしています。ログが表示されたら、可視化を分かりやすくするために、タイムレンジを 24 時間に絞り込むことができます。
:::

<Image img={search_view} alt="ログビュー"/>

<Image img={log_view} alt="ログビュー"/>

</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack で nginx の監視を始めやすくするために、Nginx Logs 用の基本的な可視化ダッシュボードを用意しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード構成を<TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">ダウンロード</TrackedLink>する {#download}

#### あらかじめ用意されたダッシュボードをインポートする {#import-dashboard}
1. HyperDX を開き、「Dashboards」セクションに移動します。
2. 右上の三点リーダー（…）アイコンから「Import Dashboard」をクリックします。

<Image img={import_dashboard} alt="ダッシュボードのインポート"/>

3. `nginx-logs-dashboard.json` ファイルをアップロードし、「Finish Import」をクリックします。

<Image img={finish_import} alt="インポートの完了"/>

#### すべての可視化が事前設定された状態でダッシュボードが作成されます {#created-dashboard}

:::note
デモデータセットの場合、時間範囲を **2025-10-20 11:00:00 - 2025-10-21 11:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

<Image img={example_dashboard} alt="ダッシュボード例"/>

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### カスタム構成が読み込まれない

* 環境変数 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE が正しく設定されているか確認する

```bash
docker exec <コンテナ名> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

* カスタム設定ファイルが /etc/otelcol-contrib/custom.config.yaml にマウントされていることを確認する

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

* カスタム設定の内容を表示して、正しく読み取れることを確認する

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### HyperDX にログが表示されない

* nginx が JSON ログを書き出していることを確認する

```bash
tail -f /var/log/nginx/access.log
```

* コレクターがログを読み取れていることを確認する

```bash
docker exec `<container>` cat /var/log/nginx/access.log
```

* 実際の有効な構成に `filelog` レシーバーが含まれていることを確認する

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

* コレクターのログにエラーがないか確認する

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```


## 次のステップ {#next-steps}

さらに分析を進めたい場合は、ダッシュボードを使って次のようなことを試してみてください。

- 重要なメトリクス（エラーレート、レイテンシのしきい値）に対するアラートを設定する
- 特定のユースケース向け（API モニタリング、セキュリティイベントなど）に追加のダッシュボードを作成する