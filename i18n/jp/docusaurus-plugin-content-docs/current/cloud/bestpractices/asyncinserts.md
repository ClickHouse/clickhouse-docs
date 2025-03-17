---
slug: /cloud/bestpractices/asynchronous-inserts
sidebar_label: 非同期インサート
title: 非同期インサート (async_insert)
---

import asyncInsert01 from '@site/static/images/cloud/bestpractices/async-01.png';
import asyncInsert02 from '@site/static/images/cloud/bestpractices/async-02.png';
import asyncInsert03 from '@site/static/images/cloud/bestpractices/async-03.png';

大規模バッチで ClickHouse にデータを挿入することはベストプラクティスです。これにより、計算サイクルとディスク I/O が節約され、その結果、コストも削減できます。もし使用ケースが ClickHouse の外部でのバッチ処理を許可する場合、それも一つの選択肢です。もし ClickHouse にバッチを作成させたい場合は、ここで説明する非同期 INSERT モードを使用できます。

非同期インサートを、クライアント側でデータをバッチ処理するのと、約1秒ごとに1クエリの挿入レートを維持する代替手段として使用します。[async_insert](/operations/settings/settings.md/#async_insert) 設定を有効にすることで、ClickHouse はサーバー側でバッチ処理を処理します。

デフォルトでは、ClickHouse はデータを同期的に書き込みます。
ClickHouse に送信された各インサートは、即座に挿入されたデータを含むパーツを生成します。
これは、async_insert 設定がデフォルト値の 0 に設定されている場合のデフォルトの動作です：

<img src={asyncInsert01}
  class="image"
  alt="非同期インサートプロセス - デフォルトの同期インサート"
  style={{width: '100%', background: 'none'}} />

async_insert を 1 に設定すると、ClickHouse はまず、受信したインサートをメモリ内バッファに格納し、定期的にディスクにフラッシュします。

ClickHouse がバッファをディスクにフラッシュする原因となる可能性のある条件は二つあります：
- バッファサイズが N バイトに達した (N は [async_insert_max_data_size](/operations/settings/settings.md/#async_insert_max_data_size) を介して設定可能)
- 最後のバッファフラッシュから少なくとも N ミリ秒が経過した (N は [async_insert_busy_timeout_max_ms](/operations/settings/settings.md/#async_insert_busy_timeout_max_ms) を介して設定可能)

上記のいずれかの条件が満たされると、ClickHouse はメモリ内バッファをディスクにフラッシュします。

:::note
データは、ストレージのパートに書き込まれた後、読み取りクエリで利用可能です。`async_insert_busy_timeout_ms`（デフォルトでは1秒に設定）や `async_insert_max_data_size`（デフォルトでは10 MiBに設定）の設定を変更したい場合は、これを考慮してください。
:::

[wait_for_async_insert](/operations/settings/settings.md/#wait_for_async_insert) 設定により、インサートステートメントがバッファにデータが挿入された後すぐに確認応答を返すか (wait_for_async_insert = 0)、デフォルトで、バッファからフラッシュされた後にデータがパートに書き込まれた後に応答を返すかを設定できます (wait_for_async_insert = 1)。

以下の二つの図は、async_insert と wait_for_async_insert の設定を示しています：

<img src={asyncInsert02}
  class="image"
  alt="非同期インサートプロセス - async_insert=1, wait_for_async_insert=1"
  style={{width: '100%', background: 'none'}} />

<img src={asyncInsert03}
  class="image"
  alt="非同期インサートプロセス - async_insert=1, wait_for_async_insert=0"
  style={{width: '100%', background: 'none'}} />

### 非同期インサートの有効化 {#enabling-asynchronous-inserts}

非同期インサートは、特定のユーザーまたは特定のクエリに対して有効化できます：

- ユーザー レベルで非同期インサートを有効化します。この例では、ユーザー `default` を使用していますが、別のユーザーを作成した場合は、そのユーザー名に置き換えてください：
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- インサートクエリの SETTINGS 節を使用して非同期インサート設定を指定できます：
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- ClickHouse プログラミング言語クライアントを使用する際に、接続パラメータとして非同期インサート設定を指定することもできます。

  例えば、このようにして、ClickHouse Cloud に接続するために ClickHouse Java JDBC ドライバを使用する JDBC 接続文字列内で設定できます：
  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```

非同期インサートを使用する場合は、async_insert=1,wait_for_async_insert=1 を使用することを強くお勧めします。wait_for_async_insert=0 を使用するのは非常にリスキーです。なぜなら、INSERT クライアントがエラーを認識しない可能性があり、ClickHouse サーバーが書き込みを減速し、サービスの信頼性を確保するためにバックプレッシャーを作成する必要がある場面で、クライアントが迅速に書き込みを続けると潜在的な過負荷を引き起こす可能性があります。

:::note 自動重複排除は、非同期インサートを使用する場合はデフォルトで無効です
手動バッチ処理（[バルクインサート](/cloud/bestpractices/bulkinserts.md)を参照）は、特に同じ挿入ステートメントが ClickHouse Cloud に複数回送信される（例えば、クライアントソフトウェアの一時的なネットワーク接続の問題による自動再試行など）場合に、テーブルデータの[ビルトイン自動重複排除](/engines/table-engines/mergetree-family/replication.md)をサポートするという利点があります。
:::
