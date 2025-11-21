---
slug: /use-cases/observability/clickstack/integrations/host-logs
title: 'ClickStack によるホストログの監視'
sidebar_label: '汎用ホストログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack による汎用ホストログの監視'
doc_type: 'guide'
keywords: ['ホストログ', 'systemd', 'syslog', 'OTEL', 'ClickStack', 'システム監視', 'サーバーログ']
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


# ClickStackによるホストログの監視 {#host-logs-clickstack}

:::note[TL;DR]
本ガイドでは、OpenTelemetryコレクターを設定してsystemd、カーネル、SSH、cron、その他のシステムサービスからログを収集し、ClickStackでホストシステムログを監視する方法を説明します。以下について学習します:

- システムログファイルを読み取るためのOTelコレクターの設定
- カスタム設定でのClickStackのデプロイ
- 事前構築されたダッシュボードを使用したホストログインサイト(エラー、警告、サービスアクティビティ)の可視化

本番環境のホストを設定する前に統合をテストする場合は、サンプルログを含むデモデータセットが利用可能です。

所要時間: 5〜10分
:::


## 既存ホストとの統合 {#existing-hosts}

このセクションでは、ClickStack OTelコレクターの設定を変更してすべてのシステムログファイル（syslog、auth、kernel、daemon、およびアプリケーションログ）を読み取るようにすることで、既存ホストからClickStackへシステムログを送信する設定方法について説明します。

