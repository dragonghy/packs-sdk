import type {$Values} from './type_utils';
import type {PackId} from './types';
import {assertCondition} from './helpers/ensure';
import {ensureExists} from './helpers/ensure';
import {ensureUnreachable} from './helpers/ensure';
import pascalcase from 'pascalcase';

// Defines a subset of the JSON Object schema for use in annotating API results.
// http://json-schema.org/latest/json-schema-core.html#rfc.section.8.2

/**
 * The set of primitive value types that can be used as return values for formulas
 * or in object schemas.
 */
export enum ValueType {
  /**
   * Indicates a JavaScript boolean (true/false) should be returned.
   */
  Boolean = 'boolean',
  /**
   * Indicates a JavaScript number should be returned.
   */
  Number = 'number',
  /**
   * Indicates a JavaScript string should be returned.
   */
  String = 'string',
  /**
   * Indicates a JavaScript array should be returned. The schema of the array items must also be specified.
   */
  Array = 'array',
  /**
   * Indicates a JavaScript object should be returned. The schema of each object property must also be specified.
   */
  Object = 'object',
}

/**
 * Synthetic types that instruct Coda how to coerce values from primitives at ingestion time.
 */
export enum ValueHintType {
  /**
   * Indicates to interpret the value as a date (e.g. March 3, 2021).
   */
  Date = 'date',
  /**
   * Indicates to interpret the value as a time (e.g. 5:24pm).
   */
  Time = 'time',
  /**
   * Indicates to interpret the value as a datetime (e.g. March 3, 2021 at 5:24pm).
   */
  DateTime = 'datetime',
  /**
   * Indicates to interpret the value as a duration (e.g. 3 hours).
   */
  Duration = 'duration',
  /**
   * Indicates to interpret and render the value as a Coda person reference. The provided value should be
   * an object whose `id` property is an email address, which Coda will try to resolve to a user
   * and render an @-reference to the user.
   *
   * @example
   * ```
   * makeObjectSchema({
   *   type: ValueType.Object,
   *   codaType: ValueHintType.Person,
   *   id: 'email',
   *   primary: 'name',
   *   properties: {
   *     email: {type: ValueType.String, required: true},
   *     name: {type: ValueType.String, required: true},
   *   },
   * });
   * ```
   */
  Person = 'person',
  /**
   * Indicates to interpret and render the value as a percentage.
   */
  Percent = 'percent',
  /**
   * Indicates to interpret and render the value as a currency value.
   */
  Currency = 'currency',
  /**
   * Indicates to interpret and render the value as an image. The provided value should be a URL that
   * points to an image. Coda will hotlink to the image when rendering it a doc.
   *
   * Using {@link ImageAttachment} is recommended instead, so that the image is always accessible
   * and won't appear as broken if the source image is later deleted.
   */
  ImageReference = 'image',
  /**
   * Indicates to interpret and render the value as an image. The provided value should be a URL that
   * points to an image. Coda will ingest the image and host it from Coda infrastructure.
   */
  ImageAttachment = 'imageAttachment',
  /**
   * Indicates to interpret and render the value as a URL link.
   */
  Url = 'url',
  /**
   * Indicates to interpret a text value as Markdown, which will be converted and rendered as Coda rich text.
   */
  Markdown = 'markdown',
  /**
   * Indicates to interpret a text value as HTML, which will be converted and rendered as Coda rich text.
   */
  Html = 'html',
  /**
   * Indicates to interpret and render a value as an embed. The provided value should be a URL pointing
   * to an embeddable web page.
   */
  Embed = 'embed',
  /**
   * Indicates to interpret and render the value as a Coda @-reference to a table row. The provided value should
   * be an object whose `id` value matches the id of some row in a sync table. The schema where this hint type is
   * used must specify an identity that specifies the desired sync table.
   *
   * Normally a reference schema is constructed from the schema object being referenced using the helper
   * {@link makeReferenceSchemaFromObjectSchema}.
   *
   * @example
   * ```
   * makeObjectSchema({
   *   type: ValueType.Object,
   *   codaType: ValueHintType.Reference,
   *   identity: {
   *     name: "SomeSyncTableIdentity"
   *   },
   *   id: 'identifier',
   *   primary: 'name',
   *   properties: {
   *     identifier: {type: ValueType.Number, required: true},
   *     name: {type: ValueType.String, required: true},
   *   },
   * });
   * ```
   */
  Reference = 'reference',
  /**
   * Indicates to interpret and render a value as a file attachment. The provided value should be a URL
   * pointing to a file of a Coda-supported type. Coda will ingest the file and host it from Coda infrastructure.
   */
  Attachment = 'attachment',
  /**
   * Indicates to render a numeric value as a slider UI component.
   */
  Slider = 'slider',
  /**
   * Indicates to render a numeric value as a scale UI component (e.g. a star rating).
   */
  Scale = 'scale',
}

