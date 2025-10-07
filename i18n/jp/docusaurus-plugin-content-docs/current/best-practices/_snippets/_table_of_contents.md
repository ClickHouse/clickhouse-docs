

| Page                                                                                 | Description                                                                                             |
|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [主キーの選択](/best-practices/choosing-a-primary-key)                     | クエリのパフォーマンスを最大化し、ストレージのオーバーヘッドを最小限に抑える主キーの選び方。               |
| [データ型の選択](/best-practices/select-data-types)                               | メモリ使用量を減らし、圧縮を改善し、クエリを加速するために最適なデータ型を選択します。          |
| [マテリアライズドビューの使用](/best-practices/use-materialized-views)                     | マテリアライズドビューを活用してデータを事前集計し、分析クエリを劇的に高速化します。         |
| [JOINの最小化と最適化](/best-practices/minimize-optimize-joins)               | ClickHouseの`JOIN`機能を効率的に使用するためのベストプラクティス。                                  |
| [パーティショニングキーの選択](/best-practices/choosing-a-partitioning-key)           | 効率的なデータのプルーニングと迅速なクエリ実行を可能にするパーティショニング戦略を選択します。           |
| [挿入戦略の選択](/best-practices/selecting-an-insert-strategy)         | 適切な挿入パターンでデータの取り込みスループットを最適化し、リソース消費を減らします。         |
| [データスキッピングインデックス](/best-practices/use-data-skipping-indices-where-appropriate) | セカンダリインデックスを戦略的に適用して無関係なデータブロックをスキップし、フィルタされたクエリを加速します。   |
| [ミューテーションの回避](/best-practices/avoid-mutations)                                   | 設計スキーマとワークフローを用いてコストのかかる`UPDATE`/`DELETE`操作を排除し、より良いパフォーマンスを実現します。 |
| [OPTIMIZE FINALの回避](/best-practices/avoid-optimize-final)                         | `OPTIMIZE FINAL`が役に立つよりも悪影響を及ぼす場面を理解することで、パフォーマンスボトルネックを防ぎます。        |
| [適切な場合にJSONを使用](/best-practices/use-json-where-appropriate)             | ClickHouseで半構造化JSONデータを扱う際に、柔軟性とパフォーマンスのバランスを取ります。          |
