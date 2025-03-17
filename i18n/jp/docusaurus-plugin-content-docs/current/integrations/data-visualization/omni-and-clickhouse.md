---
sidebar_label: Omni
slug: /integrations/omni
keywords: [clickhouse, Omni, connect, integrate, ui]
description: Omniは、BI、データアプリケーション、埋め込み分析のための企業向けプラットフォームで、リアルタイムで洞察を探求し、共有するのを助けます。
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';


# Omni

Omniは、公式のClickHouseデータソースを介してClickHouse Cloudまたはオンプレミスのデプロイメントに接続できます。

## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. ClickHouseデータソースを作成する {#2-create-a-clickhouse-data-source}

管理者メニューに移動し -> 接続を選択し、右上隅の「接続を追加」ボタンをクリックします。

<img src={omni_01} class="image" alt="新しい接続の追加" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

`ClickHouse`を選択し、フォームに資格情報を入力します。

<img src={omni_02} class="image" alt="資格情報の指定" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

これで、OmniでClickHouseからデータをクエリし、可視化できるようになります。
