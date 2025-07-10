---
slug: /cloud/get-started/cloud/use-cases/real-time-analytics
title: 'Real-time analytics'
keywords: []
sidebar_label: 'Real-time analytics'
---

import Image from '@theme/IdealImage';

## What is real-time analytics?

Real-time analytics refers to data processing that delivers insights to end users
and customers as soon as the data is generated. It differs from traditional or 
batch analytics, where data is collected in batches and processed, often a long 
time after it was generated.

Real-time analytics systems are built on top of event streams, which consist of 
a series of events ordered in time. An event is something that’s already happened.
It could be the addition of an item to the shopping cart on an e-commerce website,
the emission of a reading from an Internet of Things (IoT) sensor, or a shot on 
goal in a football (soccer) match.

An event (from an imaginary IoT sensor) is shown below, as an example:

```json
{
  "deviceId": "sensor-001",
  "timestamp": "2023-10-05T14:30:00Z",
  "eventType": "temperatureAlert",
  "data": {
    "temperature": 28.5,
    "unit": "Celsius",
    "thresholdExceeded": true
  }
}
```

Organizations can discover insights about their customers by aggregating and 
analyzing events like this. This has traditionally been done using batch analytics,
and in the next section, we’ll compare batch and real-time analytics.

## Real-Time analytics vs batch analytics

The diagram below shows what a typical batch analytics system would look like 
from the perspective of an individual event:

