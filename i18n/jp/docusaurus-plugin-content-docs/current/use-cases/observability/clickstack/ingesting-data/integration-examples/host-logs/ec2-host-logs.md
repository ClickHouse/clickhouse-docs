---
slug: /use-cases/observability/clickstack/integrations/host-logs/ec2
title: 'ClickStack を使用した EC2 ホストログの監視'
sidebar_label: 'EC2 ホストログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した EC2 ホストログの監視'
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


# ClickStack を使用した EC2 ホストログの監視 \{#ec2-host-logs-clickstack\}

:::note[要約]
EC2 インスタンスに OpenTelemetry Collector をインストールして、ClickStack で EC2 システムログを監視します。Collector はログに、インスタンス ID、リージョン、アベイラビリティーゾーン、インスタンスタイプといった EC2 メタデータを自動的に付与します。このガイドでは次の内容を学びます:

- EC2 インスタンス上に OpenTelemetry Collector をインストールおよび設定する方法
- EC2 メタデータでログを自動的に付与する方法
- OTLP 経由で ClickStack にログを送信する方法
- あらかじめ用意されたダッシュボードを使用して、クラウドコンテキスト付きで EC2 ホストログを可視化する方法

テスト用として、サンプルログとシミュレートされた EC2 メタデータを含むデモデータセットを利用できます。

所要時間: 10〜15 分
:::

## 既存の EC2 インスタンスとの統合 \{#existing-ec2\}

このセクションでは、EC2 インスタンス上に OpenTelemetry Collector をインストールしてシステムログを収集し、EC2 メタデータを自動付加しながら ClickStack へ送信する方法を説明します。この分散アーキテクチャは本番運用に対応しており、複数インスタンスへのスケールにも対応できます。

:::note[同じ EC2 インスタンスで ClickStack を実行していますか？]
監視したいログを出力している EC2 インスタンス上で ClickStack が動作している場合は、[Generic Host Logs guide](/use-cases/observability/clickstack/integrations/host-logs) と同様のオールインワン方式を利用できます。`/var/log` を ClickStack コンテナにマウントし、カスタム設定に `resourcedetection` プロセッサを追加することで、EC2 メタデータを自動的に取得できます。本ガイドでは、より一般的な本番環境向けの分散アーキテクチャに焦点を当てます。
:::

