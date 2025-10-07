---
'slug': '/use-cases/observability/clickstack/event_deltas'
'title': 'ClickStackによるイベントデルタ'
'sidebar_label': 'イベントデルタ'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStackによるイベントデルタ'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import event_deltas from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import event_deltas_no_selected from '@site/static/images/use-cases/observability/event_deltas_no_selected.png';
import event_deltas_highlighted from '@site/static/images/use-cases/observability/event_deltas_highlighted.png';
import event_deltas_selected from '@site/static/images/use-cases/observability/event_deltas_selected.png';
import event_deltas_issue from '@site/static/images/use-cases/observability/event_deltas_issue.png';
import event_deltas_outliers from '@site/static/images/use-cases/observability/event_deltas_outliers.png';
import event_deltas_separation from '@site/static/images/use-cases/observability/event_deltas_separation.png';
import event_deltas_inappropriate from '@site/static/images/use-cases/observability/event_deltas_inappropriate.png';

Event Deltas in ClickStackは、トレースの特徴を自動的に分析して、パフォーマンスが低下した際に何が変わったのかを明らかにするトレース焦点の機能です。コーパス内の通常のトレースと遅いトレースの待機時間分布を比較することで、ClickStackは、新しいデプロイメントバージョン、特定のエンドポイント、または特定のユーザーIDなど、どの属性が違いと最も相関しているかを強調します。

手動でトレースデータを選別する代わりに、イベントデルタは2つのデータサブセット間の待機時間の違いを引き起こす主要な属性を浮かび上がらせ、回帰の診断を容易にし、根本原因を特定しやすくします。この機能により、生のトレースを可視化し、パフォーマンスの変動に影響を与える要因を即座に確認でき、インシデント対応を加速し、平均解決時間を短縮します。

<Image img={event_deltas} alt="イベントデータ" size="lg"/>

## イベントデルタの使用 {#using-event-deltas}

イベントデルタは、ClickStack内で`Trace`タイプのソースを選択する際に、**Search**パネルから直接利用可能です。

左上の**Analysis Mode**セレクタから、**Event Deltas**（`Trace`ソースが選択されている）を選んで、スパンを行として表示する標準結果テーブルから切り替えます。

<Image img={event_deltas_no_selected} alt="イベントデータが選択されていない" size="lg"/>

このビューは、時間に対するスパンの分布を表示し、待機時間がボリュームとどのように変動するかを示します。縦軸は待機時間を表し、色付けは特定のポイントでのトレースの密度を示します。明るい黄色の領域は、高いトレース濃度に対応します。この可視化により、ユーザーは待機時間とカウントの両方にわたるスパンの分布を迅速に確認でき、パフォーマンスの変化や異常を特定しやすくなります。

<Image img={event_deltas_highlighted} alt="イベントデータが強調表示されている" size="lg"/>

その後、ユーザーは可視化の領域を選択し（理想的には、長い持続時間のスパンと十分な密度を持つもの）、**Filter by Selection**を選択します。これにより、分析のための「外れ値」が指定されます。イベントデルタは、選択した外れ値のサブセットにおけるこれらのスパンに最も関連するカラムとキー値を特定します。意義のある外れ値を持つ領域に焦点を当てることで、ClickStackは全体のコーパスからこのサブセットを区別するユニークな値を強調し、観察されたパフォーマンスの違いと最も相関する属性を明らかにします。

<Image img={event_deltas_selected} alt="イベントデータが選択されている" size="lg"/>

各カラムについて、ClickStackは選択された外れ値のサブセットに対して強く偏った値を特定します。言い換えれば、カラムに値が出現した場合、それが外れ値の中で主に発生している場合は重要として強調されます。 最も強い偏りのあるカラムは最初にリストされ、異常なスパンと通常の挙動を区別します。

<Image img={event_deltas_outliers} alt="イベントデータの外れ値" size="lg"/>

上の例では、`SpanAttributes.app.payment.card_type`カラムが浮かび上がっています。ここでは、イベントデルタ分析が、内れつの`29%`がMasterCardを使用し、外れ値では`0%`、外れ値の`100%`がVisaを使用していることを示しています。これは、Visaカードタイプが異常な高待機時間トレースと強く関連していることを示唆しており、MasterCardは通常のサブセット内にのみ存在するようです。

<Image img={event_deltas_issue} alt="イベントデータの問題" size="lg"/>

逆に、内れつと独占的に関連している値も興味深い場合があります。上の例では、エラー`Visa Cash Full`は内れつにのみ発生し、外れ値のスパンには完全に存在しません。このような場合待機時間は常に約50ミリ秒未満であり、このエラーは低待機時間に関連していることを示唆しています。

## イベントデルタの動作原理 {#how-event-deltas-work}

イベントデルタは、選択された外れ値領域と内れつ領域の2つのクエリを発行することによって機能します。各クエリは適切な持続時間と時間ウィンドウに制限されます。両方の結果セットからイベントのサンプルが検査され、値の高い集中が外れ値に主に発生しているカラムが特定されます。値の100%が外れ値のサブセットにのみ発生するカラムが最初に表示され、観察された違いに最も責任を持つ属性を強調します。

## 推奨事項 {#recommendations}

イベントデルタは、特定のサービスに焦点を当てた分析で最も効果を発揮します。複数のサービス間の待機時間は大きく異なる場合があるため、外れ値のために最も責任があるカラムと値を特定するのが難しくなります。イベントデルタを有効にする前に、待機時間の分布が似ていると予想されるセットにスパンをフィルタリングします。最も有用なインサイトのためには、待機時間の広範な変動が予測されないセットを分析することを目指し、通常であるケース（例：2つの異なるサービス）を避けます。

範囲を選択する際に、ユーザーは明確な遅延と速い持続時間の分布があるサブセットを狙うべきです。これにより、高待機時間のスパンを分析のためにクリーンに分離できます。例えば、以下に選択された領域は、分析のために遅いスパンのセットを明確に捕らえています。

<Image img={event_deltas_separation} alt="イベントデータの分離" size="lg"/>

逆に、以下のデータセットはイベントデルタを用いて有用に分析するのが困難です。

<Image img={event_deltas_inappropriate} alt="イベントデータの不適切な分離" size="lg"/>
