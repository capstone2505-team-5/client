import { useParams } from 'react-router-dom';
import type { AnnotatedRootSpan, Rating } from '../types/types';
import Annotation from './Annotation';

interface Props {
  allSpans: AnnotatedRootSpan[];
  onSave: (
      annotationId: string,
      rootSpanId: string,
      note: string,
      rating: Rating
    ) => Promise<void>;
}

const FilteredAnnotation = ({ allSpans, onSave }: Props) => {
  const { id } = useParams();
  const spans = allSpans.filter(span => span.batchId === id);
  return <Annotation annotatedRootSpans={spans} onSave={onSave} />;
};

export default FilteredAnnotation;