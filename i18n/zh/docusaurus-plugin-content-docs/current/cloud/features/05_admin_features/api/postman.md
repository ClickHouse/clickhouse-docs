---
slug: /cloud/manage/postman
sidebar_label: '使用 Postman 以编程方式访问 API'
title: '使用 Postman 以编程方式访问 API'
description: '本指南将帮助您使用 Postman 测试 ClickHouse Cloud API'
doc_type: 'guide'
keywords: ['api', 'postman', 'rest api', '云管理', '集成']
---

import Image from '@theme/IdealImage';
import postman1 from '@site/static/images/cloud/manage/postman/postman1.png';
import postman2 from '@site/static/images/cloud/manage/postman/postman2.png';
import postman3 from '@site/static/images/cloud/manage/postman/postman3.png';
import postman4 from '@site/static/images/cloud/manage/postman/postman4.png';
import postman5 from '@site/static/images/cloud/manage/postman/postman5.png';
import postman6 from '@site/static/images/cloud/manage/postman/postman6.png';
import postman7 from '@site/static/images/cloud/manage/postman/postman7.png';
import postman8 from '@site/static/images/cloud/manage/postman/postman8.png';
import postman9 from '@site/static/images/cloud/manage/postman/postman9.png';
import postman10 from '@site/static/images/cloud/manage/postman/postman10.png';
import postman11 from '@site/static/images/cloud/manage/postman/postman11.png';
import postman12 from '@site/static/images/cloud/manage/postman/postman12.png';
import postman13 from '@site/static/images/cloud/manage/postman/postman13.png';
import postman14 from '@site/static/images/cloud/manage/postman/postman14.png';
import postman15 from '@site/static/images/cloud/manage/postman/postman15.png';
import postman16 from '@site/static/images/cloud/manage/postman/postman16.png';
import postman17 from '@site/static/images/cloud/manage/postman/postman17.png';

本指南将帮助你使用 [Postman](https://www.postman.com/product/what-is-postman/) 测试 ClickHouse Cloud API。
Postman 应用程序可以在网页浏览器中使用，也可以下载到桌面运行。

### 创建账户 {#create-an-account}

* 可在 [https://www.postman.com](https://www.postman.com) 注册免费账户。

<Image img={postman1} size="md" alt="Postman 站点" border />

### 创建工作区（workspace） {#create-a-workspace}

* 为你的工作区命名，并设置可见性级别。

<Image img={postman2} size="md" alt="创建 workspace" border />

### 创建集合（collection） {#create-a-collection}

* 在左上角菜单中 “Explore” 下方点击 “Import”：

<Image img={postman3} size="md" alt="Explore > Import" border />

* 会弹出一个对话框：

<Image img={postman4} size="md" alt="API URL 输入" border />

* 输入 API 地址：[https://api.clickhouse.cloud/v1](https://api.clickhouse.cloud/v1)，然后按 Enter 键：

<Image img={postman5} size="md" alt="Import" border />

* 点击 “Import” 按钮，选择 “Postman Collection”：

<Image img={postman6} size="md" alt="Collection > Import" border />

### 与 ClickHouse Cloud API 规范交互 {#interface-with-the-clickhouse-cloud-api-spec}

* “API spec for ClickHouse Cloud” 现在会出现在左侧导航的 “Collections” 中。

<Image img={postman7} size="md" alt="导入你的 API" border />

* 点击 “API spec for ClickHouse Cloud”。在中间面板中选择 “Authorization” 选项卡：

<Image img={postman8} size="md" alt="导入完成" border />

### 设置授权 {#set-authorization}

* 展开下拉菜单并选择 “Basic Auth”：

<Image img={postman9} size="md" alt="Basic auth" border />

* 输入你在设置 ClickHouse Cloud API keys 时获得的用户名（Username）和密码（Password）：

<Image img={postman10} size="md" alt="凭据" border />

### 启用变量 {#enable-variables}

* [Variables](https://learning.postman.com/docs/sending-requests/variables/) 允许在 Postman 中存储和复用值，从而更方便地进行 API 测试。

#### 设置 organization ID 和 service ID {#set-the-organization-id-and-service-id}

* 在 “Collection” 中，点击中间面板的 “Variables” 选项卡（Base URL 会在之前导入 API 时自动设置）：
* 在 `baseURL` 下方点击空白字段 “Add new value”，并替换为你的 organization ID 和 service ID：

<Image img={postman11} size="md" alt="Organization ID 和 Service ID" border />


## 测试 ClickHouse Cloud API 功能 {#test-the-clickhouse-cloud-api-functionalities}

### 测试 "GET list of available organizations" {#test-get-list-of-available-organizations}

* 在 "OpenAPI spec for ClickHouse Cloud" 下，展开文件夹 > V1 > organizations
* 点击 "GET list of available organizations"，然后点击右侧蓝色的 "Send" 按钮：

<Image img={postman12} size="md" alt="测试获取组织列表" border/>

* 返回结果应包含您组织的详细信息，并且 `"status": 200`。（如果您收到 `"status": 400` 且没有任何组织信息，则说明配置不正确）。

<Image img={postman13} size="md" alt="状态" border/>

### 测试 "GET organizational details" {#test-get-organizational-details}

* 在 `organizationid` 文件夹下，找到并进入 "GET organizational details"：
* 在中间窗口的 Params 菜单中，`organizationid` 为必填项。

<Image img={postman14} size="md" alt="测试获取组织详情" border/>

* 将该值修改为使用花括号包裹的 `orgid`：`{{orgid}}`（由于之前已经设置过该值，将会出现带有该值的下拉菜单）：

<Image img={postman15} size="md" alt="提交测试" border/>

* 点击 "Save" 按钮后，再点击界面右上角蓝色的 "Send" 按钮。

<Image img={postman16} size="md" alt="返回值" border/>

* 返回结果应包含您组织的详细信息，并且 `"status": 200`。（如果您收到 `"status": 400` 且没有任何组织信息，则说明配置不正确）。

### 测试 "GET service details" {#test-get-service-details}

* 点击 "GET service details"
* 将 `organizationid` 和 `serviceid` 的值分别修改为 `{{orgid}}` 和 `{{serviceid}}`。
* 点击 "Save"，然后点击右侧蓝色的 "Send" 按钮。

<Image img={postman17} size="md" alt="服务列表" border/>

* 返回结果应包含您的服务列表及其详细信息，并且 `"status": 200`。（如果您收到 `"status": 400` 且没有任何服务信息，则说明配置不正确）。
