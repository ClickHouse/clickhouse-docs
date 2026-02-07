---
slug: /use-cases/observability/clickstack/integrations/nginx
title: 'ClickStack による Nginx ログの監視'
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


# ClickStack を使用した Nginx ログの監視 \{#nginx-clickstack\}

:::note[要約]
このガイドでは、OpenTelemetry collector を構成して Nginx のアクセスログを取り込むことで、ClickStack を使って Nginx を監視する方法を説明します。次のことを学びます。

- Nginx を構成して JSON 形式のログを出力する
- ログのインジェスト用にカスタムの OTel collector 設定を作成する
- カスタム設定を使って ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使用して Nginx メトリクスを可視化する

本番環境の Nginx を設定する前にこの連携をテストしたい場合に使用できる、サンプルログ付きのデモデータセットも用意されています。

所要時間: 5〜10 分
:::

## 既存の Nginx との統合 \{#existing-nginx\}

このセクションでは、ClickStack の OTel collector 設定を変更して、既存の Nginx インストールから ClickStack へログを送信する方法を説明します。
ご自身の既存環境を設定する前に統合を試してみたい場合は、[次のセクション](/use-cases/observability/clickstack/integrations/nginx#demo-dataset)で、あらかじめ構成済みの環境とサンプルデータを使用してテストできます。

##### 前提条件 \{#prerequisites\}

- 稼働中の ClickStack インスタンス
- 既存の Nginx インストール
- Nginx 設定ファイルを編集できる権限

<VerticalStepper headerLevel="h4">
  #### Nginx ログ形式の設定

  まず、解析を容易にするため、NginxがJSON形式でログを出力するように設定します。nginx.confに次のログフォーマット定義を追加してください:

  `nginx.conf` ファイルは通常、以下の場所に配置されています:

  * **Linux（apt/yum）**: `/etc/nginx/nginx.conf`
  * **macOS（Homebrew）**: `/usr/local/etc/nginx/nginx.conf` または `/opt/homebrew/etc/nginx/nginx.conf`
  * **Docker**：通常、設定ファイルをボリュームとしてマウントします

  このログフォーマット定義を `http` ブロックに追加します:

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

  この変更を行った後、Nginxを再起動してください。

  #### カスタムOTel collector設定を作成する

  ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースのOpenTelemetry Collector設定を拡張できます。カスタム設定は、HyperDXがOpAMP経由で管理するベース設定とマージされます。

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

  この設定は以下を行います:

  * 既定の場所にある Nginx ログを読み込みます
  * JSON 形式のログエントリを解析します
  * 元のログのタイムスタンプを抽出し、そのまま保持します
  * HyperDX でのフィルタリング用に source: Nginx 属性を追加する
  * 専用のパイプラインを介してログを ClickHouse エクスポーターに送信します

  :::note

  * カスタム構成では、新しい receiver と pipeline のみを定義します
  * processor（memory&#95;limiter、transform、batch）および exporter（clickhouse）は、ベースとなる ClickStack の構成内ですでに定義されているため、名前を指定するだけで参照できます。
  * time&#95;parser オペレーターは、元のログのタイミングを保持するために、Nginx の time&#95;local フィールドからタイムスタンプを抽出します
  * パイプラインは、既存の processors を介して、receivers から ClickHouse exporter へデータを転送します
    :::

  #### ClickStackにカスタム設定を読み込ませる構成

  既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、次の手順を実行してください:

  1. カスタム設定ファイルを /etc/otelcol-contrib/custom.config.yaml にマウントします
  2. 環境変数 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE に /etc/otelcol-contrib/custom.config.yaml を設定します
  3. Nginx のログディレクトリをマウントし、コレクターが読み取れるようにします

  ##### オプション1：Docker Compose

  ClickStack のデプロイメント設定を更新してください：

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

  ##### オプション2: Docker Run（オールインワンイメージ）

  `docker run`でオールインワンイメージを使用する場合:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log/nginx:/var/log/nginx:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  ClickStackコレクターがnginxログファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では、読み取り専用マウント(:ro)を使用し、最小権限の原則に従ってください。
  :::

  #### HyperDXでのログの確認

  設定後、HyperDXにログインし、ログが正常に送信されていることを確認します:

  1. 検索ビューに移動します
  2. ソースを Logs に設定して、`request`、`request_time`、`upstream_response_time` などのフィールドを含むログエントリが表示されることを確認します。

  以下のような表示が確認できます:

  <Image img={search_view} alt="ログビュー" />

  <Image img={log_view} alt="ログビュー" />
</VerticalStepper>

## デモデータセット {#demo-dataset}

本番システムを設定する前に nginx インテグレーションをテストしたいユーザー向けに、現実的なトラフィックパターンを持つ、あらかじめ生成済みの nginx アクセスログからなるサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする \{#download-sample\}

```bash
# ログをダウンロード
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

このデータセットには次が含まれます:
- 現実的なトラフィックパターンを持つログエントリ
- さまざまなエンドポイントと HTTP メソッド
- 成功したリクエストとエラーの混在
- 現実的なレスポンスタイムとバイト数

#### テスト用 collector 設定の作成 \{#test-config\}

次の設定で `nginx-demo.yaml` という名前のファイルを作成します:

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # デモデータ用に先頭から読み込む
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

デモログと設定を使って ClickStack を実行します:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/access.log:/tmp/nginx-demo/access.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

#### HyperDX でログを確認する {#verify-demo-logs}

ClickStack が起動したら、次を実行します:

1. [HyperDX](http://localhost:8080/) を開き、アカウントにログインします（まずアカウントを作成する必要がある場合があります）
2. Search ビューに移動し、source を `Logs` に設定します
3. タイムレンジを **2025-10-19 11:00:00 - 2025-10-22 11:00:00** に設定します

Search ビューでは次のように表示されるはずです:

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは 2025-10-20 11:00:00 から 2025-10-21 11:00:00 までの UTC の期間をカバーしています。広いタイムレンジを指定することで、どのロケーションからアクセスしてもデモログが表示されるようにしています。ログが表示されたら、可視化をより明瞭にするためにレンジを 24 時間に絞り込むことができます。
:::

<Image img={search_view} alt="ログビュー"/>

<Image img={log_view} alt="ログビュー"/>

</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack を使って nginx の監視をすぐに始められるように、Nginx Logs 向けの基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">ダッシュボード設定をダウンロード</TrackedLink> {#download}

#### あらかじめ用意されたダッシュボードをインポートする \{#import-dashboard\}
1. HyperDX を開き、Dashboards セクションに移動します。
2. 右上の三点リーダーアイコンから「Import Dashboard」をクリックします。

<Image img={import_dashboard} alt="ダッシュボードのインポート"/>

3. nginx-logs-dashboard.json ファイルをアップロードし、「Finish import」をクリックします。

<Image img={finish_import} alt="インポートの完了"/>

#### すべての可視化があらかじめ設定された状態でダッシュボードが作成されます \{#created-dashboard\}

:::note
デモ用データセットでは、時間範囲を **2025-10-20 11:00:00 - 2025-10-21 11:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

<Image img={example_dashboard} alt="ダッシュボードの例"/>

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない

* 環境変数 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE が正しく設定されていることを確認してください

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

* カスタム設定ファイルが /etc/otelcol-contrib/custom.config.yaml にマウントされていることを確認してください

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

* カスタム設定の内容を表示し、人間が読める形式であることを確認する

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### HyperDX にログが表示されない

* nginx が JSON 形式でログを書き出していることを確認する

```bash
tail -f /var/log/nginx/access.log
```

* コレクターがログを読み取れていることを確認する

```bash
docker exec `<container>` cat /var/log/nginx/access.log
```

* 実際に適用されている設定に `filelog` レシーバーが含まれていることを確認する

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

* コレクターログにエラーがないか確認する

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```


## 次のステップ {#next-steps}

さらに活用したい場合は、ダッシュボードで次のようなことを試してみてください。

- 重要なメトリクス（エラー率、レイテンシのしきい値）に対するアラートを設定する
- 特定のユースケース（API モニタリング、セキュリティイベント）向けに追加のダッシュボードを作成する