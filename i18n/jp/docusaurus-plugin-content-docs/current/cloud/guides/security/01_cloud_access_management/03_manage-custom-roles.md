---
sidebar_label: 'カスタムロールの管理'
slug: /cloud/guides/security/manage-custom-roles
title: 'カスタムロールの管理'
description: 'このページでは、管理者がカスタムロールを追加、変更、削除する方法を説明します'
doc_type: 'ガイド'
keywords: ['カスタムロール', 'セキュリティ', '権限']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/control_plane/1_users_and_roles.png'
import step_2 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/2_custom_role.png'
import step_3 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/3_custom_role.png'
import step_4 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/4_custom_role.png'
import step_5 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/5_custom_role.png'
import step_6 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/6_custom_role.png'

このガイドは、ClickHouse Cloud で Admin ロールを持つユーザーを対象としています。

ClickHouse Cloud のお客様は、定義済みのシステムロールから選択することも、ユーザーに割り当てるカスタムロールを作成することもできます。システムロールとそれに関連する権限の詳細については、[Console roles and permissions](/cloud/security/console-roles)を参照してください。このガイドでは、カスタムロールの管理方法について説明します。

## カスタムロールを作成する \{#create-custom-role\}

カスタムロールには、組織、サービス、データベースに関する権限を組み合わせて設定できます。権限は、すべてのサービスとデータベース、またはその一部のサービスやデータベースに適用できます。

<VerticalStepper headerLevel="h3">
  ### 組織設定にアクセスし、`Users and roles` を選択する \{#users-and-roles-1\}

  services ページで、組織名を選択します。表示されたポップアップメニューから `Users and roles` を選択します。

  <Image img={step_1} size="lg" />

  ### `Roles` タブを選択する \{#roles-tab\}

  画面上部中央にある `Roles` タブを選択します。

  <Image img={step_2} size="lg" />

  ### 右上の `Create new role` を選択する \{#create-new-role\}

  画面右上にある `Create new role` ボタンを選択します。

  <Image img={step_3} size="lg" />

  ### ロール名を設定する \{#name-the-role\}

  わかりやすいロール名を入力します。この名前は、ユーザーや API キーにロールを割り当てる際に表示されます。

  <Image img={step_4} size="md" />

  ### `Allow` をクリックし、権限の適用範囲を選択する \{#scope-permissions\}

  `Allow` ボタンをクリックし、Organization、Service、Database の権限を選択します。すべての権限の説明については、[Console roles and permissions](/cloud/security/console-roles) を参照してください。

  :::tip
  Console にログインするユーザーには、少なくとも Organization &gt; Access organization 権限が必要です。
  :::

  <Image img={step_5} size="md" />

  ### 新しいロールを確認する \{#review-role\}

  作成を確定する前に、新しいロールに割り当てた権限を確認します。問題がなければ、`Create role` をクリックします。

  <Image img={step_6} size="md" />
</VerticalStepper>

## カスタムロールを更新する \{#update-custom-role\}

カスタムロールは、作成後に更新できます。ロールから削除された権限はユーザーから失われ、追加された権限はユーザーに付与されます。

:::tip
ユーザー権限は加算式です。ユーザーが複数のロールを通じて同じ操作を実行する権限を持っている場合、1 つのロールからその権限を削除しただけでは、すぐにアクセスできなくならないことがあります。
:::

1. 組織の設定に移動し、`Users and roles` を選択します
2. `Roles` タブを選択します
3. 更新するロールの横にある 3 点メニューを選択します
4. `Edit` を選択します
5. 権限を変更します
6. `Edit role` を選択します

## カスタムロールを削除する \{#delete-custom-role\}

カスタムロールはいつでも削除できます。

:::warning
組織内には、管理権限を持つユーザーが少なくとも 1 人必要です。ロールを削除した結果、最後の 1 人から管理権限がなくなる場合、そのロールは削除できません。これを回避するには、カスタムロールを削除する前に、少なくとも 1 人のユーザーに Admin システムロールを割り当ててください。
:::

1. 組織設定を開き、`Users and roles` を選択します
2. `Roles` タブを選択します
3. 削除するロールの横にある 3 点メニューを選択します
4. ロールの削除によってアクセスを失うユーザーと API キーを確認します。必要に応じて割り当てを調整してください。
5. `Delete role` を選択してプロセスを完了します