本番インスタンスを設定する前に EC2 ホストログ連携を試したい場合は、["Demo dataset"](/use-cases/observability/clickstack/integrations/host-logs/ec2#demo-dataset) セクションにある事前構成済みセットアップとサンプルデータを使ってテストできます。

##### 前提条件 \{#prerequisites\}

- ClickStack インスタンスが稼働していること（オンプレミス、Cloud、ローカルのいずれでも可）
- EC2 インスタンスが稼働していること（Ubuntu、Amazon Linux、その他の Linux ディストリビューション）
- EC2 インスタンスから ClickStack の OTLP エンドポイントへのネットワーク接続があること（HTTP はポート 4318、gRPC はポート 4317）
- EC2 インスタンスのメタデータサービスにアクセス可能であること（デフォルトで有効）

<VerticalStepper headerLevel="h4">
  #### EC2メタデータへのアクセスを確認する

  EC2インスタンスから、メタデータサービスにアクセス可能であることを確認します:

  ```bash
  # メタデータトークンを取得 (IMDSv2)
  TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

  # インスタンスメタデータを検証
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-type
  ```

  インスタンスID、リージョン、およびインスタンスタイプが表示されるはずです。これらのコマンドが失敗した場合は、以下を確認してください:

  * インスタンスメタデータサービスが有効になっている
  * IMDSv2 がセキュリティグループやネットワーク ACL によってブロックされていないこと
  * これらのコマンドは EC2 インスタンス上で直接実行します

  :::note
  EC2メタデータは、インスタンス内から`http://169.254.169.254`で利用できます。OpenTelemetryの`resourcedetection`プロセッサは、このエンドポイントを使用してログにクラウドコンテキストを自動的に付与します。
  :::

  #### syslogファイルが存在することを確認する

  EC2インスタンスがsyslogファイルを書き込んでいることを確認します:

  ```bash
  # Ubuntuインスタンス
  ls -la /var/log/syslog

  # Amazon Linux / RHELインスタンス
  ls -la /var/log/messages

  # 最近のエントリを表示
  tail -20 /var/log/syslog
  # または
  tail -20 /var/log/messages
  ```

  #### OpenTelemetry Collectorのインストール

  EC2インスタンスにOpenTelemetry Collector Contribディストリビューションをインストールします：

  ```bash
  # 最新リリースをダウンロード
  wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.114.0/otelcol-contrib_0.114.0_linux_amd64.tar.gz

  # 展開してインストール
  tar -xvf otelcol-contrib_0.114.0_linux_amd64.tar.gz
  sudo mv otelcol-contrib /usr/local/bin/

  # インストールを確認
  otelcol-contrib --version
  ```

  #### コレクター設定の作成

  OpenTelemetry Collectorの設定ファイルを `/etc/otelcol-contrib/config.yaml` に作成します:

  ```bash
  sudo mkdir -p /etc/otelcol-contrib
  ```

  使用しているLinuxディストリビューションに応じて設定を選択してください：

  <Tabs groupId="os-type">
    <TabItem value="modern-linux" label="モダン Linux（Ubuntu 24.04以降）" default>
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

    <TabItem value="legacy-linux" label="レガシー Linux（Amazon Linux 2、RHEL、旧バージョンのUbuntu）">
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

  * `YOUR_CLICKSTACK_HOST`: ClickStack が稼働しているホスト名または IP アドレス
  * ローカルでのテストには SSH トンネルを使用できます（[トラブルシューティングのセクション](#troubleshooting)を参照してください）

  この設定:

  * 一般的な場所にあるシステムログファイルを読み取ります（Ubuntu では `/var/log/syslog`、Amazon Linux/RHEL では `/var/log/messages`）
  * syslog 形式を解析し、タイムスタンプ、ホスト名、ユニット/サービス、PID、メッセージといった構造化フィールドを抽出します
  * `resourcedetection` プロセッサーを使用して **EC2 メタデータを自動的に検出して追加します**
  * オプションで、存在する場合は EC2 タグ（Name、Environment、Team）も含めます
  * OTLP HTTP 経由で ClickStack にログを送信します

  :::note[EC2メタデータエンリッチメント]
  `resourcedetection`プロセッサは、すべてのログに以下の属性を自動的に追加します:

  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;ec2&quot;
  * `cloud.region`: AWS のリージョン（例：&quot;us-east-1&quot;）
  * `cloud.availability_zone`: AZ（例：&quot;us-east-1a&quot;）
  * `cloud.account.id`: AWS アカウント ID
  * `host.id`: EC2 インスタンスの ID（例: &quot;i-1234567890abcdef0&quot;）
  * `host.type`: インスタンスタイプ（例：「t3.medium」）
  * `host.name`: インスタンスのホスト名

  #### ClickStack APIキーの設定

  ClickStack APIキーを環境変数としてエクスポートします:

  ```bash
  export CLICKSTACK_API_KEY="your-api-key-here"
  ```

  再起動後も設定を永続化するには、シェルプロファイルに追加してください:

  ```bash
  echo 'export CLICKSTACK_API_KEY="ここにあなたのAPIキーを入力"' >> ~/.bashrc
  source ~/.bashrc
  ```

  #### コレクターの実行

  OpenTelemetry Collectorを起動します:

  ```bash
  CLICKSTACK_API_KEY="your-api-key-here" /usr/local/bin/otelcol-contrib --config /etc/otelcol-contrib/config.yaml
  ```

  :::note[本番環境での使用について]
  コレクターをsystemdサービスとして実行するように設定し、起動時の自動起動と障害時の自動再起動を有効にしてください。詳細については、[OpenTelemetry Collectorドキュメント](https://opentelemetry.io/docs/collector/deployment/)を参照してください。
  :::

  #### HyperDXでログを確認する

  コレクターが実行されたら、HyperDXにログインし、EC2メタデータを含むログが流入していることを確認します：

  1. 検索ビューに移動する
  2. ソースを `Logs` に設定します
  3. `source:ec2-host-logs` でフィルタリングします
  4. ログエントリをクリックして詳細を表示します
  5. リソース属性に EC2 メタデータが含まれていることを確認します:
     * `cloud.provider`
     * `cloud.region`
     * `host.id`（インスタンス ID）
     * `host.type`（インスタンスタイプ）
     * `cloud.availability_zone`

  <Image img={search_view} alt="EC2 ログ検索ビュー" />

  <Image img={log_view} alt="メタデータを表示している EC2 のログ詳細" />
</VerticalStepper>

## デモデータセット {#demo-dataset}

本番環境インスタンスを設定する前に EC2 ホストログの連携をテストしたいユーザー向けに、シミュレートされた EC2 メタデータを含むサンプルデータセットを提供しています。

<VerticalStepper headerLevel="h4">
  #### サンプルデータセットをダウンロードする

  サンプルログファイルをダウンロードします：

  ```bash
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
  ```

  データセットには以下が含まれます：

  * システムの起動シーケンス
  * SSH ログインアクティビティ（成功・失敗の試行）
  * セキュリティインシデント（fail2ban による対処を伴うブルートフォース攻撃）
  * スケジュールされたメンテナンス（cron ジョブ、anacron）
  * サービスの再起動（rsyslog）
  * カーネルメッセージおよびファイアウォールのアクティビティ
  * 通常の運用と重要なイベントの混在

  #### テストコレクター設定を作成する

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
    # デモ用にEC2メタデータをシミュレート（実際のEC2インスタンスは不要）
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
  デモ目的では、`resource` プロセッサを使用してEC2メタデータを手動で追加しています。実際のEC2インスタンスを使用する本番環境では、EC2メタデータAPIに自動的にクエリを実行する `resourcedetection` プロセッサを使用してください。
  :::

  #### デモ設定でClickStackを実行する

  デモログと設定でClickStackを実行します：

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/ec2-host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  #### HyperDXでログを確認する

  コレクターが起動したら：

  1. [HyperDX](http://localhost:8080/) を開き、アカウントにログインします（まだアカウントがない場合は、先に作成する必要があります）
  2. 検索ビューに移動し、ソースを`Logs`に設定します。
  3. 時間範囲を **2025-11-10 00:00:00 - 2025-11-13 00:00:00** に設定します。
  4. `source:ec2-demo` で絞り込む
  5. ログエントリを展開し、リソース属性に含まれる EC2 メタデータを表示します

  <Image img={search_view_demo} alt="EC2ログ検索ビュー" />

  <Image img={log_view_demo} alt="メタデータ付きの EC2 ログ詳細" />

  :::note[タイムゾーン表示]
  HyperDXはブラウザのローカルタイムゾーンでタイムスタンプを表示します。デモデータの期間は**2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**です。この広い時間範囲により、場所に関わらずデモログを確認できます。ログが表示されたら、より明確な可視化のために範囲を24時間に絞り込むことができます。
  :::

  シミュレートされたEC2コンテキストを含むログが表示されます：

  * インスタンスID：`i-0abc123def456789`
  * リージョン: `us-east-1`
  * アベイラビリティーゾーン: `us-east-1a`
  * インスタンスタイプ: `t3.medium`
</VerticalStepper>

## ダッシュボードと可視化 {#dashboards}

ClickStack で EC2 ホストログのモニタリングを始めやすくするために、クラウドコンテキストを含んだ基本的な可視化を用意しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.ec2_host_logs_monitoring.dashboard_download">ダウンロード</TrackedLink> ダッシュボード設定ファイル \{#download\}

#### 事前に用意されたダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、Dashboards セクションに移動します
2. 右上の三点リーダー（省略記号）メニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `host-logs-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポートの完了"/>

#### ダッシュボードを表示する \{#created-dashboard\}

ダッシュボードは、すべての可視化があらかじめ設定された状態で作成されます:

<Image img={logs_dashboard} alt="EC2 ログダッシュボード"/>

ダッシュボードの可視化は、EC2 のコンテキストに基づいてフィルタできます:
- `cloud.region:us-east-1` - 特定リージョンのログを表示
- `host.type:t3.medium` - インスタンスタイプでフィルタ
- `host.id:i-0abc123def456` - 特定インスタンスのログを表示

:::note
デモデータセットを利用する場合は、タイムレンジを **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに合わせて調整してください）。インポートしたダッシュボードには、デフォルトではタイムレンジが指定されていません。
:::

</VerticalStepper>

## トラブルシューティング {#troubleshooting}

### ログに EC2 メタデータが含まれない

**EC2 メタデータサービスへアクセス可能か確認する:**

```bash
# メタデータトークンを取得
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# メタデータエンドポイントをテストする
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
```

これが失敗する場合は、次の点を確認してください:

* インスタンスメタデータサービスが有効になっていること
* IMDSv2 がセキュリティグループでブロックされていないこと
* コレクターを EC2 インスタンス上で直接実行していること

**メタデータ関連のエラーがないか、コレクターのログを確認してください。**

```bash
# systemdサービスとして実行している場合
sudo journalctl -u otelcol-contrib -f | grep -i "ec2\|metadata\|resourcedetection"

# フォアグラウンドで実行している場合は、標準出力を確認
```


### HyperDX にログが表示されない

**syslog ファイルが存在し、書き込みが行われていることを確認する：**

```bash
ls -la /var/log/syslog /var/log/messages
tail -f /var/log/syslog
```

**コレクターがログファイルを読み取れることを確認する:**

```bash
cat /var/log/syslog | head -20
```

**ClickStack へのネットワーク疎通を確認する:**

```bash
# OTLPエンドポイントのテスト
curl -v http://YOUR_CLICKSTACK_HOST:4318/v1/logs

# レスポンスが返されます（エラーの場合でも、エンドポイントに到達可能であることを意味します）
```

**コレクターのログにエラーがないか確認する:**

```bash
# フォアグラウンドで実行している場合
# 標準出力でエラーメッセージを確認

# systemdサービスとして実行している場合
sudo journalctl -u otelcol-contrib -f | grep -i "error\|failed"
```


### ログが正しくパースされない場合

**syslog のフォーマットを確認してください:**

Ubuntu 24.04 以降の場合:

```bash
# ISO8601形式で表示されます: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```

Amazon Linux 2 / Ubuntu 20.04 の場合:

```bash
# 従来の形式で表示されます: Nov 17 14:16:16
tail -5 /var/log/messages
```

フォーマットが一致しない場合は、使用しているディストリビューションに応じて、[Collector 設定の作成](#create-config) セクション内の該当する設定タブを使用してください。


### systemd サービスとして Collector が起動しない

**サービスのステータスを確認する:**

```bash
sudo systemctl status otelcol-contrib
```

**詳細なログを確認する:**

```bash
sudo journalctl -u otelcol-contrib -n 50
```

**よくある問題:**

* 環境変数での API キーの設定が正しくない
* 設定ファイルの構文エラー
* ログファイルを読み取る際の権限の問題


## 次のステップ {#next-steps}

EC2 ホストログの監視を設定したら、次の作業を行います。

- 重要なシステムイベント（サービス障害、認証失敗、ディスク警告）向けの[アラート](/use-cases/observability/clickstack/alerts)を設定する
- EC2 メタデータ属性（リージョン、インスタンスタイプ、インスタンス ID）でフィルタリングして特定のリソースを監視する
- 包括的なトラブルシューティングのために EC2 ホストログをアプリケーションログと相関付ける
- セキュリティ監視（SSH アクセス試行、sudo 使用状況、ファイアウォールブロック）向けのカスタムダッシュボードを作成する