既存の環境を設定する前にホストログ統合をテストしたい場合は、["デモデータセット"](/use-cases/observability/clickstack/integrations/host-logs#demo-dataset)セクションにある事前設定済みのセットアップとサンプルデータを使用してテストできます。

##### 前提条件 {#prerequisites}

- ClickStackインスタンスが稼働していること
- syslogファイルを持つシステム
- ClickStack設定ファイルを変更するアクセス権

<VerticalStepper headerLevel="h4">

#### syslogファイルの存在を確認 {#verify-syslog}

まず、システムがsyslogファイルを書き込んでいることを確認します：


```bash
# syslogファイルの存在を確認（Linux）
ls -la /var/log/syslog /var/log/messages
```


# または macOS の場合
ls -la /var/log/system.log



# 最近のエントリを表示

tail -20 /var/log/syslog

````

一般的なsyslogの場所:
- **Ubuntu/Debian**: `/var/log/syslog`
- **RHEL/CentOS/Fedora**: `/var/log/messages`
- **macOS**: `/var/log/system.log`

#### カスタムOTelコレクター設定を作成する {#custom-otel}

ClickStackでは、カスタム設定ファイルをマウントして環境変数を設定することで、ベースとなるOpenTelemetry Collectorの設定を拡張できます。

システムの設定を記述した`host-logs-monitoring.yaml`という名前のファイルを作成します:

<Tabs groupId="os-type">
<TabItem value="modern-linux" label="最新のLinux (Ubuntu 24.04+)" default>

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
````

</TabItem>
<TabItem value="legacy-linux" label="従来のLinux (Ubuntu 20.04, RHEL, CentOS)">

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
        layout: "%b %d %H:%M:%S"

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
        layout: "%b %d %H:%M:%S"

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
<br/>
すべての設定:
- 標準的な場所からsyslogファイルを読み取る
- syslog形式を解析して構造化フィールド(タイムスタンプ、ホスト名、ユニット/サービス、PID、メッセージ)を抽出する
- 元のログのタイムスタンプを保持する
- HyperDXでのフィルタリング用に`source: host-logs`属性を追加する
- 専用パイプラインを介してClickHouseエクスポーターにログをルーティングする


:::note

- カスタム設定では新しいレシーバーとパイプラインのみを定義します
- プロセッサー（`memory_limiter`、`transform`、`batch`）とエクスポーター（`clickhouse`）は、ベースのClickStack設定で既に定義されています - 名前で参照するだけです
- 正規表現パーサーは、syslog形式からsystemdユニット名、PID、その他のメタデータを抽出します
- この設定では、コレクター再起動時のログの再取り込みを避けるために`start_at: end`を使用しています。テストの場合は、`start_at: beginning`に変更すると、過去のログをすぐに確認できます。
  :::

#### カスタム設定を読み込むようにClickStackを構成する {#load-custom}

既存のClickStackデプロイメントでカスタムコレクター設定を有効にするには、次の操作が必要です：

1. カスタム設定ファイルを`/etc/otelcol-contrib/custom.config.yaml`にマウントします
2. 環境変数`CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`を設定します
3. コレクターが読み取れるようにsyslogディレクトリをマウントします

##### オプション1：Docker Compose {#docker-compose}

ClickStackデプロイメント設定を更新します：

```yaml
services:
  clickstack:
    # ... 既存の設定 ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... その他の環境変数 ...
    volumes:
      - ./host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log:/var/log:ro
      # ... その他のボリューム ...
```

##### オプション2：Docker Run（オールインワンイメージ） {#all-in-one}

docker runでオールインワンイメージを使用している場合：

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/var/log:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
ClickStackコレクターがsyslogファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では、読み取り専用マウント（`:ro`）を使用し、最小権限の原則に従ってください。
:::

#### HyperDXでログを検証する {#verifying-logs}

設定が完了したら、HyperDXにログインしてログが流れていることを確認します：

1. 検索ビューに移動します
2. ソースをLogsに設定します
3. `source:host-logs`でフィルタリングして、ホスト固有のログを表示します
4. `unit`、`hostname`、`pid`、`message`などのフィールドを持つ構造化されたログエントリが表示されます

<Image img={search_view} alt='検索ビュー' />
<Image img={log_view} alt='ログビュー' />

</VerticalStepper>


## デモデータセット {#demo-dataset}

本番システムを構成する前にホストログ統合をテストしたいユーザー向けに、現実的なパターンを持つ事前生成されたシステムログのサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットのダウンロード {#download-sample}

サンプルログファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

データセットには以下が含まれます:

- システム起動シーケンス
- SSHログイン活動(成功および失敗した試行)
- セキュリティインシデント(fail2ban応答を伴うブルートフォース攻撃)
- スケジュール済みメンテナンス(cronジョブ、anacron)
- サービスの再起動(rsyslog)
- カーネルメッセージとファイアウォール活動
- 通常の操作と注目すべきイベントの混在

#### テストコレクター設定の作成 {#test-config}

以下の設定で`host-logs-demo.yaml`という名前のファイルを作成します:

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

#### デモ設定でClickStackを実行 {#run-demo}

デモログと設定でClickStackを実行します:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**これはログファイルをコンテナに直接マウントします。これは静的なデモデータを使用したテスト目的で行われます。**
:::

#### HyperDXでログを確認 {#verify-demo-logs}

ClickStackが実行されたら:

1. [HyperDX](http://localhost:8080/)を開き、アカウントにログインします(最初にアカウントを作成する必要がある場合があります)
2. 検索ビューに移動し、ソースを`Logs`に設定します
3. 時間範囲を**2025-11-10 00:00:00 - 2025-11-13 00:00:00**に設定します

<Image img={search_view} alt='検索ビュー' />
<Image img={log_view} alt='ログビュー' />

:::note[タイムゾーン表示]
HyperDXはブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータは**2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**の範囲です。広い時間範囲により、場所に関係なくデモログを確認できます。ログが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
:::

</VerticalStepper>


## ダッシュボードと可視化 {#dashboards}

ClickStackを使用したホストログの監視を開始できるよう、システムログに必要な可視化機能を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を<TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.host_logs_monitoring.dashboard_download">ダウンロード</TrackedLink>する {#download}

#### 事前構築済みダッシュボードをインポートする {#import-dashboard}

1. HyperDXを開き、Dashboardsセクションに移動します
2. 右上隅の省略記号メニューから**Import Dashboard**をクリックします

<Image img={import_dashboard} alt='ダッシュボードのインポートボタン' />

3. `host-logs-dashboard.json`ファイルをアップロードし、**Finish Import**をクリックします

<Image img={finish_import} alt='インポートの完了' />

#### ダッシュボードを表示する {#created-dashboard}

すべての可視化が事前設定された状態でダッシュボードが作成されます:

<Image img={logs_dashboard} alt='ログダッシュボード' />

主要な可視化には以下が含まれます:

- 重要度別の時系列ログ量
- ログを生成している上位のsystemdユニット
- SSHログイン活動(成功vs失敗)
- ファイアウォール活動(ブロックvs許可)
- セキュリティイベント(ログイン失敗、禁止、ブロック)
- サービス再起動活動

:::note
デモデータセットの場合、時間範囲を**2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**に設定してください(ローカルタイムゾーンに応じて調整してください)。インポートされたダッシュボードには、デフォルトで時間範囲が指定されていません。
:::

</VerticalStepper>


## トラブルシューティング {#troubleshooting}

### カスタム設定が読み込まれない {#troubleshooting-not-loading}

環境変数が設定されていることを確認します:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルがマウントされ、読み取り可能であることを確認します:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### HyperDXにログが表示されない {#no-logs}


**syslog ファイルが存在し、書き込まれていることを確認する:**

```bash
# syslogが存在するか確認
ls -la /var/log/syslog /var/log/messages
```


# ログが書き込まれていることを確認

tail -f /var/log/syslog

````

**コレクターがログを読み取れることを確認:**
```bash
docker exec <container> cat /var/log/syslog | head -20
````

**有効な設定にfilelogレシーバーが含まれていることを確認:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**コレクターログのエラーを確認:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i "filelog\|syslog"
```

**デモデータセットを使用している場合は、ログファイルにアクセス可能であることを確認:**

```bash
docker exec <container> cat /tmp/host-demo/journal.log | wc -l
```

### ログが正しく解析されない {#logs-not-parsing}

**syslog形式が選択した設定と一致することを確認:**


最新の Linux（Ubuntu 24.04 以降）の場合：

```bash
# ISO8601形式で表示されます: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```


古いバージョンの Linux または macOS 向け：

```bash
# 従来の形式で表示されます: Nov 17 14:16:16
tail -5 /var/log/syslog
# または
tail -5 /var/log/system.log
```

使用しているフォーマットが一致しない場合は、[Create custom OTel collector configuration](#custom-otel) セクションで適切な設定タブを選択してください。


## 次のステップ {#next-steps}

ホストログ監視を設定した後:

- 重要なシステムイベント（サービス障害、認証失敗、ディスク警告）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定します
- 特定のユニットでフィルタリングして特定のサービスを監視します
- 包括的なトラブルシューティングのために、ホストログとアプリケーションログを関連付けます
- セキュリティ監視用のカスタムダッシュボードを作成します（SSH試行、sudo使用、ファイアウォールブロック）


## 本番環境への移行 {#going-to-production}

本ガイドでは、迅速なセットアップのためにClickStackの組み込みOpenTelemetry Collectorを拡張します。本番環境へのデプロイでは、独自のOTel Collectorを実行し、ClickStackのOTLPエンドポイントにデータを送信することを推奨します。本番環境の構成については、[OpenTelemetryデータの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry)を参照してください。
