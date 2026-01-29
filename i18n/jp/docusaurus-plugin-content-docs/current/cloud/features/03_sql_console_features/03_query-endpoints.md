---
sidebar_title: 'クエリ API エンドポイント'
slug: /cloud/features/query-api-endpoints
description: '保存済みクエリから REST API エンドポイントを簡単に作成できる'
keywords: ['api', 'クエリ API エンドポイント', 'クエリ エンドポイント', 'クエリ REST API']
title: 'クエリ API エンドポイント'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import {CardSecondary} from '@clickhouse/click-ui/bundled';
import console_api_keys from '@site/static/images/cloud/guides/query-endpoints/console-api-keys.png';
import edit_api_key from '@site/static/images/cloud/guides/query-endpoints/api-key-edit.png';
import specific_locations from '@site/static/images/cloud/guides/query-endpoints/specific-locations.png';
import Link from '@docusaurus/Link'


# クエリ API エンドポイント \{#query-api-endpoints\}

インタラクティブなデータ駆動型アプリケーションを構築するには、高速なデータベース、適切に構造化されたデータ、最適化されたクエリだけでは不十分です。
フロントエンドやマイクロサービスもまた、クエリから返されるデータを、できれば適切に構造化された API を介して、簡単に利用できる必要があります。

**Query API Endpoints** 機能を使用すると、ClickHouse Cloud コンソールで保存した任意の SQL クエリから、直接 API エンドポイントを作成できます。
これにより、ネイティブ ドライバーを使って ClickHouse Cloud サービスに接続することなく、HTTP 経由で API エンドポイントにアクセスして保存済みクエリを実行できます。

## IP アクセス制御 \{#ip-access-control\}

Query API エンドポイントは、API キー単位の IP ホワイトリスト設定に従います。SQL Console と同様に、Query API エンドポイントは ClickHouse のインフラストラクチャ内部からリクエストをプロキシするため、サービスレベルの IP ホワイトリスト設定は適用されません。

どのクライアントが Query API エンドポイントを呼び出せるかを制限するには、次の手順に従います。

<VerticalStepper headerLevel="h4">

#### API キー設定を開く \{#open-settings\}

1. ClickHouse Cloud Console で **Organization** → **API Keys** に移動します

<Image img={console_api_keys} alt="API Keys"/>

2. Query API エンドポイントに使用している API キーの横にある **Edit** をクリックします

<Image img={edit_api_key} alt="Edit"/>

#### 許可する IP アドレスを追加する \{#add-ips\}

1. **Alow access to this API Key** セクションで、**Specific locations** を選択します
2. IP アドレスまたは CIDR 範囲（例: `203.0.113.1` や `203.0.113.0/24`）を入力します
3. 必要に応じて複数のエントリを追加します

<Image img={specific_locations} alt="Specific locations"/>

Query API エンドポイントを作成するには、Admin Console ロールと、適切な権限を持つ API キーが必要です。

</VerticalStepper>

:::tip Guide
いくつかの簡単なステップで Query API エンドポイントをセットアップする手順については、[Query API endpoints guide](/cloud/get-started/query-endpoints) を参照してください。
:::