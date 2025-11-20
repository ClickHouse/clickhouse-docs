---
sidebar_label: '管理 API 密钥'
slug: /cloud/manage/openapi
title: '管理 API 密钥'
description: 'ClickHouse Cloud 提供了一个遵循 OpenAPI 规范的 API，允许你以编程方式管理你的账户及服务的各个方面。'
doc_type: 'guide'
keywords: ['api', 'openapi', 'rest api', 'documentation', 'cloud management']
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# 管理 API 密钥

ClickHouse Cloud 提供了基于 OpenAPI 的 API，允许你以编程方式管理你的账户及服务的各个方面。

:::note
本文档介绍的是 ClickHouse Cloud API。关于数据库 API 端点，请参阅 [Cloud Endpoints API](/cloud/get-started/query-endpoints)
:::

1. 你可以使用左侧菜单中的 **API Keys** 选项卡来创建和管理你的 API 密钥。

<Image img={image_01} size="sm" alt="API Keys 选项卡" border />

2. **API Keys** 页面首次打开时会显示一个提示，用于创建你的第一个 API 密钥，如下所示。创建第一个密钥后，你可以使用右上角出现的 `New API Key` 按钮创建新的密钥。

<Image img={image_02} size="md" alt="API Keys 页面" border />

3. 要创建 API 密钥，指定密钥名称、密钥权限以及过期时间，然后点击 `Generate API Key`。

<br />

:::note
权限与 ClickHouse Cloud 的[预定义角色](/cloud/security/console-roles)保持一致。`developer` 角色对已分配服务具有只读权限，`admin` 角色对已分配服务具有完整读写权限。
:::

:::tip Query API Endpoints
要在 [Query API Endpoints](/cloud/get-started/query-endpoints) 中使用 API 密钥，请将 Organization Role 至少设置为 `Member`，并为 Service Role 授予对 `Query Endpoints` 的访问权限。
:::

<Image img={image_03} size="md" alt="创建 API 密钥表单" border />

4. 下一屏将显示你的 Key ID 和 Key secret。请复制这些值并将它们保存在安全的位置，例如密钥库。离开该页面后，这些值将不再显示。

<Image img={image_04} size="md" alt="API 密钥详情" border />

5. ClickHouse Cloud API 使用 [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) 来验证你的 API 密钥是否有效。下面是一个示例，展示如何使用 `curl` 利用 API 密钥向 ClickHouse Cloud API 发送请求：

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. 返回 **API Keys** 页面，你将看到密钥名称、Key ID 的后四位字符、权限、状态、到期日期以及创建者。你可以在此界面编辑密钥名称、权限和到期时间，也可以在此界面禁用或删除密钥。

<br />

:::note
删除 API 密钥是不可逆的操作。任何使用该密钥的服务都会立即失去对 ClickHouse Cloud 的访问权限。
:::

<Image img={image_05} size="md" alt="API Keys 管理页面" border />


## 端点 {#endpoints}

有关端点的详细信息,请参阅 [API 参考文档](https://clickhouse.com/docs/cloud/manage/api/swagger)。
使用您的 API Key 和 API Secret,配合基础 URL `https://api.clickhouse.cloud/v1` 进行调用。
