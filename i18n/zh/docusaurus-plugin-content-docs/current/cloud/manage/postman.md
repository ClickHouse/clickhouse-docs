---
slug: /cloud/manage/postman
sidebar_label: 使用 Postman 进行编程 API 访问
title: 使用 Postman 进行编程 API 访问
---

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
Postman 应用程序可以作为网页浏览器使用或下载到桌面。

### 创建账户 {#create-an-account}
* 免费账户可在 [https://www.postman.com](https://www.postman.com) 获取。

<img src={postman1} alt="Postman site"/>

### 创建工作区 {#create-a-workspace}
* 为您的工作区命名并设置可见性级别。

<img src={postman2} alt="Create workspace"/>

### 创建集合 {#create-a-collection}
* 在左上方菜单的“探索”下，点击“导入”：

<img src={postman3} alt="Explore > Import"/>

* 将出现一个弹出窗口：

<img src={postman4} alt="API URL entry"/>

* 输入 API 地址：“https://api.clickhouse.cloud/v1”并按 'Enter'：

<img src={postman5} alt="Import"/>

* 通过点击“导入”按钮选择“Postman 集合”：

<img src={postman6} alt="Collection > Import"/>

### 与 ClickHouse Cloud API 规范接口 {#interface-with-the-clickhouse-cloud-api-spec}
* “ClickHouse Cloud 的 API 规范”现在将出现在“集合”（左侧导航）中。

<img src={postman7} alt="Import your API"/>

* 点击“ClickHouse Cloud 的 API 规范”。在中间面板选择“授权”选项卡：

<img src={postman8} alt="Import complete"/>

### 设置授权 {#set-authorization}
* 切换下拉菜单以选择“基本认证”：

<img src={postman9} alt="Basic auth"/>

* 输入在设置 ClickHouse Cloud API 密钥时收到的用户名和密码：

<img src={postman10} alt="credentials"/>

### 启用变量 {#enable-variables}
* [变量](https://learning.postman.com/docs/sending-requests/variables/) 使您能够在 Postman 中存储和重用值，从而简化 API 测试。
#### 设置组织 ID 和服务 ID {#set-the-organization-id-and-service-id}
* 在“集合”中，点击中间面板的“变量”选项卡（基本 URL 将在先前的 API 导入中设置）：
* 在 `baseURL` 下，点击开放字段“添加新值”，并替换为您的组织 ID 和服务 ID：

<img src={postman11} alt="Organization ID and Service ID"/>


## 测试 ClickHouse Cloud API 功能 {#test-the-clickhouse-cloud-api-functionalities}
### 测试“获取可用组织列表” {#test-get-list-of-available-organizations}
* 在“ClickHouse Cloud 的 OpenAPI 规范”下，展开文件夹 > V1 > organizations
* 点击“获取可用组织列表”并按右侧的蓝色“发送”按钮：

<img src={postman12} alt="Test retrieval of organizations"/>

* 返回的结果应该交付您的组织详细信息，带有“状态”：200。（如果您收到“状态”400且没有组织信息，说明您的配置不正确）。

<img src={postman13} alt="Status"/>

### 测试“获取组织详细信息” {#test-get-organizational-details}
* 在 `organizationid` 文件夹下，导航到“获取组织详细信息”：
* 在中间框架菜单下的参数中，必须提供 `organizationid`。

<img src={postman14} alt="Test retrieval of organization details"/>

* 使用大括号中的 `orgid` `{{orgid}}` 编辑此值（在之前设置此值时将出现一个菜单）：

<img src={postman15} alt="Submit test"/>

* 按下“保存”按钮后，在屏幕右上角按蓝色“发送”按钮。

<img src={postman16} alt="Return value"/>

* 返回的结果应该交付您的组织详细信息，带有“状态”：200。（如果您收到“状态”400且没有组织信息，说明您的配置不正确）。

### 测试“获取服务详细信息” {#test-get-service-details}
* 点击“获取服务详细信息”
* 使用 `{{orgid}}` 和 `{{serviceid}}` 分别编辑 `organizationid` 和 `serviceid` 的值。
* 按“保存”，然后在右侧按蓝色“发送”按钮。

<img src={postman17} alt="List of services"/>

* 返回的结果应该交付您的服务及其详细信息的列表，带有“状态”：200。（如果您收到“状态”400且没有服务信息，说明您的配置不正确）。
