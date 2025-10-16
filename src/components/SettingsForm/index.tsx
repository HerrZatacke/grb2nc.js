'use client';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { useTranslations } from 'next-intl';
import { useMainContext } from '@/components/MainContext';

export default function SettingsForm() {
  const t = useTranslations('SettingsForm');
  const { showSettings, setShowSettings, globalSettings, updateGlobalSettings } = useMainContext();

  if (!showSettings) { return null; }

  return (
    <Dialog onClose={() => setShowSettings(false) } open>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Stack
          direction="column"
          gap={2}
          sx={{ pt: 2 }}
        >
          <FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.renderOnlyPaths}
                  onChange={(_, checked) => {
                    updateGlobalSettings({ renderOnlyPaths: checked });
                  }}
                />
              }
              label={t('fields.renderOnlyPaths')}
            >
            </FormControlLabel>
            <FormHelperText>
              {t('fields.renderOnlyPathsHelper')}
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.useSimpleFileInput}
                  onChange={(_, checked) => {
                    updateGlobalSettings({ useSimpleFileInput: checked });
                  }}
                />
              }
              label={t('fields.useSimpleFileInput')}
            >
            </FormControlLabel>
            <FormHelperText>
              {t('fields.useSimpleFileInputHelper')}
            </FormHelperText>
          </FormControl>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
