'use client';

import './style.scss';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import IconButton from '@mui/material/IconButton';
import clsx from 'clsx';
import { useState } from 'react';
import Error from '@/components/Error';
import MainMenu from '@/components/MainMenu';
import Progress from '@/components/Progress';
import TaskList from '@/components/TaskList';

export default function PageContent() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className={clsx('page-content', {
      'page-content--expanded': expanded,
    })}>
      <IconButton
        sx={{
          position: 'absolute',
          right: -50,
        }}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        {expanded ? <NavigateBeforeIcon /> : <NavigateNextIcon />}
      </IconButton>
      <div className="page-content__inner">
        <MainMenu />
        <TaskList />
        <Error />
        <Progress />
      </div>
    </div>
  );
}
