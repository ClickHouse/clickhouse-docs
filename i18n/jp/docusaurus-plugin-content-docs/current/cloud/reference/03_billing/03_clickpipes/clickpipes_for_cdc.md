---
sidebar_label: 'PostgreSQL CDC'
slug: /cloud/reference/billing/clickpipes/postgres-cdc
title: 'PostgreSQL CDC 用 ClickPipes'
description: 'PostgreSQL CDC ClickPipes の課金概要'
doc_type: 'reference'
keywords: ['billing', 'clickpipes', 'cdc pricing', 'costs', 'pricing']
---



# PostgreSQL CDC用ClickPipes {#clickpipes-for-postgresql-cdc}

このセクションでは、ClickPipesにおけるPostgres Change Data Capture（CDC）コネクタの料金体系について説明します。この料金体系の設計において、当社の中核となるビジョンに忠実でありながら、高い競争力のある価格を維持することを目標としました：

> お客様がPostgresからClickHouseへリアルタイム分析のためにデータを移行することを、シームレスかつ手頃な価格で実現する。

このコネクタは、外部のETLツールや他のデータベースプラットフォームの類似機能と比較して、**5倍以上のコスト効率**を実現しています。

:::note
Postgres CDC ClickPipesを使用するすべてのお客様（既存および新規の両方）に対して、**2025年9月1日**から月次請求での料金計測が開始されました。
:::


## 料金体系 {#pricing-dimensions}

料金には2つの主要な要素があります：

1. **取り込みデータ**: Postgresから送信され、ClickHouseに取り込まれる未圧縮の生バイト数。
2. **コンピュート**: サービスごとにプロビジョニングされるコンピュートユニットは、複数のPostgres CDC ClickPipesを管理し、ClickHouse Cloudサービスで使用されるコンピュートユニットとは別のものです。この追加コンピュートはPostgres CDC ClickPipes専用です。コンピュートは個別のパイプごとではなく、サービスレベルで課金されます。各コンピュートユニットには2 vCPUと8 GBのRAMが含まれます。

### 取り込みデータ {#ingested-data}

Postgres CDCコネクタは2つの主要なフェーズで動作します：

- **初期ロード / 再同期**: Postgresテーブルの完全なスナップショットを取得します。これはパイプが最初に作成されたとき、または再同期されたときに発生します。
- **継続的レプリケーション (CDC)**: PostgresからClickHouseへの変更（挿入、更新、削除、スキーマ変更など）の継続的なレプリケーション。

ほとんどのユースケースでは、継続的レプリケーションがClickPipeのライフサイクルの90%以上を占めます。初期ロードは大量のデータを一度に転送するため、このフェーズには低い料金を設定しています。

| フェーズ                            | コスト         |
| -------------------------------- | ------------ |
| **初期ロード / 再同期**        | $0.10 per GB |
| **継続的レプリケーション (CDC)** | $0.20 per GB |

### コンピュート {#compute}

この要素は、Postgres ClickPipes専用にサービスごとにプロビジョニングされるコンピュートユニットをカバーします。コンピュートはサービス内のすべてのPostgresパイプ間で共有されます。**最初のPostgresパイプが作成されたときにプロビジョニングされ、Postgres CDCパイプがなくなった時点で解放されます**。プロビジョニングされるコンピュート量は、組織のティアによって異なります：

| ティア                         | コスト                                          |
| ---------------------------- | --------------------------------------------- |
| **Basicティア**               | サービスあたり0.5コンピュートユニット — $0.10/時間 |
| **ScaleまたはEnterpriseティア** | サービスあたり1コンピュートユニット — $0.20/時間   |

### 例 {#example}

サービスがScaleティアにあり、以下の構成を持つとします：

- 継続的レプリケーションを実行する2つのPostgres ClickPipes
- 各パイプは月あたり500 GBのデータ変更（CDC）を取り込む
- 最初のパイプが開始されると、サービスはPostgres CDC用に**Scaleティアで1コンピュートユニット**をプロビジョニングする

