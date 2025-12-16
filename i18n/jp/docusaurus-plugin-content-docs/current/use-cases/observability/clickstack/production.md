---
slug: /use-cases/observability/clickstack/production
title: '本番運用への移行'
sidebar_label: '本番運用'
pagination_prev: null
pagination_next: null
description: 'ClickStack を本番運用に移行する'
doc_type: 'guide'
keywords: ['clickstack', '本番運用', 'デプロイメント', 'ベストプラクティス', '運用']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

本番環境に ClickStack をデプロイする際は、セキュリティと安定性を確保し、適切に構成するために、追加で考慮すべき点がいくつかあります。


## ネットワークとポートのセキュリティ {#network-security}

デフォルトでは、Docker Compose はホスト上でポートを公開するため、`ufw` (Uncomplicated Firewall) のようなツールが有効になっていても、コンテナの外部からアクセス可能になります。これは、Docker のネットワーキングスタックが、明示的に設定しない限り、ホストレベルのファイアウォールルールをバイパスできてしまうためです。

**推奨事項:**

本番利用に必要なポートのみを公開してください。通常は OTLP エンドポイント、API サーバー、フロントエンドが該当します。

たとえば、`docker-compose.yml` ファイル内で不要なポートマッピングを削除するか、コメントアウトしてください。

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API
# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

