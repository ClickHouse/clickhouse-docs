---
slug: /use-cases/observability/clickstack/service-maps
title: 'サービスマップ'
sidebar_label: 'サービスマップ'
pagination_prev: null
pagination_next: null
description: 'ClickStackのサービスマップを使用して、サービスの依存関係とリクエストフローを可視化します。'
doc_type: 'guide'
keywords: ['clickstack', 'サービスマップ', 'トポロジー', 'トレース', '依存関係', '分散トレーシング', 'オブザーバビリティ', 'リクエストグラフ']
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import service_map_overview from '@site/static/images/clickstack/service-maps/service-map-overview.png';
import service_map_demo from '@site/static/images/clickstack/service-maps/service-map-demo.mp4';
import source_selector from '@site/static/images/clickstack/service-maps/source-selector.png';
import sampling from '@site/static/images/clickstack/service-maps/sampling.png';
import date_selector from '@site/static/images/clickstack/service-maps/date-selector.png';

<BetaBadge />

サービスマップは、サービス同士がどのようにやり取りしているかを可視化します。ClickStack は、同じトレース内のクライアントスパン (送信リクエスト) とサーバースパン (受信リクエスト) を対応付けることでグラフを構築し、サービス間のリクエスト経路を再現します。

左側のナビゲーションパネルで **Service Map** をクリックすると、グラフ全体を表示できます。OpenTelemetry で[トレースデータを取り込む](/use-cases/observability/clickstack/ingesting-data)と、サービスが表示されるようになります。

<Image img={service_map_overview} alt="サービスノードとその間のリクエストフローを示すサービスマップ" size="lg" />

## サービスマップを確認する \{#exploring-the-service-map\}

各ノードはサービスを表し、`service.name` リソース属性によって識別されます。エッジ (破線) は、あるサービスのクライアントスパンが別のサービスのサーバースパンに対応している関係を示します。ノードの大きさは相対的なトラフィック量を反映し、赤いノードは選択したタイムレンジでエラーが発生しているサービスを示します。

マップ上部のツールバーでは、表示のフィルタリングや調整を行えます。

**ソースセレクター** — マップを特定のトレースソース (例: &quot;ClickPy Traces&quot;) に絞り込みます。

<Image img={source_selector} alt="サービスマップのツールバーでソースセレクターが強調表示されている" size="lg" />

**サンプリングスライダー** — パフォーマンスと精度のバランスを取るためにサンプリング率を調整します。トラフィック量の多いクラスターでは、低いサンプリング率のほうが高速に読み込めます。

<Image img={sampling} alt="サービスマップのツールバーでサンプリングスライダーが強調表示されている" size="lg" />

**日付範囲ピッカー** — マップの構築に使用するトレースデータのタイムレンジを設定します。

<Image img={date_selector} alt="サービスマップのツールバーで日付範囲ピッカーが強調表示されている" size="lg" />

マップ左下の **+/-** ボタン、またはスクロール操作で拡大・縮小します。

## トレースレベルのサービスマップ \{#trace-level-service-maps\}

個々のトレースを確認すると、そのリクエストがサービス間をどのように移動したかを示すサービスマップが表示されます。これにより、トレースのウォーターフォールを離れることなく、単一リクエストのトポロジーを確認できます。

<video src={service_map_demo} autoPlay loop muted playsInline width="100%" />