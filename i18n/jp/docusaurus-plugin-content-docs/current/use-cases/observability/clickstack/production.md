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
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

本番環境に ClickStack をデプロイする際は、セキュリティ、安定性、および適切な構成を確保するために、いくつかの追加の考慮事項があります。これらは、利用しているディストリビューションがオープンソース版かマネージド版かによって異なります。

<Tabs groupId="architectures">
  <TabItem value="マネージド ClickStack" label="マネージド版 ClickStack" default>
    本番デプロイには、[Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed) の利用を推奨します。これはデフォルトで業界標準の[セキュリティプラクティス](/cloud/security)を適用し、強化された暗号化、認証および接続性、管理されたアクセス制御を提供するほか、次の利点があります。

    * ストレージとは独立したコンピュートの自動スケーリング
    * オブジェクトストレージに基づく、低コストで実質無制限の保持期間
    * Warehouse を使用して、読み取りと書き込みのワークロードを個別に分離できる機能
    * 統合認証
    * 自動化された[バックアップ](/cloud/features/backups)
    * シームレスなアップグレード

    **Managed ClickStack を使用する場合は、ClickHouse Cloud 向けのこれらの[ベストプラクティス](/cloud/guides/production-readiness)に従ってください。**

    ### データベースとインジェスト用ユーザー \{#database-ingestion-user-managed-managed\}

    Managed ClickHouse へのインジェストと、インジェスト先を特定のデータベース (例: `otel`) に限定するため、OTel collector 用の専用ユーザーを作成することを推奨します。詳細は [&quot;Creating an ingestion user&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) を参照してください。

    ## 有効期限 (TTL) を設定する \{#configure-ttl-managed\}

    Managed ClickStack デプロイで [Time To Live (TTL)](/use-cases/observability/clickstack/ttl) が[適切に設定されている](/use-cases/observability/clickstack/ttl#modifying-ttl)ことを確認してください。これはデータの保持期間を制御します。デフォルト値は 3 日であり、多くの場合、変更が必要です。

    ## リソース見積もり \{#estimating-resources\}

    **Managed ClickStack** をデプロイする際は、インジェストおよびクエリの両方のワークロードを処理できる十分なコンピュートリソースを確保することが重要です。以下の見積もりは、インジェストを予定しているオブザーバビリティデータ量に基づく**ベースラインの起点**を示します。

    これらの推奨値は次の前提に基づきます。

    * データ量は、ログおよびトレースの両方に適用される、月あたりの**非圧縮インジェスト量**を指します。
    * クエリパターンはオブザーバビリティ用途として一般的なものであり、ほとんどのクエリは通常直近 24 時間などの**最新データ**を対象とします。
    * インジェストは**月を通して比較的一様**と想定します。バースト的なトラフィックやスパイクが見込まれる場合は、追加の余裕を確保してください。
    * ストレージは ClickHouse Cloud のオブジェクトストレージによって別途処理され、保持期間の制約要因にはなりません。長期間保持されるデータは頻繁にはアクセスされないと想定します。

    より長い期間を定期的にクエリする場合や重い集約処理を行う場合、多数の同時ユーザーをサポートする場合には、より多くのコンピュートが必要になることがあります。

    ### 推奨ベースラインサイジング \{#recommended-sizing\}

    | 月間インジェスト量          | 推奨コンピュート             |
    | ------------------ | -------------------- |
    | &lt; 10 TB / month | 2 vCPU × 3 replicas  |
    | 10–50 TB / month   | 4 vCPU × 3 replicas  |
    | 50–100 TB / month  | 8 vCPU × 3 replicas  |
    | 100–500 TB / month | 30 vCPU × 3 replicas |
    | 1 PB+ / month      | 59 vCPU × 3 replicas |

    :::note
    これらの値は**あくまで見積もり**であり、初期ベースラインとして使用してください。実際の要件は、クエリの複雑さ、同時実行数、保持ポリシー、インジェストのバースト特性に依存します。常にリソース使用状況を監視し、必要に応じてスケールさせてください。
    :::

    ### オブザーバビリティワークロードの分離 \{#isolating-workloads\}

    リアルタイムアプリケーション分析など、すでに他のワークロードをサポートしている**既存の ClickHouse Cloud サービス**に ClickStack を追加する場合は、オブザーバビリティトラフィックを分離することを強く推奨します。

    [**Managed Warehouses**](/cloud/reference/warehouses) を使用して、ClickStack 専用の**子サービス**を作成してください。これにより、次のことが可能になります。

    * 既存アプリケーションからインジェストおよびクエリ負荷を分離する
    * オブザーバビリティワークロードを個別にスケールさせる
    * オブザーバビリティクエリが本番分析に影響を与えるのを防ぐ
    * 必要に応じて、サービス間で同一の基盤データセットを共有する

    このアプローチにより、既存のワークロードへ影響を与えずに、オブザーバビリティデータの増加に応じて ClickStack を独立してスケールさせることができます。

    より大規模なデプロイやカスタムサイジングのガイダンスが必要な場合は、より正確な見積もりのためにサポートまでお問い合わせください。
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack オープンソース版">
    ## ネットワークおよびポートのセキュリティ \{#network-security\}

    デフォルトでは、Docker Composeはホスト上のポートを公開し、コンテナ外部からアクセス可能にします。これは`ufw`（Uncomplicated Firewall）などのツールが有効になっている場合でも同様です。この動作はDockerネットワークスタックに起因するもので、明示的に設定しない限り、ホストレベルのファイアウォールルールをバイパスします。

    **推奨:**

    本番環境で必要なポートのみを公開してください。通常は、OTLPエンドポイント、APIサーバー、フロントエンドです。

    例えば、`docker-compose.yml` ファイル内の不要なポートマッピングを削除するか、コメントアウトします:

    ```yaml
    ports:
      - "4317:4317"  # OTLP gRPC
      - "4318:4318"  # OTLP HTTP
      - "8080:8080"  # Only if needed for the API
    # Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
    ```

    コンテナの分離とアクセスの強化に関する詳細については、[Dockerネットワーキングドキュメント](https://docs.docker.com/network/)を参照してください。

    ## セッションシークレットの構成 \{#session-secret\}

    本番環境では、セッションデータの保護と改ざん防止のため、ClickStack UI(HyperDX)の `EXPRESS_SESSION_SECRET` 環境変数に強力でランダムな値を設定する必要があります。

    アプリサービスの `docker-compose.yml` ファイルに追加する手順は以下の通りです:

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

    `openssl`を使用して強力なシークレットを生成できます:

    ```shell
    openssl rand -hex 32
    ```

    シークレットをソース管理にコミットすることは避けてください。本番環境では、環境変数管理ツール(例: Docker Secrets、HashiCorp Vault、環境固有のCI/CD設定など)の使用を検討してください。

    ## インジェストのセキュア化 \{#secure-ingestion\}

    すべてのインジェストは、ClickStack ディストリビューションの OpenTelemetry (OTel) コレクターによって公開される OTLP ポート経由で行う必要があります。デフォルトでは、起動時に生成されるセキュアなインジェスト API key が必要です。このキーは OTel ポートにデータを送信する際に必須であり、HyperDX UI の `Team Settings → API Keys` で確認できます。

    <Image img={ingestion_key} alt="インジェストキー" size="lg" />

    さらに、OTLPエンドポイントに対してTLSを有効化し、[ClickHouseインジェスト専用ユーザー](#database-ingestion-user)を作成することを推奨します。

    ## ClickHouse \{#clickhouse\}

    独自のClickHouseインスタンスを管理する場合は、以下のベストプラクティスに従ってください。

    ### セキュリティのベストプラクティス \{#self-managed-security\}

    独自のClickHouseインスタンスを管理している場合、**TLS**の有効化、認証の強制、およびアクセス強化のベストプラクティスの遵守が不可欠です。実際の設定ミスとその回避方法については、[このブログ記事](https://www.wiz.io/blog/clickhouse-and-wiz)を参照してください。

    ClickHouse OSSは、標準で堅牢なセキュリティ機能を提供しています。ただし、これらの機能を使用するには設定が必要です:

    * `config.xml` 内の `tcp_port_secure` と `<openSSL>` を設定して **TLS を利用** します。詳しくは [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls) を参照してください。
    * `default` USER に対して**強力なパスワードを設定する**か、無効化してください。
    * **明示的にそのように意図した場合を除き、ClickHouse を外部に公開しないでください。** デフォルトでは、`listen_host` が変更されない限り、ClickHouse は `localhost` のみにバインドされます。
    * **認証方式として、パスワード、証明書、SSH キー、または [外部認証機構](/operations/external-authenticators) などを使用**します。
    * IP フィルタリングおよび `HOST` 句を使用して、**アクセスを制限**します。詳細については [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host) を参照してください。
    * **ロールベースアクセス制御（RBAC）を有効に**して、きめ細かな権限を付与します。詳しくは [operations/access-rights](/operations/access-rights) を参照してください。
    * [クォータ](/operations/quotas)、[settings profiles](/operations/settings/settings-profiles)、および読み取り専用モードを使用して、**クォータや各種制限を厳格に適用します**。
    * **保存されているデータを暗号化**し、安全な外部ストレージを使用します。[operations/storing-data](/operations/storing-data) および [cloud/security/CMEK](/cloud/security/cmek) を参照してください。
    * **認証情報をハードコーディングすることは避けてください。** [named collections](/operations/named-collections) または ClickHouse Cloud の IAM ロールを使用してください。
    * **アクセスおよびクエリを監査**するには、[system logs](/operations/system-tables/query_log) と [session logs](/operations/system-tables/session_log) を使用します。

    ユーザー管理とクエリ/リソース制限の確保については、[外部認証機能](/operations/external-authenticators)および[クエリ複雑度設定](/operations/settings/query-complexity)も参照してください。

    ### ユーザー権限 \{#user-permissions\}

    #### HyperDX ユーザー \{#hyperdx-user\}

    HyperDX用のClickHouseユーザーは、以下の設定を変更するアクセス権を持つ`readonly`ユーザーのみで十分です:

    * `max_rows_to_read`（少なくとも 100 万行まで）
    * `read_overflow_mode`
    * `cancel_http_readonly_queries_on_client_close`
    * `wait_end_of_query`

    デフォルトでは、OSSとClickHouse Cloudの両方で`default`ユーザーにこれらの権限が利用可能ですが、これらの権限を持つ新しいユーザーを作成することを推奨します。

    #### データベースとインジェスションユーザー \{#database-ingestion-user-managed\}

    ClickHouseへのインジェスト用にOTel collector専用のユーザーを作成し、インジェストが特定のデータベース(例:`otel`)に送信されるようにすることを推奨します。詳細については、[&quot;インジェストユーザーの作成&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)を参照してください。

    ### 有効期限 (TTL) の設定 \{#configure-ttl\}

    ClickStackデプロイメントに対して[有効期限 (TTL)](/use-cases/observability/clickstack/ttl)が[適切に設定](/use-cases/observability/clickstack/ttl#modifying-ttl)されていることを確認してください。これはデータの保持期間を制御します - デフォルトの3日間は変更が必要になることがよくあります。

    ## MongoDB ガイドライン \{#mongodb-guidelines\}

    公式の [MongoDB セキュリティチェックリスト](https://www.mongodb.com/docs/manual/administration/security-checklist/)に従ってください。
  </TabItem>
</Tabs>