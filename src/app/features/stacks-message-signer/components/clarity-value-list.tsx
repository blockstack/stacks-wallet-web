import { ClarityType, ClarityValue, cvToString } from '@stacks/transactions';

import {
  TupleDisplayer,
  TupleNodeDisplayer,
  TupleNodeLabelDisplayer,
  TupleNodeValueDisplayer,
} from './nested-tuple-displayer';

function wrapText(text: string): React.JSX.Element {
  return <>{text}</>;
}

interface ClarityValueListDisplayerProps {
  val: ClarityValue;
  encoding?: 'tryAscii' | 'hex';
  isRoot?: boolean;
}
export function ClarityValueListDisplayer(props: ClarityValueListDisplayerProps) {
  const { val, encoding, isRoot = true } = props;

  switch (val.type) {
    case ClarityType.BoolTrue:
      return wrapText('true');
    case ClarityType.BoolFalse:
      return wrapText('false');
    case ClarityType.Int:
      return wrapText(val.value.toString());
    case ClarityType.UInt:
      return wrapText(`u${val.value.toString()}`);
    case ClarityType.Buffer:
      if (encoding === 'tryAscii') {
        if (/[ -~]/.test(val.value)) return wrapText(JSON.stringify(val.value));
      }
      return wrapText(`0x${val.value}`);
    case ClarityType.OptionalNone:
      return wrapText('none');
    case ClarityType.OptionalSome:
      return wrapText(`some ${cvToString(val.value, encoding)}`);
    case ClarityType.ResponseErr:
      return wrapText(`err ${cvToString(val.value, encoding)}`);
    case ClarityType.ResponseOk:
      return wrapText(`ok ${cvToString(val.value, encoding)}`);
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return wrapText(val.value);
    case ClarityType.List:
      return wrapText(`[${val.value.map(v => cvToString(v, encoding)).join(', ')}]`);
    case ClarityType.Tuple:
      return (
        <TupleDisplayer isRoot={isRoot}>
          {Object.entries(val.value).map(([key, value]) => (
            <TupleNodeDisplayer clarityType={value.type} key={key}>
              <TupleNodeLabelDisplayer>{key}:</TupleNodeLabelDisplayer>
              <TupleNodeValueDisplayer>
                <ClarityValueListDisplayer val={value} encoding="tryAscii" isRoot={false} />
              </TupleNodeValueDisplayer>
            </TupleNodeDisplayer>
          ))}
        </TupleDisplayer>
      );
    case ClarityType.StringASCII:
      return wrapText(`"${val.value}"`);
    case ClarityType.StringUTF8:
      return wrapText(`u"${val.value}"`);
  }
}
