---
'slug': '/cloud/manage/postman'
'sidebar_label': '使用 Postman 进行编程 API 访问'
'title': '使用 Postman 进行编程 API 访问'
'description': '本指南将帮助您使用 Postman 测试 ClickHouse Cloud API'
'doc_type': 'guide'
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

本指南将帮助您使用 [Postman](https://www.postman.com/product/what-is-postman/) 测试 ClickHouse Cloud API。 
Postman 应用程序可在 Web 浏览器中使用，也可以下载到桌面。

### 创建账户 {#create-an-account}

* 免费账户可在 [https://www.postman.com](https://www.postman.com) 上注册。

<Image img={postman1} size="md" alt="Postman site" border/>

### 创建工作区 {#create-a-workspace}

* 为您的工作区命名并设置可见性级别。

<Image img={postman2} size="md" alt="Create workspace" border/>

### 创建集合 {#create-a-collection}

* 在左上角菜单的“探索”下点击“导入”：

<Image img={postman3} size="md" alt="Explore > Import" border/>

* 将出现一个模态框：

<Image img={postman4} size="md" alt="API URL entry" border/>

* 输入 API 地址： "https://api.clickhouse.cloud/v1" 并按 'Enter' ：

<Image img={postman5} size="md" alt="Import" border/>

* 点击“导入”按钮选择“Postman 集合”：

<Image img={postman6} size="md" alt="Collection > Import" border/>

### 与 ClickHouse Cloud API 规范交互 {#interface-with-the-clickhouse-cloud-api-spec}
* “ClickHouse Cloud 的 API 规范”现在将在“集合”（左侧导航）中显示。

<Image img={postman7} size="md" alt="Import your API" border/>

* 点击“ClickHouse Cloud 的 API 规范。” 在中间窗格中选择“授权”选项卡：

<Image img={postman8} size="md" alt="Import complete" border/>

### 设置授权 {#set-authorization}
* 切换下拉菜单选择“基本认证”：

<Image img={postman9} size="md" alt="Basic auth" border/>

* 输入在设置 ClickHouse Cloud API 密钥时收到的用户名和密码：

<Image img={postman10} size="md" alt="credentials" border/>

### 启用变量 {#enable-variables}

* [变量](https://learning.postman.com/docs/sending-requests/variables/) 使您能够在 Postman 中存储和重用值，从而使 API 测试更轻松。

#### 设置组织 ID 和服务 ID {#set-the-organization-id-and-service-id}

* 在“集合”中，点击中间窗格的“变量”选项卡（Base URL 将由早期的 API 导入设置）：
* 在 `baseURL` 下面，点击开放字段“添加新值”，并替换为您的组织 ID 和服务 ID：

<Image img={postman11} size="md" alt="Organization ID and Service ID" border/>

## 测试 ClickHouse Cloud API 功能 {#test-the-clickhouse-cloud-api-functionalities}

### 测试 “获取可用组织列表” {#test-get-list-of-available-organizations}

* 在“ClickHouse Cloud 的 OpenAPI 规范”下，展开文件夹 > V1 > organizations
* 点击“获取可用组织列表”并按右侧的蓝色“发送”按钮：

<Image img={postman12} size="md" alt="Test retrieval of organizations" border/>

* 返回的结果应提供您的组织详细信息，并且“status”: 200。（如果您收到“status” 400，且没有组织信息，则说明您的配置不正确）。

<Image img={postman13} size="md" alt="Status" border/>

### 测试 “获取组织详情” {#test-get-organizational-details}

* 在 `organizationid` 文件夹下，导航到“获取组织详情”：
* 在中间框架菜单的 Params 下需要一个 `organizationid`。

<Image img={postman14} size="md" alt="Test retrieval of organization details" border/>

* 用大括号 `{{orgid}}` 编辑此值（设置此值后，菜单将显示该值）：

<Image img={postman15} size="md" alt="Submit test" border/>

* 按“保存”按钮后，按右上角的蓝色“发送”按钮。

<Image img={postman16} size="md" alt="Return value" border/>

* 返回的结果应提供您的组织详细信息，并且“status”: 200。（如果您收到“status” 400，且没有组织信息，则说明您的配置不正确）。

### 测试 “获取服务详情” {#test-get-service-details}

* 点击“获取服务详情”
* 用 `{{orgid}}` 和 `{{serviceid}}` 分别编辑 `organizationid` 和 `serviceid` 的值。
* 按“保存”，然后在右侧按蓝色“发送”按钮。

<Image img={postman17} size="md" alt="List of services" border/>

* 返回的结果应提供您的服务及其详细信息的列表，并且“status”: 200。（如果您收到“status” 400，且没有服务信息，则说明您的配置不正确）。
