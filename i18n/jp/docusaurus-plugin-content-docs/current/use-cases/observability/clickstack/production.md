---
slug: /use-cases/observability/clickstack/production
title: '本番環境への導入'
sidebar_label: '本番環境'
pagination_prev: null
pagination_next: null
description: 'ClickStack を本番環境に導入する'
doc_type: 'guide'
keywords: ['clickstack', '本番環境', 'デプロイ', 'ベストプラクティス', '運用']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

本番環境に ClickStack をデプロイする際には、セキュリティと安定性を確保し、適切に構成するために、追加で検討すべき事項がいくつかあります。


## ネットワークとポートのセキュリティ {#network-security}

デフォルトでは、Docker Composeはホスト上でポートを公開し、コンテナの外部からアクセス可能にします。これは`ufw`(Uncomplicated Firewall)などのツールが有効になっている場合でも同様です。この動作はDockerのネットワークスタックによるもので、明示的に設定しない限り、ホストレベルのファイアウォールルールをバイパスすることがあります。

**推奨事項:**

本番環境で必要なポートのみを公開してください。通常、OTLPエンドポイント、APIサーバー、フロントエンドが該当します。

例えば、`docker-compose.yml`ファイル内の不要なポートマッピングを削除またはコメントアウトしてください:


```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # API用（必要な場合のみ）
# ClickHouse 8123やMongoDB 27017などの内部ポートを公開しないでください。
```

