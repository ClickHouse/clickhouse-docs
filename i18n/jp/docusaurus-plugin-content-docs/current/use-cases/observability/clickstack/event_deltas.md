---
slug: /use-cases/observability/clickstack/event_deltas
title: 'ClickStack を用いたイベントデルタ'
sidebar_label: 'イベントデルタ'
pagination_prev: null
pagination_next: null
description: 'ClickStack を用いたイベントデルタ'
doc_type: 'guide'
keywords: ['clickstack', 'イベントデルタ', '変更追跡', 'ログ', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import event_deltas from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import event_deltas_no_selected from '@site/static/images/use-cases/observability/event_deltas_no_selected.png';
import event_deltas_highlighted from '@site/static/images/use-cases/observability/event_deltas_highlighted.png';
import event_deltas_selected from '@site/static/images/use-cases/observability/event_deltas_selected.png';
import event_deltas_issue from '@site/static/images/use-cases/observability/event_deltas_issue.png';
import event_deltas_outliers from '@site/static/images/use-cases/observability/event_deltas_outliers.png';
import event_deltas_separation from '@site/static/images/use-cases/observability/event_deltas_separation.png';
import event_deltas_customization from '@site/static/images/use-cases/observability/event_deltas_customization.png';
import event_deltas_inappropriate from '@site/static/images/use-cases/observability/event_deltas_inappropriate.png';

ClickStack のイベントデルタはトレースに特化した機能で、パフォーマンスが悪化した際に「何が変わったのか」を明らかにするためにトレースのプロパティを自動的に分析します。コーパス内で通常時と遅いトレースのレイテンシ分布を比較し、ClickStack はレイテンシ差と最も相関の強い属性 ― 新しいデプロイメントのバージョンなのか、特定のエンドポイントなのか、あるいは特定のユーザー ID なのか ― を強調表示します。

トレースデータを手作業で精査する代わりに、イベントデルタは 2 つのデータサブセット間のレイテンシ差を生み出している主要なプロパティを抽出することで、リグレッションの診断や根本原因の特定をはるかに容易にします。この機能により、生のトレースを可視化しつつ、パフォーマンス変動に影響している要因を即座に把握できるため、インシデント対応のスピードが向上し、平均復旧時間 (MTTR) の短縮につながります。

<Image img={event_deltas} alt="イベントデルタ" size="lg" />

## イベントデルタの使用 \{#using-event-deltas\}

イベントデルタは、`Trace` 型のソースを選択すると、ClickStack の **Search** パネルから直接利用できます。

左上の **Analysis Mode** セレクターで **イベントデルタ** (`Trace` ソースを選択した状態) を選ぶと、スパンを行として表示する標準の結果テーブルから イベントデルタ 表示に切り替わります。

<Image img={event_deltas_no_selected} alt="イベントデルタ が選択されていない状態" size="lg" />

このビューでは、時間に沿った スパン の分布が表示され、量の変化とあわせて レイテンシ がどのように変動するかを確認できます。縦軸は レイテンシ、色はその時点での trace の密度を表します。明るい黄色の領域ほど、trace の集中度が高いことを示します。このビジュアライゼーションにより、スパン が レイテンシ と件数の両面でどのように分布しているかをすばやく把握できるため、パフォーマンスの変化や異常を特定しやすくなります。

<Image img={event_deltas_highlighted} alt="イベントデルタ が強調表示された状態" size="lg" />

次に、ビジュアライゼーション上で領域を選択します。理想的には、duration が長い スパン が多く、十分な密度もある領域を選択し、その後 **Filter by Selection** を実行します。これにより、分析対象の「外れ値」が指定されます。続いて イベントデルタ は、データセットの残りの部分と比較して、この外れ値の子集に含まれる スパン と最も強く関連するカラムおよび主要な値を特定します。意味のある外れ値を含む領域に注目することで、ClickStack はこの子集を全体のコーパスから区別する固有の値を強調し、観測されたパフォーマンスの違いと最も強く相関する 属性 を明らかにします。

<Image img={event_deltas_selected} alt="イベントデルタ が選択された状態" size="lg" />

各カラムについて、ClickStack は選択した外れ値の子集に強く偏っている値を特定します。つまり、ある値がカラムに現れたとき、その値がデータセット全体 (inlier) よりも外れ値の中で主に出現する場合、その値は重要なものとして強調表示されます。偏りが最も強いカラムが先頭に表示されるため、異常な スパン と最も強く関連し、ベースラインの挙動と区別される 属性 が浮かび上がります。

<Image img={event_deltas_outliers} alt="イベントデルタ の外れ値" size="lg" />

たとえば上の例では、`SpanAttributes.app.payment.card_type` カラムが抽出されています。ここでは、イベントデルタ の分析により、inlier の `29%` が MasterCard を使っており、outlier では `0%` である一方、outlier の `100%` が Visa を使っており、inlier では `71%` であることが示されています。これは、Visa のカード種別が異常で レイテンシ の高い trace と強く関連している一方、MasterCard は正常な子集にのみ現れることを示唆しています。

<Image img={event_deltas_issue} alt="イベントデルタ の問題" size="lg" />

逆に、inlier にのみ関連する値が興味深い場合もあります。上の例では、エラー `Visa Cash Full` は inlier にのみ現れ、outlier の スパン にはまったく存在しません。このような場合、レイテンシ は常におよそ 50 milliseconds 未満であり、このエラーが低い レイテンシ と関連していることを示唆しています。

## イベントデルタの仕組み \{#how-event-deltas-work\}

イベントデルタは、選択された外れ値領域と内側のインライヤー領域それぞれに対してクエリを 2 つ発行することで動作します。各クエリは、対応する期間と時間範囲に制限されます。両方の結果セットからイベントのサンプルを抽出して解析し、主に外れ値側で高い割合で特定の値が現れるカラムを特定します。ある値の 100% が外れ値のサブセット内にのみ出現しているカラムが最初に表示され、観測された差異に最も寄与している属性が強調されます。

## グラフのカスタマイズ \{#customizing-the-graph\}

グラフの上部には、ヒートマップの生成方法をカスタマイズできるコントロールがあります。これらのフィールドを調整すると、ヒートマップはリアルタイムで更新され、任意の測定可能な値とその時間経過に伴う頻度との関係をビジュアライゼーション・比較できます。

**デフォルト構成**

デフォルトでは、ビジュアライゼーションは次のように構成されています:

* **Y 軸**: `Duration` — レイテンシ値を縦方向に表示
* **色 (Z 軸)**: `count()` — 時間 (X 軸) に対するリクエスト数を表現

この構成により、時間に対するレイテンシ分布が表示され、色の濃さで各範囲に含まれるイベント数が示されます。

**パラメータの調整**

これらのパラメータを変更して、データのさまざまな側面を探索できます:

* **Value**: Y 軸にプロットする内容を制御します。たとえば、`Duration` をエラー率やレスポンスサイズなどのメトリクスに置き換えることができます。
* **Count**: 色のマッピングを制御します。`count()` (バケットごとのイベント数) から、`avg()`、`sum()`、`p95()` などの別の集約関数、さらには `countDistinct(field)` のようなカスタム式に切り替えることができます。

<Image img={event_deltas_customization} alt="イベントデルタのカスタマイズ" size="lg" />

## 推奨事項 \{#recommendations\}

イベントデルタは、特定のサービスに対象を絞って分析する場合に最も効果を発揮します。複数のサービスにまたがるとレイテンシに大きなばらつきが生じやすく、外れ値に最も影響しているカラムや値を特定しにくくなります。イベントデルタを有効化する前に、レイテンシ分布が同程度になると想定できるスパンの集合に絞り込んでください。特に、広いレイテンシ変動が本来は想定されていない集合を対象に分析することで、より有用な洞察が得られます。逆に、 (異なる 2 つのサービスなど) 大きなばらつきが常態となっているケースは避けてください。

領域を選択する際は、「遅い継続時間」と「速い継続時間」が明確に分布している部分集合を選ぶことを目指してください。これにより、レイテンシの高いスパンを分析のためにきれいに切り出すことができます。たとえば、以下で選択されている領域は、分析対象として一連の遅いスパンを明確に捉えています。

<Image img={event_deltas_separation} alt="イベントデルタ の分離" size="lg" />

逆に、次のデータセットは イベントデルタ を用いて有用な形で分析するのが困難です。

<Image img={event_deltas_inappropriate} alt="イベントデルタ による分離が不十分な例" size="lg" />