---
sidebar_label: 'Amazon Aurora Postgres'
description: 'ClickPipes のソースとして Amazon Aurora Postgres をセットアップする'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Aurora Postgres ソースセットアップガイド'
doc_type: 'guide'
keywords: ['Amazon Aurora', 'PostgreSQL', 'ClickPipes', 'AWS データベース', '論理レプリケーションのセットアップ']
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# Aurora Postgres ソースセットアップガイド



## サポートされているPostgresバージョン {#supported-postgres-versions}

ClickPipesは、Aurora PostgreSQL互換エディションバージョン12以降をサポートしています。


## 論理レプリケーションの有効化 {#enable-logical-replication}

Aurora インスタンスに以下の設定が既に構成されている場合は、このセクションをスキップできます:

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

まだ構成されていない場合は、以下の手順に従ってください:

1. 必要な設定を含む、Aurora PostgreSQL バージョン用の新しいパラメータグループを作成します:
   - `rds.logical_replication` を 1 に設定
   - `wal_sender_timeout` を 0 に設定

<Image
  img={parameter_group_in_blade}
  alt='Aurora でパラメータグループを見つける場所'
  size='lg'
  border
/>

<Image
  img={change_rds_logical_replication}
  alt='rds.logical_replication の変更'
  size='lg'
  border
/>

<Image
  img={change_wal_sender_timeout}
  alt='wal_sender_timeout の変更'
  size='lg'
  border
/>

2. 新しいパラメータグループを Aurora PostgreSQL クラスタに適用します

<Image
  img={modify_parameter_group}
  alt='新しいパラメータグループによる Aurora PostgreSQL の変更'
  size='lg'
  border
/>

3. 変更を適用するために Aurora クラスタを再起動します

<Image img={reboot_rds} alt='Aurora PostgreSQL の再起動' size='lg' border />


## データベースユーザーの設定 {#configure-database-user}

管理者ユーザーとしてAurora PostgreSQLライターインスタンスに接続し、以下のコマンドを実行します:

1. ClickPipes専用のユーザーを作成します:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. スキーマ権限を付与します。以下の例は`public`スキーマの権限を示しています。レプリケートする各スキーマに対してこれらのコマンドを繰り返してください:

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. レプリケーション権限を付与します:

   ```sql
   GRANT rds_replication TO clickpipes_user;
   ```

4. レプリケーション用のパブリケーションを作成します:

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```


## ネットワークアクセスの設定 {#configure-network-access}

### IPベースのアクセス制御 {#ip-based-access-control}

Auroraクラスタへのトラフィックを制限する場合は、[ドキュメント化された静的NAT IP](../../index.md#list-of-static-ips)をAuroraセキュリティグループの`インバウンドルール`に追加してください。

<Image
  img={security_group_in_rds_postgres}
  alt='Aurora PostgreSQLでセキュリティグループを見つける場所'
  size='lg'
  border
/>

<Image
  img={edit_inbound_rules}
  alt='上記のセキュリティグループのインバウンドルールを編集'
  size='lg'
  border
/>

### AWS PrivateLinkを介したプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを介してAuroraクラスタに接続するには、AWS PrivateLinkを使用できます。接続を設定するには、[ClickPipes用AWS PrivateLink設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)に従ってください。

### Aurora固有の考慮事項 {#aurora-specific-considerations}

Aurora PostgreSQLでClickPipesを設定する際は、以下の考慮事項に留意してください:

1. **接続エンドポイント**: 論理レプリケーションはレプリケーションスロットを作成するための書き込みアクセスを必要とし、プライマリインスタンスに接続する必要があるため、常にAuroraクラスタのライターエンドポイントに接続してください。

2. **フェイルオーバー処理**: フェイルオーバーが発生した場合、Auroraは自動的にリーダーを新しいライターに昇格させます。ClickPipesは切断を検出し、ライターエンドポイントへの再接続を試みます。このエンドポイントは新しいプライマリインスタンスを指すようになります。

3. **グローバルデータベース**: Aurora Global Databaseを使用している場合は、リージョン間のデータ移動はクロスリージョンレプリケーションによって既に処理されているため、プライマリリージョンのライターエンドポイントに接続してください。

4. **ストレージに関する考慮事項**: Auroraのストレージ層はクラスタ内のすべてのインスタンス間で共有されており、標準的なRDSと比較して論理レプリケーションのパフォーマンスが向上する可能性があります。

### 動的クラスタエンドポイントへの対処 {#dealing-with-dynamic-cluster-endpoints}

Auroraは適切なインスタンスに自動的にルーティングする安定したエンドポイントを提供していますが、一貫した接続性を確保するための追加のアプローチを以下に示します:

1. 高可用性構成の場合、現在のプライマリインスタンスを自動的に指すAuroraライターエンドポイントを使用するようにアプリケーションを設定してください。

2. クロスリージョンレプリケーションを使用している場合は、レイテンシを削減し、耐障害性を向上させるために、各リージョンに個別のClickPipesを設定することを検討してください。


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)して、Aurora PostgreSQLクラスタからClickHouse Cloudへのデータ取り込みを開始できます。
ClickPipeの作成時に必要となるため、Aurora PostgreSQLクラスタのセットアップで使用した接続情報を必ず控えておいてください。
