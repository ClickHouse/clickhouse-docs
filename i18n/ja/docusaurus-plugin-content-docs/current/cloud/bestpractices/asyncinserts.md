---
slug: /cloud/bestpractices/asynchronous-inserts
sidebar_label: 非同期挿入
title: 非同期挿入 (async_insert)
---

ClickHouseに大量のデータをバッチで挿入することは、ベストプラクティスです。これにより、計算サイクルとディスクI/Oを節約でき、結果的にコストを削減できます。もしあなたのユースケースが、ClickHouseの外部で挿入をバッチ処理することを許可するのであれば、それが一つの選択肢です。しかし、ClickHouseにバッチ処理をさせたい場合は、ここで説明する非同期INSERTモードを使用できます。

非同期挿入は、クライアント側でデータをバッチ処理することや、毎秒1つのINSERTクエリに挿入率を保つことの代替手段として使用できます。これには、[async_insert](/operations/settings/settings.md/#async_insert)設定を有効にします。これにより、ClickHouseがサーバー側でバッチ処理を行うようになります。

デフォルトでは、ClickHouseは同期的にデータを書き込みます。
ClickHouseに送信される各INSERTは、即座に挿入データを含むパートを生成します。
これは、async_insert設定がデフォルト値の0に設定されているときの動作です：

![compression block diagram](images/async-01.png)

async_insertを1に設定すると、ClickHouseは最初に受信したINSERTをメモリ内バッファに格納し、その後定期的にディスクにフラッシュします。

ClickHouseがバッファをディスクにフラッシュする原因となる可能性のある条件は以下の2つです：
- バッファのサイズがNバイトに達した (Nは[async_insert_max_data_size](/operations/settings/settings.md/#async_insert_max_data_size)で設定可能)
- 最後のバッファフラッシュからNミリ秒が経過した (Nは[async_insert_busy_timeout_max_ms](/operations/settings/settings.md/#async_insert_busy_timeout_max_ms)で設定可能)

上記のいずれかの条件が満たされると、ClickHouseはメモリ内バッファをディスクにフラッシュします。

:::note
データがストレージのパートに書き込まれた後、あなたのデータは読み取りクエリに利用可能になります。このことを念頭に置いて、`async_insert_busy_timeout_ms`（デフォルトで1秒に設定）や`async_insert_max_data_size`（デフォルトで10MiBに設定）を変更してください。
:::

[wait_for_async_insert](/operations/settings/settings.md/#wait_for_async_insert)設定を使用すると、INSERTステートメントがバッファにデータが挿入された後に即座に確認を返すか（wait_for_async_insert = 0）、デフォルトで、データがパートに書き込まれた後にフラッシュされる際に確認を返すかを設定できます（wait_for_async_insert = 1）。

以下の2つの図は、async_insertとwait_for_async_insertの2つの設定を示しています：

![compression block diagram](images/async-02.png)

![compression block diagram](images/async-03.png)


### 非同期挿入の有効化 {#enabling-asynchronous-inserts}

非同期挿入は特定のユーザーまたは特定のクエリに対して有効にできます：

- ユーザーレベルで非同期挿入を有効にする。この例ではユーザー`default`を使用していますが、異なるユーザーを作成した場合は、そのユーザー名に置き換えてください：
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- 挿入クエリのSETTINGS句を使用して非同期挿入の設定を指定できます：
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- ClickHouseプログラミング言語クライアントを使用する際に、接続パラメータとして非同期挿入の設定を指定することもできます。

  たとえば、ClickHouse Cloudに接続するためにClickHouse Java JDBCドライバを使用する際には、JDBC接続文字列内で次のように設定できます：
  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
非同期挿入を使用している場合は、async_insert=1,wait_for_async_insert=1を使用することを強くお勧めします。wait_for_async_insert=0を使用すると非常に危険です。なぜなら、INSERTクライアントがエラーを認識しない可能性があり、またClickHouseサーバーが書き込みを遅くし、サービスの信頼性を確保するためにバックプレッシャーを生成することが必要な状況で、クライアントが速やかに書き込みを続けると、過負荷を引き起こす可能性があるからです。

:::note 非同期挿入を使用する際の自動重複排除はデフォルトで無効です
手動バッチ処理（[バルク挿入](/cloud/bestpractices/bulkinserts.md)を参照）は、クライアントソフトウェアが一時的なネットワーク接続の問題により自動再試行を行った結果として、同じINSERTステートメントがClickHouse Cloudに複数回送信された場合など、テーブルデータの[組み込みの自動重複排除](/engines/table-engines/mergetree-family/replication.md)をサポートする利点があります。
:::
