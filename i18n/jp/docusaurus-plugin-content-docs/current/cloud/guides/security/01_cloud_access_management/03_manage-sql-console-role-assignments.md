---
slug: /cloud/guides/sql-console/manage-sql-console-role-assignments
sidebar_label: 'SQL コンソールのロール割り当てを管理'
title: 'SQL コンソールのロール割り当てを管理'
description: 'SQL コンソールのロール割り当てを管理する方法を説明するガイド'
doc_type: 'guide'
keywords: ['SQL コンソール', 'ロール割り当て', 'アクセス管理', '権限', 'セキュリティ']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/service_level_access/1_service_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/service_level_access/2_service_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/service_level_access/3_service_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/service_level_access/4_service_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/service_level_access/5_service_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/service_level_access/6_service_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/service_level_access/7_service_settings.png'

# SQL コンソールのロール割り当てを構成する {#configuring-sql-console-role-assignments}

> このガイドでは、Cloud コンソール全体でのアクセス権限と、Cloud コンソール内でユーザーが利用できる機能を決定する SQL コンソールのロール割り当ての構成方法について説明します。

<VerticalStepper headerLevel="h3">

### サービス設定にアクセスする {#access-service-settings}

Services ページで、SQL コンソールのアクセス設定を変更したい対象サービスの右上にあるメニューをクリックします。

<Image img={step_1} size="lg"/>

ポップアップメニューから `settings` を選択します。

<Image img={step_2} size="lg"/>

### SQL コンソールアクセスを調整する {#adjust-sql-console-access}

"Security" セクション内の "SQL console access" 項目を探します。

<Image img={step_3} size="md"/>

### Service Admin の設定を更新する {#update-settings-for-service-admin}

Service Admin のドロップダウンメニューを選択し、Service Admin ロールのアクセス制御設定を変更します。

<Image img={step_4} size="md"/>

次のロールから選択できます。

| Role          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

### Service Read Only の設定を更新する {#update-settings-for-service-read-only}

Service Read Only のドロップダウンメニューを選択し、Service Read Only ロールのアクセス制御設定を変更します。

<Image img={step_5} size="md"/>

次のロールから選択できます。

| Role          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

### アクセス権を持つユーザーを確認する {#review-users-with-access}

ユーザー数をクリックすると、そのサービスに対するユーザーの概要を表示できます。

<Image img={step_6} size="md"/>

ページ右側にタブが開き、ユーザーの合計数とそれぞれのロールが表示されます。

<Image img={step_7} size="md"/>

</VerticalStepper>
