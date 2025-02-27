---
sidebar_label: Omni
slug: /integrations/omni
keywords: [clickhouse, Omni, 接続, 統合, UI]
description: Omniは、リアルタイムで洞察を探求し共有するのを支援するBI、データアプリケーション、および埋め込み分析のためのエンタープライズプラットフォームです。
---

import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Omni

Omniは、公式のClickHouseデータソースを介してClickHouse Cloudまたはオンプレミスのデプロイメントに接続できます。

## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. ClickHouseデータソースを作成する {#2-create-a-clickhouse-data-source}

Admin -> Connectionsに移動し、右上の「接続追加」ボタンをクリックします。

<img src={require('./images/omni_01.png').default} class="image" alt="新しい接続の追加" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

`ClickHouse`を選択します。フォームに資格情報を入力します。

<img src={require('./images/omni_02.png').default} class="image" alt="資格情報の指定" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

これで、OmniでClickHouseからデータをクエリして視覚化できるようになります。
