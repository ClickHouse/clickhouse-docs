---
slug: /use-cases/observability/clickstack/integrations/host-logs
title: 'ClickStack によるホストログ監視'
sidebar_label: '汎用ホストログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack による汎用ホストログ監視'
doc_type: 'guide'
keywords: ['ホストログ', 'systemd', 'syslog', 'OTel', 'ClickStack', 'システム監視', 'サーバーログ']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import log_view from '@site/static/images/clickstack/host-logs/log-view.png';
import search_view from '@site/static/images/clickstack/host-logs/search-view.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_dashboard from '@site/static/images/clickstack/host-logs/host-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/host-logs/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickStack によるホストログの監視 \{#host-logs-clickstack\}

:::note[要約]
このガイドでは、OpenTelemetry collector を設定して systemd、カーネル、SSH、cron などのシステムサービスからログを収集し、ClickStack を使ってホストシステムログを監視する方法を説明します。次の内容を学びます:

- システムログファイルを読み取るように OTel collector を設定する
- カスタム設定を使用して ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使用して、ホストログのインサイト（エラー、警告、サービスのアクティビティ）を可視化する

本番ホストを設定する前に統合をテストしたい場合のために、サンプルログを含むデモデータセットも利用できます。

所要時間: 5〜10 分
:::

## 既存ホストとの連携 \{#existing-hosts\}

このセクションでは、ClickStack の OTel collector の設定を変更して、すべてのシステムログファイル（syslog、auth、kernel、daemon、アプリケーションログ）を読み取れるようにし、既存ホストから ClickStack へシステムログを送信する方法を説明します。

自身の既存環境を設定する前にホストログ連携を試してみたい場合は、「[Demo dataset](/use-cases/observability/clickstack/integrations/host-logs#demo-dataset)」セクションにある事前設定済み環境とサンプルデータを使ってテストできます。

##### 前提条件 \{#prerequisites\}

- 稼働中の ClickStack インスタンス
- syslog ファイルを有するシステム
- ClickStack の設定ファイルを変更できる権限

<VerticalStepper headerLevel="h4">
  #### syslogファイルが存在することを確認

  まず、システムがsyslogファイルを書き込んでいることを確認します：

  ```bash
  # Check if syslog files exist (Linux)
  ls -la /var/log/syslog /var/log/messages

  # Or on macOS
  ls -la /var/log/system.log

  # View recent entries
  tail -20 /var/log/syslog
  ```

  一般的なsyslogの配置場所：

  * **Ubuntu/Debian**: `/var/log/syslog`
  * **RHEL/CentOS/Fedora**: `/var/log/messages`
  * **macOS**: `/var/log/system.log`

  #### カスタムOTel collector設定の作成

  ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースのOpenTelemetry Collector設定を拡張することができます。

  `host-logs-monitoring.yaml` という名前のファイルを作成し、システムの設定を記述します：

  <Tabs groupId="os-type">
    <TabItem value="modern-linux" label="最新の Linux (Ubuntu 24.04+)" default>
      ```yaml
      receivers:
        filelog/syslog:
          include:
            - /var/log/syslog
            - /var/log/**/*.log
          start_at: end
          operators:
            - type: regex_parser
              regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
              parse_from: body
              parse_to: attributes
            
            - type: time_parser
              parse_from: attributes.timestamp
              layout_type: gotime
              layout: '2006-01-02T15:04:05.999999-07:00'
            
            - type: add
              field: attributes.source
              value: "host-logs"
            
            - type: add
              field: resource["service.name"]
              value: "host-production"

      service:
        pipelines:
          logs/host:
            receivers: [filelog/syslog]
            processors:
              - memory_limiter
              - transform
              - batch
            exporters:
              - clickhouse
      ```
    </TabItem>

    <TabItem value="legacy-linux" label="レガシー Linux (Ubuntu 20.04, RHEL, CentOS)">
      ```yaml
      receivers:
        filelog/syslog:
          include:
            - /var/log/syslog
            - /var/log/messages
            - /var/log/**/*.log
          start_at: end
          operators:
            - type: regex_parser
              regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
              parse_from: body
              parse_to: attributes
            
            - type: time_parser
              parse_from: attributes.timestamp
              layout: '%b %d %H:%M:%S'
            
            - type: add
              field: attributes.source
              value: "host-logs"
            
            - type: add
              field: resource["service.name"]
              value: "host-production"

      service:
        pipelines:
          logs/host:
            receivers: [filelog/syslog]
            processors:
              - memory_limiter
              - transform
              - batch
            exporters:
              - clickhouse
      ```
    </TabItem>

    <TabItem value="macos" label="macOS">
      ```yaml
      receivers:
        filelog/syslog:
          include:
            - /var/log/system.log
            - /host/private/var/log/*.log
          start_at: end
          operators:
            - type: regex_parser
              regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
              parse_from: body
              parse_to: attributes
            
            - type: time_parser
              parse_from: attributes.timestamp
              layout: '%b %d %H:%M:%S'
            
            - type: add
              field: attributes.source
              value: "host-logs"
            
            - type: add
              field: resource["service.name"]
              value: "host-production"

      service:
        pipelines:
          logs/host:
            receivers: [filelog/syslog]
            processors:
              - memory_limiter
              - transform
              - batch
            exporters:
              - clickhouse
      ```
    </TabItem>
  </Tabs>

  <br />

  全ての設定:

  * 標準的なパスにある syslog ファイルを読み込む
  * syslog 形式を解析し、構造化されたフィールド（timestamp、hostname、unit/service、PID、message）を抽出します
  * ログの元のタイムスタンプを保持する
  * HyperDX でのフィルタリング用に `source: host-logs` 属性を追加します
  * 専用パイプライン経由でログを ClickHouse エクスポーターに転送する

  :::note

  * カスタム構成では、新しい receiver と pipeline だけを定義します。
  * プロセッサー（`memory_limiter`、`transform`、`batch`）とエクスポーター（`clickhouse`）は、ベースの ClickStack 構成ですでに定義されているので、名前を指定するだけで利用できます。
  * `regex` パーサーは、`syslog` 形式のログから `systemd` のユニット名、PID、およびその他のメタデータを抽出します
  * この設定では、コレクターの再起動時にログを再度取り込まないようにするために `start_at: end` を使用します。テスト時には、`start_at: beginning` に変更すると、過去のログをすぐに確認できます。
    :::

  #### ClickStackにカスタム設定を読み込ませる構成

  既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、次の手順を実行してください:

  1. カスタム設定ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントします。
  2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定します
  3. collector が読み取れるように、syslog ディレクトリをマウントします

  ##### オプション1: Docker Compose

  ClickStack のデプロイメント設定を更新してください:

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... other environment variables ...
      volumes:
        - ./host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log:/var/log:ro
        # ... other volumes ...
  ```

  ##### オプション2: Docker Run（オールインワンイメージ）

  `docker run` でオールインワンイメージを使用している場合:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log:/var/log:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  ClickStackコレクターがsyslogファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では、読み取り専用マウント(`:ro`)を使用し、最小権限の原則に従ってください。
  :::

  #### HyperDXでのログ確認

  設定後、HyperDXにログインし、ログが正常に送信されていることを確認します:

  1. 検索ビューを開きます
  2. ソースを Logs に設定します
  3. `source:host-logs` でフィルタリングして、ホストごとのログを確認します
  4. `unit`、`hostname`、`pid`、`message` などのフィールドを含む構造化ログエントリが確認できるはずです。

  <Image img={search_view} alt="検索ビュー" />

  <Image img={log_view} alt="ログビュー" />
</VerticalStepper>

## デモデータセット {#demo-dataset}

本番環境を設定する前にホストログ連携をテストしたいユーザー向けに、現実的なパターンを持つ事前生成済みシステムログのサンプルデータセットを提供します。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする \{#download-sample\}

サンプルログファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

このデータセットには次の内容が含まれます:
- システムのブートシーケンス
- SSH ログインアクティビティ (成功および失敗した試行)
- セキュリティインシデント (fail2ban による応答を伴うブルートフォース攻撃)
- 定期メンテナンス (cron ジョブ、anacron)
- サービスの再起動 (rsyslog)
- カーネルメッセージおよびファイアウォールのアクティビティ
- 通常運用と注目すべきイベントの混在

#### テスト用 Collector 設定を作成する \{#test-config\}

次の設定内容で `host-logs-demo.yaml` という名前のファイルを作成します:

```yaml
cat > host-logs-demo.yaml << 'EOF'
receivers:
  filelog/journal:
    include:
      - /tmp/host-demo/journal.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%Y-%m-%dT%H:%M:%S%z'
      
      - type: add
        field: attributes.source
        value: "host-demo"
      
      - type: add
        field: resource["service.name"]
        value: "host-demo"

service:
  pipelines:
    logs/host-demo:
      receivers: [filelog/journal]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### デモ設定で ClickStack を実行する {#run-demo}

デモ用ログと設定を使用して ClickStack を実行します:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

:::note
**このコマンドはログファイルをコンテナ内に直接マウントします。これは静的なデモデータを使ったテスト目的で行っています。**
:::

#### HyperDX でログを確認する {#verify-demo-logs}

ClickStack が起動したら、次の手順を実行します:

1. [HyperDX](http://localhost:8080/) を開き、アカウントにログインします (アカウントをまだ持っていない場合は作成する必要があります)
2. Search ビューに移動し、source を `Logs` に設定します
3. 時間範囲を **2025-11-10 00:00:00 - 2025-11-13 00:00:00** に設定します

<Image img={search_view} alt="検索ビュー"/>
<Image img={log_view} alt="ログビュー"/>

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** の期間をカバーしています。広めの時間範囲を指定することで、どの地域からアクセスしていてもデモログが表示されるようにしています。ログが確認できたら、可視化を分かりやすくするために時間範囲を 24 時間に絞り込むことができます。
:::

</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack でホストログの監視を開始しやすくするために、システムログ向けの基本的な可視化を提供します。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.host_logs_monitoring.dashboard_download">ダッシュボード構成をダウンロード</TrackedLink> {#download}

#### 用意されたダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、［Dashboards］セクションに移動します
2. 右上の省略記号メニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `host-logs-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポート完了"/>

#### ダッシュボードを表示する \{#created-dashboard\}

ダッシュボードは、すべての可視化があらかじめ設定された状態で作成されます:

<Image img={logs_dashboard} alt="ログダッシュボード"/>

主な可視化は次のとおりです:
- 重大度別の時系列ログボリューム
- ログを生成している上位の systemd ユニット
- SSH ログインアクティビティ（成功 vs 失敗）
- ファイアウォールアクティビティ（ブロック vs 許可）
- セキュリティイベント（ログイン失敗、BAN、ブロック）
- サービスの再起動アクティビティ

:::note
デモデータセットでは、時間範囲を **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに合わせて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない

環境変数が設定されていることを確認してください：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルがマウントされ、読み取り可能であることを確認してください：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### HyperDX にログが表示されない

**syslog ファイルが存在し、実際に書き込まれていることを確認する。**

```bash
# Check if syslog exists
ls -la /var/log/syslog /var/log/messages

# Verify logs are being written
tail -f /var/log/syslog
```

**コレクターがログを読み取れていることを確認する:**

```bash
docker exec <container> cat /var/log/syslog | head -20
```

**有効な構成に `filelog` レシーバーが含まれていることを確認します。**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**collector ログにエラーがないか確認する:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i "filelog\|syslog"
```

**デモ用データセットを使用している場合は、ログファイルにアクセス可能であることを確認してください。**

```bash
docker exec <container> cat /tmp/host-demo/journal.log | wc -l
```


### ログが正しくパースされない場合

**選択した構成と syslog フォーマットが一致していることを確認してください：**

Modern Linux（Ubuntu 24.04+）の場合：

```bash
# Should show ISO8601 format: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```

旧バージョンの Linux または macOS の場合:

```bash
# Should show traditional format: Nov 17 14:16:16
tail -5 /var/log/syslog
# or
tail -5 /var/log/system.log
```

お使いの形式が一致しない場合は、[Create custom OTel collector configuration](#custom-otel) セクションで適切な設定タブを選択してください。


## 次のステップ {#next-steps}

ホストログ監視を設定したら、次の作業を行います。

- 重要なシステムイベント（サービス障害、認証失敗、ディスク警告）向けの[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 特定のユニットでフィルタリングして、特定のサービスを監視する
- ホストログとアプリケーションログを相関付けて、包括的なトラブルシューティングを行う
- セキュリティ監視向けのカスタムダッシュボードを作成する（SSH 試行、sudo 使用状況、ファイアウォールによるブロック）

## 本番環境への移行 {#going-to-production}

このガイドでは、迅速なセットアップのために、ClickStack に組み込まれた OpenTelemetry Collector を拡張します。本番環境でのデプロイメントでは、独自の OTel collector を実行し、データを ClickStack の OTLP エンドポイントに送信することを推奨します。本番向けの構成については、[OpenTelemetry データの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。