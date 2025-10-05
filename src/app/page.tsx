import FileInput from '@/components/FileInput';
import TaskList from '@/components/TaskList';
import SVGPreview from '@/components/SVGPreview';

export default function Home() {
  return (
    <>
      <SVGPreview />
      <FileInput />
      <TaskList />
    </>
  );
}
