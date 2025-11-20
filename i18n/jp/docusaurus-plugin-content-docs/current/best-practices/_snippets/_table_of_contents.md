| Page                                                                                 | Description                                                                                             |
|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [Choosing a Primary Key](/best-practices/choosing-a-primary-key)                     | クエリ性能を最大化しつつストレージのオーバーヘッドを最小限に抑える主キーの選び方。                         |
| [Select Data Types](/best-practices/select-data-types)                               | メモリ使用量を削減し、圧縮効率を高め、クエリを高速化するための最適なデータ型の選び方。                    |
| [Use Materialized Views](/best-practices/use-materialized-views)                     | マテリアライズドビューを活用してデータを事前集約し、分析クエリを大幅に高速化する方法。                    |
| [Minimize and Optimize JOINs](/best-practices/minimize-optimize-joins)               | ClickHouse の `JOIN` 機能を効率良く活用するためのベストプラクティス。                                   |
| [Choosing a Partitioning Key](/best-practices/choosing-a-partitioning-key)           | 効率的なデータプルーニングと高速なクエリ実行を可能にするパーティショニング戦略の選び方。                 |
| [Selecting an Insert Strategy](/best-practices/selecting-an-insert-strategy)         | 適切な挿入パターンでデータ取り込みスループットを最適化し、リソース消費を削減する方法。                  |
| [Data Skipping Indices](/best-practices/use-data-skipping-indices-where-appropriate) | セカンダリインデックスを戦略的に適用して不要なデータブロックをスキップし、フィルタ付きクエリを高速化。   |
| [Avoid Mutations](/best-practices/avoid-mutations)                                   | 高コストな `UPDATE`/`DELETE` 操作を発生させないスキーマ設計とワークフローにより、パフォーマンスを向上させる。 |
| [Avoid OPTIMIZE FINAL](/best-practices/avoid-optimize-final)                         | `OPTIMIZE FINAL` が有益どころか性能を悪化させるケースを理解し、ボトルネックを回避する。                  |
| [Use JSON where appropriate](/best-practices/use-json-where-appropriate)             | ClickHouse で半構造化 JSON データを扱う際に、柔軟性と性能のバランスを取る方法。                          |