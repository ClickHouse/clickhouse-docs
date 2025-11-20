---
sidebar_label: 'MongoDB Atlas'
description: 'ClickPipes のソースとして MongoDB Atlas をセットアップするためのステップバイステップガイド'
slug: /integrations/clickpipes/mongodb/source/atlas
title: 'MongoDB Atlas ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';


# MongoDB Atlas ソース設定ガイド



## oplog保持期間の設定 {#enable-oplog-retention}

レプリケーションには最低24時間のoplog保持期間が必要です。初期スナップショットが完了する前にoplogが切り詰められないよう、oplog保持期間を72時間以上に設定することを推奨します。UIでoplog保持期間を設定するには:

1. MongoDB Atlasコンソールでクラスターの`Overview`タブに移動し、`Configuration`タブをクリックします。

   <Image
     img={mongo_atlas_configuration}
     alt='クラスター設定に移動'
     size='lg'
     border
   />

2. `Additional Settings`をクリックし、`More Configuration Options`までスクロールダウンします。

   <Image
     img={mngo_atlas_additional_settings}
     alt='追加設定を展開'
     size='lg'
     border
   />

3. `More Configuration Options`をクリックし、最小oplogウィンドウを`72 hours`以上に設定します。

   <Image
     img={mongo_atlas_retention_hours}
     alt='oplog保持時間を設定'
     size='lg'
     border
   />

4. `Review Changes`をクリックして変更内容を確認し、`Apply Changes`をクリックして変更を適用します。


## データベースユーザーの設定 {#configure-database-user}

MongoDB Atlasコンソールにログイン後、左側のナビゲーションバーのSecurityタブ配下にある`Database Access`をクリックします。次に「Add New Database User」をクリックします。

ClickPipesではパスワード認証が必要です:

<Image img={mongo_atlas_add_user} alt='データベースユーザーの追加' size='lg' border />

ClickPipesには以下のロールを持つユーザーが必要です:

- `readAnyDatabase`
- `clusterMonitor`

これらのロールは`Specific Privileges`セクションで確認できます:

<Image
  img={mongo_atlas_add_roles}
  alt='ユーザーロールの設定'
  size='lg'
  border
/>

ClickPipesユーザーにアクセスを許可するクラスター/インスタンスをさらに指定することもできます:

<Image
  img={mongo_atlas_restrict_access}
  alt='クラスター/インスタンスアクセスの制限'
  size='lg'
  border
/>


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)して、MongoDBインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
ClickPipeの作成時に必要となるため、MongoDBインスタンスのセットアップ時に使用した接続情報を必ず控えておいてください。
