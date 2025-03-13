---
sidebar_label: '管理 API 密钥'
slug: /cloud/manage/openapi
title: '管理 API 密钥'
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';


# 管理 API 密钥

ClickHouse Cloud 提供了一个利用 OpenAPI 的 API，允许您以编程方式管理您的账户和服务的各个方面。

:::note
本文档涵盖了 ClickHouse Cloud API。有关数据库 API 端点，请参见 [Cloud Endpoints API](//cloud/get-started/query-endpoints.md)
:::

1. 您可以使用左侧菜单中的 **API Keys** 选项卡来创建和管理您的 API 密钥。

  <img src={image_01} width="50%"/>

2. **API Keys** 页面最初将显示一个提示，以创建您的第一个 API 密钥，如下所示。在创建第一个密钥后，您可以使用右上角出现的 `New API Key` 按钮创建新的密钥。

  <img src={image_02} width="100%"/>
  
3. 要创建 API 密钥，请指定密钥名称、密钥权限和过期时间，然后点击 `Generate API Key`。
<br/>
:::note
权限与 ClickHouse Cloud [预定义角色](/cloud/security/cloud-access-management/overview#predefined-roles) 一致。开发者角色具有只读权限，管理员角色具有完全的读写权限。
:::

  <img src={image_03} width="100%"/>

4. 接下来的屏幕将显示您的 Key ID 和 Key secret。复制这些值并将其安全保存，例如放入保险柜中。离开此屏幕后，这些值将不会再显示。

  <img src={image_04} width="100%"/>

5. ClickHouse Cloud API 使用 [HTTP 基本认证](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) 来验证您的 API 密钥的有效性。以下是如何使用您的 API 密钥通过 `curl` 向 ClickHouse Cloud API 发送请求的示例：

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. 返回到 **API Keys** 页面，您将看到密钥名称、Key ID 的最后四个字符、权限、状态、过期日期和创建者。您可以从此屏幕编辑密钥名称、权限和到期时间。密钥也可以在此屏幕上禁用或删除。
<br/>
:::note
删除 API 密钥是一个永久性操作。任何使用该密钥的服务将立即失去访问 ClickHouse Cloud 的权限。
:::

  <img src={image_05} width="100%"/>

## 端点 {#endpoints}

[端点文档在这里](/cloud/manage/api/invitations-api-reference.md)。 使用您的 API Key 和 API Secret 与基本 URL `https://api.clickhouse.cloud/v1`。
