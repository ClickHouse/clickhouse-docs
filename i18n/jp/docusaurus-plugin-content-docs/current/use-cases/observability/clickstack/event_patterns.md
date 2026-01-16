---
slug: /use-cases/observability/clickstack/event_patterns
title: 'ClickStack によるイベントパターン'
sidebar_label: 'イベントパターン'
pagination_prev: null
pagination_next: null
description: 'ClickStack によるイベントパターン'
doc_type: 'guide'
keywords: ['clickstack', 'イベントパターン', 'ログ分析', 'パターンマッチング', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

ClickStack のイベントパターン機能を使うと、類似したメッセージを自動的にクラスタリングしてまとめることで、大量のログやトレースをすばやく把握できます。その結果、数百万件の個々のイベントを精査する代わりに、意味のある少数のグループだけを確認すればよくなります。

<Image img={event_patterns} alt="Event patterns" size="lg" />

これにより、どのエラーや警告が新しいもので、どれが再発しており、どれがログ量の急増を引き起こしているのかを、はるかに容易に把握できます。パターンは動的に生成されるため、正規表現を定義したり、パースルールを保守したりする必要はありません。ClickStack がイベントの形式に関わらず自動的に適応します。

インシデント対応以外にも、この俯瞰的なビューによって、コスト削減のために絞り込み・削減できるノイズの多いログソースの特定、あるサービスが出力しているログの種類の把握、そしてシステムがすでに重視しているシグナルを出しているかどうかの確認を、より迅速に行えるようになります。


## イベントパターンへのアクセス \\{#accessing-event-patterns\\}

イベントパターンは、ClickStack の **Search** パネルから直接利用できます。  

左上にある **Analysis Mode** セレクターで **Event Patterns** を選択すると、標準の結果テーブルビューから、類似したイベントをクラスタリングしたビューに切り替わります。  

<Image img={event_patterns_highlight} alt="Event patterns" size="lg"/>

これにより、すべてのログやトレースを 1 件ずつスクロールして確認するデフォルトの **Results Table** に代わる表示方法が提供されます。

## 推奨事項 \\{#recommendations\\}

イベントパターンは、データの**絞り込まれたサブセット**に適用したときに最も効果を発揮します。たとえば、イベントパターンを有効化する前に特定の 1 つのサービスにまでフィルタリングしてから適用することで、数千ものサービス全体に一度にパターンを適用する場合よりも、関連性が高く興味深いメッセージが得られる場合がほとんどです。  

また、エラーメッセージの要約にも特に有効であり、ID やペイロードが異なる同種のエラーを、簡潔なクラスターにまとめてグループ化できます。  

実際の例としては、[Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns) でのイベントパターンの使用方法を参照してください。