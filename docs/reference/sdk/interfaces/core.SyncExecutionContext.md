---
title: "SyncExecutionContext"
---
# Interface: SyncExecutionContext

[core](../modules/core.md).SyncExecutionContext

Sub-class of [ExecutionContext](core.ExecutionContext.md) that is passed to the `execute` function of every
sync formula invocation. The only different is that the presence of the `sync` property

## Hierarchy

- [`ExecutionContext`](core.ExecutionContext.md)

  ↳ **`SyncExecutionContext`**

## Properties

### endpoint

• `Optional` `Readonly` **endpoint**: `string`

The base endpoint URL for the user's account, only if applicable. See [requiresEndpointUrl](core.AWSAccessKeyAuthentication.md#requiresendpointurl).

If the API URLs are variable based on the user account, you will need this endpoint
to construct URLs to use with the fetcher. Alternatively, you can use relative URLs
(e.g. "/api/entity") and Coda will include the endpoint for you automatically.

#### Inherited from

[ExecutionContext](core.ExecutionContext.md).[endpoint](core.ExecutionContext.md#endpoint)

#### Defined in

[api_types.ts:687](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L687)

___

### fetcher

• `Readonly` **fetcher**: [`Fetcher`](core.Fetcher.md)

The [Fetcher](core.Fetcher.md) used for making HTTP requests.

#### Inherited from

[ExecutionContext](core.ExecutionContext.md).[fetcher](core.ExecutionContext.md#fetcher)

#### Defined in

[api_types.ts:674](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L674)

___

### invocationLocation

• `Readonly` **invocationLocation**: [`InvocationLocation`](core.InvocationLocation.md)

Information about the Coda environment and doc this formula was invoked from.
This is mostly for Coda internal use and we do not recommend relying on it.

#### Inherited from

[ExecutionContext](core.ExecutionContext.md).[invocationLocation](core.ExecutionContext.md#invocationlocation)

#### Defined in

[api_types.ts:692](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L692)

___

### invocationToken

• `Readonly` **invocationToken**: `string`

A random token scoped to only this request invocation.
This is a unique identifier for the invocation, and in particular used with
[AuthenticationType.Custom](../enums/core.AuthenticationType.md#custom) for naming template parameters that will be
replaced by the fetcher in secure way.

#### Inherited from

[ExecutionContext](core.ExecutionContext.md).[invocationToken](core.ExecutionContext.md#invocationtoken)

#### Defined in

[api_types.ts:703](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L703)

___

### sync

• `Readonly` **sync**: [`Sync`](core.Sync.md)

Information about state of the current sync.

#### Overrides

[ExecutionContext](core.ExecutionContext.md).[sync](core.ExecutionContext.md#sync)

#### Defined in

[api_types.ts:718](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L718)

___

### temporaryBlobStorage

• `Readonly` **temporaryBlobStorage**: [`TemporaryBlobStorage`](core.TemporaryBlobStorage.md)

A utility to fetch and store files and images that either require the pack user's authentication
or are too large to return inline. See [TemporaryBlobStorage](core.TemporaryBlobStorage.md).

#### Inherited from

[ExecutionContext](core.ExecutionContext.md).[temporaryBlobStorage](core.ExecutionContext.md#temporaryblobstorage)

#### Defined in

[api_types.ts:679](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L679)

___

### timezone

• `Readonly` **timezone**: `string`

The timezone of the doc from which this formula was invoked.

#### Inherited from

[ExecutionContext](core.ExecutionContext.md).[timezone](core.ExecutionContext.md#timezone)

#### Defined in

[api_types.ts:696](https://github.com/coda/packs-sdk/blob/main/api_types.ts#L696)