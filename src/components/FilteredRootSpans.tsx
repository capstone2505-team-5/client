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
  
  // Debug logging
  console.log('FilteredRootSpans:', {
    batchId: id,
    totalSpans: allSpans.length,
    filteredSpans: spans.length,
    allBatchIds: [...new Set(allSpans.map(s => s.batchId))],
    firstFewSpans: allSpans.slice(0, 3).map(s => ({ id: s.id, batchId: s.batchId }))
  });
  
  return <RootSpans annotatedRootSpans={spans} onCategorize={onCategorize} />;
};

export default FilteredRootSpans;