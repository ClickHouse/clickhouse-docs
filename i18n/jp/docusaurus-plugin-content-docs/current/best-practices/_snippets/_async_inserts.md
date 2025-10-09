

import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

Asynchronous inserts in ClickHouseは、クライアント側のバッチ処理が実行できない場合の強力な代替手段を提供します。これは、数百または数千のエージェントがデータ（ログ、メトリック、トレース）を持続的に、しばしば小さなリアルタイムのペイロードで送信する観測作業で特に価値があります。これらの環境でクライアント側にデータをバッファリングすると、十分に大きなバッチを送信できるようにするための中央集権的なキューが必要になるため、複雑さが増します。

:::note
同期モードで多くの小さなバッチを送信することは推奨されておらず、多くのパーツが作成されることになります。これにより、クエリパフォーマンスが低下し、["too many part"](/knowledgebase/exception-too-many-parts)エラーが発生します。
:::

非同期挿入は、クライアントからサーバーへのバッチ処理の責任を移し、受信したデータをメモリ内バッファに書き込んだ後、構成可能なしきい値に基づいてストレージにフラッシュします。このアプローチにより、パーツ作成のオーバーヘッドが大幅に削減され、CPU使用率が低下し、高い同時接続数の下でも取り込みが効率的に保たれます。

コアの動作は、[`async_insert`](/operations/settings/settings#async_insert)設定を介して制御されます。

<Image img={async_inserts} size="lg" alt="Async inserts"/>

有効化されると（1）、挿入はバッファリングされ、フラッシュ条件のいずれかが満たされるまでディスクに書き込まれません：

(1) バッファが指定サイズに達する（async_insert_max_data_size）
(2) 時間のしきい値が経過する（async_insert_busy_timeout_ms）または 
(3) 最大挿入クエリ数が蓄積される（async_insert_max_query_number）。

このバッチ処理はクライアントには見えず、ClickHouseが複数のソースからの挿入トラフィックを効率的にマージするのを助けます。ただし、フラッシュが発生するまで、データはクエリできません。重要なことは、挿入の形状や設定の組み合わせごとに複数のバッファがあり、クラスター内ではノードごとにバッファが維持されるため、マルチテナント環境での詳細な制御が可能であることです。挿入のメカニズムは、[同期挿入](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default)で説明されているものと実質的に同じです。

### リターンモードの選択 {#choosing-a-return-mode}

非同期挿入の動作は、[`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert)設定を使用してさらに洗練されます。

1（デフォルト）に設定されている場合、ClickHouseはデータがディスクに正常にフラッシュされた後のみ、挿入を認識します。これにより強力な耐久性保証が確保され、エラーハンドリングが単純になります：フラッシュ中に何か問題が発生した場合、エラーがクライアントに返されます。このモードは、挿入の失敗を確実に追跡する必要がある場合、特にほとんどのプロダクションシナリオに推奨されます。

[ベンチマーク](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)は、200または500のクライアントを実行している場合でも、適応バッチ挿入と安定したパーツ作成動作のおかげで、同時実行性にうまくスケールすることを示します。

`wait_for_async_insert = 0`を設定すると、「ファイアアンドフォーゲット」モードが有効になります。ここでは、サーバーはデータがバッファリングされたときに直ちに挿入を認識し、ストレージに到達するのを待ちません。

これにより、超低レイテンシの挿入と最大スループットが提供され、高速かつ重要度の低いデータに最適です。ただし、これにはトレードオフがあります：データが永続化される保証はなく、エラーはフラッシュ中のみ発生する可能性があり、挿入の失敗を追跡することが難しいです。このモードは、あなたのワークロードがデータ損失を許容できる場合にのみ使用してください。

[ベンチマークも示しています](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)が、バッファフラッシュが少ない場合（例えば、30秒ごと）にパーツの削減とCPU使用率の低下がある一方で、サイレント失敗のリスクも残ります。

私たちの強い推奨は、非同期挿入を使用する場合は `async_insert=1,wait_for_async_insert=1` を使用することです。 `wait_for_async_insert=0` を使用するのは非常にリスキーであり、INSERTクライアントはエラーを認識していない可能性があり、ClickHouseサーバーが書き込みを遅くしてサービスの信頼性を確保するためにバックプレッシャを作成する必要がある状況で、クライアントが迅速に書き込みを続けると潜在的なオーバーロードを引き起こす可能性があります。

### デデュプリケーションと信頼性 {#deduplication-and-reliability}

デフォルトでは、ClickHouseは同期挿入に対して自動デデュプリケーションを行い、失敗シナリオにおいて再試行が安全になります。しかし、これは非同期挿入では明示的に有効にしない限り無効です（依存するMaterialized Viewがある場合は有効にしないことを推奨します - [こちらを参照](https://github.com/ClickHouse/ClickHouse/issues/66003)）。

実際、デデュプリケーションがオンになっていて、同じ挿入が再試行される場合（たとえば、タイムアウトやネットワークドロップによる）、ClickHouseは重複を安全に無視できます。これにより、冪等性が維持され、データの二重書き込みを回避できます。それでも、挿入の検証とスキーマ解析はバッファフラッシュ時にのみ行われるため、エラー（タイプミスマッチなど）はその時点でのみ発生することに注意する価値があります。

### 非同期挿入の有効化 {#enabling-asynchronous-inserts}

非同期挿入は特定のユーザーまたは特定のクエリのために有効にできます：

- ユーザーレベルで非同期挿入を有効にする。この例ではユーザー `default` を使用していますが、異なるユーザーを作成する場合はそのユーザー名に置き換えてください：
```sql
ALTER USER default SETTINGS async_insert = 1
```
- 挿入クエリのSETTINGS句を使用して非同期挿入の設定を指定できます：
```sql
INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
```
- ClickHouseプログラミング言語クライアントを使用する際に、接続パラメータとして非同期挿入の設定を指定することもできます。

  例として、ClickHouse Cloudに接続するためにClickHouse Java JDBCドライバーを使用する際のJDBC接続文字列内での設定方法は次のとおりです：
```bash
"jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
```
