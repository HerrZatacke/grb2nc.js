import OperationForm from '@/components/OperationForm';
import PageContent from '@/components/PageContent';
import SettingsForm from '@/components/SettingsForm';
import SVGPreview from '@/components/SVGPreview';
import TaskParamsForm from '@/components/TaskParamsForm';

export default function Home() {
  const release = process.env.NEXT_PUBLIC_RELEASE_VERSION || '';
  return (
    <>
      <SVGPreview />
      <OperationForm />
      <TaskParamsForm />
      <SettingsForm />
      <PageContent />
      <footer className="layout__footer">
        <a
          className="layout__footer-link"
          href="https://github.com/HerrZatacke/grb2nc.js"
          target="_blank"
        >
          {`grb2nc.js on GitHub (Version: ${release})`}
        </a>
      </footer>
    </>
  );
}