export const StringHintValueTypes = [
  ValueHintType.Attachment,
  ValueHintType.Date,
  ValueHintType.Time,
  ValueHintType.DateTime,
  ValueHintType.Duration,
  ValueHintType.Embed,
  ValueHintType.Html,
  ValueHintType.ImageReference,
  ValueHintType.ImageAttachment,
  ValueHintType.Markdown,
  ValueHintType.Url,
] as const;
export const NumberHintValueTypes = [
  ValueHintType.Date,
  ValueHintType.Time,
  ValueHintType.DateTime,
  ValueHintType.Percent,
  ValueHintType.Currency,
  ValueHintType.Slider,
  ValueHintType.Scale,
] as const;
export const ObjectHintValueTypes = [ValueHintType.Person, ValueHintType.Reference] as const;

export type StringHintTypes = typeof StringHintValueTypes[number];
export type NumberHintTypes = typeof NumberHintValueTypes[number];
export type ObjectHintTypes = typeof ObjectHintValueTypes[number];

interface BaseSchema {
  /**
   * A explanation of this object schema property shown to the user in the UI.
   *
   * If your pack has an object schema with many properties, it may be useful to
   * explain the purpose or contents of any property that is not self-evident.
   */
  description?: string;
}

/**
 * A schema representing a return value or object property that is a boolean.
 */
export interface BooleanSchema extends BaseSchema {
  /** Identifies this schema as relating to a boolean value. */
  type: ValueType.Boolean;
}

/**
 * The union of all schemas that can represent number values.
 */
export type NumberSchema =
  | CurrencySchema
  | SliderSchema
  | ScaleSchema
  | NumericSchema
  | NumericDateSchema
  | NumericTimeSchema
  | NumericDateTimeSchema;

export interface BaseNumberSchema<T extends NumberHintTypes = NumberHintTypes> extends BaseSchema {
  /** Identifies this schema as relating to a number value. */
  type: ValueType.Number;
  /** An optional type hint instructing Coda about how to interpret or render this value. */
  codaType?: T;
}

/**
 * A schema representing a return value or object property that is a numeric value,
 * i.e. a raw number with an optional decimal precision.
 */
export interface NumericSchema extends BaseNumberSchema {
  /** If specified, instructs Coda to render this value as a percentage. */
  codaType?: ValueHintType.Percent; // Can also be undefined if it's a vanilla number
  /** The decimal precision. The number will be rounded to this precision when rendered. */
  precision?: number;
  /** If specified, will render thousands separators for large numbers, e.g. `1,234,567.89`. */
  useThousandsSeparator?: boolean;
}

/**
 * A schema representing a return value or object property that is provided as a number,
 * which Coda should interpret as a date. The given number should be in seconds since the Unix epoch.
 */
export interface NumericDateSchema extends BaseNumberSchema<ValueHintType.Date> {
  /** Instructs Coda to render this value as a date. */
  codaType: ValueHintType.Date;
  /**
   * A Moment date format string, such as 'MMM D, YYYY', that corresponds to a supported Coda date column format,
   * used when rendering the value.
   *
   * Only applies when this is used as a sync table property.
   */
  format?: string;
}

/**
 * A schema representing a return value or object property that is provided as a number,
 * which Coda should interpret as a time. The given number should be in seconds since the Unix epoch.
 * While this is a full datetime, only the time component will be rendered, so the date used is irrelevant.
 */
export interface NumericTimeSchema extends BaseNumberSchema<ValueHintType.Time> {
  /** Instructs Coda to render this value as a time. */
  codaType: ValueHintType.Time;
  /**
   * A Moment time format string, such as 'HH:mm:ss', that corresponds to a supported Coda time column format,
   * used when rendering the value.
   *
   * Only applies when this is used as a sync table property.
   */
  format?: string;
}

/**
 * A schema representing a return value or object property that is provided as a number,
 * which Coda should interpret as a datetime. The given number should be in seconds since the Unix epoch.
 */
