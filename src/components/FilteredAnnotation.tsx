import { useParams, useLocation } from 'react-router-dom';
import type { AnnotatedRootSpan, Rating } from '../types/types';
import Annotation from './Annotation';

interface Props {
  allSpans: AnnotatedRootSpan[];
  onSave: (
      annotationId: string,
      rootSpanId: string,
      note: string,
      rating: Rating | null
    ) => Promise<void>;
}

const FilteredAnnotation = ({ allSpans, onSave }: Props) => {
  const { id } = useParams();
  const location = useLocation();
  const { projectName, batchName } = location.state || {};
  const spans = allSpans.filter(span => span.batchId === id);
  return <Annotation 
    annotatedRootSpans={spans} 
    onSave={onSave} 
    projectName={projectName}
    batchName={batchName}
  />;
};

export default FilteredAnnotation;