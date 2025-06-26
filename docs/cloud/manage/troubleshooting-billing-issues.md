---
sidebar_label: 'Troubleshooting Billing Issues'
slug: /manage/troubleshooting-billing-issues
title: 'Troubleshooting billing issues'
description: 'Troubleshooting article for common billing issues'
---

import trial_expired from '@site/static/images/cloud/manage/trial-expired.png';
import Image from '@theme/IdealImage';

# Troubleshooting billing issues

## Fixing non-working payment details {#fixing-non-working-payment-details}

Use of ClickHouse Cloud requires an active cloud marketplace billing account or working credit card. For 30 days after trial expiration or after your last successful payment, your services will continue to run. However, if we are unable to charge a valid credit card or other payment method, we immediately restrict cloud console functionality for your org, including scaling (up to 120 GiB per replica) and starting of your services if stopped.

**If a valid credit card or payment method is not added 14 days after trial expiration or your last successful payment, all services will be stopped. After 30 days your data will be deleted.**

If you are experiencing issues with your payment details or are unable to add a credit card, please contact [our support team](https://clickhouse.com/support/program).

<br />

<Image img={trial_expired} size="md" alt="Trial expired" border/>
