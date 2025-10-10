import Error from '@/components/Error';
import FileInput from '@/components/FileInput';
import OperationForm from '@/components/OperationForm';
import Progress from '@/components/Progress';
import SVGPreview from '@/components/SVGPreview';
import TaskList from '@/components/TaskList';

export default function Home() {
  return (
    <>
      <SVGPreview />
      <div className="page-content">
        <FileInput />
        <TaskList />
        <Error />
        <Progress />
        <OperationForm />
      </div>
    </>
  );
}
