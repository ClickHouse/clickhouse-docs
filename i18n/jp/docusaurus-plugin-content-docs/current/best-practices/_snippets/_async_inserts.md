import Image from "@theme/IdealImage"
import async_inserts from "@site/static/images/bestpractices/async_inserts.png"

ClickHouseの非同期インサートは、クライアント側でのバッチ処理が困難な場合に強力な代替手段を提供します。これは特に、数百から数千のエージェントがログ、メトリクス、トレースなどのデータを継続的に送信する可観測性ワークロードにおいて有用です。これらの環境でクライアント側でデータをバッファリングすると、十分に大きなバッチを送信するために集中キューが必要となり、複雑性が増大します。

:::note
同期モードで多数の小さなバッチを送信することは推奨されません。これにより多数のパートが作成され、クエリパフォーマンスの低下や["too many part"](/knowledgebase/exception-too-many-parts)エラーが発生します。
:::

非同期インサートは、受信データをインメモリバッファに書き込み、設定可能な閾値に基づいてストレージにフラッシュすることで、バッチ処理の責任をクライアントからサーバーに移します。このアプローチにより、パート作成のオーバーヘッドが大幅に削減され、CPU使用率が低下し、高い同時実行性の下でもデータ取り込みの効率性が維持されます。

コア動作は[`async_insert`](/operations/settings/settings#async_insert)設定によって制御されます。

<Image img={async_inserts} size='lg' alt='Async inserts' />

有効化された場合(1)、インサートはバッファリングされ、以下のフラッシュ条件のいずれかが満たされた時点でのみディスクに書き込まれます:

(1) バッファが指定サイズに達した場合(async_insert_max_data_size)
(2) 時間閾値が経過した場合(async_insert_busy_timeout_ms)、または
(3) 最大インサートクエリ数が蓄積された場合(async_insert_max_query_number)

このバッチ処理プロセスはクライアントからは見えず、ClickHouseが複数のソースからのインサートトラフィックを効率的にマージするのに役立ちます。ただし、フラッシュが発生するまでデータはクエリできません。重要な点として、インサート形状と設定の組み合わせごとに複数のバッファが存在し、クラスタではノードごとにバッファが維持されるため、マルチテナント環境全体できめ細かな制御が可能になります。インサートの仕組みは、それ以外の点では[同期インサート](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default)で説明されているものと同一です。

### 戻りモードの選択 {#choosing-a-return-mode}

非同期インサートの動作は、[`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert)設定を使用してさらに調整されます。

1に設定された場合(デフォルト)、ClickHouseはデータがディスクに正常にフラッシュされた後にのみインサートを確認応答します。これにより強力な耐久性保証が確保され、エラー処理が簡潔になります。フラッシュ中に問題が発生した場合、エラーがクライアントに返されます。このモードは、特にインサート失敗を確実に追跡する必要がある場合、ほとんどの本番環境シナリオで推奨されます。

[ベンチマーク](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)によると、適応的インサートと安定したパート作成動作により、200クライアントでも500クライアントでも、同時実行性に対して良好にスケールすることが示されています。

`wait_for_async_insert = 0`を設定すると、「ファイア・アンド・フォーゲット」モードが有効になります。この場合、サーバーはデータがバッファリングされた時点で即座にインサートを確認応答し、ストレージに到達するのを待ちません。

これにより超低レイテンシのインサートと最大スループットが実現され、高速で重要度の低いデータに最適です。ただし、トレードオフがあります。データが永続化される保証はなく、エラーはフラッシュ時にのみ表面化する可能性があり、失敗したインサートを追跡することが困難です。このモードは、ワークロードがデータ損失を許容できる場合にのみ使用してください。

[ベンチマークでも示されている](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)ように、バッファフラッシュが低頻度(例:30秒ごと)の場合、パートの大幅な削減とCPU使用率の低下が実現されますが、サイレント障害のリスクは残ります。

非同期インサートを使用する場合、`async_insert=1,wait_for_async_insert=1`の使用を強く推奨します。`wait_for_async_insert=0`の使用は非常にリスクが高く、INSERTクライアントがエラーの発生を認識できない可能性があり、また、ClickHouseサーバーがサービスの信頼性を確保するために書き込みを遅くしてバックプレッシャーを生成する必要がある状況でクライアントが高速に書き込みを続けると、潜在的な過負荷を引き起こす可能性があります。

### 重複排除と信頼性 {#deduplication-and-reliability}

デフォルトでは、ClickHouseは同期インサートに対して自動重複排除を実行し、障害シナリオでのリトライを安全にします。ただし、明示的に有効化しない限り、非同期インサートではこれが無効になります(依存するマテリアライズドビューがある場合は有効化すべきではありません—[問題を参照](https://github.com/ClickHouse/ClickHouse/issues/66003))。

実際には、重複排除が有効化されており、タイムアウトやネットワーク切断などにより同じインサートがリトライされた場合、ClickHouseは重複を安全に無視できます。これにより冪等性が維持され、データの二重書き込みが回避されます。ただし、インサート検証とスキーマ解析はバッファフラッシュ時にのみ実行されるため、エラー(型の不一致など)はその時点でのみ表面化することに注意が必要です。


### 非同期インサートの有効化 {#enabling-asynchronous-inserts}

非同期インサートは、特定のユーザーまたは特定のクエリに対して有効化できます:

- ユーザーレベルでの非同期インサートの有効化。この例では`default`ユーザーを使用していますが、別のユーザーを作成した場合はそのユーザー名に置き換えてください:
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- インサートクエリのSETTINGS句を使用して非同期インサート設定を指定できます:
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- ClickHouseプログラミング言語クライアントを使用する際に、接続パラメータとして非同期インサート設定を指定することもできます。

  例として、ClickHouse CloudへのJDBC接続にClickHouse Java JDBCドライバーを使用する場合、JDBC接続文字列内で次のように指定できます:

  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
