---
'sidebar_label': 'Amazon Aurora Postgres'
'description': 'Set up Amazon Aurora Postgres as a source for ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/aurora'
'title': 'Aurora Postgres Source Setup Guide'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';



# Aurora Postgres Source Setup Guide

## Supported Postgres versions {#supported-postgres-versions}

ClickPipesは、Aurora PostgreSQL-Compatible Edition バージョン12以降をサポートしています。

## Enable Logical Replication {#enable-logical-replication}

Auroraインスタンスに以下の設定が既に構成されている場合、このセクションをスキップできます：
- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

これらの設定は、以前に別のデータレプリケーションツールを使用していた場合、通常は事前に構成されています。

```text
postgres=> SHOW rds.logical_replication ;
 rds.logical_replication
-------------------------
 on
(1 row)

postgres=> SHOW wal_sender_timeout ;
 wal_sender_timeout
--------------------
 0
(1 row)
```

まだ構成されていない場合は、次の手順に従ってください：

1. 必要な設定を持つAurora PostgreSQLバージョン用の新しいパラメーターグループを作成します：
    - `rds.logical_replication`を1に設定
    - `wal_sender_timeout`を0に設定

<Image img={parameter_group_in_blade} alt="Parameterグループの場所" size="lg" border/>

<Image img={change_rds_logical_replication} alt="rds.logical_replicationの変更" size="lg" border/>

<Image img={change_wal_sender_timeout} alt="wal_sender_timeoutの変更" size="lg" border/>

2. 新しいパラメーターグループをAurora PostgreSQLクラスターに適用します

<Image img={modify_parameter_group} alt="新しいパラメーターグループでAurora PostgreSQLを変更" size="lg" border/>

3. 変更を適用するためにAuroraクラスターを再起動します

<Image img={reboot_rds} alt="Aurora PostgreSQLの再起動" size="lg" border/>

## Configure Database User {#configure-database-user}

管理者ユーザーとしてAurora PostgreSQLのライターインスタンスに接続し、以下のコマンドを実行します：

1. ClickPipes用の専用ユーザーを作成します：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. スキーマの権限を付与します。以下の例は`public`スキーマの権限を示しています。レプリケートしたい各スキーマについてこのコマンドを繰り返します：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. レプリケーション権限を付与します：

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. レプリケーションのためのパブリケーションを作成します：

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```


## Configure Network Access {#configure-network-access}

### IP-based Access Control {#ip-based-access-control}

Auroraクラスターへのトラフィックを制限したい場合は、[文書化された静的NAT IP](../../index.md#list-of-static-ips)をAuroraセキュリティグループの`Inbound rules`に追加してください。

<Image img={security_group_in_rds_postgres} alt="Aurora PostgreSQLでのセキュリティグループの場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記セキュリティグループのインバウンドルールを編集" size="lg" border/>

### Private Access via AWS PrivateLink {#private-access-via-aws-privatelink}

プライベートネットワークを通じてAuroraクラスターに接続するには、AWS PrivateLinkを使用できます。接続の設定については、[ClickPipes用のAWS PrivateLink設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。

### Aurora-Specific Considerations {#aurora-specific-considerations}

ClickPipesをAurora PostgreSQLで設定する際に考慮すべき点は以下の通りです：

1. **接続エンドポイント**：常にAuroraクラスターのライターエンドポイントに接続してください。論理レプリケーションには、レプリケーションスロットを作成するための書き込みアクセスが必要で、プライマリインスタンスに接続する必要があります。

2. **フェイルオーバー処理**：フェイルオーバーが発生した場合、Auroraは自動的にリーダーを新しいライターに昇格させます。ClickPipesは切断を検出し、ライターエンドポイントへの再接続を試みます。このエンドポイントは新しいプライマリインスタンスを指すことになります。

3. **グローバルデータベース**：Aurora Global Databaseを使用している場合、プライマリリージョンのライターエンドポイントに接続する必要があります。クロスリージョンレプリケーションは、すでにリージョン間のデータ移動を処理します。

4. **ストレージの考慮事項**：Auroraのストレージ層はクラスター内のすべてのインスタンスで共有されており、標準RDSに比べて論理レプリケーションのパフォーマンスが向上する可能性があります。

### Dealing with Dynamic Cluster Endpoints {#dealing-with-dynamic-cluster-endpoints}

Auroraは、適切なインスタンスに自動的にルーティングされる安定したエンドポイントを提供しますが、一貫した接続性を確保するための追加のアプローチは以下の通りです：

1. 高可用性のセットアップの場合、Auroraライターエンドポイントを使用するようにアプリケーションを構成してください。これにより、現在のプライマリインスタンスを自動的に指します。

2. クロスリージョンレプリケーションを使用している場合は、各リージョンに対して別々のClickPipesを設定してレイテンシを減少させ、耐障害性を向上させることを検討してください。

## What's next? {#whats-next}

これで、[ClickPipeを作成](../index.md)し、Aurora PostgreSQLクラスターからClickHouse Cloudにデータを取り込むことができるようになります。
Aurora PostgreSQLクラスターの設定時に使用した接続詳細をメモしておくことを忘れないでください。ClickPipeの作成プロセスでそれらが必要になります。
