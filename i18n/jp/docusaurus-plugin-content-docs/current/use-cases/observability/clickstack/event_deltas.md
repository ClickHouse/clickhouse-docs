---
slug: /use-cases/observability/clickstack/event_deltas
title: 'ClickStack を用いたイベント差分'
sidebar_label: 'イベント差分'
pagination_prev: null
pagination_next: null
description: 'ClickStack を用いたイベント差分'
doc_type: 'guide'
keywords: ['clickstack', 'イベント差分', '変更追跡', 'ログ', 'オブザーバビリティ']
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

ClickStack における Event Deltas はトレースに特化した機能で、トレースのプロパティを自動的に分析し、パフォーマンスが悪化したときに「何が変わったのか」を明らかにします。正常なトレースと遅いトレースのレイテンシ分布を同一データセット内で比較することで、ClickStack は差分と最も強く相関付けられている属性を強調表示します。たとえば、新しいデプロイメントのバージョン、特定のエンドポイント、あるいは特定のユーザー ID などです。

トレースデータを手作業で詳細に調査する代わりに、Event Deltas は 2 つのデータサブセット間でレイテンシの違いを引き起こしている主要な属性を抽出して提示し、リグレッションの診断と根本原因の特定をはるかに容易にします。この機能により、生のトレースを可視化しつつ、パフォーマンスの変化に影響を与えている要因を即座に確認できるため、インシデント対応を加速し、平均復旧時間 (MTTR) を短縮できます。

<Image img={event_deltas} alt="Event Deltas" size="lg" />


## イベントデルタの使用 {#using-event-deltas}

イベントデルタは、ClickStack の **Search** パネルでソースに `Trace` タイプを選択した場合に、そのまま利用できます。

左上の **Analysis Mode** セレクタから（`Trace` ソースが選択された状態で）**Event Deltas** を選択すると、行として span を表示する標準の結果テーブルから、このビューに切り替えられます。

<Image img={event_deltas_no_selected} alt="Event Deltas が未選択の状態" size="lg"/>

このビューでは、時間に対する span の分布を表示し、レイテンシが件数とともにどのように変化するかを示します。縦軸はレイテンシを表し、色はその時点における trace の密度を示します。より明るい黄色の領域は、trace の集中度が高いことを意味します。この可視化により、ユーザーは span がレイテンシと件数の両方の観点からどのように分布しているかをすばやく把握でき、パフォーマンスの変化や異常を特定しやすくなります。

<Image img={event_deltas_highlighted} alt="Event Deltas がハイライトされた状態" size="lg"/>

次にユーザーは、可視化上の領域（理想的には、より長い duration の span があり、十分な密度がある領域）を選択し、その後 **Filter by Selection** をクリックできます。これにより、その領域が分析対象の「外れ値」として指定されます。イベントデルタは、その外れ値サブセットと残りのデータセットを比較し、これらの span と最も関連しているカラムと主要な値を特定します。意味のある外れ値が存在する領域にフォーカスすることで、ClickStack はこのサブセットを全体のデータセットから区別する固有の値を強調し、観測されたパフォーマンス差と最も相関付けられている属性を浮かび上がらせます。

<Image img={event_deltas_selected} alt="Event Deltas で領域が選択された状態" size="lg"/>

各カラムごとに、ClickStack は選択された外れ値サブセットに強く偏っている値を特定します。言い換えると、ある値がカラムに現れたとき、それが全体のデータセット（インライヤー）ではなく主に外れ値の中で発生している場合、その値は重要なものとしてハイライトされます。最も強いバイアスを持つカラムが先頭にリストされ、異常な span と最も強く関連付けられ、ベースラインの挙動と区別する属性が優先的に表示されます。

<Image img={event_deltas_outliers} alt="Event Deltas の外れ値" size="lg"/>

上記の例では、`SpanAttributes.app.payment.card_type` カラムが抽出されています。ここでイベントデルタの分析は、インライヤーの `29%` が MasterCard を使用しており、外れ値では `0%` である一方、外れ値の `100%` が Visa を使用し、インライヤーでは `71%` であることを示しています。これは、Visa のカードタイプが異常で高レイテンシな trace と強く関連付けられている一方で、MasterCard は通常のサブセットにのみ現れていることを示唆します。

<Image img={event_deltas_issue} alt="Event Deltas の問題例" size="lg"/>

逆に、インライヤーにのみ関連付けられている値も興味深い場合があります。上記の例では、エラー `Visa Cash Full` はインライヤーにのみ現れ、外れ値の span にはまったく現れません。このような場合には、レイテンシは常におよそ 50 ミリ秒未満であり、このエラーが低レイテンシと関連付けられていることを示唆しています。



## Event Deltas の仕組み {#how-event-deltas-work}

Event Deltas は、2 つのクエリを発行することで動作します。1 つは選択された外れ値領域用、もう 1 つはインライヤー領域用です。各クエリは、それぞれに適切な期間と時間ウィンドウに制限されます。続いて、両方の結果セットからイベントのサンプルが検査され、値の出現が高い集中度で主に外れ値側に見られるカラムが特定されます。値の 100% が外れ値サブセットにのみ出現するカラムが最初に表示され、観測された差異に最も寄与している属性が強調されます。



## グラフのカスタマイズ {#customizing-the-graph}

グラフの上部には、ヒートマップの生成方法をカスタマイズできるコントロールがあります。これらの項目を調整すると、ヒートマップはリアルタイムに更新され、任意の計測可能な値と、その時間経過に伴う出現頻度との関係を可視化・比較できます。

**デフォルト設定**

デフォルトでは、ビジュアライゼーションは次のように設定されています:

- **Y Axis**: `Duration` — 垂直方向にレイテンシの値を表示
- **Color (Z Axis)**: `count()` — 時間方向（X 軸）に対するリクエスト数を表現

この構成により、時間経過に伴うレイテンシ分布が表示され、各範囲に含まれるイベント数が色の濃淡で示されます。

**パラメータの調整**

これらのパラメータを変更することで、データのさまざまな側面を探索できます:

- **Value**: Y 軸にプロットする内容を制御します。たとえば、`Duration` をエラーレートやレスポンスサイズといったメトリクスに置き換えることができます。
- **Count**: 色付け（カラーマッピング）を制御します。`count()`（バケットごとのイベント数）から、`avg()`、`sum()`、`p95()` などの別の集計関数、あるいは `countDistinct(field)` のようなカスタム式に切り替えることができます。

<Image img={event_deltas_customization} alt="Event Deltas のカスタマイズ" size="lg"/>



## 推奨事項 {#recommendations}

Event Deltas は、特定のサービスにフォーカスして分析する場合に最も効果的です。複数サービス間ではレイテンシが大きく異なり得るため、外れ値に最も寄与している列や値を特定しづらくなります。Event Deltas を有効化する前に、レイテンシ分布が類似していると想定できるスパンの集合に絞り込んでください。最も有用なインサイトを得るには、レイテンシの大きなばらつきが本来想定されない集合を対象に分析し、2 つの異なるサービス間の比較のように、それが通常であるケースは避けてください。

領域を選択する際は、遅いレイテンシと速いレイテンシの分布が明確に分かれている部分集合を狙うとよいでしょう。これにより、高レイテンシのスパンを明確に切り出して分析できます。たとえば、以下で選択されている領域は、分析対象として明確に遅いスパンの集合を捉えています。

<Image img={event_deltas_separation} alt="Event Deltas Separation" size="lg"/>

逆に、次のデータセットは Event Deltas を用いて有用な形で分析することが難しい例です。

<Image img={event_deltas_inappropriate} alt="Event Deltas Poor seperation" size="lg"/>
