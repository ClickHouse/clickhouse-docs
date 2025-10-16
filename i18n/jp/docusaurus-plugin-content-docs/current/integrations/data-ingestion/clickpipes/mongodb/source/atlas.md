---
'sidebar_label': 'MongoDB Atlas'
'description': 'ClickPipes のソースとして MongoDB Atlas を設定するためのステップバイステップガイド'
'slug': '/integrations/clickpipes/mongodb/source/atlas'
'title': 'MongoDB Atlas ソース設定ガイド'
'doc_type': 'guide'
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';


# MongoDB Atlas ソースセットアップガイド

## oplog 保持の設定 {#enable-oplog-retention}

レプリケーションには最小 24 時間の oplog 保持が必要です。初期スナップショットが完了する前に oplog が切り捨てられないようにするために、oplog 保持を 72 時間以上に設定することをお勧めします。UI を介して oplog 保持を設定するには：

1. MongoDB Atlas コンソールのクラスターの `概要` タブに移動し、`設定` タブをクリックします。
<Image img={mongo_atlas_configuration} alt="クラスター設定に移動" size="lg" border/>

2. `追加設定` をクリックし、`その他の設定オプション` までスクロールします。
<Image img={mngo_atlas_additional_settings} alt="追加設定を展開" size="lg" border/>

3. `その他の設定オプション` をクリックし、最小 oplog ウィンドウを `72 時間` 以上に設定します。
<Image img={mongo_atlas_retention_hours} alt="oplog 保持時間を設定" size="lg" border/>

4. `変更を確認` をクリックしてレビューし、その後 `変更を適用` をクリックして変更を展開します。

## データベースユーザーの設定 {#configure-database-user}

MongoDB Atlas コンソールにログインしたら、左のナビゲーションバーのセキュリティタブの下にある `データベースアクセス` をクリックします。"新しいデータベースユーザーを追加" をクリックします。

ClickPipes にはパスワード認証が必要です：

<Image img={mongo_atlas_add_user} alt="データベースユーザーを追加" size="lg" border/>

ClickPipes には次の役割を持つユーザーが必要です：

- `readAnyDatabase`
- `clusterMonitor`

これらは `特定の権限` セクションにあります：

<Image img={mongo_atlas_add_roles} alt="ユーザー役割を設定" size="lg" border/>

ClickPipes ユーザーにアクセスを付与するクラスタ/インスタンスをさらに指定できます：

<Image img={mongo_atlas_restrict_access} alt="クラスタ/インスタンスアクセスを制限" size="lg" border/>

## 次は何ですか？ {#whats-next}

これで [ClickPipeを作成](../index.md) し、MongoDB インスタンスから ClickHouse Cloud にデータを取り込むことができます。MongoDB インスタンスの設定時に使用した接続詳細をメモしておくことを忘れないでください。ClickPipe の作成プロセス中に必要になります。
