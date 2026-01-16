---
slug: /use-cases/observability/clickstack/production
title: '本番運用'
sidebar_label: '本番運用'
pagination_prev: null
pagination_next: null
description: 'ClickStack の本番運用'
doc_type: 'guide'
keywords: ['clickstack', '本番運用', 'デプロイメント', 'ベストプラクティス', '運用']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

本番環境に ClickStack をデプロイする際は、セキュリティ、安定性、および適切な構成を確保するために、いくつかの追加の考慮事項があります。


## ネットワークとポートのセキュリティ \{#network-security\}

デフォルトでは、Docker Compose はホスト上でポートを公開するため、`ufw` (Uncomplicated Firewall) のようなツールが有効になっている場合でも、コンテナ外部からアクセス可能な状態になります。これは Docker のネットワークスタックの挙動によるもので、明示的に設定しない限り、ホストレベルのファイアウォールルールをバイパスしてしまうことがあります。

**推奨事項:**

本番利用に必要なポートのみを公開してください。通常は OTLP エンドポイント、API サーバー、およびフロントエンドです。

たとえば、`docker-compose.yml` ファイル内で不要なポートマッピングを削除するか、コメントアウトするようにしてください。

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API
# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

コンテナの分離やアクセス保護の強化に関する詳細は、[Docker ネットワークのドキュメント](https://docs.docker.com/network/)を参照してください。


## セッションシークレットの設定 \{#session-secret\}

本番環境では、セッションデータを保護し改ざんを防ぐために、環境変数 `EXPRESS_SESSION_SECRET` に強力なランダム値を必ず設定する必要があります。

アプリケーションサービス用の `docker-compose.yml` ファイルにこれを追加する方法は次のとおりです。

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

`openssl` を使用して強度の高いシークレットを生成できます：

```shell
openssl rand -hex 32
```

シークレットをソースコード管理にコミットしないでください。本番環境では、環境変数管理ツール（例: Docker Secrets、HashiCorp Vault、または環境ごとの CI/CD 設定）の利用を検討してください。


## セキュアなインジェスト \\{#secure-ingestion\\}

すべてのインジェストは、ClickStack ディストリビューションに含まれる OpenTelemetry (OTel) コレクターが公開する OTLP ポート経由で行う必要があります。デフォルトでは、これには起動時に生成されるセキュアなインジェスト API key が必要です。このキーは OTel ポートへデータを送信する際に必須であり、HyperDX UI の `Team Settings → API Keys` から確認できます。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

さらに、OTLP エンドポイント向けに TLS を有効化し、[ClickHouse インジェスト専用のユーザー](#database-ingestion-user)を作成することを推奨します。

## ClickHouse \\{#clickhouse\\}

本番環境でのデプロイメントには、標準的な[セキュリティプラクティス](/cloud/security)（強化された暗号化・認証・接続性や、マネージドなアクセス制御を含む）がデフォルトで適用される [ClickHouse Cloud](https://clickhouse.com/cloud) の利用を推奨します。ClickHouse Cloud をベストプラクティスに沿って利用するためのステップバイステップガイドについては、「[ClickHouse Cloud](#clickhouse-cloud-production)」を参照してください。

### ユーザー権限 \\{#user-permissions\\}

#### HyperDX ユーザー \\{#hyperdx-user\\}

HyperDX 用の ClickHouse ユーザーは、以下の設定を変更できる権限を持つ `readonly` ユーザーであれば十分です:

- `max_rows_to_read`（少なくとも 100 万まで）
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

既定では、OSS と ClickHouse Cloud の両方で `default` ユーザーがこれらの権限を持っていますが、これらの権限を持つ新しいユーザーを作成することを推奨します。

#### データベースとインジェスト用ユーザー \\{#database-ingestion-user\\}

OTel collector が ClickHouse にインジェストするための専用ユーザーを作成し、インジェスト先を特定のデータベース（例：`otel`）にすることを推奨します。詳細については、「[インジェスト用ユーザーの作成](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)」を参照してください。

### セルフマネージド環境でのセキュリティ \\{#self-managed-security\\}

自前で ClickHouse インスタンスを運用している場合は、**TLS** を有効化し、認証を強制し、アクセス保護強化のベストプラクティスに従うことが不可欠です。実際の設定ミスの事例とその回避方法については、[このブログ記事](https://www.wiz.io/blog/clickhouse-and-wiz)を参照してください。

ClickHouse OSS は、標準で堅牢なセキュリティ機能を提供しています。ただし、これらは別途設定が必要です。

- `config.xml` の `tcp_port_secure` および `<openSSL>` を利用して **TLS を使用** します。詳しくは [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls) を参照してください。
- `default` ユーザーに対して **強力なパスワードを設定** するか、無効化します。
- 明示的に公開する場合を除き、**ClickHouse を外部に公開しない** ようにします。デフォルトでは、`listen_host` が変更されない限り、ClickHouse は `localhost` のみにバインドされます。
- パスワード、証明書、SSH キー、または [external authenticators](/operations/external-authenticators) などの **認証方式を使用** します。
- IP フィルタリングおよび `HOST` 句を用いて **アクセスを制限** します。詳しくは [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host) を参照してください。
- **ロールベースアクセス制御 (RBAC)** を有効化して、きめ細かな権限を付与します。詳しくは [operations/access-rights](/operations/access-rights) を参照してください。
- [quotas](/operations/quotas)、[settings profiles](/operations/settings/settings-profiles)、および読み取り専用モードを使用して、**クォータと制限を強制** します。
- **保存データを暗号化** し、安全な外部ストレージを使用します。詳しくは [operations/storing-data](/operations/storing-data) および [cloud/security/CMEK](/cloud/security/cmek) を参照してください。
- **認証情報のハードコーディングは避けてください。** [named collections](/operations/named-collections) または ClickHouse Cloud の IAM ロールを使用します。
- [system logs](/operations/system-tables/query_log) および [session logs](/operations/system-tables/session_log) を使用して、**アクセスとクエリを監査** します。

ユーザー管理およびクエリ／リソース制限の管理には、[external authenticators](/operations/external-authenticators) および [query complexity settings](/operations/settings/query-complexity) も参照してください。

### 有効期限 (TTL) を設定する \\{#configure-ttl\\}

ClickStack デプロイメントに対して [有効期限 (TTL)](/use-cases/observability/clickstack/ttl) が[適切に設定されている](/use-cases/observability/clickstack/ttl#modifying-ttl)ことを確認します。これはデータの保持期間を制御するものであり、デフォルトの 3 日は変更が必要になることが多いです。

## MongoDB ガイドライン \\{#mongodb-guidelines\\}

公式の [MongoDB セキュリティチェックリスト](https://www.mongodb.com/docs/manual/administration/security-checklist/) に従ってください。

## ClickHouse Cloud \\{#clickhouse-cloud-production\\}

以下は、ベストプラクティスを満たす ClickHouse Cloud を用いたシンプルな ClickStack のデプロイメント例です。

<VerticalStepper headerLevel="h3">

### サービスを作成する \\{#create-a-service\\}

サービスを作成するには、[ClickHouse Cloud のクイックスタートガイド](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service)に従ってください。

### 接続情報をコピーする \\{#copy-connection-details\\}

HyperDX 用の接続情報を確認するには、ClickHouse Cloud コンソールを開き、サイドバーの <b>Connect</b> ボタンをクリックし、HTTP 接続情報、特に URL を控えてください。

**このステップで表示されるデフォルトのユーザー名とパスワードを使用して HyperDX に接続することも可能ですが、専用ユーザーの作成を推奨します（下記参照）。**

<Image img={connect_cloud} alt="ClickHouse Cloud への接続" size="md" background/>

### HyperDX 用ユーザーを作成する \\{#create-a-user\\}

HyperDX 専用のユーザーを作成することを推奨します。[Cloud SQL コンソール](/cloud/get-started/sql-console)で次の SQL コマンドを実行し、複雑性要件を満たす安全なパスワードを指定してください。

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### インジェスト用ユーザーを準備する \\{#prepare-for-ingestion\\}

データ用の `otel` データベースと、限定された権限でインジェストを行う `hyperdx_ingest` ユーザーを作成します。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### ClickStack をデプロイする \\{#deploy-clickstack\\}

ClickStack をデプロイします。[Helm](/use-cases/observability/clickstack/deployment/helm) または [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)（ClickHouse を除外するように修正したもの）のデプロイメントモデルを利用することを推奨します。 

:::note コンポーネントを個別にデプロイする
上級ユーザーの場合は、[OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) と [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) を、それぞれのスタンドアロンデプロイメントモードで個別にデプロイすることもできます。
:::

ClickHouse Cloud を Helm チャートと組み合わせて利用する手順は[こちら](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)を参照してください。Docker Compose 向けの同等の手順は[こちら](/use-cases/observability/clickstack/deployment/docker-compose)にあります。

### HyperDX UI にアクセスする \\{#navigate-to-hyperdx-ui\\}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

要件を満たすユーザー名とパスワードを指定してユーザーを作成します。 

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

`Create` をクリックすると、接続情報の入力を求められます。

### ClickHouse Cloud に接続する \\{#connect-to-clickhouse-cloud\\}

先ほど作成した認証情報を使用して接続情報を入力し、`Create` をクリックします。

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### ClickStack にデータを送信する \\{#send-data\\}

ClickStack にデータを送信する方法については、["Sending OpenTelemetry data"](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data) を参照してください。

</VerticalStepper>