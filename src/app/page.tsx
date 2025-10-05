import FileInput from '@/components/FileInput';
import SVGPreview from '@/components/SVGPreview';
import TaskList from '@/components/TaskList';

export default function Home() {
  return (
    <>
      <SVGPreview />
      <FileInput />
      <TaskList />
    </>
  );
}
