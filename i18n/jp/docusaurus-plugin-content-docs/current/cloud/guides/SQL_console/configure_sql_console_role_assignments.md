---
'slug': '/cloud/guides/sql-console/config-sql-console-role-assignments'
'sidebar_label': 'SQLコンソールの役割割り当ての設定'
'title': 'SQLコンソールの役割割り当ての設定'
'description': 'SQLコンソールの役割割り当てを設定する方法を示すガイド'
'doc_type': 'guide'
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

> このガイドでは、SQLコンソールのロール割り当てを設定する方法を示します。これにより、コンソール全体のアクセス権限と、ユーザーがCloudコンソール内でアクセスできる機能が決まります。

<VerticalStepper>

## アクセスサービス設定 {#access-service-settings}

サービスページから、SQLコンソールのアクセス設定を調整したいサービスの右上隅にあるメニューをクリックします。

<Image img={step_1} size="lg"/>

ポップアップメニューから`settings`を選択します。

<Image img={step_2} size="lg"/>

## SQLコンソールアクセスの調整 {#adjust-sql-console-access}

「セキュリティ」セクションの「SQLコンソールアクセス」エリアを見つけます：

<Image img={step_3} size="md"/>

Service Adminのドロップダウンメニューを選択して、Service Adminロールのアクセス制御設定を変更します：

<Image img={step_4} size="md"/>

次のロールから選択できます：

| ロール          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

Service Read Onlyのドロップダウンメニューを選択して、Service Read Onlyロールのアクセス制御設定を変更します：

<Image img={step_5} size="md"/>

次のロールから選択できます：

| ロール          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

サービスのユーザーの概要は、ユーザー数を選択することで表示できます：

<Image img={step_6} size="md"/>

ページの右側に、総ユーザー数とそのロールを示すタブが開きます：

<Image img={step_7} size="md"/>

</VerticalStepper>
