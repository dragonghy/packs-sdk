---
nav: "TextAttributionNode"
---
# Interface: TextAttributionNode

[core](../modules/core.md).TextAttributionNode

An attribution node that simply renders some text.

This might be used to attribute the data source.

**`Example`**

```
coda.makeAttributionNode({
  type: coda.AttributionNodeType.Text,
  text: "Data provided by ExampleCorp.",
});
```

## Properties

### text

• **text**: `string`

The text to render with the pack value.

#### Defined in

[schema.ts:1053](https://github.com/coda/packs-sdk/blob/main/schema.ts#L1053)

___

### type

• **type**: [`Text`](../enums/core.AttributionNodeType.md#text)

Identifies this as a text attribution node.

#### Defined in

[schema.ts:1051](https://github.com/coda/packs-sdk/blob/main/schema.ts#L1051)
