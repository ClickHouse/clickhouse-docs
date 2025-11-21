---
slug: /cloud/manage/postman
sidebar_label: "使用 Postman 进行编程式 API 访问"
title: "使用 Postman 进行编程式 API 访问"
description: "本指南将帮助您使用 Postman 测试 ClickHouse Cloud API"
doc_type: "guide"
keywords: ["api", "postman", "rest api", "云管理", "集成"]
---

import Image from "@theme/IdealImage"
import postman1 from "@site/static/images/cloud/manage/postman/postman1.png"
import postman2 from "@site/static/images/cloud/manage/postman/postman2.png"
import postman3 from "@site/static/images/cloud/manage/postman/postman3.png"
import postman4 from "@site/static/images/cloud/manage/postman/postman4.png"
import postman5 from "@site/static/images/cloud/manage/postman/postman5.png"
import postman6 from "@site/static/images/cloud/manage/postman/postman6.png"
import postman7 from "@site/static/images/cloud/manage/postman/postman7.png"
import postman8 from "@site/static/images/cloud/manage/postman/postman8.png"
import postman9 from "@site/static/images/cloud/manage/postman/postman9.png"
import postman10 from "@site/static/images/cloud/manage/postman/postman10.png"
import postman11 from "@site/static/images/cloud/manage/postman/postman11.png"
import postman12 from "@site/static/images/cloud/manage/postman/postman12.png"
import postman13 from "@site/static/images/cloud/manage/postman/postman13.png"
import postman14 from "@site/static/images/cloud/manage/postman/postman14.png"
import postman15 from "@site/static/images/cloud/manage/postman/postman15.png"
import postman16 from "@site/static/images/cloud/manage/postman/postman16.png"
import postman17 from "@site/static/images/cloud/manage/postman/postman17.png"

本指南将帮助您使用 [Postman](https://www.postman.com/product/what-is-postman/) 测试 ClickHouse Cloud API。
Postman 应用程序可在 Web 浏览器中使用,也可下载到桌面端。

### 创建账户 {#create-an-account}

- 可在 [https://www.postman.com](https://www.postman.com) 注册免费账户。

<Image img={postman1} size='md' alt='Postman 网站' border />

### 创建工作区 {#create-a-workspace}

- 为工作区命名并设置可见性级别。

<Image img={postman2} size='md' alt='创建工作区' border />

### 创建集合 {#create-a-collection}

- 在左上角菜单中点击"Explore"下方的"Import":

<Image img={postman3} size='md' alt='Explore > Import' border />

- 将弹出一个对话框:

<Image img={postman4} size='md' alt='API URL 输入' border />

- 输入 API 地址:"https://api.clickhouse.cloud/v1" 并按"Enter"键:

<Image img={postman5} size='md' alt='导入' border />

- 点击"Import"按钮选择"Postman Collection":

<Image img={postman6} size='md' alt='Collection > Import' border />

### 与 ClickHouse Cloud API 规范交互 {#interface-with-the-clickhouse-cloud-api-spec}

- "API spec for ClickHouse Cloud"现在将显示在"Collections"(左侧导航栏)中。

<Image img={postman7} size='md' alt='导入您的 API' border />

- 点击"API spec for ClickHouse Cloud"。在中间面板中选择"Authorization"选项卡:

<Image img={postman8} size='md' alt='导入完成' border />

### 设置授权 {#set-authorization}

- 在下拉菜单中选择"Basic Auth":

<Image img={postman9} size='md' alt='基本认证' border />

- 输入您在设置 ClickHouse Cloud API 密钥时获得的用户名和密码:

<Image img={postman10} size='md' alt='凭据' border />

### 启用变量 {#enable-variables}

- [变量](https://learning.postman.com/docs/sending-requests/variables/)允许在 Postman 中存储和重用值,从而简化 API 测试。

#### 设置组织 ID 和服务 ID {#set-the-organization-id-and-service-id}

- 在"Collection"中,点击中间面板的"Variable"选项卡(基础 URL 已在之前的 API 导入中设置):
- 在 `baseURL` 下方点击"Add new value"字段,并替换为您的组织 ID 和服务 ID:

<Image img={postman11} size='md' alt='组织 ID 和服务 ID' border />


## 测试 ClickHouse Cloud API 功能 {#test-the-clickhouse-cloud-api-functionalities}

### 测试"获取可用组织列表" {#test-get-list-of-available-organizations}

- 在"OpenAPI spec for ClickHouse Cloud"下,展开文件夹 > V1 > organizations
- 点击"GET list of available organizations"并按右侧的蓝色"Send"按钮:

<Image img={postman12} size='md' alt='测试检索组织' border />

- 返回的结果应包含您的组织详细信息,状态码为"status": 200。(如果您收到状态码"status" 400 且没有组织信息,则说明您的配置不正确)。

<Image img={postman13} size='md' alt='状态' border />

### 测试"获取组织详细信息" {#test-get-organizational-details}

- 在 `organizationid` 文件夹下,导航到"GET organizational details":
- 在中间框架菜单的 Params 下需要提供 `organizationid`。

<Image
  img={postman14}
  size='md'
  alt='测试检索组织详细信息'
  border
/>

- 使用花括号中的 `orgid` 编辑此值 `{{orgid}}`(由于之前已设置此值,将出现一个包含该值的菜单):

<Image img={postman15} size='md' alt='提交测试' border />

- 按下"Save"按钮后,点击屏幕右上角的蓝色"Send"按钮。

<Image img={postman16} size='md' alt='返回值' border />

- 返回的结果应包含您的组织详细信息,状态码为"status": 200。(如果您收到状态码"status" 400 且没有组织信息,则说明您的配置不正确)。

### 测试"获取服务详细信息" {#test-get-service-details}

- 点击"GET service details"
- 分别使用 `{{orgid}}` 和 `{{serviceid}}` 编辑 `organizationid` 和 `serviceid` 的值。
- 按"Save",然后点击右侧的蓝色"Send"按钮。

<Image img={postman17} size='md' alt='服务列表' border />

- 返回的结果应包含您的服务列表及其详细信息,状态码为"status": 200。(如果您收到状态码"status" 400 且没有服务信息,则说明您的配置不正确)。