#### 月額コストの内訳 {#cost-breakdown}

**取り込みデータ (CDC)**:

$$ 2 \text{ パイプ} \times 500 \text{ GB} = 1,000 \text{ GB/月} $$

$$ 1,000 \text{ GB} \times \$0.20/\text{GB} = \$200 $$

**コンピュート**:

$$1 \text{ コンピュートユニット} \times \$0.20/\text{時間} \times 730 \text{ 時間（概算月間）} = \$146$$

:::note
コンピュートは両方のパイプ間で共有されます
:::

**月額合計コスト**:

$$\$200 \text{ (取り込み)} + \$146 \text{ (コンピュート)} = \$346$$


## Postgres CDC ClickPipes に関するよくある質問 {#faq-postgres-cdc-clickpipe}

<details>

<summary>
  料金計算において、取り込まれたデータは圧縮サイズと非圧縮サイズのどちらで測定されますか?
</summary>

取り込まれたデータは、初期ロード時とCDC時(レプリケーションスロット経由)の両方において、Postgresから送信される_非圧縮データ_として測定されます。Postgresはデフォルトで転送中のデータを圧縮せず、ClickPipeは生の非圧縮バイトを処理します。

</details>

<details>

<summary>Postgres CDCの料金はいつから請求書に表示されますか?</summary>

Postgres CDC ClickPipesの料金は、既存顧客と新規顧客の両方に対して、**2025年9月1日**から月次請求書に表示されるようになりました。

</details>

<details>

<summary>パイプを一時停止した場合、料金は発生しますか?</summary>

パイプが一時停止されている間は、データが移動しないため、データ取り込み料金は発生しません。ただし、コンピュート料金は引き続き適用され、組織のティアに基づいて0.5または1コンピュートユニットが課金されます。これはサービスレベルの固定コストであり、そのサービス内のすべてのパイプに適用されます。

</details>

<details>

<summary>料金を見積もるにはどうすればよいですか?</summary>

ClickPipesの概要ページには、初期ロード/再同期とCDCデータ量の両方のメトリクスが表示されます。これらのメトリクスをClickPipesの料金体系と組み合わせて使用することで、Postgres CDCのコストを見積もることができます。

</details>

<details>

<summary>
  サービス内のPostgres CDCに割り当てられたコンピュートをスケールできますか?
</summary>

デフォルトでは、コンピュートのスケーリングはユーザーが設定できません。プロビジョニングされたリソースは、ほとんどの顧客のワークロードを最適に処理できるように最適化されています。ユースケースでより多くまたはより少ないコンピュートが必要な場合は、サポートチケットを開いていただければ、リクエストを評価いたします。

</details>

<details>

<summary>料金の粒度はどのようになっていますか?</summary>

- **コンピュート**: 時間単位で課金されます。1時間未満の使用は次の時間に切り上げられます。
- **取り込みデータ**: 非圧縮データのギガバイト(GB)単位で測定され、課金されます。

</details>

<details>

<summary>
  ClickPipes経由のPostgres CDCにClickHouse Cloudクレジットを使用できますか?
</summary>

はい。ClickPipesの料金は統合されたClickHouse Cloud料金体系の一部です。お持ちのプラットフォームクレジットは、ClickPipesの使用にも自動的に適用されます。

</details>

<details>

<summary>
  既存の月次ClickHouse Cloud支出に対して、Postgres CDC ClickPipesからどの程度の追加コストが見込まれますか?
</summary>

コストは、ユースケース、データ量、組織のティアによって異なります。とはいえ、ほとんどの既存顧客は、トライアル後の既存の月次ClickHouse Cloud支出に対して**0〜15%**の増加を経験しています。実際のコストはワークロードによって異なる場合があります。一部のワークロードは大量のデータと少ない処理を伴い、他のワークロードは少ないデータでより多くの処理を必要とします。

</details>
