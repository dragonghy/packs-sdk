---
nav: "ExecutionContext"
---
# Interface: ExecutionContext

[core](../modules/core.md).ExecutionContext

An object passed to the `execute` function of every formula invocation
with information and utilities for handling the invocation. In particular,
this contains the [Fetcher](core.Fetcher.md), which is used for making HTTP requests.

## Hierarchy

- **`ExecutionContext`**

  ↳ [`SyncExecutionContext`](core.SyncExecutionContext.md)

  ↳ [`MockExecutionContext`](testing.MockExecutionContext.md)

## Properties

### endpoint

• `Optional` `Readonly` **endpoint**: `string`

The base endpoint URL for the user's account, only if applicable. See
[requiresEndpointUrl](core.BaseAuthentication.md#requiresendpointurl).

If the API URLs are variable based on the user account, you will need this endpoint
to construct URLs to use with the fetcher. Alternatively, you can use relative URLs
(e.g. "/api/entity") and Coda will include the endpoint for you automatically.

#### Defined in

[api_types.ts:703](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L703)

___

### fetcher

• `Readonly` **fetcher**: [`Fetcher`](core.Fetcher.md)

The [Fetcher](core.Fetcher.md) used for making HTTP requests.

#### Defined in

[api_types.ts:689](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L689)

___

### invocationLocation

• `Readonly` **invocationLocation**: [`InvocationLocation`](core.InvocationLocation.md)

Information about the Coda environment and doc this formula was invoked from.
This is mostly for Coda internal use and we do not recommend relying on it.

#### Defined in

[api_types.ts:708](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L708)

___

### invocationToken

• `Readonly` **invocationToken**: `string`

A random token scoped to only this request invocation.
This is a unique identifier for the invocation, and in particular used with
[Custom](../enums/core.AuthenticationType.md#custom) for naming template parameters that will be
replaced by the fetcher in secure way.

#### Defined in

[api_types.ts:719](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L719)

___

### sync

• `Optional` `Readonly` **sync**: [`Sync`](core.Sync.md)

Information about state of the current sync. Only populated if this is a sync table formula.

#### Defined in

[api_types.ts:723](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L723)

___

### temporaryBlobStorage

• `Readonly` **temporaryBlobStorage**: [`TemporaryBlobStorage`](core.TemporaryBlobStorage.md)

A utility to fetch and store files and images that either require the pack user's authentication
or are too large to return inline. See [TemporaryBlobStorage](core.TemporaryBlobStorage.md).

#### Defined in

[api_types.ts:694](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L694)

___

### timezone

• `Readonly` **timezone**: `string`

The timezone of the doc from which this formula was invoked.

#### Defined in

[api_types.ts:712](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L712)