export interface NumericDateTimeSchema extends BaseNumberSchema<ValueHintType.DateTime> {
  /** Instructs Coda to render this value as a datetime. */
  codaType: ValueHintType.DateTime;
  /**
   * A Moment date format string, such as 'MMM D, YYYY', that corresponds to a supported Coda date column format.
   *
   * Only applies when this is used as a sync table property.
   */
  dateFormat?: string;
  /**
   * A Moment time format string, such as 'HH:mm:ss', that corresponds to a supported Coda time column format,
   * used when rendering the value.
   *
   * Only applies when this is used as a sync table property.
   */
  timeFormat?: string;
}

/**
 * Enumeration of formats supported by schemas that use {@link ValueHintType.Currency}.
 *
 * These affect how a numeric value is rendered in docs.
 */
export enum CurrencyFormat {
  /**
   * Indicates the value should be rendered as a number with a currency symbol as a prefix, e.g. `$2.50`.
   */
  Currency = 'currency',
  /**
   * Indicates the value should be rendered as a number with a currency symbol as a prefix, but padded
   * to allow the numeric values to line up vertically, e.g.
   *
   * ```
   * $       2.50
   * $      29.99
   * ```
   */
  Accounting = 'accounting',
  /**
   * Indicates the value should be rendered as a number without a currency symbol, e.g. `2.50`.
   */
  Financial = 'financial',
}

/**
 * A schema representing a return value or object property that is an amount of currency.
 */
export interface CurrencySchema extends BaseNumberSchema<ValueHintType.Currency> {
  /** Instructs Coda to render this value as a currency amount. */
  codaType: ValueHintType.Currency;
  /** The decimal precision. The value is rounded to this precision when rendered. */
  precision?: number;
  /**
   * A three-letter ISO 4217 currency code, e.g. USD or EUR.
   * If the currency code is not supported by Coda, the value will be rendered using USD.
   */
  currencyCode?: string;
  /** A render format for further refining how the value is rendered. */
  format?: CurrencyFormat;
}

/**
 * A schema representing a return value or object property that is a number that should
 * be rendered as a slider.
 */
export interface SliderSchema extends BaseNumberSchema<ValueHintType.Slider> {
  /** Instructs Coda to render this value as a slider. */
  codaType: ValueHintType.Slider;
  /** The minimum value selectable by this slider. */
  minimum?: number | string;
  /** The maximum value selectable by this slider. */
  maximum?: number | string;
  /** The minimum amount the slider can be moved when dragged. */
  step?: number | string;
}

/**
 * Icons that can be used with a {@link ScaleSchema}.
 *
 * For example, to render a star rating, use a {@link ScaleSchema} with `icon: coda.ScaleIconSet.Star`.
 */
export enum ScaleIconSet {
  Star = 'star',
  Circle = 'circle',
  Fire = 'fire',
  Bug = 'bug',
  Diamond = 'diamond',
  Bell = 'bell',
  ThumbsUp = 'thumbsup',
  Heart = 'heart',
  Chili = 'chili',
  Smiley = 'smiley',
  Lightning = 'lightning',
  Currency = 'currency',
  Coffee = 'coffee',
  Person = 'person',
  Battery = 'battery',
  Cocktail = 'cocktail',
  Cloud = 'cloud',
  Sun = 'sun',
  Checkmark = 'checkmark',
  LightBulb = 'lightbulb',
}

/**
 * A schema representing a return value or object property that is a number that should
 * be rendered as a scale.
 *
 * A scale is a widget with a repeated set of icons, where the number of shaded represents
 * a numeric value. The canonical example of a scale is a star rating, which might show
 * 5 star icons, with 3 of them shaded, indicating a value of 3.
 */
export interface ScaleSchema extends BaseNumberSchema<ValueHintType.Scale> {
  /** Instructs Coda to render this value as a scale. */
  codaType: ValueHintType.Scale;
  /** The number of icons to render. */
  maximum?: number;
  /** The icon to render. */
  icon?: ScaleIconSet;
}

/**
 * A schema representing a return value or object property that is provided as a string,
 * which Coda should interpret as a date. Coda is able to flexibly a parse number of formal
 * and informal string representations of dates. For maximum accuracy, consider using an
 * ISO 8601 date string (e.g. 2021-10-29): https://en.wikipedia.org/wiki/ISO_8601.
 */
