import FileInput from '@/components/FileInput';
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
        <Progress />
      </div>
    </>
  );
}
