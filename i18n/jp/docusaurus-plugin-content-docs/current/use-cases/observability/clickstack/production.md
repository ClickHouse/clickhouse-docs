---
'slug': '/use-cases/observability/clickstack/production'
'title': '本番環境への移行'
'sidebar_label': 'Production'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack と共に本番環境に移行する'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

When deploying ClickStack in production, there are several additional considerations to ensure security, stability, and correct configuration.

## ネットワークおよびポートのセキュリティ {#network-security}

デフォルトでは、Docker Composeはホスト上のポートを公開し、コンテナ外からアクセス可能にします - `ufw` (Uncomplicated Firewall) のようなツールが有効になっていてもです。この動作は、ホストレベルのファイアウォールルールをバイパスできるDockerネットワーキングスタックに起因していますが、明示的に設定しない限りはそうなります。

**推奨事項:**

本番用に必要なポートのみを公開してください。一般的にはOTLPエンドポイント、APIサーバー、フロントエンドです。

例えば、`docker-compose.yml`ファイルの不要なポートマッピングを削除またはコメントアウトします:

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API

# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

コンテナを隔離し、アクセスを強化するための詳細については、[Dockerネットワークドキュメント](https://docs.docker.com/network/)を参照してください。

## セッションシークレットの設定 {#session-secret}

本番環境では、セッションデータを保護し、改ざんを防ぐために、`EXPRESS_SESSION_SECRET`環境変数に対して強力でランダムな値を設定する必要があります。

アプリサービスの`docker-compose.yml`ファイルにこれを追加する方法は以下の通りです:

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

強力なシークレットをopensslを使って生成できます:

```shell
openssl rand -hex 32
```

シークレットをソース管理にコミットするのを避けてください。本番環境では、環境変数管理ツール（例：Docker Secrets、HashiCorp Vault、または環境特有のCI/CD設定）を使用することを検討してください。

## セキュアな取り込み {#secure-ingestion}

すべての取り込みは、ClickStackのOpenTelemetry (OTel) コレクタによって公開されたOTLPポート経由で行う必要があります。デフォルトでは、これは起動時に生成されたセキュアな取り込みAPIキーが必要です。このキーはOTelポートにデータを送信する際に必要で、HyperDX UIの`チーム設定 → APIキー`で見つけることができます。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

加えて、OTLPエンドポイントのTLSを有効にし、[ClickHouseの取り込み用に専用のユーザーを作成すること](#database-ingestion-user)を推奨します。

## ClickHouse {#clickhouse}

本番デプロイメントには、業界標準の[セキュリティプラクティス](/cloud/security/shared-responsibility-model)をデフォルトで適用する[ClickHouse Cloud](https://clickhouse.com/cloud)の使用を推奨します - これには[強化された暗号化](/cloud/security/cmek)、[認証と接続](/cloud/security/connectivity)、および[管理されたアクセスコントロール](/cloud/security/cloud-access-management)が含まれます。ClickHouse Cloudを使用する際のベストプラクティスに関するステップバイステップのガイドは["ClickHouse Cloud"](#clickhouse-cloud-production)を参照してください。

### ユーザーの権限 {#user-permissions}

#### HyperDXユーザー {#hyperdx-user}

HyperDX用のClickHouseユーザーは、以下の設定を変更するアクセスを持つ`readonly`ユーザーである必要があります。

- `max_rows_to_read`（少なくとも100万まで）
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

デフォルトでは、OSSおよびClickHouse Cloudの両方の`default`ユーザーにこれらの権限が利用可能ですが、これらの権限を持つ新しいユーザーを作成することを推奨します。

#### データベースおよび取り込みユーザー {#database-ingestion-user}

ClickHouseへの取り込みのためにOTelコレクタ用の専用ユーザーを作成し、取り込みが特定のデータベース（例：`otel`）に送信されるようにすることを推奨します。詳細は["取り込みユーザーの作成"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)を参照してください。

### セルフマネージドセキュリティ {#self-managed-security}

独自のClickHouseインスタンスを管理している場合、**SSL/TLSを有効にし**、認証を強制し、アクセスの強化に関するベストプラクティスに従うことが不可欠です。実際の誤設定に関する文脈と、それを避ける方法については[このブログ記事](https://www.wiz.io/blog/clickhouse-and-wiz)を参照してください。

ClickHouse OSSは、基本的に堅牢なセキュリティ機能を提供します。ただし、これには設定が必要です。

- **SSL/TLSの使用**：`tcp_port_secure`および`config.xml`内の`<openSSL>`を介して。詳しくは[guides/sre/configuring-ssl](/guides/sre/configuring-ssl)を参照。
- **`default`ユーザーのために強力なパスワードを設定**するか、無効にします。
- **ClickHouseを外部に公開しない**ことをお勧めします。デフォルトでは、ClickHouseは`listen_host`が変更されない限り`localhost`のみにバインドします。
- **パスワード、証明書、SSHキーのような認証方法を使用します**、または[外部認証機関](/operations/external-authenticators)を使用します。
- **IPフィルタリングと`HOST`句を使用してアクセスを制限**します。詳しくは[sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host)を参照。
- **ロールベースのアクセス制御 (RBAC) を有効に**し、詳細な権限を付与します。詳細は[operations/access-rights](/operations/access-rights)を参照。
- **クオータや制限を強制**して、[quotas](/operations/quotas)、[settings profiles](/operations/settings/settings-profiles)、および読み取り専用モードを使用します。
- **データを静止状態で暗号化**し、安全な外部ストレージを使用します。詳しくは[operations/storing-data](/operations/storing-data)および[cloud/security/CMEK](/cloud/security/cmek)を参照。
- **資格情報をハードコーディングしない**でください。[named collections](/operations/named-collections)やClickHouse CloudのIAMロールを使用します。
- **アクセスとクエリを監査**するには、[system logs](/operations/system-tables/query_log)および[session logs](/operations/system-tables/session_log)を使用します。

ユーザー管理やクエリ/リソース制限の確保については、[external authenticators](/operations/external-authenticators)および[query complexity settings](/operations/settings/query-complexity)もご参照ください。

### 有効期限 (TTL) の設定 {#configure-ttl}

ClickStackデプロイメントに対して[Time To Live (TTL)](/use-cases/observability/clickstack/ttl)が[適切に設定されている](/use-cases/observability/clickstack/ttl#modifying-ttl)ことを確認してください。これはデータがどのくらいの期間保持されるかを制御します - デフォルトの3日はしばしば変更する必要があります。

## MongoDBガイドライン {#mongodb-guidelines}

公式の[MongoDBセキュリティチェックリスト](https://www.mongodb.com/docs/manual/administration/security-checklist/)に従ってください。

## ClickHouse Cloud {#clickhouse-cloud-production}

以下は、ベストプラクティスを満たすClickHouse Cloudを使用したClickStackのシンプルなデプロイメントを示しています。

<VerticalStepper headerLevel="h3">

### サービスを作成する {#create-a-service}

[ClickHouse Cloudの開始ガイド](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service)に従って、サービスを作成します。

### 接続詳細をコピーする {#copy-connection-details}

HyperDXの接続詳細を見つけるには、ClickHouse Cloudコンソールに移動し、サイドバーの<b>接続</b>ボタンをクリックしてHTTP接続詳細、特にURLを記録します。

**このステップに表示されるデフォルトのユーザー名とパスワードを使用してHyperDXに接続できますが、専用のユーザーを作成することを推奨します - 詳細は以下を参照**

<Image img={connect_cloud} alt="Connect Cloud" size="md" background/>

### HyperDXユーザーを作成する {#create-a-user}

HyperDX用の専用ユーザーを作成することを推奨します。[Cloud SQLコンソール](/cloud/get-started/sql-console)で、複雑さ要件を満たす安全なパスワードを提供して、以下のSQLコマンドを実行します：

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### 取り込み用ユーザーの準備 {#prepare-for-ingestion}

データ用の`otel`データベースと、限られた権限の`hyperdx_ingest`ユーザーを取り込み用に作成します。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### ClickStackをデプロイする {#deploy-clickstack}

ClickStackをデプロイします - [Helm](/use-cases/observability/clickstack/deployment/helm)または[Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)（ClickHouseを除外するように修正済み）のデプロイモデルが推奨されます。

:::note コンポーネントを個別にデプロイする
高度なユーザーは、[OTelコレクタ](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone)や[HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only)をそれぞれのスタンドアロンデプロイメントモードで個別にデプロイできます。
:::

ClickHouse CloudでHelmチャートを使用するための手順は[こちら](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)にあります。Docker Composeの場合の同等の手順は[こちら](/use-cases/observability/clickstack/deployment/docker-compose)にあります。

### HyperDX UIに移動する {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)にアクセスしてHyperDX UIに移動します。

ユーザーを作成し、要件を満たすユーザー名とパスワードを提供します。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

`Create`をクリックすると、接続詳細の入力を求められます。

### ClickHouse Cloudに接続する {#connect-to-clickhouse-cloud}

先ほど作成した資格情報を使用して接続詳細を入力し、`Create`をクリックします。

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### ClickStackにデータを送信する {#send-data}

ClickStackにデータを送信する方法は、["OpenTelemetryデータの送信"](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)を参照してください。

</VerticalStepper>
