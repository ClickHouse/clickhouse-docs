---
sidebar_label: Deepnote
sidebar_position: 11
slug: /integrations/deepnote
keywords: [clickhouse, Deepnote, connect, integrate, notebook]
description: 非常に大きなデータセットを効率的にクエリし、知っているノートブック環境で分析とモデル化を行います。
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouseをDeepnoteに接続する

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a>は、チームが洞察を発見し共有するために構築された共同データノートブックです。Jupyter互換であるだけでなく、クラウド上で動作し、データサイエンスプロジェクトを効率的に共同作業するための中央の場所を提供します。

このガイドでは、すでにDeepnoteアカウントを持っており、実行中のClickHouseインスタンスがあることを前提としています。

## インタラクティブな例 {#interactive-example}
DeepnoteデータノートブックからClickHouseをクエリするインタラクティブな例を探りたい場合は、以下のボタンをクリックして、[ClickHouseプレイグラウンド](../../getting-started/playground.md)に接続されたテンプレートプロジェクトを起動してください。

[<img src="https://deepnote.com/buttons/launch-in-deepnote.svg"/>](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## ClickHouseに接続する {#connect-to-clickhouse}

1. Deepnote内で「インテグレーション」概要を選択し、ClickHouseタイルをクリックします。

<img src={deepnote_01} class="image" alt="ClickHouseのインテグレーションタイル" style={{width: '100%'}}/>

2. ClickHouseインスタンスの接続詳細を提供します：
<ConnectionDetails />

   <img src={deepnote_02} class="image" alt="ClickHouseの詳細ダイアログ" style={{width: '100%'}}/>

   **_注:_** ClickHouseへの接続がIPアクセスリストで保護されている場合は、DeepnoteのIPアドレスを許可する必要があります。詳細については[Deepnoteのドキュメント](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)をお読みください。
3. おめでとうございます！これでClickHouseがDeepnoteに統合されました。

## ClickHouseインテグレーションの使用方法 {#using-clickhouse-integration}

1. まず、ノートブックの右側でClickHouseインテグレーションに接続します。

   <img src={deepnote_03} class="image" alt="ClickHouseの詳細ダイアログ" style={{width: '100%'}}/>

2. 次に、新しいClickHouseクエリブロックを作成し、データベースをクエリします。クエリの結果はDataFrameとして保存され、SQLブロックで指定された変数に格納されます。
3. 既存の[SQLブロック](https://docs.deepnote.com/features/sql-cells)をClickHouseブロックに変換することもできます。
