---
slug: /use-cases/observability/clickstack/event_deltas
title: 'ClickStack によるイベントデルタ'
sidebar_label: 'イベントデルタ'
pagination_prev: null
pagination_next: null
description: 'ClickStack によるイベントデルタ'
doc_type: 'guide'
keywords: ['clickstack', 'event deltas', 'change tracking', 'logs', 'observability']
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

ClickStack における Event Deltas はトレースに特化した機能であり、パフォーマンスが悪化した際に「何が変わったのか」を明らかにするために、トレースの特性を自動的に解析します。コーパス内で通常のトレースと遅いトレースのレイテンシ分布を比較することで、どの属性が差異と最も強く相関しているかを可視化します。たとえば、新しいデプロイバージョン、特定のエンドポイント、特定のユーザー ID などです。

トレースデータを手作業で精査する代わりに、Event Deltas は 2 つのデータサブセット間のレイテンシ差を生み出している主要な特性を自動的に抽出することで、リグレッションの診断と根本原因の特定をはるかに容易にします。この機能により、生のトレースを可視化してパフォーマンスの変化に影響している要因を即座に確認できるため、インシデント対応を加速し、平均復旧時間を短縮できます。

<Image img={event_deltas} alt="Event Deltas" size="lg" />


## Event Deltasの使用 {#using-event-deltas}

Event Deltasは、ClickStackで`Trace`タイプのソースを選択した際に、**Search**パネルから直接利用できます。

左上の**Analysis Mode**セレクターから**Event Deltas**を選択すると(`Trace`ソースが選択された状態で)、スパンを行として表示する標準の結果テーブルから切り替わります。

<Image
  img={event_deltas_no_selected}
  alt='Event Deltasが選択されていない状態'
  size='lg'
/>

このビューは、時間経過に伴うスパンの分布を表示し、レイテンシがボリュームとともにどのように変化するかを示します。縦軸はレイテンシを表し、色付けは特定の時点におけるトレースの密度を示します。明るい黄色の領域は、トレースの集中度が高いことを表しています。この可視化により、ユーザーはレイテンシとカウントの両方にわたってスパンがどのように分布しているかを素早く確認でき、パフォーマンスの変化や異常を特定しやすくなります。

<Image
  img={event_deltas_highlighted}
  alt='Event Deltasがハイライトされた状態'
  size='lg'
/>

ユーザーは可視化の領域を選択できます。理想的には、より長い期間のスパンと十分な密度を持つ領域を選択し、その後**Filter by Selection**を実行します。これにより、分析対象となる「外れ値」が指定されます。Event Deltasは、この外れ値サブセット内のスパンに最も関連する列とキー値を、データセットの残りの部分と比較して特定します。意味のある外れ値を持つ領域に焦点を当てることで、ClickStackはこのサブセットを全体のコーパスから区別する固有の値を強調表示し、観測されたパフォーマンス差と最も相関性の高い属性を明らかにします。

<Image img={event_deltas_selected} alt='Event Deltasが選択された状態' size='lg' />

各列について、ClickStackは選択された外れ値サブセットに強く偏った値を特定します。言い換えれば、列に値が現れた際、その値が全体のデータセット(正常値)ではなく外れ値内に主に出現する場合、それは重要なものとして強調表示されます。最も強い偏りを持つ列が最初にリストされ、異常なスパンと最も強く関連する属性を明らかにし、ベースライン動作から区別します。

<Image img={event_deltas_outliers} alt='Event Deltasの外れ値' size='lg' />

上記の例では、`SpanAttributes.app.payment.card_type`列が明らかにされています。ここで、Event Deltas分析は、正常値の`29%`がMasterCardを使用し、外れ値では`0%`であることを示しています。一方、外れ値の`100%`がVisaを使用しており、正常値では`71%`です。これは、Visaカードタイプが異常な高レイテンシのトレースと強く関連していることを示唆しており、MasterCardは正常なサブセットにのみ現れています。

<Image img={event_deltas_issue} alt='Event Deltasの問題' size='lg' />

逆に、正常値のみに関連する値も興味深い場合があります。上記の例では、エラー`Visa Cash Full`は正常値にのみ現れ、外れ値のスパンには全く存在しません。これが発生する場合、レイテンシは常に約50ミリ秒未満であり、このエラーが低レイテンシと関連していることを示唆しています。


## Event Deltasの仕組み {#how-event-deltas-work}

Event Deltasは2つのクエリを発行することで動作します。1つは選択された外れ値領域に対するクエリ、もう1つは正常値領域に対するクエリです。各クエリは適切な期間と時間枠に制限されます。次に、両方の結果セットからイベントのサンプルが検査され、外れ値に集中して出現する値を持つカラムが特定されます。ある値の100%が外れ値サブセットにのみ出現するカラムが最初に表示され、観測された差異の主な原因となっている属性が強調されます。


## グラフのカスタマイズ {#customizing-the-graph}

グラフの上部には、ヒートマップの生成方法をカスタマイズするためのコントロールがあります。これらのフィールドを調整すると、ヒートマップがリアルタイムで更新され、任意の測定可能な値と時系列での頻度との関係を可視化し比較することができます。

**デフォルト設定**

デフォルトでは、可視化に以下が使用されます:

- **Y軸**: `Duration` — レイテンシ値を縦方向に表示
- **色（Z軸）**: `count()` — 時系列（X軸）におけるリクエスト数を表現

この設定では、時系列でのレイテンシ分布が表示され、色の濃淡が各範囲内に含まれるイベント数を示します。

**パラメータの調整**

これらのパラメータを変更することで、データのさまざまな側面を探索できます:

- **Value**: Y軸にプロットする内容を制御します。例えば、`Duration`をエラー率やレスポンスサイズなどのメトリクスに置き換えることができます。
- **Count**: 色のマッピングを制御します。`count()`（バケットごとのイベント数）から、`avg()`、`sum()`、`p95()`などの他の集計関数、または`countDistinct(field)`のようなカスタム式に切り替えることができます。

<Image
  img={event_deltas_customization}
  alt='イベントデルタのカスタマイズ'
  size='lg'
/>


## 推奨事項 {#recommendations}

Event Deltasは、特定のサービスに焦点を絞った分析を行う場合に最も効果を発揮します。複数のサービス間ではレイテンシが大きく異なる可能性があるため、外れ値の主な原因となっている列や値を特定することが困難になります。Event Deltasを有効にする前に、レイテンシの分布が類似していると予想されるセットにスパンをフィルタリングしてください。最も有用な洞察を得るには、レイテンシの大きな変動が想定されないセットを分析対象とし、それが通常の状態である場合(例:2つの異なるサービス)は避けるようにしてください。

領域を選択する際は、遅い処理時間と速い処理時間の明確な分布が見られるサブセットを選ぶようにしてください。これにより、高レイテンシのスパンを分析用に明確に分離できます。例えば、以下で選択されている領域は、分析対象となる遅いスパンのセットを明確に捉えています。

<Image img={event_deltas_separation} alt='Event Deltas Separation' size='lg' />

逆に、以下のデータセットはEvent Deltasを使った有用な分析が困難です。

<Image
  img={event_deltas_inappropriate}
  alt='Event Deltas Poor seperation'
  size='lg'
/>
