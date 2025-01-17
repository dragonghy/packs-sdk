---
nav: "LinkAttributionNode"
---
# Interface: LinkAttributionNode

[core](../modules/core.md).LinkAttributionNode

An attribution node that renders a hyperlink.

This might be used to attribute the data source and link back to the home page
of the data source or directly to the source data.

**`Example`**

```
coda.makeAttributionNode({
  type: coda.AttributionNodeType.Link,
  anchorUrl: "https://example.com",
  anchorText: "Data provided by ExampleCorp.",
});
```

## Properties

### anchorText

• **anchorText**: `string`

The text of the hyperlink.

#### Defined in

[schema.ts:1077](https://github.com/coda/packs-sdk/blob/main/schema.ts#L1077)

___

### anchorUrl

• **anchorUrl**: `string`

The URL to link to.

#### Defined in

[schema.ts:1075](https://github.com/coda/packs-sdk/blob/main/schema.ts#L1075)

___

### type

• **type**: [`Link`](../enums/core.AttributionNodeType.md#link)

Identifies this as a link attribution node.

#### Defined in

[schema.ts:1073](https://github.com/coda/packs-sdk/blob/main/schema.ts#L1073)
