ClickHouse において **mutation（マテーション）** とは、テーブル内の既存データを変更または削除する操作を指します。典型的には `ALTER TABLE ... DELETE` や `ALTER TABLE ... UPDATE` がこれにあたります。これらの文は標準的な SQL の操作と似ていますが、その内部動作は本質的に異なります。

ClickHouse の mutation は、行をその場で直接変更するのではなく、変更の影響を受ける [data parts](/parts) 全体を書き換える非同期のバックグラウンド処理として実行されます。これは、ClickHouse のカラム指向かつイミュータブルなストレージモデルに起因するアプローチであり、その結果として大きな I/O やリソース消費を引き起こす可能性があります。

mutation が発行されると、ClickHouse は新しい **mutated parts（マテーション後パーツ）** の作成をスケジュールし、新しいパーツが準備完了になるまで元のパーツには手を触れません。準備が完了すると、mutated parts がアトミックに元のパーツと置き換えられます。ただし、この操作はパーツ全体を書き換えるため、単一行の更新のようなごく小さな変更であっても、大規模な再書き込みや過度な書き込み増幅につながる可能性があります。

大規模なデータセットでは、これによりディスク I/O が大きくスパイクし、クラスタ全体のパフォーマンスが低下することがあります。マージとは異なり、mutation はいったん投入されるとロールバックできず、明示的にキャンセルしない限り、サーバーの再起動後も実行を続けます。キャンセル方法については [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation) を参照してください。

:::tip ClickHouse でアクティブまたはキューに入っている mutation 数を監視する
アクティブまたはキューに入っている mutation の数を監視する方法については、次の [ナレッジベース記事](/knowledgebase/view_number_of_active_mutations) を参照してください。
:::

mutation は **完全順序付け** されています。つまり、mutation 発行前に挿入されたデータに対して適用され、それ以降に挿入された新しいデータには影響しません。mutation は挿入をブロックしませんが、進行中の他のクエリと重なることはあります。mutation の実行中に動作している SELECT は、mutation 済みパーツと未 mutation パーツが混在した状態を読む可能性があり、その結果、実行中のデータビューが一時的に不整合になることがあります。ClickHouse はパーツごとに mutation を並列実行するため、特に複雑なサブクエリ（`x IN (SELECT ...)` のようなもの）が含まれる場合、メモリや CPU 使用量がさらに増大する可能性があります。

原則として、特に高トラフィックなテーブルに対しては、**頻繁または大規模な mutation を避けてください**。代わりに、[ReplacingMergeTree](/guides/replacing-merge-tree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) といった、クエリ時またはマージ時により効率的にデータ修正を扱うよう設計された代替テーブルエンジンの利用を検討してください。どうしても mutation が必要な場合は、`system.mutations` テーブルで慎重に監視し、プロセスがハングしている、または異常動作している場合には `KILL MUTATION` を使用してください。mutation の誤用は、パフォーマンス低下、過度なストレージの churn（入れ替わり）、さらにはサービスの不安定化を招く可能性があるため、慎重かつ限定的に適用することが重要です。

データの削除については、[Lightweight deletes](/guides/developer/lightweight-delete) の利用や、[partitions](/best-practices/choosing-a-partitioning-key) を用いたデータ管理も検討できます。パーティションを利用すると、パーツ全体を[効率的に削除](/sql-reference/statements/alter/partition#drop-partitionpart)することが可能です。