コンテナの分離およびアクセス制御の強化の詳細については、[Docker ネットワークのドキュメント](https://docs.docker.com/network/)を参照してください。


## セッションシークレットの設定 {#session-secret}

本番環境では、セッションデータを保護し改ざんを防ぐために、環境変数 `EXPRESS_SESSION_SECRET` に強力でランダムな値を必ず設定してください。

`app` サービス用の `docker-compose.yml` ファイルにこれを追加する方法は次のとおりです。

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
      MINER_API_URL: 'http://miner:5123'
      MONGO_URI: 'mongodb://db:27017/hyperdx'
      NEXT_PUBLIC_SERVER_URL: http://127.0.0.1:${HYPERDX_API_PORT}
      OTEL_SERVICE_NAME: 'hdx-oss-api'
      USAGE_STATS_ENABLED: ${USAGE_STATS_ENABLED:-true}
      EXPRESS_SESSION_SECRET: "super-secure-random-string"
    networks:
      - internal
    depends_on:
      - ch-server
      - db1
```

`openssl` を使って十分に強度の高いシークレットを生成できます：

```shell
openssl rand -hex 32
```

シークレットをソースコード管理にコミットしないでください。本番環境では、Docker Secrets や HashiCorp Vault、環境ごとの CI/CD 設定などの環境変数管理ツールの利用を検討してください。


## セキュアなインジェスト {#secure-ingestion}

すべてのインジェストは、ClickStack ディストリビューションに含まれる OpenTelemetry (OTel) collector が公開する OTLP ポートを通じて行う必要があります。デフォルトでは、これには起動時に自動生成されるセキュアなインジェスト API key が必要です。このキーは OTel ポートにデータを送信する際に必須であり、HyperDX の UI の「Team Settings → API Keys」から確認できます。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

さらに、OTLP エンドポイントに対して TLS を有効にし、[ClickHouse インジェスト専用のユーザー](#database-ingestion-user)を作成することを推奨します。

## ClickHouse {#clickhouse}

本番環境での運用には、[ClickHouse Cloud](https://clickhouse.com/cloud) の利用を推奨します。ClickHouse Cloud では、強化された暗号化・認証・接続性およびマネージドなアクセス制御を含む、業界標準の[セキュリティプラクティス](/cloud/security)がデフォルトで適用されます。ClickHouse Cloud をベストプラクティスに沿って利用するためのステップバイステップガイドについては、「[ClickHouse Cloud](#clickhouse-cloud-production)」を参照してください。

### ユーザー権限 {#user-permissions}

#### HyperDX ユーザー {#hyperdx-user}

HyperDX 用の ClickHouse ユーザーは、以下の設定を変更できる権限を持つ `readonly` ユーザーであれば十分です。

- `max_rows_to_read`（少なくとも 100 万行まで）
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

デフォルトでは、OSS と ClickHouse Cloud の両方で `default` ユーザーがこれらの権限を持っていますが、これらの権限だけを付与した新しいユーザーを作成することを推奨します。

#### データベースとインジェスト用ユーザー {#database-ingestion-user}

ClickHouse へのインジェストのために OTel collector 専用ユーザーを作成し、`otel` などの特定のデータベースにインジェストが送られるように構成することを推奨します。詳細については「[インジェスト用ユーザーの作成](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)」を参照してください。

### セルフマネージド環境でのセキュリティ {#self-managed-security}

独自に ClickHouse インスタンスを運用している場合は、**TLS** を有効化し、認証を強制し、アクセス保護に関するベストプラクティスに従うことが不可欠です。実際の誤った設定例とその回避方法については、[このブログ記事](https://www.wiz.io/blog/clickhouse-and-wiz) を参照してください。

ClickHouse OSS は、標準で堅牢なセキュリティ機能を提供します。ただし、これらは個別に設定する必要があります。

- `config.xml` の `tcp_port_secure` と `<openSSL>` を利用して **TLS を使用** します。詳細は [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls) を参照してください。
- `default` ユーザーに対して **強力なパスワードを設定** するか、無効化します。
- 明示的な意図がない限り、**ClickHouse を外部公開しない** ようにします。デフォルトでは、`listen_host` を変更しない限り、ClickHouse は `localhost` のみにバインドされます。
- パスワード、証明書、SSH キー、または [external authenticators](/operations/external-authenticators) などの **認証方式を使用** します。
- IP フィルタリングおよび `HOST` 句を使用して **アクセスを制限** します。詳細は [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host) を参照してください。
- **ロールベースアクセス制御 (RBAC)** を有効化して、きめ細かな権限を付与します。詳細は [operations/access-rights](/operations/access-rights) を参照してください。
- [quotas](/operations/quotas)、[settings profiles](/operations/settings/settings-profiles)、および読み取り専用モードを使用して、**クォータと各種制限を適用** します。
- **静止データ（保存データ）を暗号化** し、安全な外部ストレージを使用します。詳細は [operations/storing-data](/operations/storing-data) および [cloud/security/CMEK](/cloud/security/cmek) を参照してください。
- **認証情報をハードコードしないでください。** [named collections](/operations/named-collections) または ClickHouse Cloud の IAM ロールを使用します。
- [system logs](/operations/system-tables/query_log) および [session logs](/operations/system-tables/session_log) を使用して、**アクセスとクエリを監査** します。

ユーザー管理やクエリ／リソース制限の徹底には、[external authenticators](/operations/external-authenticators) および [query complexity settings](/operations/settings/query-complexity) も参照してください。

### 有効期限 (TTL) を設定する {#configure-ttl}

ClickStack デプロイメントに対して [Time To Live (TTL)](/use-cases/observability/clickstack/ttl) が[適切に構成されている](/use-cases/observability/clickstack/ttl#modifying-ttl)ことを確認してください。これはデータの保持期間を制御します。デフォルトの 3 日間は、多くの場合、変更が必要になります。

## MongoDB ガイドライン {#mongodb-guidelines}

公式の [MongoDB セキュリティ チェックリスト](https://www.mongodb.com/docs/manual/administration/security-checklist/) に従ってください。

## ClickHouse Cloud {#clickhouse-cloud-production}

以下は、ベストプラクティスに準拠した、ClickHouse Cloud を利用したシンプルな ClickStack デプロイメント例です。

<VerticalStepper headerLevel="h3">

### サービスを作成する {#create-a-service}

サービスを作成するには、[ClickHouse Cloud のクイックスタートガイド](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service)に従ってください。

### 接続情報をコピーする {#copy-connection-details}

HyperDX 用の接続情報を取得するには、ClickHouse Cloud コンソールに移動し、サイドバーの <b>Connect</b> ボタンをクリックして、HTTP 接続情報、特に URL を控えます。

**この手順で表示されるデフォルトのユーザー名とパスワードを使用して HyperDX に接続することもできますが、専用のユーザーを作成することを推奨します（下記参照）。**

<Image img={connect_cloud} alt="Connect Cloud" size="md" background/>

### HyperDX 用ユーザーを作成する {#create-a-user}

HyperDX 用に専用のユーザーを作成することを推奨します。[Cloud SQL コンソール](/cloud/get-started/sql-console)で以下の SQL コマンドを実行し、複雑性要件を満たす安全なパスワードを指定してください。

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### インジェスト用ユーザーを準備する {#prepare-for-ingestion}

データ用の `otel` データベースと、権限を制限したインジェスト用ユーザー `hyperdx_ingest` を作成します。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### ClickStack をデプロイする {#deploy-clickstack}

ClickStack をデプロイします。[Helm](/use-cases/observability/clickstack/deployment/helm) または [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)（ClickHouse を除外するように修正）のデプロイメントモデルを推奨します。 

:::note コンポーネントを個別にデプロイする
上級ユーザーの場合は、[OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) と [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) を、それぞれのスタンドアロンデプロイメントモードで個別にデプロイできます。
:::

Helm チャートで ClickHouse Cloud を利用する手順は[こちら](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)を参照してください。Docker Compose 向けの同等の手順は[こちら](/use-cases/observability/clickstack/deployment/docker-compose)にあります。

### HyperDX UI にアクセスする {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

要件を満たすユーザー名とパスワードを指定してユーザーを作成します。 

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

`Create` をクリックすると、接続情報の入力を求められます。

### ClickHouse Cloud に接続する {#connect-to-clickhouse-cloud}

先ほど作成した認証情報を使用して接続情報を入力し、`Create` をクリックします。

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### ClickStack にデータを送信する {#send-data}

ClickStack にデータを送信する方法については、「[Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)」を参照してください。

</VerticalStepper>