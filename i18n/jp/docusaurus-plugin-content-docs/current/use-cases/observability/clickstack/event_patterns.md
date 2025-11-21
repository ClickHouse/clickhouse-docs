---
slug: /use-cases/observability/clickstack/event_patterns
title: 'ClickStack を用いたイベントパターン'
sidebar_label: 'イベントパターン'
pagination_prev: null
pagination_next: null
description: 'ClickStack を用いたイベントパターン'
doc_type: 'guide'
keywords: ['clickstack', 'イベントパターン', 'ログ分析', 'パターンマッチング', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

ClickStack のイベントパターン機能を使うと、類似したメッセージを自動的にクラスタリングすることで、大量のログやトレースをすばやく把握できます。その結果、数百万件の個々のイベントを一つひとつ精査する代わりに、意味のある少数のグループだけを確認すればよくなります。

<Image img={event_patterns} alt="イベントパターン" size="lg" />

これにより、どのエラーや警告が新しいものか、どれが繰り返し発生しているか、どれがログ量の急増を引き起こしているかを、はるかに簡単に見つけ出せます。パターンは動的に生成されるため、正規表現を定義したりパースルールをメンテナンスしたりする必要はありません。フォーマットに関係なく、ClickStack がイベントの内容に自動的に適応します。

このような高レベルなビューは、インシデントレスポンスだけでなく、コスト削減のために削減対象となるノイズの多いログソースの特定、サービスが生成しているログの種類の把握、そしてシステムがすでに関心のあるシグナルを出しているかどうかの確認を、より迅速に行うのにも役立ちます。


## イベントパターンへのアクセス {#accessing-event-patterns}

イベントパターンは、ClickStackの**検索**パネルから直接利用できます。

左上の**分析モード**セレクターから**イベントパターン**を選択すると、標準の結果テーブルから類似イベントのクラスター表示に切り替わります。

<Image img={event_patterns_highlight} alt='イベントパターン' size='lg' />

これにより、個々のログやトレースをスクロールして確認できるデフォルトの**結果テーブル**に代わる表示方法が提供されます。


## 推奨事項 {#recommendations}

イベントパターンは、データの**絞り込まれたサブセット**に適用した場合に最も効果的です。例えば、イベントパターンを有効にする前に単一のサービスに絞り込むことで、数千のサービス全体にパターンを適用する場合と比較して、より関連性が高く有用なメッセージを抽出できます。

また、エラーメッセージの要約にも特に有効で、IDやペイロードが異なる繰り返し発生するエラーを簡潔なクラスターにグループ化できます。

実際の使用例については、[リモートデモデータセット](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns)でイベントパターンがどのように使用されているかを参照してください。
