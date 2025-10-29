---
'slug': '/use-cases/observability/clickstack/alerts'
'title': 'Search with ClickStack'
'sidebar_label': 'Alerts'
'pagination_prev': null
'pagination_next': null
'description': 'Alerts with ClickStack'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import search_alert from '@site/static/images/use-cases/observability/search_alert.png';

## 検索アラート {#search-alerts}

[検索](/use-cases/observability/clickstack/search)を入力した後、検索に一致するイベント（ログまたはスパン）の数がしきい値を超えたり下回ったりしたときに通知されるアラートを作成できます。

### アラートの作成 {#creating-an-alert}

`Search`ページの右上にある`Alerts`ボタンをクリックすることでアラートを作成できます。

ここから、アラートの名前を付けることができ、しきい値、期間、通知方法（Slack、Email、PagerDuty、またはSlack webhook）を設定できます。

`grouped by`の値により、検索が集約の対象となります（例：`ServiceName`）、これにより同じ検索から複数のアラートをトリガーすることが可能になります。

<Image img={search_alert} alt="Search alerts" size="lg"/>

### 一般的なアラートシナリオ {#common-alert-scenarios}

HyperDXを使用して利用できる一般的なアラートシナリオをいくつか紹介します：

**エラー:** 最初に、過剰なエラーが発生したときに通知を受けるために、デフォルトの`All Error Events`および`HTTP Status >= 400`の保存された検索に対してアラートを設定することをお勧めします。

**遅延操作:** 遅延操作（例：`duration:>5000`）の検索を設定し、遅延操作が多すぎる場合にアラートを発報することができます。

**ユーザーイベント:** 新しいユーザーがサインアップしたときや重要なユーザーアクションが実行されたときに通知を受けるために、顧客向けチーム向けのアラートを設定することもできます。
