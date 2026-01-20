import { compileMapper, map, tr, transform } from '../src/mapia';
import { deepCastTypes, DeepCastTypes } from '../src/pipelines/deep-cast-types';
type Undefined = {
  a?: string;
  b: number | undefined;
  c: {
    d1?: string;
    d?: undefined;
  };
}

type Nullified = {
  a: string | null;
  b: number | null;
  c: {
    d1: string | null;
    d: null;
  };
}

const undefinedToNullShape = <T>(v: undefined | T): null | Exclude<T, undefined> =>
  v === undefined ? null : v as Exclude<T, undefined>;
const mapper = compileMapper<Undefined, Nullified>({
  a: tr(undefinedToNullShape),
  b: tr(undefinedToNullShape),
  c: map({
    d1: tr(undefinedToNullShape),
    d: tr(undefinedToNullShape)
  }),
});

// Another Example with pipelines

type OK_Undefined = DeepCastTypes<Undefined, undefined, null>;

const preProcessedMapper = compileMapper<OK_Undefined, Nullified>({
  a: 'a',
  b: 'b',
  c: 'c'
});


// Result: 

console.log(mapper.mapOne({
  b: undefined,
  c: {
    d: undefined
  }
}));

console.log(preProcessedMapper.mapOne(deepCastTypes({
  a: undefined,
  b: undefined,
  c: {
    d1: undefined,
    d: undefined
  }
}, 'undefined', 'null')));