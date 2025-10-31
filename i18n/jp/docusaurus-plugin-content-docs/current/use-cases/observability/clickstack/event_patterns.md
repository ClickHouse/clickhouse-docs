---
'slug': '/use-cases/observability/clickstack/event_patterns'
'title': 'ClickStackによるイベントパターン'
'sidebar_label': 'イベントパターン'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStackによるイベントパターン'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

Event patterns in ClickStackでは、大量のログやトレースを素早く理解するために、類似のメッセージを自動的にクラスタリングします。これにより、何百万もの個々のイベントを掘り下げるのではなく、意味のあるグループの少数を確認するだけで済みます。

<Image img={event_patterns} alt="Event patterns" size="lg"/>

これにより、新しいエラーや警告、再発しているもの、またログ量の急増を引き起こしているものを見つけることがはるかに容易になります。パターンは動的に生成されるため、正規表現を定義したり、パースルールを維持したりする必要はありません - ClickStackは、フォーマットに関係なく自動的にイベントに適応します。

インシデントレスポンスを超えて、この高レベルのビューは、コスト削減のために削減できるノイジーログソースを特定し、サービスが生成するさまざまなタイプのログを発見し、システムが既に関心のある信号を発しているかどうかをより迅速に確認するのにも役立ちます。

## Accessing event patterns {#accessing-event-patterns}

イベントパターンは、ClickStackの**Search**パネルを通じて直接利用できます。  

左上の**Analysis Mode**セレクタから、**Event Patterns**を選択すると、標準の結果テーブルから類似イベントのクラスタービューに切り替わります。  

<Image img={event_patterns_highlight} alt="Event patterns" size="lg"/>

これにより、ユーザーが各個のログやトレースをスクロールして確認できるデフォルトの**Results Table**の代替が提供されます。

## Recommendations {#recommendations}

イベントパターンは、データの**絞り込まれたサブセット**に適用することで最も効果的です。たとえば、イベントパターンを有効にする前に単一のサービスに絞り込むと、数千のサービス全体にパターンを適用するよりも、より関連性が高く興味深いメッセージが表出することが一般的です。  

また、異なるIDやペイロードを持つ繰り返しエラーが簡潔なクラスターにグループ化されるため、エラーメッセージを要約するのにも特に強力です。  

ライブの例については、[Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns)でイベントパターンがどのように使用されているかをご覧ください。
