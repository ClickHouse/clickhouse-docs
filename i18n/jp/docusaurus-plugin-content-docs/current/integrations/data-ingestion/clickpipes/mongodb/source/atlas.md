---
sidebar_label: 'MongoDB Atlas'
description: 'ClickPipes のソースとして MongoDB Atlas をセットアップするためのステップバイステップガイド'
slug: /integrations/clickpipes/mongodb/source/atlas
title: 'MongoDB Atlas ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';


# MongoDB Atlas ソースのセットアップガイド \{#mongodb-atlas-source-setup-guide\}

## oplog の保持期間を設定する \{#enable-oplog-retention\}

レプリケーションには、最小 24 時間の oplog 保持期間が必要です。初回スナップショットが完了する前に oplog が切り詰められないようにするため、oplog の保持期間は 72 時間以上に設定することを推奨します。UI を使用して oplog の保持期間を設定するには、次の手順を実行します。

1. MongoDB Atlas コンソールでクラスタの `Overview` タブに移動し、`Configuration` タブをクリックします。

<Image img={mongo_atlas_configuration} alt="クラスタ設定に移動する" size="lg" border/>

2. `Additional Settings` をクリックし、`More Configuration Options` までスクロールします。

<Image img={mngo_atlas_additional_settings} alt="追加設定を展開する" size="lg" border/>

3. `More Configuration Options` をクリックし、最小 oplog ウィンドウを `72 hours` 以上に設定します。

<Image img={mongo_atlas_retention_hours} alt="oplog の保持期間 (時間) を設定する" size="lg" border/>

4. `Review Changes` をクリックして内容を確認し、その後 `Apply Changes` をクリックして変更をデプロイします。

## データベースユーザーを構成する \{#configure-database-user\}

MongoDB Atlas コンソールにログインしたら、左側のナビゲーションバーの Security タブの下にある `Database Access` をクリックします。続いて「Add New Database User」をクリックします。

ClickPipes ではパスワード認証が必須です。

<Image img={mongo_atlas_add_user} alt="データベースユーザーの追加" size="lg" border/>

ClickPipes には、次のロールを持つユーザーが必要です。

- `readAnyDatabase`
- `clusterMonitor`

これらは `Specific Privileges` セクションで設定できます。

<Image img={mongo_atlas_add_roles} alt="ユーザーロールの構成" size="lg" border/>

さらに、ClickPipes ユーザーへのアクセスを許可するクラスタやインスタンスを詳細に指定することもできます。

<Image img={mongo_atlas_restrict_access} alt="クラスタ／インスタンスへのアクセス制限" size="lg" border/>

## 次のステップ \{#whats-next\}

これで[ClickPipe を作成](../index.md)し、MongoDB インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
MongoDB インスタンスをセットアップする際に使用した接続情報は、ClickPipe の作成プロセス中にも必要になるため、必ず控えておいてください。