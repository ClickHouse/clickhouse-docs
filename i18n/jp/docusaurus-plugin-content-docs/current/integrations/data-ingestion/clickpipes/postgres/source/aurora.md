---
'sidebar_label': 'Amazon Aurora Postgres'
'description': 'Amazon Aurora Postgres を ClickPipes のソースとして設定します'
'slug': '/integrations/clickpipes/postgres/source/aurora'
'title': 'Aurora Postgres ソース設定ガイド'
'doc_type': 'guide'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';



# Aurora Postgres ソース設定ガイド

## サポートされている Postgres バージョン {#supported-postgres-versions}

ClickPipes は Aurora PostgreSQL-Compatible Edition バージョン 12 以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

以下の設定が既に構成されている場合は、このセクションをスキップできます：
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

1. 必要な設定を持つ Aurora PostgreSQL バージョン用の新しいパラメータグループを作成します：
    - `rds.logical_replication` を 1 に設定します
    - `wal_sender_timeout` を 0 に設定します

<Image img={parameter_group_in_blade} alt="Aurora のパラメータグループの見つけ方" size="lg" border/>

<Image img={change_rds_logical_replication} alt="rds.logical_replication の変更" size="lg" border/>

<Image img={change_wal_sender_timeout} alt="wal_sender_timeout の変更" size="lg" border/>

2. 新しいパラメータグループを Aurora PostgreSQL クラスターに適用します

<Image img={modify_parameter_group} alt="新しいパラメータグループで Aurora PostgreSQL を変更" size="lg" border/>

3. Aurora クラスターを再起動して変更を適用します

<Image img={reboot_rds} alt="Aurora PostgreSQL の再起動" size="lg" border/>

## データベースユーザーの構成 {#configure-database-user}

管理者ユーザーとして Aurora PostgreSQL のライター インスタンスに接続し、以下のコマンドを実行します：

1. ClickPipes 用の専用ユーザーを作成します：

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. スキーマの権限を付与します。以下の例では `public` スキーマの権限を示します。レプリケートする各スキーマについてこれらのコマンドを繰り返します：

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. レプリケーション権限を付与します：

```sql
GRANT rds_replication TO clickpipes_user;
```

4. レプリケーション用の出版物を作成します：

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

## ネットワークアクセスの構成 {#configure-network-access}

### IP ベースのアクセス制御 {#ip-based-access-control}

Aurora クラスターへのトラフィックを制限したい場合は、[ドキュメント化された静的 NAT IP](../../index.md#list-of-static-ips) を Aurora セキュリティグループの `Inbound rules` に追加してください。

<Image img={security_group_in_rds_postgres} alt="Aurora PostgreSQL のセキュリティグループの見つけ方" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのインバウンドルールを編集" size="lg" border/>

### AWS PrivateLink を介したプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを介して Aurora クラスターに接続するには、AWS PrivateLink を使用できます。接続の設定については、[ClickPipes 用の AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes) を参照してください。

### Aurora 専用の考慮事項 {#aurora-specific-considerations}

ClickPipes を Aurora PostgreSQL で設定する際には、以下の考慮事項を覚えておいてください：

1. **接続エンドポイント**: 常に Aurora クラスターのライターエンドポイントに接続してください。論理レプリケーションにはレプリケーションスロットを作成するための書き込みアクセスが必要であり、プライマリインスタンスに接続しなければなりません。

2. **フェイルオーバー処理**: フェイルオーバーが発生した場合、Aurora はリーダーを新しいライターに自動的に昇格させます。ClickPipes は切断を検出し、新しいプライマリインスタンスを指すライターエンドポイントへの再接続を試みます。

3. **グローバルデータベース**: Aurora Global Database を使用している場合は、プライマリリージョンのライターエンドポイントに接続してください。クロスリージョンレプリケーションがリージョン間のデータ移動をすでに処理します。

4. **ストレージの考慮事項**: Aurora のストレージレイヤーはクラスター内のすべてのインスタンスで共有されており、標準 RDS と比較して論理レプリケーションのパフォーマンスを向上させることができます。

### 動的クラスターエンドポイントへの対応 {#dealing-with-dynamic-cluster-endpoints}

Aurora は適切なインスタンスに自動的にルーティングされる安定したエンドポイントを提供しますが、一貫した接続性を確保するための追加のアプローチを以下に示します：

1. 高可用性セットアップの場合、アプリケーションを Aurora ライターエンドポイントを使用するように構成します。これにより、現在のプライマリインスタンスに自動的にポイントします。

2. クロスリージョンレプリケーションを使用している場合は、各リージョンごとに別々の ClickPipes を設定してレイテンシーを低減し、フォールトトレランスを向上させることを検討してください。

## 次は何ですか？ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、Aurora PostgreSQL クラスターから ClickHouse Cloud へデータを取り込むことができます。
Aurora PostgreSQL クラスターを設定する際に使用した接続の詳細をメモしておくことを忘れないでください。ClickPipe の作成プロセス中にそれらが必要になります。
