import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

ClickHouse における非同期 INSERT は、クライアント側でバッチ処理ができない場合の強力な代替手段です。これは特にオブザーバビリティ系ワークロードで有用であり、数百〜数千のエージェントがログ・メトリクス・トレースなどのデータを、小さいリアルタイムペイロードで継続的に送信するケースでよく発生します。このような環境でクライアント側にデータをバッファリングすると複雑性が増し、十分なサイズのバッチを送信するための集中キューが必要になります。

:::note
同期モードで小さなバッチを多数送信することは推奨されません。多くのパーツが作成されてしまい、クエリパフォーマンスの低下や [&quot;too many part&quot;](/knowledgebase/exception-too-many-parts) エラーの原因となります。
:::

非同期 INSERT は、受信データをインメモリバッファに書き込み、その後設定可能なしきい値に基づいてストレージにフラッシュすることで、バッチ処理の責任をクライアントからサーバー側へ移します。このアプローチによりパーツ作成のオーバーヘッドが大幅に削減され、CPU 使用率が低下し、高い並行性の下でもインジェスト効率を維持できます。

コアとなる挙動は [`async_insert`](/operations/settings/settings#async_insert) 設定で制御されます。

<Image img={async_inserts} size="lg" alt="非同期 INSERT" />

非同期 INSERT は、HTTP とネイティブ TCP の両方のインターフェイスでサポートされています。

有効化 (`async_insert = 1`) されると、INSERT はバッファリングされ、次のいずれかのフラッシュ条件を満たしたときにのみディスクへ書き込まれます。

* バッファが指定されたデータサイズに達した場合 ([`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size)、デフォルトは 10 MiB) 。
* 時間しきい値が経過した場合 ([`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_busy_timeout_max_ms)、デフォルトは 200 ms、Cloud では 1000 ms) 。
* INSERT クエリ数が最大値に達した場合 ([`async_insert_max_query_number`](/operations/settings/settings#async_insert_max_query_number)、デフォルトは 450) 。

最初に到達したしきい値によってフラッシュがトリガーされます。

このバッチ処理はクライアントからは見えず、ClickHouse が複数のソースからの INSERT トラフィックを効率的にマージするのに役立ちます。ただし、フラッシュが発生するまではデータをクエリすることはできません。重要な点として、INSERT の形状 (クエリパターン) と設定の組み合わせごとに複数のバッファが存在し、クラスターではノードごとにバッファが維持されます。これにより、マルチテナント環境全体でのきめ細かな制御が可能になります。INSERT のメカニズム自体は、[同期 INSERT](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default) で説明されているものと同一です。

### 戻り値モードの選択 \{#choosing-a-return-mode\}

非同期 INSERT の挙動は、[`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert) 設定によってさらに細かく制御されます。

1 (デフォルト) に設定すると、ClickHouse はデータがディスクへ正常にフラッシュされた後にのみ INSERT を確認 (ACK) します。これにより強い永続性保証が得られ、エラーハンドリングも単純になります。フラッシュ中に何か問題が発生した場合は、そのエラーがクライアントに返されます。このモードは、特に INSERT 失敗を確実に追跡する必要があるほとんどの本番シナリオで推奨されます。

[ベンチマーク](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) によれば、このモードは並行度に対して高いスケーラビリティを示しており、200 クライアントでも 500 クライアントでも、アダプティブ INSERT と安定したパーツ作成挙動のおかげで良好に動作します。

`wait_for_async_insert = 0` に設定すると、「fire-and-forget」モードが有効になります。この場合、サーバーはデータがバッファに格納された時点で INSERT を確認し、ストレージに到達するのを待ちません。

これは超低レイテンシな INSERT と最大限のスループットを提供し、高速かつ重要度の低いデータに理想的です。しかし、その代償として、データが永続化される保証はなく、エラーはフラッシュ時にしか表面化せず、失敗した INSERT のためのデッドレターキューもありません。失敗の追跡には、事後的にサーバーログと system テーブルを調査する必要があります。このモードは、ワークロードがデータ損失を許容できる場合にのみ使用してください。

[ベンチマークではさらに](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)、バッファフラッシュの頻度が低い場合 (例: 30 秒ごと) に、パーツの大幅な削減と CPU 使用率の低下が示されていますが、見えない形で失敗が発生するリスクは依然として残ります。

非同期 INSERT を使用する場合、`async_insert=1,wait_for_async_insert=1` を使用することを強く推奨します。`wait_for_async_insert=0` の使用は非常にリスクが高く、INSERT クライアントがエラーを認識できない可能性があるうえに、ClickHouse サーバー側が書き込みを減速させてバックプレッシャーをかけ、サービスの信頼性を確保する必要がある状況でも、クライアントが高速な書き込みを継続してしまい、潜在的な過負荷を引き起こす可能性があります。

### 適応型非同期 INSERT \{#adaptive-async-inserts\}

バージョン 24.2 以降、ClickHouse ではデフォルトで適応型フラッシュタイムアウト ([`async_insert_use_adaptive_busy_timeout`](/operations/settings/settings#async_insert_use_adaptive_busy_timeout)) が使用されます。固定のフラッシュ間隔ではなく、流入するデータレートに応じて、タイムアウトが最小値 ([`async_insert_busy_timeout_min_ms`](/operations/settings/settings#async_insert_busy_timeout_min_ms)、デフォルトは 50 ms) から最大値 ([`async_insert_busy_timeout_max_ms`](/operations/settings/settings#async_insert_busy_timeout_max_ms)、デフォルトは 200 ms、Cloud では 1000 ms) まで動的に調整されます。

データが頻繁に到着する場合、タイムアウトは最小値寄りに保たれるため、より早くフラッシュされ、エンドツーエンドのレイテンシを低減できます。データがスパースな場合は、より大きなバッチを蓄積するため、最大値に近づく方向に伸びます。これは特にデフォルトモード (`wait_for_async_insert=1`) で有効です。固定で大きなタイムアウトを設定すると、フラッシュ可能な状態になっていても、クライアントはその間隔が終わるまでブロックされてしまうためです。

### エラーハンドリング \{#error-handling\}

schema の検証とデータの解析は、insert を受信した時点ではなく、バッファのフラッシュ時に行われます。insert クエリ内のいずれかの行に解析エラーまたは型エラーがある場合、**そのクエリのデータは一切フラッシュされません**。つまり、クエリ全体のペイロードが拒否されます。デフォルトモード (`wait_for_async_insert=1`) では、エラーがクライアントに返されます。fire-and-forget モードでは、エラーはサーバーログと [`system.asynchronous_inserts`](/operations/system-tables/asynchronous_inserts) テーブルに書き込まれます。

フラッシュのたびに、バッファ内の異なるパーティションキー値ごとに少なくとも 1 つのパーツが作成されます。パーティションキーのないテーブルでも、バッファされたデータが [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) (デフォルトは約 100 万行) を超える場合、1 回のフラッシュで複数のパーツが生成されることがあります。

:::note
非同期 insert を使用していても、パーティションキーのカーディナリティが高い場合は、[&quot;too many parts&quot;](/knowledgebase/exception-too-many-parts) エラーが発生することがあります。
:::

### 重複排除と信頼性 \{#deduplication-and-reliability\}

デフォルトでは、ClickHouse は同期 INSERT に対して自動重複排除を行い、失敗時のリトライを安全にします。しかし、これは非同期 INSERT では明示的に有効化しない限り無効になっています (依存するマテリアライズドビューがある場合は有効化すべきではありません — [issue を参照](https://github.com/ClickHouse/ClickHouse/issues/66003)) 。

実際には、重複排除が有効で同一の INSERT がリトライされた場合 (タイムアウトやネットワーク切断などが原因) 、ClickHouse は重複を安全に無視できます。これにより冪等性が維持され、データの二重書き込みを回避できます。

### 非同期 INSERT の有効化 \{#enabling-asynchronous-inserts\}

非同期 INSERT は、特定のユーザー、または特定のクエリに対して有効にできます。

* ユーザーレベルで非同期 INSERT を有効にします。この例ではユーザー `default` を使用しています。別のユーザーを作成している場合は、そのユーザー名に置き換えてください:
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
* `INSERT クエリ` の `SETTINGS` 句を使用して、非同期 INSERT の設定を指定できます:
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
* ClickHouse のプログラミング言語クライアントを使用する場合、接続パラメータとして非同期 INSERT の設定を指定することもできます。

  例として、ClickHouse Cloud に接続するために ClickHouse Java JDBC ドライバーを使用する場合、JDBC 接続文字列内で次のように指定できます:

  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```

:::note
非同期 INSERT は `INSERT INTO ... SELECT` クエリには適用されません。`INSERT` に `SELECT` 句が含まれている場合、`async_insert` 設定に関係なく、そのクエリは常に同期的に実行されます。
:::

### シャットダウン時にバッファをフラッシュする \{#flushing-buffers-on-shutdown\}

保留中の非同期 INSERT バッファをすべてフラッシュするには、たとえばグレースフルシャットダウン時やメンテナンス前に、次を実行します。

```sql
SYSTEM FLUSH ASYNC INSERT QUEUE
```

これにより、サーバーが停止する前に、バッファリングされたデータはすべてストレージに書き込まれます。

### バッファテーブルとの比較 \{#comparison-with-buffer-tables\}

非同期 INSERT は、[Buffer tables](/engines/table-engines/special/buffer) に代わる現在の標準的な方式です。主な違いは次のとおりです。

* **DDL の変更は不要です。** 非同期 INSERT は透過的で、追加のテーブルを作成する必要はなく、設定を有効にするだけです。
* **クエリ形状ごとのバッファリング。** 非同期 INSERT は、一意のクエリ形状と設定の組み合わせごとに個別のバッファを維持するため、きめ細かなフラッシュポリシーを適用できます。バッファテーブルは、対象テーブルごとに 1 つのバッファを使用します。
* **耐久性。** デフォルトモード (`wait_for_async_insert=1`) では、クライアントが確認応答を受け取る前に、データがディスクに書き込まれたことが確認されます。バッファテーブルは fire-and-forget 型で動作するため、クラッシュ時にはバッファされたデータが失われます。
* **クラスターでの動作。** クラスターでは、非同期 INSERT のバッファはノードごとに維持されます。バッファテーブルは、各ノードで明示的に作成する必要があります。