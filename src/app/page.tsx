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
      <footer  className="page-footer">
        <a
          href="https://github.com/HerrZatacke/grb2nc.js"
          target="_blank"
        >
          grb2nc.js on GitHub
        </a>
      </footer>
    </>
  );
}
