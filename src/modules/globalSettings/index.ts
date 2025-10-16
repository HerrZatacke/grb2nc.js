import { GlobalSettings } from '@/types/settings';

export const defaultSettings = (): GlobalSettings => {
  return {
    renderOnlyPaths: false,
    useSimpleFileInput: false,
  };
};
