---
'slug': '/cloud/guides/sql-console/configure-org-service-role-assignments'
'sidebar_label': '組織とサービス役割の割り当ての設定'
'title': 'コンソール内での組織とサービス役割の割り当ての設定'
'description': 'コンソール内でのorgおよびサービス役割の割り当ての設定方法を示すガイド'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/org_level_access/1_org_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/org_level_access/2_org_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/org_level_access/3_org_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/org_level_access/4_org_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/org_level_access/5_org_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/org_level_access/6_org_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/org_level_access/7_org_settings.png'


# コンソール内での組織およびサービスロールの割り当ての設定

> このガイドでは、組織およびサービスレベルでのロールの割り当てを設定する方法を示します。

<VerticalStepper>

## 組織設定にアクセスする {#access-service-settings}

サービスページから、あなたの組織の名前を選択します：

<Image img={step_1} size="md"/>

ポップアップメニューから `Users and roles` メニュー項目を選択します。

<Image img={step_2} size="md"/>

## ユーザーごとのアクセスを調整する {#access-per-user}

アクセスを変更したいユーザーの行の最後にあるメニュー項目を選択します：

<Image img={step_3} size="lg"/>

`edit` を選択します：

<Image img={step_4} size="lg"/>

ページの右側にタブが表示されます：

<Image img={step_5} size="lg"/>

ドロップダウンメニュー項目を選択して、コンソール全体のアクセス許可や、ユーザーが ClickHouse コンソール内でアクセスできる機能を調整します。
これにより、組織のための高レベルのアクセスと管理設定が管理されます：

| ロール        | 説明                                                                      |
|-------------|-------------------------------------------------------------------------------|
| `Admin`     | 組織のすべての管理活動を実行し、すべての設定を制御します。                   |
| `Developer` | サービスを除くすべてを表示し、同等またはそれ以下のアクセスで API キーを作成します。 |
| `Member`    | 個人のプロファイル設定を管理する能力を持つ状態でサインインします。             |
| `Billing`   | 使用状況と請求書を表示し、支払い方法を管理します。                          |

選択したユーザーのサービスロールのアクセス範囲を調整するために、ドロップダウンメニュー項目を選択します。
これは、個々のサービスのセキュリティと運用設定を定義します：

| アクセス範囲        |
|---------------------|
| `All services`      |
| `Specific services` |
| `No services`       |

`Specific services` を選択することで、サービスごとにユーザーのロールを制御できます：

<Image img={step_6} size="md"/>

次のロールから選択できます：

| ロール        | 説明                                                       |
|-------------|----------------------------------------------------------|
| `Admin`     | 設定とセキュリティの完全な制御。サービスを削除できます。  |
| `Read-only` | サービスデータとセキュリティ設定を表示できます。変更はできません。 |
| `No access` | サービスが存在することを知らない状態。                   |

タブの下部にある `Save changes` ボタンで変更を保存します：

<Image img={step_7} size="md"/>

</VerticalStepper>
