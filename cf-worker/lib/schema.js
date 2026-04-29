import Ajv from 'ajv';
import commentSchema from '../schemas/comment.schema.js';
import statusSchema from '../schemas/status.schema.js';
import annotationSchema from '../schemas/annotation.schema.js';

const ajv = new Ajv({ allErrors: true });
const compiledComment    = ajv.compile(commentSchema);
const compiledStatus     = ajv.compile(statusSchema);
const compiledAnnotation = ajv.compile(annotationSchema);

function wrap(validator) {
  return (body) => {
    const ok = validator(body);
    return ok ? { ok: true } : { ok: false, errors: validator.errors || [] };
  };
}

export const validateCommentBody    = wrap(compiledComment);
export const validateStatusBody     = wrap(compiledStatus);
export const validateAnnotationBody = wrap(compiledAnnotation);
