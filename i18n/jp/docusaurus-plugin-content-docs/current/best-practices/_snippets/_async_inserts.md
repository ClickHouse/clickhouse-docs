import Image from "@theme/IdealImage"
import async_inserts from "@site/static/images/bestpractices/async_inserts.png"

ClickHouseの非同期インサートは、クライアント側でのバッチ処理が困難な場合に強力な代替手段となります。特にオブザーバビリティワークロードにおいて有用で、数百から数千のエージェントがログ、メトリクス、トレースなどのデータを継続的に送信する環境では、多くの場合小規模なリアルタイムペイロードとなります。このような環境でクライアント側でデータをバッファリングすると複雑性が増し、十分に大きなバッチを送信するために集中キューが必要になります。

:::note
同期モードで多数の小さなバッチを送信することは推奨されません。多数のパートが作成され、クエリパフォーマンスの低下や["too many part"](/knowledgebase/exception-too-many-parts)エラーが発生します。
:::

非同期インサートは、受信データをインメモリバッファに書き込み、設定可能なしきい値に基づいてストレージにフラッシュすることで、バッチ処理の責任をクライアントからサーバーに移します。このアプローチにより、パート作成のオーバーヘッドが大幅に削減され、CPU使用率が低下し、高い同時実行性の下でもインジェストの効率性が維持されます。

コア動作は[`async_insert`](/operations/settings/settings#async_insert)設定によって制御されます。

<Image img={async_inserts} size='lg' alt='Async inserts' />

有効化された場合（1）、インサートはバッファリングされ、次のいずれかのフラッシュ条件が満たされた時点でのみディスクに書き込まれます：

(1) バッファが指定されたサイズに達する（async_insert_max_data_size）
(2) 時間しきい値が経過する（async_insert_busy_timeout_ms）、または
(3) 最大数のインサートクエリが蓄積される（async_insert_max_query_number）

このバッチ処理プロセスはクライアントからは見えず、ClickHouseが複数のソースからのインサートトラフィックを効率的にマージするのに役立ちます。ただし、フラッシュが発生するまで、データはクエリできません。重要な点として、インサート形状と設定の組み合わせごとに複数のバッファが存在し、クラスタではノードごとにバッファが維持されるため、マルチテナント環境全体できめ細かい制御が可能になります。インサートのメカニズムは、それ以外の点では[同期インサート](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default)で説明されているものと同一です。

### 戻りモードの選択 {#choosing-a-return-mode}

非同期インサートの動作は、[`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert)設定を使用してさらに調整できます。

1に設定された場合（デフォルト）、ClickHouseはデータがディスクに正常にフラッシュされた後にのみインサートを確認応答します。これにより強力な耐久性保証が確保され、エラー処理が簡単になります。フラッシュ中に問題が発生した場合、エラーがクライアントに返されます。このモードは、特にインサート失敗を確実に追跡する必要がある場合、ほとんどの本番環境で推奨されます。

[ベンチマーク](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)によると、適応的インサートと安定したパート作成動作により、200クライアントでも500クライアントでも、同時実行性に対して良好にスケールすることが示されています。

`wait_for_async_insert = 0`を設定すると、「ファイア・アンド・フォーゲット」モードが有効になります。この場合、サーバーはデータがバッファリングされるとすぐにインサートを確認応答し、ストレージに到達するのを待ちません。

これにより超低レイテンシのインサートと最大スループットが提供され、高速で重要度の低いデータに最適です。ただし、トレードオフがあります。データが永続化される保証はなく、エラーはフラッシュ時にのみ表面化する可能性があり、失敗したインサートを追跡することが困難です。このモードは、ワークロードがデータ損失を許容できる場合にのみ使用してください。

[ベンチマークでも示されている](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)ように、バッファフラッシュが頻繁でない場合（例：30秒ごと）、パートの大幅な削減とCPU使用率の低下が実現されますが、サイレント障害のリスクは残ります。

非同期インサートを使用する場合は、`async_insert=1,wait_for_async_insert=1`を使用することを強く推奨します。`wait_for_async_insert=0`の使用は非常にリスクが高く、INSERTクライアントがエラーの発生を認識できない可能性があり、また、ClickHouseサーバーがサービスの信頼性を確保するために書き込みを遅くしてバックプレッシャーを作成する必要がある状況でクライアントが高速に書き込みを続けると、潜在的な過負荷を引き起こす可能性があります。

### 重複排除と信頼性 {#deduplication-and-reliability}

デフォルトでは、ClickHouseは同期インサートに対して自動重複排除を実行し、障害シナリオでのリトライを安全にします。ただし、明示的に有効化しない限り、非同期インサートではこれが無効になります（依存するマテリアライズドビューがある場合は有効化すべきではありません—[問題を参照](https://github.com/ClickHouse/ClickHouse/issues/66003)）。

実際には、重複排除が有効になっており、タイムアウトやネットワーク切断などにより同じインサートが再試行された場合、ClickHouseは重複を安全に無視できます。これにより冪等性が維持され、データの二重書き込みが回避されます。ただし、インサート検証とスキーマ解析はバッファフラッシュ時にのみ行われるため、エラー（型の不一致など）はその時点でのみ表面化することに注意が必要です。


### 非同期インサートの有効化 {#enabling-asynchronous-inserts}

非同期インサートは、特定のユーザーまたは特定のクエリに対して有効化できます：

- ユーザーレベルでの非同期インサートの有効化。この例では`default`ユーザーを使用していますが、別のユーザーを作成した場合はそのユーザー名に置き換えてください：
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- インサートクエリのSETTINGS句を使用して非同期インサート設定を指定できます：
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- ClickHouseプログラミング言語クライアントを使用する際に、接続パラメータとして非同期インサート設定を指定することもできます。

  例として、ClickHouse CloudへのJDBC接続にClickHouse Java JDBCドライバーを使用する場合、JDBC接続文字列内で次のように指定できます：

  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