コンテナの分離やアクセス制御の強化に関する詳細については、[Docker ネットワークに関するドキュメント](https://docs.docker.com/network/)を参照してください。


## セッションシークレットの設定 {#session-secret}

本番環境では、セッションデータを保護し改ざんを防ぐために、`EXPRESS_SESSION_SECRET` 環境変数に強力でランダムな値を設定する必要があります。

アプリサービスの `docker-compose.yml` ファイルへの追加方法は以下の通りです:

```yaml
app:
  image: ${IMAGE_NAME_HDX}:${IMAGE_VERSION}
  ports:
    - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
    - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
  environment:
    FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
    HYPERDX_API_KEY: ${HYPERDX_API_KEY}
    HYPERDX_API_PORT: ${HYPERDX_API_PORT}
    HYPERDX_APP_PORT: ${HYPERDX_APP_PORT}
    HYPERDX_APP_URL: ${HYPERDX_APP_URL}
    HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
    MINER_API_URL: "http://miner:5123"
    MONGO_URI: "mongodb://db:27017/hyperdx"
    NEXT_PUBLIC_SERVER_URL: http://127.0.0.1:${HYPERDX_API_PORT}
    OTEL_SERVICE_NAME: "hdx-oss-api"
    USAGE_STATS_ENABLED: ${USAGE_STATS_ENABLED:-true}
    EXPRESS_SESSION_SECRET: "super-secure-random-string"
  networks:
    - internal
  depends_on:
    - ch-server
    - db1
```

opensslを使用して強力なシークレットを生成できます:

```shell
openssl rand -hex 32
```

シークレットをソース管理にコミットしないでください。本番環境では、環境変数管理ツール(例: Docker Secrets、HashiCorp Vault、または環境固有のCI/CD設定)の使用を検討してください。


## セキュアなデータ取り込み {#secure-ingestion}

すべてのデータ取り込みは、OpenTelemetry (OTel) コレクターのClickStackディストリビューションによって公開されるOTLPポート経由で行う必要があります。デフォルトでは、起動時に生成されるセキュアな取り込みAPIキーが必要です。このキーはOTLPポートへのデータ送信時に必須であり、HyperDX UIの`Team Settings → API Keys`で確認できます。

<Image img={ingestion_key} alt='取り込みキー' size='lg' />

さらに、OTLPエンドポイントに対してTLSを有効化し、[ClickHouse取り込み専用ユーザー](#database-ingestion-user)を作成することを推奨します。


## ClickHouse {#clickhouse}

本番環境へのデプロイには、[ClickHouse Cloud](https://clickhouse.com/cloud)の使用を推奨します。ClickHouse Cloudは、業界標準の[セキュリティプラクティス](/cloud/security)をデフォルトで適用しており、強化された暗号化、認証と接続性、および管理されたアクセス制御が含まれます。ベストプラクティスに従ってClickHouse Cloudを使用するための段階的なガイドについては、["ClickHouse Cloud"](#clickhouse-cloud-production)を参照してください。

### ユーザー権限 {#user-permissions}

#### HyperDXユーザー {#hyperdx-user}

HyperDX用のClickHouseユーザーは、以下の設定を変更できる`readonly`ユーザーであれば十分です：

- `max_rows_to_read`（最低100万まで）
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

デフォルトでは、OSSとClickHouse Cloudの両方で`default`ユーザーがこれらの権限を持っていますが、これらの権限を持つ新しいユーザーを作成することを推奨します。

#### データベースと取り込みユーザー {#database-ingestion-user}

ClickHouseへの取り込みのために、OTelコレクター専用のユーザーを作成し、取り込みが特定のデータベース（例：`otel`）に送信されるようにすることを推奨します。詳細については、["取り込みユーザーの作成"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)を参照してください。

### セルフマネージドセキュリティ {#self-managed-security}

独自のClickHouseインスタンスを管理している場合、**SSL/TLS**を有効にし、認証を強制し、アクセス強化のベストプラクティスに従うことが不可欠です。実際の設定ミスとその回避方法については、[このブログ記事](https://www.wiz.io/blog/clickhouse-and-wiz)を参照してください。

ClickHouse OSSは、標準で堅牢なセキュリティ機能を提供しています。ただし、これらには設定が必要です：

- **SSL/TLSを使用する** - `config.xml`内の`tcp_port_secure`と`<openSSL>`を使用します。[guides/sre/configuring-ssl](/guides/sre/configuring-ssl)を参照してください。
- **強力なパスワードを設定する** - `default`ユーザーに対して設定するか、無効にします。
- **ClickHouseを外部に公開しない** - 明示的に意図されている場合を除きます。デフォルトでは、`listen_host`が変更されない限り、ClickHouseは`localhost`にのみバインドされます。
- **認証方法を使用する** - パスワード、証明書、SSHキー、または[外部認証システム](/operations/external-authenticators)などを使用します。
- **アクセスを制限する** - IPフィルタリングと`HOST`句を使用します。[sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host)を参照してください。
- **ロールベースアクセス制御（RBAC）を有効にする** - きめ細かい権限を付与します。[operations/access-rights](/operations/access-rights)を参照してください。
- **クォータと制限を適用する** - [クォータ](/operations/quotas)、[設定プロファイル](/operations/settings/settings-profiles)、および読み取り専用モードを使用します。
- **保存データを暗号化する** - 安全な外部ストレージを使用します。[operations/storing-data](/operations/storing-data)と[cloud/security/CMEK](/cloud/security/cmek)を参照してください。
- **認証情報をハードコーディングしない** - [名前付きコレクション](/operations/named-collections)またはClickHouse CloudのIAMロールを使用します。
- **アクセスとクエリを監査する** - [システムログ](/operations/system-tables/query_log)と[セッションログ](/operations/system-tables/session_log)を使用します。

ユーザー管理とクエリ/リソース制限の確保については、[外部認証システム](/operations/external-authenticators)と[クエリ複雑度設定](/operations/settings/query-complexity)も参照してください。

### Time To Live（TTL）の設定 {#configure-ttl}

ClickStackデプロイメントに対して、[Time To Live（TTL）](/use-cases/observability/clickstack/ttl)が[適切に設定](/use-cases/observability/clickstack/ttl#modifying-ttl)されていることを確認してください。これはデータの保持期間を制御します - デフォルトの3日間は、多くの場合変更が必要です。


## MongoDBガイドライン {#mongodb-guidelines}

公式の[MongoDBセキュリティチェックリスト](https://www.mongodb.com/docs/manual/administration/security-checklist/)に従ってください。


## ClickHouse Cloud {#clickhouse-cloud-production}

以下は、ベストプラクティスに準拠したClickHouse Cloudを使用したClickStackのシンプルなデプロイ例を示しています。

<VerticalStepper headerLevel="h3">

### サービスの作成 {#create-a-service}

[ClickHouse Cloudのクイックスタートガイド](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service)に従ってサービスを作成します。

### 接続情報のコピー {#copy-connection-details}

HyperDXの接続情報を確認するには、ClickHouse Cloudコンソールに移動し、サイドバーの<b>Connect</b>ボタンをクリックして、HTTP接続情報（特にURL）を記録します。

**この手順で表示されるデフォルトのユーザー名とパスワードを使用してHyperDXに接続することもできますが、専用ユーザーの作成を推奨します（以下を参照）**

<Image img={connect_cloud} alt='Connect Cloud' size='md' background />

### HyperDXユーザーの作成 {#create-a-user}

HyperDX専用のユーザーを作成することを推奨します。[Cloud SQLコンソール](/cloud/get-started/sql-console)で以下のSQLコマンドを実行し、複雑性要件を満たす安全なパスワードを指定します：

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### データ取り込みユーザーの準備 {#prepare-for-ingestion}

データ用の`otel`データベースと、制限された権限を持つデータ取り込み用の`hyperdx_ingest`ユーザーを作成します。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### ClickStackのデプロイ {#deploy-clickstack}

ClickStackをデプロイします。[Helm](/use-cases/observability/clickstack/deployment/helm)または[Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)（ClickHouseを除外するように変更）のデプロイモデルを推奨します。

:::note コンポーネントの個別デプロイ
上級ユーザーは、[OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone)と[HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only)をそれぞれのスタンドアロンデプロイモードで個別にデプロイできます。
:::

HelmチャートでClickHouse Cloudを使用する手順は[こちら](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)を参照してください。Docker Composeの同等の手順は[こちら](/use-cases/observability/clickstack/deployment/docker-compose)を参照してください。

### HyperDX UIへのアクセス {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)にアクセスしてHyperDX UIを開きます。

要件を満たすユーザー名とパスワードを指定してユーザーを作成します。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

`Create`をクリックすると、接続情報の入力を求められます。

### ClickHouse Cloudへの接続 {#connect-to-clickhouse-cloud}

先ほど作成した認証情報を使用して接続情報を入力し、`Create`をクリックします。

<Image img={hyperdx_cloud} alt='HyperDX Cloud' size='md' />

### ClickStackへのデータ送信 {#send-data}

ClickStackにデータを送信するには、[「OpenTelemetryデータの送信」](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)を参照してください。

</VerticalStepper>
