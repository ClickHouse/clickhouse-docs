ClickHouse において **mutation（ミューテーション）** とは、通常 `ALTER TABLE ... DELETE` や `ALTER TABLE ... UPDATE` を用いてテーブル内の既存データを変更または削除する操作を指します。これらの文は標準的な SQL 操作と似て見えますが、内部的な動作は根本的に異なります。

行をその場で更新するのではなく、ClickHouse における mutation は、変更の影響を受ける[データパーツ](/parts)全体を書き換える非同期のバックグラウンド処理です。この方式は、ClickHouse のカラム指向かつ不変なストレージモデルの性質上必要なものであり、その結果として I/O やリソース使用量が大きくなる可能性があります。

mutation が発行されると、ClickHouse は新しい **mutated part（変更済みパーツ）** の作成をスケジュールし、新しいパーツが準備完了となるまでは元のパーツには手を触れません。準備ができると、変更済みパーツが元のパーツをアトミックに置き換えます。しかし、この操作はパーツ全体を書き直すため、たとえ単一行の更新のような軽微な変更であっても、大規模な書き換えや過度な書き込み増幅を引き起こす可能性があります。

巨大なデータセットでは、これによりディスク I/O が大きくスパイクし、クラスタ全体のパフォーマンスが低下することがあります。マージと異なり、mutation は一度送信されるとロールバックできず、明示的にキャンセルしない限り、サーバーの再起動後も実行を継続します。詳細は [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation) を参照してください。

:::tip ClickHouse におけるアクティブまたはキューに入っている mutation 数の監視
アクティブまたはキューに入っている mutation の数を監視する方法については、次の[ナレッジベース記事](/knowledgebase/view_number_of_active_mutations)を参照してください。
:::

mutation は **全順序（totally ordered）** であり、mutation が発行される前に挿入されたデータに対して適用され、それ以降に挿入された新しいデータには影響しません。INSERT をブロックすることはありませんが、他の進行中のクエリと重なり合う可能性はあります。mutation 実行中に走っている SELECT は、変更済みパーツと未変更パーツが混在した状態を読み込む可能性があり、実行中にデータの不整合なビューが生じることがあります。ClickHouse はパーツごとに mutation を並列実行するため、とくに `x IN (SELECT ...)` のような複雑なサブクエリが関与する場合には、メモリや CPU の消費がさらに増大し得ます。

原則として、**高頻度または大規模な mutation は避けてください**。とくにデータ量の多いテーブルでは注意が必要です。その代わりに、[ReplacingMergeTree](/guides/replacing-merge-tree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) といった代替のテーブルエンジンを使用することを検討してください。これらはクエリ時やマージ時に、より効率的にデータ修正を処理できるよう設計されています。どうしても mutation が必要な場合は、`system.mutations` テーブルを用いて慎重に監視し、プロセスがスタックしたり異常動作している場合には `KILL MUTATION` を使用してください。mutation を誤用すると、パフォーマンス低下、ストレージの過度な入れ替わり（churn）、さらにはサービスの不安定化につながる可能性があります。そのため、mutation は慎重かつ限定的に適用してください。

データ削除の用途としては、[Lightweight deletes](/guides/developer/lightweight-delete) を利用したり、[パーティション](/best-practices/choosing-a-partitioning-key)を用いてデータを管理する方法も検討できます。パーティションを利用すれば、パーツ全体を[効率的に削除](/sql-reference/statements/alter/partition#drop-partitionpart)できます。