---
sidebar_label: 'AWS PrivateLink for ClickPipes'
description: 'Establish a secure connection between ClickPipes and a data source using AWS PrivateLink.'
slug: /integrations/clickpipes/aws-privatelink
title: 'AWS PrivateLink for ClickPipes'
---

# AWS PrivateLink for ClickPipes

You can use [AWS PrivateLink](https://aws.amazon.com/privatelink/) to establish secure connectivity between VPCs,
AWS services, your on-premises systems, and ClickHouse Cloud without exposing traffic to the public Internet.

This document outlines the steps to connect data sources with a ClickPipes using AWS PrivateLink.

## Supported AWS PrivateLink endpoint types {#aws-privatelink-endpoint-types}

- VPC endpoint service
- VPC resource
- MSK multi-VPC connectivity for MSK ClickPipe

## Attention {#attention}

AWS PrivateLink endpoints for ClickPipes created in ClickHouse Cloud are not guaranteed to be created
in the same AWS region as the ClickHouse Cloud service. Currently, only VPC endpoint service supports
cross-region connectivity.

Private endpoints are linked to a specific ClickHouse service and are not transferable between services.
Multiple ClickPipes can reuse the same endpoint.