export interface StringDateSchema extends BaseStringSchema<ValueHintType.Date> {
  /** Instructs Coda to render this value as a date. */
  codaType: ValueHintType.Date;
  /**
   * A Moment date format string, such as 'MMM D, YYYY', that corresponds to a supported Coda date column format,
   * used when rendering the value.
   *
   * Only applies when this is used as a sync table property.
   */
  format?: string;
}

/**
 * A schema representing a return value or object property that is provided as a string,
 * which Coda should interpret as a time.
 */
export interface StringTimeSchema extends BaseStringSchema<ValueHintType.Time> {
  /** Instructs Coda to render this value as a date. */
  codaType: ValueHintType.Time;
  /**
   * A Moment time format string, such as 'HH:mm:ss', that corresponds to a supported Coda time column format,
   * used when rendering the value.
   *
   * Only applies when this is used as a sync table property.
   */
  format?: string;
}

/**
 * A schema representing a return value or object property that is provided as a string,
 * which Coda should interpret as a datetime. Coda is able to flexibly a parse number of formal
 * and informal string representations of dates. For maximum accuracy, consider using an
 * ISO 8601 datetime string (e.g. 2021-11-03T19:43:58): https://en.wikipedia.org/wiki/ISO_8601.
 */
export interface StringDateTimeSchema extends BaseStringSchema<ValueHintType.DateTime> {
  /** Instructs Coda to render this value as a date. */
  codaType: ValueHintType.DateTime;
  /**
   * A Moment date format string, such as 'MMM D, YYYY', that corresponds to a supported Coda date column format,
   * used when rendering the value.
   *
   * Only applies when this is used as a sync table property.
   */
  dateFormat?: string;
  /**
   * A Moment time format string, such as 'HH:mm:ss', that corresponds to a supported Coda time column format,
   * used when rendering the value.
   *
   * Only applies when this is used as a sync table property.
   */
  timeFormat?: string;
}

/**
 * Enumeration of units supported by duration schemas. See {@link maxUnit}.
 */
export enum DurationUnit {
  /**
   * Indications a duration as a number of days.
   */
  Days = 'days',
  /**
   * Indications a duration as a number of hours.
   */
  Hours = 'hours',
  /**
   * Indications a duration as a number of minutes.
   */
  Minutes = 'minutes',
  /**
   * Indications a duration as a number of seconds.
   */
  Seconds = 'seconds',
}

/**
 * A schema representing a return value or object property that represents a duration. The value
 * should be provided as a string like "3 days" or "40 minutes 30 seconds".
 */
export interface DurationSchema extends BaseStringSchema<ValueHintType.Duration> {
  /**
   * A refinement of {@link maxUnit} to use for rounding the duration when rendering.
   * Currently only `1` is supported, which is the same as omitting a value.
   */
  precision?: number;
  /**
   * The unit to use for rounding the duration when rendering. For example, if using `DurationUnit.Days`,
   * and a value of "3 days 4 hours" is provided, it will be rendered as "3 days".
   */
  maxUnit?: DurationUnit;
}

export interface BaseStringSchema<T extends StringHintTypes = StringHintTypes> extends BaseSchema {
  /** Identifies this schema as a string. */
  type: ValueType.String;
  /** An optional type hint instructing Coda about how to interpret or render this value. */
  codaType?: T;
}

/**
 * The subset of StringHintTypes that don't have specific schema attributes.
 */
export const SimpleStringHintValueTypes = [
  ValueHintType.Attachment,
  ValueHintType.Embed,
  ValueHintType.Html,
  ValueHintType.ImageReference,
  ValueHintType.ImageAttachment,
  ValueHintType.Markdown,
  ValueHintType.Url,
] as const;
export type SimpleStringHintTypes = typeof SimpleStringHintValueTypes[number];

/**
 * A schema whose underlying value is a string, along with an optional hint about how Coda
 * should interpret that string.
 */
export interface SimpleStringSchema<T extends SimpleStringHintTypes = SimpleStringHintTypes>
  extends BaseStringSchema<T> {}

/**
 * The union of schema definition types whose underlying value is a string.
 */
export type StringSchema =
  | StringDateSchema
  | StringTimeSchema
  | StringDateTimeSchema
  | DurationSchema
  | SimpleStringSchema;

/**
 * A schema representing a return value or object property that is an array (list) of items.
 * The items are themselves schema definitions, which may refer to scalars or other objects.
 */
