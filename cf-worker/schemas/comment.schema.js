export default {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['target', 'body'],
  properties: {
    target: { type: 'string', pattern: '^(global|media:[a-z0-9-]+)$' },
    body:   { type: 'string', minLength: 1, maxLength: 4000 },
    firstAnnotation: { type: 'string', minLength: 1, maxLength: 200 },
  },
  additionalProperties: false,
};
