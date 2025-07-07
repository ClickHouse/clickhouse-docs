---
'title': '概要'
'slug': '/cloud/manage/jan-2025-faq/summary'
'keywords':
- 'new tiers'
- 'packaging'
- 'pricing faq'
- 'summary'
'description': '新しいClickHouse Cloud Tierの概要'
---



The following FAQ summarizes common questions with respect to new tiers introduced in ClickHouse Cloud starting in January 2025.

## What has changed with ClickHouse Cloud tiers? {#what-has-changed-with-clickhouse-cloud-tiers}

At ClickHouse, we are dedicated to adapting our products to meet the ever-changing requirements of our customers. Since its introduction in GA over the past two years, ClickHouse Cloud has evolved substantially, and we've gained invaluable insights into how our customers leverage our cloud offerings.

We are introducing new features to optimize the sizing and cost-efficiency of ClickHouse Cloud services for your workloads. These include compute-compute separation, high-performance machine types, and single-replica services. We are also evolving automatic scaling and managed upgrades to execute in a more seamless and reactive fashion.

We are adding a new Enterprise tier to serve the needs of the most demanding customers and workloads, with focus on industry-specific security and compliance features, even more controls over underlying hardware and upgrades, and advanced disaster recovery features.

You can read about these and other functional changes in this [blog](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings).

## What action is required? {#what-action-is-required}

To support these changes, we are restructuring our current tiers to more closely match how our evolving customer base is using our offerings, and you need to take action to select a new plan.

Details and timelines for making these selections are described below.

## How are tiers changing? {#how-are-tiers-changing}

We are transitioning from a model that organizes paid tiers purely by "service types" which are delineated by both capacity and features (namely, these are Development, Production, and Dedicated tiers) to one that organizes paid tiers by feature availability. These new tiers are called Basic, Scale, and Enterprise and are described in more detail below.

This change brings several key benefits:

* **Consistent Feature Access**: 機能は、すべてのサイズのサービスで利用可能であり、またその上のすべてのティアでも利用できます。たとえば、以前はProductionサービスタイプでのみ利用可能だったプライベートネットワーキングは、Scaleティアからすべてのサービスにアクセスできるようになるため、開発と本番のワークロードに応じてデプロイできます。
  
* **Organizational-Level Features**: 適切なプランとともに組織レベルで構築された機能を提供できるようになり、顧客が必要とするツールを適切なレベルのサービスで受け取れるようになります。たとえば、SSO（シングルサインオン）およびCMEK（顧客管理暗号化キー）へのアクセスはEnterpriseティアで利用可能です。

* **Optimized Support Plans**: 新しいパッケージ構造は、サポート応答時間を有料ティアと一致させることができ、さまざまな顧客のニーズを効果的に満たします。たとえば、Enterpriseティアの顧客には専任のサポートエンジニアが提供されます。

以下では、新しいティアの概要を提供し、ユースケースとの関連性を説明し、主要機能を概説します。

**Basic: A taste of ClickHouse**

* Basicティアは、データ量が少なく、要求の厳しくないワークロードを持つ組織向けの手頃なオプションを提供するように設計されています。このティアでは、最大12GBのメモリと\< 1TBのストレージを持つ単一レプリカデプロイメントを実行可能であり、信頼性保証を必要としない小規模なユースケースに最適です。

**Scale: Enhanced SLAs and scalability**

* Scaleティアは、強化されたSLA、高いスケーラビリティおよび高度なセキュリティ対策を必要とするワークロードに適しています。
* 任意のレプリケーションファクターで無制限のコンピュートとストレージを提供し、コンピュート-コンピュート分離へのアクセス、そして自動的な垂直および水平方向のスケーリングを提供します。
* 主な機能には次のものが含まれます：
  * プライベートネットワーキング、カスタマイズバックアップコントロール、多要素認証などのサポート
  * 最適化されたリソース使用のためのコンピュート-コンピュート分離
  * 変化する需要に応じた柔軟なスケーリングオプション（垂直および水平の両方）

**Enterprise: Mission-critical deployments**

* Enterpriseティアは、大規模でミッションクリティカルなClickHouseデプロイメントを実行するための最適な場所です。
* 最も厳格なセキュリティおよびコンプライアンスのニーズを持つ組織に最適で、最高レベルのパフォーマンスと信頼性を必要とします。
* 主な機能には次のものが含まれます：
  * HIPAAなどの業界特有のコンプライアンス認証
  * SSO（シングルサインオン）およびCMEK（顧客管理暗号化キー）へのセルフサービスアクセス
  * 最小限の中断を保証するスケジュールされたアップグレード
  * 高メモリ、高CPUオプションおよびプライベートリージョンを含むカスタム構成のサポート

新しいティアの詳細は、私たちの[ウェブサイト](https://clickhouse.com/pricing)で説明されています。

## How is pricing changing? {#how-is-pricing-changing}

In addition to evolving our paid tiers, we are making the following adjustments to our overall pricing structure and price points:

* **Storage**: ストレージのTBあたりの価格が引き下げられ、ストレージコストにバックアップは含まれなくなります。
* **Backups**: バックアップは別途料金が発生し、1つのバックアップのみが必須となります。
* **Compute**: コンピュートコストは増加し、ティアとリージョンによって異なります。この増加は、コンピュート-コンピュート分離および単一レプリカサービスの導入によりバランスが取られる場合があります。
* **Data Transfer**: インターネット経由のデータ転送および地域を越えたデータ転送に対して料金を導入します。私たちの分析に基づくと、ほとんどの顧客はこの新しい次元に基づいて月額料金が大幅に増加しないと考えています。
* **ClickPipes**: 管理されたインジェストサービスは、導入期間中は無料で提供されていましたが、現在はコンピュートと取り込まれたデータに基づいて料金が発生します。私たちの分析に基づくと、ほとんどの顧客はこの新しい次元に基づいて月額料金が大幅に増加しないと考えています。

## When will these changes take effect? {#when-will-these-changes-take-effect}

While changes are effective immediately for new customers, existing customers will have from 6 months to a year to transition to new plans.

Detailed breakdown of effective dates is below:

* **New Customers**: 新しいプランは、ClickHouse Cloudの新規顧客に対して**2025年1月27日**に発効します。
* **Existing PAYG Customers**: 従量課金制（PAYG）の顧客は、**2025年7月23日**までの6ヶ月間に新しいプランに移行する必要があります。
* **Existing Committed Spend Customers**: コミットメント契約のある顧客は、現在の契約の終了時に条件を再交渉できます。
* **New usage dimensions** for Data Transfer and ClickPipes are effective for both PAYG and Committed Spend customers 8 weeks following this announcement on **2025年3月24日**.

## What actions should you take? {#what-actions-should-you-take}

If you are a **pay-as-you-go (PAYG) customer**, you can migrate to a new plan through the self-service options available in your ClickHouse Cloud console.

If you are a **committed spend customer**, please reach out to your account representative to discuss your custom migration plan and timeline.

**Need assistance?**
We're here to support you through this transition. If you have any questions or need personalized help, please reach out to your account representative or contact our support team.
