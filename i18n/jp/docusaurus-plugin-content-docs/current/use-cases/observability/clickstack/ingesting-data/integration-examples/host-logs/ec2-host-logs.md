---
slug: /use-cases/observability/clickstack/integrations/host-logs/ec2
title: 'ClickStack による EC2 ホストログの監視'
sidebar_label: 'EC2 ホストログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack による EC2 ホストログの監視'
doc_type: 'guide'
keywords: ['EC2', 'AWS', 'ホストログ', 'systemd', 'syslog', 'OTel', 'ClickStack', 'システム監視', 'クラウドメタデータ']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import search_view from '@site/static/images/clickstack/host-logs/ec2/search-view.png';
import log_view from '@site/static/images/clickstack/host-logs/ec2/log-view.png';
import search_view_demo from '@site/static/images/clickstack/host-logs/ec2/search-view-demo.png';
import log_view_demo from '@site/static/images/clickstack/host-logs/ec2/log-view-demo.png';
import logs_dashboard from '@site/static/images/clickstack/host-logs/host-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/host-logs/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickStack による EC2 ホストログの監視 \{#ec2-host-logs-clickstack\}

:::note[TL;DR]
EC2 インスタンスに OpenTelemetry Collector をインストールして、ClickStack で EC2 のシステムログを監視します。Collector はログに EC2 メタデータ（インスタンス ID、リージョン、アベイラビリティゾーン、インスタンスタイプ）を自動的に付加します。このセクションでは次の内容を説明します。

- EC2 インスタンス上への OpenTelemetry Collector のインストールと設定
- EC2 メタデータによるログの自動付与
- OTLP 経由で ClickStack にログを送信
- あらかじめ用意されたダッシュボードを使い、クラウドコンテキスト付きで EC2 ホストログを可視化

サンプルログとシミュレートされた EC2 メタデータを含むデモデータセットがテスト用に利用できます。

所要時間: 10〜15分
:::

## 既存の EC2 インスタンスとの統合 \{#existing-ec2\}

このセクションでは、EC2 インスタンス上に OpenTelemetry Collector をインストールし、システムログを収集して EC2 メタデータを自動付与したうえで ClickStack に送信する方法を説明します。この分散アーキテクチャは本番環境向けであり、複数インスタンスへスケール可能です。

:::note[同じ EC2 インスタンス上で ClickStack を実行していますか？]
監視したいログを出力している EC2 インスタンス上で ClickStack を実行している場合は、[汎用ホストログガイド](/use-cases/observability/clickstack/integrations/host-logs)と同様のオールインワン方式を利用できます。`/var/log` を ClickStack コンテナにマウントし、カスタム設定に `resourcedetection` プロセッサを追加することで、EC2 メタデータを自動的に取得できます。このガイドでは、本番環境デプロイメントでより一般的な分散アーキテクチャに焦点を当てます。
:::

