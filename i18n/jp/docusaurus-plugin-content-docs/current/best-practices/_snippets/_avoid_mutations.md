ClickHouse において **ミューテーション (mutation)** とは、通常は `ALTER TABLE ... DELETE` や `ALTER TABLE ... UPDATE` を用いてテーブル内の既存データを変更または削除する操作を指します。これらのステートメントは標準的な SQL の操作と似て見えますが、内部的な動作は本質的に異なります。

ClickHouse では行をその場で更新するのではなく、変更の影響を受ける [data parts](/parts) 全体を書き換える非同期のバックグラウンド処理としてミューテーションが実行されます。これは ClickHouse のカラム指向かつイミュータブルなストレージモデルによる制約であり、その結果として多くの I/O とリソースを消費する可能性があります。

ミューテーションが発行されると、ClickHouse は新しい **mutated parts** の作成をスケジュールし、新しいパーツが準備完了となるまで元のパーツには手を触れません。準備が整うと、ミューテート済みパーツがアトミックに元のパーツを置き換えます。ただし、この操作はパーツ全体を書き換えるため、単一行の更新といったごく小さな変更であっても、大規模な書き換えと過度なライトアンプリフィケーションを招く場合があります。

大規模なデータセットでは、これによりディスク I/O が大きくスパイクし、クラスタ全体のパフォーマンス低下を引き起こす可能性があります。マージとは異なり、ミューテーションは一度投入されるとロールバックできず、明示的にキャンセルしない限りサーバー再起動後も実行を継続します。詳細は [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation) を参照してください。

:::tip Monitoring the number of active or queued mutations in ClickHouse
アクティブまたはキューに入っているミューテーションの数を監視する方法については、次の [ナレッジベース記事](/knowledgebase/view_number_of_active_mutations)を参照してください。
:::

ミューテーションは**全順序付け**されています。すなわち、ミューテーションが発行される前に挿入されたデータに対して適用され、それ以降に挿入された新しいデータには影響しません。INSERT をブロックすることはありませんが、他の進行中クエリと重なる可能性はあります。ミューテーション実行中に走っている SELECT は、ミューテート済みパーツと未ミューテートパーツが混在した状態を読み取ることがあり、実行中のデータビューが一時的に一貫しない場合があります。ClickHouse はパーツ単位でミューテーションを並列実行するため、特に `x IN (SELECT ...)` のような複雑なサブクエリが関与する場合には、メモリおよび CPU 使用量がさらに増大する可能性があります。

一般論として、特に高トラフィックなテーブルに対しては、**頻繁または大規模なミューテーションは避ける**べきです。代わりに、[ReplacingMergeTree](/guides/replacing-merge-tree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) などの代替テーブルエンジンの利用を検討してください。これらはクエリ実行時やマージ処理中に、より効率的にデータの修正を扱うよう設計されています。どうしてもミューテーションが必要な場合は、`system.mutations` テーブルを用いて注意深く監視し、プロセスがハングしたり異常動作したりしている場合には `KILL MUTATION` を使用してください。ミューテーションの誤用は、パフォーマンス低下やストレージの過度な入れ替え・ churn、サービスの不安定化につながる可能性があるため、慎重かつ限定的に使用する必要があります。

データ削除に関しては、[Lightweight deletes](/guides/developer/lightweight-delete) の利用や、[partitions](/best-practices/choosing-a-partitioning-key) によるデータ管理も検討できます。パーティションを用いることで、パーツ全体を[効率的に削除](/sql-reference/statements/alter/partition#drop-partitionpart)できます。