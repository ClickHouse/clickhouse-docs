---
'sidebar_label': 'PostgreSQL CDC'
'slug': '/cloud/reference/billing/clickpipes/postgres-cdc'
'title': 'PostgreSQL CDCのためのClickPipes'
'description': 'PostgreSQL CDC ClickPipesの請求の概要'
'doc_type': 'reference'
---


# ClickPipes for PostgreSQL CDC {#clickpipes-for-postgresql-cdc}

このセクションでは、ClickPipesにおけるPostgres変更データキャプチャ（CDC）コネクタの価格モデルについて説明します。このモデルの設計の目的は、価格を非常に競争力のあるものに保ちながら、私たちの核となるビジョンに忠実であることでした：

> 顧客がPostgresからClickHouseにデータをシームレスかつ手頃な価格で移動し、リアルタイム分析を行えるようにすること。

このコネクタは、外部ETLツールや他のデータベースプラットフォームの類似機能に比べて**5倍以上コスト効果が高い**です。

:::note
Postgres CDC ClickPipesを使用するすべての顧客（既存および新規）に対して、価格は**2025年9月1日**から月次請求書で計測され始めました。
:::

## 価格の次元 {#pricing-dimensions}

価格には2つの主要な次元があります：

1. **取り込まれたデータ**：PostgresからClickHouseに取り込まれる生の圧縮されていないバイト。
2. **コンピュート**：複数のPostgres CDC ClickPipesを管理するためにサービスごとに確保されたコンピュートユニットで、ClickHouse Cloudサービスで使用されるコンピュートユニットとは別です。この追加コンピュートは、Postgres CDC ClickPipes専用です。コンピュートは、個々のパイプではなく、サービスレベルで請求されます。各コンピュートユニットには2つのvCPUと8GBのRAMが含まれます。

### 取り込まれたデータ {#ingested-data}

Postgres CDCコネクタは、2つの主要なフェーズで動作します：

- **初期ロード/再同期**：これはPostgresテーブルの完全なスナップショットをキャプチャし、パイプが初めて作成されるか再同期されるときに発生します。
- **継続的レプリケーション（CDC）**：PostgresからClickHouseへの挿入、更新、削除、スキーマの変更などの変更を継続的にレプリケートします。

ほとんどのユースケースでは、継続的レプリケーションがClickPipeのライフサイクルの90%以上を占めます。初期ロードは大量のデータを一度に転送するため、私たちはそのフェーズに対して低い料金を提供しています。

| フェーズ                           | コスト          |
|------------------------------------|-----------------|
| **初期ロード/再同期**             | $0.10 per GB    |
| **継続的レプリケーション（CDC）** | $0.20 per GB    |

### コンピュート {#compute}

この次元は、Postgres ClickPipes専用にサービスごとに確保されたコンピュートユニットをカバーします。コンピュートは、サービス内のすべてのPostgresパイプで共有されます。**最初のPostgresパイプが作成されるときに確保され、Postgres CDCパイプが残っていない場合に解放されます**。確保されるコンピュートの量は、組織のティアによって異なります。

| ティア                          | コスト                                         |
|----------------------------------|-----------------------------------------------|
| **ベーシックティア**             | サービスごとに0.5コンピュートユニット — $0.10 per hour |
| **スケールまたはエンタープライズティア** | サービスごとに1コンピュートユニット — $0.20 per hour   |

### 例 {#example}

あなたのサービスがスケールティアにあり、次の設定を持っているとしましょう：

- 継続的レプリケーションを実行している2つのPostgres ClickPipes
- 各パイプが月に500 GBのデータ変更（CDC）を取り込む
- 最初のパイプが開始されると、サービスはPostgres CDCのために**スケールティアの下で1コンピュートユニット**を確保します

#### 月間コスト内訳 {#cost-breakdown}

**取り込まれたデータ（CDC）**：

$$ 2 \text{ pipes} \times 500 \text{ GB} = 1,000 \text{ GB per month} $$

$$ 1,000 \text{ GB} \times \$0.20/\text{GB} = \$200 $$

**コンピュート**：

$$1 \text{ compute unit} \times \$0.20/\text{hr} \times 730 \text{ hours (approximate month)} = \$146$$

:::note
コンピュートは両方のパイプで共有されます
:::

**合計月間コスト**：

$$\$200 \text{ (ingest)} + \$146 \text{ (compute)} = \$346$$

## Postgres CDC ClickPipesに関するFAQ {#faq-postgres-cdc-clickpipe}

<details>

<summary>価格に基づく取り込まれたデータは圧縮サイズまたは非圧縮サイズのどちらで測定されますか？</summary>

取り込まれたデータは、Postgresからの_非圧縮データ_として測定されます—初期ロードとCDC（レプリケーションスロット経由）両方の間。Postgresはデフォルトでデータを転送中に圧縮しないため、ClickPipeは生の非圧縮バイトを処理します。

</details>

<details>

<summary>Postgres CDCの価格はいつ請求書に表示されますか？</summary>

Postgres CDC ClickPipesの価格は、すべての顧客（既存および新規）の月次請求書に**2025年9月1日**から表示され始めました。

</details>

<details>

<summary>パイプを一時停止した場合、料金は課金されますか？</summary>

パイプが一時停止されている間はデータ取り込み料金は適用されませんが、コンピュート料金は依然として適用されます—組織のティアによって0.5または1コンピュートユニットに基づいています。これは固定サービスレベルのコストであり、そのサービス内のすべてのパイプに適用されます。

</details>

<details>

<summary>価格をどのように推定できますか？</summary>

ClickPipesの概要ページでは、初期ロード/再同期とCDCデータボリュームに関するメトリクスが提供されます。これらのメトリクスをClickPipesの価格と併用することで、Postgres CDCのコストを推定できます。

</details>

<details>

<summary>サービスのPostgres CDCに割り当てられたコンピュートをスケールできますか？</summary>

デフォルトでは、コンピュートのスケーリングはユーザー構成可能ではありません。確保されたリソースは、ほとんどの顧客のワークロードを最適に処理できるように最適化されています。ユースケースがより多くまたは少ないコンピュートを必要とする場合は、リクエストを評価できるようにサポートチケットを開いてください。

</details>

<details>

<summary>価格の粒度はどのようになっていますか？</summary>

- **コンピュート**：時間単位で請求されます。部分的な時間は次の時間に切り上げられます。
- **取り込まれたデータ**：非圧縮データのギガバイト（GB）単位で測定され請求されます。

</details>

<details>

<summary>ClickPipes経由でPostgres CDCにClickHouse Cloudクレジットを使用できますか？</summary>

はい。ClickPipesの価格は一体型ClickHouse Cloud価格の一部です。お持ちのプラットフォームクレジットは、ClickPipesの使用に自動的に適用されます。

</details>

<details>

<summary>既存の月額ClickHouse Cloud支出に対して、Postgres CDC ClickPipesからはどれくらいの追加コストが予想されますか？</summary>

コストはユースケース、データボリューム、および組織ティアに基づいて変わります。とはいえ、ほとんどの既存顧客は、トライアル後の既存の月額ClickHouse Cloud支出に対して**0〜15%**の増加を見ています。実際のコストはワークロードによって異なる場合があります—いくつかのワークロードは処理が少なく高いデータボリュームを含み、他はデータが少なく処理が多く必要です。

</details>
