---
slug: /cloud/manage/postman
sidebar_label: '使用 Postman 以编程方式访问 API'
title: '使用 Postman 以编程方式访问 API'
description: '本指南将帮助您使用 Postman 测试 ClickHouse Cloud API'
doc_type: 'guide'
keywords: ['api', 'postman', 'rest api', 'Cloud 管理', '集成']
---

import Image from '@theme/IdealImage';
import postman1 from '@site/static/images/cloud/manage/postman/postman1.png';
import postman2 from '@site/static/images/cloud/manage/postman/postman2.png';
import postman3 from '@site/static/images/cloud/manage/postman/postman3.png';
import postman4 from '@site/static/images/cloud/manage/postman/postman4.png';
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

本指南将帮助您使用 [Postman](https://www.postman.com/product/what-is-postman/) 测试 ClickHouse Cloud API。
Postman 应用程序既可以通过网页浏览器使用，也可以下载为桌面应用程序运行。


### 创建账户 \{#create-an-account\}

* 可在 [https://www.postman.com](https://www.postman.com) 注册免费账户。

<Image img={postman1} size="md" alt="Postman 网站" border/>

### 创建工作区 \{#create-a-workspace\}

* 为工作区命名并设置可见范围。 

<Image img={postman2} size="md" alt="创建工作区" border/>

### 创建集合 \{#create-a-collection\}

* 在左上角菜单中「Explore」下方点击「Import」： 

<Image img={postman3} size="md" alt="Explore > Import" border/>

* 会弹出一个模态对话框：

<Image img={postman4} size="md" alt="API URL entry" border/>

* 输入 API 地址："https://api.clickhouse.cloud/v1" 然后按下 Enter 键：

* 点击「Import」按钮，选择「Postman Collection」：

<Image img={postman6} size="md" alt="Collection > Import" border/>

### 使用 ClickHouse Cloud API 规范进行交互 \{#interface-with-the-clickhouse-cloud-api-spec\}

* “API spec for ClickHouse Cloud” 现在会出现在 “Collections”（左侧导航栏）中。

<Image img={postman7} size="md" alt="导入 API" border/>

* 点击 “API spec for ClickHouse Cloud”。在中间面板中选择 “Authorization” 选项卡：

<Image img={postman8} size="md" alt="导入完成" border/>

### 设置授权 \{#set-authorization\}

* 展开下拉菜单并选择 “Basic Auth”：

<Image img={postman9} size="md" alt="Basic auth" border/>

* 输入在配置 ClickHouse Cloud API 密钥时收到的 Username 和 Password：

<Image img={postman10} size="md" alt="credentials" border/>

### 启用变量 \{#enable-variables\}

* [变量（Variables）](https://learning.postman.com/docs/sending-requests/variables/) 允许你在 Postman 中存储和复用数值，从而简化 API 测试。

#### 设置组织 ID 和服务 ID \{#set-the-organization-id-and-service-id\}

* 在 "Collection" 中，点击中间面板中的 "Variable" 选项卡（Base URL 已由之前的 API 导入设置好）：
* 在 `baseURL` 下方点击空白字段 "Add new value"，并将其替换为你的组织 ID 和服务 ID：

<Image img={postman11} size="md" alt="Organization ID and Service ID" border/>

## 测试 ClickHouse Cloud API 功能 \{#test-the-clickhouse-cloud-api-functionalities\}

### 测试 "GET list of available organizations" \{#test-get-list-of-available-organizations\}

* 在 "OpenAPI spec for ClickHouse Cloud" 下，展开目录 > V1 > organizations
* 点击 "GET list of available organizations"，然后点击右侧蓝色的 "Send" 按钮：

<Image img={postman12} size="md" alt="测试获取组织信息" border/>

* 返回结果应包含你的组织详情，并带有 "status": 200。（如果你收到的是 "status" 400 且没有任何组织信息，则说明你的配置不正确）。

<Image img={postman13} size="md" alt="状态" border/>

### 测试 "GET organizational details" \{#test-get-organizational-details\}

* 在 `organizationid` 文件夹下，定位到 "GET organizational details"：
* 在中间区域的 Params 菜单中，需要填写一个 `organizationid`。

<Image img={postman14} size="md" alt="测试获取组织详情" border/>

* 将该值编辑为带花括号的 `orgid`，即 `{{orgid}}`（由于之前已经设置过该值，会出现一个带有该值的菜单）：

<Image img={postman15} size="md" alt="提交测试" border/>

* 点击 "Save" 按钮后，再点击屏幕右上角蓝色的 "Send" 按钮。

<Image img={postman16} size="md" alt="返回值" border/>

* 返回结果应包含组织的详细信息，并且 "status": 200。（如果收到 "status" 400 且没有组织信息，则说明配置不正确）。

### 测试 "GET service details" \{#test-get-service-details\}

* 点击 "GET service details"
* 将 `organizationid` 和 `serviceid` 的值分别修改为 `{{orgid}}` 和 `{{serviceid}}`。
* 点击 "Save"，然后点击右侧蓝色的 "Send" 按钮。

<Image img={postman17} size="md" alt="服务列表" border/>

* 返回结果应包含状态码为 "status": 200 的服务列表及其详细信息。（如果你收到 "status" 400 且没有任何服务信息，说明你的配置不正确）。