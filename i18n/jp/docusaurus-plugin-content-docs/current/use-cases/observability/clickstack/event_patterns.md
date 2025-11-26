---
slug: /use-cases/observability/clickstack/event_patterns
title: 'ClickStack を使ったイベントパターン'
sidebar_label: 'イベントパターン'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使ったイベントパターン'
doc_type: 'guide'
keywords: ['clickstack', 'event patterns', 'log analysis', 'pattern matching', 'observability']
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

ClickStack のイベントパターン機能を使用すると、類似したメッセージを自動的にクラスタリングすることで、大量のログやトレースの内容をすばやく把握できます。これにより、数百万件の個々のイベントを精査する代わりに、意味のある少数のグループだけを確認すればよくなります。

<Image img={event_patterns} alt="イベントパターン" size="lg" />

これにより、どのエラーや警告が新規なのか、どれが繰り返し発生しているのか、どれがログボリュームの急増を引き起こしているのかを、はるかに簡単に把握できます。パターンは動的に生成されるため、正規表現を定義したりパースルールを保守したりする必要はありません。ClickStack がイベントの形式にかかわらず自動的に適応します。

インシデント対応にとどまらず、このような高レベルなビューは、コスト削減のためにノイズの多いログソースを特定して削減したり、サービスが生成しているログの種類を把握したり、システムがすでに重要なシグナルを出しているかどうかをより迅速に判断するのにも役立ちます。


## イベントパターンへのアクセス {#accessing-event-patterns}

イベントパターンは、ClickStack の **Search** パネルから直接利用できます。  

左上にある **Analysis Mode** セレクターで **Event Patterns** を選択すると、標準の結果テーブルビューではなく、類似したイベントがクラスタリングされたビューに切り替わります。  

<Image img={event_patterns_highlight} alt="Event patterns" size="lg"/>

これは、すべての個々のログやトレースをスクロールして確認するデフォルトの **Results Table** に代わる表示方法です。



## 推奨事項 {#recommendations}

イベントパターンは、データの**絞り込まれたサブセット**に適用したときに最も効果的です。たとえば、まず特定の 1 つのサービスにまでフィルタリングしてからイベントパターンを有効にすると、最初から何千ものサービス全体にパターンを適用する場合と比べて、より関連性が高く興味深いメッセージが得られることがほとんどです。  

また、エラーメッセージの要約にも特に有効で、ID やペイロードが異なる同種のエラーを、簡潔なクラスターにまとめることができます。  

実際の利用例については、[Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns) でイベントパターンがどのように使われているかを参照してください。
