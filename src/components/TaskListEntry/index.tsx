'use client';

import CarpenterIcon from '@mui/icons-material/Carpenter';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import HideImageIcon from '@mui/icons-material/HideImage';
import ImageIcon from '@mui/icons-material/Image';
import PaletteIcon from '@mui/icons-material/Palette';
import RouteIcon from '@mui/icons-material/Route';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTranslations } from 'next-intl';
import { type ComponentType, useMemo } from 'react';
import { UpdateTaskFunction, useMainContext } from '@/components/MainContext';
import { useDownloadNC } from '@/hooks/useDownloadNC.ts';
import { Task, TaskType } from '@/types/tasks.ts';

const typeIcon = (type: TaskType): ComponentType => {
  switch (type) {
    case TaskType.DRILL:
      return GpsFixedIcon;
    case TaskType.EDGE_CUT:
      return CarpenterIcon;
    case TaskType.ISOLATION:
      return RouteIcon;
    case TaskType.DRAWING:
      return PaletteIcon;
    default:
      return () => null;
  }
};

interface Props {
  task: Task;
  updateTask: UpdateTaskFunction;
}

export default function TaskListEntry({ task, updateTask }: Props) {
  const t= useTranslations('TaskListEntry');
  const { busy, setTaskForm } = useMainContext();
  const { downloadNCCode } = useDownloadNC();

  const { fileName, type } = task;
  const IconComponent = useMemo(() => typeIcon(type), [type]);

  return (
    <ListItem>
      <ListItemIcon
        title={t(`typeIconLabel.${type}`)}
      >
        <IconComponent />
      </ListItemIcon>
      <ListItemText primary={fileName} />
      <ButtonGroup
        variant="contained"
        size="small"
        disabled={busy}
        sx={{ marginLeft: 4 }}
      >
        <Button
          disabled={type === TaskType.DRAWING}
          onClick={() => {
            updateTask(
              task.fileName,
              { hidePaths: !task.hidePaths },
            );
          }}
          color={task.hidePaths ? 'error' : 'primary'}
        >
          {task.hidePaths ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </Button>
        <Button
          onClick={() => {
            updateTask(
              task.fileName,
              { hideAreas: !task.hideAreas },
            );
          }}
          color={task.hideAreas ? 'error' : 'primary'}
        >
          {task.hideAreas ? <HideImageIcon /> : <ImageIcon />}
        </Button>
        <Button
          disabled={type === TaskType.DRILL || type === TaskType.DRAWING}
          onClick={() => {
            setTaskForm(task.fileName);
          }}
        >
          <EditIcon />
        </Button>
        <Button
          disabled={type === TaskType.DRAWING}
          onClick={() => {
            downloadNCCode(task.fileName);
          }}
        >
          <FileDownloadIcon />
        </Button>
      </ButtonGroup>
    </ListItem>
  );
}