export interface ArraySchema<T extends Schema = Schema> extends BaseSchema {
  /** Identifies this schema as an array. */
  type: ValueType.Array;
  /** A schema for the items of this array. */
  items: T;
}

export interface ObjectSchemaProperty {
  fromKey?: string;
  required?: boolean;
}

export type ObjectSchemaProperties<K extends string = never> = {
  [K2 in K | string]: Schema & ObjectSchemaProperty;
};

export type GenericObjectSchema = ObjectSchema<string, string>;

export interface IdentityDefinition {
  name: string;
  dynamicUrl?: string;
  /**
   * Attribution text, images, and/or links that should be rendered along with this value.
   *
   * See {@link makeAttributionNode}.
   */
  attribution?: AttributionNode[];
  // TODO(jonathan): Remove after existing packs go through the v2 upload flow.
  packId?: PackId;
}

export interface Identity extends IdentityDefinition {
  packId: PackId;
}

export interface ObjectSchemaDefinition<K extends string, L extends string> extends BaseSchema {
  type: ValueType.Object;
  properties: ObjectSchemaProperties<K | L>;
  id?: K;
  primary?: K;
  codaType?: ObjectHintTypes;
  featured?: L[];
  identity?: IdentityDefinition;
}

export type ObjectSchemaDefinitionType<
  K extends string,
  L extends string,
  T extends ObjectSchemaDefinition<K, L>,
> = ObjectSchemaType<T>;

export interface ObjectSchema<K extends string, L extends string> extends ObjectSchemaDefinition<K, L> {
  identity?: Identity;
}

/**
 * The type of content in this attribution node.
 *
 * Multiple attribution nodes can be rendered all together, for example to have
 * attribution that contains both text and a logo image.
 */
export enum AttributionNodeType {
  /**
   * Text attribution content.
   */
  Text = 1,
  /**
   * A hyperlink pointing to the data source.
   */
  Link,
  /**
   * An image, often a logo of the data source.
   */
  Image,
}

interface TextAttributionNode {
  type: AttributionNodeType.Text;
  text: string;
}

interface LinkAttributionNode {
  type: AttributionNodeType.Link;
  anchorUrl: string;
  anchorText: string;
}

interface ImageAttributionNode {
  type: AttributionNodeType.Image;
  anchorUrl: string;
  imageUrl: string;
}

type AttributionNode = TextAttributionNode | LinkAttributionNode | ImageAttributionNode;

/**
 * A helper for constructing attribution text, links, or images that render along with a Pack value.
 *
 * Many APIs have licensing requirements that ask for specific attribution to be included
 * when using their data. For example, a stock photo API may require attribution text
 * and a logo.
 *
 * Any {@link IdentityDefinition} can include one or more attribution nodes that will be
 * rendered any time a value with that identity is rendered in a doc.
 */
export function makeAttributionNode<T extends AttributionNode>(node: T): T {
  return node;
}

export type Schema = BooleanSchema | NumberSchema | StringSchema | ArraySchema | GenericObjectSchema;

export function isObject(val?: Schema): val is GenericObjectSchema {
  return Boolean(val && val.type === ValueType.Object);
}

export function isArray(val?: Schema): val is ArraySchema {
  return Boolean(val && val.type === ValueType.Array);
}

type PickOptional<T, K extends keyof T> = Partial<T> & {[P in K]: T[P]};

interface StringHintTypeToSchemaTypeMap {
  [ValueHintType.Date]: Date | string | number;
}
type StringHintTypeToSchemaType<T extends StringHintTypes | undefined> = T extends keyof StringHintTypeToSchemaTypeMap
  ? StringHintTypeToSchemaTypeMap[T]
  : string;

type SchemaWithNoFromKey<T extends ObjectSchemaDefinition<any, any>> = {
  [K in keyof T['properties'] as T['properties'][K] extends {fromKey: string} ? never : K]: T['properties'][K];
};

// if there's a field with fromKey, inject {string: any} to fail silently.
type SchemaFromKeyWildCard<T extends ObjectSchemaDefinition<any, any>> = {
  [K in keyof T['properties'] as T['properties'][K] extends {fromKey: string} ? string : never]: any;
};

type ObjectSchemaNoFromKeyType<
  T extends ObjectSchemaDefinition<any, any>,
  P extends SchemaWithNoFromKey<T> = SchemaWithNoFromKey<T>,
