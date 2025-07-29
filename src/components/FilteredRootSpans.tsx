import { useParams } from 'react-router-dom';
import type { AnnotatedRootSpan } from '../types/types';
import RootSpans from './RootSpans';

interface Props {
  allSpans: AnnotatedRootSpan[];
  onCategorize: () => Promise<void>;
}

const FilteredRootSpans = ({ allSpans, onCategorize }: Props) => {
  const { id } = useParams();
  const spans = allSpans.filter(span => span.batchId === id);
  return <RootSpans annotatedRootSpans={spans} onCategorize={onCategorize} />;
};

export default FilteredRootSpans;