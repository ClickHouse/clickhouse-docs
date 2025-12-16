---
slug: /use-cases/observability/clickstack/production
title: '本番環境への移行'
sidebar_label: '本番環境'
pagination_prev: null
pagination_next: null
description: 'ClickStack を本番環境で運用する'
doc_type: 'guide'
keywords: ['clickstack', '本番環境', 'デプロイメント', 'ベストプラクティス', '運用']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

本番環境に ClickStack をデプロイする際には、セキュリティ、安定性、適切な構成を確保するために、追加で考慮すべき点がいくつかあります。

## ネットワークとポートのセキュリティ {#network-security}

デフォルトでは、Docker Compose はホスト側のポートを公開するため、`ufw` (Uncomplicated Firewall) のようなツールが有効になっていても、コンテナ外部からアクセスできてしまいます。これは Docker のネットワークスタックの仕様によるもので、明示的に設定しない限り、ホストレベルのファイアウォールルールをバイパスしてしまう可能性があります。

**推奨事項:**

本番運用で必要なポートだけを公開してください。通常は OTLP エンドポイント、API サーバー、フロントエンドのみです。

例えば、`docker-compose.yml` ファイル内で不要なポートマッピングを削除するか、コメントアウトしてください。

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # API に必要な場合のみ
# ClickHouse 8123 や MongoDB 27017 などの内部ポートは公開しないでください。 {#avoid-exposing-internal-ports-like-clickhouse-8123-or-mongodb-27017}
```

コンテナの分離やアクセス制御の強化の詳細については、[Docker ネットワークに関するドキュメント](https://docs.docker.com/network/)を参照してください。

## セッションシークレットの設定 {#session-secret}

本番環境では、セッションデータを保護し改ざんを防ぐために、`EXPRESS_SESSION_SECRET` 環境変数に十分に強力でランダムな値を必ず設定する必要があります。

アプリケーションサービス用に `docker-compose.yml` ファイルに追加する方法は次のとおりです。

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

`openssl` を使って強力なシークレットを生成できます：

```shell
openssl rand -hex 32
```

機密情報をバージョン管理システムにコミットしないようにしてください。本番環境では、Docker Secrets、HashiCorp Vault、環境ごとの CI/CD 設定などの環境変数管理ツールの利用を検討してください。


## セキュアなインジェスト {#secure-ingestion}

すべてのインジェストは、ClickStack ディストリビューションに含まれる OpenTelemetry (OTel) collector が公開している OTLP ポート経由で行う必要があります。デフォルトでは、起動時に自動生成されるセキュアなインジェスト API key が必要です。このキーは OTel ポート経由でデータを送信する際に必須であり、HyperDX UI の `Team Settings → API Keys` で確認できます。

<Image img={ingestion_key} alt="インジェストキー" size="lg"/>

さらに、OTLP エンドポイントに対して TLS を有効にし、[ClickHouse へのインジェスト専用ユーザー](#database-ingestion-user)を作成することを推奨します。

## ClickHouse {#clickhouse}

本番環境でのデプロイには、[ClickHouse Cloud](https://clickhouse.com/cloud) の利用を推奨します。ClickHouse Cloud は、強化された暗号化、認証と接続性、マネージドなアクセス制御を含む、業界標準の[セキュリティ対策](/cloud/security)をデフォルトで適用します。ClickHouse Cloud をベストプラクティスに沿って利用するための手順については、「[ClickHouse Cloud](#clickhouse-cloud-production)」を参照してください。

### ユーザー権限 {#user-permissions}

#### HyperDX ユーザー {#hyperdx-user}

HyperDX 用の ClickHouse ユーザーは、以下の設定にアクセスして変更できる権限を持つ `readonly` ユーザーであれば十分です。

- `max_rows_to_read`（少なくとも 100 万行まで）
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

デフォルトでは、OSS と ClickHouse Cloud の両方で `default` ユーザーがこれらの権限を持っていますが、これらの権限を付与した新しいユーザーを作成することを推奨します。

#### データベースおよびインジェスト用ユーザー {#database-ingestion-user}

OTel collector が ClickHouse にデータをインジェストするための専用ユーザーを作成し、インジェスト先として特定のデータベース（例：`otel`）を指定することを推奨します。詳細については ["Creating an ingestion user"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) を参照してください。

### 自前運用時のセキュリティ {#self-managed-security}

自前で ClickHouse インスタンスを運用している場合は、**TLS** を有効化し、認証を必須とし、アクセスの堅牢化に関するベストプラクティスに従うことが不可欠です。実際の誤った設定例とその回避方法については、[このブログ記事](https://www.wiz.io/blog/clickhouse-and-wiz)も参照してください。

ClickHouse OSS は標準で堅牢なセキュリティ機能を提供します。ただし、これらは適切な設定が必要です。

- `config.xml` の `tcp_port_secure` と `<openSSL>` を使用して **TLS を利用** します。詳しくは [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls) を参照してください。
- `default` ユーザーに対して **強力なパスワードを設定** するか、無効化します。
- 明示的な意図がない限り、**ClickHouse を外部に公開しないようにします**。デフォルトでは、`listen_host` が変更されない限り、ClickHouse は `localhost` のみにバインドされます。
- パスワード、証明書、SSH 鍵、または [external authenticators](/operations/external-authenticators) などの **認証方式を利用** します。
- IP フィルタリングと `HOST` 句を使用して **アクセスを制限** します。詳しくは [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host) を参照してください。
- **ロールベースアクセス制御 (RBAC) を有効化** し、きめ細かな権限を付与します。詳しくは [operations/access-rights](/operations/access-rights) を参照してください。
- [quotas](/operations/quotas)、[settings profiles](/operations/settings/settings-profiles)、および読み取り専用モードを使用して **クォータと制限を適用** します。
- **保存データを暗号化** し、安全な外部ストレージを使用します。詳しくは [operations/storing-data](/operations/storing-data) および [cloud/security/CMEK](/cloud/security/cmek) を参照してください。
- **認証情報をハードコードしないでください。** [named collections](/operations/named-collections) または ClickHouse Cloud の IAM ロールを使用します。
- [system logs](/operations/system-tables/query_log) および [session logs](/operations/system-tables/session_log) を使用して **アクセスとクエリを監査** します。

ユーザー管理およびクエリやリソース制限を確実に適用するには、[external authenticators](/operations/external-authenticators) や [query complexity settings](/operations/settings/query-complexity) も参照してください。

### Time To Live (TTL) の設定 {#configure-ttl}

ClickStack デプロイメントに対して、[Time To Live (TTL)](/use-cases/observability/clickstack/ttl) が[適切に設定されている](/use-cases/observability/clickstack/ttl#modifying-ttl)ことを確認します。これはデータの保持期間を制御します。デフォルトは 3 日ですが、多くの場合は変更が必要になります。

## MongoDB ガイドライン {#mongodb-guidelines}

公式の [MongoDB セキュリティ チェックリスト](https://www.mongodb.com/docs/manual/administration/security-checklist/) に従ってください。

## ClickHouse Cloud {#clickhouse-cloud-production}

以下は、ベストプラクティスに準拠した、ClickHouse Cloud を用いたシンプルな ClickStack のデプロイ例です。

<VerticalStepper headerLevel="h3">

### サービスを作成する {#create-a-service}

サービスを作成するには、[ClickHouse Cloud のクイックスタートガイド](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service)に従ってください。

### 接続情報をコピーする {#copy-connection-details}

HyperDX 用の接続情報を確認するには、ClickHouse Cloud コンソールにアクセスし、サイドバーの <b>Connect</b> ボタンをクリックして、HTTP 接続情報、特に URL を控えてください。

**このステップで表示されるデフォルトのユーザー名とパスワードを使って HyperDX に接続することもできますが、専用ユーザーを作成することを推奨します。詳細は以下を参照してください。**

<Image img={connect_cloud} alt="Connect Cloud" size="md" background/>

### HyperDX ユーザーを作成する {#create-a-user}

HyperDX 用に専用ユーザーを作成することを推奨します。[Cloud SQL コンソール](/cloud/get-started/sql-console)で、複雑性要件を満たす安全なパスワードを指定して、次の SQL コマンドを実行します。

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

:::note コンポーネントを個別にデプロイする場合
上級ユーザーは、[OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) と [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) を、それぞれのスタンドアロンデプロイメントモードで個別にデプロイできます。
:::

ClickHouse Cloud を Helm チャートと併用するための手順は[こちら](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)を参照してください。Docker Compose 用の同等の手順は[こちら](/use-cases/observability/clickstack/deployment/docker-compose)を参照してください。

### HyperDX UI に移動する {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

ユーザーを作成し、要件を満たすユーザー名とパスワードを入力します。 

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

`Create` をクリックすると、接続情報の入力を求められます。

### ClickHouse Cloud に接続する {#connect-to-clickhouse-cloud}

先ほど作成した認証情報を使用して、接続情報を入力し、`Create` をクリックします。

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### ClickStack にデータを送信する {#send-data}

ClickStack にデータを送信する方法については、「[OpenTelemetry データの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)」を参照してください。

</VerticalStepper>