> = PickOptional<
  {
    [K in keyof P]: SchemaType<P[K]>;
  },
  $Values<{
    [K in keyof P]: P[K] extends {required: true} ? K : never;
  }>
>;

type ObjectSchemaType<T extends ObjectSchemaDefinition<any, any>> = ObjectSchemaNoFromKeyType<T> &
  SchemaFromKeyWildCard<T>;

// SchemaType parses the expected formula return type from the schema. For example,
// StringFormula will need to return a string type value. NumbericFormula needs to return a number.
//
// ObjectFormula usually should return an object matching the schema as well but typescript
// doesn't work perfectly with fromKey. In presense of a property using fromKey, SchemaType
// will only check properties without fromKey attribute and will blindly accept additional
// properites in the return value.
export type SchemaType<T extends Schema> = T extends BooleanSchema
  ? boolean
  : T extends NumberSchema
  ? number
  : T extends StringSchema
  ? StringHintTypeToSchemaType<T['codaType']>
  : T extends ArraySchema
  ? Array<SchemaType<T['items']>>
  : T extends GenericObjectSchema
  ? ObjectSchemaType<T>
  : never;

export type ValidTypes = boolean | number | string | object | boolean[] | number[] | string[] | object[];

/**
 * Utility that examines a JavaScript value and attempts to infer a schema definition
 * that describes it.
 *
 * It is vastly preferable to define a schema manually. A clear and accurate schema is one of the
 * fundamentals of a good pack. However, for data that is truly dynamic for which a schema can't
 * be known in advance nor can a function be written to generate a dynamic schema from other
 * inputs, it may be useful to us this helper to sniff the return value and generate a basic
 * inferred schema from it.
 *
 * This utility does NOT attempt to determine {@link id} or {@link primary} attributes for
 * an object schema, those are left undefined.
 */
export function generateSchema(obj: ValidTypes): Schema {
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      throw new Error('Must have representative value.');
    }
    return {type: ValueType.Array, items: generateSchema(obj[0])};
  }

  if (typeof obj === 'object') {
    const properties: {[key: string]: Schema} = {};
    if (obj === null) {
      // Default nulls to string which is the least common denominator.
      return {type: ValueType.String};
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        properties[key] = generateSchema((obj as any)[key]);
      }
    }
    return {type: ValueType.Object, properties} as GenericObjectSchema;
  } else if (typeof obj === 'string') {
    return {type: ValueType.String};
  } else if (typeof obj === 'boolean') {
    return {type: ValueType.Boolean};
  } else if (typeof obj === 'number') {
    return {type: ValueType.Number};
  }
  return ensureUnreachable(obj);
}

/**
 * A wrapper for creating any schema definition.
 *
 * If you are creating a schema for an object (as opposed to a scalar or array),
 * use the more specific {@link makeObjectSchema}.
 *
 * It is always recommended to use wrapper functions for creating top-level schema
 * objects rather than specifying object literals. Wrappers validate your schemas
 * at creation time, provide better TypeScript type inference, and can reduce
 * boilerplate.
 *
 * At this time, this wrapper provides only better TypeScript type inference,
 * but it may do validation in a future SDK version.
 *
 * @example
 * ```
 * coda.makeSchema({
 *   type: coda.ValueType.Array,
 *   items: {type: coda.ValueType.String},
 * });
 * ```
 */
export function makeSchema<T extends Schema>(schema: T): T {
  return schema;
}

export const PlaceholderIdentityPackId = -1;

/**
 * A wrapper for creating a schema definition for an object value.
 *
 * It is always recommended to use wrapper functions for creating top-level schema
 * objects rather than specifying object literals. Wrappers validate your schemas
 * at creation time, provide better TypeScript type inference, and can reduce
 * boilerplate.
 *
 * @example
 * ```
 * coda.makeObjectSchema({
 *   id: "email",
 *   primary: "name",
 *   properties: {
 *     email: {type: coda.ValueType.String, required: true},
 *     name: {type: coda.ValueType.String, required: true},
 *   },
 * });
 * ```
 */
export function makeObjectSchema<
  K extends string,
  L extends string,
  T extends Omit<ObjectSchemaDefinition<K, L>, 'type'>,
