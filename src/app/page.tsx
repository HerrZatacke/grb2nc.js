import Error from '@/components/Error';
import MainMenu from '@/components/MainMenu';
import OperationForm from '@/components/OperationForm';
import Progress from '@/components/Progress';
import SettingsForm from '@/components/SettingsForm';
import SVGPreview from '@/components/SVGPreview';
import TaskList from '@/components/TaskList';
import TaskParamsForm from '@/components/TaskParamsForm';

export default function Home() {
  const release = process.env.NEXT_PUBLIC_RELEASE_VERSION || '';
  return (
    <>
      <SVGPreview />
      <OperationForm />
      <TaskParamsForm />
      <SettingsForm />
      <div className="page-content">
        <MainMenu />
        <TaskList />
        <Error />
        <Progress />
      </div>
      <footer className="page-footer">
        <a
          className="page-footer__link"
          href="https://github.com/HerrZatacke/grb2nc.js"
          target="_blank"
        >
          {`grb2nc.js on GitHub (Version: ${release})`}
        </a>
      </footer>
    </>
  );
}
