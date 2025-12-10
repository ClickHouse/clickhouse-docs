| Page                                                                                 | Description                                                                                             |
|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [プライマリキーの選択](/best-practices/choosing-a-primary-key)                     | クエリパフォーマンスを最大化し、ストレージオーバーヘッドを最小化できるプライマリキーの選び方。               |
| [データ型の選択](/best-practices/select-data-types)                               | メモリ使用量を削減し、圧縮を高め、クエリを高速化するための最適なデータ型の選び方。          |
| [マテリアライズドビューの活用](/best-practices/use-materialized-views)                     | データを事前集計するためにマテリアライズドビューを活用し、分析クエリを大幅に高速化します。         |
| [JOIN の最小化と最適化](/best-practices/minimize-optimize-joins)               | ClickHouse の `JOIN` 機能を効率的に使用するためのベストプラクティス。                                  |
| [パーティションキーの選択](/best-practices/choosing-a-partitioning-key)           | データプルーニングを効率化し、クエリ実行を高速化するパーティション戦略の選び方。           |
| [挿入戦略の選択](/best-practices/selecting-an-insert-strategy)         | 適切な挿入パターンにより、データインジェストのスループットを最適化し、リソース消費を削減します。         |
| [データスキップインデックス](/best-practices/use-data-skipping-indices-where-appropriate) | セカンダリインデックスを戦略的に適用し、不要なデータブロックをスキップしてフィルタクエリを高速化します。   |
| [ミューテーションを避ける](/best-practices/avoid-mutations)                                   | 高コストな `UPDATE` / `DELETE` 操作を排除できるスキーマとワークフローを設計し、パフォーマンスを向上させます。 |
| [OPTIMIZE FINAL を避ける](/best-practices/avoid-optimize-final)                         | どのような場合に `OPTIMIZE FINAL` が有害になり、パフォーマンスボトルネックを引き起こすかを理解し、回避します。        |
| [適切な場面で JSON を使用する](/best-practices/use-json-where-appropriate)             | ClickHouse で半構造化 JSON データを扱う際に、柔軟性とパフォーマンスのバランスを取ります。          |