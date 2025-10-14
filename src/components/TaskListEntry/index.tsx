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
import { SvgIconProps } from '@mui/material/SvgIcon';
import { useTranslations } from 'next-intl';
import { type ComponentType, useMemo } from 'react';
import { useMainContext } from '@/components/MainContext';
import { useDownloadNC } from '@/hooks/useDownloadNC.ts';
import { getColor } from '@/modules/renderSVG';
import { Task, TaskType } from '@/types/tasks.ts';

const typeIcon = (type: TaskType): ComponentType<SvgIconProps> => {
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
}

export default function TaskListEntry({ task }: Props) {
  const t= useTranslations('TaskListEntry');
  const { busy, setTaskForm, updateVisibility, visibilities } = useMainContext();
  const { downloadNCCode } = useDownloadNC();

  const taskVisibility = useMemo(() => (
    visibilities.find(({ fileName }) => fileName === task.fileName) || null
  ), [task.fileName, visibilities]);

  const { fileName, type, layer } = task;
  const IconComponent = useMemo(() => typeIcon(type), [type]);

  if (!taskVisibility) { return null; }

  return (
    <ListItem
      sx={{
        background: `var(--color-listitem-${getColor(type, layer)})`,
      }}
    >
      <ListItemIcon
        title={t(`typeIconLabel.${type}`)}
      >
        <IconComponent
          sx={{
            fill: `var(--color-icon-${getColor(type, layer)})`,
          }}
        />
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
            updateVisibility(
              task.fileName,
              { hidePaths: !taskVisibility.hidePaths },
            );
          }}
          color={taskVisibility.hidePaths ? 'error' : 'primary'}
        >
          {taskVisibility.hidePaths ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </Button>
        <Button
          onClick={() => {
            updateVisibility(
              task.fileName,
              { hideAreas: !taskVisibility.hideAreas },
            );
          }}
          color={taskVisibility.hideAreas ? 'error' : 'primary'}
        >
          {taskVisibility.hideAreas ? <HideImageIcon /> : <ImageIcon />}
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
