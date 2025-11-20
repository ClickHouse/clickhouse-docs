---
slug: /cloud/guides/sql-console/manage-sql-console-role-assignments
sidebar_label: 'SQL コンソールのロール割り当てを管理'
title: 'SQL コンソールのロール割り当てを管理'
description: 'SQL コンソールのロール割り当ての管理方法を説明するガイド'
doc_type: 'guide'
keywords: ['sql console', 'role assignments', 'access management', 'permissions', 'security']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/service_level_access/1_service_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/service_level_access/2_service_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/service_level_access/3_service_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/service_level_access/4_service_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/service_level_access/5_service_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/service_level_access/6_service_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/service_level_access/7_service_settings.png'


# SQLコンソールのロール割り当ての設定

> このガイドでは、SQLコンソールのロール割り当ての設定方法を説明します。ロール割り当てにより、コンソール全体のアクセス権限と、ユーザーがCloudコンソール内でアクセスできる機能が決定されます。

<VerticalStepper headerLevel="h3">

### サービス設定へのアクセス {#access-service-settings}

サービスページから、SQLコンソールのアクセス設定を調整するサービスの右上隅にあるメニューをクリックします。

<Image img={step_1} size='lg' />

ポップアップメニューから`settings`を選択します。

<Image img={step_2} size='lg' />

### SQLコンソールアクセスの調整 {#adjust-sql-console-access}

「Security」セクション内の「SQL console access」エリアを見つけます:

<Image img={step_3} size='md' />

### Service Adminの設定を更新 {#update-settings-for-service-admin}

Service Adminのドロップダウンメニューを選択して、Service Adminロールのアクセス制御設定を変更します:

<Image img={step_4} size='md' />

以下のロールから選択できます:

| ロール          |
| ------------- |
| `No access`   |
| `Read only`   |
| `Full access` |

### Service Read Onlyの設定を更新 {#update-settings-for-service-read-only}

Service Read Onlyのドロップダウンメニューを選択して、Service Read Onlyロールのアクセス制御設定を変更します:

<Image img={step_5} size='md' />

以下のロールから選択できます:

| ロール          |
| ------------- |
| `No access`   |
| `Read only`   |
| `Full access` |

### アクセス権を持つユーザーの確認 {#review-users-with-access}

ユーザー数を選択することで、サービスのユーザー概要を表示できます:

<Image img={step_6} size='md' />

ページの右側にタブが開き、ユーザーの総数とそのロールが表示されます:

<Image img={step_7} size='md' />

</VerticalStepper>
