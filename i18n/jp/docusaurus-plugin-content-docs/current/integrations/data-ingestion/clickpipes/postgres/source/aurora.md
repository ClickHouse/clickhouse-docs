---
sidebar_label: 'Amazon Aurora Postgres'
description: 'ClickPipesのソースとしてAmazon Aurora Postgresをセットアップする'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Aurora Postgresソースセットアップガイド'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# Aurora Postgresソースセットアップガイド

## サポートされているPostgresバージョン {#supported-postgres-versions}

ClickPipesは、Aurora PostgreSQL互換エディションのバージョン12以降をサポートしています。

## 論理レプリケーションを有効にする {#enable-logical-replication}

以下の設定が既に構成されている場合、このセクションをスキップできます：
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

まだ設定されていない場合は、以下の手順に従ってください：

1. 必要な設定を持つ新しいパラメータグループをAurora PostgreSQLバージョンに対して作成します：
    - `rds.logical_replication`を1に設定
    - `wal_sender_timeout`を0に設定

<Image img={parameter_group_in_blade} alt="Parameterグループの見つけ方 (Aurora)" size="lg" border/>

<Image img={change_rds_logical_replication} alt="rds.logical_replicationの変更" size="lg" border/>

<Image img={change_wal_sender_timeout} alt="wal_sender_timeoutの変更" size="lg" border/>

2. 新しいパラメータグループをAurora PostgreSQLクラスタに適用します。

<Image img={modify_parameter_group} alt="新しいパラメータグループでAurora PostgreSQLを変更" size="lg" border/>

3. 変更を適用するためにAuroraクラスタを再起動します。

<Image img={reboot_rds} alt="Aurora PostgreSQLの再起動" size="lg" border/>

## データベースユーザーの設定 {#configure-database-user}

管理者ユーザーとしてAurora PostgreSQLのライターインスタンスに接続し、次のコマンドを実行します：

1. ClickPipes用の専用ユーザーを作成します：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. スキーマの権限を付与します。以下の例は`public`スキーマの権限を示しています。レプリケートしたい各スキーマについて、これらのコマンドを繰り返します：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. レプリケーション権限を付与します：

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. レプリケーションのための公開を作成します：

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## ネットワークアクセスの設定 {#configure-network-access}

### IPベースのアクセス制御 {#ip-based-access-control}

Auroraクラスタへのトラフィックを制限したい場合は、[文書化された静的NAT IP](../../index.md#list-of-static-ips)をAuroraセキュリティグループの`Inbound rules`に追加してください。

<Image img={security_group_in_rds_postgres} alt="Aurora PostgreSQLのセキュリティグループの見つけ方" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのインバウンドルールを編集" size="lg" border/>

### AWS PrivateLinkによるプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを介してAuroraクラスタに接続するには、AWS PrivateLinkを使用できます。接続の設定については、[ClickPipesのためのAWS PrivateLinkセットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。

### Aurora特有の考慮事項 {#aurora-specific-considerations}

ClickPipesをAurora PostgreSQLで設定する際は、以下の点に注意してください：

1. **接続エンドポイント**：論理レプリケーションには書き込みアクセスが必要なため、常にAuroraクラスタのライターエンドポイントに接続してください。レプリケーションスロットを作成するには、プライマリインスタンスに接続する必要があります。

2. **フェイルオーバー処理**：フェイルオーバーが発生した場合、Auroraは自動的にリーダーを新しいライターに昇格させます。ClickPipesは切断を検出し、ライターエンドポイントへの再接続を試みます。これにより、新しいプライマリインスタンスを指すようになります。

3. **グローバルデータベース**：Aurora Global Databaseを使用している場合は、クロスリージョンレプリケーションが既にリージョン間のデータ移動を処理するため、プライマリリージョンのライターエンドポイントに接続する必要があります。

4. **ストレージの考慮事項**：Auroraのストレージ層は、クラスタ内のすべてのインスタンスで共有されるため、標準のRDSに比べて論理レプリケーションのパフォーマンスが向上します。

### 動的クラスタエンドポイントの扱い {#dealing-with-dynamic-cluster-endpoints}

Auroraは自動的に適切なインスタンスにルーティングする安定したエンドポイントを提供しますが、一貫した接続を確保するための追加のアプローチを以下に示します：

1. 高可用性のセットアップでは、Auroraライターエンドポイントを使用するようにアプリケーションを構成してください。これにより、現在のプライマリインスタンスを自動的に指します。

2. クロスリージョンレプリケーションを使用している場合は、各リージョンごとに別々のClickPipesを設定して、レイテンシを減らし、耐障害性を向上させることを検討してください。

## 次は何ですか？ {#whats-next}

これで、[ClickPipeを作成する](../index.md)ことができ、Aurora PostgreSQLクラスタからClickHouse Cloudにデータを取り込むことができます。
Aurora PostgreSQLクラスタの設定中に使用した接続の詳細をメモしておいてください。ClickPipe作成プロセス中に必要になります。
