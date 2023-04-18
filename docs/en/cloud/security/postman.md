---
slug: /en/manage/security/postman.md
sidebar_label: Programmatic API access with Postman
title: Programmatic API access with Postman
---

# Programmatic API access with Postman

This guide will help you test the ClickHouse Programmatic API using [Postman](https://www.postman.com/product/what-is-postman/). 
The Postman Application is available for use within a web browser or can be downloaded to a desktop.

### Create an account
* Free accounts are available at [https://www.postman.com](https://www.postman.com).
(@site/docs/en/_snippets/images/postman1.png)

### Create a Workspace 
* Name your workspace and set the visibility level. 
(@site/docs/en/_snippets/images/postman2.png)

### Create a Collection 
* Below “Explore” on the top left Menu click “Import”: 
(@site/docs/en/_snippets/images/postman3.png)

* A modal will appear:
(@site/docs/en/_snippets/images/postman4.png)

* Enter the api address: “https://api.control-plane.clickhouse-staging.com/v1” and press 'Enter':
(@site/docs/en/_snippets/images/postman5.png)

* Select “Postman Collection” by clicking on the “Import” button:
(@site/docs/en/_snippets/images/postman6.png)

### Interface with the ClickHouse Cloud OpenAPI spec
* The “OpenAPI spec for ClickHouse Cloud” will now appear within “Collections” (Left Navigation).
(@site/docs/en/_snippets/images/postman7.png)

* Click on “OpenAPI spec for ClickHouse Cloud.” From the middle pain select the ‘Authorization’ tab:
(@site/docs/en/_snippets/images/postman8.png)

### Set Authorization
* Toggle the dropdown menu to select “Basic Auth”:
(@site/docs/en/_snippets/images/postman9.png)

* Enter the Username and Password received when you set up your ClickHouse Cloud API keys:
(@site/docs/en/_snippets/images/postman10.png)

### Enable Variables
* [Variables](https://learning.postman.com/docs/sending-requests/variables/) enable the storage and reuse of values in Postman allowing for easier API testing.
#### Set the Organization ID and Service ID
* Within the “Collection”, click the “Variable” tab in the middle pane (The Base URL will have been set by the earlier API import):
* Below “baseURL” click the open field “Add new value”, and Substitute your organization id and service ID:
(@site/docs/en/_snippets/images/postman11.png)

## Test the ClickHouse Cloud API functionalities
### Test "GET list of available organizations"
* Under the “OpenAPI spec for ClickHouse Cloud”, expand the folder > V1 > organizations
* Click “GET list of available organizations” and press the blue "Send" button on the right:
(@site/docs/en/_snippets/images/postman12.png)
* The returned results should deliver your organization details with “status”: 200. (If you receive a “status” 400 with no organization information your configuration is not correct.
(@site/docs/en/_snippets/images/postman13.png)

### Test "GET organizational details"
* Under the organizationid folder, navigate to “GET organizational details”:
* In the middle frame menu under Params an organizationid is required.
(@site/docs/en/_snippets/images/postman14.png)
* Edit this value with "orgid" in curly braces "{{orgid}}" (From setting this value earlier a menu will appear with the value):
(@site/docs/en/_snippets/images/postman15.png)
* After pressing the "Save" button, press the blue "Send" button at the top right of the screen.
(@site/docs/en/_snippets/images/postman16.png)
* The returned results should deliver your organization details with “status”: 200. (If you receive a “status” 400 with no organization information your configuration is not correct.

### Test "GET service details"
* Click “GET service details”
* Edit the Values for organizationid and serviceid with {{orgid}} and {{serviceid}} respectively.
* Press “Save” and then the blue “Send” button on the right.
(@site/docs/en/_snippets/images/postman17.png)
* The returned results should deliver a list of your services and their details with “status”: 200. (If you receive a “status” 400 with no service(s) information your configuration is not correct.