本番インスタンスを設定する前に EC2 ホストログ連携を試したい場合は、["Demo dataset"](/use-cases/observability/clickstack/integrations/host-logs/ec2#demo-dataset) セクションで、事前構成済みのセットアップとサンプルデータを使ってテストできます。

##### 前提条件 \{#prerequisites\}

- ClickStack インスタンスが稼働していること（オンプレミス、Cloud、またはローカルのいずれでも可）
- EC2 インスタンスが稼働していること（Ubuntu、Amazon Linux、その他の Linux ディストリビューションであること）
- EC2 インスタンスから ClickStack の OTLP エンドポイントへのネットワーク接続性があること（HTTP はポート 4318、gRPC はポート 4317）
- EC2 インスタンスのメタデータサービスにアクセス可能であること（デフォルトで有効）

<VerticalStepper headerLevel="h4">
  #### EC2メタデータへのアクセスを確認する

  EC2インスタンスから、メタデータサービスにアクセス可能であることを確認します:

  ```bash
  # Get metadata token (IMDSv2)
  TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

  # Verify instance metadata
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-type
  ```

  インスタンスID、リージョン、およびインスタンスタイプが表示されるはずです。これらのコマンドが失敗した場合は、以下を確認してください:

  * インスタンスメタデータサービスが有効化されていること
  * IMDSv2 がセキュリティグループやネットワーク ACL によってブロックされていないこと
  * これらのコマンドは EC2 インスタンス上で直接実行します

  :::note
  EC2メタデータは、インスタンス内から`http://169.254.169.254`で利用できます。OpenTelemetryの`resourcedetection`プロセッサは、このエンドポイントを使用してログにクラウドコンテキストを自動的に付与します。
  :::

  #### syslogファイルが存在することを確認する

  EC2インスタンスがsyslogファイルを書き込んでいることを確認します：

  ```bash
  # Ubuntu instances
  ls -la /var/log/syslog

  # Amazon Linux / RHEL instances
  ls -la /var/log/messages

  # View recent entries
  tail -20 /var/log/syslog
  # or
  tail -20 /var/log/messages
  ```

  #### OpenTelemetry Collectorのインストール

  EC2インスタンスにOpenTelemetry Collector Contribディストリビューションをインストールしてください:

  ```bash
  # Download the latest release
  wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.114.0/otelcol-contrib_0.114.0_linux_amd64.tar.gz

  # Extract and install
  tar -xvf otelcol-contrib_0.114.0_linux_amd64.tar.gz
  sudo mv otelcol-contrib /usr/local/bin/

  # Verify installation
  otelcol-contrib --version
  ```

  #### コレクター設定を作成する

  `/etc/otelcol-contrib/config.yaml` に OpenTelemetry Collector の設定ファイルを作成してください:

  ```bash
  sudo mkdir -p /etc/otelcol-contrib
  ```

  Linux ディストリビューションに応じて設定を選択してください:

  <Tabs groupId="os-type">
    <TabItem value="modern-linux" label="最新の Linux (Ubuntu 24.04 以降)" default>
      ```yaml
      sudo tee /etc/otelcol-contrib/config.yaml > /dev/null << 'EOF'
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
              value: "ec2-host-logs"

      processors:
        resourcedetection:
          detectors: [ec2, system]
          timeout: 5s
          override: false
          ec2:
            tags:
              - ^Name
              - ^Environment
              - ^Team
        
        batch:
          timeout: 10s
          send_batch_size: 1024

      exporters:
        otlphttp:
          endpoint: "http://YOUR_CLICKSTACK_HOST:4318"
          headers:
            authorization: "${env:CLICKSTACK_API_KEY}"

      service:
        pipelines:
          logs:
            receivers: [filelog/syslog]
            processors: [resourcedetection, batch]
            exporters: [otlphttp]
      EOF
      ```
    </TabItem>

    <TabItem value="legacy-linux" label="レガシー Linux (Amazon Linux 2、RHEL、旧バージョンの Ubuntu)">
      ```yaml
      sudo tee /etc/otelcol-contrib/config.yaml > /dev/null << 'EOF'
      receivers:
        filelog/syslog:
          include:
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
              value: "ec2-host-logs"

      processors:
        resourcedetection:
          detectors: [ec2, system]
          timeout: 5s
          override: false
          ec2:
            tags:
              - ^Name
              - ^Environment
              - ^Team
        
        batch:
          timeout: 10s
          send_batch_size: 1024

      exporters:
        otlphttp:
          endpoint: "http://YOUR_CLICKSTACK_HOST:4318"
          headers:
            authorization: "${env:CLICKSTACK_API_KEY}"

      service:
        pipelines:
          logs:
            receivers: [filelog/syslog]
            processors: [resourcedetection, batch]
            exporters: [otlphttp]
      EOF
      ```
    </TabItem>
  </Tabs>

  <br />

  **設定内の以下の項目を置き換えてください:**

  * `YOUR_CLICKSTACK_HOST`: ClickStack が稼働しているホストのホスト名または IP アドレス
  * ローカルでのテストには SSH トンネルを使用できます（[トラブルシューティング](#troubleshooting) セクションを参照してください）

  この設定では:

  * 標準的な場所にあるシステムログファイル（Ubuntu の場合は `/var/log/syslog`、Amazon Linux/RHEL の場合は `/var/log/messages`）を読み込みます
  * syslog フォーマットを解析し、構造化フィールド（timestamp、hostname、unit/service、PID、message）を抽出します
  * **EC2 メタデータを自動検出して付与**するために `resourcedetection` プロセッサを使用します
  * （存在する場合）任意で EC2 タグ（Name、Environment、Team）も含めることができます
  * OTLP HTTP 経由で ClickStack にログを送信します

  :::note[EC2メタデータエンリッチメント]
  `resourcedetection`プロセッサは、すべてのログに次の属性を自動的に追加します:

  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;ec2&quot;
  * `cloud.region`: AWS リージョン（例: &quot;us-east-1&quot;）
  * `cloud.availability_zone`: AZ（例：&quot;us-east-1a&quot;）
  * `cloud.account.id`: AWS アカウント ID
  * `host.id`: EC2 インスタンスの ID（例: &quot;i-1234567890abcdef0&quot;）
  * `host.type`: インスタンスタイプ（例: &quot;t3.medium&quot;）
  * `host.name`: インスタンスのホスト名

  #### ClickStack APIキーの設定

  ClickStack API キーを環境変数としてエクスポートします:

  ```bash
  export CLICKSTACK_API_KEY="your-api-key-here"
  ```

  再起動後も設定を永続化するには、シェルプロファイルに追加してください:

  ```bash
  echo 'export CLICKSTACK_API_KEY="your-api-key-here"' >> ~/.bashrc
  source ~/.bashrc
  ```

  #### コレクターを実行する

  OpenTelemetry Collectorを起動します:

  ```bash
  CLICKSTACK_API_KEY="your-api-key-here" /usr/local/bin/otelcol-contrib --config /etc/otelcol-contrib/config.yaml
  ```

  :::note[本番環境での使用]
  コレクターがブート時に自動的に起動し、障害時に再起動するよう、systemdサービスとして実行するように設定してください。詳細については、[OpenTelemetry Collectorドキュメント](https://opentelemetry.io/docs/collector/deployment/)を参照してください。
  :::

  #### HyperDXでのログの確認

  コレクターが実行されている状態で、HyperDXにログインし、EC2メタデータを含むログが流れていることを確認してください:

  1. 検索ビューに移動します
  2. ソースを `Logs` に設定します
  3. `source:ec2-host-logs` でフィルタします
  4. ログエントリをクリックして詳細を表示します
  5. リソース属性に EC2 メタデータが含まれていることを確認します:
     * `cloud.provider`
     * `cloud.region`
     * `host.id`（インスタンス ID）
     * `host.type`（インスタンスタイプ）
     * `cloud.availability_zone`

  <Image img={search_view} alt="EC2 ログ検索ビュー" />

  <Image img={log_view} alt="メタデータを含む EC2 ログの詳細" />
</VerticalStepper>

## デモデータセット {#demo-dataset}

本番インスタンスを構成する前に EC2 ホストログ連携をテストしたいユーザー向けに、EC2 メタデータを模したサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">
  #### サンプルデータセットをダウンロードする

  サンプルログファイルをダウンロードしてください:

  ```bash
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
  ```

  データセットには以下が含まれます:

  * システムの起動シーケンス
  * SSH ログインアクティビティ（成功および失敗の試行）
  * セキュリティインシデント（fail2ban により対処されたブルートフォース攻撃）
  * スケジュールされたメンテナンス（cron ジョブ、anacron）
  * サービス再起動（rsyslog）
  * カーネルメッセージおよびファイアウォールのアクティビティ
  * 通常の運用ログと特筆すべきイベントの混在

  #### テストコレクター設定の作成

  以下の設定で `ec2-host-logs-demo.yaml` という名前のファイルを作成します：

  ```yaml
  cat > ec2-host-logs-demo.yaml << 'EOF'
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
          value: "ec2-demo"

  processors:
    # Simulate EC2 metadata for demo (no real EC2 instance required)
    resource:
      attributes:
        - key: service.name
          value: "ec2-demo"
          action: insert
        - key: cloud.provider
          value: "aws"
          action: insert
        - key: cloud.platform
          value: "aws_ec2"
          action: insert
        - key: cloud.region
          value: "us-east-1"
          action: insert
        - key: cloud.availability_zone
          value: "us-east-1a"
          action: insert
        - key: host.id
          value: "i-0abc123def456789"
          action: insert
        - key: host.type
          value: "t3.medium"
          action: insert
        - key: host.name
          value: "prod-web-01"
          action: insert

  service:
    pipelines:
      logs/ec2-demo:
        receivers: [filelog/journal]
        processors:
          - resource
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  EOF
  ```

  :::note
  デモ目的で、`resource` プロセッサを使用して EC2 メタデータを手動で追加しています。実際の EC2 インスタンスを使用する本番環境では、EC2 メタデータ API に自動的にクエリを実行する `resourcedetection` プロセッサを使用してください。
  :::

  #### デモ構成でClickStackを実行する

  デモログと設定を使用してClickStackを実行します:

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/ec2-host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  #### HyperDXでログを検証する

  コレクターが起動したら:

  1. [HyperDX](http://localhost:8080/) を開き、自分のアカウントでログインします（必要に応じて、まずアカウントを作成してください）
  2. 検索ビューに移動し、ソースとして `Logs` を選択します
  3. 時間範囲を **2025-11-10 00:00:00 - 2025-11-13 00:00:00** に設定します。
  4. `source:ec2-demo` で絞り込む
  5. ログエントリを展開して、リソース属性にある EC2 メタデータを表示します

  <Image img={search_view_demo} alt="EC2 ログ検索ビュー" />

  <Image img={log_view_demo} alt="メタデータを含む EC2 ログの詳細" />

  :::note[タイムゾーン表示]
  HyperDXはブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータの期間は**2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**です。この広い時間範囲により、ユーザーの所在地に関わらずデモログを確認できます。ログが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
  :::

  シミュレートされたEC2コンテキストを含むログが表示されるはずです:

  * インスタンス ID: `i-0abc123def456789`
  * リージョン: `us-east-1`
  * アベイラビリティーゾーン: `us-east-1a`
  * インスタンスタイプ: `t3.medium`
</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack を使用して EC2 ホストログの監視を始めるにあたり、クラウドコンテキストを含む基本的な可視化を提供します。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.ec2_host_logs_monitoring.dashboard_download">ダッシュボード設定をダウンロード</TrackedLink> \{#download\}

#### 用意済みダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、Dashboards セクションに移動します
2. 画面右上の省略記号（三点リーダー）メニュー内にある **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `host-logs-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポートの完了"/>

#### ダッシュボードを表示する \{#created-dashboard\}

すべての可視化があらかじめ設定された状態でダッシュボードが作成されます:

<Image img={logs_dashboard} alt="EC2 ログダッシュボード"/>

ダッシュボード上の可視化は EC2 コンテキストでフィルタできます:
- `cloud.region:us-east-1` - 特定のリージョンのログを表示します
- `host.type:t3.medium` - インスタンスタイプでフィルタします
- `host.id:i-0abc123def456` - 特定インスタンスのログのみを表示します

:::note
デモデータセットの場合、時間範囲を **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに合わせて調整してください）。インポートされたダッシュボードにはデフォルトで時間範囲は指定されていません。
:::

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### ログに EC2 メタデータが含まれない

**EC2 メタデータサービスにアクセス可能であることを確認します:**

```bash
# Get metadata token
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Test metadata endpoint
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
```

これが失敗する場合は、次を確認してください:

* インスタンスメタデータサービスが有効になっていること
* IMDSv2 がセキュリティグループによってブロックされていないこと
* コレクターを EC2 インスタンス上で直接実行していること

**メタデータ関連のエラーがないか、コレクターのログを確認してください。**

```bash
# If running as systemd service
sudo journalctl -u otelcol-contrib -f | grep -i "ec2\|metadata\|resourcedetection"

# If running in foreground, check stdout
```


### HyperDX にログが表示されない

**syslog ファイルが存在し、書き込まれていることを確認する:**

```bash
ls -la /var/log/syslog /var/log/messages
tail -f /var/log/syslog
```

**コレクターがログファイルを読み取れているかを確認する：**

```bash
cat /var/log/syslog | head -20
```

**ClickStack へのネットワーク疎通を確認する:**

```bash
# Test OTLP endpoint
curl -v http://YOUR_CLICKSTACK_HOST:4318/v1/logs

# Should get a response (even if error, means endpoint is reachable)
```

**コレクターのログにエラーがないか確認する:**

```bash
# If running in foreground
# Look for error messages in stdout

# If running as systemd service
sudo journalctl -u otelcol-contrib -f | grep -i "error\|failed"
```


### ログが正しく解析されない

**syslog のフォーマットを確認する:**

Ubuntu 24.04 以降の場合:

```bash
# Should show ISO8601 format: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```

Amazon Linux 2 および Ubuntu 20.04 の場合：

```bash
# Should show traditional format: Nov 17 14:16:16
tail -5 /var/log/messages
```

フォーマットが一致しない場合は、お使いのディストリビューションに応じて、[Collector 設定の作成](#create-config) セクション内の適切な設定タブを使用してください。


### systemd サービスとして Collector が起動しない場合

**サービスのステータスを確認する:**

```bash
sudo systemctl status otelcol-contrib
```

**詳細なログを確認する:**

```bash
sudo journalctl -u otelcol-contrib -n 50
```

**よくある問題:**

* 環境変数に API キーが正しく設定されていない
* 設定ファイルの構文エラー
* ログファイルの読み取り権限に関する問題


## 次のステップ {#next-steps}

EC2 ホストログの監視をセットアップしたら、次のステップに進みます。

- 重要なシステムイベント（サービス障害、認証失敗、ディスク警告）向けに[アラート](/use-cases/observability/clickstack/alerts)を設定する
- EC2 メタデータ属性（リージョン、インスタンスタイプ、インスタンス ID）でフィルタリングして特定のリソースを監視する
- 包括的なトラブルシューティングのために EC2 ホストログをアプリケーションログと相関付ける
- セキュリティ監視（SSH アクセス試行、sudo 使用状況、ファイアウォールによるブロック）向けのカスタムダッシュボードを作成する