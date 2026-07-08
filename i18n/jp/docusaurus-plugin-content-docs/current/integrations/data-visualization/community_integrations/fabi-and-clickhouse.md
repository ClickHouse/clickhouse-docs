---
sidebar_label: 'Fabi.ai'
slug: /integrations/fabi.ai
keywords: ['clickhouse', 'Fabi.ai', '接続', '統合', 'ノートブック', 'UI', '分析']
description: 'Fabi.ai は、共同でデータ分析を行うためのオールインワンプラットフォームです。SQL、Python、AI、ノーコードを活用して、これまで以上に迅速にダッシュボードやデータワークフローを構築できます'
title: 'ClickHouse を Fabi.ai に接続する'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

<CommunityMaintainedBadge />

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a> は、オールインワンのコラボレーション型データ分析プラットフォームです。SQL、Python、AI、ノーコードを活用して、これまで以上に迅速にダッシュボードやデータワークフローを構築できます。ClickHouse のスケールと処理性能を組み合わせれば、大規模なデータセットを対象とした高性能なダッシュボードを、わずか数分で作成して共有できます。

<Image size="md" img={fabi_01} alt="Fabi.ai のデータ探索およびワークフロープラットフォーム" border />

## 接続情報を確認する \{#gather-your-connection-details\}

<ConnectionDetails />

## Fabi.ai アカウントを作成して ClickHouse に接続する \{#connect-to-clickhouse\}

https://app.fabi.ai/ にアクセスし、ログインするか Fabi.ai アカウントを作成します。

1. アカウントを初めて作成すると、データベースへの接続を求められます。すでにアカウントをお持ちの場合は、任意の Smartbook の左側にあるデータソースパネルをクリックし、Add Data Source を選択します。

   <Image size="lg" img={fabi_02} alt="データソースを追加" border />

2. 次に、接続情報の入力を求められます。

   <Image size="md" img={fabi_03} alt="ClickHouse 認証情報フォーム" border />

3. これで、ClickHouse と Fabi.ai の連携は完了です。

## ClickHouse へのクエリ \{#querying-clickhouse\}

Fabi.ai を ClickHouse に接続したら、任意の [Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks) を開き、SQL セルを作成します。Fabi.ai インスタンスに接続されているデータソースが 1 つだけの場合、SQL セルは自動的に ClickHouse を既定として選択します。複数ある場合は、source ドロップダウンからクエリ対象のデータソースを選択できます。

<Image size="lg" img={fabi_04} alt="ClickHouse へのクエリ" border />

## 参考資料 \{#additional-resources\}

[Fabi.ai](https://www.fabi.ai) のドキュメント: https://docs.fabi.ai/introduction

[Fabi.ai](https://www.fabi.ai) のスタートガイド動画: https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl