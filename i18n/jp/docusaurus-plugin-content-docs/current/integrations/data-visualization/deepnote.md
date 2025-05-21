---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', 'connect', 'integrate', 'notebook']
description: '非常に大きなデータセットを効率的にクエリし、既知のノートブック環境で分析およびモデリングします。'
title: 'ClickHouseをDeepnoteに接続する'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# ClickHouseをDeepnoteに接続する

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> は、チームが洞察を発見し共有するために構築されたコラボレーティブデータノートブックです。 Jupyter互換であるだけでなく、クラウド上で動作し、データサイエンスプロジェクトに効率的に取り組むための中央の場所を提供します。

このガイドは、すでにDeepnoteアカウントをお持ちで、実行中のClickHouseインスタンスがあることを前提としています。

## インタラクティブな例 {#interactive-example}
ClickHouseからDeepnoteデータノートブックへのクエリのインタラクティブな例を探索したい場合は、以下のボタンをクリックして、[ClickHouseプレイグラウンド](../../getting-started/playground.md)に接続されたテンプレートプロジェクトを起動します。

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Deepnoteで起動" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## ClickHouseに接続する {#connect-to-clickhouse}

1. Deepnote内で、「Integrations」オーバービューを選択し、ClickHouseタイルをクリックします。

<Image size="lg" img={deepnote_01} alt="ClickHouse統合タイル" border />

2. ClickHouseインスタンスの接続詳細を提供します：
<ConnectionDetails />

   <Image size="md" img={deepnote_02} alt="ClickHouse詳細ダイアログ" border />

   **_注:_** ClickHouseへの接続がIPアクセスリストで保護されている場合は、DeepnoteのIPアドレスを許可する必要があるかもしれません。詳細については、[Deepnoteのドキュメント](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)をお読みください。

3. おめでとうございます！ ClickHouseをDeepnoteに統合しました。

## ClickHouse統合を使用する {#using-clickhouse-integration}

1. 最初に、ノートブックの右側にあるClickHouse統合に接続します。

   <Image size="lg" img={deepnote_03} alt="ClickHouse詳細ダイアログ" border />

2. 次に、新しいClickHouseクエリブロックを作成し、データベースをクエリします。 クエリ結果はDataFrameとして保存され、SQLブロックで指定された変数に格納されます。
3. 既存の[SQLブロック](https://docs.deepnote.com/features/sql-cells)をClickHouseブロックに変換することもできます。
