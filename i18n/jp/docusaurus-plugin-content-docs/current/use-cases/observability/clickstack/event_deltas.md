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

ClickStack の Event Deltas はトレースに特化した機能で、パフォーマンスが悪化した際に「何が変わったのか」を明らかにするためにトレースのプロパティを自動的に分析します。コーパス内で通常時と遅いトレースのレイテンシ分布を比較し、ClickStack はレイテンシ差と最も相関の強い属性 ― 新しいデプロイメントのバージョンなのか、特定のエンドポイントなのか、あるいは特定のユーザー ID なのか ― を強調表示します。

トレースデータを手作業で精査する代わりに、Event Deltas は 2 つのデータサブセット間のレイテンシ差を生み出している主要なプロパティを抽出することで、リグレッションの診断や根本原因の特定をはるかに容易にします。この機能により、生のトレースを可視化しつつ、パフォーマンス変動に影響している要因を即座に把握できるため、インシデント対応のスピードが向上し、平均復旧時間 (MTTR) の短縮につながります。

<Image img={event_deltas} alt="Event Deltas" size="lg" />


## Event Deltas の使用方法 \{#using-event-deltas\}

Event Deltas は、ClickStack の **Search** パネルでソースに `Trace` タイプを選択した場合に直接利用できます。

左上の **Analysis Mode** セレクタから、（`Trace` ソースを選択した状態で）**Event Deltas** を選択すると、スパンが行として表示される標準の結果テーブルから、このモードに切り替えられます。

<Image img={event_deltas_no_selected} alt="Event Deltas が未選択の状態" size="lg"/>

このビューでは、スパンの時間経過に伴う分布が描画され、レイテンシがボリュームと併せてどのように変化するかを示します。縦軸はレイテンシを表し、色は特定のポイントにおけるトレースの密度を示します。明るい黄色の領域ほどトレースの集中度が高いことを意味します。この可視化により、スパンがレイテンシと件数の両方の観点でどのように分布しているかを迅速に確認でき、性能の変化や異常が特定しやすくなります。

<Image img={event_deltas_highlighted} alt="Event Deltas がハイライトされた状態" size="lg"/>

その後、可視化上の領域（理想的にはスパンの継続時間が長く、十分な密度がある領域）を選択し、続けて **Filter by Selection** を実行できます。これにより、その領域が分析対象の「外れ値」として指定されます。Event Deltas は、その後、この外れ値サブセット内のスパンと残りのデータセットを比較し、これらのスパンに最も関連するカラムとキー値を特定します。意味のある外れ値が存在する領域にフォーカスすることで、ClickStack はこのサブセットを全体のコーパスから区別するユニークな値を強調表示し、観測された性能差と最も相関付けられた属性を抽出します。

<Image img={event_deltas_selected} alt="Event Deltas で領域が選択された状態" size="lg"/>

各カラムについて、ClickStack は選択された外れ値サブセットに対して強いバイアスを持つ値を特定します。言い換えると、ある値がカラムに現れるとき、それが全体のデータセット（インライヤー）よりも外れ値内で主に発生している場合、その値は重要なものとしてハイライトされます。バイアスが最も強いカラムが先に一覧表示され、異常なスパンと最も強く関連する属性が表面化され、ベースラインの挙動との差異が明確になります。

<Image img={event_deltas_outliers} alt="Event Deltas の外れ値" size="lg"/>

例えば上記の例では、`SpanAttributes.app.payment.card_type` カラムが表面化されています。ここで Event Deltas の分析によると、インライヤーの `29%` が MasterCard を使用している一方で、外れ値では `0%`、これに対して外れ値の `100%` が Visa を使用しており、インライヤーでは `71%` にとどまっています。これは、Visa のカード種別が異常で高レイテンシなトレースと強く関連付けられているのに対し、MasterCard は通常のサブセットのみに現れることを示唆しています。

<Image img={event_deltas_issue} alt="Event Deltas で特定された問題" size="lg"/>

逆に、インライヤーのみに関連する値も興味深い場合があります。上記の例では、エラー `Visa Cash Full` がインライヤーのみに現れ、外れ値のスパンには一切存在しません。このような状況では、レイテンシは常におおよそ 50 ミリ秒未満であり、このエラーが低レイテンシと関連付けられていることを示唆しています。

## Event Delta の仕組み \{#how-event-deltas-work\}

Event Delta は、選択された外れ値領域と内側のインライヤー領域それぞれに対してクエリを 2 つ発行することで動作します。各クエリは、対応する期間と時間範囲に制限されます。両方の結果セットからイベントのサンプルを抽出して解析し、主に外れ値側で高い割合で特定の値が現れる列を特定します。ある値の 100% が外れ値のサブセット内にのみ出現している列が最初に表示され、観測された差異に最も寄与している属性が強調されます。

## グラフのカスタマイズ \{#customizing-the-graph\}

グラフの上部には、ヒートマップの生成方法をカスタマイズできるコントロールがあります。これらのフィールドを調整すると、ヒートマップはリアルタイムで更新され、任意の測定可能な値とその時間経過に伴う頻度との関係を可視化・比較できます。

**デフォルト構成**

デフォルトでは、可視化は次のように構成されています:

- **Y 軸**: `Duration` — レイテンシ値を縦方向に表示
- **色 (Z 軸)**: `count()` — 時間 (X 軸) に対するリクエスト数を表現

この構成により、時間に対するレイテンシ分布が表示され、色の濃さで各範囲に含まれるイベント数が示されます。

**パラメータの調整**

これらのパラメータを変更して、データのさまざまな側面を探索できます:

- **Value**: Y 軸にプロットする内容を制御します。たとえば、`Duration` をエラー率やレスポンスサイズなどのメトリクスに置き換えることができます。
- **Count**: 色のマッピングを制御します。`count()` (バケットごとのイベント数) から、`avg()`、`sum()`、`p95()` などの別の集約関数、さらには `countDistinct(field)` のようなカスタム式に切り替えることができます。

<Image img={event_deltas_customization} alt="イベントデルタのカスタマイズ" size="lg"/>

## 推奨事項 \{#recommendations\}

Event Deltas は、特定のサービスに対象を絞って分析する場合に最も効果を発揮します。複数のサービスにまたがるとレイテンシーに大きなばらつきが生じやすく、外れ値に最も影響しているカラムや値を特定しにくくなります。Event Deltas を有効化する前に、レイテンシー分布が同程度になると想定できるスパンの集合に絞り込んでください。特に、広いレイテンシー変動が本来は想定されていない集合を対象に分析することで、より有用な洞察が得られます。逆に、（異なる 2 つのサービスなど）大きなばらつきが常態となっているケースは避けてください。

領域を選択する際は、「遅い継続時間」と「速い継続時間」が明確に分布している部分集合を選ぶことを目指してください。これにより、レイテンシーの高いスパンを分析のためにきれいに切り出すことができます。たとえば、以下で選択されている領域は、分析対象として一連の遅いスパンを明確に捉えています。

<Image img={event_deltas_separation} alt="Event Deltas の分離" size="lg"/>

逆に、次のデータセットは Event Deltas を用いて有用な形で分析するのが困難です。

<Image img={event_deltas_inappropriate} alt="Event Deltas による分離が不十分な例" size="lg"/>