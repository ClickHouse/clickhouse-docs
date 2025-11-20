---
slug: /use-cases/observability/clickstack/event_patterns
title: 'ClickStack を用いたイベントパターン'
sidebar_label: 'イベントパターン'
pagination_prev: null
pagination_next: null
description: 'ClickStack を用いたイベントパターン'
doc_type: 'guide'
keywords: ['clickstack', 'event patterns', 'log analysis', 'pattern matching', 'observability']
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

ClickStack のイベントパターンは、類似したメッセージを自動的にクラスタリングすることで、大量のログやトレースをすばやく把握できるようにし、数百万件の個々のイベントを精査する代わりに、意味のある少数のグループだけを確認すればよいようにしてくれます。

<Image img={event_patterns} alt="イベントパターン" size="lg" />

これにより、どのエラーや警告が新しいものか、どれが繰り返し発生しているか、どれがログボリュームの急増を引き起こしているかを、はるかに簡単に見分けられます。パターンは動的に生成されるため、正規表現を定義したりパースルールを保守したりする必要はありません。フォーマットに依存せず、ClickStack が自動的にイベントに適応します。

インシデント対応にとどまらず、この高レベルなビューは、コスト削減のために削減可能なノイズの多いログソースを特定したり、サービスがどのような種類のログを出力しているかを把握したり、システムがすでに重要なシグナルを出しているかどうかをより迅速に判断したりするのにも役立ちます。


## イベントパターンへのアクセス {#accessing-event-patterns}

イベントパターンは、ClickStackの**検索**パネルから直接利用できます。

左上の**分析モード**セレクターから**イベントパターン**を選択すると、標準の結果テーブルから類似イベントのクラスター表示に切り替わります。

<Image img={event_patterns_highlight} alt='イベントパターン' size='lg' />

これにより、個々のログやトレースをスクロールして確認できるデフォルトの**結果テーブル**に代わる表示方法が提供されます。


## 推奨事項 {#recommendations}

イベントパターンは、データの**絞り込まれたサブセット**に適用した場合に最も効果的です。例えば、イベントパターンを有効にする前に単一のサービスに絞り込むことで、数千のサービスに対してパターンを一度に適用するよりも、関連性が高く有用なメッセージを抽出できます。

また、IDやペイロードが異なる繰り返し発生するエラーを簡潔なクラスターにグループ化する、エラーメッセージの要約にも特に有効です。

実際の使用例については、[リモートデモデータセット](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns)でイベントパターンがどのように使用されているかをご覧ください。
