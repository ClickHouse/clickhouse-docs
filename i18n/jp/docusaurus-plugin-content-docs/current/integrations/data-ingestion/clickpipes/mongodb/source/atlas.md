---
sidebar_label: 'MongoDB Atlas'
description: 'MongoDB Atlas を ClickPipes のソースとしてセットアップするためのステップバイステップ形式のガイド'
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


# MongoDB Atlas ソースセットアップガイド {#mongodb-atlas-source-setup-guide}



## oplog の保持期間を設定する {#enable-oplog-retention}

レプリケーションには、最小 24 時間の oplog 保持期間が必要です。初回スナップショットが完了する前に oplog が削除されないようにするため、oplog の保持期間は 72 時間以上に設定することを推奨します。UI から oplog の保持期間を設定するには、次の手順を実行します。

1. MongoDB Atlas コンソールで対象クラスターの `Overview` タブを開き、`Configuration` タブをクリックします。
<Image img={mongo_atlas_configuration} alt="クラスター構成画面へ移動" size="lg" border/>

2. `Additional Settings` をクリックし、`More Configuration Options` までスクロールします。
<Image img={mngo_atlas_additional_settings} alt="追加設定を展開" size="lg" border/>

3. `More Configuration Options` をクリックし、最小 oplog ウィンドウを `72 hours` 以上に設定します。
<Image img={mongo_atlas_retention_hours} alt="oplog の保持期間を設定" size="lg" border/>

4. `Review Changes` をクリックして内容を確認し、その後 `Apply Changes` をクリックして変更を反映します。



## データベースユーザーの設定 {#configure-database-user}

MongoDB Atlas コンソールにログインしたら、左側のナビゲーションバーで Security タブの `Database Access` をクリックし、「Add New Database User」をクリックします。

ClickPipes ではパスワード認証が必要です：

<Image img={mongo_atlas_add_user} alt="データベースユーザーを追加" size="lg" border/>

ClickPipes 用のユーザーには、次のロールが必要です：

- `readAnyDatabase`
- `clusterMonitor`

これらは `Specific Privileges` セクションで選択できます：

<Image img={mongo_atlas_add_roles} alt="ユーザーロールの設定" size="lg" border/>

さらに、ClickPipes ユーザーにアクセス権を付与するクラスターやインスタンスを指定することもできます：

<Image img={mongo_atlas_restrict_access} alt="クラスター／インスタンスへのアクセス制限" size="lg" border/>



## 次のステップ {#whats-next}

これで [ClickPipe の作成](../index.md)を行い、MongoDB インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
ClickPipe の作成プロセスで必要になるため、MongoDB インスタンスのセットアップ時に使用した接続情報は必ず控えておいてください。