>(
  schemaDef: T & {type?: ValueType.Object},
): T & {
  identity?: Identity;
  type: ValueType.Object;
} {
  const schema: ObjectSchemaDefinition<K, L> = {...schemaDef, type: ValueType.Object};
  validateObjectSchema(schema);
  // TODO(jonathan): Enable after existing packs go through the v2 upload flow.
  // if (schema.identity) {
  //   schema.identity = {...schema.identity, packId: PlaceholderIdentityPackId};
  // }
  return schema as any;
}

function validateObjectSchema<K extends string, L extends string, T extends ObjectSchemaDefinition<K, L>>(schema: T) {
  if (schema.codaType === ValueHintType.Reference) {
    const {id, identity, primary} = schema;

    checkRequiredFieldInObjectSchema(id, 'id', schema.codaType);
    checkRequiredFieldInObjectSchema(identity, 'identity', schema.codaType);
    checkRequiredFieldInObjectSchema(primary, 'primary', schema.codaType);

    checkSchemaPropertyIsRequired(ensureExists(id), schema);
    checkSchemaPropertyIsRequired(ensureExists(primary), schema);
  }
  if (schema.codaType === ValueHintType.Person) {
    const {id} = schema;
    checkRequiredFieldInObjectSchema(id, 'id', schema.codaType);
    checkSchemaPropertyIsRequired(ensureExists(id), schema);
  }

  for (const [_propertyKey, propertySchema] of Object.entries(schema.properties)) {
    if (propertySchema.type === ValueType.Object) {
      validateObjectSchema(propertySchema);
    }
  }
}

function checkRequiredFieldInObjectSchema(field: any, fieldName: string, codaType: ObjectHintTypes) {
  ensureExists(
    field,
    `Objects with codaType "${codaType}" require a "${fieldName}" property in the schema definition.`,
  );
}

function checkSchemaPropertyIsRequired<K extends string, L extends string, T extends ObjectSchemaDefinition<K, L>>(
  field: string,
  schema: T,
) {
  const {properties, codaType} = schema;
  assertCondition(
    properties[field].required,
    `Field "${field}" must be marked as required in schema with codaType "${codaType}".`,
  );
}

export function normalizeSchemaKey(key: string): string {
  // Colons cause problems in our formula handling.
  return pascalcase(key).replace(/:/g, '_');
}

export function normalizeSchema<T extends Schema>(schema: T): T {
  if (isArray(schema)) {
    return {
      type: ValueType.Array,
      items: normalizeSchema(schema.items),
    } as T;
  } else if (isObject(schema)) {
    const normalized: ObjectSchemaProperties = {};
    const {id, primary, featured} = schema;
    for (const key of Object.keys(schema.properties)) {
      const normalizedKey = normalizeSchemaKey(key);
      const props = schema.properties[key];
      const {required, fromKey} = props as ObjectSchemaProperty;
      normalized[normalizedKey] = Object.assign(normalizeSchema(props), {
        required,
        fromKey: fromKey || (normalizedKey !== key ? key : undefined),
      });
    }
    const normalizedSchema = {
      type: ValueType.Object,
      id: id ? normalizeSchemaKey(id) : undefined,
      featured: featured ? featured.map(normalizeSchemaKey) : undefined,
      primary: primary ? normalizeSchemaKey(primary) : undefined,
      properties: normalized,
      identity: schema.identity,
      codaType: schema.codaType,
    } as T;

    return normalizedSchema;
  }
  return schema;
}

/**
 * Convenience for creating a reference object schema from an existing schema for the
 * object. Copies over the identity, id, and primary from the schema, and the subset of
 * properties indicated by the id and primary.
 * A reference schema can always be defined directly, but if you already have an object
 * schema it provides better code reuse to derive a reference schema instead.
 */
export function makeReferenceSchemaFromObjectSchema(
  schema: GenericObjectSchema,
  identityName?: string,
): GenericObjectSchema {
  const {type, id, primary, identity, properties} = schema;
  ensureExists(
    identity || identityName,
    'Source schema must have an identity field, or you must provide an identity name for the reference.',
  );
  const validId = ensureExists(id);
  const referenceProperties: ObjectSchemaProperties = {[validId]: properties[validId]};
  if (primary && primary !== id) {
    referenceProperties[primary] = properties[primary];
  }
  return makeObjectSchema({
    codaType: ValueHintType.Reference,
    type,
    id,
    identity: identity || {name: ensureExists(identityName)},
    primary,
    properties: referenceProperties,
  });
}
