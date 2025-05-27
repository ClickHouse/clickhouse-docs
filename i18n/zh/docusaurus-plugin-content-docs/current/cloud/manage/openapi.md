---
'sidebar_label': '管理 API 密钥'
'slug': '/cloud/manage/openapi'
'title': '管理 API 密钥'
'description': 'ClickHouse Cloud 提供一个利用 OpenAPI 的 API，允许您以编程方式管理您的帐户和服务的各个方面。'
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# 管理 API 密钥

ClickHouse Cloud 提供了一个利用 OpenAPI 的 API，使您可以以编程方式管理您的账户和服务的各个方面。

:::note
本文档涵盖了 ClickHouse Cloud API。有关数据库 API 端点的信息，请参见 [Cloud Endpoints API](/cloud/get-started/query-endpoints.md)
:::

1. 您可以使用左侧菜单中的 **API 密钥** 选项卡来创建和管理您的 API 密钥。

  <Image img={image_01} size="sm" alt="API Keys tab" border/>

2. **API 密钥** 页面最初会显示创建您的第一个 API 密钥的提示，如下所示。在您创建第一个密钥后，您可以使用右上角出现的 `New API Key` 按钮创建新密钥。

  <Image img={image_02} size="md" alt="API Keys page" border/>
  
3. 要创建 API 密钥，请指定密钥名称、权限和过期时间，然后点击 `Generate API Key`。
<br/>
:::note
权限与 ClickHouse Cloud 的 [预定义角色](/cloud/security/cloud-access-management/overview#console-users-and-roles) 对齐。开发者角色对分配的服务具有只读权限，而管理员角色具有完全的读写权限。
:::

  <Image img={image_03} size="md" alt="Create API key form" border/>

4. 下一个屏幕将显示您的密钥 ID 和密钥秘密。复制这些值并安全地保存，例如保存在保险箱中。离开此屏幕后，这些值将不会再显示。

  <Image img={image_04} size="md" alt="API key details" border/>

5. ClickHouse Cloud API 使用 [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) 来验证您的 API 密钥的有效性。以下是一个使用您的 API 密钥通过 `curl` 向 ClickHouse Cloud API 发送请求的示例：

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. 返回到 **API 密钥** 页面，您将看到密钥名称、密钥 ID 的最后四个字符、权限、状态、过期日期和创建者。您可以从此屏幕编辑密钥名称、权限和过期时间。密钥也可以在此屏幕上被禁用或删除。
<br/>
:::note
删除 API 密钥是一个永久性操作。任何使用该密钥的服务将立即失去访问 ClickHouse Cloud 的权限。
:::

  <Image img={image_05} size="md" alt="API Keys management page" border/>

## 端点 {#endpoints}

有关端点的详细信息，请参阅 [API reference](https://clickhouse.com/docs/cloud/manage/api/swagger)。 
使用您的 API 密钥和 API 秘密与基本 URL `https://api.clickhouse.cloud/v1`。
