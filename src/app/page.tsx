import Error from '@/components/Error';
import MainMenu from '@/components/MainMenu';
import OperationForm from '@/components/OperationForm';
import Progress from '@/components/Progress';
import SVGPreview from '@/components/SVGPreview';
import TaskList from '@/components/TaskList';
import TaskParamsForm from '@/components/TaskParamsForm';

export default function Home() {
  return (
    <>
      <SVGPreview />
      <div className="page-content">
        <MainMenu />
        <TaskList />
        <Error />
        <Progress />
        <OperationForm />
        <TaskParamsForm />
      </div>
    </>
  );
}
